export type RaceObstacleKind = 'crate' | 'spikes' | 'precision' | 'tower' | 'drone';
export type RaceObstacleMotion = 'bob' | 'sway';

export interface RaceObstacleSpec {
  kind: RaceObstacleKind;
  gapAfterSeconds: number;
  motion?: RaceObstacleMotion;
}

export interface RacePattern {
  id: string;
  label: string;
  minDistance: number;
  weight: number;
  difficulty: number;
  obstacles: readonly RaceObstacleSpec[];
}

export interface RacePatternMemory {
  patternIds: string[];
  sequenceKeys: string[];
}

export interface GeneratedRaceObstacle extends RaceObstacleSpec {
  phase: number;
}

export interface RaceChallenge {
  patternId: string;
  label: string;
  leadOffsetPx: number;
  obstacles: GeneratedRaceObstacle[];
  sequenceKey: string;
  cooldownSeconds: number;
  totalSpanSeconds: number;
}

export interface RaceDifficulty {
  stage: number;
  bandLabel: string;
  speedMetersPerSecond: number;
  speedPixelsPerSecond: number;
  speedMultiplier: number;
  spawnIntervalSeconds: number;
  gapTighteningSeconds: number;
}

export const MAX_RUNNER_JUMP_PX = 95;

export const RACE_OBSTACLE_METRICS: Record<
  RaceObstacleKind,
  { width: number; height: number }
> = {
  crate: { width: 45, height: 50 },
  spikes: { width: 43, height: 35 },
  precision: { width: 34, height: 66 },
  tower: { width: 57, height: 78 },
  drone: { width: 48, height: 46 },
};

export const RACE_PATTERNS: RacePattern[] = [
  { id: 'low-crate', label: 'Caixa baixa', minDistance: 0, weight: 3, difficulty: 0, obstacles: [{ kind: 'crate', gapAfterSeconds: 0 }] },
  { id: 'low-spikes', label: 'Espinhos', minDistance: 0, weight: 3, difficulty: 0, obstacles: [{ kind: 'spikes', gapAfterSeconds: 0 }] },
  { id: 'wide-double', label: 'Dupla espaçada', minDistance: 0, weight: 2, difficulty: 0, obstacles: [{ kind: 'crate', gapAfterSeconds: 0 }, { kind: 'spikes', gapAfterSeconds: 1.22 }] },
  { id: 'easy-stagger', label: 'Zigue-zague leve', minDistance: 35, weight: 2, difficulty: 1, obstacles: [{ kind: 'spikes', gapAfterSeconds: 0 }, { kind: 'crate', gapAfterSeconds: 1.18 }, { kind: 'spikes', gapAfterSeconds: 1.12 }] },

  { id: 'mid-double-low', label: 'Dupla baixa', minDistance: 100, weight: 3, difficulty: 1, obstacles: [{ kind: 'crate', gapAfterSeconds: 0 }, { kind: 'spikes', gapAfterSeconds: 1.02 }] },
  { id: 'mid-low-trio', label: 'Trio alternado', minDistance: 150, weight: 2, difficulty: 2, obstacles: [{ kind: 'spikes', gapAfterSeconds: 0 }, { kind: 'crate', gapAfterSeconds: 1.08 }, { kind: 'crate', gapAfterSeconds: 1.02 }] },
  { id: 'mobile-drone', label: 'Drone móvel', minDistance: 200, weight: 2, difficulty: 2, obstacles: [{ kind: 'drone', gapAfterSeconds: 0, motion: 'bob' }] },

  { id: 'precision-single', label: 'Salto preciso', minDistance: 300, weight: 2, difficulty: 2, obstacles: [{ kind: 'precision', gapAfterSeconds: 0 }] },
  { id: 'moving-pair', label: 'Drone e caixa', minDistance: 360, weight: 2, difficulty: 3, obstacles: [{ kind: 'drone', gapAfterSeconds: 0, motion: 'sway' }, { kind: 'crate', gapAfterSeconds: 1.08 }] },
  { id: 'high-low', label: 'Torre e espinhos', minDistance: 450, weight: 2, difficulty: 3, obstacles: [{ kind: 'tower', gapAfterSeconds: 0 }, { kind: 'spikes', gapAfterSeconds: 1.38 }] },

  { id: 'precision-weave', label: 'Precisão em sequência', minDistance: 600, weight: 2, difficulty: 4, obstacles: [{ kind: 'precision', gapAfterSeconds: 0 }, { kind: 'crate', gapAfterSeconds: 1.3 }, { kind: 'drone', gapAfterSeconds: 0.96, motion: 'bob' }] },
  { id: 'twin-towers', label: 'Torres espaçadas', minDistance: 800, weight: 1, difficulty: 5, obstacles: [{ kind: 'tower', gapAfterSeconds: 0 }, { kind: 'precision', gapAfterSeconds: 1.38 }] },

  { id: 'advanced-weave', label: 'Zigue-zague avançado', minDistance: 1000, weight: 2, difficulty: 5, obstacles: [{ kind: 'crate', gapAfterSeconds: 0 }, { kind: 'precision', gapAfterSeconds: 1.3 }, { kind: 'crate', gapAfterSeconds: 1.2 }] },
  { id: 'advanced-mobile-chain', label: 'Corrente móvel', minDistance: 1300, weight: 2, difficulty: 6, obstacles: [{ kind: 'drone', gapAfterSeconds: 0, motion: 'sway' }, { kind: 'precision', gapAfterSeconds: 1.3 }, { kind: 'spikes', gapAfterSeconds: 1.18 }] },
  { id: 'advanced-high-stagger', label: 'Altos alternados', minDistance: 1700, weight: 1, difficulty: 7, obstacles: [{ kind: 'tower', gapAfterSeconds: 0 }, { kind: 'spikes', gapAfterSeconds: 1.42 }, { kind: 'tower', gapAfterSeconds: 1.46 }] },
  { id: 'expert-mobile-mix', label: 'Mistura móvel', minDistance: 2200, weight: 2, difficulty: 8, obstacles: [{ kind: 'drone', gapAfterSeconds: 0, motion: 'bob' }, { kind: 'tower', gapAfterSeconds: 1.42 }, { kind: 'drone', gapAfterSeconds: 1.36, motion: 'sway' }] },
];

