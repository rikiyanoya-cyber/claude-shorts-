export type SegKind =
  | "opening"
  | "part"
  | "result"
  | "rewind"
  | "title"
  | "other"
  | "ending"
  | "back"
  | "outro";

export type Segment = {
  kind: SegKind;
  n?: number;
  src?: string | null;
  img?: string;
  voice?: string | null;
  chapter?: string;
  from: number;
  frames: number;
};

export type Timeline = {
  choices: { a: string; b: string }[];
  endings: string[];
  segments: Segment[];
  totalFrames: number;
};

// Whether a segment belongs to THE OTHER PATH (red treatment, "Not canon" label).
export const isOther = (k: SegKind) => k === "rewind" || k === "title" || k === "other" || k === "ending";
