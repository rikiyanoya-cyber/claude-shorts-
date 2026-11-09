// Sample reel: all 24 camera moves, 3 seconds each, on one layered test scene,
// captioned with the Japanese and English names. Used to check direction, speed and parallax.
import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, delayRender, continueRender } from "remotion";
import { MOVES, MOVE_JA, Move, cameraAt, xfCss, blurCss, CamFrame } from "./camerawork";

const W = 1920, H = 1080, CUT = 90;
const NOTE: Record<Move, string> = {
  "static shot": "動かさない。説明・会話の基本", "pan right": "横に振る（視差なし）。場所の見渡し", "tilt up": "縦に振る。見上げる、規模の提示",
  "dolly in": "カメラごと近づく（視差あり）", "zoom in": "レンズで寄る（一様に拡大、視差なし）", "dolly out": "カメラごと離れる。全体像を明かす",
  "truck right": "横に移動。手前ほど速く流れる", "pedestal up": "まっすぐ上がる。上が見えてくる", "orbit": "被写体の周りを回る。手前と奥が逆に動く",
  "tracking shot": "被写体を中央に、背景を流して並走", "handheld": "微小な揺れ。臨場感（字幕は崩さない）", "whip pan": "一瞬で横に振る＋ブラー。場面転換",
  "crane up": "上がりながら引く。つかみと締め", "aerial drone shot": "上空をゆっくり前進", "tiny planet": "街を小さな星に。冒頭フック専用",
  "360-degree orbit": "被写体の周りを一周。見せ場", "bullet time": "被写体は止まり、背景だけ回る。決め場面専用", "camera roll": "画面ごと傾ける。不安・異変",
  "dolly zoom": "被写体の大きさはそのまま、背景だけ迫る。衝撃", "rack focus": "ピントを手前から人へ送る", "crash zoom": "数フレームで一気に寄る＋微振動",
  "FPV shot": "高速で飛び抜ける。勢い", "dive": "上空から目標へ急降下", "bolt cam": "素早く弧を描いて回り込む。見せ場の導入",
};

const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 11.3) * 43758.5453; return x - Math.floor(x); };

const BG: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1d2b5a" /><stop offset="0.65" stopColor="#e98a5b" /><stop offset="1" stopColor="#f6c37a" /></linearGradient></defs>
    <rect x={-3000} y={-2000} width={7920} height={5000} fill="url(#sky)" />
    <circle cx={1300} cy={560} r={110} fill="#ffe2a6" />
    {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={-2500 + rnd(i) * 6900} cy={-1500 + rnd(i + 7) * 1700} r={1.5 + rnd(i + 3) * 2} fill="#fff" opacity={0.6} />)}
    <path d={`M-3000 760 ${Array.from({ length: 40 }, (_, i) => `L${-3000 + i * 200} ${640 + rnd(i + 40) * 120}`).join(" ")} L4920 760 L4920 3000 L-3000 3000Z`} fill="#6b4e7a" />
  </svg>
);
const MID: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
    {Array.from({ length: 70 }, (_, i) => { const x = -3200 + i * 120, h = 160 + rnd(i + 90) * 300; return (
      <g key={i}><rect x={x} y={800 - h} width={110} height={h + 400} fill="#3a2f52" />
        {Array.from({ length: Math.floor(h / 50) }, (_, r) => <rect key={r} x={x + 20 + (r % 2) * 40} y={800 - h + 20 + r * 50} width={22} height={26} fill="#ffd36a" opacity={rnd(i * 7 + r) > 0.45 ? 0.85 : 0.15} />)}</g>); })}
    <rect x={-3200} y={800} width={8400} height={2000} fill="#2c2440" />
  </svg>
);
// the subject: a person in a red jacket on a plaza (walk cycle unless held)
const Subject: React.FC<{ ph: number; tower?: boolean }> = ({ ph }) => {
  const a = Math.sin(ph) * 22, b = -a, bob = Math.abs(Math.cos(ph)) * 6;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <rect x={-4000} y={880} width={9920} height={2200} fill="#1b1726" />
      <ellipse cx={960} cy={925} rx={120} ry={18} fill="#000" opacity={0.35} />
      <g transform={`translate(960 ${910 - bob})`}>
        <g transform={`rotate(${a} 0 -170)`}><rect x={-22} y={-170} width={30} height={170} rx={14} fill="#22283a" /></g>
        <g transform={`rotate(${b} 0 -170)`}><rect x={-8} y={-170} width={30} height={170} rx={14} fill="#2b3249" /></g>
        <path d="M-60 -170 L-50 -340 Q0 -370 50 -340 L60 -170Z" fill="#e2453a" />
        <g transform={`rotate(${b * 0.8} 0 -330)`}><rect x={-72} y={-330} width={26} height={150} rx={13} fill="#c63a30" /></g>
        <g transform={`rotate(${a * 0.8} 0 -330)`}><rect x={46} y={-330} width={26} height={150} rx={13} fill="#c63a30" /></g>
        <rect x={-14} y={-380} width={28} height={30} fill="#d9a77f" /><circle cx={0} cy={-420} r={46} fill="#d9a77f" /><path d="M-48 -430 Q-40 -480 0 -478 Q44 -476 48 -426 Q30 -452 0 -454 Q-30 -452 -48 -430Z" fill="#2a1d16" />
      </g>
    </svg>
  );
};
const FG: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
    {Array.from({ length: 20 }, (_, i) => { const x = -6000 + i * 700; return (
      <g key={i}><rect x={x} y={300} width={26} height={900} fill="#0d0b14" /><rect x={x - 50} y={290} width={126} height={30} rx={10} fill="#0d0b14" /><circle cx={x + 13} cy={330} r={22} fill="#fff1c0" />
        <ellipse cx={x + 300} cy={1090} rx={180} ry={90} fill="#121a14" /></g>); })}
  </svg>
);
const Planet: React.FC<{ rot: number }> = ({ rot }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <rect width={W} height={H} fill="#1d2b5a" />
    {Array.from({ length: 80 }, (_, i) => <circle key={i} cx={rnd(i) * W} cy={rnd(i + 5) * H} r={1 + rnd(i + 2) * 2} fill="#fff" opacity={0.6} />)}
    <g transform={`translate(960 600) rotate(${rot})`}>
      {Array.from({ length: 36 }, (_, i) => { const h = 70 + rnd(i + 30) * 150; return (
        <g key={i} transform={`rotate(${i * 10})`}><rect x={-22} y={-300 - h} width={44} height={h + 20} fill="#3a2f52" />
          <rect x={-8} y={-300 - h + 16} width={16} height={18} fill="#ffd36a" opacity={0.8} /></g>); })}
      <circle r={300} fill="#2c2440" /><circle r={300} fill="none" stroke="#e98a5b" strokeWidth={6} />
      <g transform="translate(0 -300)"><rect x={-10} y={-80} width={20} height={80} fill="#e2453a" /><circle cy={-96} r={18} fill="#d9a77f" /></g>
    </g>
  </svg>
);

