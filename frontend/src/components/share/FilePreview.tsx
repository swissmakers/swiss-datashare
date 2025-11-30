import Markdown, { MarkdownToJSX } from "markdown-to-jsx";
import Link from "next/link";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import api from "../../services/api.service";
import { useModals } from "../../contexts/ModalContext";
import { useTheme } from "../../contexts/ThemeContext";

const FilePreviewContext = React.createContext<{
  shareId: string;
  fileId: string;
  mimeType: string;
  setIsNotSupported: Dispatch<SetStateAction<boolean>>;
}>({
  shareId: "",
  fileId: "",
  mimeType: "",
  setIsNotSupported: () => {},
});

const FilePreview = ({
  shareId,
  fileId,
  mimeType,
}: {
  shareId: string;
  fileId: string;
  mimeType: string;
}) => {
  const [isNotSupported, setIsNotSupported] = useState(false);
  const modals = useModals();
  
  if (isNotSupported) return <UnSupportedFile />;

  return (
    <div className="space-y-4">
      <FilePreviewContext.Provider
        value={{ shareId, fileId, mimeType, setIsNotSupported }}
      >
        <FileDecider />
      </FilePreviewContext.Provider>
      <Link
        href={`/api/shares/${shareId}/files/${fileId}?download=false`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-primary-500 hover:bg-primary-50 focus:ring-primary-500 dark:text-primary-400 dark:hover:bg-primary-900/20 px-4 py-2 text-base"
        onClick={() => modals.closeAll()}
      >
        View original file
        {/* Add translation? */}
      </Link>
    </div>
  );
};

const FileDecider = () => {
  const { mimeType, setIsNotSupported } = React.useContext(FilePreviewContext);

  if (mimeType == "application/pdf") {
    return <PdfPreview />;
  } else if (mimeType.startsWith("video/")) {
    return <VideoPreview />;
  } else if (mimeType.startsWith("image/")) {
    return <ImagePreview />;
  } else if (mimeType.startsWith("audio/")) {
    return <AudioPreview />;
  } else if (mimeType.startsWith("text/")) {
    return <TextPreview />;
  } else {
    setIsNotSupported(true);
    return null;
  }
};

const AudioPreview = () => {
  const { shareId, fileId, setIsNotSupported } =
    React.useContext(FilePreviewContext);
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-2.5 w-full">
        <audio controls className="w-full">
          <source
            src={`/api/shares/${shareId}/files/${fileId}?download=false`}
            onError={() => setIsNotSupported(true)}
          />
        </audio>
      </div>
    </div>
  );
};

const VideoPreview = () => {
  const { shareId, fileId, setIsNotSupported } =
    React.useContext(FilePreviewContext);
  return (
    <video width="100%" controls>
      <source
        src={`/api/shares/${shareId}/files/${fileId}?download=false`}
        onError={() => setIsNotSupported(true)}
      />
    </video>
  );
};

const ImagePreview = () => {
  const { shareId, fileId, setIsNotSupported } =
    React.useContext(FilePreviewContext);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/shares/${shareId}/files/${fileId}?download=false`}
      alt={`${fileId}_preview`}
      className="w-full"
      onError={() => setIsNotSupported(true)}
    />
  );
};

const TextPreview = () => {
  const { shareId, fileId } = React.useContext(FilePreviewContext);
  const [text, setText] = useState<string>("");
  const { theme } = useTheme();

  useEffect(() => {
    api
      .get(`/shares/${shareId}/files/${fileId}?download=false`)
      .then((res) => setText(res.data ?? "Preview couldn't be fetched."));
  }, [shareId, fileId]);

  const options: MarkdownToJSX.Options = {
    disableParsingRawHTML: true,
    overrides: {
      pre: {
        props: {
          className: theme === "dark" 
            ? "bg-gray-800/50 p-3 whitespace-pre-wrap rounded"
            : "bg-gray-200/50 p-3 whitespace-pre-wrap rounded",
        },
      },
      table: {
        props: {
          className: "md",
        },
      },
    },
  };

  return <Markdown options={options}>{text}</Markdown>;
};

const PdfPreview = () => {
  const { shareId, fileId } = React.useContext(FilePreviewContext);
  if (typeof window !== "undefined") {
    window.location.href = `/api/shares/${shareId}/files/${fileId}?download=false`;
  }
  return null;
};

const UnSupportedFile = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-2.5">
        <h3 className="text-xl font-semibold text-text dark:text-text-dark">
          <FormattedMessage id="share.modal.file-preview.error.not-supported.title" />
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          <FormattedMessage id="share.modal.file-preview.error.not-supported.description" />
        </p>
      </div>
    </div>
  );
};

export default FilePreview;
