import { Composition, staticFile } from "remotion";
import { ShortVideo } from "./ShortVideo";
import { ShortVideoPropsSchema } from "./types";
import { AltPathLong } from "./whatif/AltPathLong";
import { Timeline } from "./whatif/types";
import { CameraReel, CAMERA_REEL_FRAMES } from "./camera/CameraReel";
import { SamuraiHug, SamuraiHugCover, HUG_FRAMES } from "./samurai/SamuraiHug";
import { SamuraiOnce, SamuraiOnceCover, ONCE_FRAMES } from "./samurai/SamuraiOnce";
import { McdOpening, MCD_FRAMES } from "./companies/McdOpening";
import { McdEpisode, MCD_EP_FRAMES } from "./companies/McdEpisode";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="ShortVideo"
        component={ShortVideo}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={30 * 30}
        schema={ShortVideoPropsSchema}
        defaultProps={{
          clipSrc: "",
          sourceWidth: 1920,
          sourceHeight: 1080,
          crop: { x: 0, y: 0, w: 607, h: 1080 },
          cropKeyframes: [],
          captions: [],
          captionStyle: "bold" as const,
          hookLine1: "",
          hookLine2: "",
          showProgressBar: true,
          durationInSeconds: 30,
        }}
        calculateMetadata={({ props }) => {
          return {
            durationInFrames: Math.ceil(props.durationInSeconds * 30),
            fps: 30,
            width: 1080,
            height: 1920,
          };
        }}
      />
      <Composition
        id="AltPathLong"
        component={AltPathLong}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={300}
        defaultProps={{ timeline: { labels: { brand: "", series: "", alt: "", continuesAfter: "", realWhere: "", handle: "" }, realChoices: [], altChoices: [], segments: [], totalFrames: 300 } as Timeline }}
        calculateMetadata={async ({ props }) => {
          // timeline.json is written by whatif/prep.py
          const timeline: Timeline = props.timeline.segments.length
            ? props.timeline
            : await fetch(staticFile("whatif/timeline.json")).then((r) => r.json());
          return { durationInFrames: timeline.totalFrames, props: { timeline } };
        }}
      />
      <Composition id="SamuraiHug" component={SamuraiHug} width={1080} height={1920} fps={30} durationInFrames={HUG_FRAMES} />
      <Composition id="SamuraiHugCover" component={SamuraiHugCover} width={1080} height={1920} fps={30} durationInFrames={1} />
      <Composition id="SamuraiOnce" component={SamuraiOnce} width={1080} height={1920} fps={30} durationInFrames={ONCE_FRAMES} />
      <Composition id="SamuraiOnceCover" component={SamuraiOnceCover} width={1080} height={1920} fps={30} durationInFrames={1} />
      <Composition id="McdOpening" component={McdOpening} width={1920} height={1080} fps={30} durationInFrames={MCD_FRAMES} />
      <Composition id="McdEpisode" component={McdEpisode} width={1920} height={1080} fps={30} durationInFrames={MCD_EP_FRAMES} />
      <Composition id="CameraReel" component={CameraReel} width={1920} height={1080} fps={30} durationInFrames={CAMERA_REEL_FRAMES} />
    </>
  );
};
