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

// ---------- grounds ----------
const Stage: React.FC<{ u: number; spots?: number[]; tint?: string }> = ({ u, spots = [960], tint }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 35%, #12306f 0%, ${NAVY} 55%, #06163b 100%)` }}>
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".18" /><stop offset="1" stopColor="#fff" stopOpacity=".02" /></linearGradient>
        <radialGradient id="pool"><stop offset="0" stopColor={tint || "#fff"} stopOpacity=".28" /><stop offset="1" stopColor={tint || "#fff"} stopOpacity="0" /></radialGradient>
      </defs>
      {spots.map((x, i) => <g key={i} opacity={.6 + .4 * fin(u, 0, .8)}>
        <path d={`M${x - 70} -20 L${x + 70} -20 L${x + 260} 930 L${x - 260} 930Z`} fill="url(#beam)" />
        <ellipse cx={x} cy={930} rx={300} ry={46} fill="url(#pool)" /></g>)}
      <rect x={0} y={930} width={1920} height={150} fill="#061331" opacity={.55} />
    </svg>
  </AbsoluteFill>
);
// sepia line-art ground; children are SVG line drawings
const Sepia: React.FC<{ children?: React.ReactNode; warm?: number }> = ({ children, warm = 1 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${warm ? "#3a2c1c" : "#1c2433"} 0%, ${warm ? "#1c140c" : "#0d1320"} 100%)` }}>
    <svg width={1920} height={1080} style={{ position: "absolute" }} fill="none" stroke={warm ? SEP : "#8fb3e6"} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
  </AbsoluteFill>
);
// ---------- characters ----------
const H: Record<string, number> = { father: 470, mother: 420, sota: 380, you: 410, you18: 450 };
const Char: React.FC<{ img: string; x: number; y?: number; u: number; a?: number; h?: number; flip?: boolean; glow?: string }> = ({ img, x, y = 905, u, a = 0, h, flip, glow }) => {
  const who = img.startsWith("you18") ? "you18" : img.split("-")[0];
  const hh = (h ?? H[who] ?? 420) * (img.includes("sit") ? .8 : img.includes("sleep") ? .45 : 1);
  const o = fin(u, a, .45), bob = 1 + .008 * Math.sin((u + x) * 2.2);
  return <Img src={staticFile(`fam1/${img}.png`)} style={{ position: "absolute", left: x, top: y, height: hh, transform: `translate(-50%, -100%) translateY(${(1 - o) * 26}px) scaleX(${flip ? -1 : 1}) scaleY(${bob})`, transformOrigin: "50% 100%", opacity: o, filter: `drop-shadow(0 0 ${glow ? 26 : 16}px ${glow || "rgba(255,255,255,.35)"})` }} />;
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
  const o = fin(u, a, .25);
  return <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", transform: `translateY(-50%) scale(${1.12 - .12 * o})`, opacity: o, fontFamily: F, fontWeight: 900, fontSize: size, color, letterSpacing: 6, textShadow: "0 0 40px rgba(255,255,255,.25)" }}>{text}</div>;
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
    <Char img="you-walk" x={X(cur)} y={690} u={u} h={260} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 240, textAlign: "center", fontFamily: F, fontWeight: 900, fontSize: 170, color: GOLD, letterSpacing: 4, textShadow: "0 0 30px rgba(232,185,90,.35)" }}>{hh}:{String(mm).padStart(2, "0")}</div>
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
// ---------- shot list (sample: sentences 1-23) ----------
type Shot = { from: number; to: number; draw: (u: number, t: number) => React.ReactNode; push?: number };
const SH: Shot[] = [
  { from: 1, to: 1, draw: (u) => <><Stage u={u} /><Char img="you-phone" x={960} u={u} /><Num u={u} a={1.4} value={10} suf="歳" x={1460} y={420} size={170} /></> },
  { from: 2, to: 3, draw: (u, t) => <><Stage u={u} /><Num u={u} a={.3} value={10} pre="平均 約" suf="歳" y={430} cite="初めてスマホを持つ年齢　NTTドコモ モバイル社会研究所（2024）" /></> },
  { from: 4, to: 4, draw: (u) => <><Stage u={u} spots={[620]} /><Char img="you-phone" x={620} u={u} /><Phone u={u} x={1260} y={500} a={.6} label="いつ、どこにいるか" /></> },
  { from: 5, to: 5, draw: (u) => <><Stage u={u} /><Phone u={u} x={960} y={480} s={1.05} dots={[[-80, -120, BLUE], [40, -40, BLUE], [-30, 60, BLUE], [70, 150, BLUE], [-90, 190, BLUE]]} label="GPSで居場所を確認" /></> },
  { from: 6, to: 6, draw: (u) => <><Stage u={u} /><People u={u} a={.3} n={4} lit={3} y={720} /><Num u={u} a={1.2} value={76.2} dec={1} suf="%" y={270} size={150} cite="小学校低学年の子に持たせた親　フリュー ガールズ総合研究所（2024）" /></> },
  { from: 7, to: 7, draw: (u) => <><Stage u={u} /><Char img="father-phone-worried" x={960} u={u} /></> },
  { from: 8, to: 9, draw: (u, t) => <><Stage u={u} spots={[560]} /><Char img="father-phone-worried" x={560} u={u} /><Phone u={u} x={1240} y={500} a={.3} label={t >= at(9) ? "どこにいるか　✓" : "今も表示されている"} /></> },
  { from: 10, to: 10, draw: (u) => <><Stage u={u} spots={[960]} /><Char img="you-stand" x={960} u={u} /><Keyword u={u} a={1.2} text="？" size={260} y={330} color={GOLD} /><div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: F, fontWeight: 900, fontSize: 56, color: "#cfe0ff", opacity: fin(u, .5) }}>何を考えているか</div></> },
  { from: 11, to: 12, draw: (u, t) => <><Sepia><House x={560} y={900} col="#8fb3e6" /><House x={1360} y={900} col={SEP} /></Sepia><Char img="mother-stand" x={1640} u={u} glow="rgba(232,185,90,.55)" /><Char img="sota-laugh" x={1800} u={u} a={t >= at(12) ? at(12) - at(11) : 99} glow="rgba(232,185,90,.55)" /></> },
  { from: 13, to: 13, draw: (u) => <><Stage u={u} spots={[560, 1360]} /><Char img="father-phone-worried" x={560} u={u} /><Char img="mother-listen" x={1360} u={u} glow="rgba(232,185,90,.55)" /><Keyword u={u} a={.6} text="なぜ？" size={170} y={260} color={GOLD} /></> },
  { from: 14, to: 14, draw: (u) => <><Stage u={u} spots={[640, 1280]} /><Char img="you-stand" x={640} u={u} /><Char img="father-stand" x={1280} u={u} a={.3} /><div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", opacity: fin(u, .8, .6) }}>
    <div style={{ fontFamily: F, fontWeight: 900, fontSize: 92, color: "#fff", letterSpacing: 4, textShadow: "0 0 30px rgba(255,255,255,.25)" }}>厳しい親が、<span style={{ color: GOLD }}>何も知らなかった</span>理由</div></div></> },
  { from: 15, to: 15, draw: (u) => <><Stage u={u} spots={[]} /><Ruler u={u} time={20.5} from={20} /></> },
  { from: 16, to: 17, draw: (u, t) => <><Sepia><path d="M700 930 L700 330 L1000 330 L1000 930" /><circle cx={960} cy={640} r={10} /><line x1={300} y1={930} x2={1620} y2={930} /></Sepia><Char img={t >= at(17) ? "you-walk" : "you-talk-smile"} x={t >= at(17) ? 850 + 260 * eo((t - at(17)) / 2.5) : 850} u={u} />{t < at(17) && <Bubble u={u} a={.1} x={1250} y={420} text="「ソウタと一緒に勉強してくるね」" w={560} />}</> },
  { from: 18, to: 19, draw: (u, t) => <><Stage u={u} tint={BLUE} /><Char img="father-phone-worried" x={760} u={u} glow="rgba(95,168,255,.55)" />{t >= at(19) && <Bubble u={u} a={at(19) - at(18)} x={1300} y={460} w={700} text="「門限は10時だからな。それと、お前に危ないことがないか、ちゃんと見てるからな」" />}</> },
  { from: 20, to: 21, draw: (u, t) => <><Sepia><House x={760} y={930} col={SEP} s={1.3} /><path d="M1360 230 q40 -50 90 -20 q40 -40 90 0 q50 0 40 50 l-220 0z" /></Sepia><Char img="mother-stand" x={1240} u={u} glow="rgba(232,185,90,.55)" />{t >= at(21) && <Bubble u={u} a={at(21) - at(20)} x={1440} y={430} w={640} warm text="「雨が降りそうだからさ、その時は、困ったら電話してね」" />}</> },
  { from: 22, to: 23, draw: (u, t) => { const b = t >= at(23) ? fin(t - at(23), .2, .4) : 0; return <><Stage u={u} spots={[560, 1360]} /><svg width={1920} height={1080} style={{ position: "absolute" }} fill="none" strokeWidth={3}><House x={560} y={930} col="#8fb3e6" /><House x={1360} y={930} col={SEP} /></svg>
    <div style={{ position: "absolute", left: 300, top: 150, width: 520, opacity: b, fontFamily: F, fontWeight: 700, fontSize: 40, color: "#cfe0ff", lineHeight: 1.6, textAlign: "center" }}>門限は10時<br />居場所は見てる</div>
    <div style={{ position: "absolute", left: 1100, top: 150, width: 520, opacity: fin(t - at(23), .9, .4) * (t >= at(23) ? 1 : 0), fontFamily: F, fontWeight: 700, fontSize: 40, color: GOLD, lineHeight: 1.6, textAlign: "center" }}>困ったら<br />電話してね</div></>; } },
];
const shotAt = (t: number) => { let k = 0; SH.forEach((s, i) => { if (t >= at(s.from) - (i === 0 ? 99 : 0)) k = i; }); return k; };
// ---------- captions (white, numbers and key words in gold) ----------
const KW = /([0-9][0-9,.]*(?:歳|人|%|時|分|組|週間|年)?|4人に3人以上|GPS|位置情報|何を考えているか|どこにいるか|ルール)/g;
const mark = (s: string) => s.split(KW).map((p, i) => (i % 2 ? <span key={i} style={{ color: GOLD }}>{p}</span> : p));
const BUBBLED = new Set([16, 19, 21]);   // these lines are shown in a speech bubble
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const cur = S.find(([, a, b]) => t >= a && t < b - .05); if (!cur || BUBBLED.has(cur[0])) return null;
  const [, a, , txt] = cur, o = fin(t, a, .12);
  return (<div style={{ position: "absolute", left: 0, right: 0, bottom: 52, textAlign: "center", opacity: o }}>
    <span style={{ display: "inline-block", maxWidth: 1700, fontFamily: F, fontWeight: 900, fontSize: 48, color: "#fff", textShadow: "0 0 6px #000, 0 2px 0 #000, 0 0 18px rgba(0,0,0,.8)", textWrap: "balance" as any, lineHeight: 1.4 }}>{mark(txt)}</span></div>);
};
export const FAM1_SAMPLE_END = at(24) - .1;
export const Fam1Episode: React.FC = () => {
  useFonts();
  const f = useCurrentFrame(), t = f / FPS, k = shotAt(t), sh = SH[k], start = k === 0 ? 0 : at(sh.from), u = t - start;
  const prev = SH[k - 1], xf = .45, fade = prev && u < xf ? interpolate(u, [0, xf], [0, 1], { ...cl, easing: ease }) : 1;
  const end = sh.to < S.length ? at(sh.to + 1) : t + 1, push = 1 + .035 * Math.min(1, u / Math.max(2, end - start));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("fam1/narration.wav")} />
      {prev && fade < 1 && <AbsoluteFill>{prev.draw(t - at(prev.from), t)}</AbsoluteFill>}
      <AbsoluteFill style={{ opacity: fade, transform: `scale(${push})` }}>{sh.draw(u, t)}</AbsoluteFill>
      <Captions t={t} />
    </AbsoluteFill>
  );
};
