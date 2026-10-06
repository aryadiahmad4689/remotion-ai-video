import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { VoxPaperBackground } from "./VoxPaperBackground";
import { VoxDocument } from "./VoxDocument";
import { VoxChart } from "./VoxChart";
import { VoxCaptions } from "./VoxCaptions";
import { VoxStoryboard } from "./types";
import defaultStoryboard from "./vox-storyboard.json";

export const VoxComposition: React.FC<Partial<VoxStoryboard>> = (props) => {
  const data: VoxStoryboard = {
    ...defaultStoryboard,
    ...props,
  } as VoxStoryboard;

  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Dynamic Scene Transition Timing based on actual video duration
  const scene1End = Math.floor(durationInFrames * 0.48);
  const transitionStart = scene1End - 15;

  const docExit = spring({
    frame: frame - transitionStart,
    fps,
    config: { damping: 15, mass: 0.6, stiffness: 100 },
  });

  const docOpacity = interpolate(docExit, [0, 1], [1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const docScale = interpolate(docExit, [0, 1], [1, 1.06], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const scene2Start = Math.max(0, scene1End - 10);
  const scene2Duration = Math.max(30, durationInFrames - scene2Start);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Editorial Paper Background */}
      <VoxPaperBackground />

      {/* Voiceover Audio */}
      {data.audioFile && (
        <Audio
          src={staticFile(data.audioFile)}
          onError={(e) => console.log("Audio note:", e)}
        />
      )}

      {/* Scene 1: Archival Document Exhibit */}
      <Sequence from={0} durationInFrames={scene1End + 15} name="Vox Exhibit A: Document">
        <div
          style={{
            width: "100%",
            height: "100%",
            opacity: docOpacity,
            transform: `scale(${docScale})`,
          }}
        >
          <VoxDocument data={data.document} delay={5} />
        </div>
      </Sequence>

      {/* Scene 2: Editorial Data Chart */}
      <Sequence from={scene2Start} durationInFrames={scene2Duration} name="Vox Exhibit B: Data Chart">
        <VoxChart data={data.chart} delay={5} />
      </Sequence>

      {/* Subtitles: Word-Level Kinetic Captions */}
      <VoxCaptions words={data.captions} />
    </AbsoluteFill>
  );
};
