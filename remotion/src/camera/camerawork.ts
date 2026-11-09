// Camera-work dictionary: 24 film camera moves as per-layer transforms.
//
// A scene is drawn as four depth layers (far to near): bg, mid, subject, fg.
// cameraAt() returns, for one frame, a transform for the whole frame plus one per layer.
// Moves that differ only by parallax are kept apart on purpose:
//   - zoom in   = the frame scales uniformly (lens), no parallax
//   - dolly in  = each layer scales by its depth (camera moves), parallax
//   - pan/tilt  = all layers shift together (camera turns)
//   - truck/pedestal = layers shift by depth (camera travels)
// Every move takes durationFrames and intensity (0..1). See README_ja.md for the selection rules.

export const MOVES = [
  "static shot", "pan right", "tilt up", "dolly in", "zoom in", "dolly out",
  "truck right", "pedestal up", "orbit", "tracking shot", "handheld", "whip pan",
  "crane up", "aerial drone shot", "tiny planet", "360-degree orbit", "bullet time", "camera roll",
  "dolly zoom", "rack focus", "crash zoom", "FPV shot", "dive", "bolt cam",
] as const;
export type Move = (typeof MOVES)[number];

export const MOVE_JA: Record<Move, string> = {
  "static shot": "固定", "pan right": "パン", "tilt up": "ティルト", "dolly in": "ドリーイン", "zoom in": "ズームイン",
  "dolly out": "ドリーアウト", "truck right": "トラック", "pedestal up": "ペデスタル", "orbit": "オービット",
  "tracking shot": "トラッキング", "handheld": "手持ち", "whip pan": "ウィップパン", "crane up": "クレーンアップ",
  "aerial drone shot": "空撮", "tiny planet": "タイニープラネット", "360-degree orbit": "360°オービット",
  "bullet time": "バレットタイム", "camera roll": "ロール", "dolly zoom": "ドリーズーム", "rack focus": "ラックフォーカス",
  "crash zoom": "クラッシュズーム", "FPV shot": "FPV", "dive": "ダイブ", "bolt cam": "ボルトカム",
};

// Basic 12 (about 70% of a long video) vs showy 12 (about 30% at most).
export const BASIC: Move[] = MOVES.slice(0, 12) as unknown as Move[];
export const SHOWY: Move[] = MOVES.slice(12) as unknown as Move[];
// Once per video at most.
export const ONCE_PER_VIDEO: Move[] = ["bullet time", "dolly zoom", "tiny planet"];
// Follow these with static or a gentle move (motion sickness).
export const HARSH: Move[] = ["camera roll", "FPV shot", "crash zoom", "whip pan"];

// Other names people use for the same move (from the reference videos).
export const ALIASES: Record<string, Move> = {
  "crane shot": "crane up", "クレーンショット": "crane up", "vertigo shot": "dolly zoom", "めまいショット": "dolly zoom",
  "pan": "pan right", "tilt": "tilt up", "tracking": "tracking shot", "dolly": "dolly in", "zoom": "zoom in",
};
export const toMove = (name: string): Move => {
  const k = name.trim(); if ((MOVES as readonly string[]).includes(k)) return k as Move;
  const a = ALIASES[k] ?? ALIASES[k.toLowerCase()]; if (a) return a; throw new Error(`unknown camera move: ${name}`);
};
// One scene may combine at most two moves: the main move plus one helper ("with"),
// e.g. tracking shot + tilt up = walking alongside while looking up. Keep the helper gentle.
export const HELPER_MAX_INTENSITY = 0.5;
export type CameraSpec = { move: Move; duration_frames: number; intensity: number; target?: string; seed?: number;
  with?: { move: Move; intensity: number } };

export type Xf = { x: number; y: number; s: number; r: number; blur: number; sx?: number };
export type CamFrame = {
  frame: Xf & { persp?: string };   // applied to the whole picture (after the layers)
  bg: Xf; mid: Xf; subject: Xf; fg: Xf;
  holdSubject?: boolean;            // bullet time: the subject's own animation is frozen
  planet?: number;                  // tiny planet: rotation in degrees (scene draws the planet)
};

