// The World You Don't Know, Day 8: "If you were born in Norway" (vertical short, 1080x1920, 105 s).
// Script v5 + notes from marketing (2026-11-25). Rules: the series opening roulette on the satellite globe (pre-rendered
// frames, scripts/wydk/globe_spin.py); the age counter only counts up 0 -> 6 -> 18 -> 19 -> 67 (the grandchild scene
// cuts to a fresh AGE 0 screen, never counts back); generated pictures max 3 s each and under 1/3 of the length in
// total; maps, counters, number cards and the tax-search figure are drawn in code. Captions follow the audio.
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, delayRender, continueRender } from "remotion";
import CAPS from "./no_caps.json";

export const NO_FPS = 30, NO_LEN = 105.0;
const W = 1080, H = 1920;
const F = "WM", NUM = "WN";
const GOLD = "#F4C45E", RED = "#E2483D", CREAM = "#F6EEDC", BLUE = "#6FA8E8";
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.bezier(.25, .1, .25, 1);
const fin = (u: number, a: number, d = .3) => interpolate(u, [a, a + d], [0, 1], { ...cl, easing: ease });
const fout = (u: number, b: number, d = .25) => 1 - fin(u, b - d, d);
const src = (n: string) => staticFile(`no/${n}`);
const useFonts = () => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => {
    Promise.all([new FontFace(F, `url(${staticFile("fonts/Montserrat.ttf")})`, { weight: "100 900" }), new FontFace(NUM, `url(${staticFile("fonts/Anton.ttf")})`)]
      .map((f) => f.load().then((x) => document.fonts.add(x)))).then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
// bouncy pop scale (no overshoot on numbers themselves, only on the card)
const pop = (u: number, a: number) => { const k = u - a; if (k < 0) return 0; if (k < .18) return .55 + .55 * (k / .18); return 1 + .1 * Math.exp(-(k - .18) * 9) * Math.cos((k - .18) * 24); };
const cnt = (u: number, a: number, d: number, to: number) => Math.round(to * interpolate(u, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) }));
const fmt = (n: number) => n.toLocaleString("en-US");
const sh = "0 6px 26px rgba(0,0,0,.75), 0 0 3px rgba(0,0,0,.8)";

// painted backdrop (same as the globe opening) with a slow drift
const Bg: React.FC<{ u: number }> = ({ u }) => <Img src={src("bg.jpg")} style={{ position: "absolute", width: W, height: H, transform: `scale(${1.04 + .012 * Math.sin(u * .4)})` }} />;
// a generated picture, full frame; the camera move alternates per shot (push in, pull out, pan up/down/left/right)
type Mv = "in" | "out" | "up" | "down" | "left" | "right";
const Pic: React.FC<{ n: string; u: number; d: number; o?: [number, number]; mv?: Mv }> = ({ n, u, d, o = [50, 50], mv = "in" }) => {
  const k = interpolate(u / d, [0, 1], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const z = mv === "in" ? 1.04 + .1 * k : mv === "out" ? 1.14 - .1 * k : 1.14;
  const px = mv === "left" ? 40 - 80 * k : mv === "right" ? -40 + 80 * k : 0, py = mv === "up" ? 60 - 120 * k : mv === "down" ? -60 + 120 * k : 0;
  return <Img src={src(`img/${n}.jpg`)} style={{ position: "absolute", width: W, height: H, objectFit: "cover", objectPosition: `${o[0]}% ${o[1]}%`, transform: `translate(${px}px, ${py}px) scale(${z})`, transformOrigin: `${o[0]}% ${o[1]}%` }} />;
};
// dark band at the top so words read over a picture
const Shade: React.FC = () => <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(6,14,20,.82) 0%, rgba(6,14,20,.4) 30%, rgba(6,14,20,0) 46%)" }} />;
const Big: React.FC<{ u: number; a: number; y: number; size: number; color?: string; children: React.ReactNode; font?: string }> = ({ u, a, y, size, color = "#fff", children, font = NUM }) =>
  <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", opacity: u < a ? 0 : 1, transform: `scale(${pop(u, a)})` }}>
    <span style={{ fontFamily: font, fontWeight: 900, fontSize: size, lineHeight: 1.02, color, letterSpacing: 2, textShadow: sh }}>{children}</span></div>;
