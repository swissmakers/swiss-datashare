import { BadRequestException, ForbiddenException } from "@nestjs/common";
import * as path from "path";
import { validate as isValidUUID } from "uuid";
import { SHARE_DIRECTORY } from "../constants";

/** Matches CreateShareDTO share id validation */
const SAFE_SHARE_ID = /^[a-zA-Z0-9_-]+$/;

function canonicalShareStorageRoot(): string {
  return path.resolve(SHARE_DIRECTORY);
}

function isResolvedPathUnderRoot(resolved: string, root: string): boolean {
  const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
  return resolved === root || resolved.startsWith(rootWithSep);
}

export function assertSafeShareId(shareId: string): void {
  if (!shareId || !SAFE_SHARE_ID.test(shareId)) {
    throw new BadRequestException("Invalid share id");
  }
}

export function assertSafeFileIdForStorage(fileId: string): void {
  if (!fileId || !isValidUUID(fileId)) {
    throw new BadRequestException("Invalid file id");
  }
}

/**
 * Absolute path to the share directory. Validates shareId and ensures result stays under SHARE_DIRECTORY.
 */
export function resolveValidatedShareDirectory(shareId: string): string {
  assertSafeShareId(shareId);
  const base = canonicalShareStorageRoot();
  const shareDir = path.resolve(base, shareId);
  if (!isResolvedPathUnderRoot(shareDir, base)) {
    throw new ForbiddenException("Invalid share path");
  }
  return shareDir;
}

/**
 * Resolve a single path segment (no separators, no "..") under the share directory.
 * Use for file UUIDs, fixed names like archive.zip, or "{uuid}.tmp-chunk" after validating the UUID part.
 */
export function resolvePathSegmentUnderShareDirectory(
  shareId: string,
  segment: string,
): string {
  const shareDir = resolveValidatedShareDirectory(shareId);
  if (
    !segment ||
    segment.includes("..") ||
    segment.includes(path.sep) ||
    segment.includes(path.win32.sep)
  ) {
    throw new BadRequestException("Invalid path segment");
  }
  const resolved = path.resolve(shareDir, segment);
  if (!isResolvedPathUnderRoot(resolved, shareDir)) {
    throw new ForbiddenException("Invalid file path");
  }
  return resolved;
}

/** Chunk temp file name for a validated UUID file id */
export function resolveChunkTempPath(shareId: string, fileId: string): string {
  assertSafeFileIdForStorage(fileId);
  return resolvePathSegmentUnderShareDirectory(
    shareId,
    `${fileId}.tmp-chunk`,
  );
}
