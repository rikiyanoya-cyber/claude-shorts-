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

// ---------- more devices ----------
const Lbl: React.FC<{ x: number; y: number; text: string; o?: number; size?: number; color?: string; w?: number; weight?: number }> = ({ x, y, text, o = 1, size = 34, color = "#cfd9f5", w = 600, weight = 700 }) => (
  <div style={{ position: "absolute", left: x - w / 2, width: w, top: y, textAlign: "center", fontFamily: F, fontWeight: weight, fontSize: size, letterSpacing: 2, color, opacity: o, lineHeight: 1.2 }}>{text}</div>
);
// a count-up number (gold) with a label above
const BigNum: React.FC<{ t: number; a: number; v: number; x: number; y: number; suf?: string; size?: number; label?: string; color?: string; from?: number; dur?: number; plus?: boolean }> = ({ t, a, v, x, y, suf = "%", size = 200, label, color = GOLD, from = 0, dur = .9, plus }) => {
  const k = eo((t - a) / dur), n = from + (v - from) * k, o = fin(t, a - .15, .3);
  return <div style={{ position: "absolute", left: x - 500, width: 1000, top: y, transform: "translateY(-50%)", textAlign: "center", fontFamily: F, opacity: o }}>
    {label && <div style={{ fontWeight: 700, fontSize: 34, letterSpacing: 4, color: "#cfd9f5", marginBottom: 6 }}>{label}</div>}
    <div style={{ fontWeight: 800, fontSize: size, lineHeight: 1, color, textShadow: `0 0 40px ${color === GOLD ? "rgba(242,196,107,.5)" : "rgba(255,255,255,.25)"}` }}>{Math.round(n).toLocaleString("en-US")}{plus ? "+" : ""}<span style={{ fontSize: size * .5 }}>{suf}</span></div>
  </div>;
};
// vertical bars that grow (or shrink from `from`) and count
type BarD = { label: string; v: number; a: number; col?: string; from?: number; ghost?: number };
const Bars: React.FC<{ t: number; bars: BarD[]; x?: number; base?: number; gap?: number; max?: number; H?: number; note?: string }> = ({ t, bars, x = 960, base = 820, gap = 380, max = 100, H = 470, note }) => (
  <>{bars.map((b, i) => { const cx = x + (i - (bars.length - 1) / 2) * gap, k = eo((t - b.a) / 1), v = (b.from ?? 0) + (b.v - (b.from ?? 0)) * k, o = fin(t, b.a - .2, .3), h = H * v / max, col = b.col || GOLD;
    return <React.Fragment key={i}>
      <svg width={1920} height={1080} style={{ position: "absolute", opacity: o }}>
        {b.ghost !== undefined && <rect x={cx - 80} y={base - H * b.ghost / max} width={160} height={H * b.ghost / max} rx={10} fill="none" stroke="#8fa6d6" strokeWidth={3} strokeDasharray="10 10" opacity={.7} />}
        <rect x={cx - 80} y={base - h} width={160} height={h} rx={10} fill={col} opacity={.9} style={{ filter: `drop-shadow(0 0 18px ${col})` }} />
      </svg>
      <Lbl x={cx} y={base - h - 110} text={`${Math.round(v)}%`} size={84} color={col} o={o} weight={800} />
      <Lbl x={cx} y={base + 22} text={b.label} size={30} o={o} w={380} />
    </React.Fragment>; })}
    {note && <Lbl x={960} y={base + 80} text={note} size={24} color="#8796bd" w={900} weight={500} />}</>
);
const Eye: React.FC<{ x: number; y: number; s?: number; o?: number; col?: string }> = ({ x, y, s = 1, o = 1, col = "#fff" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}><path d="M-34 0 Q0 -26 34 0 Q0 26 -34 0Z" fill="none" stroke={col} strokeWidth={4} /><circle r={10} fill={col} /></g>
);
// house cross-section with numbered rooms: 1 = blue, 2 = warm
const House2: React.FC<{ t: number; a: number; eyes1: number; eyes2: number; l1: string; l2: string; grow?: number }> = ({ t, a, eyes1, eyes2, l1, l2, grow }) => {
  const o = fin(t, a, .5), n1 = grow !== undefined && t < grow ? Math.ceil(eyes1 / 2) : eyes1, x0 = 560, y0 = 900, W = 400, Hh = 380;
  const eyesIn = (cx: number, n: number, col: string, ga: number) => Array.from({ length: n }, (_, i) => { const r = Math.floor(i / 3), c = i % 3; return <Eye key={i} x={cx - 110 + c * 110} y={y0 - Hh + 90 + r * 80} s={.9} col={col} o={fin(t, ga + i * .06, .25)} />; });
  return <svg width={1920} height={1080} style={{ position: "absolute", opacity: o }}>
    <path d={`M${x0 - 40} ${y0 - Hh} L960 ${y0 - Hh - 200} L${1400 + 40} ${y0 - Hh}`} fill="none" stroke="#cfd8ea" strokeWidth={5} />
    <rect x={x0} y={y0 - Hh} width={W} height={Hh} fill="#2c5bbd" opacity={.55} /><rect x={x0 + W} y={y0 - Hh} width={W} height={Hh} fill="#b57a2c" opacity={.55} />
    <rect x={x0} y={y0 - Hh} width={W * 2} height={Hh} fill="none" stroke="#cfd8ea" strokeWidth={5} /><line x1={960} y1={y0 - Hh} x2={960} y2={y0} stroke="#cfd8ea" strokeWidth={5} />
    {[[x0 + 40, "1"], [x0 + W + 40, "2"]].map(([xx, n]) => <g key={n as string}><circle cx={xx as number} cy={y0 - Hh + 36} r={22} fill={GOLD} /><text x={xx as number} y={y0 - Hh + 47} textAnchor="middle" fontFamily={F} fontWeight={800} fontSize={28} fill={INK}>{n}</text></g>)}
    {eyesIn(760, n1, "#dce8ff", a + .3)}{eyesIn(1160, eyes2, "#ffe2b0", a + .5)}
    <text x={760} y={y0 + 50} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={30} fill="#cfd9f5" letterSpacing={2}>{l1}</text>
    <text x={1160} y={y0 + 50} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={30} fill="#cfd9f5" letterSpacing={2}>{l2}</text>
  </svg>;
};
const Bubble: React.FC<{ t: number; a: number; x: number; y: number; text: string; w?: number; size?: number; warm?: boolean }> = ({ t, a, x, y, text, w = 300, size = 28, warm }) => {
  const o = fin(t, a, .3);
  return <div style={{ position: "absolute", left: x - w / 2, width: w, top: y, transform: `translateY(-100%) scale(${.9 + .1 * o})`, transformOrigin: "50% 100%", opacity: o, textAlign: "center", background: warm ? "rgba(255,236,200,.95)" : "rgba(226,234,255,.94)", color: INK, borderRadius: 26, padding: "14px 18px", fontFamily: F, fontWeight: 700, fontSize: size, boxShadow: "0 0 24px rgba(180,200,255,.3)" }}>{text}</div>;
};
const Lockers: React.FC<{ o?: number }> = ({ o = .32 }) => <svg width={1920} height={1080} style={{ position: "absolute", opacity: o }} fill="none" stroke={LINE} strokeWidth={3}>
  {Array.from({ length: 12 }, (_, i) => <g key={i}><rect x={150 + i * 140} y={430} width={120} height={470} rx={4} /><line x1={170 + i * 140} y1={470} x2={250 + i * 140} y2={470} /><line x1={170 + i * 140} y1={490} x2={250 + i * 140} y2={490} /></g>)}</svg>;
