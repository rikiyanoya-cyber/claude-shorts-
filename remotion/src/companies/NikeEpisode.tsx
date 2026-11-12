// Company history channel (企業図鑑) — Ep2 "ナイキの全歴史" (full episode, 1920x1080).
// Shots, subtitles and chapters come from nike_ep2_plan.json (built from the narration timing, one picture per sentence);
// images are the graded stills in public/nike; everything with numbers, names or diagrams is drawn here in code.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import PLAN from "./nike_ep2_plan.json";
import { PAL } from "./illustrations";
import { YearBar } from "./McdOpening";
import { useFonts } from "./fonts";

type Shot = { t: number; dur: number; kind: string; [k: string]: any };
const plan = PLAN as unknown as { fps: number; duration: number; shots: Shot[]; subs: [number, number, string][]; chapters: { no: string; title: string; years: string; at: number }[] };
const FPS = plan.fps, XF = 0.35, XF_IMG = 0.16;
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const fin = (u: number, a: number, d = 0.4) => interpolate(u, [a, a + d], [0, 1], { ...cl, easing: ease });
const F = "NSJP";
const clamp01 = (x: number) => Math.max(0, Math.min(1, x)), eoN = (x: number) => 1 - Math.pow(1 - x, 3);
const num = (v: number, dec = 0) => (dec ? v.toFixed(dec) : Math.round(v).toLocaleString("en-US"));
const SPAN: [number, number] = [1940, 2026];

