import { useCallback, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Award, LockKeyhole, Play, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { Link } from 'wouter';
import {
  getMemoryPairCount,
  getMemoryTimeLimit,
  useArcadeState,
  type GameCompletion,
  type GamePerformance,
  type PlayableGameId,
} from '@/lib/arcade-state';
import { EndlessRunGame } from './EndlessRunGame';
import { MemoryMatchGame } from './MemoryMatchGame';
import { ReflexRushGame } from './ReflexRushGame';

type GameDefinition = {
  id: PlayableGameId;
  name: string;
  description: string;
  category: string;
  duration: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  score: string;
};

export interface GameScorePayload {
  gameId: PlayableGameId;
  score: number;
  completedAt: Date;
  performance?: GamePerformance;
}

export interface GameSessionProps {
  game: GameDefinition;
  onGameComplete?: (result: GameScorePayload) => GameCompletion | undefined;
}

type PlayPhase = 'ready' | 'playing' | 'done';

function formatDuration(seconds: number | null): string {
  if (seconds === null) return 'SEM LIMITE';
  return `00:${String(seconds).padStart(2, '0')}`;
}

export function GameSession({ game, onGameComplete }: GameSessionProps) {
  const state = useArcadeState();
  const [phase, setPhase] = useState<PlayPhase>('ready');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    game.id === 'reflexo'
      ? 20
      : game.id === 'memoria'
        ? getMemoryTimeLimit(state.memoryLevel)
        : null,
  );
  const [completion, setCompletion] = useState<GameCompletion | null>(null);
  const [performance, setPerformance] = useState<GamePerformance>({});
  const [levelPlayed, setLevelPlayed] = useState(state.memoryLevel);
  const hasFinishedRef = useRef(false);
  const bestScore = state.bestScores[game.id] ?? 0;
  const recentResult = state.recentResults.find((result) => result.gameId === game.id);

  const onProgress = useCallback((nextScore: number, nextTime: number | null) => {
    setScore(nextScore);
    setTimeRemaining(nextTime);
  }, []);

  const finish = useCallback((finalScore: number, resultPerformance: GamePerformance = {}) => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    const safeScore = Math.max(0, Math.floor(finalScore));
    setScore(safeScore);
    setPerformance(resultPerformance);
    const result = onGameComplete?.({
      gameId: game.id,
      score: safeScore,
      completedAt: new Date(),
      performance: resultPerformance,
    });
    setCompletion(result ?? null);
    setPhase('done');
  }, [game.id, onGameComplete]);

  const begin = () => {
    hasFinishedRef.current = false;
    const nextLevel = state.memoryLevel;
    setLevelPlayed(nextLevel);
    setPhase('playing');
    setScore(0);
    setTimeRemaining(
      game.id === 'reflexo'
        ? 20
        : game.id === 'memoria'
          ? getMemoryTimeLimit(nextLevel)
          : null,
    );
    setPerformance({});
    setCompletion(null);
  };

  const unit = game.id === 'corrida' ? 'm' : 'pts';
  const scoreLabel = game.id === 'corrida' ? 'DISTÂNCIA' : 'PONTUAÇÃO';
  const isMemoryUntimed = game.id === 'memoria' && getMemoryTimeLimit(levelPlayed) === null;
  const timerLabel = game.id === 'corrida' ? 'MODO' : isMemoryUntimed ? 'NÍVEL' : 'TEMPO';
  const timerValue = game.id === 'corrida'
    ? 'INFINITO'
    : isMemoryUntimed
      ? String(levelPlayed).padStart(2, '0')
      : formatDuration(timeRemaining);
  const pairCount = getMemoryPairCount(levelPlayed);

  return (
    <div className="play-wrap">
      <Link href="/games" className="back-link" data-testid="link-back-games">
        <ArrowLeft size={15} /> Todos os jogos
      </Link>
      <div className="play-top">
        <div>
          <div className="eyebrow"><span />{game.category} · PARTIDA RÁPIDA</div>
          <h1>{game.name}</h1>
          <p>{game.description}</p>
        </div>
        <div className={`timer-badge ${game.id === 'corrida' ? 'is-infinite' : ''}`}>
          <span>{timerLabel}</span>
          <strong className={timeRemaining !== null && timeRemaining <= 5 && phase === 'playing' ? 'timer-low' : ''}>
            {timerValue}
          </strong>
        </div>
      </div>

      <div className={`game-stage stage-${game.id}`} data-testid="game-stage">
        {phase === 'ready' && (
          <div className="stage-ready">
            <div className={`ready-symbol tone-${game.color}`}><game.icon size={36} /></div>
            <span className="stage-kicker">PRONTO PRA JOGAR?</span>
            <h2>{game.id === 'corrida' ? <>A pista não<br /><i>tem fim.</i></> : <>Um, dois...<br /><i>valendo.</i></>}</h2>
            <p>
              {game.id === 'corrida'
                ? 'Sem cronômetro. Desvie dos obstáculos e tente ir mais longe a cada corrida.'
                : game.id === 'memoria'
                  ? `Nível ${levelPlayed}: ${pairCount} pares${isMemoryUntimed ? ', sem limite de tempo' : ` em ${getMemoryTimeLimit(levelPlayed)} segundos`}.`
                  : 'Você tem 20 segundos. Os alvos ficam menores e mais rápidos.'}
            </p>
            <button className="button-primary" onClick={begin} data-testid="button-start-game">
              <Play size={16} fill="currentColor" /> {game.id === 'corrida' ? 'Começar corrida' : 'Começar partida'}
            </button>
          </div>
        )}

        {phase === 'playing' && game.id === 'reflexo' && (
          <ReflexRushGame playing onProgress={onProgress} onFinish={finish} />
        )}
        {phase === 'playing' && game.id === 'memoria' && (
          <MemoryMatchGame
            playing
            level={levelPlayed}
            characterId={state.selectedCharacterId}
            skinId={state.selectedSkinId}
            onProgress={onProgress}
            onFinish={finish}
          />
        )}
        {phase === 'playing' && game.id === 'corrida' && (
          <EndlessRunGame
            playing
            characterId={state.selectedCharacterId}
            skinId={state.selectedSkinId}
            onProgress={onProgress}
            onFinish={finish}
          />
        )}

        {phase === 'done' && (
          <div className="stage-done">
            <div className="done-medal"><Trophy size={32} /></div>
            <span className="stage-kicker">{game.id === 'corrida' ? 'FIM DA CORRIDA' : 'FIM DE JOGO'}</span>
            <h2>{game.id === 'memoria' && performance.memoryCleared ? 'Nível completo' : 'Boa partida'}<span>.</span></h2>
            <div className="result-score">
              <strong>{score}</strong>
              <small>{game.id === 'corrida' ? 'METROS' : 'PONTOS'}</small>
            </div>
            <p className="result-reward">
              {completion
                ? `+${completion.coinsEarned} fichas virtuais · +${completion.xpEarned} XP · +${completion.rankPointsEarned} pontos de temporada${completion.dailyBonus ? ` · inclui bônus diário de ${completion.dailyBonus}` : ''}`
                : 'Seu resultado foi salvo neste dispositivo.'}
            </p>
            {game.id === 'reflexo' && (
              <div className="result-detail">
                <span>{performance.reflexReactionsMs?.length ?? 0} acertos</span>
                <span>Média {performance.reflexReactionsMs?.length
                  ? `${Math.round(performance.reflexReactionsMs.reduce((sum, value) => sum + value, 0) / performance.reflexReactionsMs.length)} ms`
                  : '—'}</span>
                <span>Melhor {state.bestReactionMs === null ? '—' : `${state.bestReactionMs} ms`}</span>
              </div>
            )}
            {game.id === 'memoria' && (
              <p className="game-result-note">
                {performance.memoryCleared
                  ? `Nível ${levelPlayed} completo. Próximo: nível ${state.memoryLevel}, ${getMemoryPairCount(state.memoryLevel)} pares.`
                  : `Tente o nível ${levelPlayed} de novo para liberar o próximo tabuleiro.`}
              </p>
            )}
            <div className="result-actions">
              <button className="button-primary" onClick={begin} data-testid="button-play-again">
                <RotateCcw size={15} /> Jogar de novo
              </button>
              <Link href="/games" className="button-quiet" data-testid="link-choose-game">
                Escolher outro <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="play-scorebar">
        <div>
          <span>{scoreLabel}</span>
          <strong data-testid="text-live-score">{score}<small> {unit}</small></strong>
        </div>
        <div className="scorebar-divider" />
        <div>
          <span>SEU RECORDE</span>
          <strong>{bestScore}<small> {unit}</small></strong>
        </div>
        <div className="play-tip">
          {game.id === 'corrida' ? <Award size={15} /> : <Sparkles size={15} />}
          {phase === 'playing'
            ? game.id === 'corrida' ? 'A velocidade aumenta na pista.' : 'Cada acerto melhora sua marca.'
            : recentResult ? `Última partida: ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(recentResult.playedAt))}` : 'Cada partida conta para a temporada.'}
        </div>
      </div>
      <p className="play-disclaimer"><LockKeyhole size={13} /> Desafio de habilidade. Fichas, pontos e XP são virtuais; não têm valor em dinheiro.</p>
    </div>
  );
}
