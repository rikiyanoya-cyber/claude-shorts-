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
// small acting on a cut-out: sigh (shoulders drop), nod, tilt, shake (nervous), hop (joy), droop (sad)
type Act = "sigh" | "nod" | "tilt" | "shake" | "hop" | "droop" | "none";
const acting = (u: number, act: Act = "none") => {
  let ty = 0, r = 0, sy = 1 + .012 * Math.sin(u * 2.1);
  if (act === "sigh") { const c = Math.max(0, Math.sin(Math.min(1, Math.max(0, (u - .6) / 1.4)) * Math.PI)); sy -= .035 * c; ty += 10 * c; }
  if (act === "nod") r = 2.5 * Math.sin(u * 3);
  if (act === "tilt") r = -4 * ease(Math.min(1, u / 1.2));
  if (act === "shake") r = 1.2 * Math.sin(u * 28);
  if (act === "hop") ty -= 34 * Math.abs(Math.sin(Math.min(u, 1.9) * 5)) * (u < 1.9 ? 1 : 0);
  if (act === "droop") { ty += 14 * ease(Math.min(1, u / 2)); r = -2 * ease(Math.min(1, u / 2)); }
  return { ty, r, sy };
};
// a set (background) + a character: the camera move drives the character fully and the set at 35 % (depth)
type Cam = { z?: [number, number]; pan?: number; o?: [number, number] };
const Scene: React.FC<{ u: number; d: number; bg?: string; studio?: boolean; cam?: Cam; ch?: { n: string; h: number; x?: number; y?: number; act?: Act; flip?: boolean }; dim?: number; glow?: string; children?: React.ReactNode }> = ({ u, d, bg, studio, cam = {}, ch, dim = 0, glow, children }) => {
  const k = ease(Math.min(1, u / d)), [z0, z1] = cam.z ?? [1, 1.15], z = z0 + (z1 - z0) * k, pan = (cam.pan ?? 0) * k;
  const a = ch ? acting(u, ch.act) : null;
  return <AbsoluteFill>
    {bg ? <AbsoluteFill style={kbStyle(k, { z: [1.05 + (z0 - 1) * .4, 1.05 + (z1 - 1) * .4], o: cam.o ?? [50, 55], dx: pan * .35 })}><Img src={src(bg)} style={{ width: 1920, height: 1080, objectFit: "cover", filter: `brightness(${1 - dim}) blur(${ch ? 1.2 : 0}px)` }} /></AbsoluteFill> : <Studio warm={studio} />}
    {ch && a && <AbsoluteFill style={{ transform: `translateX(${pan}px) scale(${z})`, transformOrigin: cam.o ? `${cam.o[0]}% ${cam.o[1]}%` : `${((ch.x ?? 960) / 19.2)}% ${((ch.y ?? 1040) / 10.8)}%` }}>
      <div style={{ position: "absolute", left: (ch.x ?? 960) - ch.h * .28, top: (ch.y ?? 1040) - ch.h * .035, width: ch.h * .56, height: ch.h * .07, borderRadius: "50%", background: "rgba(0,0,0,.45)", filter: "blur(14px)" }} />
      <Img src={src(`${ch.n}.png`)} style={{ position: "absolute", left: ch.x ?? 960, top: (ch.y ?? 1040) + a.ty, height: ch.h, transform: `translate(-50%,-100%) rotate(${a.r}deg) scaleX(${ch.flip ? -1 : 1}) scaleY(${a.sy})`, transformOrigin: "50% 100%", opacity: fin(u, 0, .3) }} />
      {glow && <div style={{ position: "absolute", left: (ch.x ?? 960) - 220, top: (ch.y ?? 1040) - ch.h * .78, width: 440, height: 440, borderRadius: "50%", background: `radial-gradient(circle, ${glow} 0%, rgba(0,0,0,0) 65%)`, mixBlendMode: "screen", opacity: .55 + .25 * Math.sin(u * 9) * Math.sin(u * 3.7) }} />}
    </AbsoluteFill>}
    {children}
  </AbsoluteFill>;
};
// per-scene light: work = cool with a hot lamp, dream/pay = warm, sad = drained, study = neutral
type Tone = "work" | "warm" | "sad" | "study" | "none";
const ToneLayer: React.FC<{ tone?: Tone }> = ({ tone = "none" }) => tone === "none" ? null : <>
  {tone === "warm" && <AbsoluteFill style={{ background: "radial-gradient(ellipse at 55% 45%, rgba(255,170,80,.28) 0%, rgba(255,140,60,.08) 55%, rgba(0,0,0,0) 100%)", mixBlendMode: "screen" }} />}
  {tone === "work" && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(40,80,160,.25), rgba(0,10,40,.35))", mixBlendMode: "multiply" }} />}
  {tone === "sad" && <AbsoluteFill style={{ backdropFilter: "saturate(.45) brightness(.82)", WebkitBackdropFilter: "saturate(.45) brightness(.82)", background: "rgba(20,30,60,.18)" }} />}
  {tone === "study" && <AbsoluteFill style={{ background: "rgba(10,16,40,.18)" }} />}
