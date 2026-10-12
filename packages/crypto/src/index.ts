import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { env } from "@env-manager/env/server";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // GCM recommended IV length
const ENCODING = "base64";

/**
 * Encrypts a string using AES-256-GCM
 * @param text The plain text to encrypt
 * @returns Encrypted string in format: iv:authTag:ciphertext
 */
export function encrypt(text: string): string {
  const key = Buffer.from(env.ENCRYPTION_KEY, "hex");
  if (key.length !== 32) {
    throw new Error("Encryption key must be 32 bytes (64 hex characters)");
  }

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", ENCODING);
  encrypted += cipher.final(ENCODING);

  const authTag = cipher.getAuthTag().toString(ENCODING);

  return `${iv.toString(ENCODING)}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a string encrypted with the above encrypt function
 * @param encryptedText The encrypted text in format: iv:authTag:ciphertext
 * @returns Decrypted plain text
 */
export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format");
  }

  const [ivBase64, authTagBase64, ciphertextBase64] = parts;
  if (!ivBase64 || !authTagBase64 || !ciphertextBase64) {
    throw new Error("Invalid encrypted text parts");
  }

  const key = Buffer.from(env.ENCRYPTION_KEY, "hex");
  const iv = Buffer.from(ivBase64, ENCODING);
  const authTag = Buffer.from(authTagBase64, ENCODING);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertextBase64, ENCODING, "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
