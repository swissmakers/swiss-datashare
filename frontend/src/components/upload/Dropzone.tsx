import React, { useRef, useState } from "react";
import { TbCloudUpload, TbUpload } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import useTranslate from "../../hooks/useTranslate.hook";
import { FileUpload } from "../../types/File.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";
import { Button } from "../ui";
import clsx from "clsx";

const Dropzone = ({
  title,
  isUploading,
  maxShareSize,
  onFilesChanged,
}: {
  title?: string;
  isUploading: boolean;
  maxShareSize: number;
  onFilesChanged: (files: FileUpload[]) => void;
}) => {
  const t = useTranslate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray: FileUpload[] = Array.from(files).map(file => file as FileUpload);
    const fileSizeSum = fileArray.reduce((n, { size }) => n + size, 0);

    if (fileSizeSum > maxShareSize) {
      toast.error(
        t("upload.dropzone.notify.file-too-big", {
          maxSize: byteToHumanSizeString(maxShareSize),
        }),
      );
      return;
    }

    const filesWithProgress = fileArray.map((newFile) => {
      (newFile as FileUpload).uploadingProgress = 0;
      return newFile as FileUpload;
    });

    onFilesChanged(filesWithProgress);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isUploading) return;

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative mb-8">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={clsx(
          "border-2 border-dashed rounded-lg p-12 transition-colors",
          isDragging
            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
            : "border-gray-300 dark:border-gray-600",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
          disabled={isUploading}
        />
        <div className="pointer-events-none text-center">
          <div className="flex justify-center mb-4">
            <TbCloudUpload
              size={50}
              className={clsx(
                "transition-colors",
                isDragging
                  ? "text-primary-500"
                  : "text-gray-400 dark:text-gray-500"
              )}
            />
          </div>
          <h3 className="text-lg font-bold text-text dark:text-text-dark mb-2">
            {title || <FormattedMessage id="upload.dropzone.title" />}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <FormattedMessage
              id="upload.dropzone.description"
              values={{ maxSize: byteToHumanSizeString(maxShareSize) }}
            />
          </p>
        </div>
      </div>
      <div className="flex justify-center -mt-6">
        <Button
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={openFileDialog}
          className="rounded-full"
        >
          <TbUpload className="mr-2" size={16} />
          <FormattedMessage id="upload.dropzone.button.select" />
        </Button>
      </div>
    </div>
  );
};

export default Dropzone;
