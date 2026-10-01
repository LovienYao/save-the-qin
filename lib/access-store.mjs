import { findCodeByHash, supabaseRequest } from "./supabase-admin.mjs";
import {
  activateCloudBaseCode,
  findCloudBaseCodeByHash,
  findCloudBaseCodeBySessionHash,
  updateCloudBaseCodeById
} from "./cloudbase-admin.mjs";

function useCloudBase(env = process.env) {
  return Boolean(env.CLOUDBASE_APIKEY && (env.CLOUDBASE_ENV_ID || env.TCB_ENV));
}

export async function findAccessCodeByHash(codeHash, fields = "id,status") {
  if (useCloudBase()) return findCloudBaseCodeByHash(codeHash, fields);
  return findCodeByHash(codeHash, fields);
}

export async function activateAccessCode(codeHash, state) {
  if (useCloudBase()) return activateCloudBaseCode(codeHash, state);
  return supabaseRequest(`?code_hash=eq.${encodeURIComponent(codeHash)}&status=eq.unused&select=id`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(state)
  });
}

export async function findAccessCodeBySessionHash(sessionHash) {
  if (useCloudBase()) return findCloudBaseCodeBySessionHash(sessionHash);
  const rows = await supabaseRequest(`?select=id,status&session_hash=eq.${encodeURIComponent(sessionHash)}&limit=1`);
  return rows[0] || null;
}

export async function touchAccessCode(id, lastVerifiedAt) {
  if (useCloudBase()) return updateCloudBaseCodeById(id, { last_verified_at: lastVerifiedAt });
  return supabaseRequest(`?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ last_verified_at: lastVerifiedAt })
  });
}

