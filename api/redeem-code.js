import { generateSessionToken, isValidAccessCode, normalizeAccessCode, sha256 } from "../lib/access-code.mjs";
import { findCodeByHash, supabaseRequest } from "../lib/supabase-admin.mjs";

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ success: false, reason: "method" });
  try {
    const { code: input } = await readBody(req);
    const code = normalizeAccessCode(input);
    if (!isValidAccessCode(code)) return res.status(400).json({ success: false, reason: "invalid" });
    const codeHash = sha256(code);
    const record = await findCodeByHash(codeHash);
    if (!record) return res.status(404).json({ success: false, reason: "invalid" });
    if (record.status === "disabled") return res.status(403).json({ success: false, reason: "disabled" });
    if (record.status === "used") return res.status(409).json({ success: false, reason: "used" });

    const token = generateSessionToken();
    const now = new Date().toISOString();
    const sessionHash = sha256(token);
    const rows = await supabaseRequest(`?code_hash=eq.${encodeURIComponent(codeHash)}&status=eq.unused&select=id`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ status: "used", activated_at: now, session_hash: sessionHash, last_verified_at: now })
    });
    if (rows.length !== 1) {
      const latest = await findCodeByHash(codeHash, "id,status,session_hash");
      if (latest?.session_hash !== sessionHash) {
        return res.status(409).json({ success: false, reason: latest?.status === "disabled" ? "disabled" : "used" });
      }
    }
    res.setHeader("Set-Cookie", `qin_access=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=31536000`);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("redeem-code", error);
    return res.status(500).json({ success: false, reason: "server" });
  }
}
