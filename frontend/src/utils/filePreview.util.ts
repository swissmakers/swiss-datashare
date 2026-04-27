import mime from "mime-types";

export type FilePreviewKind =
  | "pdf"
  | "video"
  | "image"
  | "audio"
  | "markdown"
  | "code"
  | "plaintext"
  | "unsupported";

const MARKDOWN_EXTENSIONS = new Set(["md", "markdown", "mdx"]);
const CODE_EXTENSIONS = new Set([
  "ts",
  "tsx",
  "js",
  "jsx",
  "mjs",
  "cjs",
  "json",
  "yaml",
  "yml",
  "xml",
  "html",
  "htm",
  "css",
  "scss",
  "sass",
  "less",
  "py",
  "go",
  "rs",
  "java",
  "c",
  "h",
  "cpp",
  "cc",
  "cxx",
  "cs",
  "sql",
  "sh",
  "bash",
  "zsh",
  "vue",
  "rb",
  "php",
  "swift",
  "kt",
  "kts",
  "toml",
  "ini",
  "conf",
  "env",
  "dockerfile",
  "makefile",
]);

const CODE_FILE_NAMES = new Set(["dockerfile", "makefile"]);

const CODE_MIME_TO_LANGUAGE: Record<string, string> = {
  "application/json": "json",
  "application/javascript": "javascript",
  "application/xml": "xml",
  "text/xml": "xml",
  "text/html": "markup",
  "text/css": "css",
  "text/javascript": "javascript",
  "text/x-python": "python",
  "text/x-c": "c",
  "text/x-c++src": "cpp",
  "text/x-java-source": "java",
};

const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  mjs: "javascript",
  cjs: "javascript",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  xml: "xml",
  html: "markup",
  htm: "markup",
  css: "css",
  scss: "scss",
  sass: "sass",
  less: "less",
  py: "python",
  go: "go",
  rs: "rust",
  java: "java",
  c: "c",
  h: "c",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  cs: "csharp",
  sql: "sql",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  vue: "markup",
  rb: "ruby",
  php: "php",
  swift: "swift",
  kt: "kotlin",
  kts: "kotlin",
  toml: "ini",
  ini: "ini",
  conf: "ini",
  env: "bash",
  dockerfile: "bash",
  makefile: "bash",
};

const getBaseName = (fileName: string): string => {
  const normalized = fileName.trim().toLowerCase();
  const parts = normalized.split("/");
  return parts[parts.length - 1];
};

const getExtension = (fileName: string): string | null => {
  const baseName = getBaseName(fileName);
  if (CODE_FILE_NAMES.has(baseName)) return baseName;
  const segments = baseName.split(".");
  if (segments.length < 2) return null;
  return segments[segments.length - 1];
};

export const getMimeTypeFromFileName = (fileName: string): string => {
  return (mime.contentType(fileName) || "").split(";")[0];
};

const isCodeMimeType = (mimeType: string): boolean => {
  if (!mimeType) return false;
  if (CODE_MIME_TO_LANGUAGE[mimeType]) return true;
  return mimeType === "text/x-typescript";
};

export const getFilePreviewKind = ({
  fileName,
  mimeType,
}: {
  fileName: string;
  mimeType?: string;
}): FilePreviewKind => {
  const resolvedMimeType = mimeType || getMimeTypeFromFileName(fileName);
  const extension = getExtension(fileName);

  if (resolvedMimeType === "application/pdf") return "pdf";
  if (resolvedMimeType.startsWith("video/")) return "video";
  if (resolvedMimeType.startsWith("image/")) return "image";
  if (resolvedMimeType.startsWith("audio/")) return "audio";

  if (
    resolvedMimeType === "text/markdown" ||
    (extension !== null && MARKDOWN_EXTENSIONS.has(extension))
  ) {
    return "markdown";
  }

  if (
    isCodeMimeType(resolvedMimeType) ||
    (extension !== null && CODE_EXTENSIONS.has(extension))
  ) {
    return "code";
  }

  if (resolvedMimeType.startsWith("text/")) return "plaintext";

  return "unsupported";
};

export const isFilePreviewSupported = ({
  fileName,
  mimeType,
}: {
  fileName: string;
  mimeType?: string;
}): boolean => {
  return getFilePreviewKind({ fileName, mimeType }) !== "unsupported";
};

export const getCodeLanguage = ({
  fileName,
  mimeType,
}: {
  fileName: string;
  mimeType?: string;
}): string => {
  const resolvedMimeType = mimeType || getMimeTypeFromFileName(fileName);
  const extension = getExtension(fileName);

  if (extension && EXTENSION_TO_LANGUAGE[extension]) {
    return EXTENSION_TO_LANGUAGE[extension];
  }

  return CODE_MIME_TO_LANGUAGE[resolvedMimeType] || "text";
};
