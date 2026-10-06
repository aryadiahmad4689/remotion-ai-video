import React from "react";
import { MinoScene_01 } from "./MinoScene_01";
import { MinoScene_02 } from "./MinoScene_02";
import { MinoScene_03 } from "./MinoScene_03";
import { MinoScene_04 } from "./MinoScene_04";

export {
  MinoScene_01,
  MinoScene_02,
  MinoScene_03,
  MinoScene_04,
};

export interface GeneratedMinoSceneInfo {
  id: number;
  name: string;
  Component: React.FC;
  durationFrames: number;
}

export const generatedMinoScenes: GeneratedMinoSceneInfo[] = [
  { id: 1, name: "MinoScene_01", Component: MinoScene_01, durationFrames: 366 },
  { id: 2, name: "MinoScene_02", Component: MinoScene_02, durationFrames: 369 },
  { id: 3, name: "MinoScene_03", Component: MinoScene_03, durationFrames: 374 },
  { id: 4, name: "MinoScene_04", Component: MinoScene_04, durationFrames: 221 },
];
