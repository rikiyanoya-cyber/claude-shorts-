// THE SPOTLIGHT EFFECT (English long-form, 1920x1080, 30fps).
// Look: dark navy stage, soft glow, dust, vignette, glowing white simple people (cut-outs in public/spot).
// Captions: one phrase at a time at the bottom with a soft fade (no word-by-word highlighting).
// Key words: the small words before/after stay small, the key word sits big near the top and is lit by a gold
// spotlight from above. Fonts: Montserrat (not the reference video's face). Timings: spot_sentences.json (= the narration).
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, delayRender, continueRender } from "remotion";
import SENT from "./spot_sentences.json";

const FPS = 30, F = "MONT";
const S = SENT as [number, number, number, string][];
const at = (i: number) => S[i - 1][1], end = (i: number) => S[i - 1][2];
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.bezier(.45, 0, .2, 1);
const fin = (u: number, a: number, d = .4) => interpolate(u, [a, a + d], [0, 1], { ...cl, easing: ease });
const fout = (u: number, b: number, d = .4) => 1 - fin(u, b - d, d);
const eo = (x: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
const GOLD = "#F2C46B", RED = "#C2575A", INK = "#0B1530", LINE = "#8FA6D6";

const useFonts = () => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => {
    const a = new FontFace(F, `url(${staticFile("fonts/Montserrat.ttf")})`, { weight: "100 900" });
    a.load().then((x) => { document.fonts.add(x); continueRender(h); }).catch(() => continueRender(h));
  }, [h]);
};

// ---------- grounds ----------
const Dust: React.FC<{ t: number; n?: number; x?: number; w?: number }> = ({ t, n = 46, x = 960, w = 1900 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute" }}>
    {Array.from({ length: n }, (_, j) => { const sd = ((j * 0.6180339) % 1), px = x + ((j * 137) % w) - w / 2, py = 1080 - ((t * (10 + 16 * sd) + j * 83) % 1160);
      return <circle key={j} cx={px + 14 * Math.sin(t * .5 + j)} cy={py} r={1.2 + 2.4 * sd} fill="#fff" opacity={.12 + .22 * Math.sin(t * 1.1 + j) ** 2} />; })}
  </svg>
);
// navy room with an overhead light; `beam` = x of the spotlight on the floor (null = no beam)
const Stage: React.FC<{ u: number; beam?: number | null; warm?: boolean; floor?: number; dim?: number }> = ({ u, beam = 960, warm, floor = 900, dim = 0 }) => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, #1b2f66 0%, #0e1b45 45%, #060c22 100%)" }}>
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="sbeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={warm ? "#ffe1a0" : "#fff"} stopOpacity=".22" /><stop offset="1" stopColor={warm ? "#ffe1a0" : "#fff"} stopOpacity=".03" /></linearGradient>
        <radialGradient id="spool"><stop offset="0" stopColor={warm ? "#ffd98a" : "#dfe8ff"} stopOpacity=".32" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <filter id="sblur"><feGaussianBlur stdDeviation="14" /></filter>
      </defs>
      <rect x={0} y={floor} width={1920} height={1080 - floor} fill="#050a1c" opacity={.55} />
      <line x1={0} y1={floor} x2={1920} y2={floor} stroke="#3c5390" strokeWidth={2} opacity={.35} />
      {beam !== null && <g opacity={(.75 + .25 * fin(u, 0, .9)) * (1 - dim)} filter="url(#sblur)">
        <path d={`M${beam - 60} -30 L${beam + 60} -30 L${beam + 270} ${floor} L${beam - 270} ${floor}Z`} fill="url(#sbeam)" />
        <ellipse cx={beam} cy={floor} rx={320} ry={52} fill="url(#spool)" /></g>}
    </svg>
  </AbsoluteFill>
);
const Vignette: React.FC = () => <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, rgba(2,4,14,.78) 100%)", pointerEvents: "none" }} />;

// ---------- people ----------
const Char: React.FC<{ img: string; x: number; y?: number; u: number; a?: number; h?: number; flip?: boolean; dim?: number; glow?: string; rot?: number }> = ({ img, x, y = 900, u, a = 0, h = 420, flip, dim = 0, glow, rot = 0 }) => {
  const o = fin(u, a, .45), bob = 1 + .007 * Math.sin((u + x * .01) * 2.1);
  return <Img src={staticFile(`spot/${img}.png`)} style={{ position: "absolute", left: x, top: y, height: h, transform: `translate(-50%, -100%) translateY(${(1 - o) * 22}px) rotate(${rot}deg) scaleX(${flip ? -1 : 1}) scaleY(${bob})`, transformOrigin: "50% 100%", opacity: o * (1 - dim * .55), filter: `brightness(${1 - dim * .55}) drop-shadow(0 0 ${glow ? 28 : 18}px ${glow || "rgba(220,232,255,.38)"})` }} />;
};

