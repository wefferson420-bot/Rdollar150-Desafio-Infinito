import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp, Gauge } from 'lucide-react';
import { RunnerSprite } from './RunnerSprite';
import type { GameModuleProps } from './game-types';

type ObstacleKind = 'crate' | 'spikes' | 'precision' | 'tower';

interface RunObstacle {
  id: number;
  x: number;
  kind: ObstacleKind;
}

interface RunWorld {
  distance: number;
  playerY: number;
  jumpVelocity: number;
  obstacles: RunObstacle[];
  spawnIn: number;
  nextId: number;
  lastFrameAt: number;
  lastPaintAt: number;
  stopped: boolean;
}

interface RunScene {
  distance: number;
  playerY: number;
  obstacles: RunObstacle[];
  speed: number;
}

const OBSTACLE_METRICS: Record<ObstacleKind, { width: number; height: number }> = {
  crate: { width: 45, height: 50 },
  spikes: { width: 43, height: 35 },
  precision: { width: 34, height: 69 },
  tower: { width: 57, height: 78 },
};

function nextObstacleKind(distance: number): ObstacleKind {
  const roll = Math.random();
  if (distance > 250 && roll > 0.81) return 'tower';
  if (distance > 115 && roll > 0.56) return 'precision';
  return roll > 0.47 ? 'spikes' : 'crate';
}

export interface EndlessRunGameProps extends GameModuleProps {
  characterId: string;
  skinId: string;
}

