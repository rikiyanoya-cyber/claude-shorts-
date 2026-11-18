// Your Vote — WRONG CAR episode 1 (1080x1920). Scenes 5-7 are built in code from the stills (exact on-screen text):
// 5 the driver's dash phone (a made-up navigation screen heading out of the city, distance going UP),
// 6 your own phone (a made-up ride app: the car icon creeping toward the pin, "YOUR DRIVER IS ON THE WAY"),
// 7 the print photo of you on the seat ("TODAY 4:12 PM"), revealed by a streetlight sweeping across.
// No real app, map, taxi company or brand designs.
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, delayRender, continueRender, OffthreadVideo, Sequence } from "remotion";
import WORDS from "./wc_words.json";

export const FPS = 30;
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.bezier(.45, 0, .2, 1);
const fin = (u: number, a: number, d = .4) => interpolate(u, [a, a + d], [0, 1], { ...cl, easing: ease });
const UI = "WCUI";
export const useWcFonts = () => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => {
    Promise.all([new FontFace(UI, `url(${staticFile("fonts/Inter-Bold.ttf")})`, { weight: "700" }).load(), new FontFace("WCM", `url(${staticFile("fonts/Montserrat.ttf")})`, { weight: "100 900" }).load()])
      .then((fs) => { fs.forEach((x) => document.fonts.add(x)); continueRender(h); }).catch(() => continueRender(h));
  }, [h]);
};

// ---- perspective: map a w x h box onto a quad (TL, TR, BR, BL) with a CSS matrix3d ----
type P = [number, number];
const adj = (m: number[]) => [m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4], m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5], m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]];
const mul = (a: number[], b: number[]) => { const c = Array(9).fill(0); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) c[3 * i + j] += a[3 * i + k] * b[3 * k + j]; return c; };
const mulv = (m: number[], v: number[]) => [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];
const basis = (p: P[]) => { const m = [p[0][0], p[1][0], p[2][0], p[0][1], p[1][1], p[2][1], 1, 1, 1]; const v = mulv(adj(m), [p[3][0], p[3][1], 1]); return mul(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]); };
const matrix3d = (w: number, h: number, q: P[]) => {
  // source corners in the order TL, TR, BL, BR for the basis trick
  const s = basis([[0, 0], [w, 0], [0, h], [w, h]]), d = basis([q[0], q[1], q[3], q[2]]);
  const t = mul(d, adj(s)); const n = t.map((x) => x / t[8]);
  return `matrix3d(${n[0]},${n[3]},0,${n[6]},${n[1]},${n[4]},0,${n[7]},0,0,1,0,${n[2]},${n[5]},0,${n[8]})`;
};
const Screen: React.FC<{ q: P[]; w: number; h: number; children: React.ReactNode; glow?: number }> = ({ q, w, h, children, glow = .9 }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transformOrigin: "0 0", transform: matrix3d(w, h, q), overflow: "hidden", borderRadius: 26, background: "#05070c", filter: `brightness(${glow})` }}>{children}</div>
);
// the still, drawn at frame width with a slow push toward (fx, fy)
const Still: React.FC<{ src: string; u: number; dur: number; z?: [number, number]; fx?: number; fy?: number; children?: React.ReactNode }> = ({ src, u, dur, z = [1, 1.09], fx = 540, fy = 960, children }) => {
  const k = ease(Math.min(1, Math.max(0, u / dur))), s = z[0] + (z[1] - z[0]) * k;
  return <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: `${fx}px ${fy}px` }}>
    <div style={{ position: "absolute", left: -4, top: 0, width: 1088, height: 1920 }}><Img src={staticFile(`wc/${src}`)} style={{ width: 1088, height: 1920 }} />{children}</div>
  </AbsoluteFill>;
};

// ---- 5: the driver's navigation, heading out of the city; the distance keeps going up ----
const NAV_Q: P[] = [[527, 752], [733, 748], [712, 1158], [505, 1150]];
const NavScreen: React.FC<{ u: number }> = ({ u }) => {
  const W = 300, H = 600, k = Math.min(1, u / 5.5), miles = 6.4 + 11.8 * Math.pow(Math.min(1, u / 5.5), 1.1);
  const route: P[] = [[150, 470], [150, 400], [205, 360], [205, 300], [240, 250], [262, 180], [276, 100], [284, 20], [290, -60]];
  const len = route.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - route[i][0], p[1] - route[i][1]), 0);
  return <div style={{ width: W, height: H, background: "#0b0f17", position: "relative", fontFamily: UI }}>
    <svg width={W} height={H} style={{ position: "absolute", transform: `translateY(${70 * k}px)` }}>
      {/* the city: a grid that stops; beyond it, nothing */}
      {Array.from({ length: 9 }, (_, i) => <line key={`h${i}`} x1={0} y1={330 + i * 34} x2={W} y2={322 + i * 34} stroke="#1f2a3c" strokeWidth={5} />)}
      {Array.from({ length: 8 }, (_, i) => <line key={`v${i}`} x1={18 + i * 40} y1={300} x2={26 + i * 40} y2={H + 80} stroke="#1f2a3c" strokeWidth={5} />)}
      <path d="M-20 150 C 80 170, 160 120, 330 140" stroke="#18212f" strokeWidth={10} fill="none" />
      <path d="M40 -100 C 90 60, 60 200, 120 320" stroke="#141c28" strokeWidth={4} fill="none" />
      <polyline points={route.map((p) => p.join(",")).join(" ")} fill="none" stroke="#ff8a2a" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - Math.min(1, .35 + .65 * k))} style={{ filter: "drop-shadow(0 0 6px #ff8a2a)" }} />
      <circle cx={150} cy={470} r={11} fill="#fff" stroke="#ff8a2a" strokeWidth={5} />
    </svg>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, padding: "18px 18px 14px", background: "linear-gradient(#0b0f17, rgba(11,15,23,.85))" }}>
      <div style={{ fontSize: 15, color: "#7f8aa3", letterSpacing: 1 }}>CONTINUE ON</div>
      <div style={{ fontSize: 30, color: "#fff", marginTop: 2 }}>Route 9 North</div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "16px 18px 22px", background: "#111725", borderTop: "2px solid #1d2638" }}>
      <div style={{ fontSize: 15, color: "#7f8aa3", letterSpacing: 1 }}>TO DESTINATION</div>
      <div style={{ fontSize: 46, color: "#ff8a2a", marginTop: 2 }}>{miles.toFixed(1)} <span style={{ fontSize: 24 }}>mi</span></div>
    </div>
  </div>;
};
export const Scene5: React.FC<{ u: number; dur: number }> = ({ u, dur }) => (
  <Still src="s5_driver_phone.png" u={u} dur={dur} z={[1.02, 1.16]} fx={620} fy={950}>
    <Screen q={NAV_Q} w={300} h={600}><NavScreen u={u} /></Screen>
  </Still>
);

