import { access, mkdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { generateAccessCode, sha256 } from "../lib/access-code.mjs";

const count = Number(process.argv[2]);
if (!Number.isInteger(count) || count < 1 || count > 100000) {
  throw new Error("用法：npm run generate:codes -- 500（数量需为1~100000）");
}
await mkdir("private", { recursive: true });
const plaintextPath = "private/access-codes-plaintext.csv";
const importPath = "private/access-codes-import.csv";
for (const path of [plaintextPath, importPath]) {
  try { await access(path, constants.F_OK); throw new Error(`${path} 已存在，请先另行保存，避免覆盖发码记录。`); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
}
const codes = new Set();
while (codes.size < count) codes.add(generateAccessCode());
const width = Math.max(3, String(count).length);
const plain = ["number,code,sold,order_note", ...[...codes].map((code, i) => `${String(i + 1).padStart(width, "0")},${code},false,`)];
const hashed = ["code_hash,status,note", ...[...codes].map(code => `${sha256(code)},unused,`)];
await writeFile(plaintextPath, `\ufeff${plain.join("\r\n")}\r\n`, "utf8");
await writeFile(importPath, `${hashed.join("\r\n")}\r\n`, "utf8");
console.log(`已生成 ${count} 个兑换码：\n- ${plaintextPath}\n- ${importPath}`);
