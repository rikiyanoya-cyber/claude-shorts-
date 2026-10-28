import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, random, staticFile, useCurrentFrame } from "remotion";
import { PathMap } from "./PathMap";
import { C, F, H, VW, VX, W, clamp, loadFonts, ramp } from "./theme";
import { Choice, Segment, Timeline, isAlt } from "./types";

const FPS = 30;

// [file in public/whatif/sfx, start (s into the segment), volume, max length (s)]
const SFX: Partial<Record<Segment["kind"], [string, number, number, number?][]>> = {
  ff: [
    ["lib_whoosh_fast", 0.0, 0.5],
    ["static", 0.1, 0.12, 18],
  ],
  bridge: [["lib_cinematic_impact", 0.05, 0.45]],
  rewind: [
    ["lib_reverse_cymbal_silence", 0.0, 0.6, 3],
    ["static", 0.0, 0.25, 3],
  ],
  title: [
    ["lib_cinematic_impact", 0.15, 0.8],
    ["lib_whoosh_fast", 0.7, 0.35],
  ],
  eptitle: [["lib_whoosh_fast", 0.0, 0.5]],
  awins: [
    ["hit", 0.3, 0.6],
    ["lib_cinematic_impact", 1.0, 0.55],
  ],
  outro: [["lib_cinematic_impact", 0.3, 0.5]],
};

export const AnotherStory: React.FC<{ timeline: Timeline }> = ({ timeline }) => {
  loadFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const segs = timeline.segments;
  const cur = segs.find((s) => frame >= s.from && frame < s.from + s.frames) ?? segs[segs.length - 1];
  const lt = (frame - cur.from) / FPS;
  const u = (frame - cur.from) / cur.frames; // 0..1 through the segment
  const alt = isAlt(cur.kind);
  const nReal = timeline.realChoices.length;

  // path map state
  let rows = timeline.realChoices;
  let lit: "A" | "B" = "B";
  let reached = 0;
  let current = 0;
  let mapTitle = "THE STORY YOU VOTED FOR";
  if (cur.kind === "ff") {
    reached = clamp(u * 1.02) * nReal;
    current = Math.min(nReal, Math.floor(reached) + 1);
  } else if (cur.kind === "bridge") {
    reached = nReal;
  } else if (cur.kind === "rewind") {
    reached = (1 - u) * nReal;
  } else {
    rows = timeline.altChoices;
    lit = "A";
    mapTitle = "ANOTHER STORY";
    const n = cur.n ?? 0;
    reached = cur.kind === "title" ? 0 : cur.kind === "outro" ? rows.length : cur.kind === "awins" ? n - 1 + ramp(lt, 0.3, 1.0) : n - 1;
    current = cur.kind === "outro" || cur.kind === "title" ? 0 : n;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: alt
            ? "radial-gradient(ellipse at 50% 45%, #2a0b0a 0%, #12060a 45%, #07080c 80%)"
            : "radial-gradient(ellipse at 50% 45%, #141a28 0%, #0a0c12 50%, #07080c 85%)",
        }}
      />
      {segs.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.frames} layout="none">
          <Centre seg={s} timeline={timeline} />
        </Sequence>
      ))}
      {segs.map((s, i) =>
        (SFX[s.kind] ?? []).map(([file, at, vol, len], j) => (
          <Sequence key={`sfx${i}-${j}`} from={s.from + Math.round(at * FPS)} durationInFrames={Math.round((len ?? 3) * FPS)} layout="none">
            <Audio src={staticFile(`whatif/sfx/${file}.m4a`)} volume={vol} />
          </Sequence>
        )),
      )}

      <PathMap rows={rows} lit={lit} reached={reached} current={current} t={t} title={mapTitle} />
      <RightPanel seg={cur} timeline={timeline} alt={alt} u={u} />
      <div style={{ position: "absolute", left: 60, bottom: 34, fontFamily: F.bold, fontSize: 20, color: "#5d6475" }}>This story is fiction.</div>

      <div
        style={{
          position: "absolute",
          left: VX - 3,
          top: 0,
          width: VW + 6,
          height: H,
          boxShadow: alt ? `0 0 0 3px ${C.red}, 0 0 80px rgba(255,74,58,.35)` : `0 0 0 2px ${C.line}, 0 0 60px rgba(0,0,0,.8)`,
          pointerEvents: "none",
        }}
      />
      <Grain frame={frame} amount={alt ? 0.08 : 0.05} />
      <CutFlash segs={segs} frame={frame} />
    </AbsoluteFill>
  );
};

