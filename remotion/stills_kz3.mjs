// render check stills at given seconds from one bundle: node stills_kz3.mjs outDir t1 t2 ...
import { bundle } from "@remotion/bundler"; import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path"; import fs from "fs"; import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url)); const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({ entryPoint: path.join(__dirname, "src", "index.ts"), publicDir: path.join(__dirname, ".pub_kz3") });
const composition = await selectComposition({ serveUrl, id: "NintendoEpisode", inputProps: {}, browserExecutable });
for (const t of process.argv.slice(3)) { const f = Math.round(parseFloat(t) * 30);
  await renderStill({ serveUrl, composition, frame: f, output: path.join(out, `s${String(f).padStart(6, "0")}.jpg`), imageFormat: "jpeg", jpegQuality: 70, scale: .5, browserExecutable }); }
fs.rmSync(serveUrl, { recursive: true, force: true }); console.log("OK");
