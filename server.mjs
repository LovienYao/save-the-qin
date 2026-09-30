import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const port = Number(process.env.PORT || 4173);
const root = join(process.cwd(), "dist");
const types = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".svg":"image/svg+xml" };

createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const relative = normalize(urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, ""));
    if (relative.startsWith("..")) throw new Error("invalid path");
    let file = join(root, relative);
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream", "Cache-Control":"no-store" });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type":"text/plain; charset=utf-8" });
    res.end("未找到页面");
  }
}).listen(port, "127.0.0.1", () => console.log(`大秦命运测试：http://localhost:${port}`));