const Tables: React.FC = () => <svg width={1920} height={1080} style={{ position: "absolute", opacity: .35 }} fill="none" stroke={LINE} strokeWidth={3}>
  <rect x={120} y={760} width={420} height={18} rx={6} /><line x1={150} y1={778} x2={150} y2={900} /><line x1={510} y1={778} x2={510} y2={900} />
  <rect x={1380} y={760} width={420} height={18} rx={6} /><line x1={1410} y1={778} x2={1410} y2={900} /><line x1={1770} y1={778} x2={1770} y2={900} /></svg>;
// the illustrative tag for drawings that are not the study's numbers
const Illus: React.FC<{ o?: number }> = ({ o = 1 }) => <div style={{ position: "absolute", left: 70, top: 64, fontFamily: F, fontWeight: 600, fontSize: 22, color: "#8796bd", letterSpacing: 1, opacity: o }}>* Illustration</div>;
// FIRST / SECOND / THIRD tip card
const Tip: React.FC<{ t: number; a: number; n: string; text: string }> = ({ t, a, n, text }) => {
  const o = fin(t, a, .45);
  return <div style={{ position: "absolute", left: 170, top: 250, width: 760, opacity: o, transform: `translateX(${(1 - o) * -40}px)`, fontFamily: F, background: "rgba(10,20,52,.78)", border: "2px solid rgba(242,196,107,.6)", borderRadius: 28, padding: "40px 48px", boxShadow: "0 0 50px rgba(242,196,107,.18)" }}>
    <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: 8, color: GOLD }}>{n}</div>
    <div style={{ fontWeight: 800, fontSize: 62, lineHeight: 1.15, color: "#fff", marginTop: 16 }}>{text}</div>
  </div>;
};
// volume meter
const Meter: React.FC<{ t: number; a: number; x: number; y: number }> = ({ t, a, x, y }) => {
  const lvl = Math.min(12, Math.max(0, (t - a) * 18)) * (t > a + 1 ? (.92 + .08 * Math.sin(t * 23)) : 1);
  return <svg width={1920} height={1080} style={{ position: "absolute" }}>{Array.from({ length: 12 }, (_, i) => { const on = i < lvl, c = i >= 10 ? RED : i >= 7 ? GOLD : "#7fb2ff";
    return <rect key={i} x={x - 70} y={y - i * 44} width={140} height={34} rx={6} fill={on ? c : "#1a2a5c"} opacity={on ? 1 : .6} style={on ? { filter: `drop-shadow(0 0 10px ${c})` } : {}} />; })}</svg>;
};

