import { access, readFile, readdir } from "node:fs/promises";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const outputDirectory = resolve("dist");
const requiredFiles = ["index.html", "style.css", "app.js"];

for (const file of requiredFiles) {
  await access(join(outputDirectory, file));
}
for (const serverFile of ["api/redeem-code.js", "api/access-status.js", "lib/access-code.mjs", "lib/supabase-admin.mjs"]) {
  await access(resolve(serverFile));
  await import(`${pathToFileURL(resolve(serverFile)).href}?build-check=${Date.now()}`);
}

const files = [];
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collect(path);
    else files.push(path);
  }
}
await collect(outputDirectory);

const sources = new Map();
for (const file of files) {
  if ([".html", ".css", ".js"].includes(extname(file))) {
    sources.set(file, await readFile(file, "utf8"));
  }
}

for (const [file, source] of sources) {
  if (/\b(?:localhost|127\.0\.0\.1)\b/i.test(source)) {
    throw new Error(`生产文件包含本地地址：${file}`);
  }
}

const imports = /(?:import|export)\s+(?:[^"']*?\s+from\s+)?["'](\.[^"']+)["']/g;
for (const [file, source] of sources) {
  if (extname(file) !== ".js") continue;
  for (const match of source.matchAll(imports)) {
    const target = normalize(join(dirname(file), match[1]));
    if (!target.startsWith(outputDirectory)) {
      throw new Error(`模块路径越出输出目录：${match[1]} (${file})`);
    }
    await access(target);
  }
}

const html = sources.get(join(outputDirectory, "index.html"));
for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
  const reference = match[1];
  if (reference.startsWith("data:") || reference.startsWith("#")) continue;
  if (/^(?:https?:)?\/\//.test(reference) || reference.startsWith("/")) {
    throw new Error(`首页包含非相对静态资源路径：${reference}`);
  }
  await access(join(outputDirectory, reference));
}

console.log(`正式构建检查通过：dist 中共 ${files.length} 个静态文件，可直接部署。`);