const Grain: React.FC<{ frame: number; amount: number }> = ({ frame, amount }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: amount, pointerEvents: "none" }}>
    <filter id="asg">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 40} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={W} height={H} filter="url(#asg)" />
  </svg>
);

const CutFlash: React.FC<{ segs: Segment[]; frame: number }> = ({ segs, frame }) => {
  const s = segs.find((x) => (x.kind === "ep" || x.kind === "title" || x.kind === "eptitle") && frame >= x.from && frame < x.from + 4);
  if (!s) return null;
  return <div style={{ position: "absolute", left: VX, top: 0, width: VW, height: H, backgroundColor: "#fff", opacity: 0.4 * (1 - (frame - s.from) / 4) }} />;
};

/* ---------- centre column ---------- */
const Col: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", left: VX, top: 0, width: VW, height: H, overflow: "hidden", ...style }}>{children}</div>
);

const Line: React.FC<{ y: number; size: number; color: string; font?: string; spacing?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  y,
  size,
  color,
  font = F.black,
  spacing = 0,
  style,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: 24,
      right: 24,
      top: y - size,
      textAlign: "center",
      fontFamily: font,
      fontSize: size,
      color,
      letterSpacing: spacing,
      lineHeight: 1.15,
      textShadow: "0 4px 18px rgba(0,0,0,.85)",
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

const Card: React.FC<{ L: "A" | "B"; text: string; y: number; style?: React.CSSProperties }> = ({ L, text, y, style }) => (
  <div
    style={{
      position: "absolute",
      left: 84,
      top: y,
      width: 440,
      height: 220,
      borderRadius: 26,
      border: `6px solid ${L === "A" ? C.red : C.blue}`,
      background: L === "A" ? "#2a0e0e" : "#0e1a2e",
      ...style,
    }}
  >
    <Line y={130} size={116} color={L === "A" ? C.red : C.blue}>
      {L}
    </Line>
    <Line y={190} size={36} color="#fff" font={F.bold}>
      {text}
    </Line>
  </div>
);

const Centre: React.FC<{ seg: Segment; timeline: Timeline }> = ({ seg, timeline }) => {
  const f = useCurrentFrame();
  const lt = f / FPS;
  const end = seg.frames / FPS;
  switch (seg.kind) {
    case "ff":
      return (
        <Col>
          <OffthreadVideo src={staticFile(seg.src!)} muted style={{ width: VW, height: H }} />
          <Tape label="▶▶ ×24" f={f} color="#fff" />
        </Col>
      );
    case "bridge":
      return (
        <Col>
          {seg.voice ? <Audio src={staticFile(seg.voice)} /> : null}
          <Img src={staticFile(seg.img!)} style={{ width: VW, height: H, filter: "blur(6px)", transform: "scale(1.05)" }} />
          <AbsoluteFill style={{ backgroundColor: "#000", opacity: 0.72 }} />
          <Line y={420} size={46} color="#fff" style={pop(lt, 0.15)}>
            This is the story
          </Line>
          <Line y={480} size={46} color="#fff" style={pop(lt, 0.35)}>
            you voted for.
          </Line>
          <Line y={640} size={56} color="#fff" style={pop(lt, 2.0)}>
            But what if
          </Line>
          <Line y={760} size={110} color={C.red} style={pop(lt, 2.6, 0.12)}>
            A
          </Line>
          <Line y={830} size={56} color="#fff" style={pop(lt, 2.8)}>
            had won?
          </Line>
          <Line y={940} size={60} color={C.red} style={pop(lt, 3.9)}>
            Every time.
          </Line>
        </Col>
      );
    case "rewind":
      return (
        <Col>
          <OffthreadVideo src={staticFile(seg.src!)} muted style={{ width: VW, height: H, filter: "saturate(.6) contrast(1.2)" }} />
          <Tape label="◀◀ REWIND" f={f} color="#fff" bands />
        </Col>
      );
    case "title":
      return (
        <Col style={{ background: "#0e0507" }}>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(255,74,58,.28), rgba(0,0,0,0) 65%)" }} />
          <Line y={360} size={26} color="#ffb0a6" font={F.bold} spacing={8} style={pop(lt, 0.1)}>
            THE WRONG TRANSFER
          </Line>
          <Line y={480} size={98} color="#fff" style={{ ...pop(lt, 0.15, 0.12), textShadow: lt < 0.4 ? "6px 0 #ff4a3a, -6px 0 #4aa0ff" : "0 6px 30px rgba(255,74,58,.6)" }}>
            ANOTHER
          </Line>
          <Line y={590} size={112} color={C.red} style={pop(lt, 0.3, 0.12)}>
            STORY
          </Line>
          <div style={{ position: "absolute", left: 64, right: 64, top: 640, height: 4, background: C.red, transform: `scaleX(${ramp(lt, 0.5, 0.9)})` }} />
          <Line y={730} size={36} color="#fff" font={F.bold} style={pop(lt, 0.9)}>
            The world where
          </Line>
          <Line y={780} size={36} color="#fff" font={F.bold} style={pop(lt, 1.1)}>
            <span style={{ color: C.red, fontFamily: F.black }}>A</span> always wins.
          </Line>
        </Col>
      );
    case "eptitle":
      return (
        <Col style={{ background: "#0e0507" }}>
          <Line y={430} size={28} color="#ffb0a6" font={F.bold} spacing={8} style={pop(lt, 0.05)}>
            ANOTHER STORY {seg.n}
          </Line>
          <Line y={540} size={76} color="#fff" style={pop(lt, 0.15)}>
            {(seg.title ?? "").toUpperCase()}
          </Line>
        </Col>
      );
    case "ep":
      return (
        <Col>
          {seg.src ? (
            <OffthreadVideo src={staticFile(seg.src)} style={{ width: VW, height: H }} />
          ) : (
            <div style={{ position: "absolute", inset: 0, background: "#120708" }}>
              <Line y={520} size={34} color={C.red}>
                ANOTHER STORY {seg.n}
              </Line>
              <Line y={580} size={26} color={C.sub} font={F.bold}>
                (rendering)
              </Line>
            </div>
          )}
        </Col>
      );
    case "awins": {
      const ch: Choice = timeline.altChoices[(seg.n ?? 1) - 1];
      return (
        <Col>
          {seg.img ? <Img src={staticFile(seg.img)} style={{ width: VW, height: H, filter: "blur(8px)", transform: "scale(1.06)" }} /> : null}
          <AbsoluteFill style={{ backgroundColor: "#000", opacity: 0.78 }} />
          <Line y={380} size={40} color="#fff" font={F.bold} spacing={4} style={pop(lt, 0.05)}>
            IN THIS STORY,
          </Line>
          <Card L="A" text={ch.a} y={430} style={{ ...pop(lt, 0.3, 0.12), boxShadow: "0 0 60px rgba(255,74,58,.5)" }} />
          <Line y={780} size={84} color={C.red} style={pop(lt, 0.95, 0.12)}>
            A WINS.
          </Line>
          <div style={{ position: "absolute", inset: 0, background: "#000", opacity: ramp(lt, end - 0.25, end) }} />
        </Col>
      );
    }
    case "outro":
      return (
        <Col style={{ background: "#07080c" }}>
          <Line y={300} size={26} color="#ffb0a6" font={F.bold} spacing={6} style={pop(lt, 0.2)}>
            ANOTHER STORY
          </Line>
          <Line y={380} size={46} color="#fff" style={pop(lt, 0.4)}>
            continues after
          </Line>
          <Line y={450} size={60} color={C.red} style={pop(lt, 0.6)}>
            Part 10.
          </Line>
          <div style={{ position: "absolute", left: 120, right: 120, top: 520, height: 2, background: C.line, opacity: ramp(lt, 1.4, 1.8) }} />
          <Line y={620} size={34} color="#cfd3dc" font={F.bold} style={pop(lt, 1.8)}>
            The real story
          </Line>
          <Line y={666} size={34} color="#cfd3dc" font={F.bold} style={pop(lt, 2.0)}>
            continues on Instagram
          </Line>
          <Line y={750} size={42} color={C.gold} style={pop(lt, 2.6)}>
            @yourvotelife
          </Line>
        </Col>
      );
  }
};