</>;
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
// wide -> close alternation, visible camera moves (push 15-30 %, pans 120-220 px, direction alternates),
// one still (hold) every 4-5 shots, cuts on the noun the narration names (word times from the narration).
type Shot = { a: number; b?: number; r: (u: number, d: number) => React.ReactNode; video?: boolean; fadeIn?: number; fadeOut?: number; tone?: Tone };
const SH: Shot[] = [
  // hook
  { a: 0, video: true, r: (u, d) => <Clip n="M1.mp4" k={u / d} kb={{ z: [1.25, 1.6], o: [50, 60] }} /> },
  { a: 3.2, tone: "warm", r: (u, d) => <><Still n="M1_last.jpg" k={u / d} kb={{ z: [1.9, 2.1], o: [60, 60] }} dim={.4} /><Words u={u} b={d} y={260} size={210} sub="A YEAR"><G><Count u={u} a={0} to={75000} pre="$" d={.6} /></G></Words></> },
  { a: at(3) - .05, video: true, r: (u, d) => <Clip n="M2.mp4" k={u / d} from={.5} kb={{ z: [1.2, 1.5], o: [62, 45], dx: -120 }} /> },
  { a: at(4) - .1, r: (u, d) => <Scene u={u} d={d} cam={{ z: [1.0, 1.0] }} ch={{ n: "P10_think", h: 900, x: 700, act: "tilt" }} /> },
  { a: at(5) - .05, r: (u, d) => <><Studio /><Words u={u} b={d} y={360} size={210}>ONLY <span style={{ opacity: .3 }}>HALF</span> <G>TRUE</G></Words></> },
  { a: at(6) - .1, r: (u, d) => <><Still n="M11_two_balloons.jpg" k={u / d} kb={{ z: [1.5, 1.9], o: [50, 38] }} dim={.3} /><Words u={u} b={d} y={700} size={110}>PAY <G>×2</G> = HAPPINESS <G>×2</G>?</Words></> },
  // the dream: wide -> the home -> the car -> grocery -> phone
  { a: at(7) - .1, tone: "warm", r: (u, d) => <Scene u={u} d={d} studio cam={{ z: [1.0, 1.25], pan: -140 }} ch={{ n: "P1_dream_a", h: 900, x: 1060, y: 1060, act: "nod" }} /> },
  { a: 17.0, tone: "warm", r: (u, d) => <Still n="B9_house.jpg" k={u / d} kb={{ z: [1.6, 1.9], o: [44, 55], dx: 80 }} /> },
  { a: 18.05, tone: "warm", r: (u, d) => <Still n="B9_house.jpg" k={u / d} kb={{ z: [2.2, 2.4], o: [70, 60] }} /> },
  { a: 19.5, r: (u, d) => <Still n="B3_grocery.jpg" k={u / d} kb={{ z: [1.5, 1.7], o: [30, 50], dx: 160 }} /> },
  { a: 21.6, r: (u, d) => <Still n="B3_grocery.jpg" k={u / d} kb={{ z: [2.4, 2.4], o: [33, 45] }} /> },
  { a: at(9) - .05, r: (u, d) => <Scene u={u} d={d} cam={{ z: [1.2, 1.5], o: [50, 30] }} ch={{ n: "P5_phone_worried", h: 1000, y: 1090, act: "shake" }} glow="rgba(255,210,150,.6)" /> },
  // the first job, the first apartment
  { a: at(10) - .1, tone: "work", r: (u, d) => <Still n="B2_office.jpg" k={u / d} kb={{ z: [1.3, 1.55], o: [86, 60], dx: -140 }} /> },
  { a: 30.1, r: (u, d) => <Still n="M6_wallet.jpg" k={u / d} kb={{ z: [2.4, 2.7], o: [60, 56] }} /> },
  { a: at(12) - .05, r: (u, d) => <Still n="B1_apt1.jpg" k={u / d} kb={{ z: [1.0, 1.0] }} /> },
  { a: 36.9, r: (u, d) => <Still n="B1_apt1.jpg" k={u / d} kb={{ z: [2.2, 2.35], o: [75, 40], dx: -60 }} dim={.1} /> },
  { a: 38.0, r: (u, d) => <Still n="G1_faucet.jpg" k={u / d} kb={{ z: [1.4, 1.6], o: [55, 50] }} /> },
  { a: 40.3, r: (u, d) => <Still n="G1_faucet.jpg" k={u / d} kb={{ z: [3.0, 3.2], o: [59, 64] }} /> },
  { a: 42.9, r: (u, d) => <Still n="G2_shoe.jpg" k={u / d} kb={{ z: [1.3, 1.5], o: [50, 60], dx: 120 }} /> },
  { a: 44.3, r: (u, d) => <Still n="G2_shoe.jpg" k={u / d} kb={{ z: [3.0, 3.2], o: [52, 78] }} /> },
  { a: at(16) - .1, tone: "sad", r: (u, d) => <Scene u={u} d={d} bg="B1_apt1.jpg" cam={{ z: [1.0, 1.3], pan: 150 }} dim={.3} ch={{ n: "P7_shoe", h: 820, x: 980, y: 1050, act: "droop" }} /> },
  // three times as much
  { a: at(17) - .1, tone: "warm", r: (u, d) => <Scene u={u} d={d} studio cam={{ z: [1.4, 1.7] }} ch={{ n: "P1_dream_b", h: 1000, x: 960, y: 1100, act: "nod" }} /> },
  { a: 51.1, tone: "warm", r: (u, d) => <><Still n="M1_last.jpg" k={u / d} kb={{ z: [1.9, 2.2], o: [55, 62] }} dim={.35} /><Words u={u} a={0} b={d} y={250} size={300}><G>×3</G></Words></> },
  { a: at(19) - .05, tone: "warm", r: (u, d) => <Still n="M3_gift.jpg" k={u / d} kb={{ z: [1.8, 2.3], o: [50, 63] }} /> },
  { a: at(20) - .05, tone: "warm", r: (u, d) => <Still n="B10_apt3.jpg" k={u / d} kb={{ z: [1.5, 1.9], o: [64, 52], dx: -120 }} /> },
  { a: at(21) - .05, tone: "warm", r: (u, d) => <Scene u={u} d={d} studio cam={{ z: [1.6, 1.6] }} ch={{ n: "P1_dream_a", h: 1000, x: 960, y: 1180 }} /> },
  // work, the first raise
  { a: at(22) - .2, tone: "work", r: (u, d) => <Scene u={u} d={d} bg="B2_office.jpg" cam={{ z: [1.0, 1.2], pan: -160, o: [80, 60] }} dim={.45} ch={{ n: "P2_laptop", h: 820, x: 900, y: 1060, act: "sigh" }} /> },
  { a: at(22) + 2.8, tone: "work", r: (u, d) => <Scene u={u} d={d} cam={{ z: [1.5, 1.75], o: [55, 22] }} ch={{ n: "P2_laptop", h: 900, x: 1000, y: 1060 }} glow="rgba(255,190,110,.55)" /> },
  { a: 68.5, tone: "warm", video: true, r: (u, d) => <><Clip n="M1.mp4" k={u / d} from={1.0} kb={{ z: [1.4, 1.7], o: [50, 60] }} /><Words u={u} a={.1} b={d} y={150} size={120}>FIRST <G>RAISE</G></Words></> },
  { a: 69.8, tone: "warm", r: (u, d) => <Still n="M3_gift.jpg" k={u / d} kb={{ z: [2.2, 2.6], o: [50, 64] }} /> },
  { a: 72.35, tone: "warm", r: (u, d) => <Still n="B8_apt2.jpg" k={u / d} kb={{ z: [2.0, 2.2], o: [76, 56], dx: 100 }} /> },
  { a: at(24) - .2, tone: "warm", video: true, r: (u, d) => <Clip n="V1.mp4" k={u / d} from={1.3} flip kb={{ z: [1.2, 1.45], o: [88, 58] }} /> },
  { a: at(25) + .6, tone: "warm", r: (u, d) => <Still n="M5_stairs.jpg" k={u / d} kb={{ z: [1.4, 1.8], o: [48, 55], dx: -100 }} /> },
  // it fades
  { a: at(26) - .1, video: true, r: (u, d) => <Clip n="M3.mp4" k={u / d} kb={{ z: [2.0, 2.2], o: [50, 64] }} /> },
  { a: at(27) - .05, tone: "sad", r: (u, d) => <Still n="M3_last.jpg" k={u / d} kb={{ z: [2.0, 2.0], o: [50, 64] }} /> },
  { a: at(28) - .1, tone: "sad", video: true, r: (u, d) => <Clip n="V2.mp4" k={u / d} kb={{ z: [1.3, 1.9], o: [56, 45] }} /> },
  // the lottery study
  { a: at(30) - .05, tone: "study", r: (u, d) => <><Studio /><Words u={u} b={d} y={340} size={260}><G>1978</G></Words></> },
  { a: at(31) - .05, video: true, r: (u, d) => <><Clip n="M4.mp4" k={u / d} kb={{ z: [1.2, 1.6], o: [50, 60] }} /><Words u={u} a={97.6 - at(31) + .05} b={d} y={130} size={150} sub="LOTTERY WINNERS"><G>22</G></Words></> },
  { a: at(32) - .05, tone: "warm", video: true, r: (u, d) => <Clip n="V3.mp4" k={u / d} kb={{ z: [1.0, 1.25], o: [50, 45] }} /> },
  { a: at(33) - .05, tone: "warm", r: (u, d) => <Still n="K2_winners_jump.jpg" k={u / d} kb={{ z: [1.9, 2.1], o: [50, 30] }} /> },
  { a: at(34) - .05, tone: "sad", r: (u, d) => <Scene u={u} d={d} cam={{ z: [1.0, 1.0] }} ch={{ n: "P16_winners_plain", h: 760, y: 1040 }} /> },
  { a: at(35) - .05, r: (u, d) => <Still n="B10_apt3.jpg" k={u / d} kb={{ z: [2.0, 2.3], o: [62, 60], dx: 100 }} /> },
  { a: at(36) + 2.1, tone: "sad", r: (u, d) => <Still n="B8_apt2.jpg" k={u / d} kb={{ z: [1.3, 1.6], o: [25, 60], dx: 160 }} /> },
  { a: at(38) - .1, video: true, r: (u, d) => <Clip n="M5.mp4" k={u / d} kb={{ z: [1.3, 1.6], o: [50, 58] }} /> },
  { a: at(40) - .05, r: (u, d) => <Scene u={u} d={d} cam={{ z: [1.5, 1.8], o: [50, 38] }} ch={{ n: "P10_think", h: 900, y: 1060, act: "tilt" }} /> },
  // only 22 people
  { a: at(41) - .1, tone: "study", r: (u, d) => <><Studio /><Words u={u} a={129.9 - at(41) + .1} b={d} y={170} size={170} sub="IN THE STUDY">ONLY <G>22</G> PEOPLE</Words>
    <svg width={1920} height={1080} style={{ position: "absolute" }}>{Array.from({ length: 22 }, (_, i) => { const x = 960 + (i % 11 - 5) * 110, y = 720 + Math.floor(i / 11) * 150, o = fin(u, .6 + i * .04, .2);
      return <g key={i} opacity={o} fill="#e9e6ee"><circle cx={x} cy={y - 40} r={26} /><rect x={x - 30} y={y - 10} width={60} height={80} rx={26} /></g>; })}</svg></> },
  { a: at(42) - .05, tone: "study", r: (u, d) => <><Still n="K2_winners_jump.jpg" k={u / d} kb={{ z: [1.0, 1.0] }} dim={.7} /><Words u={u} a={.4} b={d} y={760} size={110}>SMALL STUDY,<br /><G>FAMOUS FINDING</G></Words></> },
  { a: at(43) - .05, r: (u, d) => <Still n="M5_last.jpg" k={u / d} kb={{ z: [1.3, 1.7], o: [55, 55], dx: -120 }} /> },
  { a: at(44) + .9, b: 144.55, fadeOut: .8, tone: "work", r: (u, d) => <Still n="B2_office.jpg" k={u / d} kb={{ z: [1.3, 1.7], o: [86, 60] }} /> },
];
export const IA2_PART1_END = 144.6;

