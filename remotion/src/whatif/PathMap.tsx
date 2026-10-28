import React from "react";
import { C, F } from "./theme";

// Left panel: every choice as a row with an A node and a B node.
// The lit column is the path being shown: B (blue/gold) for the voted story,
// A (red) for the alternate path.
type Props = {
  rows: { a: string; b: string }[];
  lit: "A" | "B";
  reached: number; // rows lit so far (fractional values light the next row gradually)
  current: number; // 1-based row in focus, 0 = none
  t: number;
  title: string;
};

const XA = 150;
const XB = 430;
const TOP = 210;
const STEP = 158;

export const PathMap: React.FC<Props> = ({ rows, lit, reached, current, t, title }) => {
  const n = rows.length;
  const rowY = (i: number) => TOP + i * STEP;
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  const litX = lit === "A" ? XA : XB;
  const col = lit === "A" ? C.red : C.gold;
  const full = Math.floor(reached);
  const part = reached - full;
  const spineEnd = reached <= 0 ? TOP - 80 : rowY(Math.min(n - 1, full - 1)) + (full < n ? part * STEP : 0);
  const el: React.ReactNode[] = [];
  el.push(<line key="bg" x1={litX} y1={TOP - 80} x2={litX} y2={rowY(n - 1) + 100} stroke={C.line} strokeWidth={4} strokeDasharray="6 10" />);
  el.push(<line key="sp" x1={litX} y1={TOP - 80} x2={litX} y2={Math.max(TOP - 80, spineEnd)} stroke={col} strokeWidth={6} strokeLinecap="round" />);
  el.push(<circle key="st" cx={litX} cy={TOP - 80} r={10} fill={col} />);
  rows.forEach((r, i) => {
    const y = rowY(i);
    const on = i < reached - 0.001 || (i === full && part > 0.5);
    const cur = current === i + 1;
    const node = (x: number, L: "A" | "B", label: string) => {
      const chosen = L === lit && on;
      const c = L === "A" ? C.red : C.blue;
      return (
        <g key={`${L}${i}`}>
          {chosen && cur ? <circle cx={x} cy={y} r={32 + 10 * pulse} fill="none" stroke={col} strokeWidth={3} opacity={0.25 + 0.5 * (1 - pulse)} /> : null}
          <circle cx={x} cy={y} r={chosen ? 26 : 20} fill={chosen ? (L === "A" ? C.redDeep : "#0e1a2e") : C.panel} stroke={chosen ? c : C.line} strokeWidth={4} />
          <text x={x} y={y + 10} fontFamily={F.black} fontSize={chosen ? 28 : 22} fill={chosen ? c : "#4d5466"} textAnchor="middle">
            {L}
          </text>
          <text x={x} y={y + 58} fontFamily={F.bold} fontSize={20} fill={chosen ? "#fff" : "#4d5466"} textAnchor="middle" stroke={C.bg} strokeWidth={8} paintOrder="stroke" strokeLinejoin="round">
            {label}
          </text>
        </g>
      );
    };
    el.push(<line key={`l${i}`} x1={XA + 30} y1={y} x2={XB - 30} y2={y} stroke={C.line} strokeWidth={2} opacity={0.6} />);
    el.push(node(XA, "A", r.a));
    el.push(node(XB, "B", r.b));
    el.push(
      <text key={`c${i}`} x={(XA + XB) / 2} y={y - 18} fontFamily={F.bold} fontSize={16} fill={C.sub} textAnchor="middle" letterSpacing={3}>
        CHOICE {i + 1}
      </text>,
    );
  });
  const qy = rowY(n - 1) + 120;
  el.push(
    <g key="q" opacity={reached >= n ? 1 : 0.35}>
      <circle cx={litX} cy={qy} r={22} fill={C.panel} stroke={col} strokeWidth={3} strokeDasharray="5 6" />
      <text x={litX} y={qy + 10} fontFamily={F.black} fontSize={28} fill={col} textAnchor="middle">
        ?
      </text>
    </g>,
  );
  return (
    <svg width={620} height={1080} viewBox="0 0 620 1080" style={{ position: "absolute", left: 10, top: 0 }}>
      <text x={50} y={78} fontFamily={F.bold} fontSize={20} fill={lit === "A" ? "#ffb0a6" : C.sub} letterSpacing={6}>
        {title}
      </text>
      <rect x={50} y={92} width={60} height={4} fill={col} />
      {el}
    </svg>
  );
};
