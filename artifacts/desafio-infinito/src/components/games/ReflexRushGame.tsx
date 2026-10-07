import { useCallback, useEffect, useRef, useState } from 'react';
import { Target } from 'lucide-react';
import type { GameModuleProps } from './game-types';

const ROUND_SECONDS = 20;

interface ReflexTarget {
  id: number;
  kind: 'real' | 'false';
  x: number;
  y: number;
  size: number;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function ReflexRushGame({ playing, onProgress, onFinish }: GameModuleProps) {
  const [targets, setTargets] = useState<ReflexTarget[]>([]);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [hits, setHits] = useState(0);
  const [falseHits, setFalseHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [chain, setChain] = useState(0);
  const targetsRef = useRef<ReflexTarget[]>([]);
  const scoreRef = useRef(0);
  const hitsRef = useRef(0);
  const falseHitsRef = useRef(0);
  const missesRef = useRef(0);
  const chainRef = useRef(0);
  const reactionsRef = useRef<number[]>([]);
  const waveCounterRef = useRef(0);
  const waveBornAtRef = useRef(0);
  const waveEndsAtRef = useRef(0);
  const nextWaveAtRef = useRef(0);
  const startedAtRef = useRef(0);
  const finishedRef = useRef(false);

  const showTargets = useCallback((next: ReflexTarget[]) => {
    targetsRef.current = next;
    setTargets(next);
  }, []);

  const updateScore = useCallback((next: number) => {
    scoreRef.current = Math.max(0, next);
    setScore(scoreRef.current);
  }, []);

  const spawnWave = useCallback(() => {
    const successfulHits = hitsRef.current;
    const size = Math.max(42, 66 - Math.floor(successfulHits / 3) * 3);
    const nextId = waveCounterRef.current++;
    const realTarget: ReflexTarget = {
      id: nextId * 10,
      kind: 'real',
      x: randomBetween(8, 72),
      y: randomBetween(13, 66),
      size,
    };
    const fakeChance = successfulHits < 3 ? 0 : Math.min(0.46, 0.12 + successfulHits * 0.025);
    const fakeCount = Math.random() < fakeChance ? (successfulHits > 10 && Math.random() < 0.3 ? 2 : 1) : 0;
    const fakeTargets = Array.from({ length: fakeCount }, (_, index): ReflexTarget => ({
      id: nextId * 10 + index + 1,
      kind: 'false',
      x: randomBetween(8, 72),
      y: randomBetween(13, 66),
      size: Math.max(40, size - 5),
    }));
    waveBornAtRef.current = Date.now();
    const reactionWindow = Math.max(420, 1450 - successfulHits * 58);
    waveEndsAtRef.current = waveBornAtRef.current + reactionWindow;
    showTargets([realTarget, ...fakeTargets]);
  }, [showTargets]);

  const reportProgress = useCallback((timeRemaining: number) => {
    onProgress(scoreRef.current, timeRemaining);
  }, [onProgress]);

  const finishRound = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    showTargets([]);
    const successfulHits = hitsRef.current;
    onFinish(scoreRef.current, {
      reflexReactionsMs: [...reactionsRef.current],
      reflexFalseHits: falseHitsRef.current,
      reflexMisses: missesRef.current,
      coinBonus: Math.min(14, Math.floor(successfulHits / 4) * 2),
      xpBonus: Math.min(20, Math.floor(successfulHits / 3) * 2),
    });
  }, [onFinish, showTargets]);

  useEffect(() => {
    if (!playing) return;
    scoreRef.current = 0;
    hitsRef.current = 0;
    falseHitsRef.current = 0;
    missesRef.current = 0;
    chainRef.current = 0;
    reactionsRef.current = [];
    waveCounterRef.current = 0;
    startedAtRef.current = Date.now();
    nextWaveAtRef.current = startedAtRef.current + 500;
    finishedRef.current = false;
    showTargets([]);
    setScore(0);
    setHits(0);
    setFalseHits(0);
    setMisses(0);
    setChain(0);
    setSecondsLeft(ROUND_SECONDS);
    reportProgress(ROUND_SECONDS);

    const tick = window.setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - startedAtRef.current;
      const timeRemaining = Math.max(0, ROUND_SECONDS - Math.floor(elapsedMs / 1000));
      setSecondsLeft(timeRemaining);
      reportProgress(timeRemaining);

      if (timeRemaining <= 0) {
        finishRound();
        return;
      }

      if (targetsRef.current.length && now >= waveEndsAtRef.current) {
        missesRef.current += 1;
        setMisses(missesRef.current);
        chainRef.current = 0;
        setChain(0);
        updateScore(scoreRef.current - 16);
        showTargets([]);
        nextWaveAtRef.current = now + Math.max(180, 560 - hitsRef.current * 25) + randomBetween(0, 240);
      } else if (!targetsRef.current.length && now >= nextWaveAtRef.current) {
        spawnWave();
      }
    }, 80);