// ---------- the spotlight word: small lead-in, BIG word lit from above, small tail ----------
const SpotWord: React.FC<{ u: number; a: number; b: number; pre?: string; big: string; post?: string; size?: number; color?: string; y?: number }> = ({ u, a, b, pre, big, post, size = 230, color = "#fff", y = 300 }) => {
  const o = fin(u, a, .25) * fout(u, b, .35), lit = eo((u - a - .15) / .55), flick = 1 - .06 * Math.max(0, Math.sin(u * 37)) * (u - a < .5 ? 1 : 0);
  return (<AbsoluteFill style={{ opacity: o }}>
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <defs><linearGradient id="wb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe6a8" stopOpacity={.42 * lit} /><stop offset="1" stopColor="#ffe6a8" stopOpacity="0" /></linearGradient>
        <radialGradient id="wp"><stop offset="0" stopColor="#ffd98a" stopOpacity={.26 * lit} /><stop offset="1" stopColor="#ffd98a" stopOpacity="0" /></radialGradient>
        <filter id="wbl"><feGaussianBlur stdDeviation="18" /></filter></defs>
      <g filter="url(#wbl)"><path d={`M890 -40 L1030 -40 L${960 + 640} ${y + size * .75} L${960 - 640} ${y + size * .75}Z`} fill="url(#wb)" />
        <ellipse cx={960} cy={y + 10} rx={720} ry={size * .62} fill="url(#wp)" /></g>
    </svg>
    <div style={{ position: "absolute", left: 0, right: 0, top: y, transform: "translateY(-50%)", textAlign: "center", fontFamily: F, whiteSpace: "nowrap" }}>
      {pre && <div style={{ fontWeight: 600, fontSize: 58, color: "#dfe7ff", letterSpacing: 1, marginBottom: 6, opacity: fin(u, a, .3) }}>{pre}</div>}
      <div style={{ fontWeight: 900, fontSize: size, lineHeight: .95, letterSpacing: 4, color, opacity: .25 + .75 * lit * flick, transform: `scale(${1.05 - .05 * lit})`,
        textShadow: `0 0 ${50 * lit}px rgba(242,196,107,${.55 * lit}), 0 0 ${12 * lit}px rgba(255,240,205,${.6 * lit})` }}>{big}</div>
      {post && <div style={{ fontWeight: 600, fontSize: 58, color: "#dfe7ff", marginTop: 14, opacity: fin(u, a + .35, .3) }}>{post}</div>}
    </div>
  </AbsoluteFill>);
};

// a small source card in the top-right corner for ~2.5 s
const Source: React.FC<{ u: number; a: number; d?: number; text: string; sub?: string }> = ({ u, a, d = 2.8, text, sub }) => {
  const o = fin(u, a, .35) * fout(u, a + d, .4);
  return <div style={{ position: "absolute", right: 70, top: 60, opacity: o, transform: `translateY(${(1 - o) * -10}px)`, fontFamily: F, background: "rgba(10,20,52,.72)", border: "1.5px solid rgba(242,196,107,.55)", borderRadius: 14, padding: "14px 22px", boxShadow: "0 0 24px rgba(242,196,107,.18)" }}>
    <div style={{ fontWeight: 600, fontSize: 18, letterSpacing: 3, color: GOLD }}>STUDY</div>
    <div style={{ fontWeight: 700, fontSize: 28, color: "#fff", marginTop: 4 }}>{text}</div>
    {sub && <div style={{ fontWeight: 500, fontSize: 22, color: "#aebbe0", marginTop: 2 }}>{sub}</div>}
  </div>;
};