export const IAEp2: React.FC = () => {
  useFont();
  const f = useCurrentFrame(), t = f / FPS;
  const i = SH.findIndex((s, k) => t >= s.a && t < (s.b ?? SH[k + 1]?.a ?? IA2_PART1_END));
  return <AbsoluteFill style={{ background: "#000" }}>
    {SH.map((s, k) => {
      const b = s.b ?? SH[k + 1]?.a ?? IA2_PART1_END, d = b - s.a;
      if (s.video) return <Sequence key={k} from={Math.round(s.a * FPS)} durationInFrames={Math.max(1, Math.round(d * FPS))}><Shell s={s} d={d} /><ToneLayer tone={s.tone} /></Sequence>;
      return k === i ? <AbsoluteFill key={k} style={{ opacity: (s.fadeIn ? fin(t - s.a, 0, s.fadeIn) : 1) * (s.fadeOut ? fout(t, b, s.fadeOut) : 1) }}>{s.r(t - s.a, d)}<ToneLayer tone={s.tone} /></AbsoluteFill> : null;
    })}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,.5) 100%)", pointerEvents: "none" }} />
    <AbsoluteFill style={{ opacity: .06, mixBlendMode: "overlay" }}><svg width={1920} height={1080}><filter id="gr"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves={2} seed={f % 24} /></filter><rect width={1920} height={1080} filter="url(#gr)" /></svg></AbsoluteFill>
    <Study u={t} a={at(31) + .3} d={5} text="Brickman, Coates & Janoff-Bulman (1978)" sub="Lottery winners and accident victims" />
  </AbsoluteFill>;
};
const Shell: React.FC<{ s: Shot; d: number }> = ({ s, d }) => { const u = useCurrentFrame() / FPS; return <>{s.r(u, d)}</>; };
