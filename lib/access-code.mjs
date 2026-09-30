import { createHash, randomBytes } from "node:crypto";

export const CODE_PATTERN = /^QIN-[A-HJ-KM-NP-Z2-9]{4}-[A-HJ-KM-NP-Z2-9]{4}$/;
export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function normalizeAccessCode(value = "") {
  const compact = String(value).trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = compact.startsWith("QIN") ? compact.slice(3) : compact;
  return body.length === 8 ? `QIN-${body.slice(0, 4)}-${body.slice(4)}` : String(value).trim().toUpperCase();
}

export function isValidAccessCode(code) {
  return CODE_PATTERN.test(normalizeAccessCode(code));
}

export function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function generateAccessCode() {
  const bytes = randomBytes(8);
  let body = "";
  for (const byte of bytes) body += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  return `QIN-${body.slice(0, 4)}-${body.slice(4)}`;
}

export function generateSessionToken() {
  return randomBytes(32).toString("base64url");
}