// ---------- props ----------
const Clock: React.FC<{ u: number; x: number; y: number; h0: number; h1: number; a: number; d: number }> = ({ u, x, y, h0, h1, a, d }) => {
  const k = eo((u - a) / d), cur = h0 + (h1 - h0) * k, hh = Math.floor(cur), mm = Math.floor((cur - hh) * 60), o = fin(u, a - .3, .4);
  const h12 = ((hh + 11) % 12) + 1, ap = hh < 12 ? "AM" : "PM";
  return (<g opacity={o} transform={`translate(${x} ${y})`}>
    <circle r={120} fill="rgba(10,20,52,.6)" stroke="#cfd8ea" strokeWidth={6} />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-104} x2={0} y2={-92} transform={`rotate(${i * 30})`} stroke="#cfd8ea" strokeWidth={5} strokeLinecap="round" />)}
    <line x1={0} y1={0} x2={0} y2={-60} transform={`rotate(${(cur % 12) * 30})`} stroke={GOLD} strokeWidth={10} strokeLinecap="round" />
    <line x1={0} y1={0} x2={0} y2={-92} transform={`rotate(${(cur % 1) * 360})`} stroke="#fff" strokeWidth={5} strokeLinecap="round" />
    <circle r={9} fill={GOLD} />
    <text y={205} textAnchor="middle" fontFamily={F} fontWeight={800} fontSize={64} fill={GOLD} style={{ filter: "drop-shadow(0 0 14px rgba(242,196,107,.55))" }}>{h12}:{String(mm).padStart(2, "0")} {ap}</text>
  </g>);
};
// little figures (heads + bodies) used as a crowd; `lit` of them glow gold
const Crowd: React.FC<{ u: number; a: number; n: number; cols: number; x: number; y: number; gap?: number; s?: number; lit?: number; litAt?: number }> = ({ u, a, n, cols, x, y, gap = 120, s = 1, lit = 0, litAt = 0 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute" }}>
    {Array.from({ length: n }, (_, i) => { const r = Math.floor(i / cols), c = i % cols, cx = x + (c - (cols - 1) / 2) * gap + (r % 2) * gap * .5, cy = y + r * gap * 1.05, o = fin(u, a + (i % 7) * .06 + r * .1, .35), on = i < lit && u > litAt + i * .12;
      return <g key={i} opacity={o} transform={`translate(${cx} ${cy}) scale(${s})`} fill={on ? GOLD : "#3d5288"} style={on ? { filter: "drop-shadow(0 0 10px rgba(242,196,107,.7))" } : {}}>
        <circle cx={0} cy={-62} r={20} /><rect x={-24} y={-36} width={48} height={64} rx={22} /></g>; })}
  </svg>
);

// ---------- captions ----------
type Cap = { a: number; b: number; t: string };
const phrases = (txt: string, a: number, b: number): Cap[] => {
  let parts = txt.replace(/\s+—\s*$/, " —").split(/(?<=[,:;.?!])\s+|\s+(?=—)/).map((x) => x.trim()).filter(Boolean);
  const out: string[] = [];
  for (const p of parts) {
    if (p.length <= 54) { out.push(p); continue; }
    const w = p.split(" "); let best = 1, bd = 1e9;
    for (let i = 1; i < w.length; i++) { const d = Math.abs(w.slice(0, i).join(" ").length - p.length / 2); if (d < bd) { bd = d; best = i; } }
    out.push(w.slice(0, best).join(" "), w.slice(best).join(" "));
  }
  // merge tiny fragments into the next phrase
  const m: string[] = [];
  for (const p of out) { if (m.length && m[m.length - 1].length < 12 && (m[m.length - 1] + " " + p).length <= 54) m[m.length - 1] += " " + p; else m.push(p); }
  const tot = m.reduce((s, p) => s + p.length, 0); let t = a;
  return m.map((p) => { const d = (b - a) * p.length / tot, c = { a: t, b: t + d, t: p }; t += d; return c; });
};
const GOLDW = /^(\d[\d,.]*%?|half|twice|2000)$/i;
const Caption: React.FC<{ t: number; caps: Cap[] }> = ({ t, caps }) => {
  const c = caps.find((x) => t >= x.a - .05 && t < x.b + .12);
  if (!c) return null;
  const o = fin(t, c.a - .05, .22) * fout(t, c.b + .12, .16);
  return <div style={{ position: "absolute", left: 120, right: 120, bottom: 86, textAlign: "center", fontFamily: F, fontWeight: 700, fontSize: 52, lineHeight: 1.25, color: "#fff", opacity: o, transform: `translateY(${(1 - o) * 10}px)`,
    textShadow: "0 2px 6px rgba(0,0,0,.85), 0 0 22px rgba(4,8,26,.9)" }}>
    {c.t.split(" ").map((w, i) => <span key={i} style={{ color: GOLDW.test(w.replace(/[^\w%,.]/g, "").replace(/[.,]$/, "")) ? GOLD : undefined }}>{w} </span>)}
  </div>;
};

// ---------- shots ----------
// each shot: [from, to, render(u = seconds since shot start, t = absolute seconds)]
type Shot = { from: number; to: number; push?: number; r: (u: number, t: number) => React.ReactNode; fadeIn?: number; fadeOut?: number };
const SHOTS: Shot[] = [
  // 1 a moment from school that still lives in your head
  { from: 0, to: 3.05, fadeIn: .8, r: (u) => <>
    <Stage u={u} beam={960} />
    <svg width={1920} height={1080} style={{ position: "absolute", opacity: .32 }} fill="none" stroke={LINE} strokeWidth={3}>
      {Array.from({ length: 12 }, (_, i) => <g key={i}><rect x={150 + i * 140} y={430} width={120} height={470} rx={4} /><line x1={170 + i * 140} y1={470} x2={250 + i * 140} y2={470} /><line x1={170 + i * 140} y1={490} x2={250 + i * 140} y2={490} /></g>)}
    </svg>
    <Char img="you-stand" x={960} u={u} a={.3} h={440} /></> },
  // 2 tripped in the cafeteria, tray flying, everyone around
  { from: 3.05, to: 7.9, r: (u) => <>
    <Stage u={u} beam={900} />
    <svg width={1920} height={1080} style={{ position: "absolute", opacity: .35 }} fill="none" stroke={LINE} strokeWidth={3}>
      <rect x={120} y={760} width={420} height={18} rx={6} /><line x1={150} y1={778} x2={150} y2={900} /><line x1={510} y1={778} x2={510} y2={900} />
      <rect x={1380} y={760} width={420} height={18} rx={6} /><line x1={1410} y1={778} x2={1410} y2={900} /><line x1={1770} y1={778} x2={1770} y2={900} />
    </svg>
    <Char img="girl-bob-stare" x={330} u={u} a={.9} h={350} dim={.35} />
    <Char img="boy-red-sit-watch" x={1590} u={u} a={1.1} h={340} flip dim={.35} />
    <Char img="you-trip-tray" x={900 + 40 * eo(u / 1.2)} u={u} a={0} h={440} rot={-6 + 6 * eo(u / 1.2)} /></> },
  // 3 something on your face all day and nobody told you
  { from: 7.9, to: 11.95, r: (u) => <>
    <Stage u={u} beam={1180} />
    <svg width={1920} height={1080} style={{ position: "absolute" }}><Clock u={u} x={600} y={400} h0={8} h1={15.5} a={.6} d={3} /></svg>
    <Char img="you-stand" x={1180} u={u} a={0} h={460} />
    <div style={{ position: "absolute", left: 1180 + 22, top: 900 - 460 + 132, width: 20, height: 13, borderRadius: "50%", background: "#a5532f", opacity: fin(u, .4, .3), transform: "rotate(-14deg)", boxShadow: "0 0 3px rgba(0,0,0,.4)" }} /></> },
  // 4-5 either way... you remember it the same way (the moment replays in your head)
  { from: 11.95, to: 14.85, r: (u) => <>
    <Stage u={u} beam={960} dim={.35} />
    <Char img="you-slipup-sit" x={960} u={u} a={0} h={380} />
    <div style={{ position: "absolute", left: 960 - 170, top: 150, width: 340, height: 240, borderRadius: 120, border: "3px solid rgba(207,216,234,.6)", background: "rgba(14,27,69,.7)", overflow: "hidden", opacity: fin(u, .4, .4), boxShadow: "0 0 30px rgba(143,166,214,.35)" }}>
      <Img src={staticFile("spot/you-trip-tray.png")} style={{ position: "absolute", left: 100, top: 30, height: 200, transform: `rotate(${-8 + 8 * ((u * .9) % 1)}deg)`, opacity: .9 }} />
    </div>
    <svg width={1920} height={1080} style={{ position: "absolute", opacity: fin(u, .3, .4) }} fill="rgba(207,216,234,.6)"><circle cx={940} cy={430} r={12} /><circle cx={925} cy={470} r={8} /></svg></> },
  // 6-7 Everyone SAW IT. Everyone remembers.
  { from: 14.85, to: 18.05, r: (u) => <>
    <Stage u={u} beam={null} />
    <Crowd u={u} a={.1} n={16} cols={8} x={960} y={700} gap={150} s={1.25} />
    <SpotWord u={u} a={.05} b={1.45} pre="Everyone" big="SAW IT" size={250} y={330} /></> },
  // 8-9 how many people actually noticed?
  { from: 18.05, to: 23.75, r: (u) => <>
    <Stage u={u} beam={null} />
    <Crowd u={u} a={0} n={24} cols={8} x={960} y={520} gap={150} s={1.25} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontFamily: F, fontWeight: 900, fontSize: 200, color: GOLD, opacity: fin(u, 3.3, .4), textShadow: "0 0 40px rgba(242,196,107,.5)", transform: `scale(${.9 + .1 * eo((u - 3.3) / .5)})` }}>?</div></> },
  // 10 psychologists put it to the test
  { from: 23.75, to: 29.6, fadeOut: 1.0, r: (u) => <>
    <Stage u={u} beam={760} />
    <svg width={1920} height={1080} style={{ position: "absolute" }} fill="none" stroke="#cfd8ea" strokeWidth={5} strokeLinecap="round">
      <g opacity={fin(u, .5, .5)} transform="translate(1180 330)"><rect x={0} y={0} width={360} height={470} rx={18} fill="rgba(10,20,52,.6)" /><rect x={120} y={-24} width={120} height={46} rx={10} fill="#0e1b45" />
        {[0, 1, 2, 3].map((i) => <g key={i}><rect x={40} y={70 + i * 95} width={44} height={44} rx={6} /><line x1={110} y1={92 + i * 95} x2={310} y2={92 + i * 95} />
          {u > 1.6 + i * .5 && <path d={`M48 ${92 + i * 95} l12 14 l24 -30`} stroke={GOLD} strokeWidth={7} />}</g>)}</g>
    </svg>
    <Char img="you-stand" x={760} u={u} a={.1} h={430} /></> },
  // 11 a study published in 2000
  { from: 30.3, to: 32.5, fadeIn: .5, r: (u) => <>
    <Stage u={u} beam={null} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 260, letterSpacing: 10, color: GOLD, opacity: fin(u, .2, .5), textShadow: "0 0 50px rgba(242,196,107,.55)" }}>2000</div></> },
  // 12 Cornell students, one at a time
  { from: 32.5, to: 36.25, r: (u) => <>
    <Stage u={u} beam={1220} />
    <Img src={staticFile("spot/char-master-spotlight.png")} style={{ position: "absolute", left: 160, top: 900, height: 330, transform: "translateY(-100%)", opacity: fin(u, 0, .4) * .6, filter: "brightness(.55) drop-shadow(0 0 14px rgba(220,232,255,.25))" }} />
    <Char img="you-stand" x={760 + 460 * eo((u - .8) / 1.6)} u={u} a={.4} h={430} /></> },
  // 13-14 the embarrassing face-print T-shirt
  { from: 36.25, to: 44.4, fadeOut: .9, push: .16, r: (u) => <>
    <Stage u={u} beam={960} />
    <Char img="girl-bob-stare" x={420} u={u} a={4.2} h={330} dim={.4} />
    <Char img="boy-red-conversation" x={1510} u={u} a={4.5} h={340} flip dim={.4} />
    <Char img="you-shirt-embarrassing" x={960} u={u} a={0} h={560} /></> },
];

