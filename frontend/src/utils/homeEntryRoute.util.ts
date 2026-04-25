import type { CurrentUser } from "../types/user.type";

export type ConfigGetter = (key: string) => unknown;

/**
 * Target for the main brand / "home" link and post-home redirects.
 * Matches middleware in `src/proxy.ts`: `/` is only used when the marketing
 * home is enabled and the visitor is not logged in.
 */
export function getHomeEntryHref(
  user: CurrentUser | null | undefined,
  getConfig: ConfigGetter,
): string {
  if (user) return "/upload";
  const showHomePage = getConfig("general.showHomePage");
  if (showHomePage !== false) return "/";
  return "/upload";
}