// ---- 6: your phone, a made-up ride app: the car creeps toward your pin, "YOUR DRIVER IS ON THE WAY" ----
const APP_Q: P[] = [[540, 1228], [685, 1265], [630, 1565], [470, 1515]];
const RideScreen: React.FC<{ u: number }> = ({ u }) => {
  const W = 300, H = 600, k = Math.min(1, u / 8), cx = 60 + 70 * k, cy = 140 + 60 * k, pulse = .5 + .5 * Math.sin(u * 4);
  return <div style={{ width: W, height: H, background: "#e9edf3", position: "relative", fontFamily: UI }}>
    <svg width={W} height={H} style={{ position: "absolute" }}>
      {Array.from({ length: 8 }, (_, i) => <line key={`h${i}`} x1={0} y1={40 + i * 50} x2={W} y2={30 + i * 50} stroke="#fff" strokeWidth={9} />)}
      {Array.from({ length: 6 }, (_, i) => <line key={`v${i}`} x1={20 + i * 60} y1={0} x2={34 + i * 60} y2={420} stroke="#fff" strokeWidth={9} />)}
      <polyline points="60,140 130,200 205,250" fill="none" stroke="#2b6ef2" strokeWidth={6} strokeDasharray="10 8" />
      <circle cx={205} cy={250} r={18 + 10 * pulse} fill="#2b6ef2" opacity={.18} />
      <path d="M205 262 l-11 -16 a14 14 0 1 1 22 0z" fill="#2b6ef2" /><circle cx={205} cy={238} r={5} fill="#fff" />
      <g transform={`translate(${cx} ${cy}) rotate(38)`}><rect x={-13} y={-8} width={26} height={16} rx={5} fill="#1b1f2a" /><rect x={-5} y={-6} width={9} height={12} rx={2} fill="#9fb3d6" /></g>
    </svg>
    <div style={{ position: "absolute", left: 10, right: 10, bottom: 12, background: "#fff", borderRadius: 18, padding: "16px 16px 18px", boxShadow: "0 -4px 20px rgba(0,0,0,.12)" }}>
      <div style={{ fontSize: 13, color: "#2b6ef2", letterSpacing: 1 }}>ARRIVING IN {Math.max(3, 6 - Math.floor(u / 3))} MIN</div>
      <div style={{ fontSize: 23, color: "#10131a", marginTop: 6, lineHeight: 1.15 }}>YOUR DRIVER IS<br />ON THE WAY</div>
      <div style={{ height: 6, borderRadius: 3, background: "#e3e8f0", marginTop: 12 }}><div style={{ width: `${18 + 22 * k}%`, height: 6, borderRadius: 3, background: "#2b6ef2" }} /></div>
    </div>
  </div>;
};
export const Scene6: React.FC<{ u: number; dur: number }> = ({ u, dur }) => (
  <Still src="s6_own_phone.png" u={u} dur={dur} z={[1.0, 1.22]} fx={580} fy={1400}>
    <Screen q={APP_Q} w={300} h={600} glow={.8}><RideScreen u={u} /></Screen>
  </Still>
);

// ---- 7: the print photo on the seat, lit by a passing streetlight ----
export const Scene7: React.FC<{ u: number; dur: number }> = ({ u, dur }) => {
  const sweep = interpolate(u, [.6, dur - 1.2], [-700, 1500], cl), lit = (x: number) => Math.max(0, 1 - Math.abs(x - sweep) / 520);
  const pl = Math.max(.3, lit(600));
  return <AbsoluteFill style={{ background: "#000" }}>
    <Still src="s7_seat.png" u={u} dur={dur} z={[1.0, 1.18]} fx={600} fy={1150}>
      {/* the photo lying on the seat */}
      <div style={{ position: "absolute", left: 600, top: 1150, width: 470, height: 590, transform: "translate(-50%,-50%) perspective(1400px) rotateX(38deg) rotateZ(-9deg)", background: "#f3efe6", padding: "18px 18px 70px", boxShadow: "0 18px 40px rgba(0,0,0,.6)", filter: `brightness(${pl})` }}>
        <div style={{ width: "100%", height: "100%", overflow: "hidden" }}><Img src={staticFile("wc/s7_photo.png")} style={{ width: "100%", height: "128%", objectFit: "cover", marginTop: "-6%" }} /></div>
        <div style={{ position: "absolute", right: 30, bottom: 84, fontFamily: "monospace", fontWeight: 700, fontSize: 24, letterSpacing: 2, color: "#ff8a2a", textShadow: "0 0 4px rgba(255,120,30,.7)" }}>TODAY 4:12 PM</div>
      </div>
    </Still>
    {/* the car is dark; an orange streetlight band slides across, then it is dark again */}
    <AbsoluteFill style={{ background: `linear-gradient(105deg, rgba(0,0,0,.72) ${(sweep - 520) / 19.2}%, rgba(0,0,0,0) ${sweep / 19.2}%, rgba(0,0,0,.72) ${(sweep + 520) / 19.2}%)` }} />
    <AbsoluteFill style={{ background: `linear-gradient(105deg, rgba(255,140,40,0) ${(sweep - 300) / 19.2}%, rgba(255,140,40,.22) ${sweep / 19.2}%, rgba(255,140,40,0) ${(sweep + 300) / 19.2}%)`, mixBlendMode: "screen" }} />
  </AbsoluteFill>;
};

