import assert from "node:assert/strict";
import redeem from "../api/redeem-code.js";
import accessStatus from "../api/access-status.js";
import { generateAccessCode, isValidAccessCode, normalizeAccessCode, sha256 } from "../lib/access-code.mjs";
import { getSupabaseConfig } from "../lib/supabase-admin.mjs";
import { changeAccessCode } from "./manage-access-code.mjs";

process.env.SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role";

function response() {
  return { statusCode: 200, headers: {}, body: null,
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; }
  };
}
function request(method, body, cookie = "") { return { method, body, headers: { cookie } }; }
function installDb(initial = {}) {
  const db = new Map(Object.entries(initial));
  global.fetch = async (url, options = {}) => {
    const parsed = new URL(url), codeHash = parsed.searchParams.get("code_hash")?.replace(/^eq\./, ""), sessionHash = parsed.searchParams.get("session_hash")?.replace(/^eq\./, "");
    let rows = [...db.values()].filter(row => !codeHash || row.code_hash === codeHash).filter(row => !sessionHash || row.session_hash === sessionHash);
    if ((options.method || "GET") === "PATCH") {
      const statusFilter = parsed.searchParams.get("status")?.replace(/^eq\./, ""), idFilter = parsed.searchParams.get("id")?.replace(/^eq\./, "");
      rows = rows.filter(row => !statusFilter || row.status === statusFilter).filter(row => !idFilter || row.id === idFilter);
      const change = JSON.parse(options.body);
      rows.forEach(row => Object.assign(row, change));
      return new Response(options.headers?.Prefer === "return=minimal" ? "" : JSON.stringify(rows.map(({ id }) => ({ id }))), { status: 200 });
    }
    return new Response(JSON.stringify(rows), { status: 200 });
  };
  return db;
}

assert.equal(normalizeAccessCode(" qin7k3m92af "), "QIN-7K3M-92AF");
assert.equal(
  getSupabaseConfig({ SUPABASE_URL: "https://example.supabase.co/rest/v1", SUPABASE_SERVICE_ROLE_KEY: "test" }).url,
  "https://example.supabase.co"
);
for (let i = 0; i < 1000; i++) assert.ok(isValidAccessCode(generateAccessCode()));

let res = response(); await accessStatus(request("GET"), res); assert.deepEqual(res.body, { access: false });
res = response(); await redeem(request("POST", { code: "wrong" }), res); assert.equal(res.body.reason, "invalid");

const unusedCode = "QIN-7K3M-92AF", unusedHash = sha256(unusedCode);
const db = installDb({ one: { id: "one", code_hash: unusedHash, status: "unused", session_hash: null } });
res = response(); await redeem(request("POST", { code: unusedCode }), res); assert.equal(res.body.success, true); assert.match(res.headers["Set-Cookie"], /^qin_access=.*HttpOnly; Secure;/);
const token = res.headers["Set-Cookie"].match(/^qin_access=([^;]+)/)[1];
res = response(); await accessStatus(request("GET", null, `qin_access=${token}`), res); assert.equal(res.body.access, true);

db.get("one").status = "used"; res = response(); await redeem(request("POST", { code: unusedCode }), res); assert.equal(res.body.reason, "used");
db.get("one").status = "disabled"; res = response(); await redeem(request("POST", { code: unusedCode }), res); assert.equal(res.body.reason, "disabled");

db.get("one").status = "unused"; db.get("one").session_hash = null;
const first = response(), second = response(); await Promise.all([redeem(request("POST", { code: unusedCode }), first), redeem(request("POST", { code: unusedCode }), second)]);
assert.deepEqual([first.body.success, second.body.success].sort(), [false, true]);
assert.ok([first.body.reason, second.body.reason].includes("used"));

db.get("one").status = "used"; db.get("one").session_hash = sha256("old-session");
await changeAccessCode("reset", unusedCode); assert.equal(db.get("one").status, "unused"); assert.equal(db.get("one").session_hash, null);
res = response(); await accessStatus(request("GET", null, "qin_access=old-session"), res); assert.equal(res.body.access, false);
await changeAccessCode("disable", unusedCode); assert.equal(db.get("one").status, "disabled");
await changeAccessCode("enable", unusedCode); assert.equal(db.get("one").status, "unused"); assert.equal(db.get("one").session_hash, null);

console.log("通过：兑换码格式、无Cookie、invalid、unused激活、Cookie复验、used、disabled、并发单次激活及reset/disable/enable。");