const I0 = (): Xf => ({ x: 0, y: 0, s: 1, r: 0, blur: 0 });
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const easeInOut = (u: number) => { u = clamp(u); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u), 3);
const easeIn = (u: number) => Math.pow(clamp(u), 3);
// seeded smooth noise in [-1, 1]
const noise = (t: number, seed: number) => {
  const a = Math.sin(t * 1.7 + seed * 12.9898) * 0.5 + Math.sin(t * 3.1 + seed * 78.233) * 0.3 + Math.sin(t * 5.3 + seed * 3.7) * 0.2;
  return a;
};

// depth factors: how strongly each layer reacts to camera travel (far = small)
const DEPTH = { bg: 0.08, mid: 0.35, subject: 0.65, fg: 1.3 } as const;
// Distances (m) used for dolly in / dolly out / zoom in, from the reference demo:
// subject at 14.0 m; DOLLY IN moves the camera to 10.4 m (lens 39 mm), ZOOM stays at 14.0 m (lens 106 mm).
export const DIST = { bg: 120, mid: 40, subject: 14.0, fg: 6.5 } as const;
export const DOLLY_TRAVEL_M = 14.0 - 10.4;
/** image scale of a layer after the camera travels `m` metres toward it (pinhole: size ~ 1/distance) */
export const dollyScale = (layer: keyof typeof DIST, m: number) => DIST[layer] / Math.max(0.5, DIST[layer] - m);
type L = keyof typeof DEPTH;
const LAYERS: L[] = ["bg", "mid", "subject", "fg"];

