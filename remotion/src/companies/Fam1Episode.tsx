// 家族心理学アニメ 第1本「厳しい親が、何も知らなかった理由」(1920x1080).
// Look (from the reference breakdown): glowing white characters (cut-outs in public/fam1), two kinds of ground —
// the navy STAGE (spotlight, floor reflection) for explanations and the sepia LINE-ART scene for the story —
// and fixed devices that return: the phone map with glowing dots, the night time ruler, count-up numbers with
// a citation, big keyword cards. Shots are one per sentence (or a held stage that changes inside it).
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import SENT from "./fam1_sentences.json";
import { useFonts } from "./fonts";

const FPS = 30, F = "NSJP";
const S = SENT as [number, number, number, string][];
const at = (i: number) => S[i - 1][1];
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.bezier(.45, 0, .2, 1);
const fin = (u: number, a: number, d = .4) => interpolate(u, [a, a + d], [0, 1], { ...cl, easing: ease });
const eo = (x: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
const GOLD = "#E8B95A", SEP = "#D9B27A", NAVY = "#0A2257", BLUE = "#5FA8FF";
// shot-local time and whether the line art should draw itself in (a new place, not the same room as the shot before)
const ShotCtx = React.createContext({ u: 9, draw: false });

// ---------- grounds ----------
const Stage: React.FC<{ u: number; spots?: number[]; tint?: string; warm?: boolean }> = ({ u, spots = [960], tint, warm }) => (
  <AbsoluteFill style={{ background: warm ? "radial-gradient(ellipse at 50% 35%, #5a4220 0%, #2e2010 55%, #160f06 100%)" : `radial-gradient(ellipse at 50% 35%, #12306f 0%, ${NAVY} 55%, #06163b 100%)` }}>
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".18" /><stop offset="1" stopColor="#fff" stopOpacity=".02" /></linearGradient>
        <radialGradient id="pool"><stop offset="0" stopColor={tint || "#fff"} stopOpacity=".28" /><stop offset="1" stopColor={tint || "#fff"} stopOpacity="0" /></radialGradient>
      </defs>
      {spots.map((x, i) => <g key={i} opacity={.6 + .4 * fin(u, 0, .8)}>
        <path d={`M${x - 70} -20 L${x + 70} -20 L${x + 260} 930 L${x - 260} 930Z`} fill="url(#beam)" />
        <ellipse cx={x} cy={930} rx={300} ry={46} fill="url(#pool)" /></g>)}
      <rect x={0} y={930} width={1920} height={150} fill={warm ? "#1a1208" : "#061331"} opacity={.55} />
      {spots.flatMap((x, i) => Array.from({ length: 14 }, (_, j) => { const sd = (j * 53.7 + i * 17) % 1, px = x + (((j * 97) % 300) - 150) * (.4 + .6 * sd), py = 900 - ((u * (18 + 22 * sd) + j * 61) % 800);
        return <circle key={`${i}-${j}`} cx={px + 10 * Math.sin(u * .7 + j)} cy={py} r={1.6 + 2.2 * sd} fill="#fff" opacity={.18 + .25 * Math.sin(u * 1.3 + j) ** 2} />; }))}
    </svg>
  </AbsoluteFill>
);
// sepia line-art ground; children are SVG line drawings
const Sepia: React.FC<{ children?: React.ReactNode; warm?: number }> = ({ children, warm = 1 }) => {
  const { u, draw } = React.useContext(ShotCtx), k = draw ? eo(u / 1.4) : 1;
  return (<AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${warm ? "#3a2c1c" : "#1c2433"} 0%, ${warm ? "#1c140c" : "#0d1320"} 100%)` }}>
    <svg width={1920} height={1080} style={{ position: "absolute", strokeDasharray: k < 1 ? 4200 : undefined, strokeDashoffset: k < 1 ? 4200 * (1 - k) : undefined }} fill="none" stroke={warm ? SEP : "#8fb3e6"} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
  </AbsoluteFill>);
};
// ---------- characters ----------
const H: Record<string, number> = { father: 470, mother: 420, sota: 380, you: 410, you18: 450 };
const Char: React.FC<{ img: string; x: number; y?: number; u: number; a?: number; h?: number; flip?: boolean; glow?: string }> = ({ img, x, y = 905, u, a = 0, h, flip, glow }) => {
  const who = img.startsWith("you18") ? "you18" : img.split("-")[0];
  const hh = (h ?? H[who] ?? 420) * (img.includes("sit") ? .8 : img.includes("sleep") ? .45 : 1);
  const o = fin(u, a, .45), bob = 1 + .008 * Math.sin((u + x) * 2.2), pop = 1 + .06 * Math.sin(Math.PI * Math.min(1, Math.max(0, (u - a) / .5))) * (u - a < .5 ? 1 : 0);
  return <Img src={staticFile(`fam1/${img}.png`)} style={{ position: "absolute", left: x, top: y, height: hh, transform: `translate(-50%, -100%) translateY(${(1 - o) * 26}px) scale(${pop}) scaleX(${flip ? -1 : 1}) scaleY(${bob})`, transformOrigin: "50% 100%", opacity: o, filter: `drop-shadow(0 0 ${glow ? 26 : 16}px ${glow || "rgba(255,255,255,.35)"})` }} />;
};
// ---------- devices ----------
const Phone: React.FC<{ u: number; x: number; y: number; s?: number; dots?: [number, number, string][]; label?: string; a?: number }> = ({ u, x, y, s = 1, dots = [[0, 0, BLUE]], label, a = 0 }) => {
  const o = fin(u, a, .5), p = .5 + .5 * Math.sin(u * 5);
  return (<svg width={1920} height={1080} style={{ position: "absolute", opacity: o }}>
    <g transform={`translate(${x} ${y}) scale(${s * (.94 + .06 * o)})`}>
      <rect x={-150} y={-280} width={300} height={560} rx={38} fill="#0d1a33" stroke="#cfd8ea" strokeWidth={6} />
      <rect x={-130} y={-240} width={260} height={480} rx={10} fill="#132a52" />
      {[-160, -80, 0, 80, 160].map((yy) => <line key={yy} x1={-130} y1={yy} x2={130} y2={yy - 30} stroke="#2c4f86" strokeWidth={6} />)}
      {[-80, 10, 90].map((xx) => <line key={xx} x1={xx} y1={-240} x2={xx + 20} y2={240} stroke="#2c4f86" strokeWidth={6} />)}
      {dots.map(([dx, dy, c], i) => <g key={i}><circle cx={dx} cy={dy} r={14 + 18 * p} fill={c} opacity={.25} /><circle cx={dx} cy={dy} r={11} fill={c} stroke="#fff" strokeWidth={3} /></g>)}
    </g>
    {label && <text x={x} y={y + 340 * s} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={40} fill="#cfe0ff">{label}</text>}
  </svg>);
};
const Num: React.FC<{ u: number; a: number; value: number; pre?: string; suf: string; cite?: string; x?: number; y?: number; size?: number; dec?: number }> = ({ u, a, value, pre = "", suf, cite, x = 960, y = 420, size = 190, dec = 0 }) => {
  const k = eo((u - a) / 1.1), v = value * k, o = fin(u, a, .3);
  return (<div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", textAlign: "center", opacity: o }}>
    <div style={{ fontFamily: F, fontWeight: 900, fontSize: size, color: GOLD, lineHeight: 1, textShadow: "0 0 30px rgba(232,185,90,.35)", whiteSpace: "nowrap" }}><span style={{ fontSize: size * .45, color: "#fff" }}>{pre}</span>{dec ? v.toFixed(dec) : Math.round(v).toLocaleString("en-US")}<span style={{ fontSize: size * .45 }}>{suf}</span></div>
    {cite && <div style={{ fontFamily: F, fontWeight: 700, fontSize: 26, color: "#9fb4d8", marginTop: 14, opacity: fin(u, a + .8) }}>{cite}</div>}
  </div>);
};
const Bubble: React.FC<{ u: number; a: number; x: number; y: number; text: string; warm?: boolean; w?: number }> = ({ u, a, x, y, text, warm, w = 640 }) => {
  const o = fin(u, a, .3);
  return (<div style={{ position: "absolute", left: x, top: y, width: w, transform: `translate(-50%,-100%) scale(${.9 + .1 * o})`, opacity: o, transformOrigin: "50% 100%" }}>
    <div style={{ background: warm ? "rgba(255,240,214,.96)" : "rgba(230,240,255,.96)", color: "#1b2235", borderRadius: 28, padding: "22px 30px", fontFamily: F, fontWeight: 700, fontSize: 38, lineHeight: 1.45, boxShadow: `0 0 30px ${warm ? "rgba(232,185,90,.45)" : "rgba(95,168,255,.4)"}` }}>{text}</div>
  </div>);
};
const Keyword: React.FC<{ u: number; a: number; text: string; size?: number; y?: number; color?: string }> = ({ u, a, text, size = 150, y = 470, color = "#fff" }) => {
  const ch = [...text];
  return <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", transform: "translateY(-50%)", fontFamily: F, fontWeight: 900, fontSize: size, color, letterSpacing: 6, textShadow: "0 0 40px rgba(255,255,255,.25)", whiteSpace: "nowrap" }}>
    {ch.map((c, i) => { const o = fin(u, a + i * .05, .3); return <span key={i} style={{ display: "inline-block", opacity: o, transform: `translateY(${(1 - o) * size * .35}px) scale(${1.15 - .15 * o})` }}>{c}</span>; })}</div>;
};
// line-art houses (blue = watching, gold = listening)
const House: React.FC<{ x: number; y: number; s?: number; col: string; glow?: number }> = ({ x, y, s = 1, col, glow = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={col}>
    <path d="M-170 0 L-170 -200 L0 -330 L170 -200 L170 0Z" />
    <rect x={-60} y={-110} width={120} height={110} fill={col} fillOpacity={.12 * glow} />
    <rect x={-140} y={-190} width={70} height={60} fill={col} fillOpacity={.35 * glow} /><rect x={70} y={-190} width={70} height={60} fill={col} fillOpacity={.35 * glow} />
    <line x1={-260} y1={0} x2={260} y2={0} />
  </g>
);
// the night time ruler (20:00-24:00); a dot marks the time and the boy walks along it
const Ruler: React.FC<{ u: number; time: number; from?: number }> = ({ u, time, from }) => {
  const X = (t: number) => 260 + 1400 * (t - 20) / 4, k = eo((u - .2) / 1.4), cur = (from ?? time) + (time - (from ?? time)) * k;
  const hh = Math.floor(cur), mm = Math.round((cur - hh) * 60);
  return (<>
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <line x1={260} y1={700} x2={1660} y2={700} stroke="#cfd8ea" strokeWidth={4} opacity={.6} />
      {Array.from({ length: 17 }, (_, i) => 20 + i * .25).map((t) => <line key={t} x1={X(t)} y1={700} x2={X(t)} y2={t % 1 === 0 ? 670 : 686} stroke="#cfd8ea" strokeWidth={3} opacity={.6} />)}
      {[20, 21, 22, 23, 24].map((t) => <text key={t} x={X(t)} y={760} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={32} fill="#9fb4d8">{t}:00</text>)}
      <line x1={260} y1={700} x2={X(cur)} y2={700} stroke={GOLD} strokeWidth={8} />
      <circle cx={X(cur)} cy={700} r={14} fill={GOLD} />
    </svg>
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <g transform="translate(560 330)" stroke="#cfd8ea" strokeWidth={5} fill="none" strokeLinecap="round"><circle r={78} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-66} x2={0} y2={-58} transform={`rotate(${i * 30})`} />)}
        <line x1={0} y1={0} x2={0} y2={-40} transform={`rotate(${(cur % 12) * 30})`} stroke={GOLD} strokeWidth={7} />
        <line x1={0} y1={0} x2={0} y2={-62} transform={`rotate(${(cur % 1) * 360})`} stroke="#fff" /></g></svg>
    <Char img="you-walk" x={X(cur)} y={690} u={u} h={260} />
    <div style={{ position: "absolute", left: 160, right: 0, top: 240, textAlign: "center", fontFamily: F, fontWeight: 900, fontSize: 170, color: GOLD, letterSpacing: 4, textShadow: "0 0 30px rgba(232,185,90,.35)" }}>{hh}:{String(mm).padStart(2, "0")}</div>
  </>);
};
const People: React.FC<{ u: number; a: number; n: number; lit: number; x?: number; y?: number }> = ({ u, a, n, lit, x = 960, y = 640 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute" }}>
    {Array.from({ length: n }, (_, i) => { const cx = x + (i - (n - 1) / 2) * 190, on = i < lit && u > a + .5 + i * .35, o = fin(u, a + i * .12, .3);
      return (<g key={i} opacity={o} transform={`translate(${cx} ${y})`} fill={on ? GOLD : "#4a5f8c"}>
        <circle cx={0} cy={-150} r={38} /><rect x={-42} y={-100} width={84} height={130} rx={36} /><rect x={-34} y={20} width={26} height={90} rx={12} /><rect x={8} y={20} width={26} height={90} rx={12} />
        {on && <circle cx={0} cy={-40} r={110} fill={GOLD} opacity={.12} />}</g>); })}
  </svg>
);
// ---------- more devices (story from 22:58 on) ----------
const W = { position: "absolute" as const };
const Svg: React.FC<{ children?: React.ReactNode; o?: number; stroke?: string }> = ({ children, o = 1, stroke = SEP }) => (
  <svg width={1920} height={1080} style={{ ...W, opacity: o }} fill="none" stroke={stroke} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">{children}</svg>);
const Rain: React.FC<{ t: number; x0?: number; x1?: number; y0?: number; y1?: number; n?: number }> = ({ t, x0 = 0, x1 = 1920, y0 = 0, y1 = 1080, n = 70 }) => (
  <svg width={1920} height={1080} style={W}><defs><clipPath id={`rc${x0}`}><rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} /></clipPath></defs>
    <g clipPath={`url(#rc${x0})`} stroke="#9fc3ff" strokeWidth={2.5} opacity={.55}>
      {Array.from({ length: n }, (_, i) => { const sx = x0 + ((i * 97.3) % (x1 - x0)), sp = 900 + (i % 7) * 90, yy = y0 + (((t * sp + i * 131) % (y1 - y0 + 120)) - 60);
        return <line key={i} x1={sx} y1={yy} x2={sx - 14} y2={yy + 44} />; })}</g></svg>);
// family restaurant booth by a rainy window
const Restaurant: React.FC<{ t: number; rain?: number }> = ({ t, rain = 0 }) => (<>
  <Sepia><rect x={360} y={160} width={1200} height={420} rx={8} /><line x1={960} y1={160} x2={960} y2={580} />
    <path d="M300 930 L300 640 Q300 600 340 600 L560 600 L560 930" /><path d="M1620 930 L1620 640 Q1620 600 1580 600 L1360 600 L1360 930" />
    <rect x={600} y={700} width={720} height={40} rx={8} /><line x1={960} y1={740} x2={960} y2={930} /><line x1={200} y1={930} x2={1720} y2={930} />
    <rect x={700} y={660} width={90} height={40} rx={6} /><circle cx={1180} cy={680} r={22} /><rect x={1060} y={672} width={56} height={30} rx={8} /></Sepia>
  {rain > 0 && <Rain t={t} x0={362} x1={1558} y0={162} y1={578} n={Math.round(30 + 60 * rain)} />}
</>);
// a big phone with a chat: sent messages (right), a draft being typed and deleted
const Chat: React.FC<{ u: number; x?: number; sent?: [number, string][]; draft?: [number, number, string]; reply?: [number, string] }> = ({ u, x = 1280, sent = [], draft, reply }) => {
  let d = ""; if (draft) { const [a, b, s] = draft, n = [...s].length; const k = u < a ? 0 : u < b ? Math.min(n, Math.floor((u - a) * 9)) : Math.max(0, n - Math.floor((u - b) * 14)); d = [...s].slice(0, k).join(""); }
  return (<div style={{ ...W, left: x - 230, top: 110, width: 460, height: 840, borderRadius: 54, background: "#0d1a33", border: "6px solid #cfd8ea", boxShadow: "0 0 50px rgba(95,168,255,.35)", overflow: "hidden" }}>
    <div style={{ height: 70, borderBottom: "2px solid #2c4f86", color: "#cfe0ff", fontFamily: F, fontWeight: 700, fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>父</div>
    <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
      {sent.map(([a, s], i) => <div key={i} style={{ alignSelf: "flex-end", maxWidth: 360, background: "#5FA8FF", color: "#08152e", borderRadius: 22, padding: "14px 18px", fontFamily: F, fontWeight: 700, fontSize: 28, lineHeight: 1.4, opacity: fin(u, a, .25), transform: `translateY(${(1 - fin(u, a, .25)) * 20}px)` }}>{s}</div>)}
      {reply && <div style={{ alignSelf: "flex-start", maxWidth: 360, background: "#e6eefc", color: "#08152e", borderRadius: 22, padding: "14px 18px", fontFamily: F, fontWeight: 700, fontSize: 28, opacity: fin(u, reply[0], .25) }}>{reply[1]}</div>}
    </div>
    {draft && <div style={{ position: "absolute", left: 18, right: 18, bottom: 22, height: 70, borderRadius: 35, background: "#132a52", color: "#fff", fontFamily: F, fontWeight: 700, fontSize: 30, display: "flex", alignItems: "center", paddingLeft: 24 }}>{d}<span style={{ opacity: Math.floor(u * 2) % 2 ? 1 : .2 }}>｜</span></div>}
  </div>);
};
// a crowd of tiny figures for a big N, with the count-up number
const Crowd: React.FC<{ u: number; a: number; n: number; label: string; cite: string; dots?: number }> = ({ u, a, n, label, cite, dots = 240 }) => {
  const cols = 24, show = Math.round(dots * eo((u - a) / 1.4));
  return (<>
    <svg width={1920} height={1080} style={W}>{Array.from({ length: show }, (_, i) => { const x = 480 + (i % cols) * 40, y = 520 + Math.floor(i / cols) * 40;
      return <g key={i} fill="#e9eefb" opacity={.85}><circle cx={x} cy={y - 10} r={7} /><rect x={x - 7} y={y - 2} width={14} height={18} rx={6} /></g>; })}</svg>
    <Num u={u} a={a} value={n} suf="人" y={270} size={170} cite={cite} />
    <div style={{ ...W, left: 0, right: 0, top: 400, textAlign: "center", fontFamily: F, fontWeight: 700, fontSize: 40, color: "#cfe0ff", opacity: fin(u, a + .5) }}>{label}</div>
  </>);
};
// items popping in one by one
const Steps: React.FC<{ u: number; items: [number, string][]; cite?: string; head?: string }> = ({ u, items, cite, head }) => (
  <div style={{ ...W, left: 0, right: 0, top: 170, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
    {head && <div style={{ fontFamily: F, fontWeight: 900, fontSize: 64, color: "#fff", marginBottom: 20, opacity: fin(u, 0) }}>{head}</div>}
    {items.map(([a, s], i) => { const o = fin(u, a, .3); return <div key={i} style={{ fontFamily: F, fontWeight: 900, fontSize: 58, color: "#fff", opacity: o, transform: `scale(${.9 + .1 * o})`, background: "rgba(232,185,90,.12)", border: `3px solid ${GOLD}`, borderRadius: 18, padding: "16px 44px" }}><span style={{ color: GOLD }}>{i + 1}.</span> {s}</div>; })}
    {cite && <div style={{ fontFamily: F, fontWeight: 700, fontSize: 26, color: "#9fb4d8", opacity: fin(u, items[0][0] + .6) }}>{cite}</div>}
  </div>);
const Bedroom: React.FC<{ door?: number }> = ({ door = 0 }) => (
  <Sepia><path d="M560 930 L560 700 L1240 700 L1240 930" /><rect x={560} y={640} width={160} height={60} rx={20} /><line x1={560} y1={760} x2={1240} y2={760} />
    <rect x={1360} y={230} width={240} height={700} /><path d={`M1360 230 L${1360 + 240 * (1 - door * .75)} ${230 + 40 * door} L${1360 + 240 * (1 - door * .75)} ${930 - 40 * door} L1360 930`} fill={door ? "rgba(232,185,90,.12)" : "none"} />
    <rect x={300} y={240} width={180} height={220} /><line x1={390} y1={240} x2={390} y2={460} /><line x1={100} y1={930} x2={1820} y2={930} /></Sepia>);
const Entrance: React.FC<{ u?: number; knock?: number }> = ({ u = 0, knock }) => (<>
  <Sepia><rect x={760} y={260} width={400} height={670} /><circle cx={1110} cy={600} r={12} /><rect x={680} y={200} width={560} height={60} /><line x1={300} y1={930} x2={1620} y2={930} />
    {knock !== undefined && u > knock && [0, 1, 2].map((i) => { const k = ((u - knock) * 1.4 + i / 3) % 1; return <circle key={i} cx={960} cy={560} r={60 + 220 * k} opacity={1 - k} stroke={GOLD} />; })}</Sepia></>);
const Lanterns: React.FC<{ t: number }> = ({ t }) => (
  <Sepia><path d="M0 220 Q480 300 960 220 T1920 220" />
    {[160, 400, 640, 880, 1120, 1360, 1600, 1840].map((x, i) => { const y = 250 + 20 * Math.sin(i * 1.3), sw = 4 * Math.sin(t * 1.5 + i);
      return <g key={i} transform={`rotate(${sw} ${x} ${y - 30})`}><line x1={x} y1={y - 30} x2={x} y2={y} /><ellipse cx={x} cy={y + 50} rx={42} ry={56} fill="rgba(232,150,70,.25)" stroke="#e8a35a" /><line x1={x - 42} y1={y + 50} x2={x + 42} y2={y + 50} stroke="#e8a35a" /></g>; })}
    <line x1={0} y1={930} x2={1920} y2={930} /></Sepia>);
const Car: React.FC<{ t: number }> = ({ t }) => { const x = 960 + 40 * Math.sin(t * .8);
  return (<Sepia><g transform={`translate(${x} 760)`}><path d="M-420 0 L-420 -110 Q-400 -150 -330 -160 L-220 -260 Q-200 -280 -160 -280 L180 -280 Q220 -280 250 -250 L360 -160 Q420 -150 430 -110 L430 0Z" fill="rgba(232,185,90,.08)" />
    <path d="M-200 -160 L-150 -250 L20 -250 L20 -160Z" fill="rgba(232,185,90,.18)" /><path d="M50 -160 L50 -250 L190 -250 L300 -160Z" fill="rgba(232,185,90,.18)" />
    <circle cx={-250} cy={0} r={70} /><circle cx={260} cy={0} r={70} /><path d="M430 -110 L700 -60 L700 -150Z" fill="rgba(255,230,160,.15)" stroke="none" /></g><line x1={0} y1={830} x2={1920} y2={830} /></Sepia>); };
// A/B split: left cold red-dark, right warm gold
const Split: React.FC<{ u: number; children?: React.ReactNode }> = ({ u, children }) => (
  <AbsoluteFill><div style={{ ...W, left: 0, top: 0, width: 960, height: 1080, background: "radial-gradient(ellipse at 50% 40%, #16336f 0%, #06132e 100%)" }} />
    <div style={{ ...W, left: 960, top: 0, width: 960, height: 1080, background: "radial-gradient(ellipse at 50% 40%, #3e2e16 0%, #160f06 100%)" }} />
    <div style={{ ...W, left: 957, top: 0, width: 6, height: 1080, background: "#fff", opacity: .5 }} />
    <div style={{ ...W, left: 0, width: 960, top: 60, textAlign: "center", fontFamily: F, fontWeight: 900, fontSize: 64, color: "#8fb3e6" }}>父親A</div>
    <div style={{ ...W, left: 960, width: 960, top: 60, textAlign: "center", fontFamily: F, fontWeight: 900, fontSize: 64, color: GOLD }}>父親B</div>
    {children}</AbsoluteFill>);
const Label: React.FC<{ u: number; a: number; x: number; y: number; text: string; color?: string; size?: number }> = ({ u, a, x, y, text, color = "#fff", size = 46 }) => (
  <div style={{ ...W, left: x, top: y, transform: `translate(-50%,-50%) scale(${.9 + .1 * fin(u, a, .3)})`, opacity: fin(u, a, .3), fontFamily: F, fontWeight: 900, fontSize: size, color, whiteSpace: "nowrap", textAlign: "center", lineHeight: 1.35 }}>{text}</div>);
// a typed line (word by word) for the closing
const Typed: React.FC<{ u: number; a: number; text: string; y: number; size?: number; color?: string }> = ({ u, a, text, y, size = 70, color = "#fff" }) => {
  const n = [...text].length, k = Math.max(0, Math.min(n, Math.floor((u - a) * 14)));
  return <div style={{ ...W, left: 0, right: 0, top: y, textAlign: "center", fontFamily: F, fontWeight: 900, fontSize: size, color, letterSpacing: 3 }}>{[...text].slice(0, k).join("")}</div>;
};
// 497 families over three years: too much watching -> secrets -> parents know less
const Chain: React.FC<{ u: number; at2: number; at3: number }> = ({ u, at2, at3 }) => {
  const box = (x: number, a: number, top: string, sub: string, c: string) => <div style={{ ...W, left: x, top: 470, width: 420, transform: "translateX(-50%)", textAlign: "center", opacity: fin(u, a, .35), background: "rgba(255,255,255,.06)", border: `3px solid ${c}`, borderRadius: 20, padding: "26px 10px" }}>
    <div style={{ fontFamily: F, fontWeight: 900, fontSize: 46, color: c }}>{top}</div><div style={{ fontFamily: F, fontWeight: 700, fontSize: 30, color: "#cfe0ff", marginTop: 8 }}>{sub}</div></div>;
  return (<>{box(480, .5, "見られすぎ", "と感じる", "#8fb3e6")}{box(960, at2, "秘密が増える", "", "#ff8a7a")}{box(1440, at3, "親の知識が減る", "1年後", GOLD)}
    <Svg o={fin(u, at2 - .2)} stroke="#fff"><path d="M700 560 L740 560 M728 548 L742 560 L728 572" /></Svg><Svg o={fin(u, at3 - .2)} stroke="#fff"><path d="M1180 560 L1220 560 M1208 548 L1222 560 L1208 572" /></Svg></>);
};

// ---------- shot list ----------
type Shot = { from: number; to: number; draw: (u: number, t: number) => React.ReactNode; push?: number; scene?: string; tr?: "wipe"; still?: boolean };
const SH: Shot[] = [
  { from: 1, to: 1, draw: (u) => <><Stage u={u} /><Char img="you-phone" x={960} u={u} /><Num u={u} a={1.4} value={10} suf="歳" x={1460} y={420} size={170} /></> },
  { from: 2, to: 3, draw: (u, t) => <><Stage u={u} /><Num u={u} a={.3} value={10} pre="平均 約" suf="歳" y={430} cite="初めてスマホを持つ年齢　NTTドコモ モバイル社会研究所（2024）" /></> },
  { from: 4, to: 4, draw: (u) => <><Stage u={u} spots={[620]} /><Char img="you-phone" x={620} u={u} /><Phone u={u} x={1260} y={500} a={.6} label="いつ、どこにいるか" /></> },
  { from: 5, to: 5, draw: (u) => <><Stage u={u} /><Phone u={u} x={960} y={480} s={1.05} dots={[[-80, -120, BLUE], [40, -40, BLUE], [-30, 60, BLUE], [70, 150, BLUE], [-90, 190, BLUE]]} label="GPSで居場所を確認" /></> },
  { from: 6, to: 6, draw: (u) => <><Stage u={u} /><People u={u} a={.3} n={4} lit={3} y={720} /><Num u={u} a={1.2} value={76.2} dec={1} suf="%" y={270} size={150} cite="小学校低学年の子に持たせた親　フリュー ガールズ総合研究所（2024）" /></> },
  { from: 7, to: 7, draw: (u) => <><Stage u={u} /><Char img="father-phone-worried" x={960} u={u} /></> },
  { from: 8, to: 9, draw: (u, t) => <><Stage u={u} spots={[560]} /><Char img="father-phone-worried" x={560} u={u} /><Phone u={u} x={1240} y={500} a={.3} label={t >= at(9) ? "どこにいるか　✓" : "今も表示されている"} /></> },
  { from: 10, to: 10, draw: (u) => <><Stage u={u} spots={[960]} /><Char img="you-stand" x={960} u={u} /><Keyword u={u} a={1.2} text="？" size={260} y={330} color={GOLD} /><div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: F, fontWeight: 900, fontSize: 56, color: "#cfe0ff", opacity: fin(u, .5) }}>何を考えているか</div></> },
  { from: 11, to: 12, scene: "town", draw: (u, t) => <><Sepia><House x={560} y={900} col="#8fb3e6" /><House x={1360} y={900} col={SEP} /></Sepia><Char img="mother-stand" x={1640} u={u} glow="rgba(232,185,90,.55)" /><Char img="sota-laugh" x={1800} u={u} a={t >= at(12) ? at(12) - at(11) : 99} glow="rgba(232,185,90,.55)" /></> },
  { from: 13, to: 13, draw: (u) => <><Stage u={u} spots={[560, 1360]} /><Char img="father-phone-worried" x={560} u={u} /><Char img="mother-listen" x={1360} u={u} glow="rgba(232,185,90,.55)" /><Keyword u={u} a={.6} text="なぜ？" size={170} y={260} color={GOLD} /></> },
  { from: 14, to: 14, draw: (u) => <><Stage u={u} spots={[640, 1280]} /><Char img="you-stand" x={640} u={u} /><Char img="father-stand" x={1280} u={u} a={.3} /><div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", opacity: fin(u, .8, .6) }}>
    <div style={{ fontFamily: F, fontWeight: 900, fontSize: 92, color: "#fff", letterSpacing: 4, textShadow: "0 0 30px rgba(255,255,255,.25)" }}>厳しい親が、<span style={{ color: GOLD }}>何も知らなかった</span>理由</div></div></> },
  { from: 15, to: 15, tr: "wipe", draw: (u) => <><Stage u={u} spots={[]} /><Ruler u={u} time={20.5} from={20} /></> },
  { from: 16, to: 17, scene: "door1", draw: (u, t) => <><Sepia><path d="M700 930 L700 330 L1000 330 L1000 930" /><circle cx={960} cy={640} r={10} /><line x1={300} y1={930} x2={1620} y2={930} /></Sepia><Char img={t >= at(17) ? "you-walk" : "you-talk-smile"} x={t >= at(17) ? 850 + 260 * eo((t - at(17)) / 2.5) : 850} u={u} />{t < at(17) && <Bubble u={u} a={.1} x={1250} y={420} text="「ソウタと一緒に勉強してくるね」" w={560} />}</> },
  { from: 18, to: 19, draw: (u, t) => <><Stage u={u} tint={BLUE} /><Char img="father-phone-worried" x={760} u={u} glow="rgba(95,168,255,.55)" />{t >= at(19) && <Bubble u={u} a={at(19) - at(18)} x={1300} y={460} w={700} text="「門限は10時だからな。それと、お前に危ないことがないか、ちゃんと見てるからな」" />}</> },
  { from: 20, to: 21, scene: "sotahouse", draw: (u, t) => <><Sepia><House x={760} y={930} col={SEP} s={1.3} /><path d="M1360 230 q40 -50 90 -20 q40 -40 90 0 q50 0 40 50 l-220 0z" /></Sepia><Char img="mother-stand" x={1240} u={u} glow="rgba(232,185,90,.55)" />{t >= at(21) && <Bubble u={u} a={at(21) - at(20)} x={1440} y={430} w={640} warm text="「雨が降りそうだからさ、その時は、困ったら電話してね」" />}</> },
  { from: 22, to: 23, draw: (u, t) => { const b = t >= at(23) ? fin(t - at(23), .2, .4) : 0; return <><Stage u={u} spots={[560, 1360]} /><svg width={1920} height={1080} style={{ position: "absolute" }} fill="none" strokeWidth={3}><House x={560} y={930} col="#8fb3e6" /><House x={1360} y={930} col={SEP} /></svg>
    <div style={{ position: "absolute", left: 300, top: 150, width: 520, opacity: b, fontFamily: F, fontWeight: 700, fontSize: 40, color: "#cfe0ff", lineHeight: 1.6, textAlign: "center" }}>門限は10時<br />居場所は見てる</div>
    <div style={{ position: "absolute", left: 1100, top: 150, width: 520, opacity: fin(t - at(23), .9, .4) * (t >= at(23) ? 1 : 0), fontFamily: F, fontWeight: 700, fontSize: 40, color: GOLD, lineHeight: 1.6, textAlign: "center" }}>困ったら<br />電話してね</div></>; } },
  // ---- 22:58
  { from: 24, to: 24, tr: "wipe", draw: (u) => <><Stage u={u} spots={[]} /><Ruler u={u} time={22 + 58 / 60} from={20.5} /></> },
  { from: 25, to: 25, scene: "rest", draw: (u, t) => <><Restaurant t={t} /><Char img="you-talk-smile" x={760} u={u} y={905} h={330} /><Char img="sota-laugh" x={1160} u={u} a={.3} y={905} h={310} />
    <Label u={u} a={2.5} x={760} y={300} text="🎮" size={90} /><Label u={u} a={4.5} x={1160} y={300} text="▶" size={90} color="#ff6b6b" /></> },
  { from: 26, to: 27, scene: "rest", draw: (u, t) => <><Restaurant t={t} rain={eo(u / 2)} /><Char img="you-bored-phone" x={760} u={u} y={760} h={330} />{t >= at(27) && <Svg o={fin(t - at(27), .1)}><g transform="translate(1250 820)"><circle cx={-90} cy={0} r={60} /><circle cx={90} cy={0} r={60} /><path d="M-90 0 L-20 -80 L60 -80 L90 0 M-20 -80 L0 0 L60 -80" /><line x1={-170} y1={-150} x2={170} y2={60} stroke="#ff8a7a" strokeWidth={8} /></g></Svg>}</> },
  { from: 28, to: 33, draw: (u, t) => { const b = (i: number) => at(i) - at(28); return <><Stage u={u} spots={[560]} tint={BLUE} /><Char img="you-phone" x={560} u={u} glow="rgba(95,168,255,.55)" />
    <Chat u={u} sent={[[b(29) + .3, "雨だからさ、弱まるまで待っててもいい？ごめん…"]]} draft={[b(31) + .1, b(32) + .4, "迎えに来てほしい"]} />
    {t >= at(33) && <Label u={u} a={b(33) + .3} x={560} y={240} text={"勉強していなかったことが\n全部ばれる"} color="#ff8a7a" size={44} />}</>; } },
  { from: 34, to: 36, draw: (u, t) => { const b = (i: number) => at(i) - at(34); return <><Stage u={u} /><Char img="you-phone" x={960} u={u} />
    <Label u={u} a={b(35) + .2} x={560} y={420} text={"言えること"} color="#5FA8FF" size={56} /><Label u={u} a={b(35) + .9} x={1360} y={420} text={"言えないこと"} color="#7d8aa8" size={56} />
    {t >= at(36) && <Label u={u} a={b(36)} x={560} y={510} text="→ 送った" color="#fff" />}{t >= at(36) && <Label u={u} a={b(36) + .3} x={1360} y={510} text="→ 送らない" color="#7d8aa8" />}
    <Keyword u={u} a={.4} text="嘘じゃない" size={80} y={200} color={GOLD} /></>; } },
  { from: 37, to: 39, draw: (u, t) => { const b = (i: number) => at(i) - at(37); return <><Stage u={u} spots={[640, 1300]} tint={GOLD} /><Char img="sota-phone" x={640} u={u} glow="rgba(232,185,90,.55)" /><Char img="mother-phone" x={1300} u={u} a={.5} glow="rgba(232,185,90,.55)" />
    {t >= at(38) && <Bubble u={u} a={b(38)} x={960} y={330} w={560} warm text="「雨がすごいから、迎えに来て」" />}</>; } },
  // ---- the ride home and what the research says
  { from: 40, to: 40, scene: "car", draw: (u, t) => <><Car t={t} /><Char img="mother-drive" x={960 + 40 * Math.sin(t * .8) + 150} y={760} u={u} h={240} flip glow="rgba(232,185,90,.6)" /><Rain t={t} n={60} /></> },
  { from: 41, to: 41, draw: (u) => <><Stage u={u} /><Keyword u={u} a={.3} text="共通点" size={170} y={420} color={GOLD} /></> },
  { from: 42, to: 43, draw: (u, t) => t < at(43) ? <><Stage u={u} spots={[]} /><Crowd u={u} a={.3} n={1186} label="14歳の子どもと、その親" cite="Kerr & Stattin (2000) / Stattin & Kerr (2000)" /></> : <><Stage u={u} spots={[]} />
    <Label u={u} a={at(43) - at(42) + .2} x={960} y={250} text="親が子どものことを知っている理由" size={56} />
    <div style={{ ...W, left: 360, top: 400, width: 1200 }}>{[["子どもが自分から話した", .92, GOLD], ["親が調べた", .3, "#7d8aa8"]].map(([s, v, c], i) => { const k = eo((t - at(43) - .6 - i * .5) / 1)
      return <div key={i} style={{ marginBottom: 50 }}><div style={{ fontFamily: F, fontWeight: 900, fontSize: 44, color: c as string, marginBottom: 12 }}>{s as string}</div><div style={{ height: 50, width: 1200 * (v as number) * k, background: c as string, borderRadius: 25 }} /></div>; })}</div>
    <div style={{ ...W, left: 0, right: 0, top: 780, textAlign: "center", fontFamily: F, fontWeight: 700, fontSize: 26, color: "#9fb4d8" }}>Stattin & Kerr (2000)　※棒の長さは説明のためのイメージ</div></> },
  { from: 44, to: 46, draw: (u) => { const b = (i: number) => at(i) - at(44); return <><Stage u={u} spots={[]} /><Steps u={u} head="よく話す子の家の共通点" items={[[.1, "子どもの話をよく聞く"], [b(45) + .1, "家のルールがはっきりしている"], [b(46) + .1, "「親に悪い」と思わせない"]]} cite="Soenens et al. (2006)" /></>; } },
  { from: 47, to: 47, scene: "sotahouse2", draw: (u) => <><Sepia><House x={960} y={930} col={SEP} s={1.4} glow={2} /></Sepia><Char img="mother-listen" x={1320} u={u} glow="rgba(232,185,90,.6)" /><Char img="sota-laugh" x={1520} u={u} a={.3} glow="rgba(232,185,90,.6)" /></> },
  // ---- 23:15
  { from: 48, to: 48, tr: "wipe", draw: (u) => <><Stage u={u} spots={[]} /><Ruler u={u} time={23.25} from={22 + 58 / 60} /></> },
  { from: 49, to: 49, scene: "ent", draw: (u) => <><Entrance /><Char img="you-walk" x={760 + 200 * eo(u / 2.5)} u={u} /></> },
  { from: 50, to: 50, draw: (u) => <><Stage u={u} spots={[560]} /><Char img="father-phone-worried" x={560} u={u} /><Phone u={u} x={1260} y={500} a={.3} dots={[[0, 40, BLUE]]} label="家にいる　✓" /></> },
  { from: 51, to: 51, scene: "bed", draw: (u) => <><Bedroom /><Char img="you-sit-sad" x={900} u={u} y={760} h={330} /></> },
  { from: 52, to: 53, draw: (u, t) => t < at(53) ? <><Stage u={u} spots={[]} /><Steps u={u} head="親に秘密が多い子ほど" items={[[.6, "気分が落ち込みやすい"], [1.6, "問題を起こしやすい"]]} cite="Frijns et al. (2005)" /></>
    : <><Stage u={u} spots={[]} /><Crowd u={u} a={at(53) - at(52)} n={1173} label="仲の良さ・会話の多さを差し引いても、変わらなかった" cite="Frijns et al. (2005)" /></> },
  { from: 54, to: 54, draw: (u) => <><Stage u={u} /><Char img="you-sit-sad" x={960} u={u} h={330} />
    <Svg o={fin(u, .4)} stroke={GOLD}>{[0, 1, 2].map((i) => <g key={i} opacity={fin(u, .5 + i * .5, .3)}><rect x={1180} y={770 - i * 90} width={220} height={80} rx={10} fill="rgba(232,185,90,.12)" /></g>)}</Svg>
    {[0, 1, 2].map((i) => <Label key={i} u={u} a={.5 + i * .5} x={1290} y={812 - i * 90} text="秘密" color={GOLD} size={38} />)}</> },
  // ---- 23:30 the knock
  { from: 55, to: 55, tr: "wipe", draw: (u) => <><Stage u={u} spots={[]} /><Ruler u={u} time={23.5} from={23.25} /></> },
  { from: 56, to: 56, scene: "ent2", draw: (u) => <><Entrance u={u} knock={.2} /></> },
  { from: 57, to: 58, scene: "ent2", draw: (u, t) => <><Entrance /><Char img="mother-stand" x={960} u={u} glow="rgba(232,185,90,.6)" />{t >= at(58) && <Svg o={fin(t - at(58), .2)}><g transform="translate(1250 700)"><rect x={-90} y={-60} width={180} height={140} rx={20} fill="rgba(232,185,90,.12)" /><path d="M-50 -60 Q0 -130 50 -60" /></g></Svg>}</> },
  { from: 59, to: 59, draw: (u) => <><Stage u={u} spots={[960]} /><Char img="father-stand" x={960} u={u} /><Label u={u} a={1.4} x={960} y={300} text={"勉強していなかった"} color="#ff8a7a" size={62} /></> },
  // ---- why he watches: the summer festival
  { from: 60, to: 62, scene: "fest", draw: (u, t) => <><Lanterns t={t} /><Char img="you-stand" x={960} u={u} h={240} />{t >= at(61) && <Num u={u} a={at(61) - at(60) + .4} value={4} suf="分間" x={960} y={480} size={150} />}{t >= at(62) && <Char img="father-sit" x={1450} u={u} a={at(62) - at(60)} />}</> },
  { from: 63, to: 64, draw: (u, t) => t < at(64) ? <><Stage u={u} spots={[]} /><People u={u} a={.2} n={8} lit={4} y={760} /><Label u={u} a={.4} x={960} y={250} text="約半数" color={GOLD} size={150} /><Label u={u} a={1.2} x={960} y={380} text="大学生くらいの子を持つ親" size={40} color="#cfe0ff" />
    <div style={{ ...W, left: 0, right: 0, top: 440, textAlign: "center", fontFamily: F, fontWeight: 700, fontSize: 26, color: "#9fb4d8", opacity: fin(u, 1.6) }}>C.S. Mott Children's Hospital National Poll (2026)</div></>
    : <><Stage u={u} /><Keyword u={u} a={.2} text="「安心したいから」" size={110} y={430} color="#fff" /></> },
  { from: 65, to: 66, draw: (u, t) => <><Stage u={u} spots={[]} /><People u={u} a={.2} n={4} lit={1} y={760} /><Label u={u} a={.4} x={960} y={250} text="4人に1人" color={GOLD} size={130} />
    {t >= at(66) && <Bubble u={u} a={at(66) - at(65)} x={960} y={480} w={760} text="「見ていると、余計に不安になる」" />}</> },
  // ---- 23:45 the door
  { from: 67, to: 67, tr: "wipe", draw: (u) => <><Stage u={u} spots={[]} /><Ruler u={u} time={23.75} from={23.5} /></> },
  { from: 68, to: 69, scene: "bed2", draw: (u, t) => <><Bedroom door={eo((u - 1.1) / 1.5)} /><Char img="you-sleep" x={900} u={u} y={720} h={360} />{t < at(69) && <Char img="father-knock" x={1720} u={u} a={.1} />}{t >= at(69) && <><Char img="father-stand" x={1480} u={u} a={at(69) - at(68)} glow="rgba(232,185,90,.5)" /><Svg o={fin(t - at(69), .8)} stroke="#ff8a7a"><g transform="translate(1700 420)"><rect x={-40} y={-70} width={80} height={140} rx={14} stroke="#cfd8ea" /><line x1={-70} y1={-90} x2={70} y2={90} strokeWidth={8} /></g></Svg></>}</> },
  { from: 70, to: 71, scene: "bed2", draw: (u, t) => <><Bedroom /><Char img="you-sit-sad" x={760} u={u} y={760} h={330} /><Char img="father-sit" x={1100} u={u} y={780} a={.3} glow="rgba(232,185,90,.5)" />{t >= at(71) && <Bubble u={u} a={at(71) - at(70)} x={1100} y={330} w={620} warm text="「今日、本当はどこにいたの？」" />}</> },
  { from: 72, to: 74, draw: (u, t) => <><Stage u={u} spots={[]} /><Num u={u} a={.2} value={497} suf="組" x={760} y={250} size={140} /><Num u={u} a={.8} value={3} suf="年間" x={1240} y={250} size={140} />
    <div style={{ ...W, left: 0, right: 0, top: 360, textAlign: "center", fontFamily: F, fontWeight: 700, fontSize: 26, color: "#9fb4d8", opacity: fin(u, 1.2) }}>オランダ・親子の追跡調査　Hawk et al. (2013)</div>
    {t >= at(73) && <Chain u={t - at(73)} at2={1.6} at3={at(74) - at(73) + .3} />}</> },
  { from: 75, to: 75, draw: (u) => <><Stage u={u} spots={[]} /><Keyword u={u} a={.2} text="親がしつこくするほど、" size={92} y={410} /><Keyword u={u} a={1.3} text="話してもらえなくなる。" size={92} y={540} color={GOLD} /></> },
  // ---- 23:46 the next ten seconds
  { from: 76, to: 77, draw: (u, t) => t < at(77) ? <><Split u={u}><Char img="father-stand" x={480} u={u} /><Char img="father-stand" x={1440} u={u} /></Split></>
    : <><Stage u={u} spots={[]} /><Keyword u={u} a={at(77) - at(76)} text="次の10秒" size={180} y={430} color={GOLD} /><Label u={u} a={at(77) - at(76) + .4} x={960} y={620} text={String(Math.max(0, 10 - Math.floor((t - at(77)) * 3)))} size={90} color="#fff" /></> },
  { from: 78, to: 82, draw: (u, t) => { const b = (i: number) => at(i) - at(78); return <Split u={u}><Char img="father-shout" x={420} u={u} />{t >= at(80) && <Char img="you-sit-sad" x={760} u={u} a={b(80)} h={300} />}
    {t >= at(79) && t < at(80) && <Bubble u={u} a={b(79)} x={480} y={330} w={760} text="「嘘をついたのか。罰として、スマホは取り上げるぞ！」" />}
    {t >= at(80) && t < at(81) && <Bubble u={u} a={b(80) + .2} x={700} y={420} w={420} text="「ごめんなさい…」" />}
    {t >= at(81) && <Label u={u} a={b(81) + .2} x={480} y={300} text={"二度と\n話さなくなった"} color="#8fb3e6" size={60} />}
    <Char img="father-stand" x={1440} u={9} h={420} /><div style={{ ...W, left: 960, top: 0, width: 960, height: 1080, background: "#000", opacity: .74 }} /></Split>; } },
  { from: 83, to: 86, draw: (u, t) => { const b = (i: number) => at(i) - at(83); return <Split u={u}><Char img="father-shout" x={420} u={9} h={420} /><Char img={t >= at(86) ? "father-nod" : t >= at(85) ? "father-listen" : "father-stand"} x={1340} u={u} glow="rgba(232,185,90,.5)" />{t >= at(86) && <Char img={t >= at(86) + 2.6 ? "you-talk-smile" : "you-relief"} x={1700} u={u} a={b(86) + 1.2} h={360} glow="rgba(232,185,90,.5)" />}
    {t >= at(84) && <Label u={u} a={b(84)} x={960} y={200} text="罰は同じ" color="#fff" size={56} />}
    {t >= at(86) && <Bubble u={u} a={b(86)} x={1340} y={420} w={600} warm text="「まずは、話してくれて、ありがとうな。」" />}
    <div style={{ ...W, left: 0, top: 0, width: 960, height: 1080, background: "#000", opacity: .74 }} /></Split>; } },
  { from: 87, to: 88, draw: (u, t) => t < at(88) ? <><Stage u={u} spots={[]} /><Crowd u={u} a={.2} n={982} label="若者の追跡調査" cite="Tilton-Weaver et al. (2010)" /></>
    : <><Stage u={u} spots={[]} /><Label u={u} a={at(88) - at(87)} x={960} y={300} text="打ち明けた直後の、親の反応" size={60} />
      <Svg o={fin(t - at(88), 1.2)} stroke="#fff"><path d="M960 380 L960 470 M948 458 L960 472 L972 458" /></Svg>
      <Label u={u} a={at(88) - at(87) + 1.6} x={960} y={560} text="次も話してくれるか" size={72} color={GOLD} />
      <div style={{ ...W, left: 0, right: 0, top: 660, textAlign: "center", fontFamily: F, fontWeight: 700, fontSize: 26, color: "#9fb4d8" }}>Tilton-Weaver et al. (2010)</div></> },
  { from: 89, to: 92, draw: (u, t) => { const b = (i: number) => at(i) - at(89); return <Split u={u}><Char img="father-shout" x={480} u={u} h={380} /><Char img="father-listen" x={1440} u={u} a={b(90)} h={380} glow="rgba(232,185,90,.5)" />
    <Label u={u} a={.3} x={480} y={250} text="秘密が増える" color="#8fb3e6" size={58} />{t >= at(90) && <Label u={u} a={b(90) + .2} x={1440} y={250} text="次も話してくれる" color={GOLD} size={58} />}
    {t >= at(91) && <Label u={u} a={b(91)} x={960} y={150} text="罰は同じ" color="#fff" size={52} />}
    {t >= at(92) && <Keyword u={u} a={b(92) + .2} text="話を聞いたかどうか" size={84} y={420} color="#fff" />}</Split>; } },
  // ---- two years later
  { from: 93, to: 94, draw: (u, t) => t < at(94) ? <><Stage u={u} spots={[]} /><Keyword u={u} a={.1} text="2年後" size={200} y={440} color={GOLD} /></> : <><Entrance /><Char img="you18-stand" x={960 + 300 * eo((t - at(94)) / 3)} u={u} a={at(94) - at(93)} /></> },
  { from: 95, to: 98, draw: (u, t) => { const b = (i: number) => at(i) - at(95); return <><Stage u={u} spots={[560]} tint={BLUE} /><Char img="father-phone-worried" x={560} u={u} glow="rgba(95,168,255,.5)" />
    {t < at(96) ? <Phone u={u} x={1280} y={500} a={.3} label="今も、居場所を見てしまう" /> : <Chat u={t - at(96)} sent={[[.3, "元気か？"], [1.6, "連絡くらいしろ"]]} />}
    {t >= at(97) && <Label u={u} a={b(97)} x={560} y={180} text="どこにいるか　✓" color="#5FA8FF" size={50} />}
    {t >= at(98) && <Label u={u} a={b(98)} x={560} y={250} text="何を考えているか　？" color={GOLD} size={50} />}</>; } },
  { from: 99, to: 100, draw: (u, t) => <><Stage u={u} spots={[560, 1360]} tint={GOLD} warm /><Char img="father-phone-laugh" x={560} u={u} glow="rgba(232,185,90,.55)" /><Char img="you18-phone-laugh" x={1360} u={u} a={.4} glow="rgba(232,185,90,.55)" />
    <Label u={u} a={.8} x={960} y={200} text="日曜日" color={GOLD} size={70} />{t >= at(100) && <Bubble u={u} a={at(100) - at(99)} x={1360} y={360} w={460} warm text="「元気にしてるよ」" />}</> },
  { from: 101, to: 103, draw: (u, t) => { const k = eo((u - .3) / 3); const pts = (f: (x: number) => number) => Array.from({ length: 41 }, (_, i) => i / 40).filter((x) => x <= k).map((x) => `${300 + 1320 * x},${f(x)}`).join(" ");
    return <><Stage u={u} spots={[]} /><Svg stroke="#cfd8ea"><line x1={300} y1={800} x2={1640} y2={800} opacity={.5} /><line x1={300} y1={300} x2={300} y2={800} opacity={.5} />
      <polyline points={pts((x) => 380 + 300 * x)} stroke="#5FA8FF" strokeWidth={10} />{t >= at(103) && <polyline points={pts(() => 420)} stroke={GOLD} strokeWidth={10} opacity={fin(t - at(103), .1, .5)} />}</Svg>
      <Label u={u} a={.4} x={420} y={250} text="12歳" size={36} color="#9fb4d8" /><Label u={u} a={.4} x={1560} y={850} text="19歳" size={36} color="#9fb4d8" />
      <Label u={u} a={1.2} x={1250} y={720} text="親が知っていること" color="#5FA8FF" size={44} />
      {t >= at(103) && <Label u={u} a={at(103) - at(101) + .3} x={1150} y={360} text="自分から話してくれる関係" color={GOLD} size={48} />}
      <div style={{ ...W, left: 0, right: 0, top: 880, textAlign: "center", fontFamily: F, fontWeight: 700, fontSize: 26, color: "#9fb4d8" }}>Keijsers & Poulin (2013)　※線は説明のためのイメージ</div></>; } },
  // ---- closing
  { from: 104, to: 106, draw: (u, t) => <><Stage u={u} spots={[560, 1360]} /><Char img="father-phone-worried" x={560} u={u} /><Char img="father-listen" x={1360} u={u} a={.3} glow="rgba(232,185,90,.5)" />
    {t >= at(105) && <Label u={u} a={at(105) - at(104)} x={960} y={220} text="心配する気持ちは、同じ" color="#fff" size={64} />}
    {t >= at(106) && <Label u={u} a={at(106) - at(104) + .8} x={960} y={320} text="違ったのは、知ろうとした方法" color={GOLD} size={56} />}</> },
  { from: 107, to: 109, draw: (u, t) => <><Stage u={u} spots={[]} /><Label u={u} a={.3} x={960} y={330} text="監視" color="#7d8aa8" size={120} />
    <Svg o={fin(u, 1.6)} stroke="#ff8a7a"><line x1={820} y1={340} x2={1100} y2={310} strokeWidth={10} /></Svg>
    {t >= at(108) && <Label u={u} a={at(108) - at(107)} x={960} y={520} text={"子どもが自分から\n話してくれる環境"} color={GOLD} size={82} />}</> },
  { from: 110, to: 113, still: true, draw: () => <AbsoluteFill>   {/* the last 18 s: A (blue) | B (yellow), a still */}
    <div style={{ ...W, left: 0, top: 0, width: 960, height: 1080, background: "radial-gradient(ellipse at 50% 40%, #16336f 0%, #06132e 100%)" }} />
    <div style={{ ...W, left: 960, top: 0, width: 960, height: 1080, background: "radial-gradient(ellipse at 50% 40%, #5a4220 0%, #1c1308 100%)" }} />
    <div style={{ ...W, left: 956, top: 0, width: 8, height: 1080, background: "#fff", opacity: .7 }} />
    <Char img="father-shout" x={380} u={9} h={470} glow="rgba(95,168,255,.5)" /><Char img="you-sit-sad" x={720} u={9} h={330} glow="rgba(95,168,255,.5)" />
    <Char img="father-nod" x={1250} u={9} h={470} glow="rgba(232,185,90,.6)" /><Char img="you-talk-smile" x={1580} u={9} h={410} glow="rgba(232,185,90,.6)" /></AbsoluteFill> },

];
const shotAt = (t: number) => { let k = 0; SH.forEach((s, i) => { if (t >= at(s.from) - (i === 0 ? 99 : 0)) k = i; }); return k; };
// ---------- captions (white, numbers and key words in gold) ----------
const KW = /([0-9][0-9,.]*(?:歳|人|%|時|分|組|週間|年間|年)?|4人に3人以上|4人に1人|約半数|GPS|位置情報|何を考えているか|どこにいるか|ルール|秘密|次の10秒|話を聞いたかどうか|監視|自分から話して)/g;
const mark = (s: string) => s.split(KW).map((p, i) => (i % 2 ? <span key={i} style={{ color: GOLD }}>{p}</span> : p));
const BUBBLED = new Set([16, 19, 21, 29, 38, 66, 71, 79, 86]);   // these lines are shown in a speech bubble
const CAPS: [number, number, string][] = [];
S.forEach(([i, a, b, txt]) => {
  if (BUBBLED.has(i)) return;
  const segs: string[] = []; let cur = "";
  for (const piece of txt.replace(/。/g, "。\n").split("\n").filter(Boolean)) {
    if (cur && (cur + piece).length > 30) { segs.push(cur); cur = piece; } else cur += piece;
  }
  if (cur) segs.push(cur);
  const parts = segs.flatMap((sg) => { if (sg.length <= 34) return [sg]; const m = sg.lastIndexOf("、", Math.ceil(sg.length / 2) + 6); return m > 6 ? [sg.slice(0, m + 1), sg.slice(m + 1)] : [sg]; });
  const tot = parts.reduce((x, p) => x + p.length, 0); let s0 = a; const e = b - .1;
  parts.forEach((p) => { const d = (e - a) * p.length / tot; CAPS.push([s0, s0 + d, p]); s0 += d; });
});
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const cur = CAPS.find(([a, b]) => t >= a && t < b); if (!cur) return null;
  const [a, , txt] = cur, o = fin(t, a, .12);
  return (<div style={{ position: "absolute", left: 0, right: 0, bottom: 52, textAlign: "center", opacity: o }}>
    <span style={{ display: "inline-block", maxWidth: 1700, fontFamily: F, fontWeight: 900, fontSize: 48, color: "#fff", textShadow: "0 0 6px #000, 0 2px 0 #000, 0 0 18px rgba(0,0,0,.8)", textWrap: "balance" as any, lineHeight: 1.4 }}>{mark(txt)}</span></div>);
};
export const FAM1_SAMPLE_END = at(24) - .1;
export const FAM1_FRAMES = Math.round((S[S.length - 1][2] + 2.5) * FPS);
export const Fam1Episode: React.FC = () => {
  useFonts();
  const f = useCurrentFrame(), t = f / FPS, k = shotAt(t), sh = SH[k], start = k === 0 ? 0 : at(sh.from), u = t - start;
  const prev = SH[k - 1], xf = .45, fade = prev && u < xf ? interpolate(u, [0, xf], [0, 1], { ...cl, easing: ease }) : 1;
  const end = sh.to < S.length ? at(sh.to + 1) : t + 1, p = Math.min(1, u / Math.max(2, end - start)), ep = Easing.inOut(Easing.sin)(p);
  // camera: push in, drift right or drift left, by shot; the closing still does not move
  const mode = k % 3, push = sh.still ? 1 : 1.03 + (mode === 0 ? .04 * ep : .015), dx = sh.still || mode === 0 ? 0 : (mode === 1 ? -1 : 1) * (18 - 36 * ep);
  const wipe = sh.tr === "wipe" && prev && u < .55, wk = eo(u / .55);
  const draw = !!sh.scene && (!prev || prev.scene !== sh.scene);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("fam1/narration.wav")} />
      {prev && (fade < 1 || wipe) && <AbsoluteFill>{prev.draw(t - at(prev.from), t)}</AbsoluteFill>}
      <ShotCtx.Provider value={{ u, draw }}>
        <AbsoluteFill style={{ opacity: wipe ? 1 : fade, transform: `scale(${push}) translateX(${dx}px)`, clipPath: wipe ? `inset(0 ${(1 - wk) * 100}% 0 0)` : undefined }}>{sh.draw(u, t)}</AbsoluteFill>
      </ShotCtx.Provider>
      {wipe && <div style={{ position: "absolute", top: 0, bottom: 0, left: `${wk * 100}%`, width: 6, marginLeft: -3, background: GOLD, boxShadow: "0 0 30px rgba(232,185,90,.8)" }} />}
      <Captions t={t} />
    </AbsoluteFill>
  );
};
