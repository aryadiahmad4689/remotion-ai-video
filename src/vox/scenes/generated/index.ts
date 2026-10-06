import React from "react";
import { Scene_01 } from "./Scene_01";
import { Scene_02 } from "./Scene_02";
import { Scene_03 } from "./Scene_03";
import { Scene_04 } from "./Scene_04";
import { Scene_05 } from "./Scene_05";
import { Scene_06 } from "./Scene_06";
import { Scene_07 } from "./Scene_07";
import { Scene_08 } from "./Scene_08";
import { Scene_09 } from "./Scene_09";
import { Scene_10 } from "./Scene_10";
import { Scene_11 } from "./Scene_11";

export {
  Scene_01,
  Scene_02,
  Scene_03,
  Scene_04,
  Scene_05,
  Scene_06,
  Scene_07,
  Scene_08,
  Scene_09,
  Scene_10,
  Scene_11,
};

export interface GeneratedSceneInfo {
  id: number;
  name: string;
  Component: React.FC;
  durationFrames: number;
}

export const generatedScenes: GeneratedSceneInfo[] = [
  { id: 1, name: "Scene_01", Component: Scene_01, durationFrames: 1548 },
  { id: 2, name: "Scene_02", Component: Scene_02, durationFrames: 1549 },
  { id: 3, name: "Scene_03", Component: Scene_03, durationFrames: 1548 },
  { id: 4, name: "Scene_04", Component: Scene_04, durationFrames: 1548 },
  { id: 5, name: "Scene_05", Component: Scene_05, durationFrames: 1548 },
  { id: 6, name: "Scene_06", Component: Scene_06, durationFrames: 1549 },
  { id: 7, name: "Scene_07", Component: Scene_07, durationFrames: 1548 },
  { id: 8, name: "Scene_08", Component: Scene_08, durationFrames: 1548 },
  { id: 9, name: "Scene_09", Component: Scene_09, durationFrames: 1548 },
  { id: 10, name: "Scene_10", Component: Scene_10, durationFrames: 1549 },
  { id: 11, name: "Scene_11", Component: Scene_11, durationFrames: 1549 },
];
