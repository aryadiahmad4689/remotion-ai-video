import React from "react";
import { Scene_01 } from "./Scene_01";
import { Scene_02 } from "./Scene_02";
import { Scene_03 } from "./Scene_03";
import { Scene_04 } from "./Scene_04";
import { Scene_05 } from "./Scene_05";
import { Scene_06 } from "./Scene_06";
import { Scene_07 } from "./Scene_07";
import { Scene_08 } from "./Scene_08";

export {
  Scene_01,
  Scene_02,
  Scene_03,
  Scene_04,
  Scene_05,
  Scene_06,
  Scene_07,
  Scene_08,
};

export interface GeneratedSceneInfo {
  id: number;
  name: string;
  Component: React.FC;
  startFrame: number;
  durationFrames: number;
}

export const generatedScenes: GeneratedSceneInfo[] = [
  { id: 1, name: "Scene_01", Component: Scene_01, startFrame: 0, durationFrames: 1564 },
  { id: 2, name: "Scene_02", Component: Scene_02, startFrame: 1564, durationFrames: 1466 },
  { id: 3, name: "Scene_03", Component: Scene_03, startFrame: 3030, durationFrames: 1405 },
  { id: 4, name: "Scene_04", Component: Scene_04, startFrame: 4435, durationFrames: 1585 },
  { id: 5, name: "Scene_05", Component: Scene_05, startFrame: 6020, durationFrames: 1397 },
  { id: 6, name: "Scene_06", Component: Scene_06, startFrame: 7417, durationFrames: 1573 },
  { id: 7, name: "Scene_07", Component: Scene_07, startFrame: 8990, durationFrames: 1458 },
  { id: 8, name: "Scene_08", Component: Scene_08, startFrame: 10448, durationFrames: 1564 },
];
