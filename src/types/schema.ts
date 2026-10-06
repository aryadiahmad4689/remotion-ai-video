export interface FeatureItem {
  title: string;
  desc: string;
  icon: string;
  color: string;
}

export interface MetricItem {
  label: string;
  targetValue: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  subtext: string;
  accentColor: string;
}

export interface VideoData {
  badge: string;
  theme: {
    primaryColor: string; // e.g. #14F195 (Solana green)
    secondaryColor: string; // e.g. #9945FF (Solana purple)
    accentColor: string; // e.g. #00F0FF (Cyan glow)
  };
  scene1: {
    title: string;
    highlightWords: string[];
    subtitle: string;
  };
  scene2: {
    sectionTitle: string;
    highlightWords: string[];
    features: [FeatureItem, FeatureItem, FeatureItem];
  };
  scene3: {
    sectionTitle: string;
    highlightWords: string[];
    metrics: [MetricItem, MetricItem, MetricItem];
  };
  scene4: {
    badge: string;
    headline: string;
    highlightWords: string[];
    ctaText: string;
    url: string;
  };
}
