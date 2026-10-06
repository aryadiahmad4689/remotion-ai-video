import React from "react";
import { AbsoluteFill, Audio, Series, staticFile, Solid } from "remotion";
import { VoxPaperBackground } from "./VoxPaperBackground";
import { EditorialHeader } from "./EditorialHeader";
import { VoxCaptions } from "./VoxCaptions";
import { generatedScenes } from "./scenes/generated";
import defaultCaptions from "./longform-captions.json";
import { CaptionWord } from "./types";

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
      
        {/* 3. Modular Autonomous Scenes coded by GPT-6.1 Sol sequenced in Remotion <Series> */}
        {generatedScenes.length > 0 ? (
          <Series>
            {generatedScenes.map((scene) => {
              const SceneComp = scene.Component;
              return (
                <Series.Sequence
                  key={`${scene.id}-${scene.name}`}
                  durationInFrames={scene.durationFrames}
                  name={scene.name}
                >
                  <SceneComp />
                </Series.Sequence>
              );
            })}
          </Series>
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
