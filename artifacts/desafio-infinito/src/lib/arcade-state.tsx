import { useSyncExternalStore } from 'react';

export type GameId = 'reflexo' | 'memoria' | 'toque-rapido';
export type CosmeticKind = 'personagem' | 'skin';

export interface Cosmetic {
  id: string;
  name: string;
  kind: CosmeticKind;
  description: string;
  price: number;
  colors: [string, string];
  tone: string;
  look: string;
}

export interface GameResult {
  id: string;
  gameId: GameId;
  score: number;
  coinsEarned: number;
  playedAt: string;
}

export interface ArcadeState {
  coins: number;
  totalXp: number;
  totalGames: number;
  totalScore: number;
  bestScores: Partial<Record<GameId, number>>;
  ownedCharacterIds: string[];
  ownedSkinIds: string[];
  selectedCharacterId: string;
  selectedSkinId: string;
  lastDailyDate: string | null;
  dailyStreak: number;
  recentResults: GameResult[];
}

export interface GameCompletion {
  score: number;
  coinsEarned: number;
  dailyBonus: number;
  leveledUp: boolean;
}

export type StoreResult =
  | { ok: true; coinsRemaining: number }
  | { ok: false; reason: 'not-found' | 'already-owned' | 'not-enough-coins' };

const STORAGE_KEY = 'desafio-infinito.progress.v1';
const VALID_GAMES: GameId[] = ['reflexo', 'memoria', 'toque-rapido'];

export const COSMETICS: Cosmetic[] = [
  {
    id: 'nina-neon',
    name: 'Nina Neon',
    kind: 'personagem',
    description: 'Uma parceira com brilho próprio.',
    price: 95,
    colors: ['#ff8abe', '#a4459b'],
    tone: 'pink',
    look: 'NN',
  },
  {
    id: 'cosmo',
    name: 'Cosmo',
    kind: 'personagem',
    description: 'Um companheiro tranquilo para novas fases.',
    price: 140,
    colors: ['#73d5ff', '#5463d6'],
    tone: 'blue',
    look: 'C',
  },
  {
    id: 'aurora',
    name: 'Rastro aurora',
    kind: 'skin',
    description: 'Uma trilha colorida para cada partida.',
    price: 65,
    colors: ['#78f0cf', '#8068e9'],
    tone: 'green',
    look: 'AR',
  },
  {
    id: 'pixel',
    name: 'Moldura pixel',
    kind: 'skin',
    description: 'Uma moldura inspirada nos fliperamas.',
    price: 110,
    colors: ['#ffd34d', '#ff8a5b'],
    tone: 'amber',
    look: 'PX',
  },
  {
    id: 'comet-trail',
    name: 'Rastro de Cometa',
    kind: 'skin',
    description: 'Deixe um risco de luz por onde passar.',
    price: 65,
    colors: ['#65dcff', '#3876e8'],
    tone: 'blue',
    look: 'RC',
  },
  {
    id: 'aurora-pulse',
    name: 'Pulso Aurora',
    kind: 'skin',
    description: 'Cores em movimento, energia tranquila.',
    price: 110,
    colors: ['#78f0cf', '#8068e9'],
    tone: 'green',
    look: 'PA',
  },
  {
    id: 'supernova',
    name: 'Supernova',
    kind: 'skin',
    description: 'Uma explosão dourada de luz.',
    price: 180,
    colors: ['#ffd34d', '#ff8a5b'],
    tone: 'amber',
    look: 'SN',
  },
];

const initialState: ArcadeState = {
  coins: 120,
  totalXp: 0,
  totalGames: 0,
  totalScore: 0,
  bestScores: {},
  ownedCharacterIds: ['nina-neon'],
  ownedSkinIds: ['aurora'],
  selectedCharacterId: 'nina-neon',
  selectedSkinId: 'aurora',
  lastDailyDate: null,
  dailyStreak: 0,
  recentResults: [],
};

function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isYesterday(previousDate: string, today: string): boolean {
  const previous = new Date(`${previousDate}T12:00:00`);
  previous.setDate(previous.getDate() + 1);
  return localDateKey(previous) === today;
}

function isValidState(value: unknown): value is ArcadeState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Partial<ArcadeState>;
  return (
    typeof state.coins === 'number' &&
    Number.isFinite(state.coins) &&
    state.coins >= 0 &&
    typeof state.totalXp === 'number' &&
    Number.isFinite(state.totalXp) &&
    state.totalXp >= 0 &&
    typeof state.totalGames === 'number' &&
    Number.isFinite(state.totalGames) &&
    state.totalGames >= 0 &&
    typeof state.totalScore === 'number' &&
    Number.isFinite(state.totalScore) &&
    state.totalScore >= 0 &&
    Array.isArray(state.ownedCharacterIds) &&
    Array.isArray(state.ownedSkinIds) &&
    Array.isArray(state.recentResults) &&
    typeof state.selectedCharacterId === 'string' &&
    typeof state.selectedSkinId === 'string'
  );
}

