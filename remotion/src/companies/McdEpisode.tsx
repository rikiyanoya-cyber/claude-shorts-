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
const num = (v: number, dec = 0) => (dec ? v.toFixed(dec) : Math.round(v).toLocaleString("en-US"));

// ---------- pieces ----------
const Paper: React.FC<{ children?: React.ReactNode; bg?: string }> = ({ children, bg = PAL.paper }) => <AbsoluteFill style={{ background: bg }}>{children}</AbsoluteFill>;
const Count: React.FC<{ u: number; at: number; value: number; prefix?: string; suffix?: string; dec?: number; size?: number; color?: string; dur?: number }> = ({ u, at, value, prefix = "", suffix = "", dec = 0, size = 200, color = PAL.ink, dur = 1.5 }) => {
  const k = interpolate(u, [at, at + dur], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  return <span style={{ fontFamily: F, fontWeight: 900, fontSize: size, color, lineHeight: 1 }}><span style={{ fontSize: size * .5 }}>{prefix}</span>{num(value * k, dec)}<span style={{ fontSize: size * .45 }}>{suffix}</span></span>;
};
const Chip: React.FC<{ u: number; value: number; prefix: string; suffix: string }> = ({ u, value, prefix, suffix }) => (
  <div style={{ position: "absolute", right: 80, top: 80, padding: "18px 36px", background: "rgba(43,42,51,.86)", borderRadius: 12, opacity: fin(u, .4) }}>
    <Count u={u} at={.4} value={value} prefix={prefix} suffix={suffix} size={120} color={PAL.mustard} />
  </div>
);
const ImgShot: React.FC<{ s: Shot; u: number }> = ({ s, u }) => {
  const k = s.kb, p = interpolate(u, [0, s.dur + XF], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const z = k.z0 + (k.z1 - k.z0) * p;
  // keep the pan inside the picture: at zoom z the image can move at most (z-1)/(2z) of its size before an edge shows
  const lim = Math.max(0, ((z - 1) / (2 * z)) * 100 - 0.15), clampP = (v: number) => Math.max(-lim, Math.min(lim, v));
  const x = clampP(k.x0 + (k.x1 - k.x0) * p), y = clampP(k.y0 + (k.y1 - k.y0) * p);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#111" }}>
      <Img src={staticFile(`mcd/${s.src}`)} style={{ width: 1920, height: 1080, objectFit: "cover", transformOrigin: "50% 50%", transform: `scale(${z}) translate(${x}%, ${y}%)`, filter: GRADE[s.src] }} />
      {s.src === "ep01-5-14.jpg" && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(150,180,235,.42) 0%, rgba(235,190,200,.22) 30%, rgba(0,0,0,0) 50%)", mixBlendMode: "screen" }} />}
      {s.counter && <Chip u={u} value={s.counter[0]} prefix={s.counter[1]} suffix={s.counter[2]} />}
    </AbsoluteFill>
  );
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
const Title: React.FC<{ s: Shot; u: number }> = ({ s, u }) => (
  <Paper bg={PAL.navy2}>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", paddingBottom: 160 }}>
      <div style={{ fontFamily: F, fontWeight: 900, fontSize: 130, color: PAL.paper, opacity: fin(u, .1, .6), letterSpacing: 8 }}>マクドナルドの全歴史</div>
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
  const fade = prev && u < xf ? interpolate(u, [0, xf], [0, 1], { ...cl, easing: ease }) : 1;
  const endFade = interpolate(t, [plan.duration - 1.2, plan.duration], [0, 1], cl);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("mcd/narration.wav")} />
      {prev && fade < 1 && <AbsoluteFill><Shot s={prev} u={t - prev.t} /></AbsoluteFill>}
      <AbsoluteFill style={{ opacity: fade }}><Shot s={cur} u={u} /></AbsoluteFill>
      <Grain seed={f % 30} />
      <YearTrack t={t} on={cur.kind === "img"} />
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
