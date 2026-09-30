const TABLE = "access_codes";

export function getSupabaseConfig(env = process.env) {
  const rawUrl = env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const url = rawUrl?.replace(/\/rest\/v1(?:\/.*)?$/, "");
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("缺少 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY");
  return { url, key };
}

export async function supabaseRequest(path, options = {}, env = process.env) {
  const { url, key } = getSupabaseConfig(env);
  const response = await fetch(`${url}/rest/v1/${TABLE}${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...options.headers
    }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${text}`);
  return data;
}

export async function findCodeByHash(codeHash, fields = "id,status", env) {
  const rows = await supabaseRequest(`?select=${fields}&code_hash=eq.${encodeURIComponent(codeHash)}&limit=1`, {}, env);
  return rows[0] || null;
}

export async function setCodeState(codeHash, state, env) {
  const rows = await supabaseRequest(`?code_hash=eq.${encodeURIComponent(codeHash)}&select=id`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(state)
  }, env);
  return rows.length > 0;
}
