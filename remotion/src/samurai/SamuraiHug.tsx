// Samurai Stillness #5 "THE HUG": 1080x1920, 30 fps, 14 s, no audio. One SVG frame per Remotion frame.
import React from "react";
import { AbsoluteFill, useCurrentFrame, staticFile, delayRender, continueRender } from "remotion";
import { makeHugEpisode } from "./hugEngine";
import { EP05 } from "./ep05_hug";

const ep = makeHugEpisode(JSON.parse(JSON.stringify(EP05)));
const useNS = () => {
  const [h] = React.useState(() => delayRender("font NS"));
  React.useEffect(() => {
    const ff = new FontFace("NS", `url(${staticFile("fonts/NotoSansJP-Black.ttf")})`, { weight: "900" });
    ff.load().then((x) => { document.fonts.add(x); continueRender(h); }).catch(() => continueRender(h));
  }, [h]);
};
const Svg: React.FC<{ html: string }> = ({ html }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ display: "block" }} dangerouslySetInnerHTML={{ __html: html }} />
);
export const SamuraiHug: React.FC = () => { useNS(); const f = useCurrentFrame();
  return <AbsoluteFill style={{ backgroundColor: "#12152C" }}><Svg html={ep.frameSVG(f / 30)} /></AbsoluteFill>; };
export const SamuraiHugCover: React.FC = () => { useNS();
  return <AbsoluteFill style={{ backgroundColor: "#12152C" }}><Svg html={ep.coverSVG()} /></AbsoluteFill>; };
export const HUG_FRAMES = Math.round(EP05.duration * 30);