// ---------- shots ----------
// a shot runs from `from` until the next shot starts (or its own `to`); r gets (u = local seconds, t = absolute seconds)
type Shot = { from: number; to?: number; push?: number; r: (u: number, t: number) => React.ReactNode; fadeIn?: number; fadeOut?: number };
const W = (i: number) => at(i) - .15;                    // a shot that starts with sentence i
const CH = (i: number) => ({ to: end(i) + .55, fadeOut: .7 }); // the last shot of a chapter fades to black
const TW = 74.54, FV = 153.6, CHANCE = 229.76, IMAG = 300.69, LINK = 335.96, NARROW = 411.5, LIKED = 431.5, LAST = 511.17;
export const SPOT_END = S[S.length - 1][2] + 2.8;
const SH: Shot[] = [
  // ===== 0:00 The moment you can't forget =====
  { from: 0, fadeIn: .8, r: (u, t) => <><Stage u={u} beam={960} /><Lockers /><Char img="you-stand" x={960} u={u} a={.3} h={440} /></> },
  { from: 3.05, r: (u) => <><Stage u={u} beam={900} /><Tables />
    <Char img="girl-bob-stare" x={330} u={u} a={.9} h={350} dim={.35} /><Char img="boy-red-sit-watch" x={1590} u={u} a={1.1} h={340} flip dim={.35} />
    <Char img="you-trip-tray" x={900 + 40 * eo(u / 1.2)} u={u} a={0} h={440} rot={-6 + 6 * eo(u / 1.2)} /></> },
  { from: 7.9, r: (u) => <><Stage u={u} beam={1180} />
    <svg width={1920} height={1080} style={{ position: "absolute" }}><Clock u={u} x={600} y={400} h0={8} h1={15.5} a={.6} d={3} /></svg>
    <Char img="you-stand" x={1180} u={u} a={0} h={460} />
    <div style={{ position: "absolute", left: 1180 + 22, top: 900 - 460 + 132, width: 20, height: 13, borderRadius: "50%", background: "#a5532f", opacity: fin(u, .4, .3), transform: "rotate(-14deg)" }} /></> },
  { from: 11.95, r: (u) => <><Stage u={u} beam={960} dim={.35} /><Char img="you-slipup-sit" x={960} u={u} a={0} h={380} />
    <div style={{ position: "absolute", left: 960 - 170, top: 150, width: 340, height: 240, borderRadius: 120, border: "3px solid rgba(207,216,234,.6)", background: "rgba(14,27,69,.7)", overflow: "hidden", opacity: fin(u, .4, .4), boxShadow: "0 0 30px rgba(143,166,214,.35)" }}>
      <Img src={staticFile("spot/you-trip-tray.png")} style={{ position: "absolute", left: 100, top: 30, height: 200, transform: `rotate(${-8 + 8 * ((u * .9) % 1)}deg)`, opacity: .9 }} /></div>
    <svg width={1920} height={1080} style={{ position: "absolute", opacity: fin(u, .3, .4) }} fill="rgba(207,216,234,.6)"><circle cx={940} cy={430} r={12} /><circle cx={925} cy={470} r={8} /></svg></> },
  { from: 14.85, r: (u) => <><Stage u={u} beam={null} /><Crowd u={u} a={.1} n={16} cols={8} x={960} y={700} gap={150} s={1.25} /></> },
  { from: 18.05, r: (u) => <><Stage u={u} beam={null} /><Crowd u={u} a={0} n={24} cols={8} x={960} y={520} gap={150} s={1.25} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontFamily: F, fontWeight: 900, fontSize: 200, color: GOLD, opacity: fin(u, 3.3, .4), textShadow: "0 0 40px rgba(242,196,107,.5)", transform: `scale(${.9 + .1 * eo((u - 3.3) / .5)})` }}>?</div></> },
  { from: 23.75, to: 29.6, fadeOut: 1.0, r: (u) => <><Stage u={u} beam={760} />
    <svg width={1920} height={1080} style={{ position: "absolute" }} fill="none" stroke="#cfd8ea" strokeWidth={5} strokeLinecap="round">
      <g opacity={fin(u, .5, .5)} transform="translate(1180 330)"><rect x={0} y={0} width={360} height={470} rx={18} fill="rgba(10,20,52,.6)" /><rect x={120} y={-24} width={120} height={46} rx={10} fill="#0e1b45" />
        {[0, 1, 2, 3].map((i) => <g key={i}><rect x={40} y={70 + i * 95} width={44} height={44} rx={6} /><line x1={110} y1={92 + i * 95} x2={310} y2={92 + i * 95} />
          {u > 1.6 + i * .5 && <path d={`M48 ${92 + i * 95} l12 14 l24 -30`} stroke={GOLD} strokeWidth={7} />}</g>)}</g></svg>
    <Char img="you-stand" x={760} u={u} a={.1} h={430} /></> },
  // ===== 0:30 The T-shirt =====
  { from: 30.3, fadeIn: .5, r: (u) => <><Stage u={u} beam={null} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 260, letterSpacing: 10, color: GOLD, opacity: fin(u, .2, .5), textShadow: "0 0 50px rgba(242,196,107,.55)" }}>2000</div></> },
  { from: 32.5, r: (u) => <><Stage u={u} beam={1220} />
    <Img src={staticFile("spot/char-master-spotlight.png")} style={{ position: "absolute", left: 160, top: 900, height: 330, transform: "translateY(-100%)", opacity: fin(u, 0, .4) * .6, filter: "brightness(.55) drop-shadow(0 0 14px rgba(220,232,255,.25))" }} />
    <Char img="you-stand" x={760 + 460 * eo((u - .8) / 1.6)} u={u} a={.4} h={430} /></> },
  { from: 36.25, push: .12, r: (u) => <><Stage u={u} beam={960} />
    <Char img="girl-bob-stare" x={420} u={u} a={4.2} h={330} dim={.4} /><Char img="boy-red-conversation" x={1510} u={u} a={4.5} h={340} flip dim={.4} />
    <Char img="you-shirt-embarrassing" x={960} u={u} a={0} h={560} /></> },
  // 15 into a room full of strangers
  { from: W(15), r: (u, t) => <><Stage u={u} beam={960} /><Crowd u={u} a={.3} n={14} cols={7} x={960} y={660} gap={210} s={1.2} />
    <Char img="you-shirt-embarrassing" x={960} u={u} a={0} h={440} /></> },
  // 16-18 when they came out: how many would recognise the face?
  { from: W(16), r: (u, t) => <><Stage u={u} beam={700} />
    <Char img="you-shirt-embarrassing" x={700} u={u} a={0} h={470} />
    <Bubble t={t} a={at(18)} x={1250} y={470} w={520} size={34} text="How many would recognize the face?" />
    <Char img="girl-bob-stare" x={1300} u={u} a={.3} h={330} dim={.2} flip /></> },
  // 19-23 46% guessed vs 23% real
  { from: W(19), r: (u, t) => <><Stage u={u} beam={null} />
    <Bars t={t} bars={[{ label: "THEY GUESSED", v: 46, a: 57.85 }, { label: "REALLY NOTICED", v: 23, a: 64.6, col: "#dfe8ff" }]} gap={520} />
    <Lbl x={960} y={150} text="HOW MANY RECOGNIZED THE SHIRT" size={32} color="#8fa6d6" o={fin(t, at(19), .4)} />
    {t > 66.0 && <Lbl x={1220} y={310} text="half" size={44} color={GOLD} o={fin(t, 66.1, .3)} />}</> },
  // 24 23% isn't zero
  { from: W(24), r: (u, t) => <><Stage u={u} beam={null} />
    <Crowd u={u} a={0} n={13} cols={13} x={960} y={620} gap={115} s={1.15} lit={3} litAt={70.2} />
    <Lbl x={960} y={720} text="23% — some people did notice" size={36} o={fin(t, 70.2, .4)} /></> },
  // 25 TWICE (room 1 in their minds, room 2 the real room)
  { from: W(25), ...CH(25), r: (u, t) => <><Stage u={u} beam={null} />
    <House2 t={t} a={at(25)} eyes1={8} eyes2={4} grow={TW + .2} l1="IN THEIR MINDS" l2="IN THE ROOM" /></> },
  // ===== 1:18 It's not just the bad days =====
  { from: at(26) - .35, fadeIn: .5, r: (u, t) => <><Stage u={u} beam={960} warm /><Char img="you-shirt-star" x={960} u={u} a={.2} h={460} /></> },
  { from: W(27), r: (u, t) => <><Stage u={u} beam={760} warm />
    <Char img="you-shirt-star" x={760} u={u} a={0} h={470} /><Char img="girl-long-clap" x={1300} u={u} a={at(28) - u * 0 - (t - u)} h={360} dim={.15} />
    <Bubble t={t} a={at(28)} x={1300} y={470} w={360} text="Someone everyone admired" size={28} warm /></> },
  // 29-30 48% -> 8% (the bar shrinks)
  { from: W(29), r: (u, t) => <><Stage u={u} beam={null} />
    <Bars t={t} bars={[{ label: t < 96.6 ? "THEY GUESSED" : "ACTUAL", v: t < 96.6 ? 48 : 8, from: t < 96.6 ? 0 : 48, a: t < 96.6 ? 92.2 : 96.7, ghost: t >= 96.6 ? 48 : undefined }]} />
    <Lbl x={960} y={150} text="WOULD REMEMBER THE FACE" size={32} color="#8fa6d6" o={fin(t, at(29), .4)} /></> },
  // 31-32 the spotlight you feel vs the one others see
  { from: W(31), r: (u, t) => <><Stage u={u} beam={null} />
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <defs><radialGradient id="cg"><stop offset="0" stopColor="#ffe6a8" stopOpacity=".45" /><stop offset="1" stopColor="#ffe6a8" stopOpacity="0" /></radialGradient></defs>
      <circle cx={560} cy={640} r={330 * eo((t - at(32)) / 1.2) + 40} fill="url(#cg)" />
      <circle cx={1360} cy={640} r={70 * eo((t - at(32) - 1) / 1) + 10} fill="url(#cg)" /></svg>
    <Char img="you-shirt-star" x={560} y={860} u={u} a={0} h={400} /><Char img="you-shirt-star" x={1360} y={860} u={u} a={.4} h={400} />
    <Lbl x={560} y={900} text="HOW IT FEELS TO YOU" size={30} o={fin(t, at(32), .4)} /><Lbl x={1360} y={900} text="WHAT OTHERS SEE" size={30} o={fin(t, at(32) + 1, .4)} /></> },
  // 33-36 the conversation study
  { from: W(33), r: (u, t) => <><Stage u={u} beam={960} />
    <Char img="girl-bob-stare" x={520} u={u} a={.2} h={330} dim={.15} /><Char img="you-talk-sit" x={860} u={u} a={0} h={380} />
    <Char img="girl-long-clap" x={1180} u={u} a={.3} h={360} dim={.15} flip /><Char img="boy-red-conversation" x={1460} u={u} a={.4} h={380} flip dim={.15} />
    <Bubble t={t} a={at(36)} x={760} y={520} w={300} text="Best point ★" size={28} warm /><Bubble t={t} a={at(36) + 1.2} x={1080} y={430} w={300} text="Slip-up…" size={28} /></> },
  // 37-38 more attention than the group said
  { from: W(37), r: (u, t) => <><Stage u={u} beam={null} />
    <Bars t={t} bars={[{ label: "HOW MUCH I STOOD OUT", v: 70, a: at(37) + .8 }, { label: "WHAT THE GROUP SAID", v: 38, a: at(37) + 2.2, col: "#dfe8ff" }]} gap={520} max={100} note="* Illustration" /></> },
  // 39 replayed all the way home
  { from: W(39), r: (u, t) => <><Stage u={u} beam={1100} dim={.3} />
    <svg width={1920} height={1080} style={{ position: "absolute", opacity: .3 }} fill="none" stroke={LINE} strokeWidth={3}><rect x={260} y={300} width={260} height={220} rx={6} /><line x1={390} y1={300} x2={390} y2={520} /><line x1={260} y1={410} x2={520} y2={410} /><circle cx={340} cy={360} r={26} fill="#dfe8ff" stroke="none" opacity={.6} /></svg>
    <Char img="you-phone-worried" x={1100} u={u} a={0} h={440} />
    <Bubble t={t} a={at(39) + 1} x={1100} y={380} w={360} text="Why did I say that?" size={28} /></> },
  // 40-44 the ranking board: own guess #2, the group #3
  { from: W(40), r: (u, t) => { const k = eo((t - 140.6) / .7), row = 1 + k, rows = ["Comment A", "Comment B", "Comment C", "Comment D", "Comment E"];
    return <><Stage u={u} beam={null} />
      <div style={{ position: "absolute", left: 560, top: 230, width: 800, fontFamily: F, opacity: fin(t, at(41), .5) }}>
        {rows.map((r, i) => <div key={i} style={{ position: "absolute", top: i * 110, left: 0, right: 0, height: 88, borderRadius: 16, background: "rgba(30,48,100,.55)", border: "1.5px solid rgba(143,166,214,.35)", display: "flex", alignItems: "center", paddingLeft: 30, fontWeight: 700, fontSize: 36, color: "#8fa6d6" }}><span style={{ color: "#cfd9f5", width: 80 }}>#{i + 1}</span>{i >= 1 ? rows[i + (i >= row ? 0 : 0)] : r}</div>)}
        <div style={{ position: "absolute", top: row * 110, left: -12, right: -12, height: 88, borderRadius: 16, background: "rgba(242,196,107,.92)", display: "flex", alignItems: "center", paddingLeft: 42, fontWeight: 800, fontSize: 38, color: INK, boxShadow: "0 0 30px rgba(242,196,107,.5)", opacity: fin(t, 134.5, .4) }}>
          <span style={{ width: 80 }}>#{t < 140.6 ? 2 : 3}</span>YOUR SLIP-UP</div>
      </div>
      <Lbl x={1620} y={260 + row * 110} text={t < 140.6 ? "YOU THOUGHT" : "THE GROUP"} size={30} color={GOLD} w={300} o={fin(t, 136.3, .3)} /></>; } },
  { from: W(44), ...CH(44), r: (u, t) => <><Stage u={u} beam={960} /><Char img="you-slipup-sit" x={960} u={u} a={0} h={400} glow="rgba(242,196,107,.55)" /></> },
  // ===== 2:26 Why your brain does this =====
  { from: at(45) - .35, fadeIn: .5, r: (u, t) => <><Stage u={u} beam={960} /><Char img="you-stand" x={960} u={u} a={.2} h={440} />
    <svg width={1920} height={1080} style={{ position: "absolute" }}><circle cx={960} cy={530} r={95 + 8 * Math.sin(t * 2)} fill="none" stroke={GOLD} strokeWidth={3} opacity={.5 * fin(t, at(45) + 1, .5)} /></svg></> },
  // 46-47 inside, at FULL VOLUME
  { from: W(46), r: (u, t) => <><Stage u={u} beam={760} /><Char img="you-speech-nervous" x={760} u={u} a={0} h={470} /><Meter t={t} a={FV - .4} x={1340} y={820} /></> },
  { from: W(48), r: (u, t) => { const sh = 4 * Math.sin(t * 40) * (t > 156.6 ? 1 : 0);
    return <><Stage u={u} beam={960} warm={t < 156.6} />
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${sh}px)` }}><Char img="you-speech-nervous" x={960} u={u} a={0} h={520} /></div>
      <svg width={1920} height={1080} style={{ position: "absolute", opacity: fin(t, at(48), .4) * (t < 156.6 ? 1 : .3) }}>{[0, 1, 2].map((i) => <path key={i} d={`M${1100 + i * 30} ${520 - ((t * 60 + i * 40) % 120)} q12 -14 0 -28 q-12 -14 0 -28`} fill="none" stroke={RED} strokeWidth={5} strokeLinecap="round" />)}</svg></>; } },
  { from: W(49), r: (u, t) => <><Stage u={u} beam={960} /><Char img="you-speech-nervous" x={960} u={u} a={0} h={520} glow="rgba(242,196,107,.6)" /></> },
  // 51 start from how it felt, adjust — not far enough
  { from: W(51), r: (u, t) => { const k = eo((t - 169) / 2.5), v = 92 - 30 * k;
    return <><Stage u={u} beam={null} />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <line x1={300} y1={760} x2={1620} y2={760} stroke="#8fa6d6" strokeWidth={4} />
        <rect x={300} y={600} width={1320 * .92} height={56} rx={10} fill={GOLD} opacity={.85 * fin(t, at(51), .4)} />
        <rect x={300} y={680} width={1320 * v / 100} height={56} rx={10} fill="#dfe8ff" opacity={fin(t, 168.5, .4)} />
        <line x1={300 + 1320 * .25} y1={570} x2={300 + 1320 * .25} y2={780} stroke="#7fb2ff" strokeWidth={4} strokeDasharray="10 8" opacity={fin(t, 172.4, .4)} /></svg>
      <Lbl x={760} y={520} text="HOW IT FELT TO YOU" size={30} color={GOLD} o={fin(t, at(51), .4)} />
      <Lbl x={1240} y={800} text="YOUR GUESS ABOUT OTHERS" size={30} o={fin(t, 168.5, .4)} />
      <Lbl x={630} y={800} text="WHAT THEY NOTICED" size={26} color="#7fb2ff" w={380} o={fin(t, 172.4, .4)} />
      <Illus o={fin(t, at(51), .4)} /></>; } },
  // 52-55 3 out of 4 thought smaller — still guessed half
  { from: W(52), r: (u, t) => <><Stage u={u} beam={null} />
    {t < at(55) - .1 ? <><Crowd u={u} a={1.5} n={4} cols={4} x={960} y={640} gap={220} s={2.2} lit={3} litAt={179.9} />
      <Lbl x={960} y={760} text="3 OUT OF 4" size={96} color={GOLD} weight={800} w={900} o={fin(t, 179.9, .4)} />
      <Lbl x={960} y={880} text="stopped to consider smaller numbers" size={32} w={900} o={fin(t, 181.6, .4)} /></>
    : <BigNum t={t} a={at(55) + .1} v={50} x={960} y={480} label="STILL GUESSED ABOUT" suf="%" size={220} />}</> },
  // 56-57 everyone is busy watching themselves
  { from: W(56), ...CH(57), r: (u, t) => <><Stage u={u} beam={null} />
    <Char img="girl-long-mirror" x={380} u={u} a={.2} h={380} /><Char img="boy-red-conversation" x={760} u={u} a={.5} h={390} />
    <Char img="girl-bob-stare" x={1160} u={u} a={.8} h={350} /><Char img="you-phone-worried" x={1540} u={u} a={1.1} h={390} />
    <Bubble t={t} a={190.6} x={380} y={500} w={270} text="My hair…" size={28} /><Bubble t={t} a={191.6} x={760} y={490} w={300} text="What I said…" size={28} />
    <Bubble t={t} a={193.6} x={1160} y={530} w={300} text="My clothes…" size={28} /><Bubble t={t} a={194.8} x={1540} y={490} w={300} text="My moment…" size={28} /></> },
  // ===== 3:23 Your feelings don't leak out either =====
  { from: at(58) - .35, fadeIn: .5, r: (u, t) => <><Stage u={u} beam={960} /><Char img="you-lie-nervous" x={960} u={u} a={.2} h={450} />
    {["nervous", "lying", "about to cry"].map((w, i) => <Lbl key={w} x={[620, 1310, 1290][i]} y={[380, 330, 560][i]} text={w} size={40} color="rgba(207,217,245,.75)" w={360} o={fin(t, [207.8, 208.6, 209.4][i], .4) * .9} weight={600} />)}</> },
  // 60-64 the lie study
  { from: W(60), r: (u, t) => <><Stage u={u} beam={960} />
    <Char img="girl-bob-stare" x={420} u={u} a={.3} h={330} dim={.25} /><Char img="boy-red-sit-watch" x={1500} u={u} a={.5} h={330} flip dim={.25} />
    <Char img="you-lie-nervous" x={960} u={u} a={0} h={450} />
    <Bubble t={t} a={at(62)} x={960} y={360} w={460} text="Half of them saw through me" size={28} /></> },
  { from: W(63), r: (u, t) => { const k = eo((t - 228.4) / .8), th = Math.PI * (.5 + .06 * k);
    return <><Stage u={u} beam={null} />
      <svg width={1920} height={1080} style={{ position: "absolute", opacity: fin(t, at(63), .4) }}>
        <path d="M660 840 A300 300 0 0 1 1260 840" fill="none" stroke="#2a3f7a" strokeWidth={34} />
        <line x1={960} y1={840} x2={960} y2={520} stroke="#8fa6d6" strokeWidth={4} strokeDasharray="10 8" />
        <line x1={960} y1={840} x2={960 - 270 * Math.cos(th)} y2={840 - 270 * Math.sin(th)} stroke={GOLD} strokeWidth={10} strokeLinecap="round" />
        <circle cx={960} cy={840} r={16} fill={GOLD} /></svg>
      <Lbl x={960} y={880} text="50% = PURE GUESSING" size={28} color="#8fa6d6" o={fin(t, at(63), .4)} /></>; } },
  // 65-68 vinegar: 5 of 10 guessed, really ~3
  { from: W(65), r: (u, t) => <><Stage u={u} beam={960} /><Char img="you-drink-disgust" x={960} u={u} a={0} h={470} /></> },
  { from: W(67), r: (u, t) => <><Stage u={u} beam={null} />
    <Crowd u={u} a={0} n={10} cols={10} x={960} y={600} gap={150} s={1.5} lit={t < 247.4 ? 5 : 3} litAt={241.9} />
    <Lbl x={960} y={240} text={t < 247.4 ? "THEY GUESSED: 5 OF 10" : "REALLY: ABOUT 3"} size={64} color={GOLD} weight={800} w={1200} o={fin(t, 241.9, .4)} /></> },
  // 69-71 when it tasted good the illusion vanished
  { from: W(69), r: (u, t) => <><Stage u={u} beam={960} warm /><Char img="you-laugh-profile" x={960} u={u} a={0} h={460} /></> },
  { from: W(71), r: (u, t) => <><Stage u={u} beam={960} /><Char img="you-lie-nervous" x={960} u={u} a={0} h={450} /></> },
  // 72-73 written across your face, but nobody can read it
  { from: W(72), r: (u, t) => <><Stage u={u} beam={960} />
    <Char img="you-stand" x={960} u={u} a={0} h={460} glow="rgba(242,196,107,.7)" />
    <Char img="girl-bob-stare" x={440} u={u} a={.5} h={330} dim={.3} /><Char img="boy-red-conversation" x={1480} u={u} a={.7} h={360} flip dim={.3} />
    <Lbl x={440} y={360} text="?" size={90} color="#8fa6d6" o={fin(t, at(73), .3)} weight={800} w={200} /><Lbl x={1480} y={330} text="?" size={90} color="#8fa6d6" o={fin(t, at(73) + .3, .3)} weight={800} w={200} /></> },
  // 74-80 the speech study
  { from: W(74), r: (u, t) => <><Stage u={u} beam={960} />
    <Img src={staticFile("spot/char-master-spotlight.png")} style={{ position: "absolute", left: 960, top: 1080, height: 300, transform: "translate(-50%,-62%)", opacity: .45, filter: "brightness(.45)" }} />
    <Char img="you-speech-nervous" x={960} y={760} u={u} a={0} h={520} />
    <Bubble t={t} a={at(76)} x={1430} y={420} w={420} text="They can't see your nerves as clearly as you feel them" size={26} warm /></> },
  { from: W(77), ...CH(80), r: (u, t) => <><Stage u={u} beam={960} warm />
    <Img src={staticFile("spot/char-master-spotlight.png")} style={{ position: "absolute", left: 960, top: 1080, height: 300, transform: "translate(-50%,-62%)", opacity: .45, filter: "brightness(.45)" }} />
    <Char img="you-speech-confident" x={960} y={760} u={u} a={0} h={520} /></> },
  // ===== 4:49 The audience in your head =====
  { from: at(81) - .35, fadeIn: .5, r: (u, t) => <><Stage u={u} beam={960} /><Char img="you-phone-worried" x={960} u={u} a={.2} h={420} /></> },
  { from: W(83), r: (u, t) => <><Stage u={u} beam={null} />
    <svg width={1920} height={1080} style={{ position: "absolute", opacity: fin(t, IMAG, .8) }}>
      {Array.from({ length: 3 }, (_, r) => Array.from({ length: 11 - r }, (_, c) => { const x = 960 + (c - (10 - r) / 2) * (150 + r * 10), y = 700 + r * 110;
        return <g key={`${r}-${c}`} fill="#050a1c" opacity={.9}><circle cx={x} cy={y - 50} r={34} /><rect x={x - 48} y={y - 16} width={96} height={130} rx={40} /><circle cx={x - 12} cy={y - 54} r={4} fill="#8fa6d6" /><circle cx={x + 12} cy={y - 54} r={4} fill="#8fa6d6" /></g>; }))}</svg>
    <Lbl x={960} y={420} text="David Elkind, 1967" size={40} color="#cfd9f5" w={900} o={fin(t, IMAG + .3, .4)} weight={600} /></> },
  { from: W(86), r: (u, t) => <><Stage u={u} beam={null} />
    <BigNum t={t} a={at(86) + 1.2} v={700} suf="" x={960} y={360} label="NEARLY" size={200} />
    <Lbl x={960} y={500} text="SCHOOL STUDENTS" size={40} o={fin(t, at(86) + 1.3, .4)} />
    <Lbl x={960} y={640} text="Most self-conscious: 8th graders" size={52} color={GOLD} weight={800} w={1400} o={fin(t, at(87), .4)} /></> },
  // 88-90 into your pocket: social media
  { from: W(88), r: (u, t) => <><Stage u={u} beam={760} /><Char img="you-phone-worried" x={760} u={u} a={0} h={440} />
    <svg width={1920} height={1080} style={{ position: "absolute", opacity: fin(t, at(89), .5) }}>
      <g transform="translate(1340 520)"><rect x={-150} y={-280} width={300} height={560} rx={38} fill="#0d1a33" stroke="#cfd8ea" strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => <Eye key={i} x={-80 + (i % 3) * 80} y={-180 + Math.floor(i / 3) * 110} s={.8} o={fin(t, at(89) + .3 + i * .12, .2)} />)}</g></svg></> },
  { from: W(90), r: (u, t) => <><Stage u={u} beam={null} />
    <svg width={1920} height={1080} style={{ position: "absolute", opacity: fin(t, at(90), .4) }}>
      <line x1={460} y1={560} x2={1460} y2={560} stroke="#2a3f7a" strokeWidth={20} strokeLinecap="round" />
      <line x1={460} y1={560} x2={460 + 1000 * (.2 + .6 * (.5 + .5 * Math.sin(t * 1.2)))} y2={560} stroke={GOLD} strokeWidth={20} strokeLinecap="round" />
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={460 + i * 200} y1={600} x2={460 + i * 200} y2={620} stroke="#8fa6d6" strokeWidth={4} />)}</svg>
    <Lbl x={960} y={420} text="HOW MUCH YOU THINK ABOUT YOUR ONLINE AUDIENCE" size={34} w={1500} o={fin(t, at(90) + 1, .4)} /></> },
  // 91-94 1,200+ students; a link, not proof
  { from: W(91), r: (u, t) => <><Stage u={u} beam={null} />
    <BigNum t={t} a={327.9} v={1200} plus suf="" x={960} y={300} label="HIGH SCHOOL STUDENTS" size={170} />
    <svg width={1920} height={1080} style={{ position: "absolute", opacity: fin(t, at(92), .5) }}>
      <circle cx={600} cy={680} r={95} fill="none" stroke="#cfd8ea" strokeWidth={4} /><circle cx={1320} cy={680} r={95} fill="none" stroke="#cfd8ea" strokeWidth={4} />
      <line x1={700} y1={680} x2={1220} y2={680} stroke={GOLD} strokeWidth={6} strokeDasharray="16 12" /></svg>
    <Lbl x={600} y={650} text="IMAGINED AUDIENCE" size={24} w={180} o={fin(t, at(92), .5)} /><Lbl x={1320} y={650} text="FEELINGS OF DEPRESSION" size={24} w={180} o={fin(t, at(92), .5)} /></> },
  { from: W(94), r: (u, t) => <><Stage u={u} beam={null} /><Crowd u={u} a={0} n={24} cols={12} x={960} y={720} gap={130} s={1} />
    <Char img="you-phone-worried" x={960} y={640} u={u} a={.2} h={360} /></> },
  // 95-98 Japan 77% vs international 56% (OECD PISA 2018)
  { from: W(95), ...CH(98), r: (u, t) => <><Stage u={u} beam={null} />
    <Bars t={t} bars={[{ label: "JAPAN (AGE 15)", v: 77, a: 347.4 }, { label: "INTERNATIONAL AVG.", v: 56, a: 355.2, col: "#dfe8ff" }]} gap={520} />
    <Lbl x={960} y={130} text="WORRY WHAT OTHERS THINK WHEN THEY FAIL" size={32} color="#8fa6d6" w={1400} o={fin(t, at(97), .4)} /></> },
  // ===== 5:58 The spotlight fades =====
  { from: at(99) - .35, fadeIn: .5, r: (u, t) => <><Stage u={u} beam={960} dim={eo((t - at(100)) / 3) * .7} /><Char img="you-relief" x={960} u={u} a={.2} h={450} /></> },
  { from: W(102), r: (u, t) => <><Stage u={u} beam={null} />
    <Char img="you-shirt-embarrassing" x={560} u={u} a={0} h={380} y={560} /><Char img="you-shirt-embarrassing" x={1360} u={u} a={2.5} h={380} y={560} />
    <Lbl x={560} y={580} text="JUST PUT IT ON" size={30} o={fin(t, at(103), .4)} /><Lbl x={1360} y={580} text="AFTER 15 MINUTES" size={30} o={fin(t, 374.0, .4)} />
    <BigNum t={t} a={368.7} v={51} x={560} y={760} size={130} /><BigNum t={t} a={375.4} v={37} x={1360} y={760} size={130} color="#dfe8ff" /></> },
  { from: W(106), r: (u, t) => <><Stage u={u} beam={960} dim={.4} /><Char img="you-relief" x={960} u={u} a={0} h={450} />
    <svg width={1920} height={1080} style={{ position: "absolute" }}><Clock u={t} x={500} y={380} h0={10} h1={10.25} a={at(107)} d={2} /></svg></> },
  // 109-111 the makeup study
  { from: W(109), r: (u, t) => <><Stage u={u} beam={760} /><Char img="girl-long-mirror" x={760} u={u} a={0} h={450} />
    {t > at(110) - .2 && <Bars t={t} bars={[{ label: "EXPECTED", v: 80, a: at(110) + 2 }, { label: "NOTICED", v: 30, a: at(111) + .5, col: "#dfe8ff" }]} x={1380} gap={260} H={380} base={800} />}
    <Illus o={fin(t, at(110) + 1.8, .4)} /></> },
  // 112-117 to be clear... narrower and kinder
  { from: W(112), r: (u, t) => <><Stage u={u} beam={null} /><Crowd u={u} a={0} n={16} cols={8} x={960} y={560} gap={150} s={1.25} lit={3} litAt={at(112) + 1.5} /></> },
  { from: W(113), r: (u, t) => <><Stage u={u} beam={960} />
    <Char img="girl-bob-stare" x={620} u={u} a={0} h={360} /><Char img="you-speech-nervous" x={1220} y={820} u={u} a={.3} h={460} /></> },
  { from: NARROW - .3, r: (u, t) => <><Stage u={u} beam={null} /></> },
  { from: W(115), ...CH(117), r: (u, t) => <><Stage u={u} beam={null} />
    <Lbl x={960} y={240} text="WE OVERESTIMATE HOW MUCH OTHERS NOTICE" size={34} color="#cfd9f5" w={1500} o={fin(t, at(115), .4)} />
    <Lbl x={560} y={430} text="46% → 23%" size={96} color={GOLD} weight={800} w={800} o={fin(t, at(116), .4)} /><Lbl x={560} y={560} text="by half" size={36} w={600} o={fin(t, at(116), .4)} />
    <Lbl x={1360} y={430} text="48% → 8%" size={96} color={GOLD} weight={800} w={800} o={fin(t, at(117), .4)} /><Lbl x={1360} y={560} text="by much more" size={36} w={600} o={fin(t, at(117), .4)} /></> },
  // ===== 7:03 What everyone else remembers =====
  { from: at(118) - .35, fadeIn: .5, r: (u, t) => <><Stage u={u} beam={960} warm />
    <Char img="you-talk-sit" x={780} u={u} a={.2} h={380} /><Char img="boy-red-conversation" x={1180} u={u} a={.4} h={400} flip /></> },
  { from: LIKED - .2, r: (u, t) => <><Stage u={u} beam={null} warm /></> },
  { from: W(120), ...CH(120), r: (u, t) => <><Stage u={u} beam={null} />
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      {[[0, "THE AWKWARD MOMENTS THEY NOTICED", 72, 30, RED], [1, "HOW MUCH THEY LIKED YOU", 45, 78, GOLD]].map(([i, l, g, r, c]) => { const y = 420 + (i as number) * 260, a = at(120) + (i as number) * 2.6;
        return <g key={i as number} opacity={fin(t, a, .4)}>
          <rect x={460} y={y} width={1000} height={44} rx={10} fill="#1a2a5c" />
          <rect x={460} y={y} width={1000 * (r as number) / 100 * eo((t - a - .5) / 1)} height={44} rx={10} fill={c as string} />
          <line x1={460 + 10 * (g as number)} y1={y - 22} x2={460 + 10 * (g as number)} y2={y + 66} stroke="#fff" strokeWidth={5} strokeDasharray="8 6" />
          <text x={460} y={y - 30} fontFamily={F} fontWeight={700} fontSize={30} fill="#cfd9f5" letterSpacing={2}>{l as string}</text>
          <text x={460 + 10 * (g as number)} y={y + 100} textAnchor="middle" fontFamily={F} fontWeight={600} fontSize={24} fill="#fff">your guess</text></g>; })}</svg>
    <Illus o={fin(t, at(120), .4)} /></> },
  // ===== 7:22 What you can do with this =====
  { from: at(121) - .3, fadeIn: .5, r: (u, t) => <><Stage u={u} beam={960} /><Char img="you-stand" x={960} u={u} a={.2} h={440} /></> },
  { from: W(122), r: (u, t) => <><Stage u={u} beam={1380} /><Tip t={t} a={at(122)} n="FIRST" text="Remember the T-shirt." />
    <Char img="you-shirt-embarrassing" x={1380} u={u} a={.3} h={480} />
    <Lbl x={550} y={720} text="46% guessed → 23% real" size={44} color={GOLD} weight={800} w={800} o={fin(t, at(125), .4)} />
    <Lbl x={550} y={800} text="Your number is probably too high." size={36} w={800} o={fin(t, at(126), .4)} /></> },
  { from: at(127) - .2, r: (u, t) => <><Stage u={u} beam={1380} /><Tip t={t} a={at(127)} n="SECOND" text="Your nerves are louder inside than outside." />
    <Char img={t < at(129) ? "you-speech-nervous" : "you-speech-confident"} x={1380} u={u} a={.3} h={500} /></> },
  { from: at(130) - .2, ...CH(134), r: (u, t) => <><Stage u={u} beam={1380} warm /><Tip t={t} a={at(130)} n="THIRD" text="Give them more credit. They liked you more than you think." />
    <Char img="you-talk-sit" x={1240} u={u} a={.3} h={380} /><Char img="boy-red-conversation" x={1600} u={u} a={.5} h={400} flip /></> },
  // ===== the ending =====
  { from: at(135) - .5, fadeIn: .7, r: (u, t) => <><Stage u={u} beam={960} /><Lockers /><Char img="you-stand" x={960} u={u} a={.2} h={440} /></> },
  { from: W(137), r: (u, t) => <><Stage u={u} beam={null} /><Tables />
    <Char img="girl-bob-stare" x={330} u={u} a={0} h={350} /><Char img="boy-red-sit-watch" x={1590} u={u} a={0} h={340} flip />
    <Char img="girl-long-clap" x={960} u={u} a={.2} h={360} /></> },
  { from: W(139), r: (u, t) => <><Stage u={u} beam={null} />
    <Char img="girl-long-mirror" x={420} u={u} a={0} h={380} /><Char img="boy-red-conversation" x={960} u={u} a={.2} h={390} /><Char img="girl-bob-stare" x={1500} u={u} a={.4} h={350} />
    <Bubble t={t} a={at(139) + 2.5} x={420} y={500} w={300} text="My moment…" size={28} /><Bubble t={t} a={at(139) + 3} x={960} y={490} w={300} text="My moment…" size={28} /><Bubble t={t} a={at(139) + 3.5} x={1500} y={530} w={300} text="My moment…" size={28} /></> },
  { from: W(141), to: SPOT_END, fadeOut: 1.4, push: .08, r: (u, t) => { const off = fin(t, LAST - .2, .5);
    return <><Stage u={u} beam={960} dim={off} /><AbsoluteFill style={{ opacity: 1 - .85 * off }}><Lockers o={.25} /><Char img="you-stand" x={960} u={u} a={0} h={440} /></AbsoluteFill></>; } },
];

// big key words (the bottom caption steps aside while one is up)
type Big = { a: number; b: number; pre?: string; big: string; post?: string; size?: number; y?: number; color?: string };
const BIGS: Big[] = [
  { a: 14.85, b: 16.25, pre: "Everyone", big: "SAW IT", size: 250, y: 330 },
  { a: 72.1, b: 77.0, pre: "the room was filled with", big: "TWICE", post: "as many watching eyes", size: 170, y: 225 },
  { a: 153.2, b: 155.6, pre: "at", big: "FULL VOLUME", size: 190, y: 300 },
  { a: 228.1, b: 230.6, pre: "only slightly better than", big: "CHANCE", size: 210, y: 300 },
  { a: 300.4, b: 302.5, pre: "the", big: "IMAGINARY AUDIENCE", size: 150, y: 280 },
  { a: 335.5, b: 338.4, pre: "That's", big: "A LINK, NOT PROOF", post: "of cause and effect", size: 150, y: 420 },
  { a: 411.3, b: 414.2, pre: "The point is", big: "NARROWER. KINDER.", size: 160, y: 470 },
  { a: 431.3, b: 434.2, pre: "after real conversations", big: "THEY LIKED YOU MORE", post: "than we think", size: 140, y: 470 },
];
// study cards (top-right, ~3 s)
const SOURCES: [number, string, string?][] = [
  [at(11), "Gilovich, Medvec & Savitsky (2000)", "Cornell University"],
  [at(60), "Gilovich, Savitsky & Medvec (1998)", "The illusion of transparency"],
  [at(75), "Savitsky & Gilovich (2003)"],
  [at(86), "Elkind & Bowen (1979)"],
  [at(96), "OECD PISA 2018"],
  [at(119), "Boothby et al. (2018)", "The liking gap"],
];

export const SPOT_TEST_END = 44.4;
export const SPOT_FRAMES = Math.round(SPOT_END * FPS);

export const SpotEpisode: React.FC = () => {
  useFonts();
  const f = useCurrentFrame(), t = f / FPS;
  const caps = React.useMemo(() => S.filter(([i]) => i !== 142).flatMap(([, a, b, x]) => phrases(x, a, b)), []);
  const idx = SH.findIndex((s, i) => t >= s.from && t < (s.to ?? (SH[i + 1]?.from ?? SPOT_END)));
  const big = BIGS.find((b) => t >= b.a && t < b.b);
  let body: React.ReactNode = null, op = 1;
  if (idx >= 0) {
    const sh = SH[idx], to = sh.to ?? (SH[idx + 1]?.from ?? SPOT_END), u = t - sh.from, k = u / (to - sh.from), z = 1 + (sh.push ?? .05) * ease(Math.min(1, k));
    op = (sh.fadeIn ? fin(u, 0, sh.fadeIn) : 1) * (sh.fadeOut ? fout(t, to, sh.fadeOut) : 1);
    const dir = idx % 3, dx = dir === 1 ? -30 * k : dir === 2 ? 30 * k : 0;
    body = <AbsoluteFill style={{ transform: `translateX(${dx}px) scale(${z})`, transformOrigin: "50% 55%" }}>{sh.r(u, t)}</AbsoluteFill>;
  }
  const endO = fin(t, LAST + .1, .9) * fout(t, SPOT_END - .2, 1.2);
  return (<AbsoluteFill style={{ background: "#03060f" }}>
    <AbsoluteFill style={{ opacity: op }}>{body}<Dust t={t} /></AbsoluteFill>
    <Vignette />
    {big && <SpotWord u={t} a={big.a} b={big.b} pre={big.pre} big={big.big} post={big.post} size={big.size} y={big.y} color={big.color} />}
    {SOURCES.map(([a, x, s], i) => <Source key={i} u={t} a={a} d={3.2} text={x} sub={s} />)}
    {!big && <Caption t={t} caps={caps} />}
    {t > LAST && <div style={{ position: "absolute", left: 0, right: 0, top: 500, textAlign: "center", fontFamily: F, fontWeight: 600, fontSize: 64, color: "#fff", opacity: endO, textShadow: "0 0 24px rgba(220,232,255,.35)" }}>It was only ever in your head.</div>}
  </AbsoluteFill>);
};
