type User = {
  id: string;
  username: string;
  email: string;
  locale: string;
  isAdmin: boolean;
  isLdap: boolean;
  oauthProviders?: string[];
  totpVerified: boolean;
  hasPassword: boolean;
  billingExempt?: boolean;
  billingCompliant?: boolean;
  billingSubscriptionStatus?: string;
};

export type CreateUser = {
  username: string;
  email: string;
  locale?: string;
  password?: string;
  isAdmin?: boolean;
};

export type UpdateUser = {
  username?: string;
  email?: string;
  locale?: string;
  password?: string;
  isAdmin?: boolean;
};

export type UpdateCurrentUser = {
  username?: string;
  email?: string;
  locale?: string;
};

export type CurrentUser = User & {};

export type UserHook = {
  user: CurrentUser | null;
  refreshUser: () => Promise<CurrentUser | null>;
};

export default User;
