import Markdown, { MarkdownToJSX } from "markdown-to-jsx";
import dynamic from "next/dynamic";
import Link from "next/link";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import api from "../../services/api.service";
import { useModals } from "../../contexts/ModalContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  getCodeLanguage,
  getFilePreviewKind,
} from "../../utils/filePreview.util";
import { encodePathSegment } from "../../utils/url.util";

const CodeSyntaxPreview = dynamic(() => import("./CodeSyntaxPreview"), {
  ssr: false,
});

const FilePreviewContext = React.createContext<{
  shareId: string;
  fileId: string;
  fileName: string;
  mimeType: string;
  setHasPreviewError: Dispatch<SetStateAction<boolean>>;
}>({
  shareId: "",
  fileId: "",
  fileName: "",
  mimeType: "",
  setHasPreviewError: () => {},
});

const FilePreview = ({
  shareId,
  fileId,
  fileName,
  mimeType,
}: {
  shareId: string;
  fileId: string;
  fileName: string;
  mimeType: string;
}) => {
  const [hasPreviewError, setHasPreviewError] = useState(false);
  const modals = useModals();
  const safeShareId = encodePathSegment(shareId);
  const safeFileId = encodePathSegment(fileId);

  if (hasPreviewError) return <UnSupportedFile />;

  return (
    <div className="space-y-4">
      <FilePreviewContext.Provider
        value={{
          shareId,
          fileId,
          fileName,
          mimeType,
          setHasPreviewError,
        }}
      >
        <FileDecider />
      </FilePreviewContext.Provider>
      <Link
        href={`/api/shares/${safeShareId}/files/${safeFileId}?download=false`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-primary-500 hover:bg-primary-50 focus:ring-primary-500 dark:text-primary-400 dark:hover:bg-primary-900/20 px-4 py-2 text-base"
        onClick={() => modals.closeAll()}
      >
        <FormattedMessage id="share.modal.file-preview.view-original" />
      </Link>
    </div>
  );
};

const FileDecider = () => {
  const { mimeType, fileName } = React.useContext(FilePreviewContext);
  const kind = getFilePreviewKind({ fileName, mimeType });

  switch (kind) {
    case "pdf":
      return <PdfPreview />;
    case "video":
      return <VideoPreview />;
    case "image":
      return <ImagePreview />;
    case "audio":
      return <AudioPreview />;
    case "markdown":
      return <MarkdownTextPreview />;
    case "code":
      return <CodePreview />;
    case "plaintext":
      return <PlainTextPreview />;
    default:
      return <UnSupportedFile />;
  }
};

const AudioPreview = () => {
  const { shareId, fileId, setHasPreviewError } =
    React.useContext(FilePreviewContext);
  const safeShareId = encodePathSegment(shareId);
  const safeFileId = encodePathSegment(fileId);
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-2.5 w-full">
        <audio controls className="w-full">
          <source
            src={`/api/shares/${safeShareId}/files/${safeFileId}?download=false`}
            onError={() => setHasPreviewError(true)}
          />
        </audio>
      </div>
    </div>
  );
};

const VideoPreview = () => {
  const { shareId, fileId, setHasPreviewError } =
    React.useContext(FilePreviewContext);
  const safeShareId = encodePathSegment(shareId);
  const safeFileId = encodePathSegment(fileId);
  return (
    <video width="100%" controls>
      <source
        src={`/api/shares/${safeShareId}/files/${safeFileId}?download=false`}
        onError={() => setHasPreviewError(true)}
      />
    </video>
  );
};

const ImagePreview = () => {
  const { shareId, fileId, setHasPreviewError } =
    React.useContext(FilePreviewContext);
  const safeShareId = encodePathSegment(shareId);
  const safeFileId = encodePathSegment(fileId);
  return (
    <img
      src={`/api/shares/${safeShareId}/files/${safeFileId}?download=false`}
      alt={`${fileId}_preview`}
      className="w-full"
      onError={() => setHasPreviewError(true)}
    />
  );
};

const useTextPreviewContent = () => {
  const { shareId, fileId, setHasPreviewError } =
    React.useContext(FilePreviewContext);
  const [text, setText] = useState<string>("");
  const safeShareId = encodePathSegment(shareId);
  const safeFileId = encodePathSegment(fileId);

  useEffect(() => {
    api
      .get(`/shares/${safeShareId}/files/${safeFileId}?download=false`, {
        responseType: "text",
        transformResponse: [(data) => data],
      })
      .then((res) => {
        if (typeof res.data === "string") {
          setText(res.data);
        } else {
          setText(String(res.data ?? ""));
        }
      })
      .catch(() => setHasPreviewError(true));
  }, [safeShareId, safeFileId, setHasPreviewError]);

  return text;
};

const MarkdownTextPreview = () => {
  const text = useTextPreviewContent();
  const { resolvedTheme } = useTheme();

  const options: MarkdownToJSX.Options = {
    disableParsingRawHTML: true,
    overrides: {
      pre: {
        props: {
          className: resolvedTheme === "dark"
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

const CodePreview = () => {
  const text = useTextPreviewContent();
  const { fileName, mimeType } = React.useContext(FilePreviewContext);
  const { resolvedTheme } = useTheme();

  return (
    <CodeSyntaxPreview
      language={getCodeLanguage({ fileName, mimeType })}
      text={text}
      resolvedTheme={resolvedTheme}
    />
  );
};

const PlainTextPreview = () => {
  const text = useTextPreviewContent();
  return (
    <div className="max-h-[70vh] overflow-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <pre className="p-4 text-sm leading-6 whitespace-pre-wrap break-words font-mono text-text dark:text-text-dark">
        {text}
      </pre>
    </div>
  );
};

const PdfPreview = () => {
  const { shareId, fileId, setHasPreviewError } =
    React.useContext(FilePreviewContext);
  const safeShareId = encodePathSegment(shareId);
  const safeFileId = encodePathSegment(fileId);
  return (
    <iframe
      src={`/api/shares/${safeShareId}/files/${safeFileId}?download=false`}
      title={`${fileId}_preview`}
      className="w-full min-h-[75vh] rounded-lg border border-gray-200 dark:border-gray-700"
      onError={() => setHasPreviewError(true)}
    />
  );
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
