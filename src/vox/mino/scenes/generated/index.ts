import React from "react";
import { MinoScene_01 } from "./MinoScene_01";
import { MinoScene_02 } from "./MinoScene_02";
import { MinoScene_03 } from "./MinoScene_03";
import { MinoScene_04 } from "./MinoScene_04";
import { MinoScene_05 } from "./MinoScene_05";
import { MinoScene_06 } from "./MinoScene_06";

export {
  MinoScene_01,
  MinoScene_02,
  MinoScene_03,
  MinoScene_04,
  MinoScene_05,
  MinoScene_06,
};

export interface GeneratedMinoSceneInfo {
  id: number;
  name: string;
  Component: React.FC;
  durationFrames: number;
}

export const generatedMinoScenes: GeneratedMinoSceneInfo[] = [
  { id: 1, name: "MinoScene_01", Component: MinoScene_01, durationFrames: 504 },
  { id: 2, name: "MinoScene_02", Component: MinoScene_02, durationFrames: 425 },
  { id: 3, name: "MinoScene_03", Component: MinoScene_03, durationFrames: 333 },
  { id: 4, name: "MinoScene_04", Component: MinoScene_04, durationFrames: 272 },
  { id: 5, name: "MinoScene_05", Component: MinoScene_05, durationFrames: 390 },
  { id: 6, name: "MinoScene_06", Component: MinoScene_06, durationFrames: 71 },
];