const PATTERN_MEMORY_LIMIT = 8;
const PATTERN_REPEAT_WINDOW = 3;
const MIN_CHALLENGE_COOLDOWN_SECONDS = 0.76;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function safeDistance(distance: number): number {
  return Number.isFinite(distance) ? Math.max(0, distance) : 0;
}

function difficultyBand(distance: number): string {
  if (distance < 100) return 'Aquecimento';
  if (distance < 300) return 'Ritmo crescente';
  if (distance < 600) return 'Agilidade';
  if (distance < 1000) return 'Avançado';
  const advancedStage = Math.floor((distance - 1000) / 500) + 1;
  return `Especialista ${advancedStage}`;
}

export function getRaceDifficulty(
  distance: number,
  adaptation = 0.42,
): RaceDifficulty {
  const meters = safeDistance(distance);
  const adaptiveSkill = clamp(adaptation, 0, 1);
  let baseSpeed: number;

  if (meters < 100) {
    baseSpeed = 7.2 + (meters / 100) * 0.75;
  } else if (meters < 300) {
    baseSpeed = 7.95 + ((meters - 100) / 200) * 2.05;
  } else if (meters < 600) {
    baseSpeed = 10 + ((meters - 300) / 300) * 2.5;
  } else if (meters < 1000) {
    baseSpeed = 12.5 + ((meters - 600) / 400) * 2.5;
  } else {
    baseSpeed = 15 + Math.log1p((meters - 1000) / 800) * 1.35;
  }

  const skillOffset = adaptiveSkill - 0.42;
  const speedMetersPerSecond = Math.max(5.8, baseSpeed + skillOffset * 1.2);
  const postThousand = Math.max(0, meters - 1000);
  const baseInterval =
    1.95 -
    Math.log1p(meters / 360) * 0.46 -
    Math.log1p(postThousand / 1200) * 0.08;
  const spawnIntervalSeconds = Math.max(
    MIN_CHALLENGE_COOLDOWN_SECONDS,
    baseInterval - skillOffset * 0.18,
  );

  return {
    stage: Math.floor(meters / 100),
    bandLabel: difficultyBand(meters),
    speedMetersPerSecond,
    speedPixelsPerSecond: 200 + speedMetersPerSecond * 18.5,
    speedMultiplier: speedMetersPerSecond / 7.2,
    spawnIntervalSeconds,
    gapTighteningSeconds:
      Math.log1p(meters / 250) * 0.025 +
      Math.log1p(postThousand / 500) * 0.02,
  };
}

