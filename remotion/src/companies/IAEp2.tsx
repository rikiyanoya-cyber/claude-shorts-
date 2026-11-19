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

const NUM = "IAN", LAB = "IAI";
const useFont = () => {
  const [h] = React.useState(() => delayRender("font"));
  React.useEffect(() => {
    Promise.all([new FontFace(F, `url(${staticFile("fonts/Montserrat.ttf")})`, { weight: "100 900" }).load(), new FontFace(NUM, `url(${staticFile("fonts/Anton.ttf")})`).load(), new FontFace(LAB, `url(${staticFile("fonts/Inter-Bold.ttf")})`, { weight: "700" }).load()])
      .then((fs) => { fs.forEach((x) => document.fonts.add(x)); continueRender(h); }).catch(() => continueRender(h));
  }, [h]);
};

// ---------- building blocks ----------
type KB = { z?: [number, number]; o?: [number, number]; dx?: number };   // push from z0 to z1 around origin o (in %), drift dx px
// o = the focus point (in % of the picture); it is brought toward the frame centre as far as the zoom allows (no edges show)
const kbStyle = (k: number, kb: KB = {}) => {
  const [rz0, rz1] = kb.z ?? [1.0, 1.12], [ox, oy] = kb.o ?? [50, 50], e = ease(Math.min(1, Math.max(0, k)));
  // 2026-11-19: the pictures are 1376 px wide, so big digital zooms went soft. Scale now stays within 1.0-1.12 (push or pull keeps its direction).
  const span = Math.max(.05, Math.min(.12, Math.abs(rz1 - rz0) || .06)), z0 = rz1 >= rz0 ? 1 : 1 + span, z1 = rz1 >= rz0 ? 1 + span : 1, z = z0 + (z1 - z0) * e;
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
  const k = ease(Math.min(1, u / d)), [rz0, rz1] = cam.z ?? [1, 1.15], z0 = 1, z1 = 1 + Math.max(0, Math.min(.12, rz1 - rz0)), z = z0 + (z1 - z0) * k, pan = (cam.pan ?? 0) * k * .6;
  const a = ch ? acting(u, ch.act) : null;
  return <AbsoluteFill>
    {bg ? <AbsoluteFill style={kbStyle(k, { z: [1.05 + (z0 - 1) * .4, 1.05 + (z1 - 1) * .4], o: cam.o ?? [50, 55], dx: pan * .35 })}><Img src={src(bg)} style={{ width: 1920, height: 1080, objectFit: "cover", filter: `brightness(${1 - dim})` }} /></AbsoluteFill> : <Studio warm={studio} />}
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
  {tone === "work" && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(60,90,170,.12), rgba(0,10,40,.18))", mixBlendMode: "multiply" }} />}
  {tone === "sad" && <AbsoluteFill style={{ backdropFilter: "saturate(.85) brightness(.88)", WebkitBackdropFilter: "saturate(.85) brightness(.88)" }} />}
  {tone === "study" && <AbsoluteFill style={{ background: "rgba(10,16,40,.18)" }} />}
</>;
// the plain navy studio for character-only shots (same look as the sets)
const Studio: React.FC<{ warm?: boolean }> = ({ warm }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 42%, ${warm ? "#1d2f5c" : "#143064"} 0%, #0D2349 55%, #0a1c3c 100%)` }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 96%, rgba(242,180,90,.18) 0%, rgba(242,180,90,0) 45%)" }} />
  </AbsoluteFill>
);
// big words: white heavy type with a gold accent, top half, a soft dark band behind for phones
const Words: React.FC<{ u: number; a?: number; b: number; children: React.ReactNode; size?: number; y?: number; x?: number; sub?: string }> = ({ u, a = .1, b, children, size = 150, y = 230, x, sub }) => {
  const o = fin(u, a, .3) * fout(u, b, .3);
  return <div style={{ position: "absolute", left: x === undefined ? 0 : x - 400, right: x === undefined ? 0 : 1920 - x - 400, top: y, textAlign: "center", opacity: o, transform: `translateY(${(1 - fin(u, a, .4)) * 24}px) scale(${1.04 - .04 * fin(u, a, .5)})` }}>
    <div style={{ display: "inline-block", fontFamily: NUM, fontWeight: 400, fontSize: size * 1.08, lineHeight: 1.02, color: "#fff", letterSpacing: 3, textShadow: "0 6px 30px rgba(0,0,0,.75), 0 0 2px rgba(0,0,0,.6)" }}>{children}</div>
    {sub && <div style={{ fontFamily: LAB, fontWeight: 700, fontSize: 40, color: "#dfe6ff", marginTop: 16, letterSpacing: 6, textShadow: "0 3px 16px rgba(0,0,0,.8)" }}>{sub}</div>}
  </div>;
};
const R: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: "#E57A6E" }}>{children}</span>;
const G: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: GOLD }}>{children}</span>;
const Count: React.FC<{ u: number; a: number; to: number; pre?: string; suf?: string; d?: number }> = ({ u, a, to, pre = "", suf = "", d = .9 }) => {
  const v = Math.round(to * ease(Math.min(1, Math.max(0, (u - a) / d))));
  return <>{pre}{v.toLocaleString("en-US")}{suf}</>;
};
// study card, bottom-left, ~4 s
const Study: React.FC<{ u: number; a: number; d?: number; text: string; sub?: string }> = ({ u, a, d = 4, text, sub }) => {
  const o = fin(u, a, .4) * fout(u, a + d, .4);
  return <div style={{ position: "absolute", left: 70, bottom: 70, opacity: o, fontFamily: LAB, background: "rgba(8,14,40,.78)", borderLeft: `5px solid ${GOLD}`, borderRadius: 10, padding: "14px 24px" }}>
    <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: 4, color: GOLD }}>STUDY</div>
    <div style={{ fontWeight: 700, fontSize: 30, color: "#fff", marginTop: 2 }}>{text}</div>
    {sub && <div style={{ fontWeight: 700, fontSize: 22, color: "#b9c4e6", marginTop: 2 }}>{sub}</div>}
  </div>;
};


// ---------- graphs (code): clean lines on the navy studio, gold = what matters, labels in Inter ----
const GW = 1300, GH = 560, GX = 310, GY = 300;   // plot box
const Axis: React.FC<{ u: number; x: string; y: string }> = ({ u, x, y }) => <>
  <svg width={1920} height={1080} style={{ position: "absolute", opacity: fin(u, 0, .4) }}>
    <line x1={GX} y1={GY + GH} x2={GX + GW} y2={GY + GH} stroke="#8fa0cc" strokeWidth={4} /><line x1={GX} y1={GY} x2={GX} y2={GY + GH} stroke="#8fa0cc" strokeWidth={4} /></svg>
  <div style={{ position: "absolute", left: GX + GW - 400, width: 400, top: GY + GH + 18, textAlign: "right", fontFamily: LAB, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: "#8fa0cc", opacity: fin(u, 0, .4) }}>{x}</div>
  <div style={{ position: "absolute", left: GX - 30, top: GY - 58, fontFamily: LAB, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: "#8fa0cc", opacity: fin(u, 0, .4) }}>{y}</div></>;
