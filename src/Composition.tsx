import React from "react";
import { Sequence } from "remotion";
import { Background } from "./components/Background";
import { Scene1_Intro } from "./scenes/Scene1_Intro";
import { Scene2_Capabilities } from "./scenes/Scene2_Capabilities";
import { Scene3_Stats } from "./scenes/Scene3_Stats";
import { Scene4_Outro } from "./scenes/Scene4_Outro";

export const Gpt6SolanaPromo: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#07090E",
      }}
    >
      {/* Persistent Animated Background */}
      <Background />

      {/* Scene 1: Intro Hook (0 - 80 frames) */}
      <Sequence from={0} durationInFrames={80} name="Scene 1: Intro Hook">
        <Scene1_Intro />
      </Sequence>

      {/* Scene 2: Core Capabilities (75 - 160 frames) */}
      <Sequence from={75} durationInFrames={85} name="Scene 2: Capabilities">
        <Scene2_Capabilities />
      </Sequence>

      {/* Scene 3: Metrics & Benchmarks (155 - 235 frames) */}
      <Sequence from={155} durationInFrames={80} name="Scene 3: Stats & Metrics">
        <Scene3_Stats />
      </Sequence>

      {/* Scene 4: Outro & Call to Action (230 - 300 frames) */}
      <Sequence from={230} durationInFrames={70} name="Scene 4: Call to Action">
        <Scene4_Outro />
      </Sequence>
    </div>
  );
};