/** Camera state for one frame of a shot. `frame` is relative to the start of the shot. */
/** Camera state for one frame; combines the main move with an optional helper move. */
export function cameraAt(spec: CameraSpec, frame: number, W = 1920, H = 1080): CamFrame {
  const a = moveAt(spec, frame, W, H);
  if (!spec.with) return a;
  const b = moveAt({ ...spec, move: spec.with.move, intensity: Math.min(spec.with.intensity, HELPER_MAX_INTENSITY), with: undefined }, frame, W, H);
  const mix = (p: Xf, q: Xf): Xf => ({ x: p.x + q.x, y: p.y + q.y, s: p.s * q.s, r: p.r + q.r, blur: Math.max(p.blur, q.blur), sx: (p.sx ?? 1) * (q.sx ?? 1) });
  const persp = [a.frame.persp, b.frame.persp].filter(Boolean).join(" ") || undefined;
  return { frame: { ...mix(a.frame, b.frame), persp }, bg: mix(a.bg, b.bg), mid: mix(a.mid, b.mid), subject: mix(a.subject, b.subject), fg: mix(a.fg, b.fg),
    holdSubject: a.holdSubject || b.holdSubject, planet: a.planet ?? b.planet };
}
function moveAt(spec: CameraSpec, frame: number, W: number, H: number): CamFrame {
  const D = Math.max(1, spec.duration_frames), I = clamp(spec.intensity);
  const t = frame / 30, u = clamp(frame / D), e = easeInOut(u);
  const c: CamFrame = { frame: I0(), bg: I0(), mid: I0(), subject: I0(), fg: I0() };
  const each = (fn: (l: L, d: number) => Partial<Xf>) => { for (const l of LAYERS) Object.assign(c[l], fn(l, DEPTH[l])); };
  switch (spec.move) {
    case "static shot": break;
    case "pan right": c.frame.x = -0.18 * W * I * e; break;                       // camera turns: no parallax
    case "tilt up": c.frame.y = 0.25 * H * I * e; break;
    case "dolly in": each((l) => ({ s: dollyScale(l, DOLLY_TRAVEL_M * I * e) })); break;         // parallax: near grows faster
    case "zoom in": c.frame.s = dollyScale("subject", DOLLY_TRAVEL_M * I * e); break;           // lens: same subject size, no parallax
    case "dolly out": each((l) => ({ s: dollyScale(l, DOLLY_TRAVEL_M * I * (1 - e)) })); break;
    case "truck right": each((_, d) => ({ x: -0.35 * W * I * d * e })); break;
    case "pedestal up": each((_, d) => ({ y: 0.35 * H * I * d * e })); break;
    case "orbit": {                                                               // in front and behind the subject move opposite ways
      const a = (e - 0.5) * 2;
      c.fg.x = -0.3 * W * I * a; c.mid.x = 0.12 * W * I * a; c.bg.x = 0.18 * W * I * a;
      c.subject.sx = 1 - 0.12 * I * Math.abs(a); break;
    }
    case "tracking shot": {                                                       // subject stays centred, the world streams past
      const v = t * I;
      c.bg.x = -0.03 * W * v; c.mid.x = -0.12 * W * v; c.fg.x = -0.5 * W * v; break;
    }
    case "handheld": {                                                            // a few px, under a degree: captions stay readable
      c.frame.x = 6 * I * noise(t, spec.seed ?? 1); c.frame.y = 5 * I * noise(t + 9, spec.seed ?? 1); c.frame.r = 0.45 * I * noise(t + 4, spec.seed ?? 1); break;
    }
    case "whip pan": {                                                            // 8 frames, centred in the shot, motion blur
      const a = D / 2 - 4, k = clamp((frame - a) / 8), w = Math.sin(Math.PI * k);
      c.frame.x = -0.6 * W * I * easeInOut(k); c.frame.blur = 40 * I * w; break;
    }
    case "crane up": {                                                            // rise and pull back
      each((_, d) => ({ y: 0.3 * H * I * d * e, s: 1 + 0.35 * I * d * (1 - e) })); c.frame.y = -0.04 * H * I * e; break;
    }
    case "aerial drone shot": {                                                   // slow glide forward over a tilted ground
      c.frame.persp = `perspective(1400px) rotateX(${(28 * I).toFixed(2)}deg)`;
      each((_, d) => ({ s: 1 + 0.25 * I * (0.4 + d) * e, y: 0.1 * H * I * (0.4 + d) * e })); break;
    }
    case "tiny planet": c.planet = 120 * I * e; c.frame.s = lerp(1.15, 1, easeOut(u)); break;
    case "360-degree orbit": {
      const a = 2 * Math.PI * e, sn = Math.sin(a);
      c.fg.x = -0.35 * W * I * sn; c.mid.x = 0.14 * W * I * sn; c.bg.x = 0.22 * W * I * sn;
      c.subject.sx = Math.cos(a) * 0.15 * I + (1 - 0.15 * I); c.fg.blur = 4 * I * Math.abs(Math.cos(a)); break;
    }
    case "bullet time": {                                                         // subject frozen, the world swings around it
      c.holdSubject = true; const a = (e - 0.5) * 2;
      c.fg.x = -0.4 * W * I * a; c.mid.x = 0.2 * W * I * a; c.bg.x = 0.3 * W * I * a; c.bg.blur = 3 * I; c.mid.blur = 1.5 * I;
      c.frame.s = 1.05; break;
    }
    case "camera roll": c.frame.r = 8 * I * e; c.frame.s = 1 + 0.08 * I * e; break;   // scale hides the corners
    case "dolly zoom": {                                                          // subject size fixed, the background looms
      c.bg.s = 1 + 0.9 * I * e; c.mid.s = 1 + 0.45 * I * e; c.fg.s = 1 - 0.15 * I * e; break;
    }
    case "rack focus": {                                                          // focus moves from the near object to the subject
      const k = easeInOut(clamp((u - 0.3) / 0.4));
      c.fg.blur = 10 * I * k; c.subject.blur = 8 * I * (1 - k); c.mid.blur = lerp(5, 3, k) * I; c.bg.blur = 6 * I; break;
    }
    case "crash zoom": {                                                          // 5 frames in, then a decaying shake
      const a = Math.round(D * 0.35), k = clamp((frame - a) / 5), sh = frame > a + 5 ? Math.exp(-(frame - a - 5) / 6) : 0;
      c.frame.s = 1 + 0.9 * I * easeOut(k); c.frame.x = 14 * I * sh * Math.sin(frame * 2.3); c.frame.y = 10 * I * sh * Math.cos(frame * 2.9);
      c.frame.blur = 6 * I * Math.sin(Math.PI * k); break;
    }
    case "FPV shot": {                                                            // fast forward flight, speed blur, slight bank
      each((_, d) => ({ s: 1 + 2.2 * I * d * e, blur: 6 * I * d * Math.sin(Math.PI * u) }));
      c.frame.r = 4 * I * Math.sin(t * 2.4); break;
    }
    case "dive": {                                                                // accelerate down onto the target point
      const k = easeIn(u); c.frame.s = 1 + 2.6 * I * k; c.frame.y = 0.18 * H * I * k; c.frame.blur = 5 * I * k * k;
      c.frame.persp = `perspective(1400px) rotateX(${(20 * I * (1 - k)).toFixed(2)}deg)`; break;
    }
    case "bolt cam": {                                                            // fast arc around the subject, settles
      const k = easeOut(clamp(u / 0.45)), a = (k - 1);
      c.fg.x = 0.45 * W * I * a; c.mid.x = -0.18 * W * I * a; c.bg.x = -0.25 * W * I * a;
      c.frame.s = 1 + 0.25 * I * k; c.frame.blur = 10 * I * Math.sin(Math.PI * clamp(u / 0.45)); break;
    }
  }
  return c;
}

