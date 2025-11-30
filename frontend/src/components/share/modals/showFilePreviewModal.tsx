import mime from "mime-types";
import { FileMetaData } from "../../../types/File.type";
import FilePreview from "../FilePreview";
import { ModalContextType } from "../../../contexts/ModalContext";

const showFilePreviewModal = (
  shareId: string,
  file: FileMetaData,
  modals: ModalContextType,
) => {
  const mimeType = (mime.contentType(file.name) || "").split(";")[0];
  return modals.openModal({
    size: "xl",
    title: file.name,
    children: (
      <FilePreview shareId={shareId} fileId={file.id} mimeType={mimeType} />
    ),
  });
};

export default showFilePreviewModal;
