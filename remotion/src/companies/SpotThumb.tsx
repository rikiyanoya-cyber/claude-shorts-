// THE SPOTLIGHT EFFECT thumbnails (1280x720). Rules from the marketing thumbnail study (2026-11-17):
// navy background, white characters, one accent colour, 2-3 words in white heavy caps at the top,
// the face about 1/4-1/3 of the width, nothing important bottom-right (time badge), no words shared with the title
// ("Why Nobody Noticed Your Most Embarrassing Moment (The Spotlight Effect)").
import React from "react";
import { AbsoluteFill, Img, staticFile, delayRender, continueRender } from "remotion";

const F = "MONT", GOLD = "#F2C46B";
const useFont = () => {
  const [h] = React.useState(() => delayRender("font"));
  React.useEffect(() => { new FontFace(F, `url(${staticFile("fonts/Montserrat.ttf")})`, { weight: "100 900" }).load().then((x) => { document.fonts.add(x); continueRender(h); }).catch(() => continueRender(h)); }, [h]);
};
const Navy: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 35%, #1d3270 0%, #0d1a45 50%, #050a1e 100%)", overflow: "hidden" }}>{children}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(2,4,14,.7) 100%)" }} /></AbsoluteFill>
);
const Beam: React.FC<{ x: number; w?: number; o?: number; warm?: boolean }> = ({ x, w = 360, o = .5, warm }) => (
  <svg width={1280} height={720} style={{ position: "absolute" }}><defs>
    <linearGradient id={`b${x}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={warm ? "#ffe2a0" : "#fff"} stopOpacity={o} /><stop offset="1" stopColor={warm ? "#ffe2a0" : "#fff"} stopOpacity={o * .15} /></linearGradient>
    <filter id={`f${x}`}><feGaussianBlur stdDeviation="12" /></filter></defs>
    <path d={`M${x - 50} -20 L${x + 50} -20 L${x + w / 2} 720 L${x - w / 2} 720Z`} fill={`url(#b${x})`} filter={`url(#f${x})`} /></svg>
);
const Eye: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = "#fff" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} style={{ filter: `drop-shadow(0 0 8px ${c})` }}>
    <path d="M-30 0 Q0 -22 30 0 Q0 22 -30 0Z" fill="none" stroke={c} strokeWidth={4.5} /><circle r={9} fill={c} /></g>
);
const Head: React.FC<{ x: number; y: number; s?: number; eyes?: boolean }> = ({ x, y, s = 1, eyes = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><circle r={38} fill="#060c24" /><rect x={-50} y={30} width={100} height={110} rx={44} fill="#060c24" />
    {eyes && <><circle cx={-13} cy={-4} r={6} fill="#fff" style={{ filter: "drop-shadow(0 0 6px #fff)" }} /><circle cx={13} cy={-4} r={6} fill="#fff" style={{ filter: "drop-shadow(0 0 6px #fff)" }} /></>}</g>
);
const Word: React.FC<{ children: React.ReactNode; top?: number; size?: number; left?: number; right?: number }> = ({ children, top = 34, size = 112, left = 0, right = 0 }) => (
  <div style={{ position: "absolute", left, right, top, textAlign: "center", fontFamily: F, fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: 2, color: "#fff", textShadow: "0 4px 18px rgba(0,0,0,.6), 0 0 30px rgba(255,255,255,.18)", whiteSpace: "nowrap" }}>{children}</div>
);
const Boy: React.FC<{ img: string; x: number; y: number; h: number; glow?: string }> = ({ img, x, y, h, glow = "rgba(230,238,255,.55)" }) => (
  <Img src={staticFile(`spot/${img}.png`)} style={{ position: "absolute", left: x, top: y, height: h, transform: "translateX(-50%)", filter: `drop-shadow(0 0 22px ${glow})` }} />
);

// A: one scene. He hides his face under the spotlight while a dark crowd stares at him. "EVERYONE SAW." (what it feels like)
// watchers: rim-lit silhouettes with narrow glowing eyes and heavy brows, pupils turned toward him
const Watcher: React.FC<{ x: number; y: number; s: number; look: number }> = ({ x, y, s, look }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-95 220 Q-95 95 0 88 Q95 95 95 220Z" fill="#03071a" stroke="#4f74d6" strokeWidth={3.5} strokeOpacity={.75} />
    <circle cx={0} cy={0} r={62} fill="#03071a" stroke="#4f74d6" strokeWidth={3.5} strokeOpacity={.75} />
    {[-24, 24].map((ex) => <g key={ex} transform={`translate(${ex} 2)`} style={{ filter: "drop-shadow(0 0 10px #fff) drop-shadow(0 0 4px #fff)" }}>
      <path d="M-16 0 Q0 -11 16 0 Q0 9 -16 0Z" fill="#fff" />
      <circle cx={look * 6} cy={0} r={5} fill="#03071a" />
      <line x1={-18} y1={ex < 0 ? -18 : -10} x2={16} y2={ex < 0 ? -10 : -18} stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={.9} /></g>)}
  </g>
);
const A: React.FC = () => (<Navy>
  <Beam x={640} w={620} o={.55} />
  <svg width={1280} height={720} style={{ position: "absolute" }}>
    {([[180, 300, .8, 1], [1100, 300, .8, -1], [60, 420, 1.05, 1], [1220, 420, 1.05, -1], [330, 470, 1.1, 1], [950, 470, 1.1, -1], [150, 610, 1.4, 1], [1130, 610, 1.4, -1]] as [number, number, number, number][]).map(([x, y, sc, l], i) => <Watcher key={i} x={x} y={y} s={sc} look={l} />)}
  </svg>
  <Boy img="you-cover-face" x={640} y={170} h={760} />
  <Word top={30}>EVERYONE <span style={{ color: GOLD }}>SAW.</span></Word>
</Navy>);

// B: VS split. Left (navy, "what you think"): a wall of eyes, 46%. Right (gold light, "what really happened"): a few eyes, 23%.
const B: React.FC = () => (<Navy>
  <div style={{ position: "absolute", left: 640, top: 0, width: 640, height: 720, background: "radial-gradient(ellipse at 50% 40%, rgba(242,196,107,.35) 0%, rgba(242,196,107,.08) 60%, rgba(0,0,0,0) 100%)" }} />
  <svg width={1280} height={720} style={{ position: "absolute" }}>
    <line x1={640} y1={0} x2={640} y2={720} stroke="#cfd8ea" strokeWidth={4} opacity={.6} />
    {[[70, 230], [170, 300], [80, 400], [190, 480], [70, 570], [530, 230], [600, 320], [520, 420], [610, 510], [540, 610], [180, 650], [600, 660]].map(([x, y], i) => <Eye key={i} x={x} y={y} s={.9} />)}
    {[[730, 330], [1200, 420]].map(([x, y], i) => <Eye key={i} x={x} y={y} s={.95} c={GOLD} />)}
  </svg>
  <Boy img="you-cover-face" x={345} y={240} h={560} />
  <Boy img="you-shirt-embarrassing" x={965} y={240} h={560} glow="rgba(242,196,107,.55)" />
  <Word top={40} left={0} right={640} size={130}>46%</Word>
  <Word top={40} left={640} right={0} size={130}><span style={{ color: GOLD }}>23%</span></Word>
  <div style={{ position: "absolute", left: 640, top: 200, transform: "translate(-50%,-50%)", fontFamily: F, fontWeight: 900, fontSize: 40, color: INKC, background: "#fff", borderRadius: 30, padding: "8px 18px" }}>VS</div>
</Navy>);
const INKC = "#0b1530";

// C: number. One small figure in a huge spotlight, the rest of the room dark and looking away. "ONLY 23%"
const C: React.FC = () => (<Navy>
  <Beam x={640} w={700} o={.6} warm />
  <svg width={1280} height={720} style={{ position: "absolute" }}>
    {[[150, 600], [300, 640], [980, 640], [1130, 600]].map(([x, y], i) => <Head key={i} x={x} y={y} s={1.3} eyes={false} />)}
  </svg>
  <Boy img="you-shirt-embarrassing" x={640} y={250} h={520} glow="rgba(255,226,170,.7)" />
  <Word top={34} size={124}>ONLY <span style={{ color: GOLD }}>23%</span></Word>
</Navy>);

export const SpotThumb: React.FC<{ v?: string }> = ({ v = "A" }) => { useFont(); return v === "B" ? <B /> : v === "C" ? <C /> : <A />; };