const Sub: React.FC<{ u: number; a: number; y: number; children: React.ReactNode; size?: number }> = ({ u, a, y, children, size = 54 }) =>
  <div style={{ position: "absolute", left: 60, right: 60, top: y, textAlign: "center", opacity: fin(u, a, .3), transform: `translateY(${(1 - fin(u, a, .35)) * 26}px)`,
    fontFamily: F, fontWeight: 800, fontSize: size, letterSpacing: 4, color: CREAM, textShadow: sh }}>{children}</div>;

// --- scenes ---------------------------------------------------------------------------------------------------------
const Spin: React.FC<{ t: number }> = ({ t }) => { const i = Math.min(209, Math.max(0, Math.floor(t * NO_FPS))); return <Img src={src(`spin/f${String(i).padStart(4, "0")}.jpg`)} style={{ position: "absolute", width: W, height: H }} />; };
const EndMap: React.FC<{ u: number }> = ({ u }) => { const i = Math.min(155, Math.max(0, Math.floor(u * NO_FPS))); return <Img src={src(`end/f${String(i).padStart(4, "0")}.jpg`)} style={{ position: "absolute", width: W, height: H }} />; };

const OneIn: React.FC<{ u: number }> = ({ u }) => <>
  <AbsoluteFill style={{ background: `rgba(6,14,20,${.55 * fin(u, 0, .4)})` }} />
  <Big u={u} a={.15} y={520} size={130} color={CREAM}>1 IN ABOUT</Big>
  <Big u={u} a={.55} y={660} size={300} color={GOLD}>2,500</Big>
  <Sub u={u} a={1.4} y={1010}>BABIES BORN ON EARTH</Sub>
</>;

const Money: React.FC<{ u: number; a: number }> = ({ u, a }) => <>
  <Big u={u} a={.1} y={430} size={110} color={CREAM}>YOU OWN</Big>
  <Big u={u} a={a - .2} y={560} size={230} color={GOLD}>${fmt(cnt(u, a, 2.0, 340000))}</Big>
  <Sub u={u} a={a + 2.1} y={850}>AT ONE MINUTE OLD</Sub>
</>;

const OilDrop: React.FC<{ s?: number }> = ({ s = 1 }) => <svg width={220 * s} height={290 * s} viewBox="0 0 220 290">
  <defs><radialGradient id="od" cx="35%" cy="55%" r="70%"><stop offset="0" stopColor="#3b3b3b" /><stop offset=".7" stopColor="#0d0d0d" /><stop offset="1" stopColor="#000" /></radialGradient></defs>
  <path d="M110 6 C150 80 210 140 210 190 A100 100 0 0 1 10 190 C10 140 70 80 110 6Z" fill="url(#od)" stroke={GOLD} strokeWidth={6} />
  <ellipse cx="72" cy="185" rx="18" ry="34" fill="#fff" opacity=".35" /></svg>;
const FundB: React.FC<{ u: number }> = ({ u }) => <>
  <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", transform: `scale(${pop(u, .05)})`, opacity: u < .05 ? 0 : 1 }}><OilDrop /></div>
  <Big u={u} a={.15} y={680} size={130} color={GOLD}>SAVED, NOT SPENT</Big>
  <Big u={u} a={2.4} y={880} size={130}>BIGGEST ON EARTH</Big>
</>;
const Fund: React.FC<{ u: number; pension?: boolean }> = ({ u, pension }) => <>
  <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", transform: `scale(${pop(u, .1)})`, opacity: u < .1 ? 0 : 1 }}><OilDrop /></div>
  {pension ? <>
    <Big u={u} a={.4} y={680} size={150} color={GOLD}>OIL FUND</Big>
    <Big u={u} a={.9} y={860} size={120} color={CREAM}>↓</Big>
    <Big u={u} a={1.3} y={990} size={150}>YOUR PENSION</Big>
  </> : <>
    <Big u={u} a={.4} y={680} size={150} color={GOLD}>THE OIL FUND</Big>
    <Sub u={u} a={2.4} y={880}>SAVED, NOT SPENT</Sub>
    <Big u={u} a={5.2} y={980} size={110}>BIGGEST ON EARTH</Big>
  </>}
