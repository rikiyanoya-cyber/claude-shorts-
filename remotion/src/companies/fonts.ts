import React from "react";
import { staticFile, delayRender, continueRender } from "remotion";
// Noto Sans JP (Black 900 / Bold 700) as "NSJP"; rendering waits until both are loaded
export const useFonts = () => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => {
    const a = new FontFace("NSJP", `url(${staticFile("fonts/NotoSansJP-Black.ttf")})`, { weight: "900" });
    const b = new FontFace("NSJP", `url(${staticFile("fonts/NotoSansJP-Bold.ttf")})`, { weight: "700" });
    Promise.all([a.load(), b.load()]).then((fs) => { fs.forEach((x) => document.fonts.add(x)); continueRender(h); }).catch(() => continueRender(h));
  }, [h]);
};
