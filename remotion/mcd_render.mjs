// node mcd_render.mjs out.mp4  |  node mcd_render.mjs --stills dir 30 300 ...
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import path from "path"; import fs from "fs"; import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url)); const args = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({ entryPoint: path.join(__dirname, "src", "index.ts") });
const composition = await selectComposition({ serveUrl, id: "McdOpening", inputProps: {}, browserExecutable });
if (args[0] === "--stills") { fs.mkdirSync(args[1], { recursive: true });
  for (const f of args.slice(2).map(Number)) await renderStill({ serveUrl, composition, frame: f, output: path.join(args[1], `${f}.jpg`), imageFormat: "jpeg", jpegQuality: 85, browserExecutable });
} else await renderMedia({ serveUrl, composition, codec: "h264", crf: 18, muted: true, outputLocation: args[0], browserExecutable, concurrency: 4 });
console.log("done");
