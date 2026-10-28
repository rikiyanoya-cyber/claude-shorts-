import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { PathMap } from "./PathMap";
import { C, F, H, VW, VX, W, clamp, loadFonts, ramp } from "./theme";
import { Segment, Timeline, isOther } from "./types";

const FPS = 30;

// [file in public/whatif/sfx, start (s into the segment), volume, max length (s)]
const SFX: Partial<Record<Segment["kind"], [string, number, number, number?][]>> = {
  opening: [
    ["lib_number_counter_rise", 0.1, 0.6, 1.5],
    ["lib_cinematic_impact", 1.45, 0.8],
    ["lib_whoosh_fast", 6.2, 0.5],
    ["hit", 7.6, 0.45],
    ["hit", 8.2, 0.45],
  ],
  result: [
    ["hit", 0.35, 0.6],
    ["lib_reverse_cymbal_silence", 0.9, 0.45, 1.3],
    ["lib_cinematic_impact", 2.25, 0.6],
  ],
  rewind: [["static", 0, 0.3, 1.2]],
  title: [
    ["lib_cinematic_impact", 0.1, 0.8],
    ["lib_whoosh_fast", 0.55, 0.35],
  ],
  ending: [
    ["lib_heartbeat_slow", 0, 0.5, 3.2],
    ["hit", 1.1, 0.5],
  ],
  back: [["lib_whoosh_fast", 0.05, 0.6]],
  outro: [["lib_cinematic_impact", 0.3, 0.5]],
};

export const WhatIfLong: React.FC<{ timeline: Timeline }> = ({ timeline }) => {
  loadFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const segs = timeline.segments;
  const cur = segs.find((s) => frame >= s.from && frame < s.from + s.frames) ?? segs[segs.length - 1];
  const lt = (frame - cur.from) / FPS; // local seconds within the segment
  const mode: "real" | "other" = isOther(cur.kind) ? "other" : "real";
  const n = timeline.choices.length;
  const row = cur.n ?? 0;

  // map progress
  let reached = 0;
  let explored = 0;
  for (const s of segs) {
    if (s.from > frame) break;
    if (s.kind === "part") reached = Math.max(reached, s.n!);
    if (s.kind === "ending" && frame >= s.from + s.frames - 1) explored = Math.max(explored, s.n!);
  }
  if (cur.kind === "ending") explored = Math.max(explored, row);
  const openingReveal = cur.kind === "opening" ? ramp(lt, 6.2, 9.5) : 1;
  const panelsOn = cur.kind === "opening" ? ramp(lt, 6.0, 6.8) : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <Backdrop mode={mode} t={t} />

      {/* centre column: one sequence per segment */}
      {segs.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.frames} layout="none">
          <Centre seg={s} timeline={timeline} />
        </Sequence>
      ))}

      {/* transition sound effects */}
      {segs.map((s, i) =>
        (SFX[s.kind] ?? []).map(([file, at, vol, len], j) => (
          <Sequence key={`sfx${i}-${j}`} from={s.from + Math.round(at * FPS)} durationInFrames={Math.round((len ?? 3) * FPS)} layout="none">
            <Audio src={staticFile(`whatif/sfx/${file}.m4a`)} volume={vol} />
          </Sequence>
        )),
      )}

      {/* side panels */}
      <div style={{ position: "absolute", inset: 0, opacity: panelsOn }}>
        <PathMap
          choices={timeline.choices}
          reached={cur.kind === "outro" ? n : reached}
          explored={cur.kind === "outro" ? n : explored}
          current={cur.kind === "outro" || cur.kind === "opening" ? 0 : row}
          mode={mode}
          t={t}
          reveal={openingReveal}
          showAll={cur.kind === "outro"}
        />
        {cur.kind !== "opening" && cur.kind !== "outro" ? <RightPanel seg={cur} lt={lt} timeline={timeline} mode={mode} t={t} /> : null}
        <div style={{ position: "absolute", left: 60, bottom: 34, fontFamily: F.bold, fontSize: 20, color: "#5d6475", letterSpacing: 1 }}>
          This story is fiction.
        </div>
      </div>

      {/* frame around the episode */}
      <div
        style={{
          position: "absolute",
          left: VX - 3,
          top: 0,
          width: VW + 6,
          height: H,
          boxShadow: mode === "other" ? `0 0 0 3px ${C.red}, 0 0 80px rgba(255,74,58,.35)` : `0 0 0 2px ${C.line}, 0 0 60px rgba(0,0,0,.8)`,
          pointerEvents: "none",
          opacity: cur.kind === "opening" ? 0 : 1,
        }}
      />
      <Grain frame={frame} amount={mode === "other" ? 0.1 : 0.05} />
      <CutFlash segs={segs} frame={frame} />
    </AbsoluteFill>
  );
};