// a polyline that draws itself between a and a+d (seconds of u)
const Draw: React.FC<{ u: number; a: number; d?: number; pts: [number, number][]; c: string; w?: number; dash?: boolean }> = ({ u, a, d = 1.6, pts, c, w = 10, dash }) => {
  const P = pts.map(([x, y]) => [GX + x * GW, GY + GH - y * GH]), len = P.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - P[i][0], p[1] - P[i][1]), 0), k = ease(Math.min(1, Math.max(0, (u - a) / d)));
  return <svg width={1920} height={1080} style={{ position: "absolute" }}><polyline points={P.map((p) => p.join(",")).join(" ")} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash ? "18 16" : len} strokeDashoffset={dash ? 0 : len * (1 - k)} opacity={dash ? k : 1} style={{ filter: `drop-shadow(0 0 10px ${c}88)` }} /></svg>;
};
const Tag: React.FC<{ u: number; a: number; x: number; y: number; c?: string; size?: number; children: React.ReactNode; anchor?: "l" | "r" | "c" }> = ({ u, a, x, y, c = "#fff", size = 34, children, anchor = "l" }) => (
  <div style={{ position: "absolute", left: GX + x * GW + (anchor === "r" ? -700 : anchor === "c" ? -350 : 0), width: 700, top: GY + GH - y * GH, transform: "translateY(-50%)", textAlign: anchor === "r" ? "right" : anchor === "c" ? "center" : "left", fontFamily: LAB, fontWeight: 700, fontSize: size, color: c, letterSpacing: 2, opacity: fin(u, a, .35), textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>{children}</div>
);
const Graph: React.FC<{ children: React.ReactNode }> = ({ children }) => <><Studio />{children}</>;
// 1: two kinds of happiness (life evaluation keeps rising, daily mood levels off near $75k)
const TwoKinds: React.FC<{ u: number; life?: number; mood?: number; flat?: number; mark?: number }> = ({ u, life = 99, mood = 99, flat = 99, mark = 99 }) => <Graph>
  <Axis u={u} x="HOUSEHOLD INCOME →" y="HAPPINESS" />
  <Draw u={u} a={life} d={2.2} c={GOLD} pts={[[0, .12], [.25, .32], [.5, .5], [.75, .66], [1, .82]]} />
  <Tag u={u} a={life + 1.6} x={.80} y={.92} c={GOLD}>HOW YOU RATE YOUR LIFE</Tag>
  <Draw u={u} a={mood} d={1.4} c="#9fd3ff" pts={[[0, .1], [.18, .26], [.36, .38], [.5, .43]]} />
  <Draw u={u} a={flat} d={1.2} c="#9fd3ff" pts={[[.5, .43], [.75, .44], [1, .44]]} />
  <Tag u={u} a={mood + 1.0} x={.62} y={.33} c="#9fd3ff">DAILY MOOD</Tag>
  <svg width={1920} height={1080} style={{ position: "absolute", opacity: fin(u, mark, .4) }}><line x1={GX + .5 * GW} y1={GY + 20} x2={GX + .5 * GW} y2={GY + GH} stroke="#fff" strokeWidth={3} strokeDasharray="10 10" /></svg>
  <Tag u={u} a={mark} x={.5} y={-.08} anchor="c" size={42}>~$75,000</Tag>
</Graph>;
// 2: the bracket — the plateau sits somewhere below $90k; $75k is only the midpoint; ≈$110k in today's money
const Bracket: React.FC<{ u: number; mid?: number; today?: number }> = ({ u, mid = 99, today = 99 }) => {
  const x0 = 460, x1 = 1460, y = 560, k = fin(u, .2, .6);
  return <Graph>
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <rect x={x0} y={y - 50} width={(x1 - x0) * k} height={100} rx={50} fill="rgba(159,211,255,.18)" stroke="#9fd3ff" strokeWidth={4} />
      <line x1={(x0 + x1) / 2} y1={y - 90} x2={(x0 + x1) / 2} y2={y + 90} stroke={GOLD} strokeWidth={6} opacity={fin(u, mid, .3)} /></svg>
    <div style={{ position: "absolute", left: x0 - 200, width: 400, top: y + 80, textAlign: "center", fontFamily: NUM, fontSize: 70, color: "#9fd3ff", opacity: k }}>$60,000</div>
    <div style={{ position: "absolute", left: x1 - 200, width: 400, top: y + 80, textAlign: "center", fontFamily: NUM, fontSize: 70, color: "#9fd3ff", opacity: k }}>$90,000</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontFamily: LAB, fontWeight: 700, fontSize: 40, letterSpacing: 6, color: "#dfe6ff", opacity: fin(u, .4, .4) }}>DAILY MOOD LEVELED OFF SOMEWHERE IN HERE</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: y - 210, textAlign: "center", fontFamily: NUM, fontSize: 110, color: GOLD, opacity: fin(u, mid, .3), transform: `scale(${1.1 - .1 * fin(u, mid, .4)})` }}>$75,000 <span style={{ fontFamily: LAB, fontSize: 36, color: "#fff", letterSpacing: 4 }}>= THE MIDPOINT</span></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: y + 200, textAlign: "center", fontFamily: LAB, fontWeight: 700, fontSize: 44, color: "#fff", opacity: fin(u, today, .4) }}>IN TODAY'S MONEY ≈ <span style={{ fontFamily: NUM, fontSize: 76, color: GOLD }}>$110,000</span></div>
  </Graph>;
};
// 3: ratio, not amount — on a ratio scale $20k→$60k and $60k→$180k are the same step
const Ratio: React.FC<{ u: number; s1?: number; s2?: number; eq?: number }> = ({ u, s1 = 99, s2 = 99, eq = 99 }) => {
  const X = (v: number) => 260 + (Math.log(v / 20000) / Math.log(9)) * 1400, y = 640;
  const Step: React.FC<{ a: number; from: number; to: number }> = ({ a, from, to }) => { const k = ease(Math.min(1, Math.max(0, (u - a) / .9))); return <svg width={1920} height={1080} style={{ position: "absolute" }}>
    <path d={`M${X(from)} ${y - 30} Q ${(X(from) + X(to)) / 2} ${y - 260} ${X(from) + (X(to) - X(from)) * k} ${y - 30 - (k < 1 ? 230 * Math.sin(Math.PI * k) : 0)}`} fill="none" stroke={GOLD} strokeWidth={8} strokeLinecap="round" opacity={u > a ? 1 : 0} /></svg>; };
  return <Graph>
    <svg width={1920} height={1080} style={{ position: "absolute", opacity: fin(u, 0, .4) }}><line x1={200} y1={y} x2={1720} y2={y} stroke="#8fa0cc" strokeWidth={5} />
      {[20000, 60000, 180000].map((v) => <circle key={v} cx={X(v)} cy={y} r={16} fill="#fff" />)}</svg>
    {[20000, 60000, 180000].map((v) => <div key={v} style={{ position: "absolute", left: X(v) - 200, width: 400, top: y + 40, textAlign: "center", fontFamily: NUM, fontSize: 72, color: "#fff", opacity: fin(u, .2, .4) }}>${v / 1000}K</div>)}
    <Step a={s1} from={20000} to={60000} /><Step a={s2} from={60000} to={180000} />
    {[[s1, 20000, 60000], [s2, 60000, 180000]].map(([a, f, t], i) => <div key={i} style={{ position: "absolute", left: (X(f) + X(t)) / 2 - 150, width: 300, top: y - 330, textAlign: "center", fontFamily: NUM, fontSize: 90, color: GOLD, opacity: fin(u, a + .6, .3) }}>×3</div>)}
    <div style={{ position: "absolute", left: 0, right: 0, top: 180, textAlign: "center", fontFamily: LAB, fontWeight: 700, fontSize: 44, letterSpacing: 4, color: "#fff", opacity: fin(u, eq, .4) }}>THE SAME BOOST OF HAPPINESS</div>
  </Graph>;
};
// 4: 2023 — mood flattens only for the least happy 15-20 %; most keep rising; the happiest 30 % rise faster
const Three: React.FC<{ u: number; low?: number; most?: number; top?: number }> = ({ u, low = 99, most = 99, top = 99 }) => <Graph>
  <Axis u={u} x="HOUSEHOLD INCOME →" y="DAILY MOOD" />
  <Draw u={u} a={top} d={1.8} c={GOLD} pts={[[0, .5], [.3, .6], [.6, .75], [1, 1.0]]} />
  <Tag u={u} a={top + 1.2} x={.72} y={1.04} c={GOLD}>HAPPIEST 30% — RISES FASTER</Tag>
  <Draw u={u} a={most} d={1.8} c="#ffffff" pts={[[0, .3], [.3, .4], [.6, .5], [1, .6]]} />
  <Tag u={u} a={most + 1.2} x={.72} y={.67} c="#fff">MOST PEOPLE — KEEPS RISING</Tag>
  <Draw u={u} a={low} d={1.8} c="#E57A6E" pts={[[0, .05], [.3, .14], [.48, .2], [1, .2]]} />
  <Tag u={u} a={low + 1.2} x={.62} y={.12} c="#E57A6E">LEAST HAPPY 15–20% — FLAT AFTER ~$100K</Tag>
