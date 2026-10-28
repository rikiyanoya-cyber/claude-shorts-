#!/usr/bin/env node
/**
 * Render the AltPathLong composition (or a slice of it).
 *
 *   node whatif/render.mjs out.mp4                # full video
 *   node whatif/render.mjs out.mp4 1800 2400      # frame range
 *   node whatif/render.mjs --stills dir 120 900 2400   # still frames (jpg) for checks
 *
 * Set REMOTION_BROWSER to a Chrome/Chromium headless shell if Remotion can't download one.
 */
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER || null;

const serveUrl = await bundle({ entryPoint: path.join(__dirname, "..", "src", "index.ts") });
const composition = await selectComposition({ serveUrl, id: "AltPathLong", inputProps: {}, browserExecutable });

if (args[0] === "--stills") {
  const dir = args[1];
  fs.mkdirSync(dir, { recursive: true });
  for (const f of args.slice(2).map(Number)) {
    await renderStill({ serveUrl, composition, frame: f, output: path.join(dir, `${f}.jpg`), imageFormat: "jpeg", jpegQuality: 85, browserExecutable });
    console.log("still", f);
  }
} else {
  const out = args[0] || "whatif.mp4";
  const frameRange = args[1] ? [Number(args[1]), Number(args[2] ?? composition.durationInFrames - 1)] : null;
  let last = -1;
  await renderMedia({
    serveUrl,
    composition,
    codec: "h264",
    crf: 18,
    outputLocation: out,
    frameRange,
    browserExecutable,
    concurrency: Number(process.env.CONCURRENCY || 4),
    onProgress: ({ progress }) => {
      const p = Math.floor(progress * 20);
      if (p !== last) {
        last = p;
        console.log(`render ${Math.round(progress * 100)}%`);
      }
    },
  });
  console.log("done", out);
}
