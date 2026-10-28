export type SegKind = "ff" | "bridge" | "rewind" | "title" | "eptitle" | "ep" | "awins" | "outro";

export type Segment = {
  kind: SegKind;
  n?: number;
  src?: string | null;
  img?: string | null;
  voice?: string | null;
  title?: string;
  from: number;
  frames: number;
};

export type Choice = { a: string; b: string };

export type Timeline = {
  realChoices: Choice[];
  altChoices: Choice[];
  segments: Segment[];
  totalFrames: number;
};

// Segments shown in the ANOTHER STORY world (red treatment, "Not canon" label).
export const isAlt = (k: SegKind) => k !== "ff" && k !== "bridge" && k !== "rewind";
