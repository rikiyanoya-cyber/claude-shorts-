// Company history channel — Ep1 "マクドナルドの全歴史" (full episode, 1920x1080).
// Shots, subtitles and chapters come from mcd_ep1_plan.json (built from the narration timing); images are the
// 87 graded stills in public/mcd; everything with numbers or diagrams is drawn here in code.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import PLAN from "./mcd_ep1_plan.json";
import { PAL } from "./illustrations";
import { WorldMapDots, YearBar } from "./McdOpening";
import { useFonts } from "./fonts";

type Shot = { t: number; dur: number; kind: string; [k: string]: any };
const plan = PLAN as unknown as { fps: number; duration: number; shots: Shot[]; subs: [number, number, string][]; chapters: { no: string; title: string; years: string; at: number }[] };
const FPS = plan.fps, XF = 0.35, XF_IMG = 0.16; // picture-to-picture is a near-cut (a long dissolve read as a double exposure)
// per-picture grading (review 2026-11-10): calmer contrast on the poster-like ones, 5-14 pulled from dusk toward dawn
const GRADE: Record<string, string> = { "ep01-5-11.jpg": "contrast(.86) saturate(.8)", "ep01-P14.jpg": "contrast(.86) saturate(.8)", "ep01-5-14.jpg": "hue-rotate(-14deg) saturate(.8) brightness(1.06)" };
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const fin = (u: number, a: number, d = 0.4) => interpolate(u, [a, a + d], [0, 1], { ...cl, easing: ease });
const F = "NSJP";
const clamp01 = (x: number) => Math.max(0, Math.min(1, x)), eoN = (x: number) => 1 - Math.pow(1 - x, 3);
const num = (v: number, dec = 0) => (dec ? v.toFixed(dec) : Math.round(v).toLocaleString("en-US"));

