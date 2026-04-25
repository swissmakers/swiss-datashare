const RELEASES_LATEST_URL =
  "https://github.com/swissmakers/swiss-datashare/releases/latest";
const GITHUB_LATEST_RELEASE_API =
  "https://api.github.com/repos/swissmakers/swiss-datashare/releases/latest";

const normalizeVersion = (value: string): string => {
  const raw = value.trim().replace(/^v/i, "");
  const [core] = raw.split("-", 1);
  return core;
};

const parseSemverTuple = (
  value: string,
): [major: number, minor: number, patch: number] | null => {
  const normalized = normalizeVersion(value);
  const m = normalized.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
};

const isVersionNewer = (candidate: string, current: string): boolean => {
  const a = parseSemverTuple(candidate);
  const b = parseSemverTuple(current);
  if (!a || !b) return false;
  if (a[0] !== b[0]) return a[0] > b[0];
  if (a[1] !== b[1]) return a[1] > b[1];
  return a[2] > b[2];
};

const getLocalVersion = (): string =>
  `v${normalizeVersion(process.env.VERSION || "0.0.0")}`;

const getLatestReleaseTag = async (): Promise<string | null> => {
  try {
    const res = await fetch(GITHUB_LATEST_RELEASE_API, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return null;
    const payload = (await res.json()) as { tag_name?: string };
    if (!payload?.tag_name) return null;
    return `v${normalizeVersion(payload.tag_name)}`;
  } catch {
    return null;
  }
};

export default {
  RELEASES_LATEST_URL,
  getLocalVersion,
  getLatestReleaseTag,
  isVersionNewer,
};