    return () => window.clearInterval(tick);
  }, [playing, finishRound, reportProgress, showTargets, spawnWave, updateScore]);

  const selectTarget = (target: ReflexTarget) => {
    if (!playing || finishedRef.current) return;
    if (target.kind === 'false') {
      falseHitsRef.current += 1;
      setFalseHits(falseHitsRef.current);
      chainRef.current = 0;
      setChain(0);
      updateScore(scoreRef.current - 34);
      showTargets([]);
      nextWaveAtRef.current = Date.now() + 360;
      return;
    }

    const reactionMs = Math.max(0, Date.now() - waveBornAtRef.current);
    reactionsRef.current = [...reactionsRef.current, reactionMs];
    hitsRef.current += 1;
    setHits(hitsRef.current);
    chainRef.current += 1;
    setChain(chainRef.current);
    const speedPoints = Math.max(6, Math.floor((1300 - reactionMs) / 14));
    const chainBonus = Math.min(24, Math.floor(chainRef.current / 2) * 3);
    updateScore(scoreRef.current + 18 + speedPoints + chainBonus);
    showTargets([]);
    nextWaveAtRef.current = Date.now() + Math.max(150, 550 - hitsRef.current * 24) + randomBetween(0, 230);
  };

  const tapEmptySpace = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || !playing || finishedRef.current) return;
    missesRef.current += 1;
    setMisses(missesRef.current);
    chainRef.current = 0;
    setChain(0);
    updateScore(scoreRef.current - 12);
  };

  const averageReaction = reactionsRef.current.length
    ? Math.round(reactionsRef.current.reduce((sum, reaction) => sum + reaction, 0) / reactionsRef.current.length)
    : null;

  return (
    <section className="reflex-rush" aria-label="Partida de reflexo">
      <div className="reflex-live-stats">
        <span><b>{hits}</b> ACERTOS</span>
        <span><b>{averageReaction === null ? '—' : `${averageReaction} ms`}</b> MÉDIA</span>
        <span><b>{chain}</b> SEQUÊNCIA</span>
      </div>
      <div className="reflex-arena" onPointerDown={tapEmptySpace} data-testid="reflex-arena">
        <div className="reflex-arena-grid" aria-hidden="true" />
        <div className="reflex-arena-orbit" aria-hidden="true" />
        {targets.map((target) => (
          <button
            type="button"
            key={target.id}
            className={`reflex-rush-target ${target.kind === 'false' ? 'is-false' : 'is-real'}`}
            style={{ left: `${target.x}%`, top: `${target.y}%`, width: target.size, height: target.size }}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => selectTarget(target)}
            aria-label={target.kind === 'false' ? 'Alvo falso, não toque' : 'Alvo verdadeiro, toque agora'}
            data-testid={target.kind === 'false' ? 'button-false-target' : 'button-reflex-target'}
          >
            {target.kind === 'real' ? <Target size={target.size * 0.42} strokeWidth={2.2} /> : <span>FALSO</span>}
          </button>
        ))}
        {!targets.length && <div className="reflex-waiting">FIQUE DE OLHO</div>}
        <div className="reflex-arena-footer">
          <span>{falseHits} ALVOS FALSOS</span>
          <span>{misses} TOQUES PERDIDOS</span>
        </div>
      </div>
      <p className="reflex-instruction">Toque nos sinais lilás; ignore os alvos vermelhos. Eles ficam menores e mais rápidos.</p>
      <span className="sr-only" aria-live="polite">{secondsLeft} segundos restantes</span>
    </section>
  );
}