// ---------- pieces ----------
const Paper: React.FC<{ children?: React.ReactNode; bg?: string }> = ({ children, bg = PAL.paper }) => <AbsoluteFill style={{ background: bg }}>{children}</AbsoluteFill>;
const Count: React.FC<{ u: number; at: number; value: number; prefix?: string; suffix?: string; dec?: number; size?: number; color?: string; dur?: number }> = ({ u, at, value, prefix = "", suffix = "", dec = 0, size = 200, color = PAL.ink, dur = 1.5 }) => {
  // digit roll (review 2026-11-11): each digit spins blurred, then lands on its final value from left to right
  const chars = [...num(value, dec)], nd = chars.filter((c) => /\d/.test(c)).length; let di = 0;
  return <span style={{ fontFamily: F, fontWeight: 900, fontSize: size, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}><span style={{ fontSize: size * .5 }}>{prefix}</span>
    {chars.map((c, i) => {
      if (!/\d/.test(c)) return <span key={i}>{c}</span>;
      const idx = di++, land = at + dur * (0.3 + 0.7 * (idx + 1) / nd);
      if (u >= land) return <span key={i} style={{ display: "inline-block", transform: `translateY(${(1 - eoN(clamp01((u - land) / .18))) * -0.12 * size}px)` }}>{c}</span>;
      return <span key={i} style={{ display: "inline-block", filter: `blur(${Math.max(6, size * .07)}px)`, opacity: .5, transform: "scaleY(1.35)" }}>{Math.floor(u * 30 + idx * 3.7) % 10}</span>;
    })}<span style={{ fontSize: size * .45 }}>{suffix}</span></span>;
};
const Chip: React.FC<{ u: number; value: number; prefix: string; suffix: string }> = ({ u, value, prefix, suffix }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 190, display: "flex", justifyContent: "center", opacity: fin(u, .4) }}><div style={{ padding: "14px 46px 18px", background: "rgba(20,22,30,.9)", border: "4px solid " + PAL.mustard, borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,.55)" }}>
    <Count u={u} at={.4} value={value} prefix={prefix} suffix={suffix} size={140} color={PAL.mustard} />
  </div></div>
);
const ImgShot: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const k = s.kb, p = interpolate(u, [0, s.dur + XF], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  // one transform per hold (review 2026-11-11 evening): zoom and pan advance together under the same ease, the pan
  // range is fixed by the hold's smallest zoom so it never waits for the zoom ("zoom, then slide"); no extra pushes.
  // The final still does not move at all.
  const tg = s.t + u;
  const zMin = Math.min(k.z0, k.z1), limMin = Math.max(0, ((zMin - 1) / (2 * zMin)) * 100 - 0.2), cp = (v: number) => Math.max(-limMin, Math.min(limMin, v));
  const z = s.final ? 1.0 : k.z0 + (k.z1 - k.z0) * p;
  const x = s.final ? 0 : cp(k.x0) + (cp(k.x1) - cp(k.x0)) * p, y = s.final ? 0 : cp(k.y0) + (cp(k.y1) - cp(k.y0)) * p;
  const tilt = s.final ? 0 : (k.x1 > k.x0 ? 1 : -1) * (-.7 + 1.4 * p), tiltX = 0;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#111" }}>
      <AbsoluteFill style={{ transformOrigin: "50% 50%", transform: `perspective(2200px) rotateY(${tilt}deg) rotateX(${tiltX}deg) scale(${z}) translate(${x}%, ${y}%)` }}>
        <Img src={staticFile(`mcd/${s.src}`)} style={{ width: 1920, height: 1080, objectFit: "cover", filter: GRADE[s.src] }} />
        {s.src === "ep01-R4.jpg" && <R4Motion t={tg} />}
      </AbsoluteFill>
      {s.src === "ep01-5-14.jpg" && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(150,180,235,.42) 0%, rgba(235,190,200,.22) 30%, rgba(0,0,0,0) 50%)", mixBlendMode: "screen" }} />}
      {s.counter && <Chip u={u} value={s.counter[0]} prefix={s.counter[1]} suffix={s.counter[2]} />}
    </AbsoluteFill>
  );
};
// R4 (modern interior, held long): the ceiling lamps breathe and a light sweeps across the menu boards
const R4Motion: React.FC<{ t: number }> = ({ t }) => {
  const lamps = [[263, 205, 70], [558, 295, 55], [733, 340, 42], [820, 361, 34], [886, 377, 28]];
  const sw = ((t * .45) % 1), bx = 1300 + sw * 760;
  return (<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
    <defs><radialGradient id="lg"><stop offset="0" stopColor="#FFE9A8" stopOpacity=".9" /><stop offset="1" stopColor="#FFE9A8" stopOpacity="0" /></radialGradient>
      <linearGradient id="sweep" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
      <clipPath id="boards"><polygon points="1366,279 1926,0 1926,246 1366,369" /></clipPath></defs>
    {lamps.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r * (1.6 + .25 * Math.sin(t * 2.1 + i))} fill="url(#lg)" opacity={.35 + .2 * Math.sin(t * 1.7 + i * 1.3)} style={{ mixBlendMode: "screen" }} />)}
    <g clipPath="url(#boards)"><rect x={bx - 120} y={0} width={240} height={420} fill="url(#sweep)" transform={`skewX(-20)`} style={{ mixBlendMode: "screen" }} /></g>
  </svg>);
};
const CenterText: React.FC<{ u: number; text: string; sub?: string; bg?: string; fg?: string; size?: number }> = ({ u, text, sub, bg = PAL.paper, fg = PAL.ink, size = 140 }) => (
  <Paper bg={bg}><AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
    <div style={{ fontFamily: F, fontWeight: 900, fontSize: size, color: fg, opacity: fin(u, .05, .35), transform: `scale(${.97 + .03 * fin(u, .05, .5)})`, letterSpacing: 4, textAlign: "center" }}>{text}</div>
    {sub && <div style={{ fontFamily: F, fontWeight: 700, fontSize: 52, color: PAL.red, opacity: fin(u, .5), marginTop: 26, letterSpacing: 8 }}>{sub}</div>}
  </AbsoluteFill></Paper>
);
const Chapter: React.FC<{ u: number; n: number }> = ({ u, n }) => {
  const c = plan.chapters[n], w = 900 * fin(u, .25, .8);
  const [y0, y1] = c.years.split("–").map((x) => parseInt(x, 10)), X = (y: number) => 360 + 1200 * (y - 1940) / 86;
  const hi = fin(u, .5, 1.0), ya = X(y0), yb = X(isNaN(y1) ? 2026 : y1);
  return (
    <Paper bg={PAL.navy2}>
      <div style={{ position: "absolute", right: 90, top: -40, fontFamily: F, fontWeight: 900, fontSize: 520, color: PAL.paper, opacity: .05, transform: `translateX(${(1 - fin(u, 0, 1.2)) * 120}px)` }}>{n + 1}</div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", paddingBottom: 80 }}>
        <div style={{ fontFamily: F, fontWeight: 700, fontSize: 56, color: PAL.mustard, letterSpacing: 16, opacity: fin(u, 0), transform: `translateY(${(1 - fin(u, 0, .5)) * -24}px)` }}>{c.no}</div>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 128, color: PAL.paper, marginTop: 18, letterSpacing: 6, display: "flex" }}>
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
const MapCount: React.FC<{ s: Shot; u: number }> = ({ s, u }) => (
  <AbsoluteFill>
    <WorldMapDots t={u} a={s.fast ? -6 : 0.2} b={s.fast ? -0.5 : Math.min(8.5, s.dur * .8)} />
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(29,38,54,0) 45%, rgba(29,38,54,.88) 72%)" }} />
    {s.items.map(([fr, v, pre, suf, label]: [number, number, string, string, string], i: number) => {
      const at = fr * s.dur;
      return (<div key={i} style={{ position: "absolute", left: 1320, top: (s.items.length === 1 ? 380 : 150 + i * 260), opacity: fin(u, at - .1, .3) }}>
        <Count u={u} at={at} value={v} prefix={pre} suffix={suf} size={s.items.length === 1 ? 150 : 110} color={PAL.paper} />
        <div style={{ fontFamily: F, fontWeight: 700, fontSize: 38, color: PAL.paper, opacity: .85, marginTop: 10 }}>{label}</div>
      </div>);
    })}
  </AbsoluteFill>
);
const BigNum: React.FC<{ s: Shot; u: number }> = ({ s, u }) => (
  <Paper><AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
    <div style={{ fontFamily: F, fontWeight: 700, fontSize: 56, color: PAL.ink, opacity: .75 * fin(u, 0), marginBottom: 24 }}>{s.label}</div>
    <Count u={u} at={.2} value={s.value} prefix={s.prefix} suffix={s.suffix} dec={s.dec || 0} size={260} color={PAL.red} />
    {s.extra && <div style={{ fontFamily: F, fontWeight: 900, fontSize: 80, color: PAL.ink, marginTop: 36, opacity: fin(u, s.extraAt) }}>{s.extra}</div>}
  </AbsoluteFill></Paper>
);
const Menu: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const k = interpolate(u, [.4, Math.min(2.0, s.dur - .3)], [s.a, s.b], { ...cl, easing: Easing.inOut(Easing.cubic) }), n = Math.round(k);
  return (<Paper><AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
    <div style={{ fontFamily: F, fontWeight: 700, fontSize: 56, color: PAL.ink, opacity: .75 }}>メニュー</div>
    <div style={{ fontFamily: F, fontWeight: 900, fontSize: 240, color: n === s.b ? PAL.red : PAL.ink, lineHeight: 1.1 }}>{n}<span style={{ fontSize: 100 }}>品目</span></div>
    <div style={{ display: "flex", flexWrap: "wrap", width: 1100, justifyContent: "center", marginTop: 30, gap: 14 }}>
      {Array.from({ length: s.a }, (_, i) => <div key={i} style={{ width: 70, height: 46, borderRadius: 8, background: i < n ? PAL.mustard : PAL.paper2, opacity: i < n ? 1 : .5, transition: "none" }} />)}
    </div>
  </AbsoluteFill></Paper>);
};
const Price: React.FC<{ s: Shot; u: number }> = ({ s, u }) => (
  <Paper><AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <div style={{ background: PAL.white, padding: "60px 90px", minWidth: 900, boxShadow: "0 18px 40px rgba(0,0,0,.18)", transform: "rotate(-1.5deg)" }}>
      <div style={{ fontFamily: F, fontWeight: 900, fontSize: 44, color: PAL.red, letterSpacing: 10, marginBottom: 24 }}>1948</div>
      {s.items.map(([name, p]: [string, string], i: number) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: F, fontWeight: 900, fontSize: s.items.length > 1 ? 74 : 110, color: PAL.ink, opacity: fin(u, .2 + i * .7), borderBottom: `3px dashed ${PAL.paper2}`, padding: "10px 0" }}>
          <span>{name}</span><span style={{ color: PAL.red, marginLeft: 80 }}>{p}</span></div>
      ))}
    </div>
  </AbsoluteFill></Paper>
);
const Kitchen: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const st = ["注文", "焼く", "仕上げ", "包む", "渡す"], w = 250, x0 = 300;
  const p = ((u * .45) % 1), tok = x0 + p * (st.length - 1) * (w + 50);
  return (<Paper><svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <text x={960} y={200} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={70} fill={PAL.ink} opacity={fin(u, 0)}>工場の組立ラインのような厨房</text>
    <line x1={x0} y1={560} x2={x0 + (st.length - 1) * (w + 50)} y2={560} stroke={PAL.paper2} strokeWidth={18} />
    {st.map((n, i) => (<g key={n} opacity={fin(u, .2 + i * .25)}><rect x={x0 + i * (w + 50) - w / 2} y={440} width={w} height={240} rx={22} fill={PAL.white} stroke={PAL.ink} strokeWidth={5} />
      <circle cx={x0 + i * (w + 50)} cy={510} r={34} fill={PAL.navy} /><text x={x0 + i * (w + 50)} y={630} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={52} fill={PAL.ink}>{n}</text></g>))}
    <circle cx={tok} cy={760} r={30} fill={PAL.red} opacity={fin(u, 1.6)} /><path d={`M${tok - 30} 760 h60`} stroke={PAL.mustard} strokeWidth={8} opacity={fin(u, 1.6)} />
    <text x={960} y={900} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={64} fill={PAL.red} opacity={fin(u, s.dur * .55)}>1人＝1つの工程　／　注文から約30秒</text>
  </svg></Paper>);
};
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; col: string; o: number; label?: string; lx?: number; ly?: number }> = ({ x1, y1, x2, y2, col, o, label, lx, ly }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), hx = x2 - 30 * Math.cos(a), hy = y2 - 30 * Math.sin(a);
  return (<g opacity={o}><line x1={x1} y1={y1} x2={hx} y2={hy} stroke={col} strokeWidth={12} strokeLinecap="round" />
    <path d={`M${x2} ${y2} L${hx - 18 * Math.sin(a)} ${hy + 18 * Math.cos(a)} L${hx + 18 * Math.sin(a)} ${hy - 18 * Math.cos(a)}Z`} fill={col} />
    {label && <text x={lx} y={ly} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={54} fill={col}>{label}</text>}</g>);
};
const Box: React.FC<{ x: number; y: number; w: number; h: number; label: string; col: string; o: number; sub?: string }> = ({ x, y, w, h, label, col, o, sub }) => (
  <g opacity={o}><rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={26} fill={col} />
    <text x={x} y={y + (sub ? -6 : 22)} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={64} fill={PAL.white}>{label}</text>
    {sub && <text x={x} y={y + 56} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={38} fill={PAL.white} opacity={.85}>{sub}</text>}</g>
);
const RealEstate: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const d = s.dur, a = fin(u, .1), b = fin(u, d * .2), c = fin(u, d * .45), e = fin(u, d * .62), g = fin(u, d * .82);
  return (<Paper><svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <text x={960} y={170} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={72} fill={PAL.ink} opacity={a}>不動産モデル</text>
    <Box x={420} y={560} w={420} h={220} label="本部" col={PAL.navy} o={a} />
    <Box x={960} y={330} w={420} h={200} label="土地と建物" col={PAL.teal} o={b} sub="本部が確保" />
    <Box x={1500} y={560} w={420} h={220} label="加盟店" col={PAL.red} o={c} />
    <Arrow x1={560} y1={470} x2={790} y2={380} col={PAL.teal} o={b} />
    <Arrow x1={1130} y1={380} x2={1360} y2={470} col={PAL.teal} o={c} label="貸す" lx={1300} ly={370} />
    <Arrow x1={1300} y1={680} x2={640} y2={680} col={PAL.mustard} o={e} label="家賃" lx={970} ly={760} />
    {[0, 1, 2].map((i) => { const p = ((u * .6 + i / 3) % 1); return <circle key={i} cx={1300 - 660 * p} cy={680} r={20} fill={PAL.mustard} opacity={e * (1 - Math.abs(p - .5))} />; })}
    <text x={960} y={920} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={64} fill={PAL.red} opacity={g}>店が繁盛し続ける限り、家賃が入り続ける</text>
  </svg></Paper>);
};
const Royalty: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const d = s.dur, n = Math.round(interpolate(u, [d * .45, d * .9], [3, 24], cl)), crossed = !!s.crossed;
  return (<Paper><svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <text x={960} y={170} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={68} fill={PAL.ink} opacity={fin(u, 0)}>{crossed ? "「握手の約束」" : "兄弟との契約"}</text>
    <g opacity={fin(u, .2)}>{Array.from({ length: crossed ? 24 : n }, (_, i) => <rect key={i} x={250 + (i % 8) * 70} y={360 + Math.floor(i / 8) * 90} width={52} height={62} rx={8} fill={PAL.red} />)}
      <text x={495} y={700} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={52} fill={PAL.ink}>店の売上</text></g>
    <Arrow x1={860} y1={500} x2={1180} y2={500} col={PAL.mustard} o={fin(u, .6)} label="0.5%" lx={1020} ly={460} />
    <Box x={1450} y={500} w={420} h={220} label="兄弟" col={PAL.teal} o={fin(u, .9)} sub="売上の0.5%" />
    {!crossed && <text x={960} y={900} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={60} fill={PAL.red} opacity={fin(u, d * .5)}>店が増えるほど、支払いも増える</text>}
    {crossed && <g opacity={fin(u, d * .45)} transform="rotate(-8 1450 760)"><rect x={1220} y={690} width={460} height={140} rx={14} fill="none" stroke={PAL.red} strokeWidth={10} /><text x={1450} y={785} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={70} fill={PAL.red}>記録なし</text></g>}
  </svg></Paper>);
};
const Stores: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const k = interpolate(u, [.3, Math.max(.8, s.dur - .5)], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const v = Math.round(s.a + (s.b - s.a) * k), yr = Math.round(s.ya + (s.yb - s.ya) * k);
  return (<Paper><AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
    <div style={{ fontFamily: F, fontWeight: 700, fontSize: 64, color: PAL.ink, opacity: .75 }}>{yr}年</div>
    <div style={{ fontFamily: F, fontWeight: 900, fontSize: 260, color: PAL.red, lineHeight: 1.05 }}>{v}<span style={{ fontSize: 110 }}>号店</span></div>
    <div style={{ width: 1100, height: 22, background: PAL.paper2, borderRadius: 11, marginTop: 30 }}><div style={{ width: `${k * 100}%`, height: 22, background: PAL.mustard, borderRadius: 11 }} /></div>
  </AbsoluteFill></Paper>);
};
const SalesDrop: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const k = interpolate(u, [.3, s.dur - .2], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const pts = Array.from({ length: 41 }, (_, i) => { const x = i / 40; return [300 + 1320 * x, 380 + 80 * Math.sin(x * 9) * .25 + 420 * Math.pow(x, 1.6)]; });
  const vis = pts.slice(0, Math.max(2, Math.round(41 * k)));
  return (<Paper><svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <text x={960} y={170} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={68} fill={PAL.ink}>既存の店の売上</text>
    <line x1={300} y1={880} x2={1640} y2={880} stroke={PAL.ink} strokeWidth={4} opacity={.5} /><line x1={300} y1={300} x2={300} y2={880} stroke={PAL.ink} strokeWidth={4} opacity={.5} />
    <polyline points={vis.map((p) => p.join(",")).join(" ")} fill="none" stroke={PAL.red} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
    <text x={300} y={940} fontFamily={F} fontWeight={700} fontSize={40} fill={PAL.ink} opacity={.7}>1990年代後半</text>
    <text x={1640} y={940} textAnchor="end" fontFamily={F} fontWeight={700} fontSize={40} fill={PAL.ink} opacity={.7}>伸び悩み</text>
  </svg></Paper>);
};
const Loss: React.FC<{ u: number }> = ({ u }) => (
  <Paper bg="#141118"><AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
    <div style={{ fontFamily: F, fontWeight: 700, fontSize: 60, color: PAL.paper, opacity: .8 * fin(u, 0), letterSpacing: 8 }}>2002年 第4四半期</div>
    <div style={{ fontFamily: F, fontWeight: 900, fontSize: 150, color: "#E0564A", marginTop: 30, opacity: fin(u, .5), transform: `scale(${1.15 - .15 * fin(u, .5, .3)})` }}>上場以来初の赤字</div>
  </AbsoluteFill></Paper>
);
const Quote: React.FC<{ s: Shot; u: number }> = ({ s, u }) => (
  <Paper bg={PAL.navy2}><AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
    {s.lines.map((l: string, i: number) => <div key={i} style={{ fontFamily: F, fontWeight: 900, fontSize: 70, color: PAL.paper, opacity: fin(u, .1 + i * 2.6), margin: "10px 0", whiteSpace: "nowrap" }}>{l}</div>)}
    <div style={{ fontFamily: F, fontWeight: 700, fontSize: 46, color: PAL.mustard, marginTop: 40, opacity: fin(u, .6) }}>— {s.who}</div>
  </AbsoluteFill></Paper>
);
const Arches: React.FC<{ u: number }> = ({ u }) => {
  const d = "M140 760 C140 300 230 90 330 90 C430 90 495 260 500 470 C505 260 570 90 670 90 C770 90 860 300 860 760";
  const draw = eoN(clamp01(u / 1.0)), fill = eoN(clamp01((u - .9) / .7)), glow = clamp01((u - 1.6) / .4) * (.6 + .4 * Math.sin((u - 1.6) * 4));
  return (<svg viewBox="0 0 1000 850" width={1100} height={935} style={{ position: "absolute", left: 410, top: 40, opacity: .92 }}>
    <defs><filter id="ag" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="22" /></filter></defs>
    <path d={d} fill="none" stroke="#FFC72C" strokeWidth={150} opacity={.55 * glow} filter="url(#ag)" />
    <path d={d} fill="none" stroke="#F2B21B" strokeWidth={128} strokeLinecap="butt" strokeDasharray={2400} strokeDashoffset={2400 * (1 - fill)} opacity={fill > 0 ? 1 : 0} />
    <path d={d} fill="none" stroke="#FFD34E" strokeWidth={8} strokeDasharray={2400} strokeDashoffset={2400 * (1 - draw)} />
  </svg>);
};
const Title: React.FC<{ s: Shot; u: number }> = ({ s, u }) => (
  <Paper bg={PAL.navy2}>
    {!s.final && <Arches u={u} />}
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", paddingBottom: 160 }}>
      <div style={{ fontFamily: F, fontWeight: 900, fontSize: 130, color: PAL.paper, opacity: fin(u, .1, .6), letterSpacing: 8, textShadow: "0 6px 30px rgba(10,14,24,.85), 0 0 4px rgba(10,14,24,.9)" }}>マクドナルドの全歴史</div>
      <div style={{ fontFamily: F, fontWeight: 700, fontSize: 64, color: PAL.mustard, opacity: fin(u, .6, .6), letterSpacing: 12, marginTop: 20 }}>1940–2026</div>
    </AbsoluteFill>
    {!s.final && <YearBar t={u} a={.9} b={Math.max(1.5, s.dur - .2)} from={2026} to={1940} span={[1940, 2026]} />}
  </Paper>
);
function Shot({ s, u }: { s: Shot; u: number }) {
  switch (s.kind) {
    case "img": return <ImgShot s={s} u={u} />;
    case "name": return <CenterText u={u} text={s.text} />;
    case "punch": return <CenterText u={u} text={s.text} bg="#0b0b0e" fg="#f4f1ea" size={86} />;
    case "textcard": return <CenterText u={u} text={s.text} sub={s.sub} size={s.text.length > 12 ? 110 : 150} />;
    case "chapter": return <Chapter u={u} n={s.n} />;
    case "mapcount": return <MapCount s={s} u={u} />;
    case "bignum": return <BigNum s={s} u={u} />;
    case "menu": return <Menu s={s} u={u} />;
    case "price": return <Price s={s} u={u} />;
    case "kitchen": return <Kitchen s={s} u={u} />;
    case "realestate": return <RealEstate s={s} u={u} />;
    case "royalty": return <Royalty s={s} u={u} />;
    case "stores": return <Stores s={s} u={u} />;
    case "salesdrop": return <SalesDrop s={s} u={u} />;
    case "loss": return <Loss u={u} />;
    case "quote": return <Quote s={s} u={u} />;
    case "globe": return <Globe s={s} u={u} />;
    case "duo": return <Duo s={s} u={u} />;
    case "title": return <Title s={s} u={u} />;
    default: return null;
  }
}
// closing map: stores spread out from Des Plaines across the real coastline, slow push-in
const Globe: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const z = 1 + .07 * interpolate(u, [0, s.dur], [0, 1], cl);
  return (<AbsoluteFill style={{ overflow: "hidden" }}>
    <AbsoluteFill style={{ transform: `scale(${z})` }}><WorldMapDots t={u} a={0.1} b={Math.min(6, s.dur * .7)} /></AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(10,14,22,.55) 100%)" }} />
  </AbsoluteFill>);
};
// key-word times (for the narration-synced push) and fact chips from the subtitles
const KWT = /([0-9][0-9,.]*(?:万|億|兆)?(?:ドル|セント|円|店|品目|秒|時間|歳|%|人|カ国|号店|倍)|マクドナルド|レイ・クロック|クロック|ディック|藤田田|サンバーナーディーノ|デスプレーンズ|ソネボーン|銀座|モスクワ)/;
const KW_TIMES: number[] = plan.subs.filter(([, , x]) => KWT.test(x)).map(([a]) => a);
const FACT_RE = /(約)?([0-9][0-9,]*(?:\.[0-9]+)?)(万|億|兆)?(ドル|セント|円|店|品目|秒|時間|歳|%|人|カ国|倍)/;
type Fact = { a: number; b: number; value: number; dec: number; prefix: string; suffix: string };
const FACTS: Fact[] = [];
plan.subs.forEach(([a, b, x]) => {
  const m = x.match(FACT_RE); if (!m || parseFloat(m[2].replace(/,/g, "")) < 2 && !m[2].includes(".")) return;
  const sh = [...plan.shots].reverse().find((q) => q.t <= a + .05);
  if (!sh || sh.kind !== "img" || sh.counter) return;                       // only over pictures, never next to another counter
  const prev = FACTS[FACTS.length - 1]; if (prev && a < prev.b + .3) return;
  let end = sh.t + sh.dur; for (const q of plan.shots) if (q.t >= end - .01 && q.t < end + .01 && q.src === sh.src) end = q.t + q.dur;   // a detail cut of the same picture continues the hold
  FACTS.push({ a, b: Math.min(b + 1.4, a + 3.6, end - .1), value: parseFloat(m[2].replace(/,/g, "")), dec: m[2].includes(".") ? 1 : 0, prefix: m[1] || "", suffix: (m[3] || "") + m[4] });
});
const FactChip: React.FC<{ t: number }> = ({ t }) => {
  const f = FACTS.find((q) => t >= q.a && t < q.b); if (!f) return null;
  const u = t - f.a, o = clamp01(u / .2) * clamp01((f.b - t) / .25);
  return (<div style={{ position: "absolute", left: 0, right: 0, bottom: 190, display: "flex", justifyContent: "center", opacity: o, transform: `translateY(${(1 - eoN(clamp01(u / .3))) * 30}px) scale(${.9 + .1 * eoN(clamp01(u / .3))})` }}><div style={{ padding: "12px 44px 16px", background: "rgba(20,22,30,.9)", border: "4px solid " + PAL.mustard, borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,.55)" }}>
    <Count u={u} at={.05} value={f.value} dec={f.dec} prefix={f.prefix} suffix={f.suffix} size={124} color={PAL.mustard} dur={.9} />
  </div></div>);
};
// year tracker: a small timeline in the corner that moves to each year the narration says (pictures only)
const YEARS: [number, number][] = [];
// stops at the closing summary ("この帝国は…"), where the years are looked back on, not travelled through
const EPILOGUE = (plan.subs.find(([, , x]) => x.startsWith("この帝国は")) || [1e9])[0] as number;
plan.subs.forEach(([a, , txt]) => {
  if (a >= EPILOGUE) return;
  if (txt.startsWith("そして現在")) { YEARS.push([a, 2026]); return; }
  const m = txt.match(/(19[4-9]\d|20[0-2]\d)年/); if (m) YEARS.push([a, +m[1]]);
});
const YearTrack: React.FC<{ t: number; on: boolean }> = ({ t, on }) => {
  const first = plan.chapters[0].at + 3;
  if (t < first || t >= EPILOGUE - .3) return null;
  let i = -1; YEARS.forEach(([a], k) => { if (t >= a - .1) i = k; });
  if (i < 0) return null;
  const [a, y] = YEARS[i], py = i > 0 ? YEARS[i - 1][1] : y, k = interpolate(t, [a - .1, a + .7], [0, 1], { ...cl, easing: ease });
  const yr = py + (y - py) * k, X = (v: number) => 24 + 392 * (v - 1940) / 86;
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
const Duo: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const k = eoN(clamp01(u / .6)), z = 1.04 + .05 * clamp01(u / s.dur);
  const half = (src: string, left: boolean) => (<div style={{ position: "absolute", top: 0, bottom: 0, width: 960, left: left ? 0 : 960, overflow: "hidden", transform: `translateX(${(1 - k) * (left ? -120 : 120)}px)`, opacity: k }}>
    <Img src={staticFile(`mcd/${src}`)} style={{ position: "absolute", left: -480, width: 1920, height: 1080, objectFit: "cover", transform: `scale(${z})` }} /></div>);
  return (<AbsoluteFill style={{ background: "#111" }}>{half(s.a, true)}{half(s.b, false)}
    <div style={{ position: "absolute", left: 956, top: 0, bottom: 0, width: 8, background: PAL.mustard, transform: `scaleY(${k})` }} /></AbsoluteFill>);
};
// map insets: a small Mercator map panel that slides in over the picture (flight, Canada, Ginza, Moscow, Russia exit)
import INSETS from "./mcd_insets.json";
type Inset = { id: string; land: string; hi: string; pins: [number, number, string][]; dots: [number, number][] };
const INS = INSETS as unknown as Inset[];
const subAt = (k: string) => (plan.subs.find(([, , x]) => x.includes(k)) || [0])[0] as number;
const INSET_PLAN: { id: string; a: number; d: number; title: string }[] = [
  { id: "flight", a: subAt("カリフォルニアへ飛んだ") - 1.2, d: 6.2, title: "1954  シカゴ → カリフォルニア" },
  { id: "canada", a: subAt("カナダへ進出"), d: 5.5, title: "1967  初の海外・カナダ" },
  { id: "ginza", a: subAt("流行は銀座から") - .3, d: 5.5, title: "1971  銀座" },
  { id: "moscow", a: subAt("プーシキン広場"), d: 6.0, title: "1990  モスクワ" },
  { id: "russia", a: subAt("ロシア事業の売却"), d: 6.5, title: "2022  ロシア撤退" },
];
const MapInset: React.FC<{ t: number }> = ({ t }) => {
  const P = INSET_PLAN.find((q) => t >= q.a && t < q.a + q.d); if (!P) return null;
  const m = INS.find((q) => q.id === P.id)!; const u = t - P.a, o = clamp01(u / .35) * clamp01((P.d - u) / .35), sl = (1 - eoN(clamp01(u / .45))) * -80;
  const hi = eoN(clamp01((u - .4) / .6));
  let extra: React.ReactNode = null;
  if (P.id === "flight") { const [a, b] = m.pins, d = eoN(clamp01((u - .8) / 2.2)), x = a[0] + (b[0] - a[0]) * d, y = a[1] + (b[1] - a[1]) * d - Math.sin(Math.PI * d) * 60;
    const path = `M${a[0]} ${a[1]} Q${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2 - 120} ${b[0]} ${b[1]}`;
    extra = <><path d={path} fill="none" stroke={PAL.red} strokeWidth={5} strokeDasharray="8 8" pathLength={1} style={{ strokeDasharray: `${d} 1` } as any} />
      <circle cx={x} cy={y} r={10} fill={PAL.red} stroke="#fff" strokeWidth={3} /></>; }
  if (P.id === "russia") extra = <>{m.dots.map(([x, y], i) => { const gone = clamp01((u - 1.4 - (i / m.dots.length) * 3.2) / .4); return <circle key={i} cx={x} cy={y} r={5 * (1 - gone)} fill="#fff" stroke={PAL.red} strokeWidth={1.5} opacity={clamp01((u - .5) / .5) * (1 - gone)} />; })}</>;
  return (<div style={{ position: "absolute", left: 70, top: 250, width: 640, height: 470, opacity: o, transform: `translateX(${sl}px)` }}>
    <div style={{ position: "absolute", inset: 0, background: "rgba(20,22,30,.92)", border: "3px solid " + PAL.mustard, borderRadius: 14, boxShadow: "0 14px 40px rgba(0,0,0,.6)" }} />
    <div style={{ position: "absolute", left: 22, top: 14, fontFamily: F, fontWeight: 900, fontSize: 34, color: PAL.mustard, letterSpacing: 2 }}>{P.title}</div>
    <svg viewBox="0 0 640 400" width={640} height={400} style={{ position: "absolute", left: 0, top: 64 }}>
      <defs><clipPath id={"ic" + P.id}><rect x={6} y={0} width={628} height={394} rx={10} /></clipPath></defs>
      <g clipPath={`url(#ic${P.id})`}><rect width={640} height={400} fill="#2C3A52" />
        <path d={m.land} fill="#5A6478" stroke="#7D879A" strokeWidth={.8} />
        <path d={m.hi} fill={PAL.mustard} opacity={.25 + .55 * hi} stroke={PAL.paper} strokeWidth={1.4} />
        {extra}
        {m.pins.map(([x, y, label], i) => { const pk = clamp01((u - .9 - i * .3) / .35), rip = ((u - .9 - i * .3) % 1.4) / 1.4;
          return (<g key={i} opacity={pk}><circle cx={x} cy={y} r={10 + 40 * rip} fill="none" stroke={PAL.red} strokeWidth={3} opacity={1 - rip} />
            <circle cx={x} cy={y} r={11 * (.6 + .4 * pk)} fill={PAL.red} stroke="#fff" strokeWidth={3} />
            <text x={x + (x > 420 ? -18 : 18)} y={y - 16} textAnchor={x > 420 ? "end" : "start"} fontFamily={F} fontWeight={900} fontSize={30} fill="#fff" stroke="#111" strokeWidth={6} paintOrder="stroke">{label}</text></g>); })}
      </g></svg>
  </div>);
};
const Grain: React.FC<{ seed: number }> = ({ seed }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", mixBlendMode: "multiply", opacity: .12, pointerEvents: "none" }}>
    <filter id="g2"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves={2} seed={seed} /><feColorMatrix type="matrix" values="0 0 0 0 .55  0 0 0 0 .5  0 0 0 0 .42  0 0 0 1 0" /></filter>
    <rect width={1920} height={1080} filter="url(#g2)" />
  </svg>
);
export const McdEpisode: React.FC = () => {
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
      <Audio src={staticFile("mcd/narration.wav")} />
      {prev && (fade < 1 || wiping) && <AbsoluteFill><Shot s={prev} u={t - prev.t} /></AbsoluteFill>}
      <AbsoluteFill style={{ opacity: fade, clipPath: wiping ? `inset(0 ${(1 - wk) * 100}% 0 0)` : undefined }}><Shot s={cur} u={u} /></AbsoluteFill>
      {wiping && <div style={{ position: "absolute", top: 0, bottom: 0, left: `${wk * 100}%`, width: 10, marginLeft: -5, background: PAL.mustard, boxShadow: "0 0 30px rgba(214,168,74,.8)" }} />}
      <Grain seed={f % 30} />
      <YearTrack t={t} on={cur.kind === "img"} />
      <FactChip t={t} />
      <MapInset t={t} />
      <Subs t={t} />
      <AbsoluteFill style={{ background: "#000", opacity: endFade }} />
    </AbsoluteFill>
  );
};
// keywords (numbers with their units, and names) in mustard
const KW = /([約]?[0-9][0-9,.]*(?:万|億|兆)?(?:年|月|日|店|ドル|セント|円|カ国|品目|秒|時間|歳|%|人|号店|倍)?|マクドナルド|レイ・クロック|クロック|ディック|(?<!ビッグ)マック|藤田田|サンバーナーディーノ|デスプレーンズ|ハリー・ソネボーン|ソネボーン|銀座|モスクワ)/g;
const mark = (txt: string, k0: number) => txt.split(KW).map((p, i) => (i % 2 ? <span key={k0 + i} style={{ color: PAL.mustard }}>{p}</span> : p));
// long lines go on two rows, broken at a phrase edge near the middle (after 、」を は が で に, or before 「) so no word is split
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
// subtitles with start and end times (nothing on screen in the pauses between chapters)
const Subs: React.FC<{ t: number }> = ({ t }) => {
  const cur = plan.subs.find(([a, b]) => t >= a && t < b);
  if (!cur) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 56, textAlign: "center", opacity: fin(t, cur[0], .1) }}>
      <span style={{ display: "inline-block", maxWidth: 1640, textWrap: "balance" as any, padding: "10px 34px", background: "rgba(20,22,30,.72)", borderRadius: 8, fontFamily: F, fontWeight: 700, fontSize: 50, color: "#fff" }}>{hl(cur[2])}</span>
    </div>
  );
};
export const MCD_EP_FRAMES = Math.round(plan.duration * FPS);
