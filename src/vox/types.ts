export interface CaptionWord {
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
}

export interface VoxDocumentData {
  headline: string;
  source: string;
  date: string;
  quote: string;
  highlightedExcerpt: string;
}

export interface VoxChartItem {
  label: string;
  value: number;
  highlight?: boolean;
}

export interface VoxChartData {
  title: string;
  subtitle: string;
  unit: string;
  items: VoxChartItem[];
}

export interface VoxStoryboard {
  title: string;
  audioFile: string; // e.g. "voiceover.mp3" inside public/
  totalDurationSeconds: number;
  document: VoxDocumentData;
  chart: VoxChartData;
  marker: {
    wordToCircle: string;
    caption: string;
  };
  highlightedKeywords: string[];
  captions: CaptionWord[];
}
