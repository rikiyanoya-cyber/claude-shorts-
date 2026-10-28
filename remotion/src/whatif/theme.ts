import { continueRender, delayRender, staticFile } from "remotion";

export const W = 1920;
export const H = 1080;
export const VX = 656; // centre column for the 608x1080 vertical episode
export const VW = 608;

export const C = {
  bg: "#07080c",
  panel: "#0d0f16",
  line: "#262a36",
  gold: "#f2c94c",
  goldDim: "#8a7434",
  red: "#ff4a3a",
  redDeep: "#5a0f0b",
  blue: "#4aa0ff",
  text: "#ffffff",
  sub: "#9aa3b5",
};

export const F = { black: "WI-M9", bold: "WI-M8", semi: "WI-M6", mono: "WI-RM" };

const FONT_FILES: [string, string][] = [
  [F.black, "whatif/fonts/M9.ttf"],
  [F.bold, "whatif/fonts/M8.ttf"],
  [F.semi, "whatif/fonts/M6.ttf"],
  [F.mono, "whatif/fonts/RM7.ttf"],
];

let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  const handle = delayRender("whatif fonts");
  Promise.all(
    FONT_FILES.map(([family, file]) => {
      const face = new FontFace(family, `url(${staticFile(file)})`);
      return face.load().then((f) => document.fonts.add(f));
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};

export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const ease = (u: number) => {
  const x = clamp(u);
  return x * x * (3 - 2 * x);
};
export const ramp = (t: number, a: number, b: number) => ease((t - a) / (b - a));
