// Render a long composition in parts from ONE bundle (a 12-minute single pass crashed the page),
// with a slim public dir (fonts + this episode's assets only). Then join the parts and add the narration with ffmpeg.
// usage: COMP=McdEpisode PUB=.pub_ep node render_episode.mjs <outDir> [partFrames]
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path"; import fs from "fs"; import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = process.argv[2], step = Number(process.argv[3] || 3600), browserExecutable = process.env.REMOTION_BROWSER || null;
fs.mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(__dirname, "src", "index.ts"), publicDir: path.join(__dirname, process.env.PUB || "public") });
const composition = await selectComposition({ serveUrl, id: process.env.COMP || "McdEpisode", inputProps: {}, browserExecutable });
const N = composition.durationInFrames; const list = [];
for (let a = 0, i = 0; a < N; a += step, i++) {
  const f = path.join(out, `part${String(i).padStart(2, "0")}.mp4`); list.push(`file '${f}'`);
  if (fs.existsSync(f) && fs.statSync(f).size > 0) { console.log("skip", i); continue; }
  await renderMedia({ serveUrl, composition, codec: "h264", crf: 20, muted: true, outputLocation: f, browserExecutable, concurrency: Number(process.env.CONC || 3), frameRange: [a, Math.min(a + step - 1, N - 1)] });
  console.log("part", i, "done", a);
}
fs.writeFileSync(path.join(out, "list.txt"), list.join("\n") + "\n");
fs.rmSync(serveUrl, { recursive: true, force: true });
console.log("ALL PARTS DONE");
