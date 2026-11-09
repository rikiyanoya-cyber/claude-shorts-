// node samurai_render.mjs <outDir> [Id] [fileStem]   e.g. SamuraiOnce SamuraiStillness_ep06_once  -> <stem>_silent.mp4 (no audio) + <stem-ep>_cover.jpg
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import path from "path"; import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url)); const out = process.argv[2] || ".";
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({ entryPoint: path.join(__dirname, "src", "index.ts") });
const ID = process.argv[3] || "SamuraiHug", STEM = process.argv[4] || "SamuraiStillness_ep05_hug", COVER = STEM.split("_").slice(0, 2).join("_") + "_cover.jpg";
const comp = await selectComposition({ serveUrl, id: ID, inputProps: {}, browserExecutable });
const cov = await selectComposition({ serveUrl, id: ID + "Cover", inputProps: {}, browserExecutable });
await renderStill({ serveUrl, composition: cov, frame: 0, output: path.join(out, COVER), imageFormat: "jpeg", jpegQuality: 92, browserExecutable });
await renderMedia({ serveUrl, composition: comp, codec: "h264", crf: 18, muted: true, outputLocation: path.join(out, STEM + "_silent.mp4"), browserExecutable, concurrency: 4 });
console.log("done");
