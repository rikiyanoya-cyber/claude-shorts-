// The Invisible Audience ep2 "Money and happiness" (English, 1920x1080, 30 fps). 3D stills from Flow + Pollo clips.
// Rules (scripts/ia/RULES_ja.md): a picture change every 2-5 s, every still moves (10-20 % push, eased, direction
// alternates), tight framing for phones (characters about 70 % of the frame height), only key words on screen
// (no running captions), effects 1-3 a minute, -14 LUFS. Timings: ia2_sentences.json (= the narration).
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, delayRender, continueRender } from "remotion";
import SENT from "./ia2_sentences.json";

const FPS = 30, F = "IAF", GOLD = "#F2C46B";
const S = SENT as [number, number, number, string][];
export const at = (i: number) => S[i - 1][1];
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.bezier(.42, 0, .25, 1);
const fin = (u: number, a: number, d = .35) => interpolate(u, [a, a + d], [0, 1], { ...cl, easing: ease });
const fout = (u: number, b: number, d = .35) => 1 - fin(u, b - d, d);
const src = (n: string) => staticFile(`ia/${n}`);

const useFont = () => {
  const [h] = React.useState(() => delayRender("font"));
  React.useEffect(() => { new FontFace(F, `url(${staticFile("fonts/Montserrat.ttf")})`, { weight: "100 900" }).load().then((x) => { document.fonts.add(x); continueRender(h); }).catch(() => continueRender(h)); }, [h]);
};

// ---------- building blocks ----------
type KB = { z?: [number, number]; o?: [number, number]; dx?: number };   // push from z0 to z1 around origin o (in %), drift dx px
// o = the focus point (in % of the picture); it is brought toward the frame centre as far as the zoom allows (no edges show)
const kbStyle = (k: number, kb: KB = {}) => {
  const [z0, z1] = kb.z ?? [1.0, 1.12], [ox, oy] = kb.o ?? [50, 50], e = ease(Math.min(1, Math.max(0, k))), z = z0 + (z1 - z0) * e;
  const lim = (v: number, m: number) => Math.max(-m, Math.min(m, v));
  const tx = lim(-(ox / 100 - .5) * 1920 * z, (z - 1) * 960) + (kb.dx ?? 0) * e, ty = lim(-(oy / 100 - .5) * 1080 * z, (z - 1) * 540);
  return { transform: `translate(${tx}px, ${ty}px) scale(${z})`, transformOrigin: "50% 50%" };
};
// a full-frame still (sets, props, symbols)
const Still: React.FC<{ n: string; k: number; kb?: KB; dim?: number }> = ({ n, k, kb, dim = 0 }) => (
  <AbsoluteFill style={kbStyle(k, kb)}><Img src={src(n)} style={{ width: 1920, height: 1080, objectFit: "cover", filter: `brightness(${1 - dim}) contrast(1.04)` }} /></AbsoluteFill>
);
// a Pollo clip, muted, played from `from` at `rate`, optionally mirrored
const Clip: React.FC<{ n: string; k: number; from?: number; rate?: number; kb?: KB; flip?: boolean }> = ({ n, k, from = 0, rate = 1, kb, flip }) => (
  <AbsoluteFill style={kbStyle(k, kb)}><OffthreadVideo src={src(n)} muted startFrom={Math.round(from * FPS)} playbackRate={rate} style={{ width: 1920, height: 1080, objectFit: "cover", transform: flip ? "scaleX(-1)" : undefined }} /></AbsoluteFill>
);
// a cut-out character standing on the floor of whatever is behind it; h = height in px, (x, y) = feet centre
const Char: React.FC<{ n: string; u: number; h: number; x?: number; y?: number; flip?: boolean; slide?: number; breathe?: boolean }> = ({ n, u, h, x = 960, y = 1040, flip, slide = 0, breathe = true }) => {
  const o = fin(u, 0, .4), sy = breathe ? 1 + .012 * Math.sin(u * 2.1) : 1;
  return <>
    <div style={{ position: "absolute", left: x - h * .28, top: y - h * .035, width: h * .56, height: h * .07, borderRadius: "50%", background: "rgba(0,0,0,.45)", filter: "blur(14px)", opacity: o }} />
    <Img src={src(`${n}.png`)} style={{ position: "absolute", left: x, top: y, height: h, transform: `translate(-50%,-100%) translateX(${slide * (1 - ease(Math.min(1, u / .7)))}px) scaleX(${flip ? -1 : 1}) scaleY(${sy})`, transformOrigin: "50% 100%", opacity: o, filter: "drop-shadow(0 0 22px rgba(255,236,200,.12))" }} />
  </>;
};
// the plain navy studio for character-only shots (same look as the sets)
const Studio: React.FC<{ warm?: boolean }> = ({ warm }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 42%, ${warm ? "#2a2f52" : "#1a2d5e"} 0%, #0c1b44 48%, #050b22 100%)` }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 96%, rgba(242,180,90,.18) 0%, rgba(242,180,90,0) 45%)" }} />
  </AbsoluteFill>
);
// big words: white heavy type with a gold accent, top half, a soft dark band behind for phones
const Words: React.FC<{ u: number; a?: number; b: number; children: React.ReactNode; size?: number; y?: number; sub?: string }> = ({ u, a = .1, b, children, size = 150, y = 230, sub }) => {
  const o = fin(u, a, .3) * fout(u, b, .3);
  return <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", opacity: o, transform: `translateY(${(1 - fin(u, a, .4)) * 24}px) scale(${1.04 - .04 * fin(u, a, .5)})` }}>
    <div style={{ display: "inline-block", fontFamily: F, fontWeight: 900, fontSize: size, lineHeight: 1.02, color: "#fff", letterSpacing: 2, textShadow: "0 6px 30px rgba(0,0,0,.75), 0 0 2px rgba(0,0,0,.6)" }}>{children}</div>
    {sub && <div style={{ fontFamily: F, fontWeight: 700, fontSize: 46, color: "#dfe6ff", marginTop: 16, letterSpacing: 3, textShadow: "0 3px 16px rgba(0,0,0,.8)" }}>{sub}</div>}
  </div>;
};
const G: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: GOLD }}>{children}</span>;
const Count: React.FC<{ u: number; a: number; to: number; pre?: string; suf?: string; d?: number }> = ({ u, a, to, pre = "", suf = "", d = .9 }) => {
  const v = Math.round(to * ease(Math.min(1, Math.max(0, (u - a) / d))));
  return <>{pre}{v.toLocaleString("en-US")}{suf}</>;
};
// study card, bottom-left, ~4 s
const Study: React.FC<{ u: number; a: number; d?: number; text: string; sub?: string }> = ({ u, a, d = 4, text, sub }) => {
  const o = fin(u, a, .4) * fout(u, a + d, .4);
  return <div style={{ position: "absolute", left: 70, bottom: 70, opacity: o, fontFamily: F, background: "rgba(8,14,40,.78)", borderLeft: `5px solid ${GOLD}`, borderRadius: 10, padding: "14px 24px" }}>
    <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: 4, color: GOLD }}>STUDY</div>
    <div style={{ fontWeight: 800, fontSize: 32, color: "#fff", marginTop: 2 }}>{text}</div>
    {sub && <div style={{ fontWeight: 600, fontSize: 24, color: "#b9c4e6", marginTop: 2 }}>{sub}</div>}
  </div>;
};

