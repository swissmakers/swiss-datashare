import { AxiosError } from "axios";
import pLimit from "p-limit";
import { useEffect, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import Meta from "../../components/Meta";
import Dropzone from "../../components/upload/Dropzone";
import FileList from "../../components/upload/FileList";
import showCompletedUploadModal from "../../components/upload/modals/showCompletedUploadModal";
import showCreateUploadModal from "../../components/upload/modals/showCreateUploadModal";
import useConfig from "../../hooks/config.hook";
import useConfirmLeave from "../../hooks/confirm-leave.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import useUser from "../../hooks/user.hook";
import shareService from "../../services/share.service";
import { FileUpload } from "../../types/File.type";
import { CreateShare, Share } from "../../types/share.type";
import toast from "../../utils/toast.util";
import { useRouter } from "next/router";
import { Button, Container, Textarea } from "../../components/ui";
import { useModals } from "../../contexts/ModalContext";
import { byteToHumanSizeString } from "../../utils/fileSize.util";

const promiseLimit = pLimit(3);
let errorToastShown = false;
let createdShare: Share;

const generateShareId = (length: number = 16) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomArray = new Uint8Array(length >= 3 ? length : 3);
  crypto.getRandomValues(randomArray);
  randomArray.forEach((number) => {
    result += chars[number % chars.length];
  });
  return result;
};

