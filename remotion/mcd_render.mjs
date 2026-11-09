// node mcd_render.mjs out.mp4 [from to]  |  node mcd_render.mjs --stills dir 30 300 ...   (COMP=McdEpisode, AUDIO=1, CONC=n)
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import path from "path"; import fs from "fs"; import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url)); const args = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({ entryPoint: path.join(__dirname, "src", "index.ts") });
const composition = await selectComposition({ serveUrl, id: process.env.COMP || "McdOpening", inputProps: {}, browserExecutable });
if (args[0] === "--stills") { fs.mkdirSync(args[1], { recursive: true });
  for (const f of args.slice(2).map(Number)) await renderStill({ serveUrl, composition, frame: f, output: path.join(args[1], `${f}.jpg`), imageFormat: "jpeg", jpegQuality: 85, browserExecutable });
} else {
  // optional frame range (long episodes are rendered in parts and joined: a 12-minute single pass crashed the page)
  const frameRange = args[1] ? [Number(args[1]), Math.min(Number(args[2]), composition.durationInFrames - 1)] : null;
  await renderMedia({ serveUrl, composition, codec: "h264", crf: 18, muted: !process.env.AUDIO, outputLocation: args[0], browserExecutable,
    concurrency: Number(process.env.CONC || 4), frameRange, chromiumOptions: { gl: "swangle" } });
}
console.log("done");
