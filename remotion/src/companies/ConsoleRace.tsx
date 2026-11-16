// 企業の図鑑 Shorts: 世界ゲーム機 売上レース (1080x1920, 60 s). Bar chart race from race_consoles.json
// (cumulative units, millions, at each year end; the last row is 2026-09-30). 0-55 s race, 55-60 s hold on the final top 10.
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import D from "./race_consoles.json";
import { useFonts } from "./fonts";

const FPS = 30, RACE = 55, TOTAL = 60, F = "NSJP";
export const RACE_FRAMES = TOTAL * FPS;
const data = D as unknown as { years: number[]; keys: string[]; names: string[]; brand: Record<string, string>; launch: Record<string, number>; rows: number[][] };
const D0 = 1977.0, D1 = 2026.86;   // the race ends at the latest reports (Nintendo 2026-09-30, Sony PS5 2026-11-10)
const COL: Record<string, string> = { nin: "#E60012", sony: "#0070D1", ms: "#107C10", sega: "#1D4FB8", atari: "#B8642A" };
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
// knots per console: (launch year + 0.6, 0) then each year-end value; the 2026 row is the end of September
const KN: [number, number][][] = data.keys.map((k, j) => {
  const pts: [number, number][] = [[k === "atari-2600" ? 1976.6 : data.launch[k] + 0.6, 0]];
  data.years.forEach((y, i) => { const v = data.rows[i][j]; if (v > 0) pts.push([y === 2026 ? D1 : y + 1, v]); });
  return pts;
});
const valueAt = (j: number, d: number) => {
  const p = KN[j]; if (d <= p[0][0]) return 0;
  for (let i = 1; i < p.length; i++) if (d <= p[i][0]) { const [a, va] = p[i - 1], [b, vb] = p[i]; return va + (vb - va) * (d - a) / (b - a); }
  return p[p.length - 1][1];
};
const dateAt = (t: number) => D0 + (D1 - D0) * Math.min(1, t / RACE);
const ranks = (d: number) => data.keys.map((_, j) => [j, valueAt(j, d)] as [number, number]).filter(([, v]) => v > 0.001).sort((a, b) => b[1] - a[1]);
// final totals Sony gives as "over" (PS2 160M+, PS4, PS1, PS3, PS5 100M+) and the estimated Xbox Series
const OVER = new Set(["ps2", "ps4", "playstation", "ps3", "ps5"]), EST = new Set(["xbox-series"]);
const fmt = (v: number) => { const man = Math.round(v * 100); if (man < 10000) return `${man.toLocaleString("en-US")}万台`; const oku = Math.floor(man / 10000), r = man % 10000; return r ? `${oku}億${r.toLocaleString("en-US")}万台` : `${oku}億台`; };
// crossings for the event calls
const cross = (a: string, b: string) => { const ja = data.keys.indexOf(a), jb = data.keys.indexOf(b); for (let d = 1977; d <= D1; d += 1 / 48) if (valueAt(ja, d) > valueAt(jb, d) && valueAt(jb, d) > 0) return d; return D1; };
const tOf = (d: number) => (d - D0) / (D1 - D0) * RACE;
const PS2TOP = cross("ps2", "game-boy"), SWDS = cross("switch", "ds");
const EVENTS: [number, string][] = [
  [0.2, "1977年、Atari 2600 発売"], [tOf(1983.6), "1983年、ファミコン登場"], [tOf(1989.4), "1989年、ゲームボーイ発売"],
  [tOf(1994.95), "1994年、PlayStation 参入"], [tOf(2000.3), "2000年、PlayStation 2 発売"], [tOf(PS2TOP), `${Math.floor(PS2TOP)}年、PS2 が1位に`],
  [tOf(2017.2), "2017年、Nintendo Switch 発売"], [tOf(SWDS), `${Math.floor(SWDS)}年、Switch が DS を抜いて2位。PS2まで、あと少し`],
];
const ROW0 = 330, RH = 132, N = 10;
const ease = Easing.bezier(.45, 0, .2, 1);
const fin = (u: number, a: number, d = .3) => interpolate(u, [a, a + d], [0, 1], { ...cl, easing: ease });
const Crown: React.FC = () => (<svg width={64} height={44} viewBox="0 0 64 44" style={{ position: "absolute", left: 13, top: -30 }}>
  <path d="M4 40 L8 10 L22 24 L32 4 L42 24 L56 10 L60 40Z" fill="#F5C518" stroke="#1a1a1a" strokeWidth={3} strokeLinejoin="round" /></svg>);