// ---------- the shot list (first half: 0:00-2:24) ----------
type Shot = { a: number; b?: number; r: (u: number, d: number) => React.ReactNode; video?: boolean; fadeIn?: number; fadeOut?: number };
const SH: Shot[] = [
  // hook: the $75,000 claim
  { a: 0, video: true, r: (u, d) => <Clip n="M1.mp4" k={u / d} kb={{ z: [1.35, 1.45], o: [50, 62] }} /> },
  { a: at(2) - .05, r: (u, d) => <><Still n="M1_last.jpg" k={u / d} kb={{ z: [1.4, 1.55], o: [50, 65] }} dim={.35} /><Words u={u} b={d} y={150} size={190} sub="A YEAR"><G><Count u={u} a={.1} to={75000} pre="$" /></G></Words></> },
  { a: at(3) - .05, video: true, r: (u, d) => <Clip n="M2.mp4" k={u / d} from={.5} kb={{ z: [1.3, 1.4], o: [60, 50] }} /> },
  { a: at(4) - .1, r: (u, d) => <><Studio /><Char n="P10_think" u={u} h={900} y={1060} /></> },
  { a: at(5) - .05, r: (u, d) => <><Studio /><Words u={u} b={d} y={360} size={200}>ONLY <span style={{ opacity: .35 }}>HALF</span> <G>TRUE</G></Words></> },
  { a: at(6) - .1, r: (u, d) => <><Still n="M11_two_balloons.jpg" k={u / d} kb={{ z: [1.35, 1.5], o: [50, 38] }} dim={.25} /><Words u={u} b={d} y={640} size={110}>PAY <G>×2</G> = HAPPINESS <G>×2</G>?</Words></> },
  // the dream
  { a: at(7) - .1, r: (u, d) => <><Studio warm /><Char n="P1_dream_a" u={u} h={940} x={880} y={1070} /></> },
  { a: at(7) + 2.2, r: (u, d) => <Still n="B9_house.jpg" k={u / d} kb={{ z: [1.2, 1.35], o: [50, 55] }} /> },
  { a: at(8) - .05, r: (u, d) => <Still n="B3_grocery.jpg" k={u / d} kb={{ z: [1.25, 1.4], o: [30, 60], dx: -40 }} /> },
  { a: at(8) + 2.4, r: (u, d) => <><Still n="B3_grocery.jpg" k={u / d} kb={{ z: [1.5, 1.6], o: [40, 70] }} dim={.2} /></> },
  { a: at(9) - .05, r: (u, d) => <><Studio /><Char n="P5_phone_worried" u={u} h={980} y={1090} /></> },
  // the first job, the first apartment
  { a: at(10) - .1, r: (u, d) => <Still n="B2_office.jpg" k={u / d} kb={{ z: [1.35, 1.55], o: [88, 62] }} /> },
  { a: at(11) - .05, r: (u, d) => <Still n="M6_wallet.jpg" k={u / d} kb={{ z: [1.9, 2.1], o: [57, 57] }} /> },
  { a: at(12) - .05, r: (u, d) => <Still n="B1_apt1.jpg" k={u / d} kb={{ z: [1.0, 1.08], o: [50, 50] }} /> },
  { a: at(13) - .05, r: (u, d) => <Still n="B1_apt1.jpg" k={u / d} kb={{ z: [1.7, 1.85], o: [85, 48] }} dim={.1} /> },
  { a: at(14) - .05, r: (u, d) => <Still n="G1_faucet.jpg" k={u / d} kb={{ z: [1.35, 1.6], o: [55, 55] }} /> },
  { a: at(15) - .05, r: (u, d) => <Still n="G2_shoe.jpg" k={u / d} kb={{ z: [1.25, 1.45], o: [50, 75] }} /> },
  { a: at(16) - .1, r: (u, d) => <><Still n="B1_apt1.jpg" k={u / d} kb={{ z: [1.0, 1.06], o: [50, 50] }} dim={.25} /><Char n="P7_shoe" u={u} h={820} x={1060} y={1050} /></> },
  // three times as much
  { a: at(17) - .1, r: (u, d) => <><Studio warm /><Char n="P1_dream_b" u={u} h={1000} x={900} y={1100} /></> },
  { a: at(18) - .05, r: (u, d) => <><Still n="M1_last.jpg" k={u / d} kb={{ z: [1.4, 1.6], o: [55, 62] }} dim={.3} /><Words u={u} b={d} y={260} size={260}><G>×3</G></Words></> },
  { a: at(19) - .05, r: (u, d) => <Still n="M3_gift.jpg" k={u / d} kb={{ z: [1.9, 2.1], o: [50, 63] }} /> },
  { a: at(20) - .05, r: (u, d) => <Still n="B10_apt3.jpg" k={u / d} kb={{ z: [1.6, 1.8], o: [64, 52] }} /> },
  { a: at(21) - .05, r: (u, d) => <><Studio warm /><Char n="P1_dream_a" u={u} h={1500} x={940} y={1560} /></> },
  // work, the first raise
  { a: at(22) - .2, r: (u, d) => <><Still n="B2_office.jpg" k={u / d} kb={{ z: [1.15, 1.2], o: [80, 60] }} dim={.45} /><Char n="P2_laptop" u={u} h={820} x={900} y={1060} /></> },
  { a: at(22) + 2.8, r: (u, d) => <><Studio /><Char n="P2_laptop" u={u} h={1350} x={1000} y={1420} /></> },
  { a: at(23) - .05, video: true, r: (u, d) => <Clip n="M1.mp4" k={u / d} from={1.0} kb={{ z: [1.3, 1.4], o: [50, 62] }} /> },
  { a: at(23) + 3.4, r: (u, d) => <Still n="M3_gift.jpg" k={u / d} kb={{ z: [2.1, 2.3], o: [50, 63] }} /> },
  { a: at(24) - .2, video: true, r: (u, d) => <Clip n="V1.mp4" k={u / d} from={1.3} flip kb={{ z: [1.2, 1.28], o: [85, 62] }} /> },
  { a: at(25) + .6, r: (u, d) => <Still n="M5_stairs.jpg" k={u / d} kb={{ z: [1.25, 1.4], o: [50, 60] }} /> },
  // it fades
  { a: at(26) - .1, video: true, r: (u, d) => <Clip n="M3.mp4" k={u / d} rate={1.0} kb={{ z: [1.9, 2.0], o: [50, 64] }} /> },
  { a: at(27) - .05, r: (u, d) => <Still n="M3_last.jpg" k={u / d} kb={{ z: [2.0, 2.3], o: [50, 64] }} /> },
  { a: at(28) - .1, video: true, r: (u, d) => <Clip n="V2.mp4" k={u / d} kb={{ z: [1.3, 1.5], o: [55, 50] }} /> },
  // the lottery study
  { a: at(30) - .05, r: (u, d) => <><Studio /><Words u={u} b={d} y={340} size={240}><G>1978</G></Words></> },
  { a: at(31) - .05, video: true, r: (u, d) => <><Clip n="M4.mp4" k={u / d} kb={{ z: [1.2, 1.3], o: [50, 60] }} /><Words u={u} a={1.2} b={d} y={150} size={120} sub="LOTTERY WINNERS"><G>22</G></Words></> },
  { a: at(32) - .05, video: true, r: (u, d) => <Clip n="V3.mp4" k={u / d} kb={{ z: [1.05, 1.12], o: [50, 40] }} /> },
  { a: at(33) - .05, r: (u, d) => <Still n="K2_winners_jump.jpg" k={u / d} kb={{ z: [1.3, 1.45], o: [50, 40] }} /> },
  { a: at(34) - .05, r: (u, d) => <><Studio /><Char n="P16_winners_plain" u={u} h={760} y={1040} /></> },
  { a: at(35) - .05, r: (u, d) => <Still n="B10_apt3.jpg" k={u / d} kb={{ z: [1.7, 1.9], o: [62, 58] }} /> },
  { a: at(36) + 2.1, r: (u, d) => <Still n="B8_apt2.jpg" k={u / d} kb={{ z: [1.2, 1.32], o: [25, 60], dx: 40 }} dim={.15} /> },
  { a: at(38) - .1, video: true, r: (u, d) => <Clip n="M5.mp4" k={u / d} kb={{ z: [1.25, 1.35], o: [50, 60] }} /> },
  { a: at(40) - .05, r: (u, d) => <><Studio /><Char n="P10_think" u={u} h={1400} x={960} y={1480} /></> },
  // only 22 people
  { a: at(41) - .1, r: (u, d) => <><Studio /><Words u={u} b={d} y={190} size={170} sub="IN THE STUDY">ONLY <G>22</G> PEOPLE</Words>
    <svg width={1920} height={1080} style={{ position: "absolute" }}>{Array.from({ length: 22 }, (_, i) => { const x = 960 + (i % 11 - 5) * 110, y = 720 + Math.floor(i / 11) * 150, o = fin(u, .6 + i * .04, .2);
      return <g key={i} opacity={o} fill="#e9e6ee"><circle cx={x} cy={y - 40} r={26} /><rect x={x - 30} y={y - 10} width={60} height={80} rx={26} /></g>; })}</svg></> },
  { a: at(42) - .05, r: (u, d) => <><Still n="K2_winners_jump.jpg" k={u / d} kb={{ z: [1.0, 1.08], o: [50, 50] }} dim={.7} /><Words u={u} a={.4} b={d} y={760} size={110}>SMALL STUDY,<br /><G>FAMOUS FINDING</G></Words></> },
  { a: at(43) - .05, r: (u, d) => <Still n="M5_last.jpg" k={u / d} kb={{ z: [1.3, 1.45], o: [55, 55] }} /> },
  { a: at(44) + .9, b: 144.55, fadeOut: .8, r: (u, d) => <Still n="B2_office.jpg" k={u / d} kb={{ z: [1.4, 1.6], o: [86, 60] }} /> },
];
export const IA2_PART1_END = 144.6;

