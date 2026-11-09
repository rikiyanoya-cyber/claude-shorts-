// Company history channel — Ep1 McDonald's, opening 60 s (prototype, picture only).
// Reusable code-video parts: KenBurns, Counter, WorldMapDots, TextCard, TitleCard, YearBar, Subtitle, Grain.
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, staticFile, delayRender, continueRender } from "remotion";
import { MCD_EP1 as D } from "./mcd_ep1";
import { PAL, Street, Brothers, Kroc, Kitchen, Sign } from "./illustrations";
import MAP from "./worldmap.json";

const FPS = 30;
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const fadeIn = (t: number, a: number, d = 0.35) => interpolate(t, [a, a + d], [0, 1], { ...clamp, easing: ease });
const LAND = (MAP as { land: string[] }).land.join("");

const useFonts = () => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => {
    const a = new FontFace("NSJP", `url(${staticFile("fonts/NotoSansJP-Black.ttf")})`, { weight: "900" });
    const b = new FontFace("NSJP", `url(${staticFile("fonts/NotoSansJP-Bold.ttf")})`, { weight: "700" });
    Promise.all([a.load(), b.load()]).then((fs) => { fs.forEach((x) => document.fonts.add(x)); continueRender(h); }).catch(() => continueRender(h));
  }, [h]);
};