</>;

// 49 weeks as 7x7 blocks; then 15 turn blue (dad's quota)
const Weeks: React.FC<{ u: number; dad: number }> = ({ u, dad }) => {
  const S = 76, G = 12, x0 = (W - (7 * S + 6 * G)) / 2, y0 = 600;
  return <>
    <Big u={u} a={.1} y={330} size={150} color={GOLD}>49 WEEKS</Big>
    <Sub u={u} a={.3} y={510}>FULLY PAID</Sub>
    {Array.from({ length: 49 }, (_, i) => { const r = Math.floor(i / 7), c = i % 7, o = fin(u, .1 + i * .016, .12), isDad = i >= 34 && u > dad + (i - 34) * .04;
      return <div key={i} style={{ position: "absolute", left: x0 + c * (S + G), top: y0 + r * (S + G), width: S, height: S, borderRadius: 16, opacity: o,
        background: isDad ? BLUE : "#F2E6CC", boxShadow: isDad ? `0 0 22px ${BLUE}` : "0 4px 12px rgba(0,0,0,.4)", transform: `scale(${.6 + .4 * o})` }} />; })}
    {u > dad && <Big u={u} a={dad + .2} y={1215} size={100} color={BLUE}>15 FOR DAD</Big>}
  </>;
};

const Free: React.FC<{ u: number }> = ({ u }) => <>
  <Big u={u} a={.1} y={420} size={300} color={GOLD}>$0</Big>
  <Sub u={u} a={.7} y={780} size={60}>SCHOOL</Sub>
  <Big u={u} a={1.1} y={860} size={110} color={CREAM}>↓</Big>
  <Sub u={u} a={1.5} y={1000} size={60}>UNIVERSITY</Sub>
</>;

const Confetti: React.FC<{ u: number }> = ({ u }) => <svg width={W} height={H} style={{ position: "absolute" }}>
  {Array.from({ length: 70 }, (_, i) => { const x = (i * 137) % W, sp = 120 + (i * 53) % 160, y = ((i * 271) % H) + u * sp - 200, c = [RED, GOLD, BLUE, CREAM, "#5fc28a"][i % 5];
    return <rect key={i} x={x} y={y % (H + 200) - 100} width={16} height={28} rx={4} fill={c} opacity={.85} transform={`rotate(${(i * 47 + u * 120) % 360} ${x + 8} ${(y % (H + 200)) - 86})`} />; })}</svg>;
const Party: React.FC<{ u: number }> = ({ u }) => <>
  <Confetti u={u} />
  <Big u={u} a={.1} y={430} size={150} color={RED}>RED OVERALLS</Big>
  <Big u={u} a={.8} y={640} size={230} color={GOLD}>1 MONTH</Big>
  <Sub u={u} a={1.4} y={930}>OF PARTY, WITH YOUR WHOLE CLASS</Sub>
</>;
const Bus: React.FC<{ u: number }> = ({ u }) => <>
  <Sub u={u} a={.1} y={420}>ONE PARTY BUS</Sub>
  <Big u={u} a={.3} y={520} size={170} color={GOLD}>{fmt(cnt(u, .3, 1.5, 1000000))} NOK</Big>
  <Big u={u} a={1.9} y={760} size={110} color={CREAM}>≈ $90,000–100,000</Big>
</>;
const May17: React.FC<{ u: number }> = ({ u }) => <>
  <div style={{ position: "absolute", left: (W - 460) / 2, top: 400, width: 460, height: 520, borderRadius: 34, background: CREAM, overflow: "hidden", boxShadow: "0 18px 50px rgba(0,0,0,.55)", transform: `scale(${pop(u, .1)}) rotate(-3deg)`, opacity: u < .1 ? 0 : 1 }}>
    <div style={{ height: 150, background: RED, color: "#fff", fontFamily: NUM, fontSize: 110, textAlign: "center", lineHeight: "150px", letterSpacing: 6 }}>MAY</div>
    <div style={{ fontFamily: NUM, fontSize: 300, color: "#1b2a33", textAlign: "center", lineHeight: "360px" }}>17</div></div>
  <Sub u={u} a={.9} y={1000}>NATIONAL DAY · THE PARTY ENDS</Sub>
