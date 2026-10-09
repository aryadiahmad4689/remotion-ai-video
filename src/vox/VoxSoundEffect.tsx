import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { SFX_ENABLED } from "./sfxConfig";

export type VoxSFXType =
  | "highlighter"
  | "highlighter_scratch"
  | "paper_slide"
  | "woosh"
  | "woosh_soft"
  | "pop"
  | "pop_soft"
  | "click"
  | "camera"
  | "camera_shutter";

const SFX_MAP: Record<VoxSFXType, string> = {
  highlighter: "sfx/highlighter_scratch.mp3",
  highlighter_scratch: "sfx/highlighter_scratch.mp3",
  paper_slide: "sfx/paper_slide.mp3",
  woosh: "sfx/woosh_soft.mp3",
  woosh_soft: "sfx/woosh_soft.mp3",
  pop: "sfx/pop_soft.mp3",
  pop_soft: "sfx/pop_soft.mp3",
  click: "sfx/click.mp3",
  camera: "sfx/camera_shutter.mp3",
  camera_shutter: "sfx/camera_shutter.mp3",
};

export interface VoxSoundEffectProps {
  type: VoxSFXType;
  cue?: number; // Frame offset in current scene timeline (default: 0)
  volume?: number; // Volume multiplier 0.0 to 1.0 (default: 0.28 for warm, subtle editorial Foley)
  leadInFrames?: number; // Shift SFX earlier by N frames to align peak transient with visual impact (default: 0)
}

export const VoxSoundEffect: React.FC<VoxSoundEffectProps> = ({
  type,
  cue = 0,
  volume = 0.28,
  leadInFrames = 0,
}) => {
  if (!SFX_ENABLED) {
    return null;
  }

  const file = SFX_MAP[type] || "sfx/pop_soft.mp3";
  const soundSrc = staticFile(file);
  const startFrame = Math.max(0, cue - leadInFrames);

  if (startFrame <= 0) {
    return <Audio src={soundSrc} volume={volume} />;
  }

  return (
    <Sequence from={startFrame} name={`SFX: ${type}`}>
      <Audio src={soundSrc} volume={volume} />
    </Sequence>
  );
};