/** CSS transform for a layer (origin: frame centre). */
export const xfCss = (x: Xf, persp = "") =>
  `${persp} translate(${x.x.toFixed(1)}px, ${x.y.toFixed(1)}px) rotate(${x.r.toFixed(3)}deg) scale(${(x.s * (x.sx ?? 1)).toFixed(4)}, ${x.s.toFixed(4)})`;
export const blurCss = (b: number) => (b > 0.05 ? `blur(${b.toFixed(2)}px)` : "none");

/** Checks a whole video's camera plan against the selection rules. Returns human-readable problems (empty = OK). */
export function checkCameraPlan(scenes: { camera?: CameraSpec; captionHeavy?: boolean }[]): string[] {
  const out: string[] = [];
  const moves = scenes.map((s, i) => { if (!s.camera) out.push(`scene ${i + 1}: camera is missing`); return s.camera?.move; });
  const showy = moves.filter((m) => m && SHOWY.includes(m)).length;
  if (scenes.length && showy / scenes.length > 0.3) out.push(`showy moves are ${Math.round((100 * showy) / scenes.length)}% (max 30%)`);
  for (const m of ONCE_PER_VIDEO) { const n = moves.filter((x) => x === m).length; if (n > 1) out.push(`${m} used ${n} times (max 1)`); }
  for (let i = 2; i < moves.length; i++) if (moves[i] && moves[i] === moves[i - 1] && moves[i] === moves[i - 2]) out.push(`scenes ${i - 1}-${i + 1}: ${moves[i]} three times in a row`);
  for (let i = 1; i < moves.length; i++) {
    const p = moves[i - 1], m = moves[i];
    if (p && HARSH.includes(p) && m && m !== "static shot" && (HARSH.includes(m) || SHOWY.includes(m))) out.push(`scene ${i + 1}: ${m} right after ${p} (use static or a gentle move)`);
  }
  scenes.forEach((s, i) => { const h = s.camera?.with; if (!h) return;
    if (h.move === s.camera!.move) out.push(`scene ${i + 1}: helper move repeats the main move`);
    if (h.intensity > HELPER_MAX_INTENSITY) out.push(`scene ${i + 1}: helper ${h.move} intensity ${h.intensity} (max ${HELPER_MAX_INTENSITY})`);
    if (s.camera!.intensity > 0.7) out.push(`scene ${i + 1}: combined moves, keep the main intensity at 0.7 or less`);
    if (HARSH.includes(h.move) || ONCE_PER_VIDEO.includes(h.move)) out.push(`scene ${i + 1}: ${h.move} cannot be a helper move`); });
  scenes.forEach((s, i) => { const m = s.camera?.move; if (s.captionHeavy && m && (HARSH.includes(m) || m === "FPV shot" || m === "dive")) out.push(`scene ${i + 1}: caption-heavy scene with ${m}`); });
  return out;
}