export function minimumSafeGapSeconds(
  first: RaceObstacleKind,
  second: RaceObstacleKind,
): number {
  const highObstacles: RaceObstacleKind[] = ['precision', 'tower'];
  const firstIsHigh = highObstacles.includes(first);
  const secondIsHigh = highObstacles.includes(second);

  if (firstIsHigh && secondIsHigh) return 1.32;
  if (firstIsHigh || secondIsHigh) return 1.16;
  return 0.84;
}

export function getRacePatternCatalog(distance: number): RacePattern[] {
  const meters = safeDistance(distance);
  const catalog = RACE_PATTERNS.filter((pattern) => pattern.minDistance <= meters);
  if (meters < 2200) return catalog;

  const currentDeepStage = Math.floor((meters - 2200) / 600);
  const stageWindowStart = Math.max(0, currentDeepStage - 1);
  const deepPatterns: RacePattern[] = [];

  for (let stage = stageWindowStart; stage <= currentDeepStage; stage += 1) {
    const stageTightening = Math.log1p(stage) * 0.025;
    deepPatterns.push(
      {
        id: `deep-${stage}-mobile-weave`,
        label: `Trama móvel ${stage + 1}`,
        minDistance: 2200 + stage * 600,
        weight: 2,
        difficulty: 9 + stage,
        obstacles: [
          { kind: 'drone', gapAfterSeconds: 0, motion: 'sway' },
          { kind: 'precision', gapAfterSeconds: Math.max(1.3, 1.44 - stageTightening) },
          { kind: 'crate', gapAfterSeconds: Math.max(1.16, 1.3 - stageTightening) },
        ],
      },
      {
        id: `deep-${stage}-tower-shift`,
        label: `Torres móveis ${stage + 1}`,
        minDistance: 2200 + stage * 600,
        weight: 1,
        difficulty: 10 + stage,
        obstacles: [
          { kind: 'tower', gapAfterSeconds: 0 },
          { kind: 'drone', gapAfterSeconds: Math.max(1.2, 1.38 - stageTightening), motion: 'bob' },
          { kind: 'precision', gapAfterSeconds: Math.max(1.3, 1.44 - stageTightening) },
        ],
      },
      {
        id: `deep-${stage}-staggered-run`,
        label: `Sequência longa ${stage + 1}`,
        minDistance: 2200 + stage * 600,
        weight: 2,
        difficulty: 9 + stage,
        obstacles: [
          { kind: 'spikes', gapAfterSeconds: 0 },
          { kind: 'drone', gapAfterSeconds: Math.max(0.92, 1.08 - stageTightening), motion: 'sway' },
          { kind: 'tower', gapAfterSeconds: Math.max(1.28, 1.44 - stageTightening) },
        ],
      },
    );
  }

  return [...catalog, ...deepPatterns];
}

export function createSeededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function chooseWeightedPattern(
  patterns: RacePattern[],
  random: () => number,
  adaptation: number,
): RacePattern {
  const skillPressure = clamp(adaptation, 0, 1) - 0.42;
  const weighted = patterns.map((pattern) => ({
    pattern,
    weight:
      pattern.weight *
      Math.exp(skillPressure * Math.max(0, pattern.difficulty - 1) * 0.42),
  }));
  const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = clamp(random(), 0, 0.999999999) * totalWeight;

  for (const entry of weighted) {
    roll -= entry.weight;
    if (roll < 0) return entry.pattern;
  }
  return weighted[weighted.length - 1].pattern;
}

function makeSequenceKey(
  leadOffsetPx: number,
  obstacles: GeneratedRaceObstacle[],
): string {
  return [
    `x${leadOffsetPx}`,
    ...obstacles.map((obstacle) => [
      obstacle.kind,
      obstacle.gapAfterSeconds.toFixed(2),
      obstacle.motion ?? 'still',
      obstacle.phase.toFixed(1),
    ].join(':')),
  ].join('|');
}

