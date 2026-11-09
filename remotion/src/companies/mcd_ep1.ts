// Company history channel, Ep1 McDonald's — opening 60 s (prototype). Numbers and text live here only;
// the components take everything from this file. Script: revised version (fact-checked, owner OK 2026-11-09).
export const MCD_EP1 = {
  fps: 30,
  duration: 60,
  // cuts (seconds): what is on screen
  cuts: {
    street: [0, 6], name: [6, 8], map: [8, 22], brothers: [22, 28], kroc: [28, 33],
    deal: [33, 41], punch: [41, 45], kitchen: [45, 53], title: [53, 60],
  },
  company: "マクドナルド",
  counters: [
    { at: 8.4, value: 114, prefix: "", suffix: "", label: "の国と地域" },
    { at: 11.2, value: 45000, prefix: "", suffix: "+", label: "店" },
    { at: 14.4, value: 7000, prefix: "約", suffix: "万人", label: "1日あたり" },
  ],
  brothersLabel: "マクドナルド兄弟",
  krocLabel: "レイ・クロック 52歳",
  deal: { value: 270, suffix: "万ドル", at: 34.2, nameLetters: "McDONALD'S", eraseAt: 37.6 },
  punch: "これはハンバーガーの物語ではない。",
  title: { main: "マクドナルドの全歴史", years: [1940, 2026] },
  // subtitles: the script, verbatim, split at its own punctuation (the punch card line is the card itself)
  subs: [
    [0.3, "いまこの瞬間も、世界のどこかで"], [3.0, "ハンバーガーが売れ続けている。"],
    [6.0, "マクドナルド。"],
    [8.2, "114の国と地域に"], [11.0, "45,000を超える店を持ち、"], [14.2, "1日に約7,000万人が食事をするといわれる、"], [18.6, "地球最大のレストランである。"],
    [22.0, "だが、この帝国の名前に刻まれた兄弟は、"], [25.2, "この帝国を築いていない。"],
    [28.0, "築いたのは、"], [29.2, "52歳のミキサーのセールスマンだった。"],
    [33.0, "そして兄弟は、わずか270万ドルと引き換えに、"], [37.4, "自分たちの名前を手放した。"],
    [41.0, ""],
    [45.0, "厨房の「仕組み」を発明した兄弟と、"], [49.0, "その仕組みを世界中に売った男の物語である。"],
    [53.0, ""],
  ] as [number, string][],
} as const;