</>;

// 60,000 -> 9,000: 100 figures, 85 fade, 15 stay lit
const Army: React.FC<{ u: number; cut: number }> = ({ u, cut }) => {
  const k = fin(u, cut, 1.2), n = u < cut ? cnt(u, .1, .8, 60000) : Math.round(60000 - 51000 * k);
  return <>
    <Big u={u} a={.1} y={330} size={210} color={k > .99 ? GOLD : "#fff"}>{fmt(n)}</Big>
    {u < cut + 2.8 ? <Sub u={u} a={.4} y={560}>{k > .5 ? "CHOSEN" : "CALLED UP"}</Sub> : <Big u={u} a={cut + 2.9} y={545} size={100} color={RED}>HARD TO GET IN</Big>}
    <svg width={W} height={H} style={{ position: "absolute" }}>
      {Array.from({ length: 100 }, (_, i) => { const r = Math.floor(i / 10), c = i % 10, x = 150 + c * 87, y = 720 + r * 56, kept = [3, 17, 22, 28, 35, 41, 46, 54, 59, 63, 68, 77, 82, 88, 95].includes(i);
        const o = fin(u, .2 + i * .006, .2) * (kept ? 1 : 1 - .82 * k), col = kept && k > .3 ? GOLD : CREAM;
        return <g key={i} opacity={o} fill={col}><circle cx={x} cy={y} r={12} /><rect x={x - 11} y={y + 14} width={22} height={26} rx={10} /></g>; })}
    </svg>
  </>;
};

const Hours: React.FC<{ u: number }> = ({ u }) => {
  const a = fin(u, .2, 1.6) * 2 * Math.PI * .75;
  return <>
    <svg width={W} height={H} style={{ position: "absolute", opacity: fin(u, .05, .3) }}>
      <circle cx={540} cy={640} r={200} fill="none" stroke={CREAM} strokeWidth={16} />
      <path d={`M540 640 L540 440 A200 200 0 ${a > Math.PI ? 1 : 0} 1 ${540 + 200 * Math.sin(a)} ${640 - 200 * Math.cos(a)} Z`} fill={GOLD} opacity={.85} />
      <circle cx={540} cy={640} r={14} fill="#1b2a33" /></svg>
    <Big u={u} a={.3} y={900} size={250} color={GOLD}>37.5 H</Big>
    <Sub u={u} a={.8} y={1190}>A WEEK</Sub>
  </>;
};
const EvCard: React.FC<{ u: number }> = ({ u }) => <>
  <svg width={W} height={H} style={{ position: "absolute", transform: `scale(${pop(u, .05)})`, transformOrigin: "540px 620px", opacity: u < .05 ? 0 : 1 }}>
    <path d="M590 380 L430 660 L540 660 L490 860 L660 560 L548 560 Z" fill={GOLD} stroke="#5b3d07" strokeWidth={8} strokeLinejoin="round" /></svg>
  <Big u={u} a={.4} y={930} size={150}>ALMOST EVERY</Big>
  <Big u={u} a={.8} y={1100} size={150} color={GOLD}>NEW CAR</Big>
