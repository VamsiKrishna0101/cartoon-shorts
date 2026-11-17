// node render.mjs <story> <outDir> "<frames>"   frames: "0-899" or "10,50,90"
import { chromium } from "playwright";
import http from "http"; import fs from "fs"; import path from "path";
const [story, outDir, spec = "0"] = process.argv.slice(2);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "web");
const types = { ".js": "text/javascript", ".html": "text/html", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg" };
const srv = http.createServer((q, r) => {
  const p = path.join(root, decodeURIComponent(q.url.split("?")[0]));
  fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "content-type": types[path.extname(p)] || "application/octet-stream" }); r.end(d); } });
}).listen(0);
const port = srv.address().port;
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") console.log("[page]", m.text()); });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto(`http://127.0.0.1:${port}/index.html?story=${story}`);
await page.waitForFunction("window.ready === true", null, { timeout: 120000 });
const total = await page.evaluate("window.FRAMES");
let frames = [];
for (const part of spec.split(",")) { if (part.includes("-")) { let [a, b] = part.split("-"); a = Number(a); b = b === "" ? total - 1 : Number(b); for (let f = a; f <= b; f++) frames.push(f); } else frames.push(Number(part)); }
const t0 = Date.now(); let n = 0;
for (const f of frames) {
  const file = path.join(outDir, `f${String(f).padStart(4, "0")}.jpg`);
  if (process.env.RESUME && fs.existsSync(file)) continue;
  const url = await page.evaluate((f) => { window.renderFrame(f); return document.querySelector("canvas").toDataURL("image/jpeg", 0.95); }, f);
  fs.writeFileSync(file, Buffer.from(url.split(",")[1], "base64"));
  n++; if (n % 10 === 0 || n === frames.length) console.log(`frame ${f} (${n}/${frames.length}) ${((Date.now() - t0) / n / 1000).toFixed(2)} s/frame`);
}
await browser.close(); srv.close();
console.log("done", total, "frames total");