const Tape: React.FC<{ label: string; f: number; color: string; bands?: boolean }> = ({ label, f, color, bands }) => (
  <>
    {bands
      ? [0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: (random(`b${f}-${i}`) * H) | 0, height: 6 + random(`h${f}-${i}`) * 24, background: "rgba(255,255,255,.18)" }} />
        ))
      : null}
    <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.22) 0 2px, rgba(0,0,0,0) 2px 4px)" }} />
    <div style={{ position: "absolute", left: 32, bottom: 60, fontFamily: F.mono, fontSize: 40, color, textShadow: "2px 0 #ff4a3a, -2px 0 #4aa0ff" }}>{label}</div>
  </>
);

/* ---------- right panel ---------- */
const RightPanel: React.FC<{ seg: Segment; timeline: Timeline; alt: boolean; u: number }> = ({ seg, timeline, alt, u }) => {
  const X = VX + VW + 60;
  const n = seg.n ?? 0;
  const total = timeline.altChoices.length;
  let kicker = "";
  let title = "";
  let tag = "";
  if (seg.kind === "ff" || seg.kind === "bridge") {
    const part = seg.kind === "ff" ? Math.min(timeline.realChoices.length, Math.floor(u * timeline.realChoices.length) + 1) : timeline.realChoices.length;
    kicker = `PART ${part} OF ${timeline.realChoices.length}`;
    title = "The story you voted for";
    tag = "THE REAL STORY";
  } else if (seg.kind === "rewind") {
    kicker = "BACK TO PART 1";
    title = "What if A had won?";
    tag = "REWIND";
  } else if (seg.kind === "title" || seg.kind === "outro") {
    kicker = "THE WRONG TRANSFER";
    title = "Another Story";
    tag = "ANOTHER STORY";
  } else {
    kicker = n === 1 ? "PART 1 · WHERE IT STARTS" : `ANOTHER STORY ${n} OF ${total}`;
    title = seg.title ?? timeline.segments.find((s) => s.kind === "ep" && s.n === n)?.title ?? "";
    tag = n === 1 && seg.kind === "ep" ? "BOTH STORIES START HERE" : "ANOTHER STORY";
  }
  const showNotCanon = alt && !(seg.kind === "ep" && n === 1);
  return (
    <div style={{ position: "absolute", left: X, top: 0, width: W - X - 50, height: H }}>
      <div style={{ position: "absolute", top: 70, fontFamily: F.bold, fontSize: 20, color: C.sub, letterSpacing: 6 }}>YOUR VOTE, YOUR LIFE</div>
      <div style={{ position: "absolute", top: 104, width: 60, height: 4, background: alt ? C.red : C.gold }} />
      <div style={{ position: "absolute", top: 180, fontFamily: F.bold, fontSize: 24, color: alt ? "#ffb0a6" : C.gold, letterSpacing: 5 }}>{kicker}</div>
      <div style={{ position: "absolute", top: 220, fontFamily: F.black, fontSize: 58, color: "#fff", lineHeight: 1.08, width: 540 }}>{title}</div>
      <div
        style={{
          position: "absolute",
          top: 420,
          padding: "12px 24px",
          borderRadius: 40,
          border: `3px solid ${alt ? C.red : C.gold}`,
          background: alt ? "rgba(90,15,11,.6)" : "rgba(242,201,76,.08)",
          fontFamily: F.black,
          fontSize: 24,
          letterSpacing: 4,
          color: alt ? "#fff" : C.gold,
        }}
      >
        {tag}
      </div>
      {showNotCanon ? (
        <div style={{ position: "absolute", top: 520, width: 520 }}>
          <div style={{ fontFamily: F.black, fontSize: 40, color: "#fff" }}>Not canon.</div>
          <div style={{ fontFamily: F.bold, fontSize: 30, color: "#cfd3dc", marginTop: 10, lineHeight: 1.3 }}>The vote decided the real story.</div>
        </div>
      ) : null}
    </div>
  );
};