</>;
const Stamp: React.FC<{ u: number; y: number; children: React.ReactNode }> = ({ u, y, children }) => {
  const k = u - .05, z = k < 0 ? 0 : k < .16 ? 1.8 - .8 * (k / .16) : 1 + .05 * Math.exp(-(k - .16) * 9) * Math.cos((k - .16) * 30);
  return <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", opacity: k < 0 ? 0 : 1 }}>
    <span style={{ display: "inline-block", transform: `rotate(-6deg) scale(${z})`, fontFamily: NUM, fontSize: 170, color: "#fff", background: RED, border: "10px solid #fff", borderRadius: 18, padding: "6px 44px", boxShadow: "0 12px 34px rgba(0,0,0,.5)" }}>{children}</span></div>;
};
// tax list search: a name is typed, the record opens, then a notice shows who looked
const Tax: React.FC<{ u: number; seen: number }> = ({ u, seen }) => {
  const name = "Ola Nordmann", typed = name.slice(0, Math.floor(interpolate(u, [.3, 1.9], [0, 1], cl) * name.length));
  const row = (y: number, k: string, v: string, a: number) => <div style={{ position: "absolute", left: 120, right: 120, top: y, display: "flex", justifyContent: "space-between", opacity: fin(u, a, .25), fontFamily: F, fontWeight: 800, fontSize: 50, color: "#1b2a33" }}><span>{k}</span><span style={{ color: "#2f6b3b" }}>{v}</span></div>;
  return <>
    <div style={{ position: "absolute", left: 80, right: 80, top: 300, height: 760, borderRadius: 36, background: CREAM, boxShadow: "0 20px 60px rgba(0,0,0,.6)", transform: `scale(${pop(u, .05)})`, opacity: u < .05 ? 0 : 1 }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 345, textAlign: "center", fontFamily: F, fontWeight: 900, fontSize: 44, letterSpacing: 6, color: RED, opacity: fin(u, .1) }}>PUBLIC TAX LIST</div>
    <div style={{ position: "absolute", left: 130, right: 130, top: 430, height: 110, borderRadius: 55, border: "5px solid #1b2a33", background: "#fff", opacity: fin(u, .15),
      fontFamily: F, fontWeight: 700, fontSize: 50, color: "#1b2a33", lineHeight: "100px", paddingLeft: 40 }}>🔍 {typed}<span style={{ opacity: Math.floor(u * 2.5) % 2 }}>|</span></div>
    {row(610, "INCOME", "NOK 612,400", 2.1)}{row(710, "WEALTH", "NOK 1,85x,xxx", 2.3)}{row(810, "TAX PAID", "NOK 171,900", 2.5)}
    <div style={{ position: "absolute", left: 120, right: 120, top: 930, height: 4, background: "#c9bda3", opacity: fin(u, 2.1) }} />
    <div style={{ position: "absolute", left: 100, right: 100, top: 1100, borderRadius: 28, background: "#1b2a33", color: "#fff", padding: "30px 36px", boxShadow: `0 0 0 6px ${GOLD}, 0 18px 40px rgba(0,0,0,.6)`,
      opacity: u < seen ? 0 : 1, transform: `translateY(${(1 - fin(u, seen, .35)) * 120}px)`, fontFamily: F, fontWeight: 800, fontSize: 46, lineHeight: 1.3 }}>
      👀 Your neighbor looked you up.<div style={{ fontWeight: 600, fontSize: 38, color: GOLD }}>You can see exactly who.</div></div>
  </>;
};
const End: React.FC<{ u: number }> = ({ u }) => <>
  <Pic n="lineup" u={u} d={3.1} />
  <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(6,14,20,.85) 0%, rgba(6,14,20,.25) 35%, rgba(6,14,20,0) 60%)" }} />
  <Big u={u} a={.1} y={250} size={130}>WHICH COUNTRY</Big>
  <Big u={u} a={.4} y={400} size={170} color={GOLD}>NEXT?</Big>
  <Sub u={u} a={1.8} y={610} size={56}>TELL US IN THE COMMENTS 👇</Sub>
</>;

