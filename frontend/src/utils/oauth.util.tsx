import {
  SiDiscord,
  SiGithub,
  SiGoogle,
  SiOpenid,
} from "react-icons/si";
import { FaMicrosoft } from "react-icons/fa";
import React from "react";
import api from "../services/api.service";
import { encodePathSegment } from "./url.util";

const OAUTH_PROVIDERS = ["google", "microsoft", "github", "discord", "oidc"] as const;
type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

const isOAuthProvider = (provider: string): provider is OAuthProvider => {
  return OAUTH_PROVIDERS.includes(provider as OAuthProvider);
};

const getOAuthUrl = (appUrl: string, provider: string) => {
  if (!isOAuthProvider(provider)) {
    throw new Error("Invalid OAuth provider");
  }
  return `${appUrl}/api/oauth/auth/${encodePathSegment(provider)}`;
};

const getOAuthIcon = (provider: string) => {
  return {
    google: <SiGoogle />,
    microsoft: <FaMicrosoft />,
    github: <SiGithub />,
    discord: <SiDiscord />,
    oidc: <SiOpenid />,
  }[provider];
};

const unlinkOAuth = (provider: string) => {
  if (!isOAuthProvider(provider)) {
    throw new Error("Invalid OAuth provider");
  }
  return api.post(`/oauth/unlink/${encodePathSegment(provider)}`);
};

export { getOAuthUrl, getOAuthIcon, unlinkOAuth };
