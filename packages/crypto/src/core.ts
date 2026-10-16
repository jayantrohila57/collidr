import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // GCM recommended IV length
const AUTH_TAG_LENGTH = 16;
const ENCODING = "base64";

function toKey(hexKey: string): Buffer {
  const key = Buffer.from(hexKey, "hex");
  if (key.length !== 32) {
    throw new Error("Encryption key must be 32 bytes (64 hex characters)");
  }
  return key;
}

/** Encrypts with AES-256-GCM. Output format: iv:authTag:ciphertext */
export function encryptWithKey(text: string, hexKey: string): string {
  const key = toKey(hexKey);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", ENCODING);
  encrypted += cipher.final(ENCODING);

  const authTag = cipher.getAuthTag().toString(ENCODING);
  return `${iv.toString(ENCODING)}:${authTag}:${encrypted}`;
}

/**
 * Decrypts iv:authTag:ciphertext. An empty ciphertext is valid (empty
 * plaintext encrypts to `iv:tag:`); the auth tag is still verified, so a
 * tampered or truncated value still throws.
 */
export function decryptWithKey(encryptedText: string, hexKey: string): string {
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format");
  }

  const [ivBase64, authTagBase64, ciphertextBase64 = ""] = parts;
  if (!ivBase64 || !authTagBase64) {
    throw new Error("Invalid encrypted text parts");
  }

  const iv = Buffer.from(ivBase64, ENCODING);
  const authTag = Buffer.from(authTagBase64, ENCODING);
  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error("Invalid encrypted text parts");
  }

  const decipher = createDecipheriv(ALGORITHM, toKey(hexKey), iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertextBase64, ENCODING, "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