function buildChallenge(
  pattern: RacePattern,
  difficulty: RaceDifficulty,
  random: () => number,
): RaceChallenge {
  const obstacles: GeneratedRaceObstacle[] = [];
  let totalSpanSeconds = 0;

  pattern.obstacles.forEach((spec, index) => {
    let gapAfterSeconds = 0;
    if (index > 0) {
      const previous = pattern.obstacles[index - 1];
      const minimumGap = minimumSafeGapSeconds(previous.kind, spec.kind);
      const variedGap =
        spec.gapAfterSeconds -
        difficulty.gapTighteningSeconds +
        (random() - 0.5) * 0.06;
      gapAfterSeconds = Math.max(minimumGap, variedGap);
      totalSpanSeconds += gapAfterSeconds;
    }

    obstacles.push({
      ...spec,
      gapAfterSeconds,
      phase: random() * Math.PI * 2,
    });
  });

  const leadOffsetPx = Math.round((random() - 0.5) * 36);
  const cooldownSeconds =
    difficulty.spawnIntervalSeconds +
    Math.max(0, random()) * 0.18;

  return {
    patternId: pattern.id,
    label: pattern.label,
    leadOffsetPx,
    obstacles,
    sequenceKey: makeSequenceKey(leadOffsetPx, obstacles),
    cooldownSeconds,
    totalSpanSeconds,
  };
}

export function generateRaceChallenge(
  distance: number,
  memory: RacePatternMemory,
  random: () => number,
  adaptation = 0.42,
): RaceChallenge {
  const patterns = getRacePatternCatalog(distance);
  const recentPatternIds = memory.patternIds.slice(-PATTERN_REPEAT_WINDOW);
  let candidates = patterns.filter((pattern) => !recentPatternIds.includes(pattern.id));

  if (!candidates.length) {
    candidates = patterns.filter((pattern) => pattern.id !== memory.patternIds.at(-1));
  }
  if (!candidates.length) candidates = patterns;

  for (let attempt = 0; attempt < Math.max(16, candidates.length * 3); attempt += 1) {
    const pattern = chooseWeightedPattern(candidates, random, adaptation);
    const challenge = buildChallenge(
      pattern,
      getRaceDifficulty(distance, adaptation),
      random,
    );
    if (!memory.sequenceKeys.includes(challenge.sequenceKey)) return challenge;

    candidates = candidates.filter((candidate) => candidate.id !== pattern.id);
    if (!candidates.length) {
      candidates = patterns.filter((candidate) => candidate.id !== memory.patternIds.at(-1));
      if (!candidates.length) candidates = patterns;
    }
  }

  const fallbackPattern = chooseWeightedPattern(candidates, random, adaptation);
  const fallback = buildChallenge(
    fallbackPattern,
    getRaceDifficulty(distance, adaptation),
    random,
  );
  for (let offset = -24; offset <= 24; offset += 4) {
    const leadOffsetPx = offset;
    const sequenceKey = makeSequenceKey(leadOffsetPx, fallback.obstacles);
    if (!memory.sequenceKeys.includes(sequenceKey)) {
      return { ...fallback, leadOffsetPx, sequenceKey };
    }
  }

  return fallback;
}

export function rememberRaceChallenge(
  memory: RacePatternMemory,
  challenge: RaceChallenge,
): RacePatternMemory {
  return {
    patternIds: [...memory.patternIds, challenge.patternId].slice(-PATTERN_MEMORY_LIMIT),
    sequenceKeys: [...memory.sequenceKeys, challenge.sequenceKey].slice(-PATTERN_MEMORY_LIMIT),
  };
}

export function updateRaceAdaptation(
  current: number,
  distance: number,
  obstaclesCleared: number,
): number {
  const previous = clamp(current, 0, 1);
  const meters = safeDistance(distance);
  const cleared = Math.max(0, Math.floor(obstaclesCleared));
  let adjustment: number;

  if (meters < 100) {
    adjustment = -0.15;
  } else if (meters < 300) {
    adjustment = cleared >= 3 ? 0.015 : -0.025;
  } else if (meters < 600) {
    adjustment = 0.045;
  } else if (meters < 1000) {
    adjustment = 0.075;
  } else {
    adjustment = 0.11;
  }

  if (cleared >= 18 && meters >= 300) adjustment += 0.035;
  return clamp(previous + adjustment, 0, 1);
}
