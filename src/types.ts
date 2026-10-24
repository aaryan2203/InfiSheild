import { DetectedRedFlag, RiskLevel, RedFlagType } from './logic/scamDetector';

export type LanguageCode =
  | 'hi'
  | 'gu'
  | 'en'
  | 'mr'
  | 'bn'
  | 'ta'
  | 'te'
  | 'kn'
  | 'ml'
  | 'pa'
  | 'or'
  | 'as'
  | 'ur';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}

export interface AudioChunk {
  chunkIndex: number;
  startTimeSec: number;
  endTimeSec: number;
  transcript: string;
}

export interface Scenario {
  id: string;
  title: string;
  category: string;
  type: 'scam' | 'genuine';
  durationSec: number;
  audioUrl: string;
  chunks: AudioChunk[];
}

export interface EvaluationStats {
  scamCallsTested: number;
  genuineCallsTested: number;
  redFlagsDetected: number;
  earlyWarningsIssued: number;
  falsePositivesCount: number;
}