/* ---------- background ---------- */
const Backdrop: React.FC<{ mode: "real" | "other"; t: number }> = ({ mode }) => (
  <AbsoluteFill
    style={{
      background:
        mode === "other"
          ? "radial-gradient(ellipse at 50% 45%, #2a0b0a 0%, #12060a 45%, #07080c 80%)"
          : "radial-gradient(ellipse at 50% 45%, #141a28 0%, #0a0c12 50%, #07080c 85%)",
    }}
  />
);

const Grain: React.FC<{ frame: number; amount: number }> = ({ frame, amount }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: amount, pointerEvents: "none" }}>
    <filter id="wig">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 40} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={W} height={H} filter="url(#wig)" />
  </svg>
);

// short white flash on hard cuts into a part or into the other path
const CutFlash: React.FC<{ segs: Segment[]; frame: number }> = ({ segs, frame }) => {
  const s = segs.find((x) => (x.kind === "part" || x.kind === "title" || x.kind === "other") && frame >= x.from && frame < x.from + 4);
  if (!s) return null;
  return <div style={{ position: "absolute", left: VX, top: 0, width: VW, height: H, backgroundColor: "#fff", opacity: 0.4 * (1 - (frame - s.from) / 4), pointerEvents: "none" }} />;
};

/* ---------- centre column ---------- */
const Col: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", left: VX, top: 0, width: VW, height: H, overflow: "hidden", ...style }}>{children}</div>
);

const Centre: React.FC<{ seg: Segment; timeline: Timeline }> = ({ seg, timeline }) => {
  const f = useCurrentFrame();
  const lt = f / FPS;
  const ch = seg.n ? timeline.choices[seg.n - 1] : undefined;
  switch (seg.kind) {
    case "opening":
      return <Opening lt={lt} seg={seg} />;
    case "part":
      return (
        <Col>
          <OffthreadVideo src={staticFile(seg.src!)} style={{ width: VW, height: H }} />
        </Col>
      );
    case "result":
      return <Result lt={lt} img={seg.img!} ch={ch!} />;
    case "rewind":
      return <Rewind lt={lt} src={seg.src!} f={f} />;
    case "title":
      return <OtherTitle lt={lt} n={seg.n!} ch={ch!} total={timeline.choices.length} />;
    case "other":
      return seg.src ? (
        <Col>
          <OffthreadVideo src={staticFile(seg.src)} style={{ width: VW, height: H, filter: "sepia(.35) saturate(1.15) hue-rotate(-12deg) contrast(1.05)" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(60,0,0,.55) 100%)" }} />
        </Col>
      ) : (
        <Col style={{ background: "#120708" }}>
          <Center y={500} size={40} color={C.red} font={F.black}>THE OTHER PATH {seg.n}</Center>
          <Center y={560} size={30} color="#ffb0a6" font={F.bold}>{ch!.a}</Center>
          <Center y={640} size={22} color={C.sub} font={F.bold}>(scene pending voice)</Center>
        </Col>
      );
    case "ending":
      return <Ending lt={lt} text={timeline.endings[seg.n! - 1]} />;
    case "back":
      return <Back lt={lt} />;
    case "outro":
      return <Outro lt={lt} />;
  }
};

const Center: React.FC<{ y: number; size: number; color: string; font: string; children: React.ReactNode; spacing?: number; style?: React.CSSProperties }> = ({
  y,
  size,
  color,
  font,
  children,
  spacing = 0,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: y - size,
      textAlign: "center",
      fontFamily: font,
      fontSize: size,
      color,
      letterSpacing: spacing,
      lineHeight: 1.15,
      textShadow: "0 4px 18px rgba(0,0,0,.8)",
      ...style,
    }}
  >
    {children}
  </div>
);

const pop = (lt: number, a: number, d = 0.18) => {
  const k = ramp(lt, a, a + d);
  return { opacity: k, transform: `scale(${1 + 0.22 * (1 - k)})` };
};