// key-word spans: hide the bottom caption while the big word carries the line
const BIG: [number, number][] = [[at(6) - .1, at(6) + 1.45]];

export const SPOT_TEST_END = 44.4;
export const SPOT_FRAMES = Math.round((S[S.length - 1][2] + 3) * FPS);

export const SpotEpisode: React.FC = () => {
  useFonts();
  const f = useCurrentFrame(), t = f / FPS;
  const caps = React.useMemo(() => S.flatMap(([, a, b, x]) => phrases(x, a, b)), []);
  const sh = SHOTS.find((s) => t >= s.from && t < s.to);
  const showCap = !BIG.some(([a, b]) => t >= a && t < b);
  let body: React.ReactNode = null, op = 1;
  if (sh) {
    const u = t - sh.from, k = (t - sh.from) / (sh.to - sh.from), z = 1 + (sh.push ?? .05) * ease(Math.min(1, k));
    op = (sh.fadeIn ? fin(u, 0, sh.fadeIn) : 1) * (sh.fadeOut ? fout(t, sh.to, sh.fadeOut) : 1);
    body = <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "50% 55%" }}>{sh.r(u, t)}</AbsoluteFill>;
  }
  return (<AbsoluteFill style={{ background: "#03060f" }}>
    <AbsoluteFill style={{ opacity: op }}>{body}<Dust t={t} /></AbsoluteFill>
    <Vignette />
    <Source u={t} a={at(11)} d={3.2} text="Gilovich, Medvec & Savitsky (2000)" sub="Cornell University" />
    {showCap && <Caption t={t} caps={caps} />}
  </AbsoluteFill>);
};
