import { deleteCookie, setCookie } from "cookies-next";
import mime from "mime-types";
import { FileUploadResponse } from "../types/File.type";

import {
  CreateShare,
  MyReverseShare,
  MyShare,
  Share,
  ShareMetaData,
} from "../types/share.type";
import { encodePathSegment } from "../utils/url.util";
import api from "./api.service";

const REVERSE_SHARE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,256}$/;

const isValidReverseShareToken = (token: string): boolean => {
  return REVERSE_SHARE_TOKEN_PATTERN.test(token);
};

const list = async (): Promise<MyShare[]> => {
  return (await api.get(`shares/all`)).data;
};

const create = async (share: CreateShare, isReverseShare = false) => {
  if (!isReverseShare) {
    deleteCookie("reverse_share_token");
  }
  return (await api.post("shares", share)).data;
};

const completeShare = async (id: string) => {
  const safeId = encodePathSegment(id);
  const response = (await api.post(`shares/${safeId}/complete`)).data;
  deleteCookie("reverse_share_token");
  return response;
};

const revertComplete = async (id: string) => {
  const safeId = encodePathSegment(id);
  return (await api.delete(`shares/${safeId}/complete`)).data;
};

const get = async (id: string): Promise<Share> => {
  const safeId = encodePathSegment(id);
  return (await api.get(`shares/${safeId}`)).data;
};

const getFromOwner = async (id: string): Promise<Share> => {
  const safeId = encodePathSegment(id);
  return (await api.get(`shares/${safeId}/from-owner`)).data;
};

const getMetaData = async (id: string): Promise<ShareMetaData> => {
  const safeId = encodePathSegment(id);
  return (await api.get(`shares/${safeId}/metaData`)).data;
};

const remove = async (id: string) => {
  const safeId = encodePathSegment(id);
  await api.delete(`shares/${safeId}`);
};

const getMyShares = async (): Promise<MyShare[]> => {
  return (await api.get("shares")).data;
};

const getShareToken = async (id: string, password?: string) => {
  const safeId = encodePathSegment(id);
  await api.post(`/shares/${safeId}/token`, { password });
};

const isShareIdAvailable = async (id: string): Promise<boolean> => {
  const safeId = encodePathSegment(id);
  return (await api.get(`/shares/isShareIdAvailable/${safeId}`)).data.isAvailable;
};

const doesFileSupportPreview = (fileName: string) => {
  const mimeType = (mime.contentType(fileName) || "").split(";")[0];

  if (!mimeType) return false;

  const supportedMimeTypes = [
    mimeType.startsWith("video/"),
    mimeType.startsWith("image/"),
    mimeType.startsWith("audio/"),
    mimeType.startsWith("text/"),
    mimeType == "application/pdf",
  ];

  return supportedMimeTypes.some((isSupported) => isSupported);
};

const downloadFile = async (shareId: string, fileId: string) => {
  const safeShareId = encodePathSegment(shareId);
  const safeFileId = encodePathSegment(fileId);
  window.location.href = `${window.location.origin}/api/shares/${safeShareId}/files/${safeFileId}`;
};

const removeFile = async (shareId: string, fileId: string) => {
  const safeShareId = encodePathSegment(shareId);
  const safeFileId = encodePathSegment(fileId);
  await api.delete(`shares/${safeShareId}/files/${safeFileId}`);
};

const uploadFile = async (
  shareId: string,
  chunk: Blob,
  file: {
    id?: string;
    name: string;
  },
  chunkIndex: number,
  totalChunks: number,
): Promise<FileUploadResponse> => {
  const safeShareId = encodePathSegment(shareId);
  return (
    await api.post(`shares/${safeShareId}/files`, chunk, {
      headers: { "Content-Type": "application/octet-stream" },
      params: {
        id: file.id,
        name: file.name,
        chunkIndex,
        totalChunks,
      },
    })
  ).data;
};

const createReverseShare = async (
  name: string | undefined,
  shareExpiration: string,
  maxShareSize: number,
  maxUseCount: number,
  sendEmailNotification: boolean,
  simplified: boolean,
  publicAccess: boolean,
) => {
  return (
    await api.post("reverseShares", {
      name,
      shareExpiration,
      maxShareSize: maxShareSize.toString(),
      maxUseCount,
      sendEmailNotification,
      simplified,
      publicAccess,
    })
  ).data;
};

const getMyReverseShares = async (): Promise<MyReverseShare[]> => {
  return (await api.get("reverseShares")).data;
};

const setReverseShare = async (reverseShareToken: string) => {
  if (!isValidReverseShareToken(reverseShareToken)) {
    throw new Error("Invalid reverse share token format");
  }

  const safeReverseShareToken = encodePathSegment(reverseShareToken);
  const { data } = await api.get(`/reverseShares/${safeReverseShareToken}`);
  setCookie("reverse_share_token", reverseShareToken);
  return data;
};

const removeReverseShare = async (id: string) => {
  const safeId = encodePathSegment(id);
  await api.delete(`/reverseShares/${safeId}`);
};

export default {
  list,
  create,
  completeShare,
  revertComplete,
  getShareToken,
  get,
  getFromOwner,
  remove,
  getMetaData,
  doesFileSupportPreview,
  getMyShares,
  isShareIdAvailable,
  downloadFile,
  removeFile,
  uploadFile,
  setReverseShare,
  createReverseShare,
  getMyReverseShares,
  removeReverseShare,
};
