import { sha256 } from "../lib/access-code.mjs";
import { findAccessCodeBySessionHash, touchAccessCode } from "../lib/access-store.mjs";
import { isPublicTestSession } from "../lib/public-test-access.mjs";

function cookieValue(header = "", name) {
  for (const part of header.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }
  return "";
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ access: false });
  const token = cookieValue(req.headers.cookie, "qin_access");
  if (!token) return res.status(200).json({ access: false });
  if (isPublicTestSession(token)) return res.status(200).json({ access: true });
  try {
    const sessionHash = sha256(token);
    const record = await findAccessCodeBySessionHash(sessionHash);
    if (!record || record.status !== "used") {
      res.setHeader("Set-Cookie", "qin_access=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0");
      return res.status(200).json({ access: false });
    }
    await touchAccessCode(record.id, new Date().toISOString());
    return res.status(200).json({ access: true });
  } catch (error) {
    console.error("access-status", error);
    return res.status(500).json({ access: false, reason: "server" });
  }
}