</Graph>;
// 5: only about five points on a 100-point scale between $15k and $250k households
const Five: React.FC<{ u: number; b?: number; gap?: number }> = ({ u, b = 99, gap = 99 }) => {
  const x0 = 360, w = 1200, k1 = ease(Math.min(1, Math.max(0, (u - b) / 1))), k2 = ease(Math.min(1, Math.max(0, (u - b - .6) / 1)));
  const Bar: React.FC<{ y: number; v: number; k: number; label: string; c: string }> = ({ y, v, k, label, c }) => <>
    <div style={{ position: "absolute", left: x0, top: y, width: w, height: 70, borderRadius: 35, background: "rgba(255,255,255,.08)" }} />
    <div style={{ position: "absolute", left: x0, top: y, width: w * v / 100 * k, height: 70, borderRadius: 35, background: c, boxShadow: `0 0 20px ${c}88` }} />
    <div style={{ position: "absolute", left: x0 - 330, width: 300, top: y + 2, textAlign: "right", fontFamily: NUM, fontSize: 60, color: "#fff", opacity: fin(u, b, .3) }}>{label}</div></>;
  return <Graph>
    <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontFamily: LAB, fontWeight: 700, fontSize: 40, letterSpacing: 6, color: "#dfe6ff", opacity: fin(u, 0, .4) }}>HAPPINESS, OUT OF 100</div>
    <Bar y={430} v={67} k={k1} label="$15K" c="#9fd3ff" /><Bar y={560} v={72} k={k2} label="$250K" c={GOLD} />
    <svg width={1920} height={1080} style={{ position: "absolute", opacity: fin(u, gap, .3) }}><line x1={x0 + w * .67} y1={400} x2={x0 + w * .67} y2={660} stroke="#fff" strokeWidth={3} strokeDasharray="8 8" /><line x1={x0 + w * .72} y1={400} x2={x0 + w * .72} y2={660} stroke="#fff" strokeWidth={3} strokeDasharray="8 8" /></svg>
    <div style={{ position: "absolute", left: x0 + w * .695 - 300, width: 600, top: 690, textAlign: "center", fontFamily: NUM, fontSize: 120, color: GOLD, opacity: fin(u, gap, .3), transform: `scale(${1.15 - .15 * fin(u, gap, .4)})` }}>~5 POINTS</div>
  </Graph>;
};