// age badge (top-left): counts up only
const AGES: [number, number][] = [[13.6, 0], [34.2, 6], [39.7, 18], [53.5, 19], [82.4, 67]];
const Age: React.FC<{ t: number }> = ({ t }) => {
  let v = 0, a0 = AGES[0][0];
  for (let i = 0; i < AGES.length; i++) if (t >= AGES[i][0]) { const prev = i ? AGES[i - 1][1] : 0; v = Math.round(prev + (AGES[i][1] - prev) * interpolate(t, [AGES[i][0], AGES[i][0] + .5], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) })); a0 = AGES[i][0]; }
  const fresh = t >= 91.1;   // the grandchild: a new life, a new AGE 0 (scene cut, no counting back)
  if (fresh) { v = 0; a0 = 91.1; }
  const z = 1 + .22 * Math.exp(-(t - a0) * 5), lv = Math.min(1, v / 80);
  return <><div style={{ position: "absolute", left: 56, right: 56, top: 108, height: 16, borderRadius: 8, background: "rgba(255,255,255,.2)" }}>
    <div style={{ width: `${Math.max(2, lv * 100)}%`, height: 16, borderRadius: 8, background: GOLD, boxShadow: `0 0 14px ${GOLD}` }} /></div>
  <div style={{ position: "absolute", left: 56, top: 150, padding: "8px 40px", borderRadius: 28, background: "rgba(10,22,28,.85)", border: `6px solid ${GOLD}`, transform: `scale(${z})`, transformOrigin: "0 0",
    fontFamily: NUM, fontSize: 112, lineHeight: 1.1, letterSpacing: 5, color: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,.5)" }}>AGE <span style={{ color: GOLD }}>{v}</span></div></>;
};
const Caption: React.FC<{ t: number }> = ({ t }) => {
  const c = (CAPS as [string, number, number][]).find(([, a, b]) => t >= a && t < b);
  if (!c) return null;
  const k = fin(t, c[1], .12);
  return <div style={{ position: "absolute", left: 70, right: 70, top: 1330, textAlign: "center", opacity: k, transform: `translateY(${(1 - k) * 14}px)` }}>
    <span style={{ fontFamily: F, fontWeight: 900, fontSize: 62, lineHeight: 1.22, color: "#fff", WebkitTextStroke: "3px #0a1418", paintOrder: "stroke fill", textShadow: "0 4px 18px rgba(0,0,0,.8)" }}>{c[0]}</span></div>;
};

