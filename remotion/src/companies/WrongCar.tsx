// Your Vote — WRONG CAR episode 1 (1080x1920). Scenes 5-7 are built in code from the stills (exact on-screen text):
// 5 the driver's dash phone (a made-up navigation screen heading out of the city, distance going UP),
// 6 your own phone (a made-up ride app: the car icon creeping toward the pin, "YOUR DRIVER IS ON THE WAY"),
// 7 the print photo of you on the seat ("TODAY 4:12 PM"), revealed by a streetlight sweeping across.
// No real app, map, taxi company or brand designs.
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, delayRender, continueRender } from "remotion";

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