// ---------- the shot list (first half: 0:00-2:24) ----------
// wide -> close alternation, visible camera moves (push 15-30 %, pans 120-220 px, direction alternates),
// one still (hold) every 4-5 shots, cuts on the noun the narration names (word times from the narration).
type Shot = { a: number; b?: number; r: (u: number, d: number) => React.ReactNode; video?: boolean; fadeIn?: number; fadeOut?: number; tone?: Tone };
const SH: Shot[] = [
  // hook
  { a: 0, video: true, r: (u, d) => <Clip n="M1.mp4" k={u / d} kb={{ z: [1.25, 1.6], o: [50, 60] }} /> },
  { a: 3.2, tone: "warm", r: (u, d) => <><Still n="R2_jar.jpg" k={u / d} kb={{ z: [1.0, 1.1], o: [50, 55] }} dim={.35} /><Words u={u} b={d} y={180} size={210} sub="A YEAR"><G><Count u={u} a={0} to={75000} pre="$" d={.6} /></G></Words></> },
  { a: at(3) - .05, video: true, r: (u, d) => <Clip n="M2.mp4" k={u / d} from={.5} kb={{ z: [1.2, 1.5], o: [62, 45], dx: -120 }} /> },
  { a: at(4) - .1, r: (u, d) => <Still n="R1_paper.jpg" k={u / d} kb={{ z: [1.0, 1.1], o: [55, 45] }} /> },
  { a: at(5) - .05, r: (u, d) => <><Studio /><Words u={u} b={d} y={360} size={210}>ONLY <span style={{ opacity: .3 }}>HALF</span> <G>TRUE</G></Words></> },
  { a: at(6) - .1, r: (u, d) => <><Still n="M11_two_balloons.jpg" k={u / d} kb={{ z: [1.5, 1.9], o: [50, 38] }} dim={.3} /><Words u={u} b={d} y={700} size={110}>PAY <G>×2</G> = HAPPINESS <G>×2</G>?</Words></> },
  // the dream: wide -> the home -> the car -> grocery -> phone
  { a: at(7) - .1, tone: "warm", r: (u, d) => <Scene u={u} d={d} studio cam={{ z: [1.0, 1.25], pan: -140 }} ch={{ n: "P1_dream_a", h: 900, x: 1060, y: 1060, act: "nod" }} /> },
  { a: 17.0, tone: "warm", r: (u, d) => <Still n="B9_house.jpg" k={u / d} kb={{ z: [1.6, 1.9], o: [44, 55], dx: 80 }} /> },
  { a: 18.05, tone: "warm", r: (u, d) => <Still n="R3_car.jpg" k={u / d} kb={{ z: [1.0, 1.1], o: [50, 60] }} /> },
  { a: 19.5, tone: "warm", r: (u, d) => <Still n="F3_basket.jpg" k={u / d} kb={{ z: [1.0, 1.15], o: [55, 50], dx: -80 }} /> },
  { a: 21.6, tone: "warm", r: (u, d) => <Still n="R4_cafe.jpg" k={u / d} kb={{ z: [1.1, 1.0], o: [55, 45] }} /> },
  { a: at(9) - .05, r: (u, d) => <Scene u={u} d={d} cam={{ z: [1.2, 1.5], o: [50, 30] }} ch={{ n: "P5_phone_worried", h: 1000, y: 1090, act: "shake" }} glow="rgba(255,210,150,.6)" /> },
  // the first job, the first apartment
  { a: at(10) - .1, tone: "work", r: (u, d) => <Still n="B2_office.jpg" k={u / d} kb={{ z: [1.3, 1.55], o: [86, 60], dx: -140 }} /> },
  { a: 30.1, tone: "sad", r: (u, d) => <Still n="F4_payslip.jpg" k={u / d} kb={{ z: [1.0, 1.18], o: [50, 40] }} /> },
  { a: at(12) - .05, r: (u, d) => <Still n="B1_apt1.jpg" k={u / d} kb={{ z: [1.0, 1.0] }} /> },
  { a: 34.85, r: (u, d) => <Still n="F5_pillow.jpg" k={u / d} kb={{ z: [1.0, 1.2], o: [52, 45] }} /> },
  { a: 38.0, r: (u, d) => <Still n="G1_faucet.jpg" k={u / d} kb={{ z: [1.4, 1.6], o: [55, 50] }} /> },
  { a: 40.3, r: (u, d) => <Still n="R5_cup.jpg" k={u / d} kb={{ z: [1.0, 1.1], o: [30, 50] }} /> },
  { a: 42.9, r: (u, d) => <Still n="G2_shoe.jpg" k={u / d} kb={{ z: [1.3, 1.5], o: [50, 60], dx: 120 }} /> },
  { a: 44.3, r: (u, d) => <Still n="R6_sole_hole.jpg" k={u / d} kb={{ z: [1.0, 1.1], o: [50, 40] }} /> },
  { a: at(16) - .1, tone: "sad", r: (u, d) => <Scene u={u} d={d} bg="B1_apt1.jpg" cam={{ z: [1.0, 1.3], pan: 150 }} dim={.3} ch={{ n: "P7_shoe", h: 820, x: 980, y: 1050, act: "droop" }} /> },
  // three times as much
  { a: at(17) - .1, tone: "warm", r: (u, d) => <Scene u={u} d={d} studio cam={{ z: [1.4, 1.7] }} ch={{ n: "P1_dream_b", h: 1000, x: 960, y: 1100, act: "nod" }} /> },
  { a: 51.1, tone: "warm", r: (u, d) => <><Still n="R7_piggies.jpg" k={u / d} kb={{ z: [1.0, 1.1], o: [60, 60] }} dim={.25} /><Words u={u} a={0} b={d} y={150} size={260}><G>×3</G></Words></> },
  { a: at(19) - .05, tone: "warm", r: (u, d) => <Still n="M3_gift.jpg" k={u / d} kb={{ z: [1.8, 2.3], o: [50, 63] }} /> },
  { a: at(20) - .05, tone: "warm", r: (u, d) => <Still n="B10_apt3.jpg" k={u / d} kb={{ z: [1.5, 1.9], o: [64, 52], dx: -120 }} /> },
  { a: at(21) - .05, tone: "warm", r: (u, d) => <Still n="R8_beam.jpg" k={u / d} kb={{ z: [1.0, 1.1], o: [50, 40] }} /> },
  // work, the first raise
  { a: at(22) - .2, tone: "work", r: (u, d) => <Scene u={u} d={d} bg="B2_office.jpg" cam={{ z: [1.0, 1.2], pan: -160, o: [80, 60] }} dim={.45} ch={{ n: "P2_laptop", h: 820, x: 900, y: 1060, act: "sigh" }} /> },
  { a: 63.4, tone: "work", r: (u, d) => <Still n="F6_folders.jpg" k={u / d} kb={{ z: [1.0, 1.15], o: [42, 45], dx: 90 }} /> },
  { a: 65.0, r: (u, d) => <Still n="F7_calendar.jpg" k={u / d} kb={{ z: [1.0, 1.2], o: [40, 50] }} /> },
  { a: 68.5, tone: "warm", r: (u, d) => <><Still n="R9_raise.jpg" k={u / d} kb={{ z: [1.0, 1.12], o: [62, 40] }} /><Words u={u} a={.1} b={d} y={130} size={120}>FIRST <G>RAISE</G></Words></> },
  { a: 69.8, tone: "warm", r: (u, d) => <Still n="F8_gift_open.jpg" k={u / d} kb={{ z: [1.0, 1.3], o: [50, 38] }} /> },
  { a: 72.35, tone: "warm", r: (u, d) => <Still n="B8_apt2.jpg" k={u / d} kb={{ z: [2.0, 2.2], o: [76, 56], dx: 100 }} /> },
  { a: at(24) - .2, tone: "warm", video: true, r: (u, d) => <Clip n="V1.mp4" k={u / d} from={1.3} flip kb={{ z: [1.2, 1.45], o: [88, 58] }} /> },
  { a: 75.9, tone: "warm", r: (u, d) => <Still n="F12_proud.jpg" k={u / d} kb={{ z: [1.0, 1.15], o: [55, 40] }} /> },
  { a: at(25) + .6, tone: "warm", r: (u, d) => <Still n="M5_stairs.jpg" k={u / d} kb={{ z: [1.4, 1.8], o: [48, 55], dx: -100 }} /> },
  // it fades
  { a: at(26) - .1, video: true, r: (u, d) => <Clip n="M3.mp4" k={u / d} kb={{ z: [2.0, 2.2], o: [50, 64] }} /> },
  { a: at(27) - .05, tone: "sad", r: (u, d) => <Still n="F9_object.jpg" k={u / d} kb={{ z: [1.0, 1.15], o: [30, 70], dx: 60 }} /> },
  { a: at(28) - .1, tone: "sad", r: (u, d) => <Still n="B5_bedroom.jpg" k={u / d} kb={{ z: [1.2, 1.5], o: [62, 52], dx: -80 }} /> },
  // the lottery study
  { a: at(30) - .05, tone: "study", r: (u, d) => <><Studio /><Words u={u} b={d} y={340} size={260}><G>1978</G></Words></> },
  { a: at(31) - .05, video: true, r: (u, d) => <><Clip n="M4.mp4" k={u / d} kb={{ z: [1.2, 1.6], o: [50, 60] }} /><Words u={u} a={97.6 - at(31) + .05} b={d} y={130} size={150} sub="LOTTERY WINNERS"><G>22</G></Words></> },
  { a: at(32) - .05, tone: "warm", video: true, r: (u, d) => <Clip n="V3.mp4" k={u / d} kb={{ z: [1.0, 1.25], o: [50, 45] }} /> },
  { a: at(33) - .05, tone: "warm", r: (u, d) => <Still n="F10_red_laugh.jpg" k={u / d} kb={{ z: [1.0, 1.15], o: [50, 45] }} /> },
  { a: at(34) - .05, tone: "sad", r: (u, d) => <Scene u={u} d={d} cam={{ z: [1.0, 1.0] }} ch={{ n: "P16_winners_plain", h: 760, y: 1040 }} /> },
  { a: at(35) - .05, tone: "sad", r: (u, d) => <Still n="F11_bored_breakfast.jpg" k={u / d} kb={{ z: [1.0, 1.18], o: [55, 40], dx: -60 }} /> },
  { a: at(36) + 2.1, tone: "sad", r: (u, d) => <Still n="B8_apt2.jpg" k={u / d} kb={{ z: [1.3, 1.6], o: [25, 60], dx: 160 }} /> },
  { a: at(38) - .1, video: true, r: (u, d) => <Clip n="M5.mp4" k={u / d} kb={{ z: [1.3, 1.6], o: [50, 58] }} /> },
  { a: at(40) - .05, r: (u, d) => <Still n="R11_bored_presents.jpg" k={u / d} kb={{ z: [1.0, 1.12], o: [25, 55] }} /> },
  // only 22 people
  { a: at(41) - .1, tone: "study", r: (u, d) => <><Studio /><Words u={u} a={129.9 - at(41) + .1} b={d} y={170} size={170} sub="IN THE STUDY">ONLY <G>22</G> PEOPLE</Words>
    <svg width={1920} height={1080} style={{ position: "absolute" }}>{Array.from({ length: 22 }, (_, i) => { const x = 960 + (i % 11 - 5) * 110, y = 720 + Math.floor(i / 11) * 150, o = fin(u, .6 + i * .04, .2);
      return <g key={i} opacity={o} fill="#e9e6ee"><circle cx={x} cy={y - 40} r={26} /><rect x={x - 30} y={y - 10} width={60} height={80} rx={26} /></g>; })}</svg></> },
  { a: at(42) - .05, tone: "study", r: (u, d) => <><Still n="K2_winners_jump.jpg" k={u / d} kb={{ z: [1.0, 1.0] }} dim={.7} /><Words u={u} a={.4} b={d} y={760} size={110}>SMALL STUDY,<br /><G>FAMOUS FINDING</G></Words></> },
  { a: at(43) - .05, r: (u, d) => <Still n="R12_treadmill.jpg" k={u / d} kb={{ z: [1.0, 1.12], o: [50, 55] }} /> },
  { a: at(44) + .9, b: 144.6, fadeOut: .6, tone: "work", r: (u, d) => <Still n="R13_senpai_far.jpg" k={u / d} kb={{ z: [1.0, 1.12], o: [70, 62] }} /> },
];
export const IA2_PART1_END = 144.6;
export const IA2_END = 514.0;   // the narration ends at 508.06; 6 s of quiet tail under the end screen
// ---------- the shot list (second half: 2:24-end) ----------
const SH2: Shot[] = [
  // the coworker
  { a: 144.6, fadeIn: .5, tone: "work", r: (u, d) => <Still n="N4_senpai_walk.jpg" k={u / d} kb={{ z: [1.0, 1.15], o: [35, 45], dx: -80 }} /> },
  { a: 148.0, tone: "warm", r: (u, d) => <><Scene u={u} d={d} studio cam={{ z: [1.0, 1.2], pan: 120 }} ch={{ n: "P11_senpai_key", h: 900, x: 1180, y: 1060, act: "nod" }} /><Words u={u} a={1.0} b={d} y={260} size={200} sub="YOUR PAY"><G>×3</G></Words></> },
  { a: 151.75, tone: "warm", r: (u, d) => <Still n="R14_senpai_house.jpg" k={u / d} kb={{ z: [1.0, 1.12], o: [40, 55] }} /> },
  { a: 153.9, tone: "warm", r: (u, d) => <Still n="B7_parking.jpg" k={u / d} kb={{ z: [1.4, 1.7], o: [50, 62], dx: -90 }} /> },
  { a: 156.4, tone: "warm", r: (u, d) => <Still n="R15_list.jpg" k={u / d} kb={{ z: [1.0, 1.1], o: [50, 40] }} /> },
  { a: 160.9, tone: "warm", r: (u, d) => <Still n="R16_trophy.jpg" k={u / d} kb={{ z: [1.0, 1.1], o: [50, 50] }} /> },
  { a: 164.5, r: (u, d) => <Still n="B6_coffee.jpg" k={u / d} kb={{ z: [1.2, 1.45], o: [50, 55] }} /> },
  { a: 167.35, tone: "sad", r: (u, d) => <Still n="N1_senpai_sigh.jpg" k={u / d} kb={{ z: [1.0, 1.18], o: [50, 45] }} /> },
  { a: 171.0, tone: "work", r: (u, d) => <Scene u={u} d={d} cam={{ z: [1.2, 1.45], o: [50, 40] }} ch={{ n: "P13_senpai_phone", h: 900, x: 960, y: 1080, act: "shake" }} glow="rgba(170,200,255,.5)" /> },
  { a: 175.15, tone: "sad", r: (u, d) => <Still n="R17_dinner_phone.jpg" k={u / d} kb={{ z: [1.0, 1.12], o: [45, 55] }} /> },
  // two kinds of happiness
  { a: 177.4, r: (u, d) => <Still n="R18_bulb.jpg" k={u / d} kb={{ z: [1.0, 1.1], o: [50, 35] }} /> },
  { a: 179.4, b: 189.85, r: (u, d) => <><TwoKinds u={u} life={2.7} mood={5.3} flat={99} /><Words u={u} a={.05} b={2.4} y={140} size={110}>TWO KINDS OF <G>HAPPINESS</G></Words></> },
  { a: 189.85, r: (u, d) => <Still n="R19_signs.jpg" k={u / d} kb={{ z: [1.0, 1.12], o: [50, 50] }} /> },
  { a: 192.8, tone: "study", r: (u, d) => <><Studio /><Words u={u} a={2.2} b={d} y={300} size={240}><G>2010</G></Words></> },
  { a: 194.85, tone: "study", r: (u, d) => <><Studio /><Words u={u} a={2.5} b={d} y={250} size={200} sub="AMERICANS SURVEYED"><G><Count u={u} a={2.5} to={450000} suf="+" d={1.2} /></G></Words></> },
  { a: 200.4, b: 218.1, r: (u, d) => <TwoKinds u={u} life={.4} mood={8.3} flat={12.9} mark={13.2} /> },
  { a: 218.1, b: 231.05, r: (u, d) => <Bracket u={u} mid={4.3} today={8.4} /> },
  { a: 231.05, r: (u, d) => <><Studio /><Words u={u} b={d} y={360} size={210}>ONLY <span style={{ opacity: .3 }}>HALF</span> <G>TRUE</G></Words></> },
  { a: 233.95, r: (u, d) => <Still n="R20_balloon.jpg" k={u / d} kb={{ z: [1.0, 1.08], o: [50, 55] }} /> },
  { a: 236.7, b: 239.3, r: (u, d) => <><Studio /><Words u={u} a={.7} b={d + 1} y={360} size={170}>ONLY YOUR <G>DAILY MOOD</G></Words></> },
  // misfortune hurts more (after the mid-roll break)
  { a: 239.3, fadeIn: .5, r: (u, d) => <Still n="G3_bills.jpg" k={u / d} kb={{ z: [1.2, 1.4], o: [50, 55] }} /> },
  { a: 241.4, video: true, r: (u, d) => <><Clip n="M7.mp4" k={u / d} kb={{ z: [1.3, 1.55], o: [50, 58] }} /><Words u={u} a={1.0} b={d} y={140} size={120}>LESS MONEY = <R>HURTS MORE</R></Words></> },
  { a: 244.95, tone: "sad", r: (u, d) => <Still n="N5_awake_top.jpg" k={u / d} kb={{ z: [1.0, 1.35], o: [48, 40] }} /> },
  { a: 250.65, video: true, r: (u, d) => <Clip n="V4.mp4" k={u / d} kb={{ z: [1.25, 1.55], o: [40, 50] }} /> },
  { a: 254.9, r: (u, d) => <Still n="G4_car_smoke.jpg" k={u / d} kb={{ z: [1.6, 1.9], o: [38, 45] }} /> },
  { a: 258.6, tone: "sad", r: (u, d) => <Still n="R21_long_bill.jpg" k={u / d} kb={{ z: [1.0, 1.12], o: [50, 45] }} /> },
  // income triples
  { a: 264.4, tone: "warm", r: (u, d) => <><Still n="R22_envelopes3.jpg" k={u / d} kb={{ z: [1.0, 1.1], o: [50, 60] }} /><Words u={u} a={1.4} b={d} y={380} size={260} x={1560}><G>×3</G></Words></> },
  { a: 267.55, tone: "warm", r: (u, d) => <Scene u={u} d={d} cam={{ z: [1.3, 1.7], o: [50, 30] }} ch={{ n: "P6_amazed", h: 950, y: 1080 }} glow="rgba(255,220,160,.65)" /> },
  { a: 270.9, tone: "sad", r: (u, d) => <Still n="R23_old_room.jpg" k={u / d} kb={{ z: [1.0, 1.12], o: [40, 55] }} /> },
  { a: 275.6, tone: "warm", r: (u, d) => <Still n="N6_bags.jpg" k={u / d} kb={{ z: [1.0, 1.2], o: [48, 45], dx: 90 }} /> },
  { a: 278.6, tone: "warm", r: (u, d) => <Still n="R24_card_pay.jpg" k={u / d} kb={{ z: [1.0, 1.1], o: [45, 45] }} /> },
  { a: 281.7, tone: "warm", r: (u, d) => <Still n="N7_restaurant.jpg" k={u / d} kb={{ z: [1.2, 1.45], o: [52, 45] }} /> },
  { a: 283.35, r: (u, d) => <Still n="R25_sleep.jpg" k={u / d} kb={{ z: [1.0, 1.1], o: [50, 45] }} /> },
  { a: 287.8, tone: "warm", r: (u, d) => <Still n="R26_phone_pay.jpg" k={u / d} kb={{ z: [1.0, 1.1], o: [55, 45] }} /> },
  { a: 289.3, r: (u, d) => <Still n="R27_gift_small.jpg" k={u / d} kb={{ z: [1.0, 1.12], o: [50, 60] }} /> },
  { a: 294.95, r: (u, d) => <Still n="R28_pile_balloon.jpg" k={u / d} kb={{ z: [1.0, 1.12], o: [50, 70] }} /> },
  // ratio, not amount
  { a: 298.1, tone: "study", r: (u, d) => <><Studio /><Words u={u} a={.3} b={d} y={330} size={200}><G>RATIO</G>, NOT AMOUNT</Words></> },
  { a: 303.5, b: 315.55, r: (u, d) => <Ratio u={u} s1={1.6} s2={5.4} eq={6.6} /> },
  { a: 315.55, r: (u, d) => <><Studio /><Words u={u} b={d} y={300} size={150}>PAY <G>×3</G> ≠ HAPPINESS <G>×3</G></Words></> },
  { a: 318.75, r: (u, d) => <Still n="R29_two_sparks.jpg" k={u / d} kb={{ z: [1.0, 1.12], o: [50, 60] }} /> },
  // the hardest stretch
  { a: 322.7, tone: "warm", r: (u, d) => <Still n="N8_sofa.jpg" k={u / d} kb={{ z: [1.0, 1.15], o: [48, 45] }} /> },
  { a: 325.25, tone: "sad", video: true, r: (u, d) => <Clip n="V5.mp4" k={u / d} kb={{ z: [1.0, 1.15], o: [70, 55] }} /> },
  { a: 326.9, tone: "sad", r: (u, d) => <Still n="N9_alone_high.jpg" k={u / d} kb={{ z: [1.0, 1.25], o: [68, 50] }} /> },
  { a: 330.75, tone: "sad", r: (u, d) => <Still n="G5_takeout.jpg" k={u / d} kb={{ z: [1.3, 1.6], o: [50, 55] }} /> },
  { a: 333.85, tone: "sad", r: (u, d) => <Scene u={u} d={d} cam={{ z: [1.0, 1.25], pan: 100 }} ch={{ n: "P8_table_alone", h: 760, x: 960, y: 1060, act: "droop" }} /> },
  { a: 337.4, tone: "sad", r: (u, d) => <Still n="R30_takeout_door.jpg" k={u / d} kb={{ z: [1.0, 1.12], o: [70, 55] }} /> },
  { a: 340.3, tone: "sad", r: (u, d) => <Still n="N2_you_sad.jpg" k={u / d} kb={{ z: [1.0, 1.2], o: [50, 42] }} /> },
  { a: 344.45, tone: "sad", r: (u, d) => <Scene u={u} d={d} cam={{ z: [1.2, 1.45], o: [50, 30] }} ch={{ n: "P12_senpai_coffee", h: 900, y: 1070, act: "droop" }} /> },
  { a: 348.8, tone: "sad", video: true, r: (u, d) => <Clip n="V6.mp4" k={u / d} kb={{ z: [1.2, 1.9], o: [45, 55] }} /> },
  { a: 357.9, b: 362.2, tone: "sad", video: true, r: (u, d) => <Clip n="M8.mp4" k={u / d} kb={{ z: [1.2, 1.45], o: [50, 58] }} /> },
  // 2023
  { a: 362.2, tone: "study", r: (u, d) => <><Studio /><Words u={u} a={.7} b={d} y={300} size={240}><G>2023</G></Words></> },
  { a: 365.25, r: (u, d) => <Still n="M9_scale.jpg" k={u / d} kb={{ z: [1.2, 1.5], o: [50, 55], dx: -80 }} /> },
  { a: 368.4, tone: "study", r: (u, d) => <><Studio /><Words u={u} a={.1} b={d} y={200} size={120}>"<G>IT PLATEAUS</G>"</Words><Words u={u} a={2.3} b={d} y={520} size={120}>"<span style={{ color: "#9fd3ff" }}>IT KEEPS RISING</span>"</Words></> },
  { a: 372.6, tone: "study", r: (u, d) => <><Studio /><Words u={u} a={.2} b={d} y={330} size={130} sub="WITH A NEUTRAL THIRD PARTY">BOTH SIDES, <G>ONE DATASET</G></Words></> },
  { a: 379.05, b: 396.9, r: (u, d) => <Three u={u} low={.4} most={10.9} top={13.5} /> },
  { a: 396.9, r: (u, d) => <Still n="R33_bookmark.jpg" k={u / d} kb={{ z: [1.0, 1.12], o: [50, 55] }} /> },
  { a: 402.7, tone: "sad", r: (u, d) => <><Still n="P15_blonde_leaves.jpg" k={u / d} kb={{ z: [1.0, 1.06], o: [50, 50] }} dim={.35} /><Words u={u} a={.05} b={d} y={860} size={150}>A BREAKUP.</Words></> },
  { a: 403.65, tone: "sad", r: (u, d) => <><Still n="R31_grief_chair.jpg" k={u / d} kb={{ z: [1.0, 1.04], o: [50, 45] }} dim={.35} /><Words u={u} a={.05} b={d} y={860} size={150}>GRIEF.</Words></> },
  { a: 404.4, tone: "sad", r: (u, d) => <><Still n="R32_raincloud.jpg" k={u / d} kb={{ z: [1.0, 1.04], o: [50, 40] }} dim={.35} /><Words u={u} a={.05} b={d} y={860} size={150}>MENTAL ILLNESS.</Words></> },
  { a: 406.05, tone: "sad", r: (u, d) => <Still n="R34_coin_heart.jpg" k={u / d} kb={{ z: [1.0, 1.12], o: [55, 60] }} /> },
  // spending differently
  { a: 408.0, r: (u, d) => <Still n="R35_jars.jpg" k={u / d} kb={{ z: [1.0, 1.12], o: [55, 50] }} /> },
  { a: 411.75, r: (u, d) => <Still n="R36_piggy_pedestal.jpg" k={u / d} kb={{ z: [1.0, 1.1], o: [50, 50] }} /> },
  { a: 415.85, r: (u, d) => <><Studio /><Words u={u} a={2.4} b={d} y={330} size={150}>SHRINK THE <G>SMALL</G><br />DAILY FRICTIONS</Words></> },
  { a: 419.8, tone: "warm", r: (u, d) => <Still n="N10_box.jpg" k={u / d} kb={{ z: [1.5, 1.7], o: [36, 50] }} /> },
  { a: 422.05, tone: "warm", video: true, r: (u, d) => <Clip n="V7.mp4" k={u / d} kb={{ z: [1.4, 1.75], o: [52, 45] }} /> },
  { a: 427.2, r: (u, d) => <Still n="G6_laptop.jpg" k={u / d} kb={{ z: [1.3, 1.55], o: [50, 50] }} /> },
  { a: 429.25, tone: "warm", r: (u, d) => <Still n="N11_fix.jpg" k={u / d} kb={{ z: [1.0, 1.2], o: [55, 50], dx: -70 }} /> },
  { a: 433.7, tone: "warm", r: (u, d) => <Still n="N12_window_back.jpg" k={u / d} kb={{ z: [1.0, 1.15], o: [55, 45] }} /> },
  // the research: real but modest
  { a: 438.25, tone: "study", video: true, r: (u, d) => <><Clip n="M9.mp4" k={u / d} kb={{ z: [1.3, 1.6], o: [50, 55] }} /><Words u={u} a={3.0} b={d} y={150} size={140}>REAL, BUT <G>MODEST</G></Words></> },
  { a: 444.4, b: 454.35, r: (u, d) => <Five u={u} b={.5} gap={7.0} /> },
  { a: 454.35, video: true, r: (u, d) => <Clip n="M10.mp4" k={u / d} kb={{ z: [1.3, 1.55], o: [50, 55] }} /> },
  { a: 460.0, r: (u, d) => <><Still n="R37_houses.jpg" k={u / d} kb={{ z: [1.0, 1.1], o: [50, 65] }} dim={.15} /><Words u={u} a={1.4} b={d} y={180} size={150}><G>$35K</G> – <G>$125K</G></Words></> },
  { a: 465.85, tone: "study", r: (u, d) => <><Studio /><Words u={u} a={1.6} b={d} y={260} size={140}>MONEY → HAPPY<span style={{ color: "#9fd3ff" }}>?</span></Words><Words u={u} a={4.5} b={d} y={500} size={140}>HAPPY → MONEY<span style={{ color: "#9fd3ff" }}>?</span></Words></> },
  { a: 472.7, r: (u, d) => <Still n="R38_walk_together.jpg" k={u / d} kb={{ z: [1.0, 1.12], o: [50, 65] }} /> },
  // the answer
  { a: 476.6, r: (u, d) => <><Still n="R39_payslip_q.jpg" k={u / d} kb={{ z: [1.0, 1.1], o: [50, 40] }} dim={.25} /><Words u={u} a={.4} b={d} y={850} size={110}>PAY <G>×2</G> = HAPPINESS <G>×2</G>?</Words></> },
  { a: 480.0, b: 483.3, r: (u, d) => <><Studio /><Words u={u} a={.75} b={d} y={260} size={260}>NO.</Words><Words u={u} a={2.0} b={d} y={580} size={120}>BUT <G>NOT ZERO</G>.</Words></> },
  { a: 483.3, tone: "warm", r: (u, d) => <Still n="R40_coin_light.jpg" k={u / d} kb={{ z: [1.0, 1.1], o: [50, 40] }} /> },
  { a: 486.9, r: (u, d) => <><Still n="R41_cushion.jpg" k={u / d} kb={{ z: [1.0, 1.12], o: [50, 60] }} /><Words u={u} a={.3} b={d} y={140} size={110}>MONEY <G>SOFTENS PAIN</G></Words></> },
  { a: 489.35, r: (u, d) => <><Studio /><Words u={u} b={d} y={330} size={190}><G>RATIO</G>, NOT AMOUNT</Words></> },
  { a: 492.15, tone: "sad", r: (u, d) => <Still n="R42_coin_cloud.jpg" k={u / d} kb={{ z: [1.0, 1.12], o: [48, 62] }} /> },
  { a: 495.0, tone: "sad", r: (u, d) => <Still n="R43_senpai_coffee.jpg" k={u / d} kb={{ z: [1.0, 1.1], o: [45, 45] }} /> },
  { a: 498.5, tone: "warm", r: (u, d) => <Still n="B9_house.jpg" k={u / d} kb={{ z: [1.4, 1.5], o: [45, 55] }} /> },
  { a: 499.35, tone: "warm", r: (u, d) => <Still n="B7_parking.jpg" k={u / d} kb={{ z: [1.6, 1.7], o: [50, 62] }} /> },
  { a: 500.25, tone: "warm", r: (u, d) => <Still n="N4_senpai_walk.jpg" k={u / d} kb={{ z: [1.6, 1.7], o: [30, 30] }} /> },
  { a: 501.55, r: (u, d) => <Still n="N3_two_sigh.jpg" k={u / d} kb={{ z: [1.0, 1.25], o: [50, 45] }} /> },
  { a: 505.1, b: IA2_END, fadeOut: 1.2, tone: "warm", r: (u, d) => <Still n="N12_window_back.jpg" k={u / d} kb={{ z: [1.0, 1.2], o: [55, 45] }} /> },
];

// the new opening (user's line, 2026-11-19): "Your alarm went off in the dark this morning, and you got up for a paycheck.
// But here's the question: if that paycheck doubled, would you be twice as happy?" — 8.75 s + 0.55 s breath.
// It is placed before the old opening, and the old line 6 (the same question) is cut out at the splice (11.34-14.65 s).
export const IA2_OPEN = 9.3;
const INTRO: Shot[] = [
  { a: 0, r: (u, d) => <Still n="F1_alarm.jpg" k={u / d} kb={{ z: [1.0, 1.15], o: [70, 50] }} /> },
  { a: 0.85, tone: "sad", video: true, r: (u, d) => <Clip n="V2.mp4" k={u / d} from={1.4} kb={{ z: [1.4, 1.7], o: [56, 45] }} /> },
  { a: 2.15, r: (u, d) => <Still n="F2_to_work.jpg" k={u / d} kb={{ z: [1.0, 1.25], o: [40, 55], dx: 80 }} /> },
  { a: 3.1, r: (u, d) => <Still n="M6_wallet.jpg" k={u / d} kb={{ z: [2.5, 2.8], o: [60, 56] }} /> },
  { a: 3.95, r: (u, d) => <Scene u={u} d={d} cam={{ z: [1.5, 1.7], o: [50, 30] }} ch={{ n: "P10_think", h: 900, y: 1060, act: "tilt" }} /> },
  { a: 5.4, r: (u, d) => <><Still n="M11_two_balloons.jpg" k={u / d} kb={{ z: [1.5, 1.9], o: [50, 38] }} dim={.3} />
    <Words u={u} a={6.4 - 5.4} b={d + 1} y={640} size={120}>PAY <G>×2</G><span style={{ opacity: fin(u, 7.65 - 5.4, .25) }}> = HAPPINESS <G>×2</G>?</span></Words></> },
];


// pauses before key lines (also inserted into the narration): [time on the narration clock, length]
export const IA2_GAPS: [number, number][] = [[236.7, .7], [238.7, 1.0], [357.9, .8], [480.0, .7]];
const shift = (x: number) => x + IA2_GAPS.reduce((s, [g, d]) => s + (x > g ? d : 0), 0);
export const IA2_FULL_END = shift(IA2_END);
export const IAEp2: React.FC<{ intro?: boolean; full?: boolean }> = ({ intro, full }) => {
  const SRC = intro ? INTRO : full ? [...SH, ...SH2] : SH;
  const SH_ = SRC.map((s) => ({ ...s, a: full ? shift(s.a) : s.a, b: s.b === undefined ? undefined : full ? shift(s.b) : s.b }));
  const END_ = intro ? IA2_OPEN : full ? IA2_FULL_END : IA2_PART1_END;
  useFont();
  const f = useCurrentFrame(), t = f / FPS;
  const i = SH_.findIndex((s, k) => t >= s.a && t < (s.b ?? SH_[k + 1]?.a ?? END_));
  return <AbsoluteFill style={{ background: "#000" }}>
    {SH_.map((s, k) => {
      const b = s.b ?? SH_[k + 1]?.a ?? END_, d = b - s.a;
      if (s.video) return <Sequence key={k} from={Math.round(s.a * FPS)} durationInFrames={Math.max(1, Math.round(d * FPS))}><Shell s={s} d={d} /><ToneLayer tone={s.tone} /></Sequence>;
      return k === i ? <AbsoluteFill key={k} style={{ opacity: (s.fadeIn ? fin(t - s.a, 0, s.fadeIn) : 1) * (s.fadeOut ? fout(t, b, s.fadeOut) : 1) }}>{s.r(t - s.a, d)}<ToneLayer tone={s.tone} /></AbsoluteFill> : null;
    })}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 62%, rgba(0,0,0,.22) 100%)", pointerEvents: "none" }} />
    {!intro && <Study u={t} a={at(31) + .3} d={5} text="Brickman, Coates & Janoff-Bulman (1978)" sub="Lottery winners and accident victims" />}
    {full && <Study u={t} a={shift(195.2)} d={5} text="Kahneman & Deaton (2010)" sub="High income improves evaluation of life but not emotional well-being" />}
    {full && <Study u={t} a={shift(372.8)} d={5} text="Killingsworth, Kahneman & Mellers (2023)" sub="Income and emotional well-being: a conflict resolved" />}
    {full && <Study u={t} a={shift(460.2)} d={4.5} text="Jebb et al. (2018)" sub="Happiness, income satiation and turning points around the world" />}
  </AbsoluteFill>;
};
const Shell: React.FC<{ s: Shot; d: number }> = ({ s, d }) => { const u = useCurrentFrame() / FPS; return <>{s.r(u, d)}</>; };