type Sc = { a: number; r: (u: number, d: number) => React.ReactNode; bg?: boolean; age?: boolean };
const SC: Sc[] = [
  { a: 0, r: (u) => <><Spin t={u} />{u > 6.3 && <OneIn u={u - 6.3} />}</> },
  { a: 11.2, r: (u, d) => <Pic n="born" u={u} d={d} o={[50, 45]} mv="in" /> },
  { a: 12.2, r: (u, d) => <Pic n="c_baby" u={u} d={d} o={[50, 40]} mv="in" /> },
  { a: 13.6, bg: true, age: true, r: (u) => <Money u={u} a={3.0} /> },
  { a: 19.3, age: true, r: (u, d) => <><Pic n="coins" u={u} d={d} o={[60, 55]} mv="up" /><Shade /><Big u={u} a={.3} y={330} size={140} color={GOLD}>THE OIL FUND</Big></> },
  { a: 22.3, bg: true, age: true, r: (u) => <FundB u={u} /> },
  { a: 27.0, age: true, r: (u, d) => <><Pic n="sofa" u={u} d={d} o={[50, 55]} mv="in" /><Shade /><Big u={u} a={.4} y={330} size={150} color={GOLD}>49 WEEKS OFF</Big></> },
  { a: 29.5, bg: true, age: true, r: (u) => <Weeks u={u} dad={1.3} /> },
  { a: 32.0, age: true, r: (u, d) => <Pic n="dad" u={u} d={d} o={[55, 45]} mv="left" /> },
  { a: 33.0, age: true, r: (u, d) => <Pic n="c_dad" u={u} d={d} o={[50, 45]} mv="in" /> },
  { a: 34.1, age: true, r: (u, d) => <Pic n="school" u={u} d={d} o={[40, 55]} mv="out" /> },
  { a: 36.0, bg: true, age: true, r: (u) => <Free u={u} /> },
  { a: 37.9, r: (u, d) => <><Pic n="grad" u={u} d={d} o={[50, 45]} mv="up" /><Shade /><Big u={u} a={.2} y={300} size={130} color={GOLD}>UNIVERSITY: FREE</Big></> },
  { a: 39.6, age: true, r: (u, d) => <Pic n="russ" u={u} d={d} o={[55, 55]} mv="in" /> },
  { a: 41.1, age: true, r: (u, d) => <Pic n="c_teen" u={u} d={d} o={[50, 45]} mv="out" /> },
  { a: 42.6, age: true, r: (u, d) => <><Pic n="bonfire" u={u} d={d} o={[50, 60]} mv="down" /><Shade /><Big u={u} a={.2} y={330} size={120} color={RED}>RED OVERALLS</Big><Big u={u} a={.7} y={465} size={128} color={GOLD}>1 MONTH OF PARTY</Big></> },
  { a: 45.6, bg: true, age: true, r: (u) => <><Confetti u={u} /><Bus u={u - .4} /></> },
  { a: 49.8, bg: true, age: true, r: (u) => <May17 u={u} /> },
  { a: 51.0, age: true, r: (u, d) => <Pic n="parade" u={u} d={d} o={[50, 60]} mv="right" /> },
  { a: 53.4, age: true, r: (u, d) => <Pic n="army" u={u} d={d} o={[55, 45]} mv="in" /> },
  { a: 56.4, bg: true, age: true, r: (u) => <Army u={u} cut={2.3} /> },
  { a: 60.0, age: true, r: (u, d) => <Pic n="c_chosen" u={u} d={d} o={[50, 45]} mv="in" /> },
  { a: 61.2, age: true, r: (u, d) => <><Pic n="recruits" u={u} d={d} o={[50, 60]} mv="out" /><Stamp u={u} y={330}>HARD TO GET IN</Stamp></> },
  { a: 63.7, age: true, r: (u, d) => <><Pic n="office" u={u} d={d} o={[55, 45]} mv="out" /><Shade /><Big u={u} a={.3} y={330} size={190} color={GOLD}>37.5 H</Big><Sub u={u} a={.8} y={550}>A WEEK</Sub></> },
  { a: 66.7, age: true, r: (u, d) => <Pic n="ev" u={u} d={d} o={[45, 55]} mv="left" /> },
  { a: 69.5, bg: true, age: true, r: (u) => <EvCard u={u} /> },
  { a: 71.8, bg: true, age: true, r: (u) => <Stamp u={u} y={640}>THE CATCH</Stamp> },
  { a: 73.3, age: true, r: (u, d) => <><Pic n="laptop" u={u} d={d} o={[55, 40]} mv="in" /><Shade /><Big u={u} a={.4} y={330} size={120} color={GOLD}>SALARY: PUBLIC</Big></> },
  { a: 74.6, age: true, r: (u, d) => <Pic n="c_shock" u={u} d={d} o={[50, 40]} mv="in" /> },
  { a: 76.1, bg: true, age: true, r: (u) => <Tax u={u} seen={99} /> },
  { a: 78.9, age: true, r: (u, d) => <Pic n="neighbor" u={u} d={d} o={[35, 50]} mv="in" /> },
  { a: 80.4, bg: true, age: true, r: (u) => <Tax u={u + 3} seen={3.05} /> },
  { a: 82.3, age: true, r: (u, d) => <Pic n="retire" u={u} d={d} o={[40, 50]} mv="out" /> },
  { a: 85.3, age: true, r: (u, d) => <><Pic n="pension" u={u} d={d} o={[55, 50]} mv="in" /><Shade /><Big u={u} a={.2} y={330} size={130} color={GOLD}>OIL FUND</Big><Big u={u} a={.8} y={480} size={110}>= YOUR PENSION</Big></> },
  { a: 88.1, r: (u, d) => <Pic n="grandchild" u={u} d={d} o={[45, 55]} mv="up" /> },
  { a: 91.1, bg: true, r: (u) => <Money u={u} a={1.5} /> },
  { a: 96.9, r: (u) => <EndMap u={u} /> },
  { a: 101.9, r: (u) => <End u={u} /> },
];

export const BornInNorway: React.FC = () => {
  useFonts();
  const t = useCurrentFrame() / NO_FPS;
  const i = SC.findIndex((s, k) => t >= s.a && t < (SC[k + 1]?.a ?? NO_LEN));
  const s = SC[i], d = (SC[i + 1]?.a ?? NO_LEN) - s.a, u = t - s.a;
  return <AbsoluteFill style={{ background: "#0a1418" }}>
    {s.bg && <Bg u={t} />}
    <AbsoluteFill style={{ opacity: fin(u, 0, .1), transform: `scale(${i === 0 ? 1 : 1 + .06 * Math.exp(-u * 14)})` }}>{s.r(u, d)}</AbsoluteFill>
    {i > 0 && u < .12 && <AbsoluteFill style={{ background: "#fff", opacity: .22 * (1 - u / .12) }} />}
    {(s.age || t >= 91.1 && t < 96.9) && <Age t={t} />}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(0,0,0,.35) 100%)" }} />
    <Caption t={t} />
  </AbsoluteFill>;
};
