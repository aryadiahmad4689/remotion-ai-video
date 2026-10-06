import { CaptionWord } from "./types";

export interface DocumentSceneData {
  source: string;
  date: string;
  headline: string;
  quote: string;
  highlightedExcerpt: string;
}

export interface ChartSceneData {
  title: string;
  subtitle: string;
  unit: string;
  items: Array<{
    label: string;
    value: number;
    highlight?: boolean;
  }>;
}

export interface TimelineStep {
  time: string;
  title: string;
  desc: string;
}

export interface TimelineSceneData {
  title: string;
  subtitle: string;
  steps: TimelineStep[];
}

export interface QuoteSceneData {
  quote: string;
  author: string;
  source: string;
  highlightWord: string;
}

export interface Chapter {
  id: number;
  type: "document" | "chart" | "timeline" | "quote";
  title: string;
  durationFrames: number;
  data: DocumentSceneData | ChartSceneData | TimelineSceneData | QuoteSceneData;
}

export interface LongFormStoryboard {
  title: string;
  audioFile: string;
  totalDurationSeconds: number;
  totalFrames: number;
  chapters: Chapter[];
  captions: CaptionWord[];
}