const Shot: React.FC<{ move: Move; index: number }> = ({ move, index }) => {
  const f = useCurrentFrame();
  const c: CamFrame = cameraAt({ move, duration_frames: CUT, intensity: 0.8, seed: index + 1 }, f, W, H);
  const ph = (c.holdSubject ? 45 : f) * 0.28;
  const layer = (k: "bg" | "mid" | "subject" | "fg", el: React.ReactNode) => (
    <AbsoluteFill style={{ transform: xfCss(c[k]), filter: blurCss(c[k].blur), transformOrigin: "50% 50%" }}>{el}</AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0b12", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: xfCss(c.frame, c.frame.persp ?? ""), filter: blurCss(c.frame.blur), transformOrigin: "50% 55%" }}>
        {c.planet !== undefined ? <Planet rot={c.planet} /> : (<>
          {layer("bg", <BG />)}{layer("mid", <MID />)}{layer("subject", <Subject ph={ph} />)}{layer("fg", <FG />)}
        </>)}
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 48, top: 40, padding: "18px 30px", borderRadius: 18, background: "rgba(8,8,14,.78)", color: "#fff", fontFamily: "NSJP" }}>
        <div style={{ fontSize: 54, lineHeight: 1.15 }}><span style={{ color: "#ffd36a", marginRight: 22 }}>{String(index + 1).padStart(2, "0")}</span>{MOVE_JA[move]}<span style={{ fontSize: 40, opacity: 0.8, marginLeft: 22 }}>{move}</span></div>
        <div style={{ fontSize: 30, opacity: 0.85, marginTop: 6 }}>{NOTE[move]}</div>
      </div>
    </AbsoluteFill>
  );
};

const useJpFont = () => {
  const [h] = React.useState(() => delayRender("font"));
  React.useEffect(() => {
    const ff = new FontFace("NSJP", `url(${staticFile("fonts/NotoSansJP-Black.ttf")})`);
    ff.load().then((x) => { document.fonts.add(x); continueRender(h); }).catch(() => continueRender(h));
  }, [h]);
};
export const CameraReel: React.FC = () => { useJpFont(); return (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {MOVES.map((m, i) => (
      <Sequence key={m} from={i * CUT} durationInFrames={CUT}><Shot move={m} index={i} /></Sequence>
    ))}
  </AbsoluteFill>
); };
export const CAMERA_REEL_FRAMES = MOVES.length * CUT;
