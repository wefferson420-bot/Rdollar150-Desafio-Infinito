import { useEffect, useRef, useState } from 'react';
import {
  getMemoryPairCount,
  getMemoryTimeLimit,
} from '@/lib/arcade-state';
import { RunnerSprite } from './RunnerSprite';
import type { GameModuleProps } from './game-types';

const CARD_SYMBOLS = [
  '◈', '✦', '⊙', '▲', '◇', '▧', '⌁', '✣',
  '◐', '◆', '□', '△', '⬟', '✧', '◎', '▱',
  '⬢', '✺', '◌', '⬡', '✥', '◉', '▰', '✱',
];

interface MemoryCard {
  id: number;
  pairId: number;
}

function shuffledDeck(pairCount: number): MemoryCard[] {
  const deck = Array.from({ length: pairCount * 2 }, (_, id) => ({
    id,
    pairId: Math.floor(id / 2),
  }));
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }
  return deck;
}

export interface MemoryMatchGameProps extends GameModuleProps {
  level: number;
  characterId: string;
  skinId: string;
}

export function MemoryMatchGame({
  playing,
  level,
  characterId,
  skinId,
  onProgress,
  onFinish,
}: MemoryMatchGameProps) {
  const pairCount = getMemoryPairCount(level);
  const timeLimit = getMemoryTimeLimit(level);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(timeLimit);
  const [matchStreak, setMatchStreak] = useState(0);
  const flippedRef = useRef<number[]>([]);
  const matchedRef = useRef<Set<number>>(new Set());
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const lockedRef = useRef(false);
  const finishedRef = useRef(false);
  const startedAtRef = useRef(0);
  const firstCardAtRef = useRef(0);
  const timeoutIdsRef = useRef<number[]>([]);

  const updateScore = (next: number) => {
    scoreRef.current = Math.max(0, next);
    setScore(scoreRef.current);
    onProgress(scoreRef.current, timeLeft);
  };

  const finish = (cleared: boolean) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const elapsedSeconds = Math.floor((Date.now() - startedAtRef.current) / 1000);
    const targetSeconds = timeLimit ?? pairCount * 9;
    const speedBonus = cleared ? Math.min(24, Math.floor(Math.max(0, targetSeconds - elapsedSeconds) / 12)) : 0;
    onFinish(scoreRef.current, {
      memoryLevel: level,
      memoryCleared: cleared,
      xpBonus: speedBonus,
      coinBonus: Math.min(14, Math.floor(speedBonus / 2)),
    });
  };

  useEffect(() => {
    if (!playing) return;
    const nextDeck = shuffledDeck(pairCount);
    const now = Date.now();
    startedAtRef.current = now;
    firstCardAtRef.current = 0;
    finishedRef.current = false;
    lockedRef.current = false;
    flippedRef.current = [];
    matchedRef.current = new Set();
    scoreRef.current = 0;
    streakRef.current = 0;
    timeoutIdsRef.current = [];
    setCards(nextDeck);
    setFlipped([]);
    setMatchedPairs(new Set());
    setScore(0);
    setMatchStreak(0);
    setTimeLeft(timeLimit);
    onProgress(0, timeLimit);

    if (timeLimit === null) return () => {
      timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };

    const timer = window.setInterval(() => {
      const remaining = Math.max(0, timeLimit - Math.floor((Date.now() - now) / 1000));
      setTimeLeft(remaining);
      onProgress(scoreRef.current, remaining);
      if (remaining <= 0) {
        window.clearInterval(timer);
        finish(false);
      }
    }, 200);

    return () => {
      window.clearInterval(timer);
      timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [playing, pairCount, timeLimit, level, onProgress]);

  const revealCard = (index: number) => {
    if (
      !playing ||
      finishedRef.current ||
      lockedRef.current ||
      flippedRef.current.includes(index) ||
      matchedRef.current.has(cards[index]?.pairId)
    ) return;

    const nextFlipped = [...flippedRef.current, index];
    flippedRef.current = nextFlipped;
    setFlipped(nextFlipped);

    if (nextFlipped.length === 1) {
      firstCardAtRef.current = Date.now();
      return;
    }

    lockedRef.current = true;
    const [firstIndex, secondIndex] = nextFlipped;
    const firstCard = cards[firstIndex];
    const secondCard = cards[secondIndex];

    if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
      const elapsedSeconds = Math.floor((Date.now() - startedAtRef.current) / 1000);
      const revealDelay = Math.max(250, Math.min(800, Date.now() - firstCardAtRef.current + 180));
      streakRef.current += 1;
      setMatchStreak(streakRef.current);
      const speedBonus = Math.max(0, 28 - Math.floor(elapsedSeconds / 5));
      const chainBonus = Math.min(24, Math.max(0, streakRef.current - 1) * 4);
      updateScore(scoreRef.current + 28 + speedBonus + chainBonus);
      const nextMatched = new Set(matchedRef.current);
      nextMatched.add(firstCard.pairId);
      matchedRef.current = nextMatched;

      const timeoutId = window.setTimeout(() => {
        setMatchedPairs(new Set(matchedRef.current));
        flippedRef.current = [];
        setFlipped([]);
        lockedRef.current = false;
        firstCardAtRef.current = 0;
        if (matchedRef.current.size >= pairCount) finish(true);
      }, revealDelay);
      timeoutIdsRef.current.push(timeoutId);
      return;
    }

    streakRef.current = 0;
    setMatchStreak(0);
    updateScore(scoreRef.current - 10);
    const timeoutId = window.setTimeout(() => {
      flippedRef.current = [];
      setFlipped([]);
      lockedRef.current = false;
      firstCardAtRef.current = 0;
    }, 720);
    timeoutIdsRef.current.push(timeoutId);
  };

  const columns = pairCount <= 8 ? 4 : pairCount <= 12 ? 5 : pairCount <= 18 ? 6 : 7;
  const matchedCount = matchedPairs.size;

  return (
    <section className="memory-match" aria-label="Partida de memória">
      <div className="memory-match-heading">
        <div className="memory-level-copy">
          <span className="stage-kicker">NÍVEL {String(level).padStart(2, '0')}</span>
          <strong>{pairCount} pares</strong>
          <span>{timeLimit ? `${timeLimit} segundos para resolver` : 'Sem limite de tempo neste nível'}</span>
        </div>
        <RunnerSprite characterId={characterId} skinId={skinId} className="memory-mascot" />
      </div>
      <div className={`memory-board memory-columns-${columns}`} style={{ '--memory-columns': columns } as React.CSSProperties}>
        {cards.map((card, index) => {
          const isOpen = flipped.includes(index) || matchedPairs.has(card.pairId);
          const isMatched = matchedPairs.has(card.pairId);
          const hue = (card.pairId * 47 + 260) % 360;
          return (
            <button
              type="button"
              key={card.id}
              className={`memory-match-card ${isOpen ? 'is-open' : ''} ${isMatched ? 'is-matched' : ''}`}
              onClick={() => revealCard(index)}
              disabled={isMatched || !playing}
              aria-label={isOpen ? `Carta ${index + 1}, símbolo ${CARD_SYMBOLS[card.pairId]}` : `Revelar carta ${index + 1}`}
              aria-pressed={isOpen}
              style={{ '--card-hue': hue } as React.CSSProperties}
              data-testid={`button-memory-card-${index}`}
            >
              <span className="memory-card-back-mark" aria-hidden="true" />
              {isOpen && <span className="memory-card-symbol" aria-hidden="true">{CARD_SYMBOLS[card.pairId]}</span>}
            </button>
          );
        })}
      </div>
      <div className="memory-match-footer">
        <span>{matchedCount} <i>/</i> {pairCount} PARES</span>
        <span>SEQUÊNCIA <b>{matchStreak}</b></span>
      </div>
      <p className="memory-match-hint">
        {timeLimit
          ? 'Cada acerto rápido vale mais. Erros descontam pontos.'
          : 'Observe os símbolos, encontre os pares e avance para um tabuleiro maior.'}
      </p>
      <span className="sr-only" aria-live="polite">
        {timeLeft === null ? `${matchedCount} de ${pairCount} pares encontrados` : `${timeLeft} segundos restantes`}
      </span>
    </section>
  );
}
