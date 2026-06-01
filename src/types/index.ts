export interface Theme {
  id: number;
  name: string;
  cleanVideo: string;
  pollutedVideo: string;
  cleanImage: string;
  pollutedImage: string;
}

export interface BrandData {
  score: number;
  sector?: string;
  category?: string;
  positives: string[];
  negatives: string[];
  sustainabilityActions: string[];
  industryContext: string;
}

export type BackgroundMode = 'dynamic' | 'brand';