/* OPENING: number jumps -> the premise -> how to watch -> the map draws */
const Opening: React.FC<{ lt: number; seg: Segment }> = ({ lt, seg }) => {
  const k = clamp((lt - 0.15) / 1.3);
  const val = Math.round(312 + (2400312 - 312) * (k < 1 ? Math.pow(k, 3) : 1));
  const fade = 1 - ramp(lt, 5.6, 6.2);
  return (
    <AbsoluteFill>
      {seg.voice ? <Audio src={staticFile(seg.voice)} /> : null}
      <div style={{ position: "absolute", inset: 0, opacity: fade }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: F.bold, fontSize: 30, color: C.sub, letterSpacing: 8 }}>
          YOUR BALANCE
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 300,
            textAlign: "center",
            fontFamily: F.mono,
            fontSize: 190,
            color: lt > 1.45 ? C.gold : "#fff",
            transform: `scale(${lt > 1.45 ? 1 + 0.08 * (1 - ramp(lt, 1.45, 1.8)) : 1})`,
          }}
        >
          ${val.toLocaleString("en-US")}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", ...pop(lt, 1.7) }}>
          <span style={{ fontFamily: F.black, fontSize: 64, color: "#fff" }}>$2.4M hit your account. </span>
          <span style={{ fontFamily: F.black, fontSize: 64, color: C.red }}>By mistake.</span>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 720, textAlign: "center", fontFamily: F.bold, fontSize: 40, color: "#cfd3dc", ...pop(lt, 3.3) }}>
          At every choice, thousands voted.
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 780, textAlign: "center", fontFamily: F.bold, fontSize: 40, color: "#cfd3dc", ...pop(lt, 4.3) }}>
          This is what they chose. <span style={{ color: C.red }}>And what they didn&apos;t.</span>
        </div>
      </div>
      {/* title over the column once the map draws */}
      <div style={{ position: "absolute", left: VX, width: VW, top: 0, height: H, opacity: ramp(lt, 6.4, 7.0) * (1 - ramp(lt, seg.frames / FPS - 0.4, seg.frames / FPS)) }}>
        <Center y={420} size={30} color={C.sub} font={F.bold} spacing={8}>YOUR VOTE, YOUR LIFE</Center>
        <Center y={520} size={64} color={C.gold} font={F.black}>THE WRONG</Center>
        <Center y={590} size={64} color={C.gold} font={F.black}>TRANSFER</Center>
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", ...pop(lt, 7.6) }}>
          <span style={{ fontFamily: F.black, fontSize: 46, color: "#fff" }}>EVERY CHOICE.</span>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", ...pop(lt, 8.2) }}>
          <span style={{ fontFamily: F.black, fontSize: 46, color: C.red }}>EVERY ENDING.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* RESULT: freeze on the choice, the vote lands on B, then "what if A?" */
const Result: React.FC<{ lt: number; img: string; ch: { a: string; b: string } }> = ({ lt, img, ch }) => {
  const dim = 0.72 + 0.15 * ramp(lt, 1.7, 2.1);
  const stamp = ramp(lt, 0.35, 0.5);
  const whatIf = ramp(lt, 1.8, 2.0);
  return (
    <Col>
      <Img src={staticFile(img)} style={{ width: VW, height: H, transform: `scale(${1.06 + 0.03 * lt})`, filter: "blur(10px)" }} />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: dim }} />
      <div style={{ opacity: 1 - whatIf }}>
        <Center y={330} size={34} color={C.sub} font={F.bold} spacing={6} style={pop(lt, 0.05)}>
          MOST OF YOU CHOSE
        </Center>
        <div
          style={{
            position: "absolute",
            left: 104,
            top: 380,
            width: 400,
            height: 260,
            borderRadius: 26,
            border: `6px solid ${C.blue}`,
            background: "#0e1a2e",
            opacity: stamp,
            transform: `scale(${1 + 0.5 * (1 - stamp)}) rotate(${-3 * (1 - stamp)}deg)`,
          }}
        >
          <Center y={150} size={130} color={C.blue} font={F.black}>B</Center>
          <Center y={220} size={38} color="#fff" font={F.bold}>{ch.b}</Center>
        </div>
      </div>
      <div style={{ opacity: whatIf }}>
        <Center y={430} size={56} color="#fff" font={F.black} style={pop(lt, 1.8)}>But what if</Center>
        <Center y={510} size={56} color="#fff" font={F.black} style={pop(lt, 2.0)}>you chose</Center>
        <div
          style={{
            position: "absolute",
            left: 104,
            top: 560,
            width: 400,
            height: 210,
            borderRadius: 26,
            border: `6px solid ${C.red}`,
            background: "#2a0e0e",
            ...pop(lt, 2.25, 0.14),
          }}
        >
          <Center y={120} size={110} color={C.red} font={F.black}>A</Center>
          <Center y={178} size={36} color="#fff" font={F.bold}>{ch.a}</Center>
        </div>
      </div>
    </Col>
  );
};

