import { isValidAccessCode, normalizeAccessCode, sha256 } from "../lib/access-code.mjs";
import { findCodeByHash, setCodeState } from "../lib/supabase-admin.mjs";

export async function changeAccessCode(command, input, env = process.env) {
  const code = normalizeAccessCode(input);
  if (!isValidAccessCode(code)) throw new Error("兑换码格式无效，应为 QIN-XXXX-XXXX");
  const hash = sha256(code);
  const record = await findCodeByHash(hash, "id,status", env);
  if (!record) throw new Error("未找到该兑换码");
  const states = {
    reset: { status: "unused", activated_at: null, session_hash: null, last_verified_at: null },
    disable: { status: "disabled" },
    enable: { status: "unused", activated_at: null, session_hash: null, last_verified_at: null }
  };
  if (!states[command]) throw new Error("未知管理操作");
  if (!await setCodeState(hash, states[command], env)) throw new Error("兑换码更新失败");
  return command;
}
