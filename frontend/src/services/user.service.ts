import {
  CreateUser,
  CurrentUser,
  UpdateCurrentUser,
  UpdateUser,
} from "../types/user.type";
import { getCookie } from "cookies-next";
import {
  getRequestTimeoutMessage,
  isTransientApiError,
} from "../utils/apiError.util";
import { encodePathSegment } from "../utils/url.util";
import toast from "../utils/toast.util";
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

const loadCurrentUserProfile = async (): Promise<CurrentUser> => {
  await authService.refreshAccessToken();
  return (await api.get("users/me")).data;
};

/** Coalesce parallel session probes (_app + signIn) into one in-flight request */
let getCurrentUserInFlight: Promise<CurrentUser | null> | null = null;

const fetchCurrentUserOnce = async (): Promise<CurrentUser | null> => {
  if (!getCookie("access_token")) return null;

  try {
    return await loadCurrentUserProfile();
  } catch (e1) {
    if (!isTransientApiError(e1)) return null;
    try {
      return await loadCurrentUserProfile();
    } catch (e2) {
      if (isTransientApiError(e2)) {
        toast.error(getRequestTimeoutMessage());
      }
      return null;
    }
  }
};

const getCurrentUser = async (): Promise<CurrentUser | null> => {
  if (!getCookie("access_token")) return null;
  if (getCurrentUserInFlight) return getCurrentUserInFlight;

  const pending = fetchCurrentUserOnce();
  getCurrentUserInFlight = pending;
  pending.finally(() => {
    if (getCurrentUserInFlight === pending) {
      getCurrentUserInFlight = null;
    }
  });
  return pending;
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