// test composition for scenes 5-7 on the narration clock (38.4 s -> 62.3 s)
export const WC_S5 = 38.4, WC_S6 = 44.2, WC_S7 = 52.2, WC_S7_END = 62.3;
export const WrongCarStills: React.FC = () => {
  useWcFonts();
  const t = useCurrentFrame() / FPS + WC_S5;
  return <AbsoluteFill style={{ background: "#000" }}>
    {t < WC_S6 ? <Scene5 u={t - WC_S5} dur={WC_S6 - WC_S5} /> : t < WC_S7 ? <Scene6 u={t - WC_S6} dur={WC_S7 - WC_S6} /> : <Scene7 u={t - WC_S7} dur={WC_S7_END - WC_S7} />}
  </AbsoluteFill>;
};

// =================== the full episode ===================
const WD = WORDS as [number, string, number][];
export const WC_NAR = 75.47, WC_END = WC_NAR + 2.0;
const fout = (u: number, b: number, d = .4) => 1 - fin(u, b - d, d);
const lerp = (k: [number, number[]][], t: number) => { let i = 0; while (i < k.length - 2 && t > k[i + 1][0]) i++; const [t0, a] = k[i], [t1, b] = k[i + 1], q = Math.max(0, Math.min(1, (t - t0) / (t1 - t0))); return a.map((v, j) => v + (b[j] - v) * q); };

// blur patches (air freshener shapes, a car badge, readable neon), in fractions of the 1080x1920 layer
const Blur: React.FC<{ r: number[]; px?: number }> = ({ r, px = 34 }) => <div style={{ position: "absolute", left: (r[0] - r[2] / 2) * 1080, top: (r[1] - r[3] / 2) * 1920, width: r[2] * 1080, height: r[3] * 1920, borderRadius: "45%", backdropFilter: `blur(${px}px) brightness(.75)`, WebkitBackdropFilter: `blur(${px}px) brightness(.75)` }} />;

// a Pollo clip (muted), placed at [a, b) on the narration clock, played from `from` at `rate`
const Clip: React.FC<{ src: string; from?: number; rate?: number; z?: [number, number]; o?: [number, number]; dur: number; blur?: [number, number[]][]; bright?: number }> = ({ src, from = 0, rate = 1, z = [1.0, 1.06], o = [50, 45], dur, blur, bright = 1 }) => {
  const f = useCurrentFrame() / FPS, k = ease(Math.min(1, f / dur)), s = z[0] + (z[1] - z[0]) * k;
  return <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: `${o[0]}% ${o[1]}%`, filter: `brightness(${bright})` }}>
    <OffthreadVideo src={staticFile(`wc/${src}`)} muted startFrom={Math.round(from * FPS)} playbackRate={rate} style={{ width: 1080, height: 1920 }} />
    {blur && <Blur r={lerp(blur, from + f * rate)} />}
  </AbsoluteFill>;
};
// a frame (or still) with a slow push
const Pic: React.FC<{ src: string; u: number; dur: number; z?: [number, number]; o?: [number, number]; blur?: number[][]; bright?: number; children?: React.ReactNode; dx?: number }> = ({ src, u, dur, z = [1.05, 1.18], o = [50, 45], blur, bright = 1, children, dx = 0 }) => {
  const k = ease(Math.min(1, Math.max(0, u / dur))), s = z[0] + (z[1] - z[0]) * k;
  return <AbsoluteFill style={{ transform: `translateX(${dx * k}px) scale(${s})`, transformOrigin: `${o[0]}% ${o[1]}%`, filter: `brightness(${bright})` }}>
    <Img src={staticFile(`wc/${src}`)} style={{ width: 1080, height: 1920, objectFit: "cover" }} />
    {blur?.map((r, i) => <Blur key={i} r={r} />)}{children}
  </AbsoluteFill>;
};
const TREE_MIRROR: [number, number[]][] = [[0, [.49, .47, .15, .22]], [2.5, [.49, .57, .2, .32]], [4, [.46, .64, .24, .38]], [5.1, [.44, .68, .27, .42]]];
const TREE_LEAN: [number, number[]][] = [[0, [.72, .32, .06, .08]], [5.1, [.8, .33, .13, .14]]];
const TREE_LAST = [.8, .33, .13, .14], FORD = [.444, .629, .1, .045], NEON = [.06, .24, .09, .12], TREE_S5 = [.49, .13, .2, .2], TREE_S6 = [.72, .29, .04, .05];

