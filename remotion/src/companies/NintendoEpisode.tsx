// Company history channel (企業の図鑑) — Ep3 "任天堂" (full episode, 1920x1080).
// Shots, subtitles and chapters come from nintendo_ep3_plan.json (v9 cut table on the re-paced narration, one visual per sentence);
// images are the graded stills in public/kz3; everything with numbers, words or diagrams is drawn here in code.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import PLAN from "./nintendo_ep3_plan.json";
import { PAL } from "./illustrations";
import { YearBar } from "./McdOpening";
import { useFonts } from "./fonts";

type Shot = { t: number; dur: number; kind: string; [k: string]: any };
const plan = PLAN as unknown as { fps: number; duration: number; shots: Shot[]; subs: [number, number, string][]; chapters: { no: string; title: string; years: string; at: number }[]; epilogue: number; heavy: [number, number][] };
const FPS = plan.fps, XF = 0.35, XF_IMG = 0.16;
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const fin = (u: number, a: number, d = 0.4) => interpolate(u, [a, a + d], [0, 1], { ...cl, easing: ease });
const F = "NSJP";
const clamp01 = (x: number) => Math.max(0, Math.min(1, x)), eoN = (x: number) => 1 - Math.pow(1 - x, 3);
const num = (v: number, dec = 0) => (dec ? v.toFixed(dec) : Math.round(v).toLocaleString("en-US"));
const SPAN: [number, number] = [1889, 2026];
const manParts = (v: number) => (v >= 10000 ? [{ value: Math.floor(v / 10000), suffix: "億" }, { value: v % 10000, suffix: "万" }] : [{ value: v, suffix: "万" }]);

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
  const k = s.kb, two = s.dur > 9 && !s.final;
  // one eased move per hold; holds over 9 s get a second move (push in on the other side) so nothing sits still
  const half = two ? s.dur * .5 : s.dur + XF;
  const p1 = interpolate(u, [0, half], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) }), p2 = two ? interpolate(u, [half, s.dur + XF], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) }) : 0;
  const zMin = Math.min(k.z0, k.z1), limMin = Math.max(0, ((zMin - 1) / (2 * zMin)) * 100 - 0.2), cp = (v: number) => Math.max(-limMin, Math.min(limMin, v));
  let z = k.z0 + (k.z1 - k.z0) * p1, x = cp(k.x0) + (cp(k.x1) - cp(k.x0)) * p1, y = cp(k.y0) + (cp(k.y1) - cp(k.y0)) * p1;
  if (two) { const z2 = Math.max(z, 1.06) + .06; const lim2 = ((z2 - 1) / (2 * z2)) * 100 - .3; z = z + (z2 - z) * p2; x = x + (Math.max(-lim2, Math.min(lim2, -x * 1.2)) - x) * p2; y = y + (Math.max(-lim2, Math.min(lim2, -y)) - y) * p2; }
  if (s.final) { z = 1; x = 0; y = 0; }
  const tilt = s.final ? 0 : (k.x1 > k.x0 ? 1 : -1) * (-.7 + 1.4 * (two ? (p1 + p2) / 2 : p1));
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#111" }}>
      <AbsoluteFill style={{ transformOrigin: "50% 50%", transform: `perspective(2200px) rotateY(${tilt}deg) scale(${z}) translate(${x}%, ${y}%)` }}>
        <Img src={staticFile(`kz3/${s.placeholder ? "V76.jpg" : s.src}`)} style={{ width: 1920, height: 1080, objectFit: "cover", filter: s.placeholder ? "sepia(.5) brightness(.8)" : undefined, transform: s.placeholder ? "scale(1.5) translate(8%, 6%)" : undefined }} />
      </AbsoluteFill>
      {s.chip && <ImgChip u={u} c={s.chip} />}
    </AbsoluteFill>
  );
};
const ImgChip: React.FC<{ u: number; c: any }> = ({ u, c }) => {
  const o = fin(u, c.at, .3);
  return (<div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", justifyContent: "center", opacity: o, transform: `translateY(${(1 - o) * 30}px) scale(${.92 + .08 * o})` }}>
    <div style={{ padding: "18px 56px 22px", background: "rgba(20,22,30,.9)", border: "4px solid " + PAL.mustard, borderRadius: 18, textAlign: "center", boxShadow: "0 12px 40px rgba(0,0,0,.55)" }}>
      <div style={{ fontFamily: F, fontWeight: 700, fontSize: 40, color: PAL.paper, opacity: .85 }}>{c.label}</div>
      <div style={{ fontFamily: F, fontWeight: 900, fontSize: 104, color: PAL.mustard }}>{c.text}</div></div></div>);
};
const CenterText: React.FC<{ u: number; text: string; sub?: string; bg?: string; fg?: string; size?: number; subCol?: string }> = ({ u, text, sub, bg = PAL.paper, fg = PAL.ink, size = 140, subCol = PAL.red }) => (
  <Paper bg={bg}><AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
    <div style={{ fontFamily: F, fontWeight: 900, fontSize: size, color: fg, opacity: fin(u, .05, .35), transform: `scale(${.97 + .03 * fin(u, .05, .5)})`, letterSpacing: 4, textAlign: "center", whiteSpace: "pre-line", lineHeight: 1.25 }}>{text}</div>
    {sub && <div style={{ fontFamily: F, fontWeight: 700, fontSize: 52, color: subCol, opacity: fin(u, .5), marginTop: 26, letterSpacing: 8 }}>{sub}</div>}
  </AbsoluteFill></Paper>
);
const Chapter: React.FC<{ u: number; n: number }> = ({ u, n }) => {
  const c = plan.chapters[n - 1], w = 900 * fin(u, .25, .8);
  const [y0, y1] = c.years.split("–").map((x) => parseInt(x, 10)), X = (y: number) => 360 + 1200 * (y - SPAN[0]) / (SPAN[1] - SPAN[0]);
  const hi = fin(u, .5, 1.0), ya = X(y0), yb = X(isNaN(y1) ? 2026 : y1);
  return (
    <Paper bg={PAL.navy2}>
      <div style={{ position: "absolute", right: 90, top: -40, fontFamily: F, fontWeight: 900, fontSize: 520, color: PAL.paper, opacity: .05, transform: `translateX(${(1 - fin(u, 0, 1.2)) * 120}px)` }}>{n <= 5 ? n : ""}</div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", paddingBottom: 80 }}>
        <div style={{ fontFamily: F, fontWeight: 700, fontSize: 56, color: PAL.mustard, letterSpacing: 16, opacity: fin(u, 0), transform: `translateY(${(1 - fin(u, 0, .5)) * -24}px)` }}>{c.no}</div>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: c.title.length > 16 ? 76 : c.title.length > 10 ? 92 : 128, color: PAL.paper, marginTop: 18, letterSpacing: 6, display: "flex" }}>
          {[...c.title].map((ch, i) => <span key={i} style={{ opacity: fin(u, .12 + i * .045, .3), transform: `translateY(${(1 - fin(u, .12 + i * .045, .35)) * 40}px)`, display: "inline-block" }}>{ch}</span>)}
        </div>
        <div style={{ width: w, height: 5, background: PAL.mustard, margin: "34px 0 26px" }} />
        <div style={{ fontFamily: F, fontWeight: 700, fontSize: 50, color: PAL.paper, opacity: .8 * fin(u, .5), letterSpacing: 10 }}>{c.years}</div>
      </AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", opacity: fin(u, .3, .5) }}>
        <line x1={360} y1={940} x2={1560} y2={940} stroke={PAL.paper} strokeWidth={3} opacity={.3} />
        {[1889, 1950, 2000, 2026].map((y) => <text key={y} x={X(y)} y={990} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={26} fill={PAL.paper} opacity={.45}>{y}</text>)}
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
      : (s.parts || s.man) ? <div style={{ display: "flex", alignItems: "baseline" }}>{(s.parts || manParts(s.value)).map((p: any, i: number, arr: any[]) => <Count key={i} u={u} at={.2 + i * .5} value={p.value} prefix={i === 0 ? (s.prefix || p.prefix || "") : ""} suffix={(p.suffix || "") + (i === arr.length - 1 && s.man ? s.suffix.replace("万", "") : "")} dec={p.dec || 0} size={s.size || 230} color={s.dark ? "#E0564A" : PAL.red} />)}</div>
        : <Count u={u} at={.2} value={s.value} prefix={s.prefix} suffix={s.suffix} dec={s.dec || 0} size={s.size || 260} color={s.dark ? "#E0564A" : PAL.red} />}
    {s.extra && <div style={{ fontFamily: F, fontWeight: 900, fontSize: 76, color: s.dark ? PAL.paper : PAL.ink, marginTop: 36, opacity: fin(u, s.extraAt ?? 1.4) }}>{s.extra}</div>}
  </AbsoluteFill></Paper>
);
// a principle of business (one per chapter)
const Principle: React.FC<{ s: Shot; u: number }> = ({ s, u }) => (
  <Paper bg={PAL.navy2}><AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
    <div style={{ width: 120 * fin(u, 0, .5), height: 6, background: PAL.mustard, marginBottom: 34 }} />
    <div style={{ fontFamily: F, fontWeight: 700, fontSize: 64, color: PAL.mustard, letterSpacing: 18, opacity: fin(u, .05) }}>{s.label}</div>
    {s.text && <div style={{ fontFamily: F, fontWeight: 900, fontSize: s.big ? 132 : 84, letterSpacing: s.big ? 8 : 2, color: PAL.paper, marginTop: 40, opacity: fin(u, .45), transform: `translateY(${(1 - fin(u, .45, .5)) * 26}px)` }}>{s.text}</div>}
  </AbsoluteFill></Paper>
);
const Year: React.FC<{ s: Shot; u: number }> = ({ s, u }) => (
  <Paper bg={PAL.navy2}><AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", paddingBottom: 140 }}>
    <div style={{ fontFamily: F, fontWeight: 900, fontSize: 280, color: PAL.paper, opacity: fin(u, .05, .3), transform: `scale(${1.08 - .08 * fin(u, .05, .4)})`, letterSpacing: 10 }}>{s.year}</div>
    {s.sub && <div style={{ fontFamily: F, fontWeight: 700, fontSize: 54, color: PAL.mustard, opacity: fin(u, .5), letterSpacing: 10 }}>{s.sub}</div>}
  </AbsoluteFill>
    {s.chap && <div style={{ position: "absolute", left: 80, top: 70, fontFamily: F, fontWeight: 700, fontSize: 40, color: PAL.paper, opacity: .75 * fin(u, .3) }}>{s.chap}</div>}
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
// two bars side by side (profit halves; sales down 10%)
const Bars: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const max = Math.max(...s.items.map((x: any) => x[1]));
  return (<Paper><svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <text x={960} y={170} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={66} fill={PAL.ink} opacity={fin(u, 0)}>{s.label}</text>
    <line x1={460} y1={860} x2={1460} y2={860} stroke={PAL.ink} strokeWidth={4} opacity={.5} />
    {s.items.map(([name, v, lab]: [string, number, string], i: number) => { const g = eoN(clamp01((u - .3 - i * (s.step ?? 1.1)) / 1.0)), h = Math.max(6, 520 * v / max) * g, x = 640 + i * 520;
      return (<g key={i}><rect x={x - 130} y={860 - h} width={260} height={h} rx={10} fill={i === s.items.length - 1 ? PAL.red : PAL.teal} />
        {lab && <text x={x} y={840 - h} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={66} fill={i === s.items.length - 1 ? PAL.red : PAL.ink} opacity={fin(u, .6 + i * (s.step ?? 1.1), .3)}>{lab}</text>}
        <text x={x} y={920} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={44} fill={PAL.ink}>{name}</text></g>); })}
    {s.tag && <g opacity={fin(u, 1.6, .35)}><rect x={1300} y={300} width={460} height={120} rx={16} fill={PAL.red} /><text x={1530} y={385} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={66} fill={PAL.white}>{s.tag}</text></g>}
    {s.note && <text x={960} y={1010} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={52} fill={PAL.red} opacity={fin(u, s.dur * .55)}>{s.note}</text>}
  </svg></Paper>);
};

