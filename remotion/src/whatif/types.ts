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

// On-screen names, kept out of the code (set in the prep config).
export type Labels = {
  brand: string; // channel name, top of the right panel
  series: string; // series title
  alt: string; // name of the alternate path, e.g. two words for the title card
  continuesAfter: string; // second line of the outro, e.g. "Part 10."
  realWhere: string; // where the voted story continues
  handle: string;
};

export type Timeline = {
  labels: Labels;
  realChoices: Choice[];
  altChoices: Choice[];
  segments: Segment[];
  totalFrames: number;
};

// Segments shown in the alternate-path world (red treatment, "Not canon" label).
export const isAlt = (k: SegKind) => k !== "ff" && k !== "bridge" && k !== "rewind";
