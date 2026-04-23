import {
  CreateUser,
  CurrentUser,
  UpdateCurrentUser,
  UpdateUser,
} from "../types/user.type";
import { getCookie } from "cookies-next";
import { encodePathSegment } from "../utils/url.util";
import api from "./api.service";
import authService from "./auth.service";

const list = async () => {
  return (await api.get("/users")).data;
};

const create = async (user: CreateUser) => {
  return (await api.post("/users", user)).data;
};

const update = async (id: string, user: UpdateUser) => {
  const safeId = encodePathSegment(id);
  return (await api.patch(`/users/${safeId}`, user)).data;
};

const remove = async (id: string) => {
  const safeId = encodePathSegment(id);
  await api.delete(`/users/${safeId}`);
};

const updateCurrentUser = async (user: UpdateCurrentUser) => {
  return (await api.patch("/users/me", user)).data;
};

const removeCurrentUser = async () => {
  await api.delete("/users/me");
};

const getCurrentUser = async (): Promise<CurrentUser | null> => {
  try {
    // Skip request when user has no auth cookie.
    if (!getCookie("access_token")) return null;

    await authService.refreshAccessToken();
    return (await api.get("users/me")).data;
  } catch {
    return null;
  }
};

export default {
  list,
  create,
  update,
  remove,
  getCurrentUser,
  updateCurrentUser,
  removeCurrentUser,
};
