export const buildOAuthCallbackUri = (
  appUrl: string,
  provider: string,
): string => {
  const normalizedAppUrl = appUrl.replace(/\/+$/, "");
  return `${normalizedAppUrl}/api/oauth/callback/${provider}`;
};
