import type { GamePerformance } from '@/lib/arcade-state';

export type GameProgressHandler = (score: number, timeRemaining: number | null) => void;
export type GameFinishHandler = (score: number, performance?: GamePerformance) => void;

export interface GameModuleProps {
  playing: boolean;
  onProgress: GameProgressHandler;
  onFinish: GameFinishHandler;
}
