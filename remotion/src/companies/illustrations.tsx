// Flat, muted, slightly vintage illustrations (all drawn in code). No text inside the pictures.
// Characters are kept as separate components so they can be reused (thumbnail, later chapters).
import React from "react";

export const PAL = {
  paper: "#EFE6D2", paper2: "#E4D8BE", ink: "#2B2A33", red: "#B5483A", red2: "#8E3A30", mustard: "#D6A84A",
  teal: "#3F6E73", teal2: "#2F5458", navy: "#283447", navy2: "#1D2636", skin: "#E3B994", skin2: "#C99A74",
  hairDark: "#3B2E2A", hairGray: "#8A8580", white: "#F6F1E6", shirt: "#EDE7DA", suit: "#3A3F4E", sky1: "#2E3B57", sky2: "#C98B5E",
};
const P = PAL;

// ---------- people ----------
type Face = { x: number; y: number; s?: number; hair?: "slick" | "short" | "wave"; hairCol?: string; heavy?: boolean };
function Head({ x, y, s = 1, hair = "short", hairCol = P.hairDark, heavy = false }: Face) {
  const w = heavy ? 112 : 100;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M${-w * .35} 60 L${-w * .3} 120 L${w * .3} 120 L${w * .35} 60Z`} fill={P.skin2} />
      <ellipse cx={0} cy={0} rx={w * .5} ry={66} fill={P.skin} />
      <ellipse cx={-w * .5} cy={6} rx={10} ry={16} fill={P.skin2} /><ellipse cx={w * .5} cy={6} rx={10} ry={16} fill={P.skin2} />
      {hair === "slick" && <path d={`M${-w * .52} -6 Q${-w * .55} -70 0 -72 Q${w * .58} -70 ${w * .52} -8 Q${w * .4} -48 0 -50 Q${-w * .4} -48 ${-w * .52} -6Z`} fill={hairCol} />}
      {hair === "short" && <path d={`M${-w * .5} -4 Q${-w * .52} -74 0 -74 Q${w * .52} -74 ${w * .5} -4 Q${w * .46} -40 ${w * .2} -44 Q0 -30 ${-w * .2} -46 Q${-w * .46} -40 ${-w * .5} -4Z`} fill={hairCol} />}
      {hair === "wave" && <path d={`M${-w * .52} 0 Q${-w * .6} -78 0 -76 Q${w * .6} -78 ${w * .52} 0 Q${w * .5} -36 ${w * .1} -52 Q${-w * .3} -40 ${-w * .52} 0Z`} fill={hairCol} />}
      <path d={`M${-w * .28} -16 q12 -6 24 0 M${w * .04} -16 q12 -6 24 0`} stroke={P.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
      <circle cx={-w * .16} cy={2} r={5} fill={P.ink} /><circle cx={w * .16} cy={2} r={5} fill={P.ink} />
      <path d="M0 6 q-6 16 4 20" stroke={P.skin2} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M-16 40 q16 8 32 0" stroke={P.red2} strokeWidth={5} fill="none" strokeLinecap="round" />
      {heavy && <path d={`M${-w * .4} 34 q${w * .4} 34 ${w * .8} 0`} stroke={P.skin2} strokeWidth={4} fill="none" opacity={.6} />}
    </g>
  );
}
function Torso({ x, y, w = 300, col = P.shirt, tie, jacket }: { x: number; y: number; w?: number; col?: string; tie?: string; jacket?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M${-w / 2} 400 L${-w / 2} 80 Q${-w / 2} 0 ${-w / 4} -10 L${w / 4} -10 Q${w / 2} 0 ${w / 2} 80 L${w / 2} 400Z`} fill={jacket || col} />
      {jacket && <path d={`M${-w / 6} -10 L0 120 L${w / 6} -10Z`} fill={col} />}
      {jacket && <path d={`M${-w / 6} -10 L-20 150 L${-w / 3} 60Z M${w / 6} -10 L20 150 L${w / 3} 60Z`} fill={jacket} stroke="#2a2e3a" strokeWidth={3} />}
      {tie && <path d="M-12 -4 L12 -4 L18 110 L0 136 L-18 110Z" fill={tie} />}
      {!jacket && <path d={`M-40 -10 L0 30 L40 -10`} stroke={P.paper2} strokeWidth={6} fill="none" />}
    </g>
  );
}
// The McDonald brothers: two men in white shirts in front of their drive-in stand (half-body)
export const Brothers: React.FC = () => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <rect width={1920} height={1080} fill={P.teal} />
    <rect y={760} width={1920} height={320} fill={P.teal2} />
    <g opacity={.55}><rect x={260} y={420} width={1400} height={360} fill={P.paper2} /><path d="M220 420 L960 300 L1700 420Z" fill={P.red} /><rect x={360} y={520} width={1200} height={150} fill={P.navy} opacity={.6} />
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={400 + i * 195} y={540} width={160} height={110} fill={P.mustard} opacity={.45} />)}</g>
    <Torso x={720} y={720} w={330} col={P.white} />
    <Head x={720} y={560} s={1.25} hair="short" hairCol={P.hairDark} />
    <Torso x={1200} y={730} w={370} col={P.white} />
    <Head x={1200} y={560} s={1.3} hair="wave" hairCol="#5A4A40" heavy />
  </svg>
);
// Ray Kroc at 52: dark suit, grey slicked-back hair, a five-spindle milkshake mixer beside him
export const Kroc: React.FC<{ bg?: string }> = ({ bg = P.mustard }) => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <rect width={1920} height={1080} fill={bg} />
    <circle cx={960} cy={480} r={420} fill={P.paper} opacity={.35} />
    <g transform="translate(860 980) scale(1.45) translate(-860 -980)"><Torso x={860} y={720} w={380} col={P.white} tie={P.red2} jacket={P.suit} />
    <Head x={860} y={555} s={1.3} hair="slick" hairCol={P.hairGray} /></g>
    <Mixer x={1420} y={640} s={1.3} />
    <rect y={930} width={1920} height={150} fill={P.navy} />
  </svg>
);
export function Mixer({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-180} y={200} width={360} height={40} rx={10} fill={P.navy} />
      <rect x={-30} y={-140} width={60} height={350} rx={20} fill="#B9BCC2" />
      <rect x={-200} y={-200} width={400} height={80} rx={40} fill="#D3D6DB" stroke={P.ink} strokeWidth={4} />
      {[-160, -80, 0, 80, 160].map((dx) => (
        <g key={dx}><rect x={dx - 6} y={-120} width={12} height={150} fill="#9DA1A8" /><path d={`M${dx - 30} 40 L${dx + 30} 40 L${dx + 24} 180 L${dx - 24} 180Z`} fill="#E5E7EA" stroke={P.ink} strokeWidth={3} /></g>
      ))}
    </g>
  );
}
// Many cities, one kind of restaurant: a dusk street with small lit restaurants
export const Street: React.FC = () => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <defs><linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={P.sky1} /><stop offset="1" stopColor={P.sky2} /></linearGradient></defs>
    <rect width={1920} height={1080} fill="url(#dusk)" />
    {/* skylines of different cities, far */}
    <g fill={P.navy} opacity={.55}>
      <path d="M0 640 L60 640 L60 520 L120 520 L120 580 L170 580 L170 450 L190 420 L210 450 L210 640 L300 640 L300 540 L360 540 L360 640Z" />
      <path d="M420 640 L420 500 L470 470 L520 500 L520 640 L560 640 L560 380 L580 360 L600 380 L600 640Z" />
      <path d="M700 640 L700 560 Q760 480 820 560 L820 640 L880 640 L880 470 L940 470 L940 640Z" />
      <path d="M1040 640 L1040 400 L1060 300 L1080 400 L1080 640 L1150 640 L1150 520 L1230 520 L1230 640Z" />
      <path d="M1320 640 L1320 540 L1360 500 L1400 540 L1400 640 L1450 640 L1450 430 L1520 430 L1520 640Z" />
      <path d="M1600 640 L1600 520 L1700 470 L1800 520 L1800 640 L1920 640 L1920 560 L1860 560 L1860 640Z" />
    </g>
    <rect y={640} width={1920} height={440} fill={P.navy2} />
    {/* restaurants along the street */}
    {[120, 620, 1120, 1600].map((x, i) => (
      <g key={x} transform={`translate(${x} ${600 + (i % 2) * 20})`}>
        <rect x={0} y={0} width={300} height={220} fill={[P.paper2, P.shirt, P.paper, P.paper2][i]} />
        <rect x={-10} y={-26} width={320} height={40} fill={P.red} />
        <path d={`M-10 14 ${Array.from({ length: 8 }, (_, k) => `L${-10 + (k + .5) * 40} 36 L${-10 + (k + 1) * 40} 14`).join(" ")}`} fill={P.red} />
        <rect x={30} y={70} width={240} height={120} fill={P.mustard} opacity={.85} />
        {[0, 1, 2].map((k) => <rect key={k} x={50 + k * 75} y={110} width={30} height={80} rx={14} fill={P.navy} opacity={.55} />)}
      </g>
    ))}
    <rect y={860} width={1920} height={220} fill="#151b28" />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => <rect key={k} x={k * 260 + 40} y={960} width={140} height={12} fill={P.paper} opacity={.35} />)}
    {[[300, 900, P.red2], [1250, 930, P.teal]].map(([x, y, c], k) => (
      <g key={k} transform={`translate(${x} ${y})`}><rect x={-110} y={-30} width={220} height={60} rx={20} fill={c as string} /><rect x={-70} y={-62} width={140} height={40} rx={16} fill={c as string} /><circle cx={-60} cy={34} r={20} fill="#0d1018" /><circle cx={60} cy={34} r={20} fill="#0d1018" /></g>
    ))}
  </svg>
);
// The kitchen line: grill, fryers, wrapping table, a row of workers — the "system"
export const Kitchen: React.FC = () => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <rect width={1920} height={1080} fill={P.paper} />
    <rect y={0} width={1920} height={300} fill={P.paper2} />
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((k) => <rect key={k} x={k * 160} y={0} width={80} height={300} fill={P.shirt} opacity={.5} />)}
    <rect y={620} width={1920} height={60} fill="#9EA2A8" />
    <rect y={680} width={1920} height={400} fill="#7C8188" />
    {/* stations */}
    <rect x={120} y={540} width={420} height={80} fill={P.ink} /><g fill={P.red2}>{[0, 1, 2, 3, 4, 5].map((k) => <ellipse key={k} cx={170 + k * 64} cy={560} rx={26} ry={10} />)}</g>
    <rect x={680} y={480} width={300} height={140} fill="#B9BCC2" stroke={P.ink} strokeWidth={4} /><rect x={700} y={500} width={120} height={100} fill={P.mustard} /><rect x={840} y={500} width={120} height={100} fill={P.mustard} />
    <rect x={1100} y={560} width={700} height={60} fill={P.white} stroke={P.ink} strokeWidth={3} />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => <g key={k}><ellipse cx={1150 + k * 85} cy={556} rx={30} ry={10} fill={P.mustard} /><ellipse cx={1150 + k * 85} cy={548} rx={30} ry={10} fill={P.red2} /></g>)}
    {/* workers (white uniforms, paper hats) */}
    {[260, 520, 820, 1200, 1500].map((x, k) => (
      <g key={x} transform={`translate(${x} 260)`}>
        <rect x={-60} y={90} width={120} height={200} rx={30} fill={P.white} />
        <ellipse cx={0} cy={40} rx={44} ry={50} fill={P.skin} />
        <path d="M-46 10 L46 10 L36 -26 L-36 -26Z" fill={P.white} stroke={P.paper2} strokeWidth={3} />
        <circle cx={-14} cy={44} r={4} fill={P.ink} /><circle cx={14} cy={44} r={4} fill={P.ink} />
        <path d={`M-60 140 L${-110 + (k % 2) * 20} 230 M60 140 L${110 - (k % 2) * 20} 230`} stroke={P.white} strokeWidth={26} strokeLinecap="round" />
      </g>
    ))}
  </svg>
);
// The sign, with the family name in it. Letters are erased from the front, so a lone 'M' never stays on screen
export function Sign({ letters, shown }: { letters: string; shown: number }) {
  const n = letters.length;
  return (
    <svg viewBox="0 0 900 600" width={900} height={600}>
      <rect x={430} y={300} width={40} height={300} fill={P.navy} />
      <rect x={60} y={80} width={780} height={240} rx={24} fill={P.red} stroke={P.red2} strokeWidth={12} />
      <rect x={90} y={110} width={720} height={180} rx={14} fill="none" stroke={P.paper} strokeWidth={4} opacity={.6} />
      {letters.split("").map((ch, i) => (
        <text key={i} x={120 + (660 * (i + .5)) / n} y={238} textAnchor="middle" fontFamily="NSJP" fontWeight={900} fontSize={96} fill={P.paper}
          opacity={i >= n - shown ? 1 : 0}>{ch}</text>
      ))}
    </svg>
  );
}