const Upload = ({
  maxShareSize,
  isReverseShare = false,
  simplified = false,
  reverseShareExpiresAt,
}: {
  maxShareSize?: number;
  isReverseShare?: boolean;
  simplified?: boolean;
  /** ISO date from data request link; share expiration follows this on the server */
  reverseShareExpiresAt?: string;
}) => {
  const modals = useModals();
  const router = useRouter();
  const t = useTranslate();

  const { user } = useUser();
  const config = useConfig();
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [reverseShareNote, setReverseShareNote] = useState("");
  const [isUploading, setisUploading] = useState(false);

  useConfirmLeave({
    message: t("upload.notify.confirm-leave"),
    enabled: isUploading,
  });

  // Default chunk size: 10MB (10000000 bytes)
  const defaultChunkSize = 10000000;
  const chunkSizeValue = parseInt(config.get("share.chunkSize"));
  const chunkSize = useRef(
    isNaN(chunkSizeValue) || chunkSizeValue <= 0 ? defaultChunkSize : chunkSizeValue
  );

  maxShareSize ??= parseInt(config.get("share.maxSize"));
  const autoOpenCreateUploadModal = config.get("share.autoOpenShareModal");
  const shareIdLength = parseInt(config.get("share.shareIdLength")) || 8;

  const generateAvailableLink = async (times: number = 10): Promise<string> => {
    if (times <= 0) {
      throw new Error("Could not generate available link");
    }
    const link = generateShareId(shareIdLength);
    if (!(await shareService.isShareIdAvailable(link))) {
      return await generateAvailableLink(times - 1);
    }
    return link;
  };

  const uploadFiles = async (share: CreateShare, files: FileUpload[]) => {
    // Ensure chunkSize is valid at upload time
    if (isNaN(chunkSize.current) || chunkSize.current <= 0) {
      console.warn(`[Upload] Invalid chunkSize detected, resetting to default: ${chunkSize.current} -> ${defaultChunkSize}`);
      chunkSize.current = defaultChunkSize;
    }
    setisUploading(true);
    console.log(`[Upload] Starting upload of ${files.length} files`);

    try {
      const isReverseShare = router.pathname != "/upload";
      console.log(`[Upload] Creating share (isReverseShare: ${isReverseShare})...`);
      createdShare = await shareService.create(share, isReverseShare);
      console.log(`[Upload] Share created successfully: ${createdShare.id}`);
    } catch (e) {
      console.error(`[Upload] Error creating share:`, e);
      toast.axiosError(e);
      setisUploading(false);
      return;
    }

    console.log(`[Upload] Starting upload of ${files.length} files (max 3 concurrent)`);
    const fileUploadPromises = files.map(async (file, fileIndex) =>
      // Limit the number of concurrent uploads to 3
      promiseLimit(async () => {
        let fileId;

        const setFileProgress = (progress: number) => {
          setFiles((files) =>
            files.map((file, callbackIndex) => {
              if (fileIndex == callbackIndex) {
                file.uploadingProgress = progress;
              }
              return file;
            }),
          );
        };

        console.log(`[Upload] Starting upload of file ${fileIndex + 1}/${files.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        setFileProgress(1);

        // Validate chunkSize is valid
        if (isNaN(chunkSize.current) || chunkSize.current <= 0) {
          console.error(`[Upload] Invalid chunkSize: ${chunkSize.current}, using default 10MB`);
          chunkSize.current = defaultChunkSize;
        }

        let chunks = Math.ceil(file.size / chunkSize.current);

        // If the file is 0 bytes, we still need to upload 1 chunk
        if (chunks == 0) chunks++;

        // Validate chunks is valid
        if (isNaN(chunks) || chunks <= 0) {
          console.error(`[Upload] Invalid chunks calculation for file ${file.name}: chunks=${chunks}, file.size=${file.size}, chunkSize=${chunkSize.current}`);
          setFileProgress(-1);
          return;
        }

        console.log(`[Upload] File ${file.name} will be uploaded in ${chunks} chunks (chunk size: ${(chunkSize.current / 1024 / 1024).toFixed(2)} MB)`);

        for (let chunkIndex = 0; chunkIndex < chunks; chunkIndex++) {
          const from = chunkIndex * chunkSize.current;
          const to = from + chunkSize.current;
          const blob = file.slice(from, to);
          try {
            console.log(`[Upload] Uploading chunk ${chunkIndex + 1}/${chunks} of file ${file.name}`);
            await shareService
              .uploadFile(
                createdShare.id,
                blob,
                {
                  id: fileId,
                  name: file.name,
                },
                chunkIndex,
                chunks,
              )
              .then((response) => {
                fileId = response.id;
                console.log(`[Upload] Chunk ${chunkIndex + 1}/${chunks} of file ${file.name} uploaded successfully, fileId: ${fileId}`);
              });

            setFileProgress(((chunkIndex + 1) / chunks) * 100);
          } catch (e) {
            if (
              e instanceof AxiosError &&
              e.response?.data.error == "unexpected_chunk_index"
            ) {
              console.warn(`[Upload] Unexpected chunk index for file ${file.name}, retrying with expected index: ${e.response!.data!.expectedChunkIndex}`);
              // Retry with the expected chunk index
              chunkIndex = e.response!.data!.expectedChunkIndex - 1;
              continue;
            } else {
              console.error(`[Upload] Error uploading chunk ${chunkIndex + 1}/${chunks} of file ${file.name}:`, e);
              if (e instanceof AxiosError) {
                console.error(`[Upload] Error details:`, {
                  status: e.response?.status,
                  statusText: e.response?.statusText,
                  data: e.response?.data,
                  message: e.message,
                });
              }
              setFileProgress(-1);
              // Retry after 5 seconds
              console.log(`[Upload] Retrying upload of file ${file.name} in 5 seconds...`);
              await new Promise((resolve) => setTimeout(resolve, 5000));
              chunkIndex = -1;

              continue;
            }
          }
        }
        console.log(`[Upload] Successfully completed upload of file ${file.name}`);
      }),
    );

    await Promise.all(fileUploadPromises);
    console.log(`[Upload] All file upload promises initiated`);
  };

  const startReverseShareUpload = async () => {
    if (isUploading) return;
    setisUploading(true);

    const link = await generateAvailableLink().catch(() => {
      toast.error(t("upload.modal.link.error.taken"));
      return undefined;
    });

    if (!link) {
      setisUploading(false);
      return;
    }

    const expiration =
      reverseShareExpiresAt != null && reverseShareExpiresAt !== ""
        ? new Date(reverseShareExpiresAt).toISOString()
        : "never";

    await uploadFiles(
      {
        id: link,
        name: undefined,
        expiration,
        recipients: [],
        description: reverseShareNote.trim() || undefined,
        security: {},
      },
      files,
    );
  };

  const showCreateUploadModalCallback = (files: FileUpload[]) => {
    showCreateUploadModal(
      modals,
      {
        isUserSignedIn: user ? true : false,
        isReverseShare,
        allowUnauthenticatedShares: config.get(
          "share.allowUnauthenticatedShares",
        ),
        enableEmailRecepients: config.get("email.enableShareEmailRecipients"),
        maxExpiration: config.get("share.maxExpiration"),
        shareIdLength: config.get("share.shareIdLength"),
        simplified,
      },
      files,
      uploadFiles,
    );
  };

  const handleDropzoneFilesChanged = (files: FileUpload[]) => {
    if (isReverseShare) {
      setFiles((oldArr) => [...oldArr, ...files]);
      return;
    }

    if (autoOpenCreateUploadModal) {
      setFiles(files);
      showCreateUploadModalCallback(files);
    } else {
      setFiles((oldArr) => [...oldArr, ...files]);
    }
  };

  useEffect(() => {
    // Check if there are any files that failed to upload
    const fileErrorCount = files.filter(
      (file) => file.uploadingProgress == -1,
    ).length;

    if (fileErrorCount > 0) {
      if (!errorToastShown) {
        toast.error(
          t("upload.notify.count-failed", { count: fileErrorCount }),
        );
      }
      errorToastShown = true;
    } else {
      errorToastShown = false;
    }

    // Complete share
    if (
      files.length > 0 &&
      files.every((file) => file.uploadingProgress >= 100) &&
      fileErrorCount == 0
    ) {
      shareService
        .completeShare(createdShare.id)
        .then((share) => {
          setisUploading(false);
          showCompletedUploadModal(modals, share);
          setFiles([]);
          setReverseShareNote("");
        })
        .catch(() => {
          setisUploading(false);
          toast.error(t("upload.notify.generic-error"));
        });
    }
  }, [files, modals, t]);

  return (
    <>
      <Meta title={t("upload.title")} />
      <Container>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title">
              {isReverseShare
                ? t("upload.reverse-share.title")
                : t("upload.title")}
            </h1>
            <p className="body-text mt-1">
              {isReverseShare
                ? t("upload.reverse-share.description")
                : !autoOpenCreateUploadModal
                ? (
                  <FormattedMessage
                    id="upload.flow.hint.manual-open"
                    values={{ actionLabel: t("common.button.share") }}
                  />
                )
                : (
                  <FormattedMessage id="upload.dropzone.title" />
                )}
            </p>
          </div>
          <Button
            loading={isUploading}
            disabled={files.length <= 0}
            onClick={() => {
              if (isReverseShare) {
                void startReverseShareUpload();
                return;
              }
              showCreateUploadModalCallback(files);
            }}
          >
            {isReverseShare
              ? t("upload.reverse-share.button.finish")
              : t("common.button.share")}
          </Button>
        </div>
        {isReverseShare && (
          <div className="mb-6">
            <Textarea
              label={t("upload.reverse-share.note.label")}
              placeholder={t("upload.reverse-share.note.placeholder")}
              value={reverseShareNote}
              maxLength={512}
              onChange={(e) => setReverseShareNote(e.target.value)}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              <FormattedMessage id="upload.reverse-share.note.helper" />
            </p>
          </div>
        )}
        <Dropzone
          title={
            isReverseShare
              ? t("upload.reverse-share.dropzone.title")
              : !autoOpenCreateUploadModal && files.length > 0
              ? t("share.edit.append-upload")
              : undefined
          }
          description={
            isReverseShare
              ? t("upload.reverse-share.dropzone.description", {
                  maxSize: byteToHumanSizeString(maxShareSize),
                })
              : undefined
          }
          maxShareSize={maxShareSize}
          onFilesChanged={handleDropzoneFilesChanged}
          isUploading={isUploading}
        />
        {files.length > 0 && (
          <FileList<FileUpload> files={files} setFiles={setFiles} />
        )}
      </Container>
    </>
  );
};

export default Upload;