// made-up booking screen, full frame
const BookScreen: React.FC<{ u: number }> = ({ u }) => {
  const found = u > 1.2;
  return <AbsoluteFill style={{ background: "#0c0f15", alignItems: "center", paddingTop: 190, fontFamily: UI }}>
    <div style={{ width: 760, height: 1060, borderRadius: 70, background: "#e9edf3", overflow: "hidden", position: "relative", boxShadow: "0 0 80px rgba(80,140,255,.25)", transform: `scale(${1.04 - .04 * ease(Math.min(1, u / 1.5))})` }}>
      <svg width={760} height={1060} style={{ position: "absolute" }}>{Array.from({ length: 14 }, (_, i) => <line key={i} x1={0} y1={60 + i * 90} x2={760} y2={40 + i * 90} stroke="#fff" strokeWidth={18} />)}{Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={40 + i * 95} y1={0} x2={60 + i * 95} y2={1360} stroke="#fff" strokeWidth={18} />)}
        <circle cx={380} cy={420} r={30 + 16 * Math.sin(u * 5)} fill="#2b6ef2" opacity={.2} /><circle cx={380} cy={420} r={18} fill="#2b6ef2" stroke="#fff" strokeWidth={6} /></svg>
      <div style={{ position: "absolute", left: 30, right: 30, bottom: 40, background: "#fff", borderRadius: 40, padding: "44px 44px 50px", boxShadow: "0 -8px 40px rgba(0,0,0,.12)" }}>
        <div style={{ fontSize: 30, color: "#7a8396", letterSpacing: 2 }}>{found ? "DRIVER FOUND" : "FINDING YOUR RIDE…"}</div>
        <div style={{ fontSize: 66, color: "#10131a", marginTop: 10 }}>{found ? "2 min away" : "Home"}</div>
        <div style={{ height: 14, borderRadius: 7, background: "#e3e8f0", marginTop: 30 }}><div style={{ width: `${found ? 100 : 30 + 50 * (u / 1.2)}%`, height: 14, borderRadius: 7, background: "#2b6ef2" }} /></div>
      </div>
    </div>
  </AbsoluteFill>;
};
// "Your street is a left at this light." -> LEFT, then the arrow swings RIGHT
const TurnCard: React.FC<{ u: number; right?: boolean }> = ({ u, right }) => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #1a1e26 0%, #07080b 75%)", alignItems: "center", justifyContent: "center" }}>
    <svg width={700} height={700} style={{ transform: `scaleX(${right ? -1 : 1}) scale(${.9 + .1 * ease(Math.min(1, u / .5))})` }}>
      <path d="M520 600 L520 330 Q520 260 450 260 L250 260 L250 160 L80 330 L250 500 L250 400 L380 400 L380 600Z" fill={right ? "#e8463b" : "#3fd07a"} style={{ filter: `drop-shadow(0 0 30px ${right ? "#e8463b" : "#3fd07a"})` }} /></svg>
    <div style={{ position: "absolute", top: 380, fontFamily: "WCM", fontWeight: 900, fontSize: 120, letterSpacing: 6, color: right ? "#e8463b" : "#3fd07a" }}>{right ? "RIGHT" : "HOME: LEFT"}</div>
  </AbsoluteFill>
);
// passing city lights through the side window
const Lights: React.FC<{ u: number }> = ({ u }) => (
  <AbsoluteFill style={{ background: "#05060a", overflow: "hidden" }}>
    {Array.from({ length: 26 }, (_, i) => { const sd = (i * .618) % 1, x = ((sd * 2600 - u * (380 + 520 * sd)) % 2600 + 2600) % 2600 - 600, y = 300 + ((i * 137) % 1300), r = 40 + 120 * ((i * .37) % 1), c = ["#ffb35c", "#ff8a2a", "#ffe2a8", "#7fb2ff", "#ff6b6b"][i % 5];
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: r * 2.6, height: r, borderRadius: r, background: c, opacity: .35 + .3 * sd, filter: `blur(${18 + 20 * sd}px)` }} />; })}
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,.85) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 82%, rgba(0,0,0,.85) 100%)" }} />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>{Array.from({ length: 30 }, (_, i) => <line key={i} x1={(i * 97) % 1080} y1={(i * 211) % 1920} x2={(i * 97) % 1080 + 2} y2={(i * 211) % 1920 + 26} stroke="#9fb3d6" strokeWidth={2} opacity={.35} />)}</svg>
  </AbsoluteFill>
);
// the big clock card
const ClockCard: React.FC<{ u: number }> = ({ u }) => (
  <AbsoluteFill style={{ background: "#040507", alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 250, letterSpacing: 10, color: "#ff5a3a", textShadow: "0 0 40px rgba(255,80,50,.7)", opacity: fin(u, 0, .15) * (u % 1 < .5 || u < .6 ? 1 : .85) }}>2:07<span style={{ fontSize: 110 }}> AM</span></div>
  </AbsoluteFill>
);
// "Every taxi in this city looks the same": the same taxi, three times
const Same: React.FC<{ u: number }> = ({ u }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {[0, 1, 2].map((i) => <div key={i} style={{ position: "absolute", left: 0, top: i * 640, width: 1080, height: 636, overflow: "hidden", opacity: fin(u, i * .35, .2) }}>
      <Img src={staticFile("wc/curb_last.png")} style={{ position: "absolute", width: 1620, height: 2880, left: -360 + (i - 1) * 60 - 20 * u, top: -1380, filter: `brightness(${.95 - i * .08}) hue-rotate(${i * 4}deg)` }} />
      <div style={{ position: "absolute", left: (.444 * 1620 - 360 + (i - 1) * 60 - 20 * u) - 85, top: .629 * 2880 - 1380 - 45, width: 170, height: 90, borderRadius: "45%", backdropFilter: "blur(30px) brightness(.75)" }} /></div>)}
  </AbsoluteFill>
);