export function EndlessRunGame({
  playing,
  characterId,
  skinId,
  onProgress,
  onFinish,
}: EndlessRunGameProps) {
  const [scene, setScene] = useState<RunScene>({
    distance: 0,
    playerY: 0,
    obstacles: [],
    speed: 1,
  });
  const worldRef = useRef<RunWorld | null>(null);
  const arenaRef = useRef<HTMLDivElement | null>(null);

  const jump = useCallback(() => {
    const world = worldRef.current;
    if (!playing || !world || world.stopped || world.playerY > 1) return;
    world.jumpVelocity = 545;
  }, [playing]);

  useEffect(() => {
    if (!playing) {
      worldRef.current = null;
      return;
    }

    const now = performance.now();
    const world: RunWorld = {
      distance: 0,
      playerY: 0,
      jumpVelocity: 0,
      obstacles: [],
      spawnIn: 0.95,
      nextId: 0,
      lastFrameAt: now,
      lastPaintAt: now,
      stopped: false,
    };
    worldRef.current = world;
    setScene({ distance: 0, playerY: 0, obstacles: [], speed: 1 });
    onProgress(0, null);

    let frameId = 0;
    const tick = (frameAt: number) => {
      if (world.stopped || worldRef.current !== world) return;
      const elapsed = Math.min(0.05, Math.max(0, (frameAt - world.lastFrameAt) / 1000));
      world.lastFrameAt = frameAt;

      const difficulty = 1 + Math.min(1.7, world.distance / 430);
      const speedMetersPerSecond = 7 + Math.min(12, world.distance / 65);
      const speedPixelsPerSecond = 250 + Math.min(250, world.distance * 0.65);
      world.distance += speedMetersPerSecond * elapsed;
      world.spawnIn -= elapsed;

      world.jumpVelocity -= 1550 * elapsed;
      world.playerY = Math.max(0, world.playerY + world.jumpVelocity * elapsed);
      if (world.playerY === 0) world.jumpVelocity = 0;

      if (world.spawnIn <= 0) {
        const firstKind = nextObstacleKind(world.distance);
        world.obstacles.push({ id: world.nextId++, x: (arenaRef.current?.clientWidth ?? 360) + 55, kind: firstKind });
        const comboChance = Math.min(0.48, 0.12 + world.distance / 900);
        if (world.distance > 80 && Math.random() < comboChance) {
          const secondKind = world.distance > 220 && Math.random() > 0.5 ? 'precision' : nextObstacleKind(world.distance);
          world.obstacles.push({
            id: world.nextId++,
            x: (arenaRef.current?.clientWidth ?? 360) + 185,
            kind: secondKind,
          });
        }
        world.spawnIn = Math.max(0.68, 1.65 - difficulty * 0.28) + Math.random() * 0.24;
      }

      world.obstacles = world.obstacles
        .map((obstacle) => ({ ...obstacle, x: obstacle.x - speedPixelsPerSecond * elapsed }))
        .filter((obstacle) => obstacle.x > -80);

      const arenaWidth = arenaRef.current?.clientWidth ?? 360;
      const runnerLeft = arenaWidth * 0.12 + 24;
      const runnerRight = runnerLeft + 46;
      const collision = world.obstacles.find((obstacle) => {
        const metrics = OBSTACLE_METRICS[obstacle.kind];
        const overlapsRunner = obstacle.x < runnerRight && obstacle.x + metrics.width > runnerLeft;
        const hasClearedHeight = world.playerY >= metrics.height - 18;
        return overlapsRunner && !hasClearedHeight;
      });

      if (collision) {
        world.stopped = true;
        const distance = Math.floor(world.distance);
        onProgress(distance, null);
        onFinish(distance, {
          distance,
          coinBonus: Math.min(18, Math.floor(distance / 80) * 2),
          xpBonus: Math.min(28, Math.floor(distance / 55) * 2),
        });
        return;
      }

      if (frameAt - world.lastPaintAt >= 32) {
        world.lastPaintAt = frameAt;
        const distance = Math.floor(world.distance);
        const speed = 1 + Math.min(1.7, world.distance / 430);
        setScene({
          distance,
          playerY: world.playerY,
          obstacles: world.obstacles.map((obstacle) => ({ ...obstacle })),
          speed,
        });
        onProgress(distance, null);
      }
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frameId);
      worldRef.current = null;
    };
  }, [playing, onFinish, onProgress]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('.run-jump-button')) return;
    jump();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
      event.preventDefault();
      jump();
    }
  };

  return (
    <section className="endless-run-game" aria-label="Corrida Infinita">
      <div
        className="run-viewport"
        ref={arenaRef}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        data-testid="endless-run-viewport"
      >
        <div className="run-sky" aria-hidden="true">
          <div className="run-moon" />
          <div className="run-skyline skyline-far" />
          <div className="run-skyline skyline-near" />
          <div className="run-orbit run-orbit-one" />
          <div className="run-orbit run-orbit-two" />
        </div>
        <div className="run-hud" aria-live="polite">
          <span><b>{scene.distance}</b> m <small>DISTÂNCIA</small></span>
          <span><Gauge size={13} /> <b>{scene.speed.toFixed(1)}x</b> <small>RITMO</small></span>
        </div>
        <div className="run-world-track" aria-hidden="true">
          <div
            className="run-ground"
            style={{ backgroundPositionX: `${-((scene.distance * 23) % 134)}px` }}
          />
          <div className="run-ground-highlight" />
          {scene.obstacles.map((obstacle) => {
            const metrics = OBSTACLE_METRICS[obstacle.kind];
            return (
              <div
                key={obstacle.id}
                className={`run-obstacle obstacle-${obstacle.kind}`}
                style={{
                  left: obstacle.x,
                  width: metrics.width,
                  height: metrics.height,
                }}
              >
                <span />
              </div>
            );
          })}
          <div
            className="run-character-holder"
            style={{ transform: `translateY(-${scene.playerY}px)` }}
          >
            <RunnerSprite characterId={characterId} skinId={skinId} running className="run-character" />
          </div>
        </div>
        <div className="run-scene-bottom">
          <span>DESVIE DOS OBSTÁCULOS</span>
          <span>SEM LIMITE DE TEMPO</span>
        </div>
        <button
          type="button"
          className="run-jump-button"
          onClick={jump}
          disabled={!playing}
          aria-label="Pular obstáculo"
          data-testid="button-run-jump"
        >
          <ArrowUp size={22} />
          <span>PULAR</span>
        </button>
      </div>
      <p className="run-instruction">Toque na pista ou em PULAR. O ritmo acelera conforme você avança.</p>
      <span className="sr-only" aria-live="polite">{scene.distance} metros percorridos</span>
    </section>
  );
}
