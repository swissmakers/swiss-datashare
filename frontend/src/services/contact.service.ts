import type {
  CreateContactPayload,
  UpdateContactPayload,
  UserContact,
} from "../types/contact.type";
import api from "./api.service";
import { encodePathSegment } from "../utils/url.util";

const list = async (q?: string, limit = 50): Promise<UserContact[]> => {
  const params = new URLSearchParams();
  if (q !== undefined && q !== "") params.set("q", q);
  params.set("limit", String(limit));
  const qs = params.toString();
  return (await api.get(`contacts${qs ? `?${qs}` : ""}`)).data;
};

const create = async (body: CreateContactPayload): Promise<UserContact> => {
  return (await api.post("contacts", body)).data;
};

const update = async (
  id: string,
  body: UpdateContactPayload,
): Promise<UserContact> => {
  const safeId = encodePathSegment(id);
  return (await api.patch(`contacts/${safeId}`, body)).data;
};

const remove = async (id: string): Promise<void> => {
  const safeId = encodePathSegment(id);
  await api.delete(`contacts/${safeId}`);
};

const contactService = { list, create, update, remove };

export default contactService;
