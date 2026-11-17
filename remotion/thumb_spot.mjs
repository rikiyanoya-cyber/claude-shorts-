// render the Spotlight thumbnails: node thumb_spot.mjs <outDir> A B C
import { bundle } from "@remotion/bundler"; import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path"; import fs from "fs"; import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url)); const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({ entryPoint: path.join(__dirname, "src", "index.ts"), publicDir: path.join(__dirname, ".pub_spot") });
for (const v of process.argv.slice(3)) {
  const composition = await selectComposition({ serveUrl, id: "SpotThumb", inputProps: { v }, browserExecutable });
  await renderStill({ serveUrl, composition, frame: 0, output: path.join(out, `thumb_${v}.png`), inputProps: { v }, browserExecutable });
}
fs.rmSync(serveUrl, { recursive: true, force: true }); console.log("OK");
