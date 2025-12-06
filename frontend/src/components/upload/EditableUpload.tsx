import { AxiosError } from "axios";
import { useRouter } from "next/router";
import pLimit from "p-limit";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import Dropzone from "../../components/upload/Dropzone";
import FileList from "../../components/upload/FileList";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import shareService from "../../services/share.service";
import { FileListItem, FileMetaData, FileUpload } from "../../types/File.type";
import toast from "../../utils/toast.util";
import { Button, Container } from "../ui";

const promiseLimit = pLimit(3);
let errorToastShown = false;

const EditableUpload = ({
  maxShareSize,
  shareId,
  files: savedFiles = [],
}: {
  maxShareSize?: number;
  isReverseShare?: boolean;
  shareId: string;
  files?: FileMetaData[];
}) => {
  const t = useTranslate();
  const router = useRouter();
  const config = useConfig();

  const chunkSize = useRef(parseInt(config.get("share.chunkSize")));

  const [existingFiles, setExistingFiles] =
    useState<Array<FileMetaData & { deleted?: boolean }>>(savedFiles);
  const [uploadingFiles, setUploadingFiles] = useState<FileUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const existingAndUploadedFiles: FileListItem[] = useMemo(
    () => [...uploadingFiles, ...existingFiles],
    [existingFiles, uploadingFiles],
  );
  const dirty = useMemo(() => {
    return (
      existingFiles.some((file) => !!file.deleted) || !!uploadingFiles.length
    );
  }, [existingFiles, uploadingFiles]);

  const setFiles = (files: FileListItem[]) => {
    const _uploadFiles = files.filter(
      (file) => "uploadingProgress" in file,
    ) as FileUpload[];
    const _existingFiles = files.filter(
      (file) => !("uploadingProgress" in file),
    ) as FileMetaData[];

    setUploadingFiles(_uploadFiles);
    setExistingFiles(_existingFiles);
  };

  maxShareSize ??= parseInt(config.get("share.maxSize"));

  const uploadFiles = async (files: FileUpload[]) => {
    console.log(`[EditableUpload] Starting upload of ${files.length} files to share ${shareId}`);
    
    const fileUploadPromises = files.map(async (file, fileIndex) =>
      // Limit the number of concurrent uploads to 3
      promiseLimit(async () => {
        let fileId: string | undefined;

        const setFileProgress = (progress: number) => {
          setUploadingFiles((files) =>
            files.map((file, callbackIndex) => {
              if (fileIndex == callbackIndex) {
                file.uploadingProgress = progress;
              }
              return file;
            }),
          );
        };

        console.log(`[EditableUpload] Starting upload of file ${fileIndex + 1}/${files.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        setFileProgress(1);

        let chunks = Math.ceil(file.size / chunkSize.current);

        // If the file is 0 bytes, we still need to upload 1 chunk
        if (chunks == 0) chunks++;

        console.log(`[EditableUpload] File ${file.name} will be uploaded in ${chunks} chunks (chunk size: ${(chunkSize.current / 1024 / 1024).toFixed(2)} MB)`);

        for (let chunkIndex = 0; chunkIndex < chunks; chunkIndex++) {
          const from = chunkIndex * chunkSize.current;
          const to = from + chunkSize.current;
          const blob = file.slice(from, to);
          try {
            console.log(`[EditableUpload] Uploading chunk ${chunkIndex + 1}/${chunks} of file ${file.name}`);
            await shareService
              .uploadFile(
                shareId,
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
                console.log(`[EditableUpload] Chunk ${chunkIndex + 1}/${chunks} of file ${file.name} uploaded successfully, fileId: ${fileId}`);
              });

            setFileProgress(((chunkIndex + 1) / chunks) * 100);
          } catch (e) {
            if (
              e instanceof AxiosError &&
              e.response?.data.error == "unexpected_chunk_index"
            ) {
              console.warn(`[EditableUpload] Unexpected chunk index for file ${file.name}, retrying with expected index: ${e.response!.data!.expectedChunkIndex}`);
              // Retry with the expected chunk index
              chunkIndex = e.response!.data!.expectedChunkIndex - 1;
              continue;
            } else {
              console.error(`[EditableUpload] Error uploading chunk ${chunkIndex + 1}/${chunks} of file ${file.name}:`, e);
              if (e instanceof AxiosError) {
                console.error(`[EditableUpload] Error details:`, {
                  status: e.response?.status,
                  statusText: e.response?.statusText,
                  data: e.response?.data,
                  message: e.message,
                });
              }
              setFileProgress(-1);
              // Retry after 5 seconds
              console.log(`[EditableUpload] Retrying upload of file ${file.name} in 5 seconds...`);
              await new Promise((resolve) => setTimeout(resolve, 5000));
              chunkIndex = -1;

              continue;
            }
          }
        }
        console.log(`[EditableUpload] Successfully completed upload of file ${file.name}`);
      }),
    );

    await Promise.all(fileUploadPromises);
    console.log(`[EditableUpload] All file uploads completed for share ${shareId}`);
  };

  const removeFiles = async () => {
    const removedFiles = existingFiles.filter((file) => !!file.deleted);

    if (removedFiles.length > 0) {
      await Promise.all(
        removedFiles.map(async (file) => {
          await shareService.removeFile(shareId, file.id);
        }),
      );

      setExistingFiles(existingFiles.filter((file) => !file.deleted));
    }
  };

  const revertComplete = async () => {
    console.log(`[EditableUpload] Calling revertComplete for share ${shareId}`);
    try {
      const result = await shareService.revertComplete(shareId);
      console.log(`[EditableUpload] revertComplete successful:`, result);
      return result;
    } catch (error) {
      console.error(`[EditableUpload] Error in revertComplete:`, error);
      throw error;
    }
  };

  const completeShare = async () => {
    console.log(`[EditableUpload] Calling completeShare for share ${shareId}`);
    try {
      const result = await shareService.completeShare(shareId);
      console.log(`[EditableUpload] completeShare successful:`, result);
      // Verify share still exists after completion
      try {
        const verifyShare = await shareService.getFromOwner(shareId);
        console.log(`[EditableUpload] Share verification after complete:`, verifyShare);
      } catch (verifyError) {
        console.error(`[EditableUpload] WARNING: Share verification failed after complete:`, verifyError);
      }
      return result;
    } catch (error) {
      console.error(`[EditableUpload] Error in completeShare:`, error);
      throw error;
    }
  };

  const save = async () => {
    setIsUploading(true);
    console.log(`[EditableUpload] Starting save operation for share ${shareId}`);

    try {
      console.log(`[EditableUpload] Reverting share completion...`);
      await revertComplete();
      console.log(`[EditableUpload] Share completion reverted successfully`);

      if (uploadingFiles.length > 0) {
        console.log(`[EditableUpload] Uploading ${uploadingFiles.length} new files...`);
        await uploadFiles(uploadingFiles);
      } else {
        console.log(`[EditableUpload] No new files to upload`);
      }

      const hasFailed = uploadingFiles.some(
        (file) => file.uploadingProgress == -1,
      );

      if (hasFailed) {
        console.warn(`[EditableUpload] Some files failed to upload, skipping file removal`);
      } else {
        console.log(`[EditableUpload] Removing deleted files...`);
        await removeFiles();
      }

      console.log(`[EditableUpload] Completing share...`);
      await completeShare();
      console.log(`[EditableUpload] Share completed successfully`);

      // Final verification that share still exists
      try {
        const finalVerify = await shareService.getFromOwner(shareId);
        console.log(`[EditableUpload] Final share verification:`, finalVerify);
        console.log(`[EditableUpload] Share expiration:`, finalVerify.expiration);
      } catch (verifyError) {
        console.error(`[EditableUpload] CRITICAL: Share verification failed after save:`, verifyError);
        toast.error(t("share.edit.notify.generic-error") + " - Share verification failed");
        return;
      }

      if (!hasFailed) {
        toast.success(t("share.edit.notify.save-success"));
        router.back();
      } else {
        toast.error(t("share.edit.notify.generic-error"));
      }
    } catch (error) {
      console.error(`[EditableUpload] Error during save operation:`, error);
      if (error instanceof AxiosError) {
        console.error(`[EditableUpload] Error details:`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          url: error.config?.url,
        });
      }
      toast.error(t("share.edit.notify.generic-error"));
    } finally {
      setIsUploading(false);
    }
  };

  const appendFiles = (appendingFiles: FileUpload[]) => {
    setUploadingFiles([...appendingFiles, ...uploadingFiles]);
  };

  useEffect(() => {
    // Check if there are any files that failed to upload
    const fileErrorCount = uploadingFiles.filter(
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
  }, [uploadingFiles, t]);

  return (
    <Container>
      <div className="flex justify-end mb-5">
        <Button loading={isUploading} disabled={!dirty} onClick={() => save()}>
          <FormattedMessage id="common.button.save" />
        </Button>
      </div>
      <Dropzone
        title={t("share.edit.append-upload")}
        maxShareSize={maxShareSize}
        onFilesChanged={appendFiles}
        isUploading={isUploading}
      />
      {existingAndUploadedFiles.length > 0 && (
        <FileList files={existingAndUploadedFiles} setFiles={setFiles} />
      )}
    </Container>
  );
};

export default EditableUpload;
