import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, Solid, useCurrentFrame, interpolate } from "remotion";
import { VoxPaperBackground } from "./VoxPaperBackground";
import { EditorialHeader } from "./EditorialHeader";
import { VoxCaptions } from "./VoxCaptions";
import { generatedScenes } from "./scenes/generated";
import defaultCaptions from "./longform-captions.json";
import { CaptionWord } from "./types";

const SceneWrapper: React.FC<{
  durationInFrames: number;
  children: React.ReactNode;
}> = ({ durationInFrames, children }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
      {children}
    </AbsoluteFill>
  );
};

export const LongFormComposition: React.FC = () => {
  const captions = defaultCaptions as CaptionWord[];

  return (
    <>
      <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#F5F2EB" }}>
        {/* 1. Archival Textured Paper Grid across the entire 10-minute video */}
        <VoxPaperBackground hideCornerLabels />

        {/* 2. Top Editorial Header with Mino Powered By SusahBelajar branding & progress bar */}
        <EditorialHeader />
      
        {/* 3. Uninterrupted Continuous Voiceover Audio Track */}
        <Audio src={staticFile("voiceover.mp3")} />
      
        {/* 4. Modular Autonomous Scenes strictly anchored to each chapter's exact timeline startFrame */}
        {generatedScenes.length > 0 ? (
          generatedScenes.map((scene) => {
            const SceneComp = scene.Component;
            return (
              <Sequence
                key={`${scene.id}-${scene.name}`}
                from={scene.startFrame}
                durationInFrames={scene.durationFrames}
                name={scene.name}
              >
                <SceneWrapper durationInFrames={scene.durationFrames}>
                  <SceneComp />
                </SceneWrapper>
              </Sequence>
            );
          })
        ) : (
          <AbsoluteFill
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontFamily: "Arial, sans-serif",
              fontSize: 36,
              fontWeight: 800,
              color: "#18181B",
            }}
          >
            Generating Autonomous Scenes...
          </AbsoluteFill>
        )}
      
        {/* 4. Real-time Synchronized Kinetic Subtitles */}
        {captions && captions.length > 0 && <VoxCaptions words={captions} />}
      </AbsoluteFill>
    </>
  );
};
