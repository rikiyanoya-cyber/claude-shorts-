// render check stills of a composition from one bundle: COMP=McdEpisode PUB=.pub_ep node stills_ep.mjs <outDir> frame...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path"; import fs from "fs"; import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const [out, ...frames] = process.argv.slice(2), browserExecutable = process.env.REMOTION_BROWSER || null;
fs.mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(__dirname, "src", "index.ts"), publicDir: path.join(__dirname, process.env.PUB || "public") });
const composition = await selectComposition({ serveUrl, id: process.env.COMP || "McdEpisode", inputProps: {}, browserExecutable });
for (const f of frames) await renderStill({ serveUrl, composition, frame: +f, output: path.join(out, `s${f}.jpg`), imageFormat: "jpeg", scale: 0.5, browserExecutable });
fs.rmSync(serveUrl, { recursive: true, force: true });
console.log("ok");