const Swing: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const k = ease(Math.min(1, useCurrentFrame() / FPS / dur));
  return <AbsoluteFill style={{ transform: `translateX(${-70 * k}px) rotate(${-2.5 * Math.sin(Math.PI * k)}deg)`, transformOrigin: "50% 70%" }}>{children}</AbsoluteFill>;
};
type Cut = { a: number; b: number; r: (u: number, d: number) => React.ReactNode; video?: boolean; flash?: boolean; shake?: number };
const A = (i: number) => WD.find((w) => w[0] === i)![2];
export const CUTS: Cut[] = [
  { a: 0, b: 1.45, flash: true, r: (u, d) => <Pic src="handle_first.png" u={u} dur={d} z={[1.5, 1.62]} o={[70, 30]} /> },
  { a: 1.45, b: 3.6, video: true, r: (u, d) => <Clip src="handle.mp4" dur={d} z={[1.0, 1.08]} o={[55, 45]} /> },
  { a: 3.6, b: 5.3, r: (u, d) => <Pic src="mirror_last.png" u={u} dur={d} z={[1.25, 1.4]} o={[50, 18]} blur={[[.45, .66, .3, .46]]} /> },
  { a: 5.3, b: 6.6, r: (u) => <ClockCard u={u} /> },
  { a: 6.6, b: 9.6, r: (u, d) => <Pic src="curb_first.png" u={u} dur={d} z={[1.02, 1.14]} o={[70, 40]} blur={[NEON]} /> },
  { a: 9.6, b: 12.3, r: (u) => <BookScreen u={u} /> },
  // 2026-11-18: the taxi already stopped in front of you (user's still), headlights glowing
  { a: 12.3, b: 14.9, r: (u, d) => <Pic src="taxi_front.png" u={u} dur={d} z={[1.0, 1.1]} o={[35, 55]} blur={[[.05, .2, .07, .12], [.445, .22, .05, .09], [.12, .595, .12, .05]]} /> },
  { a: 14.9, b: 17.7, r: (u) => <Same u={u} /> },
  { a: 17.7, b: 19.0, r: (u, d) => <AbsoluteFill style={{ filter: `blur(${2 + 6 * ease(Math.min(1, u / d))}px)` }}><Pic src="curb_last.png" u={u} dur={d} z={[1.3, 1.6]} o={[40, 50]} blur={[FORD]} /></AbsoluteFill> },
  // the hand on the rear door handle (user's still), then the door shuts as you get in
  { a: 19.0, b: 21.05, r: (u, d) => <Pic src="door_hand.png" u={u} dur={d} z={[1.0, 1.12]} o={[55, 55]} blur={[[.62, .17, .05, .1], [.91, .25, .05, .1]]} /> },
  { a: 21.05, b: 23.4, video: true, r: (u, d) => <Clip src="mirror.mp4" dur={d} z={[1.0, 1.05]} o={[50, 20]} blur={TREE_MIRROR} /> },
  { a: 23.4, b: 25.0, r: (u, d) => <Pic src="mirror_last.png" u={u} dur={d} z={[1.5, 1.62]} o={[50, 17]} blur={[[.45, .66, .3, .46]]} /> },
  { a: 25.0, b: 26.5, video: true, r: (u, d) => <Clip src="ride.mp4" dur={d} z={[1.0, 1.06]} /> },
  { a: 26.5, b: 30.4, r: (u) => <Lights u={u} /> },
  { a: 30.4, b: 32.1, r: (u, d) => <Pic src="ride_mid.png" u={u} dur={d} z={[1.1, 1.3]} o={[60, 25]} /> },
  { a: 32.1, b: 33.95, r: (u) => <TurnCard u={u} /> },
  { a: 33.95, b: 34.3, r: (u) => <TurnCard u={u} right /> },
  // 2026-11-18: the driver turns the wheel right (user's clip), then the taxi from outside
  // the car swings hard, so the wheel does too: the clip's turn (0.9-2.9 s) at 2.2x, with a quick camera swing
  { a: 34.3, b: 35.2, video: true, r: (u, d) => <Swing dur={d}><Clip src="wheel.mp4" from={0.9} rate={2.2} dur={d} z={[1.04, 1.1]} /></Swing> },
  { a: 35.2, b: 36.1, video: true, r: (u, d) => <Clip src="turn.mp4" from={2.0} rate={1.3} dur={d} blur={[[0, NEON], [5.1, NEON]]} /> },
  { a: 36.1, b: 38.4, video: true, r: (u, d) => <Clip src="lean.mp4" from={1.0} rate={1.2} dur={d} blur={TREE_LEAN} /> },
  { a: 38.4, b: 44.2, r: (u, d) => <AbsoluteFill><Scene5 u={u} dur={d} /><Blur r={TREE_S5} /></AbsoluteFill> },
  { a: 44.2, b: 52.2, r: (u, d) => <AbsoluteFill><Scene6 u={u} dur={d} /><Blur r={TREE_S6} px={8} /></AbsoluteFill> },
  { a: 52.2, b: 56.75, r: (u) => <Scene7 u={u} dur={10.1} /> },
  { a: 56.75, b: 58.0, flash: true, r: (u, d) => <Pic src="s7_photo.png" u={u} dur={d} z={[1.6, 1.75]} o={[48, 42]} /> },
  { a: 58.0, b: 60.45, r: (u, d) => <Pic src="s7_photo.png" u={u} dur={d} z={[1.15, 1.0]} o={[50, 40]} /> },
  { a: 60.45, b: 62.3, r: (u) => <Scene7 u={u + 6.5} dur={10.1} /> },
  { a: 62.3, b: 63.3, flash: true, r: (u, d) => <Pic src="handle_first.png" u={u} dur={d} z={[1.7, 1.8]} o={[70, 32]} /> },
  { a: 63.3, b: 64.75, video: true, r: (u, d) => <Clip src="handle.mp4" from={2.8} dur={d} z={[1.05, 1.12]} /> },
  { a: 64.75, b: WC_END, shake: 67.6, r: (u, d) => <Pic src="lean_last.png" u={u} dur={d} z={[1.0, 1.25]} o={[55, 22]} blur={[TREE_LAST]} /> },
];