// slow zoom/pan on a still (Ken Burns); from/to = [scale, x%, y%]
export const KenBurns: React.FC<{ t: number; a: number; b: number; from: [number, number, number]; to: [number, number, number]; children: React.ReactNode }> = ({ t, a, b, from, to, children }) => {
  const u = interpolate(t, [a, b], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const s = from[0] + (to[0] - from[0]) * u, x = from[1] + (to[1] - from[1]) * u, y = from[2] + (to[2] - from[2]) * u;
  return <AbsoluteFill style={{ transform: `scale(${s}) translate(${x}%, ${y}%)`, transformOrigin: "50% 50%" }}>{children}</AbsoluteFill>;
};
// number that counts up with an ease-out and a small settle
export const Counter: React.FC<{ t: number; at: number; value: number; prefix?: string; suffix?: string; label: string; x: number; y: number; size?: number; color?: string }> = ({ t, at, value, prefix = "", suffix = "", label, x, y, size = 120, color = PAL.paper }) => {
  const u = interpolate(t, [at, at + 1.4], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const v = Math.round(value * u), o = fadeIn(t, at - 0.1, 0.25);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: `translateY(${(1 - o) * 20}px)`, fontFamily: "NSJP", color }}>
      <div style={{ fontSize: size, fontWeight: 900, lineHeight: 1, letterSpacing: 2 }}><span style={{ fontSize: size * .55 }}>{prefix}</span>{v.toLocaleString("en-US")}<span style={{ fontSize: size * .55 }}>{suffix}</span></div>
      <div style={{ fontSize: size * .32, fontWeight: 700, opacity: .85, marginTop: 8 }}>{label}</div>
    </div>
  );
};
// world map; dots spread out from the first restaurant over [a, b]
export const WorldMapDots: React.FC<{ t: number; a: number; b: number; ink?: string; land?: string }> = ({ t, a, b, ink = PAL.mustard, land = "#3A4558" }) => {
  const m = MAP as unknown as { dots: [number, number, number][]; origin: [number, number] };
  const [ox, oy] = m.origin, maxd = 1500;
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
      <rect width={1920} height={1080} fill={PAL.navy2} />
      <path d={LAND} fill={land} stroke="#56627a" strokeWidth={1.2} />
      {m.dots.map(([x, y, r], i) => {
        const d = Math.hypot(x - ox, y - oy) / maxd, at = a + (b - a) * (0.85 * d + 0.15 * r);
        const k = interpolate(t, [at, at + 0.35], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
        return k > 0 ? <circle key={i} cx={x} cy={y} r={5 * k} fill={ink} opacity={0.9} /> : null;
      })}
      <circle cx={ox} cy={oy} r={10} fill={PAL.red} stroke={PAL.paper} strokeWidth={3} opacity={fadeIn(t, a - .2)} />
    </svg>
  );
};
export const TextCard: React.FC<{ t: number; a: number; text: string; bg?: string; fg?: string; size?: number }> = ({ t, a, text, bg = PAL.paper, fg = PAL.ink, size = 150 }) => {
  const o = fadeIn(t, a, 0.3);
  return (
    <AbsoluteFill style={{ background: bg, alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "NSJP", fontWeight: 900, fontSize: size, color: fg, opacity: o, transform: `scale(${0.96 + 0.04 * o})`, letterSpacing: 6 }}>{text}</div>
    </AbsoluteFill>
  );
};
// a horizontal timeline that runs from `from` to `to` (rewind when from > to)
export const YearBar: React.FC<{ t: number; a: number; b: number; from: number; to: number; span: [number, number] }> = ({ t, a, b, from, to, span }) => {
  const u = interpolate(t, [a, b], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const yr = Math.round(from + (to - from) * u), X = (y: number) => 200 + (1520 * (y - span[0])) / (span[1] - span[0]);
  const o = fadeIn(t, a - 0.6, 0.4);
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", opacity: o }}>
      <line x1={200} y1={900} x2={1720} y2={900} stroke={PAL.paper} strokeWidth={4} opacity={.5} />
      {Array.from({ length: Math.floor((span[1] - span[0]) / 10) + 1 }, (_, i) => span[0] + i * 10).map((y) => (
        <g key={y}><line x1={X(y)} y1={886} x2={X(y)} y2={914} stroke={PAL.paper} strokeWidth={3} opacity={.6} />
          <text x={X(y)} y={956} textAnchor="middle" fontFamily="NSJP" fontWeight={700} fontSize={28} fill={PAL.paper} opacity={.6}>{y}</text></g>
      ))}
      <line x1={X(Math.min(yr, from))} y1={900} x2={X(Math.max(yr, from))} y2={900} stroke={PAL.mustard} strokeWidth={8} />
      <circle cx={X(yr)} cy={900} r={16} fill={PAL.mustard} stroke={PAL.paper} strokeWidth={4} />
      <text x={X(yr)} y={860} textAnchor="middle" fontFamily="NSJP" fontWeight={900} fontSize={44} fill={PAL.mustard}>{yr}</text>
    </svg>
  );
};
export const TitleCard: React.FC<{ t: number; a: number; main: string; years: readonly [number, number] }> = ({ t, a, main, years }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", paddingBottom: 160 }}>
    <div style={{ fontFamily: "NSJP", fontWeight: 900, fontSize: 130, color: PAL.paper, opacity: fadeIn(t, a + .2, .6), letterSpacing: 8 }}>{main}</div>
    <div style={{ fontFamily: "NSJP", fontWeight: 700, fontSize: 64, color: PAL.mustard, opacity: fadeIn(t, a + .8, .6), letterSpacing: 12, marginTop: 20 }}>{years[0]}–{years[1]}</div>
  </AbsoluteFill>
);
export const Subtitle: React.FC<{ t: number; subs: readonly (readonly [number, string])[] }> = ({ t, subs }) => {
  let cur: readonly [number, string] | null = null; for (const s of subs) if (t >= s[0]) cur = s;
  if (!cur || !cur[1]) return null;
  const o = fadeIn(t, cur[0], 0.12);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 60, textAlign: "center", opacity: o }}><span style={{ display: "inline-block", padding: "10px 34px", background: "rgba(20,22,30,.72)", borderRadius: 8, fontFamily: "NSJP", fontWeight: 700, fontSize: 52, color: "#fff" }}>{cur[1]}</span></div>
  );
};
const Grain: React.FC<{ seed: number }> = ({ seed }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", mixBlendMode: "multiply", opacity: .18, pointerEvents: "none" }}>
    <filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves={2} seed={seed} /><feColorMatrix type="matrix" values="0 0 0 0 .55  0 0 0 0 .5  0 0 0 0 .42  0 0 0 1 0" /></filter>
    <rect width={1920} height={1080} filter="url(#g)" />
  </svg>
);
// cross-fade helper: a layer that is visible over [a,b] with soft edges
const Layer: React.FC<{ t: number; a: number; b: number; x?: number; children: React.ReactNode }> = ({ t, a, b, x = 0.35, children }) => {
  if (t < a - x || t > b + x) return null;
  const o = Math.min(interpolate(t, [a - x, a], [0, 1], clamp), interpolate(t, [b, b + x], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

export const McdOpening: React.FC = () => {
  useFonts();
  const f = useCurrentFrame(), t = f / FPS, C = D.cuts;
  const lettersShown = Math.round(interpolate(t, [D.deal.eraseAt, D.deal.eraseAt + 1.6], [D.deal.nameLetters.length, 0], clamp));
  return (
    <AbsoluteFill style={{ background: PAL.navy2 }}>
      <Layer t={t} a={C.street[0]} b={C.street[1]} x={0.0001}><KenBurns t={t} a={0} b={6.4} from={[1.12, 2, 1]} to={[1.02, -1, 0]}><Street /></KenBurns></Layer>
      <Layer t={t} a={C.name[0]} b={C.name[1]}><TextCard t={t} a={C.name[0]} text={D.company} /></Layer>
      <Layer t={t} a={C.map[0]} b={C.map[1]}>
        <KenBurns t={t} a={C.map[0]} b={C.map[1]} from={[1.25, 6, 2]} to={[1.0, 0, 0]}><WorldMapDots t={t} a={C.map[0] + .3} b={C.map[0] + 9} /></KenBurns>
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(29,38,54,0) 45%, rgba(29,38,54,.85) 72%)" }} />
        {D.counters.map((c, i) => <Counter key={i} t={t} at={c.at} value={c.value} prefix={c.prefix} suffix={c.suffix} label={c.label} x={1340} y={170 + i * 250} size={110} />)}
      </Layer>
      <Layer t={t} a={C.brothers[0]} b={C.brothers[1]}>
        <KenBurns t={t} a={C.brothers[0]} b={C.brothers[1] + .4} from={[1.0, 0, 0]} to={[1.08, 0, 2]}><Brothers /></KenBurns>
        <Label t={t} a={C.brothers[0] + .6} text={D.brothersLabel} />
      </Layer>
      <Layer t={t} a={C.kroc[0]} b={C.kroc[1]}>
        <KenBurns t={t} a={C.kroc[0]} b={C.kroc[1] + .4} from={[1.1, 2, 1]} to={[1.0, 0, 0]}><Kroc /></KenBurns>
        <Label t={t} a={C.kroc[0] + 1.2} text={D.krocLabel} />
      </Layer>
      <Layer t={t} a={C.deal[0]} b={C.deal[1]}>
        <AbsoluteFill style={{ background: PAL.paper }} />
        <KenBurns t={t} a={C.deal[0]} b={C.deal[1] + .4} from={[1.0, 0, 0]} to={[1.05, 0, 0]}>
          <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
            <g transform="translate(180 170) rotate(-4)"><rect width={620} height={760} fill={PAL.white} stroke={PAL.paper2} strokeWidth={6} />
              {Array.from({ length: 12 }, (_, i) => <rect key={i} x={60} y={90 + i * 46} width={i % 4 === 3 ? 320 : 500} height={12} fill={PAL.paper2} />)}
              <path d="M70 660 q40 -50 80 -10 t80 -6 t70 10" stroke={PAL.navy} strokeWidth={6} fill="none" /><path d="M360 660 q30 -40 70 -6 t70 -4 t60 8" stroke={PAL.navy} strokeWidth={6} fill="none" /></g>
          </svg>
          <div style={{ position: "absolute", left: 980, top: 100 }}><Sign letters={D.deal.nameLetters} shown={lettersShown} /></div>
        </KenBurns>
        <Counter t={t} at={D.deal.at} value={D.deal.value} suffix={D.deal.suffix} label="" x={1060} y={720} size={150} color={PAL.red} />
      </Layer>
      <Layer t={t} a={C.punch[0]} b={C.punch[1]} x={0.15}><TextCard t={t} a={C.punch[0]} text={D.punch} bg="#0b0b0e" fg="#f4f1ea" size={84} /></Layer>
      <Layer t={t} a={C.kitchen[0]} b={50.6}><KenBurns t={t} a={C.kitchen[0]} b={50.8} from={[1.0, 4, 0]} to={[1.12, -4, 0]}><Kitchen /></KenBurns></Layer>
      <Layer t={t} a={50.6} b={C.kitchen[1]}><KenBurns t={t} a={50.2} b={53.4} from={[1.15, 0, 0]} to={[1.0, 0, 0]}><WorldMapDots t={t} a={44} b={47} /></KenBurns></Layer>
      <Layer t={t} a={C.title[0]} b={C.title[1] + 1}>
        <AbsoluteFill style={{ background: PAL.navy2 }} />
        <TitleCard t={t} a={C.title[0]} main={D.title.main} years={D.title.years} />
        <YearBar t={t} a={C.title[0] + 1.6} b={C.title[1] - 0.4} from={D.title.years[1]} to={D.title.years[0]} span={[D.title.years[0], D.title.years[1]]} />
      </Layer>
      <Grain seed={f % 30} />
      <Subtitle t={t} subs={D.subs} />
    </AbsoluteFill>
  );
};
const Label: React.FC<{ t: number; a: number; text: string }> = ({ t, a, text }) => {
  const o = fadeIn(t, a, .4);
  return <div style={{ position: "absolute", left: 90, top: 80, padding: "14px 30px", background: "rgba(43,42,51,.85)", color: PAL.paper, fontFamily: "NSJP", fontWeight: 700, fontSize: 46, opacity: o, transform: `translateX(${(1 - o) * -30}px)` }}>{text}</div>;
};
export const MCD_FRAMES = D.duration * FPS;
