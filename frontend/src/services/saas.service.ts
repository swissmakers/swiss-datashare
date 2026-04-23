import { BillingStatus, ExemptUser, SaasPaymentHistoryResponse } from "../types/saas.type";
import { encodePathSegment } from "../utils/url.util";
import api from "./api.service";

const getStatus = async (): Promise<BillingStatus> => {
  return (await api.get("/saas/status")).data;
};

const createCheckoutSession = async (interval: "monthly" | "yearly") => {
  return (await api.post("/saas/checkout-session", { interval })).data;
};

const createBillingPortalSession = async () => {
  return (await api.post("/saas/billing-portal")).data;
};

const getExemptUsers = async (search?: string): Promise<ExemptUser[]> => {
  return (await api.get("/saas/admin/exempt-users", { params: { search } })).data;
};

const addExemptUser = async (userId: string) => {
  const safeUserId = encodePathSegment(userId);
  return (await api.post(`/saas/admin/exempt-users/${safeUserId}`)).data;
};

const removeExemptUser = async (userId: string) => {
  const safeUserId = encodePathSegment(userId);
  return (await api.delete(`/saas/admin/exempt-users/${safeUserId}`)).data;
};

const getPayments = async (): Promise<SaasPaymentHistoryResponse> => {
  return (await api.get("/saas/admin/payments")).data;
};

export default {
  getStatus,
  createCheckoutSession,
  createBillingPortalSession,
  getExemptUsers,
  addExemptUser,
  removeExemptUser,
  getPayments,
};
