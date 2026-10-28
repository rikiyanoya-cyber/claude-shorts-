import { Composition, staticFile } from "remotion";
import { ShortVideo } from "./ShortVideo";
import { ShortVideoPropsSchema } from "./types";
import { AnotherStory } from "./whatif/AnotherStory";
import { Timeline } from "./whatif/types";

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
        id="AnotherStory"
        component={AnotherStory}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={300}
        defaultProps={{ timeline: { realChoices: [], altChoices: [], segments: [], totalFrames: 300 } as Timeline }}
        calculateMetadata={async ({ props }) => {
          // timeline.json is written by whatif/prep.py
          const timeline: Timeline = props.timeline.segments.length
            ? props.timeline
            : await fetch(staticFile("whatif/timeline.json")).then((r) => r.json());
          return { durationInFrames: timeline.totalFrames, props: { timeline } };
        }}
      />
    </>
  );
};