function loadState(): ArcadeState {
  if (typeof window === 'undefined') return initialState;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialState;
    const parsed: unknown = JSON.parse(stored);
    if (!isValidState(parsed)) {
      console.error('O progresso local do Desafio Infinito está inválido.');
      return initialState;
    }
    return parsed;
  } catch (error) {
    console.error('Não foi possível carregar o progresso salvo.', error);
    return initialState;
  }
}

let state = loadState();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Não foi possível salvar o progresso neste dispositivo.', error);
  }
}

function publish() {
  persist();
  listeners.forEach((listener) => listener());
}

export function getArcadeState(): ArcadeState {
  return state;
}

export function subscribeToArcadeState(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useArcadeState(): ArcadeState {
  return useSyncExternalStore(
    subscribeToArcadeState,
    getArcadeState,
    () => initialState,
  );
}

export function getLevel(totalXp: number): number {
  return Math.floor(totalXp / 100) + 1;
}

export function getLevelProgress(totalXp: number): number {
  return totalXp % 100;
}

export function completeGame(gameId: GameId, rawScore: number): GameCompletion {
  if (!VALID_GAMES.includes(gameId)) {
    throw new Error(`Jogo desconhecido: ${gameId}`);
  }
  if (!Number.isFinite(rawScore) || rawScore < 0) {
    throw new Error('A pontuação precisa ser um número positivo.');
  }

  const score = Math.min(1000, Math.floor(rawScore));
  const beforeLevel = getLevel(state.totalXp);
  const baseCoins = 10 + Math.min(20, Math.floor(score / 10));
  const today = localDateKey();
  const firstGameToday = state.lastDailyDate !== today;
  const dailyBonus = firstGameToday ? 20 : 0;
  const newStreak = firstGameToday
    ? state.lastDailyDate && isYesterday(state.lastDailyDate, today)
      ? state.dailyStreak + 1
      : 1
    : state.dailyStreak;
  const coinsEarned = baseCoins + dailyBonus;
  const result: GameResult = {
    id: `${Date.now()}-${state.totalGames + 1}`,
    gameId,
    score,
    coinsEarned,
    playedAt: new Date().toISOString(),
  };

  state = {
    ...state,
    coins: state.coins + coinsEarned,
    totalXp: state.totalXp + 15 + Math.floor(score / 25),
    totalGames: state.totalGames + 1,
    totalScore: state.totalScore + score,
    bestScores: {
      ...state.bestScores,
      [gameId]: Math.max(state.bestScores[gameId] ?? 0, score),
    },
    lastDailyDate: firstGameToday ? today : state.lastDailyDate,
    dailyStreak: newStreak,
    recentResults: [result, ...state.recentResults].slice(0, 12),
  };
  publish();

  return {
    score,
    coinsEarned,
    dailyBonus,
    leveledUp: getLevel(state.totalXp) > beforeLevel,
  };
}

export function purchaseCosmetic(cosmeticId: string): StoreResult {
  const cosmetic = COSMETICS.find((item) => item.id === cosmeticId);
  if (!cosmetic) return { ok: false, reason: 'not-found' };

  const ownedIds =
    cosmetic.kind === 'personagem'
      ? state.ownedCharacterIds
      : state.ownedSkinIds;
  if (ownedIds.includes(cosmetic.id)) {
    return { ok: false, reason: 'already-owned' };
  }
  if (state.coins < cosmetic.price) {
    return { ok: false, reason: 'not-enough-coins' };
  }

  state = {
    ...state,
    coins: state.coins - cosmetic.price,
    ...(cosmetic.kind === 'personagem'
      ? { ownedCharacterIds: [...state.ownedCharacterIds, cosmetic.id] }
      : { ownedSkinIds: [...state.ownedSkinIds, cosmetic.id] }),
  };
  publish();
  return { ok: true, coinsRemaining: state.coins };
}

export function selectCosmetic(cosmeticId: string): boolean {
  const cosmetic = COSMETICS.find((item) => item.id === cosmeticId);
  if (!cosmetic) return false;

  const ownedIds =
    cosmetic.kind === 'personagem'
      ? state.ownedCharacterIds
      : state.ownedSkinIds;
  if (!ownedIds.includes(cosmeticId)) return false;

  state = {
    ...state,
    ...(cosmetic.kind === 'personagem'
      ? { selectedCharacterId: cosmeticId }
      : { selectedSkinId: cosmeticId }),
  };
  publish();
  return true;
}
