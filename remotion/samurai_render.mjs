// node samurai_render.mjs <outDir>   -> SamuraiStillness_ep05_hug.mp4 (no audio), cover JPG, check stills
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import path from "path"; import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url)); const out = process.argv[2] || ".";
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({ entryPoint: path.join(__dirname, "src", "index.ts") });
const comp = await selectComposition({ serveUrl, id: "SamuraiHug", inputProps: {}, browserExecutable });
const cov = await selectComposition({ serveUrl, id: "SamuraiHugCover", inputProps: {}, browserExecutable });
await renderStill({ serveUrl, composition: cov, frame: 0, output: path.join(out, "SamuraiStillness_ep05_cover.jpg"), imageFormat: "jpeg", jpegQuality: 92, browserExecutable });
await renderMedia({ serveUrl, composition: comp, codec: "h264", crf: 18, muted: true, outputLocation: path.join(out, "SamuraiStillness_ep05_hug_silent.mp4"), browserExecutable, concurrency: 4 });
console.log("done");
