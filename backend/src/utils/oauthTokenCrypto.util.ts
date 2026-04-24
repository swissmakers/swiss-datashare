import * as crypto from "crypto";

const CIPHER_PREFIX = "enc:v1:";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function getKeyBuffer(encKeyBase64: string): Buffer | null {
  if (!encKeyBase64?.trim()) return null;
  try {
    const key = Buffer.from(encKeyBase64, "base64");
    return key.length === KEY_LENGTH ? key : null;
  } catch {
    return null;
  }
}

/**
 * AES-256-GCM encrypt. Output is prefixed for versioning and legacy detection.
 */
export function encryptOauthIdTokenAtRest(
  plaintext: string,
  encKeyBase64: string,
): string {
  const key = getKeyBuffer(encKeyBase64);
  if (!key) {
    throw new Error("Invalid OAuth token encryption key (expect 32-byte key as base64)");
  }
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  const payload = Buffer.concat([iv, authTag, ciphertext]).toString("base64");
  return `${CIPHER_PREFIX}${payload}`;
}

/**
 * Decrypts values written by {@link encryptOauthIdTokenAtRest}; returns input unchanged if not encrypted (legacy DB rows).
 */
export function decryptOauthIdTokenAtRest(
  stored: string,
  encKeyBase64: string,
): string {
  if (!stored.startsWith(CIPHER_PREFIX)) {
    return stored;
  }
  const key = getKeyBuffer(encKeyBase64);
  if (!key) {
    throw new Error(
      "Encrypted OAuth token present but internal.oauthTokenEncryptionKey is missing or invalid",
    );
  }
  const b64 = stored.slice(CIPHER_PREFIX.length);
  const raw = Buffer.from(b64, "base64");
  if (raw.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
    throw new Error("Corrupt encrypted OAuth token payload");
  }
  const iv = raw.subarray(0, IV_LENGTH);
  const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString(
    "utf8",
  );
}
