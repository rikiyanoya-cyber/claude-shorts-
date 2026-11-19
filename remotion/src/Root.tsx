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
import { NikeEpisode, NIKE_EP_FRAMES } from "./companies/NikeEpisode";
import { NintendoEpisode, NINTENDO_EP_FRAMES } from "./companies/NintendoEpisode";
import { ConsoleRace, RACE_FRAMES } from "./companies/ConsoleRace";
import { SpotEpisode, SPOT_TEST_END, SPOT_FRAMES } from "./companies/SpotEpisode";
import { SpotThumb } from "./companies/SpotThumb";
import { WrongCarStills, WC_S5, WC_S7_END, WrongCarEpisode, WC_END, WrongCarCover, WrongCarStory, WrongCarStory1Video, WC_STORY1_LEN } from "./companies/WrongCar";
import { IAEp2, IA2_PART1_END, IA2_OPEN } from "./companies/IAEp2";
import { Fam1Episode, FAM1_SAMPLE_END, FAM1_FRAMES } from "./companies/Fam1Episode";

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
      <Composition id="NikeEpisode" component={NikeEpisode} width={1920} height={1080} fps={30} durationInFrames={NIKE_EP_FRAMES} />
      <Composition id="IAEp2Intro" component={IAEp2} width={1920} height={1080} fps={30} durationInFrames={Math.round(IA2_OPEN * 30)} defaultProps={{ intro: true }} />
      <Composition id="IAEp2Part1" component={IAEp2} width={1920} height={1080} fps={30} durationInFrames={Math.round(IA2_PART1_END * 30)} />
      <Composition id="SpotEpisode" component={SpotEpisode} width={1920} height={1080} fps={30} durationInFrames={SPOT_FRAMES} />
      <Composition id="WrongCarEpisode" component={WrongCarEpisode} width={1080} height={1920} fps={30} durationInFrames={Math.round(WC_END * 30)} />
      <Composition id="WrongCarStory1Video" component={WrongCarStory1Video} width={1080} height={1920} fps={30} durationInFrames={WC_STORY1_LEN * 30} />
      <Composition id="WrongCarStory" component={WrongCarStory} width={1080} height={1920} fps={30} durationInFrames={1} defaultProps={{ v: "1" }} />
      <Composition id="WrongCarCover" component={WrongCarCover} width={1080} height={1920} fps={30} durationInFrames={1} defaultProps={{ v: "A" }} />
      <Composition id="WrongCarStills" component={WrongCarStills} width={1080} height={1920} fps={30} durationInFrames={Math.round((WC_S7_END - WC_S5) * 30)} />
      <Composition id="SpotThumb" component={SpotThumb} width={1280} height={720} fps={30} durationInFrames={1} defaultProps={{ v: "A" }} />
      <Composition id="SpotTest" component={SpotEpisode} width={1920} height={1080} fps={30} durationInFrames={Math.round(SPOT_TEST_END * 30)} />
      <Composition id="Fam1Episode" component={Fam1Episode} width={1920} height={1080} fps={30} durationInFrames={FAM1_FRAMES} />
      <Composition id="Fam1Sample" component={Fam1Episode} width={1920} height={1080} fps={30} durationInFrames={Math.round(FAM1_SAMPLE_END * 30)} />
      <Composition id="ConsoleRace" component={ConsoleRace} width={1080} height={1920} fps={30} durationInFrames={RACE_FRAMES} />
      <Composition id="NintendoEpisode" component={NintendoEpisode} width={1920} height={1080} fps={30} durationInFrames={NINTENDO_EP_FRAMES} />
      <Composition id="CameraReel" component={CameraReel} width={1920} height={1080} fps={30} durationInFrames={CAMERA_REEL_FRAMES} />
    </>
  );
};