// captions: word by word, chunked by punctuation (max 4 words); a few beats get one big word
const BIGW = new Set(["Of you,", "this afternoon.", "Click."]);
type Chunk = { words: [string, number][]; big: boolean; end: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = []; let cur: [string, number][] = [];
  const lines = new Map<number, [string, number][]>(); WD.forEach(([l, w, t]) => { if (!lines.has(l)) lines.set(l, []); lines.get(l)!.push([w, t]); });
  for (const [l, ws] of lines) {
    if (l >= 27) continue;   // the A / B lines are carried by the vote cards
    const flush = () => { if (cur.length) { const txt = cur.map((c) => c[0]).join(" "); out.push({ words: cur, big: BIGW.has(txt), end: 0 }); cur = []; } };
    ws.forEach(([w, t], i) => {
      const next = [...cur, [w, t] as [string, number]].map((c) => c[0]).join(" ");
      if (l === 22 && w === "this") flush();                     // "Taken" | "this afternoon."
      cur.push([w, t]);
      if (BIGW.has(next)) flush();
      else if (/[,.?!…:]$/.test(w) || cur.length >= 4) flush();
    });
    flush();
  }
  out.forEach((c, i) => { const last = c.words[c.words.length - 1][1]; c.end = Math.min(out[i + 1]?.words[0][1] ?? last + 1, last + 1.1); });
  return out;
})();
const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t < 1.5) return null;
  const c = CHUNKS.find((c) => t >= c.words[0][1] - .05 && t < c.end);
  if (!c) return null;
  const size = c.big ? 150 : 76;
  return <div style={{ position: "absolute", left: 60, right: 60, top: c.big ? 820 : 1310, textAlign: "center", fontFamily: "WCM", fontWeight: 900, fontSize: size, lineHeight: 1.1, color: "#fff", textShadow: "0 0 3px #000, 0 4px 14px rgba(0,0,0,.95), 0 0 30px rgba(0,0,0,.7)", WebkitTextStroke: c.big ? "2px rgba(0,0,0,.6)" : "1.5px rgba(0,0,0,.55)" }}>
    {c.words.map(([w, wt], i) => { const o = fin(t, wt - .04, .08); return <span key={i} style={{ opacity: o, display: "inline-block", transform: `translateY(${(1 - o) * 10}px) scale(${c.big ? 1.15 - .15 * o : 1})`, marginRight: 18 }}>{w}</span>; })}
  </div>;
};
// A = red, B = blue (2026-11-18)
const VoteCard: React.FC<{ t: number; a: number; k: string; text: string; y: number }> = ({ t, a, k, text, y }) => {
  const o = fin(t, a - .05, .25);
  return <div style={{ position: "absolute", left: 70, right: 70, top: y, opacity: o, transform: `translateX(${(1 - o) * -60}px)`, display: "flex", alignItems: "center", gap: 30, background: "rgba(10,10,14,.82)", border: "3px solid rgba(255,255,255,.85)", borderRadius: 34, padding: "34px 40px", fontFamily: "WCM", boxShadow: "0 10px 40px rgba(0,0,0,.6)" }}>
    <div style={{ width: 110, height: 110, borderRadius: 26, background: k === "A" ? "#e8463b" : "#2b6ef2", color: "#fff", fontWeight: 900, fontSize: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>{k}</div>
    <div style={{ fontWeight: 900, fontSize: 64, color: "#fff", lineHeight: 1.05 }}>{text}</div>
  </div>;
};

export const WrongCarEpisode: React.FC = () => {
  useWcFonts();
  const f = useCurrentFrame(), t = f / FPS;
  const cut = CUTS.find((c) => t >= c.a && t < c.b) ?? CUTS[CUTS.length - 1];
  const sh = cut.shake ? Math.max(0, 1 - Math.abs(t - cut.shake) / .35) : 0;
  const flash = cut.flash ? Math.max(0, 1 - (t - cut.a) / .25) : 0;
  const lockFlash = Math.max(0, 1 - Math.abs(t - A(23) - .05) / .12);
  const heart = t > 55.5 ? Math.pow(Math.max(0, Math.sin(((t - 55.5) * 1.17) * Math.PI * 2)), 8) : 0;   // ~70 bpm pulse
  const RED0 = 66.55, cd = Math.max(0, 10 - Math.floor(t - RED0)), redBlink = cd === 0 ? (Math.floor(t * 4) % 2 ? 1 : .25) : 1;
  return <AbsoluteFill style={{ background: "#000" }}>
    <AbsoluteFill style={{ transform: `translate(${sh * 10 * Math.sin(t * 60)}px, ${sh * 22}px) scale(${1 + heart * .012})`, filter: "contrast(1.08) saturate(.92)" }}>
      {CUTS.map((c, i) => c.video ? <Sequence key={i} from={Math.round(c.a * FPS)} durationInFrames={Math.round((c.b - c.a) * FPS)}>{c.r(0, c.b - c.a)}</Sequence> : (cut === c ? <React.Fragment key={i}>{c.r(t - c.a, c.b - c.a)}</React.Fragment> : null))}
    </AbsoluteFill>
    {/* the red light grows over the last scene */}
    {t > 64.75 && <AbsoluteFill style={{ background: `radial-gradient(ellipse at 85% 18%, rgba(255,30,20,${.12 + .28 * fin(t, A(25) + 1.0, 1.2) * (.8 + .2 * Math.sin(t * 6))}) 0%, rgba(255,0,0,0) 60%)`, mixBlendMode: "screen" }} />}
    {t > 68.4 && <AbsoluteFill style={{ background: `rgba(0,0,0,${.45 * fin(t, 68.4, .6)})` }} />}
    {/* grade: warm/teal split, vignette, grain */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,40,60,.18), rgba(60,30,0,.12))", mixBlendMode: "soft-light" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.6) 100%)" }} />
    <AbsoluteFill style={{ opacity: .09, mixBlendMode: "overlay" }}><svg width={1080} height={1920}><filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={f % 30} /></filter><rect width={1080} height={1920} filter="url(#g)" /></svg></AbsoluteFill>
    {heart > 0 && <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 40%, rgba(120,0,0,${heart * .35}) 100%)` }} />}
    {(flash > 0 || lockFlash > 0) && <AbsoluteFill style={{ background: "#fff", opacity: Math.max(flash * .7, lockFlash * .5) }} />}
    {/* the Pollo logo stays top-right on every cut (CPP posting condition) */}
    <Img src={staticFile("wc/pollo_logo.png")} style={{ position: "absolute", left: 676, top: 294, width: 341, height: 77 }} />
    {/* the hook title */}
    {t < 1.5 && <div style={{ position: "absolute", left: 50, right: 50, top: 760, textAlign: "center", fontFamily: "WCM", fontWeight: 900, fontSize: 132, lineHeight: 1.02, color: "#fff", letterSpacing: 1, textShadow: "0 6px 26px rgba(0,0,0,.9)", transform: `scale(${1.12 - .12 * ease(Math.min(1, t / .25))})`, opacity: fout(t, 1.5, .2) }}>THIS ISN'T<br /><span style={{ color: "#f2c46b" }}>YOUR TAXI.</span></div>}
    {/* small clock at the top (the big 2:07 card carries it on its own) */}
    {!(t >= 5.3 && t < 6.6) && <div style={{ position: "absolute", left: 60, top: 110, fontFamily: "monospace", fontWeight: 700, fontSize: 44, letterSpacing: 3, color: "#ff5a3a", textShadow: "0 0 12px rgba(255,80,50,.7), 0 2px 6px #000" }}>2:07 AM</div>}
    {/* the countdown to green */}
    {t > RED0 - .3 && <div style={{ position: "absolute", right: 60, top: 420, textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#ff3b30", opacity: fin(t, RED0 - .3, .3) * redBlink, textShadow: "0 0 18px rgba(255,40,30,.8), 0 2px 6px #000" }}>
      <div style={{ fontSize: 36, letterSpacing: 4 }}>RED LIGHT</div><div style={{ fontSize: 110 }}>0:{String(cd).padStart(2, "0")}</div></div>}
    {/* the vote */}
    <VoteCard t={t} a={A(27)} k="A" text="Grab the wheel" y={1080} />
    <VoteCard t={t} a={WD.find((w) => w[0] === 28 && w[1] === "B.")![2]} k="B" text="Jump out at the light" y={1300} />
    {t > A(27) - .3 && <div style={{ position: "absolute", left: 0, right: 0, top: 960, textAlign: "center", fontFamily: "WCM", fontWeight: 800, fontSize: 40, letterSpacing: 6, color: "#fff", opacity: fin(t, A(27) - .3, .3), textShadow: "0 2px 8px #000" }}>COMMENT A OR B</div>}
    <Captions t={t} />
  </AbsoluteFill>;
};

// =================== cover (1080x1920; the profile grid crops to 3:4, so everything sits between y 240 and 1680) ===================
export const WrongCarCover: React.FC<{ v?: string }> = ({ v = "A" }) => {
  useWcFonts();
  const eyes = v === "A";
  return <AbsoluteFill style={{ background: "#000" }}>
    {eyes
      ? <AbsoluteFill style={{ transform: "scale(1.55)", transformOrigin: "50% 17%" }}><Img src={staticFile("wc/mirror_last.png")} style={{ width: 1080, height: 1920 }} /><Blur r={[.45, .66, .3, .46]} px={40} /></AbsoluteFill>
      : <AbsoluteFill style={{ transform: "scale(1.12)", transformOrigin: "35% 55%" }}><Img src={staticFile("wc/taxi_front.png")} style={{ width: 1080, height: 1920 }} /><Blur r={[.05, .2, .07, .12]} /><Blur r={[.445, .22, .05, .09]} /><Blur r={[.12, .595, .12, .05]} /></AbsoluteFill>}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,.55) 62%, rgba(0,0,0,.85) 100%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,.6) 100%)" }} />
    {/* no Pollo logo on the cover (2026-11-18) */}
    <div style={{ position: "absolute", left: 60, top: 300, fontFamily: "monospace", fontWeight: 700, fontSize: 48, letterSpacing: 3, color: "#ff5a3a", textShadow: "0 0 14px rgba(255,80,50,.7), 0 2px 6px #000" }}>2:07 AM</div>
    <div style={{ position: "absolute", left: 60, right: 60, top: 1110, textAlign: "center", fontFamily: "WCM", fontWeight: 900, fontSize: 150, lineHeight: 1, color: "#fff", textShadow: "0 6px 30px rgba(0,0,0,.95)" }}>THIS ISN'T<br /><span style={{ color: "#f2c46b" }}>YOUR TAXI.</span></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1460, textAlign: "center", fontFamily: "WCM", fontWeight: 800, fontSize: 46, letterSpacing: 10, color: "#fff", opacity: .9 }}>WRONG CAR · EP 1</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1545, display: "flex", justifyContent: "center", gap: 26, fontFamily: "WCM", fontWeight: 900, fontSize: 52, color: "#fff" }}>
      <div style={{ background: "#e8463b", borderRadius: 18, padding: "8px 30px" }}>A</div><div style={{ alignSelf: "center", fontSize: 40, opacity: .85 }}>or</div><div style={{ background: "#2b6ef2", borderRadius: 18, padding: "8px 30px" }}>B</div></div>
  </AbsoluteFill>;
};

// =================== Instagram stories (1080x1920; nothing important in the top 250 px or bottom 340 px; space left for a sticker) ===================
const StoryText: React.FC<{ top: number; size?: number; children: React.ReactNode; color?: string }> = ({ top, size = 120, children, color = "#fff" }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top, textAlign: "center", fontFamily: "WCM", fontWeight: 900, fontSize: size, lineHeight: 1.02, color, textShadow: "0 6px 30px rgba(0,0,0,.95)" }}>{children}</div>
);
export const WrongCarStory: React.FC<{ v?: string }> = ({ v = "1" }) => {
  useWcFonts();
  const shade = <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.05) 30%, rgba(0,0,0,.1) 55%, rgba(0,0,0,.8) 100%)" }} />;
  const clock = <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", fontFamily: "monospace", fontWeight: 700, fontSize: 64, letterSpacing: 4, color: "#ff5a3a", textShadow: "0 0 16px rgba(255,80,50,.75), 0 2px 6px #000" }}>2:07 AM</div>;
  if (v === "1") return <AbsoluteFill style={{ background: "#000" }}>
    <AbsoluteFill style={{ transform: "scale(1.45)", transformOrigin: "70% 34%" }}><Img src={staticFile("wc/handle_first.png")} style={{ width: 1080, height: 1920 }} /></AbsoluteFill>
    {shade}{clock}
    <StoryText top={430} size={128}>THE DOORS<br /><span style={{ color: "#f2c46b" }}>JUST LOCKED.</span></StoryText>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1420, textAlign: "center", fontFamily: "WCM", fontWeight: 800, fontSize: 44, letterSpacing: 10, color: "#fff" }}>NEW SERIES · WRONG CAR · EP 1</div>
  </AbsoluteFill>;
  if (v === "2") return <AbsoluteFill style={{ background: "#000" }}>
    <AbsoluteFill style={{ transform: "scale(1.7)", transformOrigin: "56% 62%", filter: "brightness(1.35)" }}><Scene7 u={5.6} dur={10.1} /></AbsoluteFill>
    {shade}
    <StoryText top={330} size={140}>WHO TOOK<br /><span style={{ color: "#f2c46b" }}>THIS?</span></StoryText>
    <div style={{ position: "absolute", left: 0, right: 0, top: 650, textAlign: "center", fontFamily: "WCM", fontWeight: 800, fontSize: 44, letterSpacing: 8, color: "#fff" }}>WRONG CAR · EP 1</div>
  </AbsoluteFill>;
  return <AbsoluteFill style={{ background: "#000" }}>
    <AbsoluteFill style={{ transform: "scale(1.15)", transformOrigin: "55% 22%" }}><Img src={staticFile("wc/lean_last.png")} style={{ width: 1080, height: 1920 }} /><Blur r={[.8, .33, .13, .14]} px={40} /></AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 85% 18%, rgba(255,30,20,.35) 0%, rgba(255,0,0,0) 60%)", mixBlendMode: "screen" }} />
    <AbsoluteFill style={{ background: "rgba(0,0,0,.45)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 280, textAlign: "center", fontFamily: "monospace", fontWeight: 700, color: "#ff3b30", textShadow: "0 0 18px rgba(255,40,30,.8), 0 2px 6px #000" }}>
      <div style={{ fontSize: 44, letterSpacing: 6 }}>RED LIGHT</div><div style={{ fontSize: 150 }}>0:10</div></div>
    <div style={{ position: "absolute", left: 70, right: 70, top: 640, display: "flex", flexDirection: "column", gap: 30 }}>
      {([["A", "Grab the wheel", "#e8463b"], ["B", "Jump out at the light", "#2b6ef2"]] as const).map(([k, t, c]) => <div key={k} style={{ display: "flex", alignItems: "center", gap: 30, background: "rgba(10,10,14,.85)", border: "3px solid rgba(255,255,255,.85)", borderRadius: 34, padding: "34px 40px", fontFamily: "WCM" }}>
        <div style={{ width: 110, height: 110, borderRadius: 26, background: c, color: "#fff", fontWeight: 900, fontSize: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>{k}</div>
        <div style={{ fontWeight: 900, fontSize: 64, color: "#fff", lineHeight: 1.05 }}>{t}</div></div>)}
    </div>
    <StoryText top={1080} size={70}>Vote in the comments.<br /><span style={{ color: "#f2c46b" }}>EP 2 depends on you.</span></StoryText>
  </AbsoluteFill>;
};

// story 1 as a short clip (6 s): the hand on the handle, "THE DOORS" ... clunk + flash ... "JUST LOCKED."
export const WC_STORY1_LEN = 6;
export const WrongCarStory1Video: React.FC = () => {
  useWcFonts();
  const t = useCurrentFrame() / FPS, LOCK = 2.0;
  const flash = Math.max(0, 1 - Math.abs(t - LOCK - .03) / .14);
  return <AbsoluteFill style={{ background: "#000" }}>
    {/* 2026-11-18: the picture holds still (the story 1 image); only the words and the light move */}
    <AbsoluteFill style={{ opacity: fin(t, 0, .5), transform: "scale(1.45)", transformOrigin: "70% 34%" }}>
      <Img src={staticFile("wc/handle_first.png")} style={{ width: 1080, height: 1920 }} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.6) 0%, rgba(0,0,0,.05) 32%, rgba(0,0,0,.1) 55%, rgba(0,0,0,.8) 100%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,40,60,.18), rgba(60,30,0,.12))", mixBlendMode: "soft-light" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", fontFamily: "monospace", fontWeight: 700, fontSize: 64, letterSpacing: 4, color: "#ff5a3a", textShadow: "0 0 16px rgba(255,80,50,.75), 0 2px 6px #000", opacity: fin(t, .4, .3) * (t > 4.6 && Math.floor(t * 2) % 2 ? .55 : 1) }}>2:07 AM</div>
    <div style={{ position: "absolute", left: 60, right: 60, top: 430, textAlign: "center", fontFamily: "WCM", fontWeight: 900, fontSize: 128, lineHeight: 1.02, color: "#fff", textShadow: "0 6px 30px rgba(0,0,0,.95)" }}>
      <div style={{ opacity: fin(t, .9, .25), transform: `translateY(${(1 - fin(t, .9, .25)) * 20}px)` }}>THE DOORS</div>
      <div style={{ color: "#f2c46b", opacity: t >= LOCK ? 1 : 0, transform: `scale(${t >= LOCK ? 1.18 - .18 * ease(Math.min(1, (t - LOCK) / .2)) : 1})` }}>JUST LOCKED.</div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1420, textAlign: "center", fontFamily: "WCM", fontWeight: 800, fontSize: 40, letterSpacing: 6, color: "#fff", opacity: fin(t, 2.8, .4) }}>NEW SERIES · WRONG CAR · EP 1</div>
    <AbsoluteFill style={{ opacity: .08, mixBlendMode: "overlay" }}><svg width={1080} height={1920}><filter id="g1"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={Math.floor(t * 30) % 30} /></filter><rect width={1080} height={1920} filter="url(#g1)" /></svg></AbsoluteFill>
    {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash * .55 }} />}
  </AbsoluteFill>;
};
