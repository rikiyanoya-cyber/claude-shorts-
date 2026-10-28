import React from "react";
import { C, F } from "./theme";

// Left panel: the story as a tree. The gold spine is the real (voted) story,
// red branches are THE OTHER PATH for each choice.
// state per row: 0 = not reached, 1 = reached (real path), 2 = other path explored
type Props = {
  choices: { a: string; b: string }[];
  reached: number; // how many choices have been reached (0..5)
  explored: number; // how many A branches have been fully explored
  current: number; // 1-based row in focus, 0 = none
  mode: "real" | "other";
  t: number; // seconds, for pulses
  reveal?: number; // 0..1 draw-on for the opening
  showAll?: boolean;
};

const X0 = 60;
const SPINE = 350; // x of the real-path spine
const BRANCH = 120; // x of the A nodes
const TOP = 190;
const STEP = 158;

export const PathMap: React.FC<Props> = ({ choices, reached, explored, current, mode, t, reveal = 1, showAll }) => {
  const n = choices.length;
  const rowY = (i: number) => TOP + i * STEP;
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  const el: React.ReactNode[] = [];
  // spine from start to the last reached node
  const spineEnd = showAll ? rowY(n - 1) + 90 : rowY(Math.max(0, reached - 1));
  el.push(
    <line key="spine-bg" x1={SPINE} y1={TOP - 70} x2={SPINE} y2={rowY(n - 1) + 90} stroke={C.line} strokeWidth={4} strokeDasharray="6 10" />,
  );
  if (reached > 0 || showAll)
    el.push(
      <line key="spine" x1={SPINE} y1={TOP - 70} x2={SPINE} y2={TOP - 70 + (spineEnd - TOP + 70) * reveal} stroke={C.gold} strokeWidth={6} strokeLinecap="round" />,
    );
  el.push(<circle key="start" cx={SPINE} cy={TOP - 70} r={10} fill={C.gold} opacity={reveal} />);
  choices.forEach((c, i) => {
    const y = rowY(i);
    const k = clampReveal(reveal, i, n);
    const isReached = showAll || i < reached;
    const isExplored = showAll || i < explored;
    const isCur = current === i + 1;
    const otherNow = isCur && mode === "other";
    // A branch
    const aCol = isExplored || otherNow ? C.red : C.line;
    el.push(
      <path key={`ab${i}`} d={`M${SPINE} ${y} C ${SPINE - 90} ${y}, ${BRANCH + 90} ${y + 34}, ${BRANCH} ${y + 34}`} fill="none" stroke={aCol} strokeWidth={otherNow ? 5 : 3} strokeDasharray={isExplored || otherNow ? "0" : "6 8"} opacity={k} />,
    );
    el.push(
      <g key={`a${i}`} opacity={k}>
        <circle cx={BRANCH} cy={y + 34} r={otherNow ? 22 + 6 * pulse : 20} fill={isExplored || otherNow ? C.redDeep : C.panel} stroke={aCol} strokeWidth={4} />
        <text x={BRANCH} y={y + 44} fontFamily={F.black} fontSize={26} fill={isExplored || otherNow ? "#fff" : C.sub} textAnchor="middle">A</text>
        <text x={BRANCH} y={y + 88} fontFamily={F.bold} fontSize={21} fill={isExplored || otherNow ? "#ffb0a6" : "#5d6475"} textAnchor="middle">{c.a}</text>
        {isExplored && !otherNow ? (
          <text x={BRANCH - 44} y={y + 44} fontFamily={F.black} fontSize={22} fill={C.red} textAnchor="end">✕</text>
        ) : null}
      </g>,
    );
    // B node (on the spine)
    const bOn = isReached;
    el.push(
      <g key={`b${i}`} opacity={k}>
        {isCur && mode === "real" ? <circle cx={SPINE} cy={y} r={34 + 10 * pulse} fill="none" stroke={C.gold} strokeWidth={3} opacity={0.6 * (1 - pulse) + 0.2} /> : null}
        <circle cx={SPINE} cy={y} r={24} fill={bOn ? "#0e1a2e" : C.panel} stroke={bOn ? C.blue : C.line} strokeWidth={4} />
        <text x={SPINE} y={y + 10} fontFamily={F.black} fontSize={28} fill={bOn ? C.blue : C.sub} textAnchor="middle">B</text>
        <text x={SPINE + 44} y={y - 14} fontFamily={F.bold} fontSize={18} fill={C.sub} letterSpacing={3}>CHOICE {i + 1}</text>
        <text x={SPINE + 44} y={y + 16} fontFamily={F.bold} fontSize={24} fill={bOn ? "#fff" : "#5d6475"}>{c.b}</text>
      </g>,
    );
  });
  // "?" after the last node: the next choice is still open
  const qy = rowY(n - 1) + 110;
  el.push(
    <g key="q" opacity={reveal * (showAll || reached >= n ? 1 : 0.35)}>
      <circle cx={SPINE} cy={qy} r={22} fill={C.panel} stroke={C.gold} strokeWidth={3} strokeDasharray="5 6" />
      <text x={SPINE} y={qy + 10} fontFamily={F.black} fontSize={28} fill={C.gold} textAnchor="middle">?</text>
    </g>,
  );
  return (
    <svg width={640} height={1080} viewBox="0 0 640 1080" style={{ position: "absolute", left: X0 - 40, top: 0 }}>
      <text x={60} y={78} fontFamily={F.bold} fontSize={20} fill={C.sub} letterSpacing={6}>EVERY CHOICE</text>
      <rect x={60} y={92} width={60} height={4} fill={mode === "other" ? C.red : C.gold} />
      {el}
    </svg>
  );
};

// stagger rows during the opening draw-on
const clampReveal = (r: number, i: number, n: number) => Math.max(0, Math.min(1, r * (n + 1) - i));
