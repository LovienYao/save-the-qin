import cloudbaseSDK from "@cloudbase/node-sdk";

const TABLE = "access_codes";
let database;

function getDatabase(env = process.env) {
  if (database) return database;
  const envId = env.CLOUDBASE_ENV_ID || env.TCB_ENV;
  const accessKey = env.CLOUDBASE_APIKEY;
  if (!envId || !accessKey) throw new Error("缺少 CLOUDBASE_ENV_ID 或 CLOUDBASE_APIKEY");
  const app = cloudbaseSDK.init({ env: envId, accessKey });
  database = app.rdb();
  return database;
}

function unwrap(result) {
  if (result?.error) throw new Error(`CloudBase PostgreSQL: ${result.error.message || JSON.stringify(result.error)}`);
  return result?.data ?? [];
}

export async function findCloudBaseCodeByHash(codeHash, fields = "id,status") {
  const result = await getDatabase().from(TABLE).select(fields).eq("code_hash", codeHash).limit(1);
  return unwrap(result)[0] || null;
}

export async function findCloudBaseCodeBySessionHash(sessionHash, fields = "id,status") {
  const result = await getDatabase().from(TABLE).select(fields).eq("session_hash", sessionHash).limit(1);
  return unwrap(result)[0] || null;
}

export async function activateCloudBaseCode(codeHash, state) {
  const result = await getDatabase().from(TABLE).update(state)
    .eq("code_hash", codeHash).eq("status", "unused").select("id");
  return unwrap(result);
}

export async function updateCloudBaseCodeById(id, state) {
  const result = await getDatabase().from(TABLE).update(state).eq("id", id);
  unwrap(result);
}