export const ConsoleRace: React.FC = () => {
  useFonts();
  const f = useCurrentFrame(), t = f / FPS, d = dateAt(t);
  const now = ranks(d), top = now.slice(0, N), max = Math.max(1, now[0]?.[1] ?? 1);
  // smoothed vertical position: average of the rank slot over the last 0.35 s
  const slot = (j: number) => { let s = 0, n = 0; for (let k = 0; k < 8; k++) { const tt = Math.max(0, t - k * .03), r = ranks(dateAt(tt)).findIndex(([x]) => x === j); s += r < 0 ? N + 1 : Math.min(r, N + 1); n++; } return s / n; };
  const year = Math.floor(d), month = Math.max(1, Math.min(12, Math.floor((d - year) * 12 - 1e-6) + 1));
  const ev = [...EVENTS].reverse().find(([a]) => t >= a && t < a + 3.2 && t < RACE);
  const hold = t >= RACE;
  const show = new Set(top.map(([j]) => j));
  // keep rows that are leaving visible while they slide out
  const leaving = data.keys.map((_, j) => j).filter((j) => !show.has(j) && valueAt(j, d) > 0 && slot(j) < N - .1);
  const visible = [...top.map(([j]) => j), ...leaving];
  return (
    <AbsoluteFill style={{ background: "#16171c", fontFamily: F }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 290, background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontWeight: 900, fontSize: 62, color: "#fff", letterSpacing: 2 }}>世界で一番売れたゲーム機は？</div>
        <div style={{ fontWeight: 900, fontSize: 112, color: "#F5C518", marginTop: 6, fontVariantNumeric: "tabular-nums" }}>{year}<span style={{ fontSize: 60 }}>年</span>{String(month).padStart(2, " ")}<span style={{ fontSize: 60 }}>月</span></div>
      </div>
      {visible.map((j) => {
        const k = data.keys[j], v = valueAt(j, d), y = ROW0 + slot(j) * RH, r = now.findIndex(([x]) => x === j) + 1;
        const o = interpolate(slot(j), [N - .7, N - .1], [1, 0], cl) * (k === "atari-2600" ? 1 : fin(t, Math.max(0, tOf(KN[j][0][0])), .3));
        const w = 760 * v / max;
        return (
          <div key={k} style={{ position: "absolute", left: 24, width: 1032, top: y, height: RH - 14, opacity: o, display: "flex" }}>
            <div style={{ width: 92, background: "#0a0a0a", borderRadius: "16px 0 0 16px", color: "#fff", fontWeight: 900, fontSize: r > 9 ? 46 : 58, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>{r}{r === 1 && <Crown />}</div>
            <div style={{ flex: 1, background: "#fff", borderRadius: "0 16px 16px 0", position: "relative" }}>
              <Img src={staticFile(`race/${k}.png`)} style={{ position: "absolute", left: 10, top: 6, width: RH - 26, height: RH - 26, objectFit: "contain", borderRadius: 8 }} />
              <Img src={staticFile(`race/logo-${k}.png`)} style={{ position: "absolute", left: 136, top: 12, height: 48, maxWidth: 360, objectFit: "contain", objectPosition: "left center" }} />
              <div style={{ position: "absolute", right: 18, top: 6, fontWeight: 900, fontSize: 48, color: "#111", fontVariantNumeric: "tabular-nums" }}>{fmt(v)}{d >= D1 - .001 && OVER.has(k) ? "超" : ""}{EST.has(k) && <span style={{ fontSize: 28, color: "#777", marginLeft: 6 }}>（推定）</span>}</div>
              <div style={{ position: "absolute", left: 136, top: 74, height: 26, width: Math.max(8, w), background: COL[data.brand[k]], borderRadius: 13 }} />
            </div>
          </div>
        );
      })}
      {ev && <div style={{ position: "absolute", left: 40, right: 40, top: 1660, display: "flex", justifyContent: "center", opacity: fin(t, ev[0], .25) * interpolate(t, [ev[0] + 2.9, ev[0] + 3.2], [1, 0], cl) }}>
        <div style={{ background: "#F5C518", color: "#111", fontWeight: 900, fontSize: 50, padding: "16px 36px", borderRadius: 18, transform: `scale(${.9 + .1 * fin(t, ev[0], .25)})` }}>{ev[1]}</div></div>}
      {hold && <div style={{ position: "absolute", left: 40, right: 40, top: 1660, display: "flex", flexDirection: "column", alignItems: "center", opacity: fin(t, RACE + .2, .4) }}>
        <div style={{ background: "#E60012", color: "#fff", fontWeight: 900, fontSize: 58, padding: "18px 40px", borderRadius: 20, textAlign: "center", lineHeight: 1.25 }}>Switch、PS2まで<br />あと280万台以上</div></div>}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, textAlign: "center", color: "#9a9ca6", fontWeight: 700, fontSize: 28 }}>出荷台数ベース／一部推定値を含む（各社公式発表ほか・2026年11月時点）</div>
    </AbsoluteFill>
  );
};
