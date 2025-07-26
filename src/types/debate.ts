// Debate Types
export type Difficulty = 'beginner' | 'intermediate' | 'expert';
export type OpponentStyle = 'logical' | 'emotional' | 'humorous' | 'aggressive';

export interface DebateConfig {
  mode: 'challenge';
  timeLimit: number;
  protectedTime: number;
  poiEnabled: boolean;
  motion: string;
  format: string;
  difficulty: Difficulty;
  opponentStyle: OpponentStyle;
}

export interface Speaker {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  isSpeaking: boolean;
  isAI: boolean;
  speakingTime: number;
  points: number;
}

export interface DebateMessage {
  id: string;
  speaker: string;
  text: string;
  timestamp: Date;
  isPOI: boolean;
  isRebuttal: boolean;
  isStrategy: boolean;
}

export interface ChallengeDebateRoomProps {
  // Add any props if needed
}