export const IAEp2: React.FC = () => {
  useFont();
  const f = useCurrentFrame(), t = f / FPS;
  const i = SH.findIndex((s, k) => t >= s.a && t < (s.b ?? SH[k + 1]?.a ?? IA2_PART1_END));
  return <AbsoluteFill style={{ background: "#000" }}>
    {SH.map((s, k) => {
      const b = s.b ?? SH[k + 1]?.a ?? IA2_PART1_END, d = b - s.a;
      if (s.video) return <Sequence key={k} from={Math.round(s.a * FPS)} durationInFrames={Math.max(1, Math.round(d * FPS))}><Shell s={s} d={d} /></Sequence>;
      return k === i ? <AbsoluteFill key={k} style={{ opacity: (s.fadeIn ? fin(t - s.a, 0, s.fadeIn) : 1) * (s.fadeOut ? fout(t, b, s.fadeOut) : 1) }}>{s.r(t - s.a, d)}</AbsoluteFill> : null;
    })}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,.5) 100%)", pointerEvents: "none" }} />
    <Study u={t} a={at(31) + .3} d={5} text="Brickman, Coates & Janoff-Bulman (1978)" sub="Lottery winners and accident victims" />
  </AbsoluteFill>;
};
const Shell: React.FC<{ s: Shot; d: number }> = ({ s, d }) => { const u = useCurrentFrame() / FPS; return <>{s.r(u, d)}</>; };