// ---------- pieces ----------
const Paper: React.FC<{ children?: React.ReactNode; bg?: string }> = ({ children, bg = PAL.paper }) => <AbsoluteFill style={{ background: bg }}>{children}</AbsoluteFill>;
// digit roll: each digit spins blurred (unreadable), then lands on its final value from left to right — no in-between values
const Count: React.FC<{ u: number; at: number; value: number; prefix?: string; suffix?: string; dec?: number; size?: number; color?: string; dur?: number }> = ({ u, at, value, prefix = "", suffix = "", dec = 0, size = 200, color = PAL.ink, dur = 1.5 }) => {
  const chars = [...num(value, dec)], nd = chars.filter((c) => /\d/.test(c)).length; let di = 0;
  return <span style={{ fontFamily: F, fontWeight: 900, fontSize: size, color, lineHeight: 1, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}><span style={{ fontSize: size * .5 }}>{prefix}</span>
    {chars.map((c, i) => {
      if (!/\d/.test(c)) return <span key={i}>{c}</span>;
      const idx = di++, land = at + dur * (0.3 + 0.7 * (idx + 1) / nd);
      if (u >= land) return <span key={i} style={{ display: "inline-block", transform: `translateY(${(1 - eoN(clamp01((u - land) / .18))) * -0.12 * size}px)` }}>{c}</span>;
      return <span key={i} style={{ display: "inline-block", filter: `blur(${Math.max(6, size * .07)}px)`, opacity: .5, transform: "scaleY(1.35)" }}>{Math.floor(u * 30 + idx * 3.7) % 10}</span>;
    })}<span style={{ fontSize: size * .45 }}>{suffix}</span></span>;
};
const ImgShot: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const k = s.kb, p = interpolate(u, [0, s.dur + XF], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  // one transform per hold: zoom and pan advance together under one ease; the final still does not move at all
  const zMin = Math.min(k.z0, k.z1), limMin = Math.max(0, ((zMin - 1) / (2 * zMin)) * 100 - 0.2), cp = (v: number) => Math.max(-limMin, Math.min(limMin, v));
  const z = s.final ? 1.0 : k.z0 + (k.z1 - k.z0) * p;
  const x = s.final ? 0 : cp(k.x0) + (cp(k.x1) - cp(k.x0)) * p, y = s.final ? 0 : cp(k.y0) + (cp(k.y1) - cp(k.y0)) * p;
  const tilt = s.final ? 0 : (k.x1 > k.x0 ? 1 : -1) * (-.7 + 1.4 * p);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#111" }}>
      <AbsoluteFill style={{ transformOrigin: "50% 50%", transform: `perspective(2200px) rotateY(${tilt}deg) scale(${z}) translate(${x}%, ${y}%)` }}>
        <Img src={staticFile(`nike/${s.src}`)} style={{ width: 1920, height: 1080, objectFit: "cover" }} />
        {s.src === "ep02-3-11.jpg" && <Billboard u={u} />}
        {s.src === "ep02-P13.jpg" && <RecordBoard u={u} at={s.recordAt ?? 0.4} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
// 3-11: the blank billboard gets the three words (drawn in perspective onto the board)
const Billboard: React.FC<{ u: number }> = ({ u }) => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
    <g transform="matrix(1,-0.2652,0.0066,1,1039,174)" opacity={fin(u, .25, .5)}>
      <text x={264} y={168} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={86} fill="#1A1A1A" letterSpacing={2}>JUST DO IT.</text>
    </g>
  </svg>
);
// P13: the blank timing board shows the record
const RecordBoard: React.FC<{ u: number; at: number }> = ({ u, at }) => {
  const o = fin(u, at, .3), blink = u < at + .9 ? (Math.floor((u - at) * 6) % 2 ? .35 : 1) : 1;
  return (<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
    <g transform="matrix(1,0.03,0,1,0,0)" opacity={o * blink}>
      <text x={592} y={262} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={104} fill="#FFB347" letterSpacing={6} style={{ filter: "drop-shadow(0 0 10px rgba(255,170,60,.9))" }}>2:00:25</text>
    </g></svg>);
};
const CenterText: React.FC<{ u: number; text: string; sub?: string; bg?: string; fg?: string; size?: number; subCol?: string }> = ({ u, text, sub, bg = PAL.paper, fg = PAL.ink, size = 140, subCol = PAL.red }) => (
  <Paper bg={bg}><AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
    <div style={{ fontFamily: F, fontWeight: 900, fontSize: size, color: fg, opacity: fin(u, .05, .35), transform: `scale(${.97 + .03 * fin(u, .05, .5)})`, letterSpacing: 4, textAlign: "center", whiteSpace: "pre-line", lineHeight: 1.25 }}>{text}</div>
    {sub && <div style={{ fontFamily: F, fontWeight: 700, fontSize: 52, color: subCol, opacity: fin(u, .5), marginTop: 26, letterSpacing: 8 }}>{sub}</div>}
  </AbsoluteFill></Paper>
);
const Chapter: React.FC<{ u: number; n: number }> = ({ u, n }) => {
  const c = plan.chapters[n], w = 900 * fin(u, .25, .8);
  const [y0, y1] = c.years.split("–").map((x) => parseInt(x, 10)), X = (y: number) => 360 + 1200 * (y - SPAN[0]) / (SPAN[1] - SPAN[0]);
  const hi = fin(u, .5, 1.0), ya = X(y0), yb = X(isNaN(y1) ? 2026 : y1);
  return (
    <Paper bg={PAL.navy2}>
      <div style={{ position: "absolute", right: 90, top: -40, fontFamily: F, fontWeight: 900, fontSize: 520, color: PAL.paper, opacity: .05, transform: `translateX(${(1 - fin(u, 0, 1.2)) * 120}px)` }}>{n + 1}</div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", paddingBottom: 80 }}>
        <div style={{ fontFamily: F, fontWeight: 700, fontSize: 56, color: PAL.mustard, letterSpacing: 16, opacity: fin(u, 0), transform: `translateY(${(1 - fin(u, 0, .5)) * -24}px)` }}>{c.no}</div>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: c.title.length > 10 ? 104 : 128, color: PAL.paper, marginTop: 18, letterSpacing: 6, display: "flex" }}>
          {[...c.title].map((ch, i) => <span key={i} style={{ opacity: fin(u, .12 + i * .045, .3), transform: `translateY(${(1 - fin(u, .12 + i * .045, .35)) * 40}px)`, display: "inline-block" }}>{ch}</span>)}
        </div>
        <div style={{ width: w, height: 5, background: PAL.mustard, margin: "34px 0 26px" }} />
        <div style={{ fontFamily: F, fontWeight: 700, fontSize: 50, color: PAL.paper, opacity: .8 * fin(u, .5), letterSpacing: 10 }}>{c.years}</div>
      </AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", opacity: fin(u, .3, .5) }}>
        <line x1={360} y1={940} x2={1560} y2={940} stroke={PAL.paper} strokeWidth={3} opacity={.3} />
        {[1940, 1960, 1980, 2000, 2026].map((y) => <text key={y} x={X(y)} y={990} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={26} fill={PAL.paper} opacity={.45}>{y}</text>)}
        <line x1={ya} y1={940} x2={ya + (yb - ya) * hi} y2={940} stroke={PAL.mustard} strokeWidth={10} strokeLinecap="round" />
      </svg>
    </Paper>
  );
};
// big number: one value, or parts (1億 + 2,600万ドル) landing one after the other; or plain text (no count)
const BigNum: React.FC<{ s: Shot; u: number }> = ({ s, u }) => (
  <Paper bg={s.dark ? "#141118" : PAL.paper}><AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
    <div style={{ fontFamily: F, fontWeight: 700, fontSize: 56, color: s.dark ? PAL.paper : PAL.ink, opacity: .78 * fin(u, 0), marginBottom: 24 }}>{s.label}</div>
    {s.text ? <div style={{ fontFamily: F, fontWeight: 900, fontSize: s.size || 200, color: s.dark ? "#E0564A" : PAL.red, opacity: fin(u, .2, .3), transform: `scale(${1.1 - .1 * fin(u, .2, .35)})`, whiteSpace: "nowrap" }}>{s.text}</div>
      : s.parts ? <div style={{ display: "flex", alignItems: "baseline" }}>{s.parts.map((p: any, i: number) => <Count key={i} u={u} at={.2 + i * .5} value={p.value} prefix={p.prefix || ""} suffix={p.suffix || ""} dec={p.dec || 0} size={s.size || 230} color={PAL.red} />)}</div>
        : <Count u={u} at={.2} value={s.value} prefix={s.prefix} suffix={s.suffix} dec={s.dec || 0} size={s.size || 260} color={s.dark ? "#E0564A" : PAL.red} />}
    {s.extra && <div style={{ fontFamily: F, fontWeight: 900, fontSize: 76, color: s.dark ? PAL.paper : PAL.ink, marginTop: 36, opacity: fin(u, s.extraAt ?? 1.4) }}>{s.extra}</div>}
  </AbsoluteFill></Paper>
);
// name change: old name → new name
const Rename: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const a = fin(u, .1), b = fin(u, s.dur * .42, .5), ar = fin(u, s.dur * .3, .4);
  return (<Paper><svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    {s.head && <text x={960} y={190} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={56} fill={PAL.ink} opacity={.75 * a}>{s.head}</text>}
    <g opacity={a * (1 - .45 * b)}><rect x={150} y={400} width={680} height={260} rx={26} fill={PAL.paper2} stroke={PAL.ink} strokeWidth={5} />
      <text x={490} y={530} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={s.from.length > 9 ? 58 : 72} fill={PAL.ink}>{s.from}</text>
      <text x={490} y={610} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={40} fill={PAL.ink} opacity={.65}>{s.fromSub}</text></g>
    <g opacity={ar}><line x1={860} y1={530} x2={1040} y2={530} stroke={PAL.mustard} strokeWidth={16} strokeLinecap="round" /><path d="M1070 530 L1030 500 L1030 560Z" fill={PAL.mustard} /></g>
    <g opacity={b} transform={`translate(1430 530) scale(${.9 + .1 * b}) translate(-1430 -530)`}><rect x={1090} y={400} width={680} height={260} rx={26} fill={PAL.navy} />
      <text x={1430} y={540} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={s.to.length > 8 ? 70 : 96} fill={PAL.white}>{s.to}</text>
      <text x={1430} y={615} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={40} fill={PAL.mustard}>{s.toSub}</text></g>
  </svg></Paper>);
};
// a principle of business (one per chapter)
const Principle: React.FC<{ s: Shot; u: number }> = ({ s, u }) => (
  <Paper bg={PAL.navy2}><AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
    <div style={{ width: 120 * fin(u, 0, .5), height: 6, background: PAL.mustard, marginBottom: 34 }} />
    <div style={{ fontFamily: F, fontWeight: 700, fontSize: 64, color: PAL.mustard, letterSpacing: 18, opacity: fin(u, .05) }}>{s.label}</div>
    {s.text && <div style={{ fontFamily: F, fontWeight: 900, fontSize: 92, color: PAL.paper, marginTop: 40, opacity: fin(u, .45), transform: `translateY(${(1 - fin(u, .45, .5)) * 26}px)` }}>{s.text}</div>}
  </AbsoluteFill></Paper>
);
const Year: React.FC<{ s: Shot; u: number }> = ({ s, u }) => (
  <Paper bg={PAL.navy2}><AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", paddingBottom: 140 }}>
    <div style={{ fontFamily: F, fontWeight: 900, fontSize: 280, color: PAL.paper, opacity: fin(u, .05, .3), transform: `scale(${1.08 - .08 * fin(u, .05, .4)})`, letterSpacing: 10 }}>{s.year}</div>
    {s.sub && <div style={{ fontFamily: F, fontWeight: 700, fontSize: 54, color: PAL.mustard, opacity: fin(u, .5), letterSpacing: 10 }}>{s.sub}</div>}
  </AbsoluteFill>
    <YearBar t={u} a={.2} b={Math.max(.8, s.dur - .3)} from={s.fromYear} to={s.toYear} span={SPAN} /></Paper>
);
// sales line (no numbers on the axis: the shape only), years under it
const Growth: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const k = interpolate(u, [.3, Math.max(.9, s.dur - .3)], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const pts = Array.from({ length: 41 }, (_, i) => { const x = i / 40; return [300 + 1320 * x, 860 - 480 * Math.pow(x, 1.7) - 18 * Math.sin(x * 11) * x]; });
  const vis = pts.slice(0, Math.max(2, Math.round(41 * k))), e = vis[vis.length - 1];
  return (<Paper><svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <text x={960} y={170} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={68} fill={PAL.ink} opacity={fin(u, 0)}>{s.label}</text>
    <line x1={300} y1={880} x2={1640} y2={880} stroke={PAL.ink} strokeWidth={4} opacity={.5} /><line x1={300} y1={300} x2={300} y2={880} stroke={PAL.ink} strokeWidth={4} opacity={.5} />
    <polyline points={vis.map((p) => p.join(",")).join(" ")} fill="none" stroke={PAL.teal} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={e[0]} cy={e[1]} r={18} fill={PAL.mustard} stroke={PAL.ink} strokeWidth={4} />
    <text x={300} y={912} fontFamily={F} fontWeight={700} fontSize={40} fill={PAL.ink} opacity={.7}>{s.from}</text>
    <text x={1640} y={912} textAnchor="end" fontFamily={F} fontWeight={700} fontSize={40} fill={PAL.ink} opacity={.7}>{s.to}</text>
  </svg></Paper>);
};
const Percent: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const k = eoN(clamp01((u - .3) / 1.1)) * s.value / 100, a = -Math.PI / 2, b = a + 2 * Math.PI * k, r = 250, cx = 620, cy = 560;
  const x1 = cx + r * Math.cos(a), y1 = cy + r * Math.sin(a), x2 = cx + r * Math.cos(b), y2 = cy + r * Math.sin(b);
  return (<Paper><svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <text x={960} y={170} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={66} fill={PAL.ink} opacity={fin(u, 0)}>{s.label}</text>
    <circle cx={cx} cy={cy} r={r} fill={PAL.paper2} stroke={PAL.ink} strokeWidth={5} />
    {k > .002 && <path d={`M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${k > .5 ? 1 : 0} 1 ${x2} ${y2} Z`} fill={PAL.red} stroke={PAL.ink} strokeWidth={5} />}
    <text x={1320} y={600} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={230} fill={PAL.red} opacity={fin(u, 1.2, .3)}>{s.value}%</text>
    <text x={1320} y={700} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={50} fill={PAL.ink} opacity={fin(u, 1.5)}>{s.sub}</text>
  </svg></Paper>);
};
const Calc: React.FC<{ s: Shot; u: number }> = ({ s, u }) => (
  <Paper><AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
    {s.label && <div style={{ fontFamily: F, fontWeight: 700, fontSize: 56, color: PAL.ink, opacity: .75 * fin(u, 0), marginBottom: 40 }}>{s.label}</div>}
    <div style={{ display: "flex", alignItems: "baseline", gap: 50, fontFamily: F, fontWeight: 900, color: PAL.ink }}>
      {s.items.map((x: string, i: number) => <span key={i} style={{ fontSize: i % 2 ? 110 : Math.min(170, Math.round(1500 / Math.max(4, s.items.filter((_: string, j: number) => j % 2 === 0).join("").length))), color: i % 2 ? PAL.mustard : (i === s.items.length - 1 && s.hiLast ? PAL.red : PAL.ink), opacity: fin(u, .15 + i * (s.step ?? .45), .3) }}>{x}</span>)}
    </div>
  </AbsoluteFill></Paper>
);
// share price: flat, then the event (a small dip and a record, or the worst day)
const Stock: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const N = 60, k = interpolate(u, [.2, Math.max(1, s.dur * .75)], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const yAt = (x: number) => {
    if (s.mode === "dip") return 520 + 10 * Math.sin(x * 23) + (x > .45 ? 60 * clamp01((x - .45) / .06) : 0) - (x > .55 ? 60 * clamp01((x - .55) / .3) : 0);
    if (s.mode === "high") return 580 + 10 * Math.sin(x * 23) - (x > .2 ? 260 * Math.pow(clamp01((x - .2) / .8), 1.3) : 0);
    return 430 + 12 * Math.sin(x * 23) + (x > .62 ? 300 * clamp01((x - .62) / .04) : 0);
  };
  const pts = Array.from({ length: N + 1 }, (_, i) => [260 + 1400 * i / N, yAt(i / N)]), vis = pts.slice(0, Math.max(2, Math.round((N + 1) * k))), e = vis[vis.length - 1];
  const col = s.mode === "high" ? PAL.teal : PAL.red;
  return (<Paper><svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <text x={960} y={170} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={66} fill={PAL.ink} opacity={fin(u, 0)}>{s.label}</text>
    {[340, 500, 660, 820].map((y) => <line key={y} x1={260} y1={y} x2={1660} y2={y} stroke={PAL.ink} strokeWidth={2} opacity={.12} />)}
    <polyline points={vis.map((p) => p.join(",")).join(" ")} fill="none" stroke={col} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={e[0]} cy={e[1]} r={16} fill={col} stroke={PAL.ink} strokeWidth={4} />
    <g opacity={fin(u, s.dur * .62, .35)} transform={`translate(${s.mode === "crash" ? 1350 : s.mode === "dip" ? 990 : 1480} ${s.mode === "crash" ? 330 : s.mode === "dip" ? 700 : 300})`}>
      <rect x={-210} y={-80} width={420} height={120} rx={16} fill={col} /><text x={0} y={8} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={70} fill={PAL.white}>{s.tag}</text></g>
    <text x={260} y={912} fontFamily={F} fontWeight={700} fontSize={40} fill={PAL.ink} opacity={.7}>{s.from}</text>
    <text x={1660} y={912} textAnchor="end" fontFamily={F} fontWeight={700} fontSize={40} fill={PAL.ink} opacity={.7}>{s.to}</text>
  </svg></Paper>);
};
// two bars side by side (profit halves; sales down 10%)
const Bars: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const max = Math.max(...s.items.map((x: any) => x[1]));
  return (<Paper><svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <text x={960} y={170} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={66} fill={PAL.ink} opacity={fin(u, 0)}>{s.label}</text>
    <line x1={460} y1={860} x2={1460} y2={860} stroke={PAL.ink} strokeWidth={4} opacity={.5} />
    {s.items.map(([name, v]: [string, number], i: number) => { const g = eoN(clamp01((u - .3 - i * .7) / .7)), h = 520 * v / max * g, x = 640 + i * 520;
      return (<g key={i}><rect x={x - 130} y={860 - h} width={260} height={h} rx={10} fill={i === s.items.length - 1 ? PAL.red : PAL.teal} />
        <text x={x} y={920} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={44} fill={PAL.ink}>{name}</text></g>); })}
    {s.tag && <g opacity={fin(u, 1.6, .35)}><rect x={1300} y={300} width={460} height={120} rx={16} fill={PAL.red} /><text x={1530} y={385} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={66} fill={PAL.white}>{s.tag}</text></g>}
    {s.note && <text x={960} y={1010} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={52} fill={PAL.red} opacity={fin(u, s.dur * .55)}>{s.note}</text>}
  </svg></Paper>);
};
// royalty: the more shoes sell, the more comes back to the player
const Royalty: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const d = s.dur, n = Math.round(interpolate(u, [d * .2, d * .85], [3, 24], cl));
  return (<Paper><svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <text x={960} y={170} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={68} fill={PAL.ink} opacity={fin(u, 0)}>ロイヤルティ</text>
    <g opacity={fin(u, .15)}>{Array.from({ length: n }, (_, i) => <path key={i} transform={`translate(${250 + (i % 8) * 72} ${360 + Math.floor(i / 8) * 90})`} d="M0 40 L10 8 L30 14 L44 2 L58 34 L58 50 L0 50Z" fill={PAL.red} />)}
      <text x={510} y={700} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={52} fill={PAL.ink}>売れた靴</text></g>
    <line x1={880} y1={500} x2={1180} y2={500} stroke={PAL.mustard} strokeWidth={12} opacity={fin(u, .5)} /><path d="M1210 500 L1170 470 L1170 530Z" fill={PAL.mustard} opacity={fin(u, .5)} />
    <g opacity={fin(u, .8)}><rect x={1240} y={390} width={420} height={220} rx={26} fill={PAL.teal} /><text x={1450} y={515} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={64} fill={PAL.white}>ジョーダン</text></g>
    <text x={960} y={880} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={60} fill={PAL.red} opacity={fin(u, d * .45)}>売れるほど、本人にも入る</text>
  </svg></Paper>);
};
const Summary: React.FC<{ s: Shot; u: number }> = ({ s, u }) => (
  <Paper bg={PAL.navy2}><AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40 }}>
    {s.items.map(([v, pre, suf, label, dec]: [number, string, string, string, number], i: number) => {
      const at = s.dur * (.08 + i * .26);
      return (<div key={i} style={{ display: "flex", alignItems: "baseline", gap: 40, opacity: fin(u, at - .1, .3) }}>
        <Count u={u} at={at} value={v} prefix={pre} suffix={suf} dec={dec || 0} size={150} color={PAL.mustard} />
        <span style={{ fontFamily: F, fontWeight: 700, fontSize: 52, color: PAL.paper }}>{label}</span></div>);
    })}
  </AbsoluteFill></Paper>
);
const EndCard: React.FC<{ s: Shot; u: number }> = ({ s, u }) => (
  <Paper bg={PAL.navy2}><AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
    <div style={{ fontFamily: F, fontWeight: 900, fontSize: 150, color: PAL.paper, letterSpacing: 20, opacity: fin(u, .1, .5) }}>企業図鑑</div>
    <div style={{ width: 700 * fin(u, .3, .7), height: 5, background: PAL.mustard, margin: "30px 0 50px" }} />
    {s.lines.map(([at, txt]: [number, string], i: number) => <div key={i} style={{ fontFamily: F, fontWeight: 700, fontSize: 56, color: i === s.lines.length - 1 ? PAL.mustard : PAL.paper, opacity: fin(u, at, .4), margin: "12px 0" }}>{txt}</div>)}
  </AbsoluteFill></Paper>
);
// the title: one curved line draws itself (the 35-dollar line of chapter 2), then the name
const Title: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const d = "M300 620 C520 760 820 760 1200 520 C1380 410 1560 330 1660 300 C1500 420 1250 640 980 720 C700 800 430 760 300 620Z";
  const draw = eoN(clamp01(u / 1.1)), fill = eoN(clamp01((u - 1.0) / .6));
  return (
    <Paper bg={PAL.navy2}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", opacity: .9 }}>
        <g transform="translate(330 330) scale(.66)"><path d={d} fill={PAL.mustard} opacity={.22 * fill} />
        <path d={d} fill="none" stroke={PAL.mustard} strokeWidth={8} strokeDasharray={4200} strokeDashoffset={4200 * (1 - draw)} strokeLinejoin="round" /></g>
      </svg>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", paddingBottom: 160 }}>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 130, color: PAL.paper, opacity: fin(u, .2, .6), letterSpacing: 8, textShadow: "0 6px 30px rgba(10,14,24,.85)" }}>ナイキの全歴史</div>
        <div style={{ fontFamily: F, fontWeight: 700, fontSize: 64, color: PAL.mustard, opacity: fin(u, .7, .6), letterSpacing: 12, marginTop: 20 }}>1949–2026</div>
      </AbsoluteFill>
      <YearBar t={u} a={.9} b={Math.max(1.5, s.dur - .2)} from={2026} to={1949} span={SPAN} />
    </Paper>
  );
};
function Shot({ s, u }: { s: Shot; u: number }) {
  switch (s.kind) {
    case "img": return <ImgShot s={s} u={u} />;
    case "name": return <CenterText u={u} text={s.text} sub={s.sub} size={s.size || 150} />;
    case "punch": return <CenterText u={u} text={s.text} bg="#0b0b0e" fg="#f4f1ea" size={s.size || 96} />;
    case "textcard": return <CenterText u={u} text={s.text} sub={s.sub} size={s.size || (s.text.length > 12 ? 110 : 150)} />;
    case "chapter": return <Chapter u={u} n={s.n} />;
    case "bignum": return <BigNum s={s} u={u} />;
    case "rename": return <Rename s={s} u={u} />;
    case "principle": return <Principle s={s} u={u} />;
    case "year": return <Year s={s} u={u} />;
    case "growth": return <Growth s={s} u={u} />;
    case "percent": return <Percent s={s} u={u} />;
    case "calc": return <Calc s={s} u={u} />;
    case "stock": return <Stock s={s} u={u} />;
    case "bars": return <Bars s={s} u={u} />;
    case "royalty": return <Royalty s={s} u={u} />;
    case "summary": return <Summary s={s} u={u} />;
    case "end": return <EndCard s={s} u={u} />;
    case "title": return <Title s={s} u={u} />;
    default: return null;
  }
}
// fact chips: a number the narration says, over a picture (centre-low), never next to a counter card
const FACT_RE = /(約)?([0-9][0-9,]*(?:\.[0-9]+)?)(万|億|兆)?(ドル|円|店|足|社|本|秒|時間|歳|%|人|カ国|倍)/;
type Fact = { a: number; b: number; value: number; dec: number; prefix: string; suffix: string };
const FACTS: Fact[] = [];
plan.subs.forEach(([a, b, x]) => {
  const m = x.match(FACT_RE); if (!m || parseFloat(m[2].replace(/,/g, "")) < 2 && !m[2].includes(".")) return;
  const sh = [...plan.shots].reverse().find((q) => q.t <= a + .05);
  if (!sh || sh.kind !== "img" || sh.noChip) return;
  const prev = FACTS[FACTS.length - 1]; if (prev && a < prev.b + .3) return;
  const end = sh.t + sh.dur;
  FACTS.push({ a, b: Math.min(b + 1.4, a + 3.6, end - .1), value: parseFloat(m[2].replace(/,/g, "")), dec: m[2].includes(".") ? (m[2].split(".")[1].length) : 0, prefix: m[1] || "", suffix: (m[3] || "") + m[4] });
});
const FactChip: React.FC<{ t: number }> = ({ t }) => {
  const f = FACTS.find((q) => t >= q.a && t < q.b); if (!f || f.b - f.a < .6) return null;
  const u = t - f.a, o = clamp01(u / .2) * clamp01((f.b - t) / .25);
  return (<div style={{ position: "absolute", left: 0, right: 0, bottom: 190, display: "flex", justifyContent: "center", opacity: o, transform: `translateY(${(1 - eoN(clamp01(u / .3))) * 30}px) scale(${.9 + .1 * eoN(clamp01(u / .3))})` }}><div style={{ padding: "12px 44px 16px", background: "rgba(20,22,30,.9)", border: "4px solid " + PAL.mustard, borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,.55)" }}>
    <Count u={u} at={.05} value={f.value} dec={f.dec} prefix={f.prefix} suffix={f.suffix} size={124} color={PAL.mustard} dur={.9} />
  </div></div>);
};
// year tracker in the corner (pictures only); stops at the closing callback
const YEARS: [number, number][] = [];
const EPILOGUE = (plan.subs.find(([, , x]) => x.startsWith("1962年、神戸の会議室で")) || [1e9])[0] as number;
plan.subs.forEach(([a, , txt]) => {
  if (a >= EPILOGUE) return;
  const m = txt.match(/(19[4-9]\d|20[0-2]\d)年/); if (m) YEARS.push([a, +m[1]]);
});
const YearTrack: React.FC<{ t: number; on: boolean }> = ({ t, on }) => {
  const first = plan.chapters[0].at + 3;
  if (t < first || t >= EPILOGUE - .3) return null;
  let i = -1; YEARS.forEach(([a], k) => { if (t >= a - .1) i = k; });
  if (i < 0) return null;
  const [a, y] = YEARS[i], py = i > 0 ? YEARS[i - 1][1] : y, k = interpolate(t, [a - .1, a + .7], [0, 1], { ...cl, easing: ease });
  const yr = py + (y - py) * k, X = (v: number) => 24 + 392 * (v - SPAN[0]) / (SPAN[1] - SPAN[0]);
  const pop = 1 + .25 * Math.sin(Math.PI * Math.min(1, (t - a + .1) / .5)) * (t - a + .1 < .5 ? 1 : 0);
  return (
    <svg width={460} height={110} style={{ position: "absolute", left: 56, top: 40, opacity: on ? .95 : 0 }}>
      <rect x={0} y={0} width={440} height={96} rx={14} fill="rgba(20,22,30,.62)" />
      <line x1={24} y1={66} x2={416} y2={66} stroke={PAL.paper} strokeWidth={3} opacity={.35} />
      {[1940, 1960, 1980, 2000, 2020].map((v) => <line key={v} x1={X(v)} y1={60} x2={X(v)} y2={72} stroke={PAL.paper} strokeWidth={2} opacity={.4} />)}
      <line x1={24} y1={66} x2={X(yr)} y2={66} stroke={PAL.mustard} strokeWidth={5} />
      <circle cx={X(yr)} cy={66} r={9 * pop} fill={PAL.mustard} stroke={PAL.paper} strokeWidth={2.5} />
      <text x={24} y={40} fontFamily={F} fontWeight={900} fontSize={34} fill={PAL.paper}>{Math.round(yr)}<tspan fontSize={20} fontWeight={700} dx={4}>年</tspan></text>
    </svg>
  );
};
const Grain: React.FC<{ seed: number }> = ({ seed }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", mixBlendMode: "multiply", opacity: .12, pointerEvents: "none" }}>
    <filter id="g2"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves={2} seed={seed} /><feColorMatrix type="matrix" values="0 0 0 0 .55  0 0 0 0 .5  0 0 0 0 .42  0 0 0 1 0" /></filter>
    <rect width={1920} height={1080} filter="url(#g2)" />
  </svg>
);
export const NikeEpisode: React.FC = () => {
  useFonts();
  const f = useCurrentFrame(), t = f / FPS, S = plan.shots;
  let k = 0; for (let i = 0; i < S.length; i++) if (t >= S[i].t) k = i;
  const cur = S[k], prev = S[k - 1], u = t - cur.t;
  const xf = prev && prev.kind === "img" && cur.kind === "img" ? XF_IMG : XF;
  const WIPE = .5, wiping = !!(cur.wipe && prev && u < WIPE), wk = wiping ? eoN(clamp01(u / WIPE)) : 1;
  const fade = wiping ? 1 : (prev && u < xf ? interpolate(u, [0, xf], [0, 1], { ...cl, easing: ease }) : 1);
  const endFade = interpolate(t, [plan.duration - 1.2, plan.duration], [0, 1], cl);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("nike/narration.wav")} />
      {prev && (fade < 1 || wiping) && <AbsoluteFill><Shot s={prev} u={t - prev.t} /></AbsoluteFill>}
      <AbsoluteFill style={{ opacity: fade, clipPath: wiping ? `inset(0 ${(1 - wk) * 100}% 0 0)` : undefined }}><Shot s={cur} u={u} /></AbsoluteFill>
      {wiping && <div style={{ position: "absolute", top: 0, bottom: 0, left: `${wk * 100}%`, width: 10, marginLeft: -5, background: PAL.mustard, boxShadow: "0 0 30px rgba(214,168,74,.8)" }} />}
      <Grain seed={f % 30} />
      <YearTrack t={t} on={cur.kind === "img"} />
      <FactChip t={t} />
      <Subs t={t} />
      <AbsoluteFill style={{ background: "#000", opacity: endFade }} />
    </AbsoluteFill>
  );
};
// keywords (numbers with their units, and names) in mustard
const KW = /([約]?[0-9][0-9,.]*(?:万|億|兆)?(?:年|月|日|店|足|社|ドル|円|カ国|秒|時間|歳|%|人|倍|分)?|ナイキ|フィル・ナイト|ナイト|バウワーマン|オニツカ|鬼塚喜八郎|鬼塚|アシックス|ジョーダン|マイケル・ジョーダン|日商岩井|キャロリン・デイビッドソン|デイビッドソン|フランク・ルディ|ジェフ・ジョンソン|ダン・ウィーデン|キプチョゲ|エリオット・ヒル|神戸|ブルー・リボン・スポーツ)/g;
const mark = (txt: string, k0: number) => txt.split(KW).map((p, i) => (i % 2 ? <span key={k0 + i} style={{ color: PAL.mustard }}>{p}</span> : p));
const hl = (txt: string) => {
  if (txt.length <= 30) return mark(txt, 0);
  let best = -1;
  for (let i = 8; i < txt.length - 6; i++) {
    const ok = "、」をはがでに".includes(txt[i - 1]) || txt[i] === "「";
    if (ok && (best < 0 || Math.abs(i - txt.length / 2) < Math.abs(best - txt.length / 2))) best = i;
  }
  if (best < 0) return mark(txt, 0);
  return <>{mark(txt.slice(0, best), 0)}<br />{mark(txt.slice(best), 100)}</>;
};
const Subs: React.FC<{ t: number }> = ({ t }) => {
  const cur = plan.subs.find(([a, b]) => t >= a && t < b);
  if (!cur) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 56, textAlign: "center", opacity: fin(t, cur[0], .1) }}>
      <span style={{ display: "inline-block", maxWidth: 1640, textWrap: "balance" as any, padding: "10px 34px", background: "rgba(20,22,30,.72)", borderRadius: 8, fontFamily: F, fontWeight: 700, fontSize: 50, color: "#fff" }}>{hl(cur[2])}</span>
    </div>
  );
};
export const NIKE_EP_FRAMES = Math.round(plan.duration * FPS);
