import { FileMetaData } from "../../../types/File.type";
import FilePreview from "../FilePreview";
import { ModalContextType } from "../../../contexts/ModalContext";
import { getMimeTypeFromFileName } from "../../../utils/filePreview.util";

const showFilePreviewModal = (
  shareId: string,
  file: FileMetaData,
  modals: ModalContextType,
) => {
  const mimeType = getMimeTypeFromFileName(file.name);
  return modals.openModal({
    size: "xl",
    title: file.name,
    children: (
      <FilePreview
        shareId={shareId}
        fileId={file.id}
        fileName={file.name}
        mimeType={mimeType}
      />
    ),
  });
};

export default showFilePreviewModal;