// 137 years on one line, with the near-deaths marked (hook)
const Timeline137: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const X = (y: number) => 200 + 1520 * (y - 1889) / (2026 - 1889), k = interpolate(u, [.2, 1.6], [0, 1], { ...cl, easing: ease });
  const M: [number, string][] = [[1965, "トランプの不振"], [1973, "オイルショック"], [1985, "死んだ市場へ"], [1996, "主役の交代"], [2014, "3期連続の赤字"]];
  return (<Paper bg={PAL.navy2}><svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <text x={960} y={250} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={84} fill={PAL.paper} opacity={fin(u, 0)}>137年</text>
    <line x1={200} y1={560} x2={200 + 1520 * k} y2={560} stroke={PAL.mustard} strokeWidth={10} strokeLinecap="round" />
    {[1889, 1950, 2000, 2026].map((y) => <text key={y} x={X(y)} y={630} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={34} fill={PAL.paper} opacity={.7 * fin(u, .3)}>{y}</text>)}
    {M.map(([y, l], i) => { const a = .9 + i * .45, o = fin(u, a, .25), L = [-200, 150, -110, 240, -200][i], up = L < 0;
      return (<g key={i} opacity={o} transform={`translate(${X(y)} 560)`}>
        <path d="M0 -38 L22 0 L0 38 L-22 0Z" fill="#E0564A" transform={`scale(${.6 + .4 * o})`} />
        <line x1={0} y1={up ? -46 : 46} x2={0} y2={L + (up ? 20 : -36)} stroke="#E0564A" strokeWidth={3} />
        <text x={0} y={L} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={34} fill={PAL.paper}>{l}</text></g>); })}
  </svg></Paper>);
};
// the US home-game market: rises to $3.2bn (92), then falls to $0.1bn (97), the two numbers (98) and "about 97% gone" (99)
const Market: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const grow = s.stage === "grow", N = 40;
  const k = grow ? interpolate(u, [.3, 2.2], [0, 1], { ...cl, easing: ease }) : 1, f = grow ? 0 : interpolate(u, [.3, 2.0], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  const Y = (v: number) => 860 - 560 * v / 32;
  const up = Array.from({ length: N + 1 }, (_, i) => { const x = i / N; return [260 + 800 * x, Y(4 + 28 * Math.pow(x, 1.6))]; }).slice(0, Math.max(2, Math.round((N + 1) * k)));
  const down = Array.from({ length: N + 1 }, (_, i) => { const x = i / N; return [1060 + 560 * x, Y(32 - 31 * Math.pow(x, .7))]; }).slice(0, Math.max(1, Math.round((N + 1) * f)));
  const pts = grow ? up : [...up, ...down.slice(1)], e = pts[pts.length - 1];
  const t98 = s.at98 ?? 99, t99 = s.at99 ?? 99;
  return (<Paper><svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <text x={960} y={150} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={64} fill={PAL.ink} opacity={fin(u, 0)}>アメリカの家庭用ゲーム市場</text>
    <line x1={260} y1={880} x2={1660} y2={880} stroke={PAL.ink} strokeWidth={4} opacity={.5} />
    <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={grow ? PAL.teal : PAL.red} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={e[0]} cy={e[1]} r={18} fill={PAL.mustard} stroke={PAL.ink} strokeWidth={4} />
    <text x={260} y={930} fontFamily={F} fontWeight={700} fontSize={38} fill={PAL.ink} opacity={.7}>1980年代初め</text>
    {!grow && <text x={1660} y={930} textAnchor="end" fontFamily={F} fontWeight={700} fontSize={38} fill={PAL.ink} opacity={.7}>1985年</text>}
    <g opacity={grow ? fin(u, 1.9, .3) : 1}><text x={1060} y={Y(32) - 40} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={grow ? 92 : 70} fill={PAL.teal}>約32億ドル</text></g>
    {!grow && <text x={1640} y={Y(1) - 40} textAnchor="end" fontFamily={F} fontWeight={900} fontSize={84} fill={PAL.red} opacity={fin(u, 1.8, .3)}>約1億ドル</text>}
    {!grow && <g opacity={fin(u, t98, .35)}><rect x={460} y={190} width={1000} height={130} rx={18} fill={PAL.navy2} /><text x={960} y={280} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={80} fill={PAL.paper}>32億ドル <tspan fill={PAL.mustard}>→</tspan> 1億ドル</text></g>}
    {!grow && <g opacity={fin(u, t99, .3)} transform={`translate(1360 560) rotate(-8) scale(${1.15 - .15 * fin(u, t99, .3)})`}><rect x={-250} y={-90} width={500} height={150} rx={18} fill={PAL.red} /><text x={0} y={18} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={84} fill={PAL.white}>約97%消失</text></g>}
  </svg></Paper>);
};
// a quality seal (generic gold seal; drawn here, not anyone's logo)
const Seal: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const o = fin(u, .2, .35), sc = 1.25 - .25 * eoN(clamp01((u - .2) / .35)), R = Array.from({ length: 36 }, (_, i) => { const a = i / 36 * Math.PI * 2, r = i % 2 ? 250 : 275; return `${960 + r * Math.cos(a)},${520 + r * Math.sin(a)}`; }).join(" ");
  return (<Paper bg={PAL.navy2}><svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <g opacity={o} transform={`translate(960 520) scale(${sc}) rotate(${-8 + 8 * o}) translate(-960 -520)`}>
      <polygon points={R} fill={PAL.mustard} /><circle cx={960} cy={520} r={215} fill="none" stroke={PAL.navy2} strokeWidth={6} />
      <text x={960} y={505} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={96} fill={PAL.navy2}>品質保証</text>
      <text x={960} y={585} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={32} fill={PAL.navy2}>審査に合格したゲームだけ</text></g>
    <text x={960} y={175} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={52} fill={PAL.paper} opacity={fin(u, .9)}>品質保証のシール</text>
  </svg></Paper>);
};
// four shades of grey (the Game Boy screen)
const Grays: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const C = ["#E0E8C8", "#A8B890", "#5E7058", "#26301F"];
  return (<Paper><svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <text x={960} y={190} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={70} fill={PAL.ink} opacity={fin(u, 0)}>白黒の画面　表示は4段階だけ</text>
    {C.map((c, i) => <g key={i} opacity={fin(u, .3 + i * .3, .25)}><rect x={360 + i * 310} y={340} width={290} height={400} rx={14} fill={c} stroke={PAL.ink} strokeWidth={4} />
      <text x={505 + i * 310} y={810} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={60} fill={PAL.ink}>{i + 1}</text></g>)}
  </svg></Paper>);
};
// 4 AA batteries, about 15 hours
const Battery: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const hrs = Math.round(15 * eoN(clamp01((u - 1.2) / 1.6)));
  return (<Paper><svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    {[0, 1, 2, 3].map((i) => <g key={i} opacity={fin(u, .1 + i * .2, .25)} transform={`translate(${300 + i * 150} 300)`}>
      <rect x={0} y={30} width={110} height={420} rx={18} fill={PAL.teal} stroke={PAL.ink} strokeWidth={5} /><rect x={30} y={8} width={50} height={26} rx={6} fill={PAL.ink} />
      <rect x={14} y={60} width={82} height={360 * (1 - .15 * clamp01((u - 1.2) / 2))} rx={10} fill={PAL.mustard} opacity={.85} /></g>)}
    <text x={510} y={850} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={60} fill={PAL.ink} opacity={fin(u, .8)}>単三電池4本</text>
    <text x={1380} y={560} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={260} fill={PAL.red} opacity={fin(u, 1.1, .3)}>約{hrs}<tspan fontSize={120}>時間</tspan></text>
    <text x={1380} y={680} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={56} fill={PAL.ink} opacity={fin(u, 1.6)}>遊べる。価格も安い</text>
  </svg></Paper>);
};
// a spoken quote, written exactly as said
const Quote: React.FC<{ s: Shot; u: number }> = ({ s, u }) => (
  <Paper bg={PAL.navy2}><AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
    <div style={{ fontFamily: F, fontWeight: 900, fontSize: 200, color: PAL.mustard, opacity: .5 * fin(u, 0), lineHeight: .6, marginBottom: 20 }}>“</div>
    {s.lines.map((l: string, i: number) => <div key={i} style={{ fontFamily: F, fontWeight: 900, fontSize: s.short ? 110 : 84, color: PAL.paper, lineHeight: 1.4, opacity: fin(u, .2 + i * (s.short ? .5 : Math.min(1.6, (s.dur - 1.5) / s.lines.length)), .4) }}>{l}</div>)}
    <div style={{ fontFamily: F, fontWeight: 700, fontSize: 44, color: PAL.mustard, marginTop: 44, opacity: fin(u, .6), letterSpacing: 6 }}>— {s.who}</div>
  </AbsoluteFill></Paper>
);
// net sales by fiscal year (March), shape only, from Nintendo's reports; the peak in question is marked
const SALES: [number, number][] = [[2005, 5152], [2006, 5093], [2007, 9672], [2008, 16724], [2009, 18386], [2010, 14343], [2011, 10143], [2012, 6476], [2013, 6354], [2014, 5717], [2015, 5497], [2016, 5044], [2017, 4890], [2018, 10556], [2019, 12005], [2020, 13085], [2021, 17589], [2022, 16953], [2023, 16016], [2024, 16718], [2025, 11649], [2026, 23130]];
const Sales: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const last = s.peak === 2009 ? 2009 : 2026, rows = SALES.filter(([y]) => y <= last), X = (y: number) => 330 + 1260 * (y - 2005) / (last - 2005), Y = (v: number) => 860 - 500 * v / 24000;
  const k = interpolate(u, [.2, Math.min(2.4, s.dur * .5)], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) }), n = Math.max(1, Math.round(rows.length * k));
  const bw = Math.min(150, 1260 / (last - 2005 + 1) * .72), pk = rows[rows.length - 1], bx = Math.min(1860 - 660, Math.max(60, X(pk[0]) - 330));
  return (<Paper><svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <text x={960} y={120} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={60} fill={PAL.ink} opacity={fin(u, 0)}>{s.label}</text>
    <line x1={230} y1={860} x2={1700} y2={860} stroke={PAL.ink} strokeWidth={4} opacity={.5} />
    {rows.slice(0, n).map(([y, v]) => <rect key={y} x={X(y) - bw / 2} y={Y(v)} width={bw} height={860 - Y(v)} rx={4} fill={y === s.peak ? PAL.red : PAL.teal} opacity={y === s.peak ? 1 : .8} />)}
    {(last === 2009 ? [2005, 2006, 2007, 2008, 2009] : [2005, 2009, 2015, 2020, 2026]).map((y) => <text key={y} x={X(y)} y={910} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={34} fill={PAL.ink} opacity={.7}>{y}</text>)}
    <g opacity={fin(u, Math.min(2.6, s.dur * .55), .35)}><line x1={X(pk[0])} y1={Y(pk[1]) - 12} x2={X(pk[0])} y2={Y(pk[1]) - 90} stroke={PAL.red} strokeWidth={4} />
      <rect x={bx} y={Y(pk[1]) - 190} width={660} height={100} rx={14} fill={PAL.red} />
      <text x={bx + 330} y={Y(pk[1]) - 122} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={44} fill={PAL.white}>{s.tag}</text></g>
  </svg></Paper>);
};
// Wii U: the yearly target (900万台) as an outline, then what sold (272万台) fills it
const Target: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const at = s.at183 ?? 3, g = eoN(clamp01((u - at - .1) / 1.0)), W = 1300 * 900 / 900, w = 1300 * 272 / 900 * g;
  return (<Paper><svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <text x={960} y={170} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={64} fill={PAL.ink} opacity={fin(u, 0)}>Wii U　1年間の販売</text>
    <g opacity={fin(u, .3)}><rect x={310} y={420} width={W} height={150} rx={14} fill="none" stroke={PAL.ink} strokeWidth={6} strokeDasharray="22 14" />
      <text x={310 + W} y={395} textAnchor="end" fontFamily={F} fontWeight={900} fontSize={60} fill={PAL.ink}>目標 900万台</text></g>
    <rect x={310} y={420} width={w} height={150} rx={14} fill={PAL.red} />
    <text x={310 + Math.max(w, 10) + 30} y={520} fontFamily={F} fontWeight={900} fontSize={80} fill={PAL.red} opacity={fin(u, at + .9, .3)}>272万台</text>
    <text x={960} y={760} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={60} fill={PAL.ink} opacity={fin(u, at + 1.6, .4)}>目標の3分の1にも届かない</text>
  </svg></Paper>);
};
// three years of operating losses (bars below zero, proportions from the reports; no amounts spoken)
const Loss: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const L: [string, number][] = [["2012年3月期", 373], ["2013年3月期", 364], ["2014年3月期", 464]];
  return (<Paper><svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <text x={960} y={170} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={64} fill={PAL.ink} opacity={fin(u, 0)}>営業利益</text>
    <line x1={360} y1={380} x2={1560} y2={380} stroke={PAL.ink} strokeWidth={5} opacity={.6} /><text x={340} y={392} textAnchor="end" fontFamily={F} fontWeight={700} fontSize={36} fill={PAL.ink} opacity={.6}>0</text>
    {L.map(([n, v], i) => { const g = eoN(clamp01((u - .4 - i * .6) / .7)), h = 420 * v / 464 * g, x = 560 + i * 400;
      return (<g key={i}><rect x={x - 110} y={380} width={220} height={h} rx={8} fill={PAL.red} />
        <text x={x} y={350} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={36} fill={PAL.ink}>{n}</text></g>); })}
    <g opacity={fin(u, 2.4, .35)}><rect x={1400} y={170} width={460} height={110} rx={16} fill={PAL.red} /><text x={1630} y={245} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={60} fill={PAL.white}>3期連続の赤字</text></g>
  </svg></Paper>);
};
// Wii U's whole year vs Switch's first month (201, then 202)
const Compare: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const at = s.at202 ?? 3, ga = eoN(clamp01((u - .3) / 1.0)), gb = eoN(clamp01((u - at) / 1.0)), M = 1100;
  return (<Paper><svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <g><text x={360} y={360} fontFamily={F} fontWeight={900} fontSize={54} fill={PAL.ink} opacity={fin(u, .1)}>Wii U　1年間</text>
      <rect x={360} y={390} width={M * 272 / 274 * ga} height={130} rx={12} fill={PAL.teal} />
      <text x={360 + M * 272 / 274 * ga + 30} y={480} fontFamily={F} fontWeight={900} fontSize={70} fill={PAL.teal} opacity={fin(u, 1.0)}>272万台</text></g>
    <g opacity={fin(u, at - .2, .3)}><text x={360} y={660} fontFamily={F} fontWeight={900} fontSize={54} fill={PAL.ink}>Switch　発売した1か月</text>
      <rect x={360} y={690} width={M * gb} height={130} rx={12} fill={PAL.red} />
      <text x={360 + M * gb + 30} y={780} fontFamily={F} fontWeight={900} fontSize={70} fill={PAL.red} opacity={fin(u, at + .9)}>274万台</text></g>
  </svg></Paper>);
};
const Summary: React.FC<{ s: Shot; u: number }> = ({ s, u }) => (
  <Paper bg={PAL.navy2}><AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40 }}>
    {s.items.map(([v, pre, suf, label, dec]: [number, string, string, string, number], i: number) => {
      const at = s.items.length === 2 ? .3 + i * Math.min(2.2, s.dur * .3) : s.dur * (.08 + i * .26);
      return (<div key={i} style={{ display: "flex", alignItems: "baseline", gap: 40, opacity: fin(u, at - .1, .3), flexDirection: "row-reverse" }}>
        {s.man ? <span style={{ display: "flex", alignItems: "baseline" }}>{manParts(v).map((p, j, arr) => <Count key={j} u={u} at={at + j * .4} value={p.value} suffix={p.suffix + (j === arr.length - 1 ? suf.replace("万", "") : "")} size={150} color={PAL.mustard} />)}</span>
          : <Count u={u} at={at} value={v} prefix={pre} suffix={suf} dec={dec || 0} size={150} color={PAL.mustard} />}
        <span style={{ fontFamily: F, fontWeight: 700, fontSize: 52, color: PAL.paper }}>{label}</span></div>);
    })}
  </AbsoluteFill></Paper>
);
const EndCard: React.FC<{ s: Shot; u: number }> = ({ s, u }) => (
  <Paper bg={PAL.navy2}><AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
    <div style={{ fontFamily: F, fontWeight: 900, fontSize: 150, color: PAL.paper, letterSpacing: 20, opacity: fin(u, .1, .5) }}>企業の図鑑</div>
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
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", paddingBottom: 160 }}>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 130, color: PAL.paper, opacity: fin(u, .2, .6), letterSpacing: 8, textShadow: "0 6px 30px rgba(10,14,24,.85)" }}>任天堂の全歴史</div>
        <div style={{ fontFamily: F, fontWeight: 700, fontSize: 64, color: PAL.mustard, opacity: fin(u, .7, .6), letterSpacing: 12, marginTop: 20 }}>1889–2026</div>
      </AbsoluteFill>
      <YearBar t={u} a={.6} b={Math.max(1.2, s.dur - .1)} from={2026} to={1889} span={SPAN} />
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
    case "principle": return <Principle s={s} u={u} />;
    case "year": return <Year s={s} u={u} />;
    case "growth": return <Growth s={s} u={u} />;
    case "percent": return <Percent s={s} u={u} />;
    case "calc": return <Calc s={s} u={u} />;
    case "bars": return <Bars s={s} u={u} />;
    case "timeline": return <Timeline137 s={s} u={u} />;
    case "market": return <Market s={s} u={u} />;
    case "seal": return <Seal s={s} u={u} />;
    case "grays": return <Grays s={s} u={u} />;
    case "battery": return <Battery s={s} u={u} />;
    case "quote": return <Quote s={s} u={u} />;
    case "sales": return <Sales s={s} u={u} />;
    case "target": return <Target s={s} u={u} />;
    case "loss": return <Loss s={s} u={u} />;
    case "compare": return <Compare s={s} u={u} />;
    case "summary": return <Summary s={s} u={u} />;
    case "end": return <EndCard s={s} u={u} />;
    case "title": return <Title s={s} u={u} />;
    default: return null;
  }
}
// fact chips: a number the narration says, over a picture (centre-low), never next to a counter card
const FACT_RE = /(約)?([0-9][0-9,]*(?:\.[0-9]+)?)(万|億|兆)?(ドル|円|本|台|個|秒|時間|歳|%|人|倍)/;
type Fact = { a: number; b: number; value: number; dec: number; prefix: string; suffix: string };
const FACTS: Fact[] = [];
plan.subs.forEach(([a, b, x]) => {
  const m = x.match(FACT_RE); if (!m || parseFloat(m[2].replace(/,/g, "")) < 2 && !m[2].includes(".")) return;
  const sh = [...plan.shots].reverse().find((q) => q.t <= a + .05);
  if (!sh || sh.kind !== "img" || sh.noChip || sh.chip || plan.heavy.some(([h0, h1]) => a >= h0 && a < h1)) return;
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
const EPILOGUE = plan.epilogue;
plan.subs.forEach(([a, , txt]) => {
  if (a >= EPILOGUE) return;
  const m = txt.match(/(18[89]\d|19\d\d|20[0-2]\d)年/); if (m) YEARS.push([a, +m[1]]);
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
      {[1900, 1950, 2000].map((v) => <line key={v} x1={X(v)} y1={60} x2={X(v)} y2={72} stroke={PAL.paper} strokeWidth={2} opacity={.4} />)}
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
export const NintendoEpisode: React.FC = () => {
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
      <Audio src={staticFile("kz3/narration.wav")} />
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
const KW = /([約]?[0-9][0-9,.]*(?:万|億|兆)?(?:年|月|日|台|個|本|ドル|円|秒|時間|歳|%|パーセント|人|倍|分)?|任天堂|山内溥|横井軍平|横井|岩田聡|岩田|ゲームボーイ|ファミリーコンピュータ|ゲームアンドウオッチ|ゲーム&ウオッチ|バーチャルボーイ|スイッチ|プレイステーション|ソニー|フィリップス|京都|枯れた技術の水平思考)/g;
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
export const NINTENDO_EP_FRAMES = Math.round(plan.duration * FPS);