/* REWIND: the episode tail runs backwards with tape noise */
const Rewind: React.FC<{ lt: number; src: string; f: number }> = ({ src, f }) => {
  const bands = [0, 1, 2].map((i) => ({ y: (random(`rb${f}-${i}`) * H) | 0, h: 6 + random(`rh${f}-${i}`) * 26 }));
  const jitter = (random(`rj${f}`) - 0.5) * 14;
  return (
    <Col>
      <div style={{ transform: `translateX(${jitter}px)` }}>
        <OffthreadVideo src={staticFile(src)} style={{ width: VW, height: H, filter: "saturate(.6) contrast(1.2) brightness(.9)" }} />
      </div>
      {bands.map((b, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: b.y, height: b.h, background: "rgba(255,255,255,.18)", mixBlendMode: "screen" }} />
      ))}
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.25) 0 2px, rgba(0,0,0,0) 2px 4px)" }} />
      <div style={{ position: "absolute", left: 36, top: 40, fontFamily: F.mono, fontSize: 44, color: "#fff", textShadow: "2px 0 #ff4a3a, -2px 0 #4aa0ff" }}>◀◀ REWIND</div>
    </Col>
  );
};

/* THE OTHER PATH title card */
const OtherTitle: React.FC<{ lt: number; n: number; ch: { a: string; b: string }; total: number }> = ({ lt, n, ch, total }) => {
  const g = lt < 0.25 ? 1 : 0;
  return (
    <Col style={{ background: "#0e0507" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(255,74,58,.25), rgba(0,0,0,0) 65%)" }} />
      <Center y={380} size={26} color="#ffb0a6" font={F.bold} spacing={8} style={pop(lt, 0.05)}>
        CHOICE {n} OF {total}
      </Center>
      <div style={{ position: "absolute", left: 0, right: 0, top: 410, textAlign: "center", ...pop(lt, 0.1, 0.12) }}>
        <div style={{ fontFamily: F.black, fontSize: 92, color: "#fff", lineHeight: 1, textShadow: g ? "6px 0 #ff4a3a, -6px 0 #4aa0ff" : "0 6px 30px rgba(255,74,58,.6)" }}>
          THE OTHER
        </div>
        <div style={{ fontFamily: F.black, fontSize: 120, color: C.red, lineHeight: 1.05, textShadow: g ? "-6px 0 #fff" : "none" }}>PATH</div>
      </div>
      <div style={{ position: "absolute", left: 64, right: 64, top: 690, height: 4, background: C.red, transform: `scaleX(${ramp(lt, 0.3, 0.7)})` }} />
      <Center y={770} size={44} color="#fff" font={F.bold} style={pop(lt, 0.6)}>
        <span style={{ color: C.red, fontFamily: F.black }}>A</span> · {ch.a}
      </Center>
    </Col>
  );
};

/* ENDING card for an other path */
const Ending: React.FC<{ lt: number; text: string }> = ({ lt, text }) => {
  const [l1, l2] = text.split("|");
  const size = (l: string) => (l.length > 20 ? 50 : l.length > 13 ? 58 : 72);
  return (
    <Col style={{ background: "#050304" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(120,10,10,.35), rgba(0,0,0,0) 70%)", opacity: ramp(lt, 0, 0.6) }} />
      <div style={{ position: "absolute", left: 40, right: 40, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 26, textAlign: "center" }}>
        <div style={{ fontFamily: F.bold, fontSize: 28, color: C.red, letterSpacing: 10, ...pop(lt, 0.1) }}>ENDING</div>
        <div style={{ fontFamily: F.black, fontSize: size(l1), color: "#fff", lineHeight: 1.1, ...pop(lt, 0.4) }}>{l1}</div>
        <div style={{ fontFamily: F.black, fontSize: size(l2), color: C.red, lineHeight: 1.1, ...pop(lt, 1.1) }}>{l2}</div>
        <div style={{ fontFamily: F.bold, fontSize: 26, color: C.sub, letterSpacing: 4, marginTop: 40, opacity: ramp(lt, 1.9, 2.3) }}>THIS PATH ENDS HERE.</div>
      </div>
    </Col>
  );
};

/* BACK to the real story: fast-forward wipe in gold */
const Back: React.FC<{ lt: number }> = ({ lt }) => {
  const sweep = ramp(lt, 0.05, 0.55);
  return (
    <Col style={{ background: "#07080c" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${sweep * 100}%`, background: "linear-gradient(90deg, rgba(242,201,76,0), rgba(242,201,76,.18))" }} />
      <div style={{ position: "absolute", left: 36, top: 40, fontFamily: F.mono, fontSize: 44, color: C.gold, opacity: Math.floor(lt * 6) % 2 ? 1 : 0.5 }}>▶▶</div>
      <Center y={520} size={40} color={C.sub} font={F.bold} spacing={4} style={pop(lt, 0.2)}>
        Back to
      </Center>
      <Center y={600} size={64} color={C.gold} font={F.black} style={pop(lt, 0.4)}>
        the real story.
      </Center>
    </Col>
  );
};

/* OUTRO */
const Outro: React.FC<{ lt: number }> = ({ lt }) => (
  <Col style={{ background: "#07080c" }}>
    <Center y={400} size={60} color="#fff" font={F.black} style={pop(lt, 0.3)}>
      The story
    </Center>
    <Center y={470} size={60} color="#fff" font={F.black} style={pop(lt, 0.6)}>
      isn&apos;t over.
    </Center>
    <Center y={600} size={34} color="#cfd3dc" font={F.bold} style={pop(lt, 1.6)}>
      The next choice
    </Center>
    <Center y={646} size={34} color="#cfd3dc" font={F.bold} style={pop(lt, 1.8)}>
      is on Instagram
    </Center>
    <Center y={720} size={40} color={C.gold} font={F.black} style={pop(lt, 2.4)}>
      @yourvotelife
    </Center>
  </Col>
);

/* ---------- right panel ---------- */
const RightPanel: React.FC<{ seg: Segment; lt: number; timeline: Timeline; mode: "real" | "other"; t: number }> = ({ seg, timeline, mode }) => {
  const n = seg.n ?? 1;
  const total = timeline.choices.length;
  const partSeg = timeline.segments.find((s) => s.kind === "part" && s.n === n);
  const chapter = partSeg?.chapter ?? "";
  const X = VX + VW + 60;
  const other = mode === "other";
  return (
    <div style={{ position: "absolute", left: X, top: 0, width: W - X - 60, height: H }}>
      <div style={{ position: "absolute", top: 70, fontFamily: F.bold, fontSize: 20, color: C.sub, letterSpacing: 6 }}>THE WRONG TRANSFER</div>
      <div style={{ position: "absolute", top: 104, width: 60, height: 4, background: other ? C.red : C.gold }} />
      <div style={{ position: "absolute", top: 180, fontFamily: F.bold, fontSize: 26, color: other ? "#ffb0a6" : C.gold, letterSpacing: 6 }}>
        CHOICE {n} OF {total}
      </div>
      <div style={{ position: "absolute", top: 220, fontFamily: F.black, fontSize: 64, color: "#fff", lineHeight: 1.05, width: 520 }}>
        {other ? timeline.choices[n - 1].a : chapter}
      </div>
      <div
        style={{
          position: "absolute",
          top: 400,
          padding: "12px 24px",
          borderRadius: 40,
          border: `3px solid ${other ? C.red : C.gold}`,
          background: other ? "rgba(90,15,11,.6)" : "rgba(242,201,76,.08)",
          fontFamily: F.black,
          fontSize: 26,
          letterSpacing: 4,
          color: other ? "#fff" : C.gold,
        }}
      >
        {other ? "THE OTHER PATH" : "THE REAL STORY"}
      </div>
      {other ? (
        <div style={{ position: "absolute", top: 500, width: 520 }}>
          <div style={{ fontFamily: F.black, fontSize: 40, color: "#fff" }}>Not canon.</div>
          <div style={{ fontFamily: F.bold, fontSize: 30, color: "#cfd3dc", marginTop: 10, lineHeight: 1.3 }}>The vote decided the real story.</div>
        </div>
      ) : (
        <div style={{ position: "absolute", top: 500, width: 520, fontFamily: F.bold, fontSize: 28, color: "#8f96a3", lineHeight: 1.35 }}>
          This is the path the audience voted for.
        </div>
      )}
      {/* progress dots */}
      <div style={{ position: "absolute", bottom: 80, display: "flex", gap: 16 }}>
        {timeline.choices.map((_, i) => (
          <div
            key={i}
            style={{
              width: 44,
              height: 8,
              borderRadius: 4,
              background: i + 1 < n ? C.goldDim : i + 1 === n ? (other ? C.red : C.gold) : C.line,
            }}
          />
        ))}
      </div>
    </div>
  );
};
