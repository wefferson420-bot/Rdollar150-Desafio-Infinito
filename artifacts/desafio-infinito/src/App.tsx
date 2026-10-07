import { useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter, Link, useParams } from 'wouter';
import { ArrowDownLeft, ArrowLeft, ArrowRight, Award, Bolt, Check, ChevronRight, CircleHelp, Coins, Crown, Flame, Gamepad2, Gem, Heart, Home, LockKeyhole, Medal, Play, RotateCcw, ShoppingBag, Sparkles, Star, Target, Trophy, UserRound, Zap, type LucideIcon } from 'lucide-react';
import { COSMETICS, completeGame, getLevel, getLevelProgress, purchaseCosmetic, selectCosmetic, useArcadeState, type Cosmetic, type GameCompletion, type GameId, type StoreResult } from '@/lib/arcade-state';

const queryClient = new QueryClient();

export type GameScore = { gameId: GameId; score: number; completedAt: Date };
export type Purchase = { itemId: string };
export type CosmeticSelection = { itemId: string };
export type ArcadeCallbacks = {
  onGameComplete?: (result: GameScore) => GameCompletion | undefined;
  onPurchase?: (purchase: Purchase) => StoreResult;
  onCosmeticSelect?: (selection: CosmeticSelection) => boolean;
};

type GameDefinition = { id: GameId; name: string; description: string; category: string; duration: string; icon: LucideIcon; color: string; score: string };
const games: GameDefinition[] = [
  { id: 'reflexo', name: 'Reflexo relâmpago', description: 'Toque no sinal assim que ele acender.', category: 'REFLEXO', duration: '20 SEG', icon: Bolt, color: 'lime', score: 'Pontue por reflexo' },
  { id: 'memoria', name: 'Memória de bolso', description: 'Encontre os pares antes do tempo acabar.', category: 'MEMÓRIA', duration: '45 SEG', icon: Gem, color: 'violet', score: 'Até 80 pts' },
  { id: 'toque-rapido', name: 'Toque turbo', description: 'Quantos toques cabem em 10 segundos?', category: 'VELOCIDADE', duration: '10 SEG', icon: Zap, color: 'orange', score: 'Um ponto por toque' },
];

const shopItems = COSMETICS.map((item) => ({
  ...item,
  type: item.kind === 'personagem' ? 'PERSONAGEM' : 'VISUAL',
  color: item.tone,
}));

function formatCoins(coins: number): string {
  return new Intl.NumberFormat('pt-BR').format(coins);
}

function todayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function formattedDate(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(date));
}

function gameUnit(gameId: GameId): string {
  return gameId === 'toque-rapido' ? 'toques' : 'pts';
}

function currentStreak(state: ReturnType<typeof useArcadeState>): number {
  if (!state.lastDailyDate) return 0;
  const today = todayKey();
  if (state.lastDailyDate === today) return state.dailyStreak;
  const nextDate = new Date(`${state.lastDailyDate}T12:00:00`);
  nextDate.setDate(nextDate.getDate() + 1);
  return todayKeyFromDate(nextDate) === today ? state.dailyStreak : 0;
}

function todayKeyFromDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function ownsCosmetic(state: ReturnType<typeof useArcadeState>, item: Cosmetic): boolean {
  return item.kind === 'personagem'
    ? state.ownedCharacterIds.includes(item.id)
    : state.ownedSkinIds.includes(item.id);
}

function BrandMark() {
  return <div className="brand-mark"><Sparkles className="brand-spark" size={20} /><span>R$1,50</span></div>;
}

function Wallet() {
  const { coins } = useArcadeState();
  return <div className="wallet" data-testid="text-wallet-balance"><span className="coin-icon"><Coins size={15} /></span><strong>{formatCoins(coins)}</strong><span className="wallet-label">fichas</span><Link href="/shop" className="wallet-add" aria-label="Ver loja" data-testid="button-wallet-shop"><ArrowRight size={14} /></Link></div>;
}

function Shell({ children, active = 'inicio' }: { children: React.ReactNode; active?: string }) {
  const state = useArcadeState();
  const streak = currentStreak(state);
  const nav = [
    { href: '/', label: 'Início', id: 'inicio', icon: Home },
    { href: '/games', label: 'Jogar', id: 'jogar', icon: Gamepad2 },
    { href: '/shop', label: 'Loja', id: 'loja', icon: ShoppingBag },
    { href: '/profile', label: 'Perfil', id: 'perfil', icon: UserRound },
  ];
  return <div className="app-shell">
    <aside className="desktop-rail">
      <Link href="/" className="logo-link" data-testid="link-home-logo"><BrandMark /></Link>
      <div className="rail-label">ARCADE</div>
      <nav className="rail-nav">{nav.map(item => <Link key={item.id} href={item.href} className={`rail-link ${active === item.id ? 'selected' : ''}`} data-testid={`link-nav-${item.id}`}><item.icon size={19} /><span>{item.label}</span></Link>)}</nav>
      <div className="rail-bottom"><div className="rail-status"><span className="online-dot" />DESAFIO DO DIA<br /><b>disponível</b></div><div className="rail-avatar">L</div></div>
    </aside>
    <main className="main-frame">
      <header className="topbar"><Link href="/" className="mobile-brand" data-testid="link-home-mobile"><BrandMark /></Link><div className="topbar-spacer" /><div className="streak-pill"><Flame size={15} /><span>{streak} {streak === 1 ? 'dia' : 'dias'}</span></div><Wallet /><Link href="/profile" className="avatar-button" aria-label="Abrir perfil" data-testid="button-open-profile">J</Link></header>
      <div className="content-area">{children}</div>
      <nav className="bottom-nav">{nav.map(item => <Link key={item.id} href={item.href} className={`bottom-link ${active === item.id ? 'selected' : ''}`} data-testid={`link-bottom-${item.id}`}><item.icon size={20} /><span>{item.label}</span></Link>)}</nav>
    </main>
  </div>;
}

function SectionEyebrow({ children }: { children: React.ReactNode }) { return <div className="eyebrow"><span />{children}</div>; }

function HomePage() {
  const state = useArcadeState();
  const streak = currentStreak(state);
  const level = getLevel(state.totalXp);
  const levelProgress = getLevelProgress(state.totalXp);
  const dailyComplete = state.lastDailyDate === todayKey();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const dateLabel = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date());
  return <Shell active="inicio"><div className="page-wrap home-page">
    <div className="greeting-row"><div><p className="date-line">{dateLabel}</p><h1>{greeting}, <em>jogador.</em></h1><p className="subhead">Bora bater seu recorde de hoje?</p></div><div className="level-chip"><span className="level-star"><Star size={13} fill="currentColor" /></span><span>NÍVEL {String(level).padStart(2, '0')}</span></div></div>
    <section className="hero-challenge" data-testid="card-daily-challenge">
      <div className="hero-grain" /><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
      <div className="hero-copy"><SectionEyebrow>DESAFIO DO DIA <span className="today-tag">{dailyComplete ? 'FEITO' : 'NOVO'}</span></SectionEyebrow><h2>Uma partida<br /><i>por dia.</i></h2><p>Jogue qualquer minijogo para manter sua sequência e ganhar fichas extras.</p><div className="hero-meta"><span><Target size={14} /> {dailyComplete ? 'DESAFIO CONCLUÍDO' : 'JOGUE UMA PARTIDA'}</span><span><Coins size={14} /> +20 fichas</span></div><Link href="/games" className="button-primary" data-testid="button-play-daily"><Play size={15} fill="currentColor" /> {dailyComplete ? 'Jogar de novo' : 'Encarar desafio'} <ArrowRight size={16} /></Link></div>
      <div className="hero-art"><div className="art-ring ring-a" /><div className="art-ring ring-b" /><div className="arcade-token"><Bolt size={78} strokeWidth={1.7} fill="currentColor" /></div><Sparkles className="art-spark spark-a" size={23} /><Sparkles className="art-spark spark-b" size={30} /><div className="score-bubble">+20 <small>FICHAS</small></div></div>
      <div className="hero-foot"><span>SUA SEQUÊNCIA</span><strong>{streak} <small>{streak === 1 ? 'dia' : 'dias'}</small></strong><div className="mini-progress"><span style={{ width: `${Math.min(100, streak * 20)}%` }} /></div></div>
    </section>
    <div className="section-heading"><div><SectionEyebrow>UM MINUTO PRA VOCÊ</SectionEyebrow><h2>Vai mais uma?</h2></div><Link href="/games" className="text-link" data-testid="link-all-games">Ver todos <ArrowRight size={15} /></Link></div>
    <div className="quick-games">{games.slice(0, 2).map((game, i) => <GameTile key={game.id} game={game} index={i} />)}</div>
    <section className="progress-strip"><div className="progress-icon"><Trophy size={20} /></div><div className="progress-copy"><b>{levelProgress >= 75 ? 'Quase lá!' : 'Seu próximo nível'}</b><span>Mais {100 - levelProgress} XP para avançar.</span></div><div className="progress-value">{levelProgress} <small>/ 100 XP</small></div><div className="xp-track"><span style={{ width: `${levelProgress}%` }} /></div></section>
    <p className="no-bet-note"><LockKeyhole size={13} /> Só diversão: aqui suas fichas são virtuais e não têm valor em dinheiro.</p>
  </div></Shell>;
}

function GameTile({ game, index = 0 }: { game: typeof games[number]; index?: number }) {
  const Icon = game.icon;
  return <Link href={`/play/${game.id}`} className={`game-tile tone-${game.color}`} data-testid={`card-game-${game.id}`}><div className="tile-top"><span className="tile-icon"><Icon size={20} /></span><span className="tile-duration">{game.duration}</span></div><div className="tile-copy"><span className="tile-category">{game.category}</span><h3>{game.name}</h3><p>{game.description}</p></div><div className="tile-footer"><span>{game.score}</span><span className="tile-arrow"><ArrowRight size={16} /></span></div><span className="tile-index">0{index + 1}</span></Link>;
}

function GamesPage() {
  const [filter, setFilter] = useState('TODOS');
  const filters = ['TODOS', 'REFLEXO', 'MEMÓRIA', 'VELOCIDADE'];
  const visible = filter === 'TODOS' ? games : games.filter(g => g.category === filter);
  return <Shell active="jogar"><div className="page-wrap">
    <div className="page-heading"><div><SectionEyebrow>ESCOLHA SEU DESAFIO</SectionEyebrow><h1>Qual vai ser?</h1><p>Partidas rápidas. Recordes que duram.</p></div><div className="heading-mark"><Gamepad2 size={28} /></div></div>
    <div className="filter-row" role="tablist" aria-label="Filtrar jogos">{filters.map(item => <button key={item} className={`filter-button ${filter === item ? 'active' : ''}`} onClick={() => setFilter(item)} data-testid={`button-filter-${item.toLowerCase()}`}>{item}</button>)}</div>
    <div className="games-grid">{visible.map((game, i) => <GameTile key={game.id} game={game} index={games.indexOf(game)} />)}</div>
    <div className="games-note"><div className="note-icon"><CircleHelp size={18} /></div><div><b>Como funciona?</b><p>Jogue, pratique e melhore sua pontuação. Suas fichas são virtuais — sem apostas, sem dinheiro real.</p></div></div>
  </div></Shell>;
}

function PlayPage({ onGameComplete }: Pick<ArcadeCallbacks, 'onGameComplete'>) {
  const { gameId = 'reflexo' } = useParams<{ gameId: string }>();
  const gameExists = games.some((candidate) => candidate.id === gameId);
  const game = games.find(g => g.id === gameId) || games[0];
  const state = useArcadeState();
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(gameId === 'memoria' ? 45 : gameId === 'reflexo' ? 20 : 10);
  const [lit, setLit] = useState(false);
  const [cards, setCards] = useState<number[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [tapCount, setTapCount] = useState(0);
  const [resultSent, setResultSent] = useState(false);
  const [early, setEarly] = useState(false);
  const [completion, setCompletion] = useState<GameCompletion | null>(null);
  const litAt = useRef<number | null>(null);
  const totalTime = game.id === 'memoria' ? 45 : game.id === 'reflexo' ? 20 : 10;
  const bestScore = state.bestScores[game.id] ?? 0;
  useEffect(() => {
    setPhase('ready');
    setScore(0);
    setTime(totalTime);
    setLit(false);
    setCards([]);
    setFlipped([]);
    setMatched([]);
    setTapCount(0);
    setResultSent(false);
    setCompletion(null);
    setEarly(false);
    litAt.current = null;
  }, [gameId, totalTime]);
  useEffect(() => {
    if (phase !== 'playing' || gameId !== 'reflexo') return;
    setLit(false);
    litAt.current = null;
    const delay = window.setTimeout(() => {
      litAt.current = Date.now();
      setLit(true);
    }, 900 + Math.random() * 1800);
    return () => window.clearTimeout(delay);
  }, [phase, gameId, score]);
  useEffect(() => {
    if (phase !== 'playing') return;
    const tick = window.setInterval(() => setTime(t => {
      if (t <= 1) { window.clearInterval(tick); setPhase('done'); return 0; }
      return t - 1;
    }), 1000);
    return () => window.clearInterval(tick);
  }, [phase]);
  useEffect(() => {
    if (phase === 'done' && !resultSent) {
      setResultSent(true);
      const result = onGameComplete?.({ gameId: game.id, score, completedAt: new Date() });
      setCompletion(result ?? null);
    }
  }, [phase, resultSent, onGameComplete, game.id, gameId, score]);
  useEffect(() => {
    if (gameId === 'memoria' && phase === 'playing' && cards.length === 0) setCards([0, 1, 2, 3, 4, 5, 6, 7].sort(() => Math.random() - .5).map(n => n % 4));
  }, [gameId, phase, cards.length]);
  useEffect(() => {
    if (flipped.length !== 2) return;
    const [a, b] = flipped;
    if (cards[a] === cards[b]) {
      const timer = window.setTimeout(() => { setMatched(current => [...current, a, b]); setFlipped([]); setScore(s => s + 20); }, 350);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setFlipped([]), 700);
    return () => window.clearTimeout(timer);
  }, [flipped, cards]);
  useEffect(() => {
    if (gameId === 'memoria' && phase === 'playing' && matched.length === 8) {
      setPhase('done');
    }
  }, [gameId, phase, matched.length]);
  const begin = () => { setPhase('playing'); setTime(totalTime); setScore(0); setTapCount(0); setResultSent(false); setCompletion(null); setMatched([]); setFlipped([]); setCards([]); setEarly(false); setLit(false); litAt.current = null; };
  const handleReflex = () => {
    if (phase !== 'playing') return;
    if (!lit) { setEarly(true); setScore(s => Math.max(0, s - 5)); return; }
    const reactionMs = Date.now() - (litAt.current ?? Date.now());
    const points = Math.max(5, 100 - Math.floor(reactionMs / 5));
    setScore(s => Math.min(1000, s + points));
    setLit(false);
    litAt.current = null;
  };
  const handleTap = () => { if (phase !== 'playing') return; const next = tapCount + 1; setTapCount(next); setScore(next); };
  const pressCard = (index: number) => { if (phase !== 'playing' || flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return; setFlipped(v => [...v, index]); };
  const visibleScore = gameId === 'toque-rapido' ? tapCount : score;
  const recentResult = state.recentResults.find((result) => result.gameId === game.id);
  if (!gameExists) return <NotFound />;
  return <Shell active="jogar"><div className="play-wrap">
    <Link href="/games" className="back-link" data-testid="link-back-games"><ArrowLeft size={15} /> Todos os jogos</Link>
    <div className="play-top"><div><SectionEyebrow>{game.category} · PARTIDA RÁPIDA</SectionEyebrow><h1>{game.name}</h1><p>{game.description}</p></div><div className="timer-badge"><span>TEMPO</span><strong className={time <= 5 && phase === 'playing' ? 'timer-low' : ''}>00:{String(time).padStart(2, '0')}</strong></div></div>
    <div className={`game-stage stage-${gameId}`} data-testid="game-stage">
      {phase === 'ready' && <div className="stage-ready"><div className={`ready-symbol tone-${game.color}`}><game.icon size={36} /></div><span className="stage-kicker">PRONTO PRA JOGAR?</span><h2>Um, dois...<br /><i>valendo.</i></h2><p>Você tem {totalTime} segundos. Dê o seu melhor.</p><button className="button-primary" onClick={begin} data-testid="button-start-game"><Play size={16} fill="currentColor" /> Começar partida</button></div>}
      {phase === 'playing' && gameId === 'reflexo' && <div className="reflex-game"><span className="stage-kicker">{early ? 'CALMA! ESPERE O SINAL' : lit ? 'AGORA!' : 'FIQUE DE OLHO...'}</span><button aria-label={lit ? 'Toque agora' : 'Aguarde o sinal'} className={`reflex-target ${lit ? 'is-lit' : ''}`} onClick={handleReflex} data-testid="button-reflex-target"><span>{lit ? 'TOQUE!' : '...'}</span></button><p>{lit ? 'Vai, vai, vai!' : 'Toque só quando a luz acender'}</p></div>}
      {phase === 'playing' && gameId === 'toque-rapido' && <div className="tap-game"><span className="stage-kicker">TOQUE SEM PARAR</span><button className="tap-target" onClick={handleTap} aria-label="Toque para pontuar" data-testid="button-tap-target"><Zap size={48} fill="currentColor" /><span>TOCA!</span></button><p>Um toque por vez. Sem perder o ritmo.</p></div>}
      {phase === 'playing' && gameId === 'memoria' && <div className="memory-game"><span className="stage-kicker">ACHE OS PARES</span><div className="memory-grid">{cards.map((symbol, index) => <button key={index} className={`memory-card ${flipped.includes(index) || matched.includes(index) ? 'turned' : ''} ${matched.includes(index) ? 'matched' : ''}`} onClick={() => pressCard(index)} aria-label={`Carta ${index + 1}`} data-testid={`button-memory-card-${index}`}>{flipped.includes(index) || matched.includes(index) ? ['A', 'B', 'C', 'D'][symbol] : '?'}</button>)}</div><p>{matched.length === 8 ? 'Mandou bem! Todos os pares encontrados.' : 'Sua memória está afiada?'}</p></div>}
      {phase === 'done' && <div className="stage-done"><div className="done-medal"><Trophy size={32} /></div><span className="stage-kicker">FIM DE JOGO</span><h2>Boa partida<span>.</span></h2><div className="result-score"><strong>{visibleScore}</strong><small>{gameId === 'toque-rapido' ? 'TOQUES' : 'PONTOS'}</small></div><p className={completion ? 'result-reward' : undefined}>{completion ? `+${completion.coinsEarned} fichas virtuais${completion.dailyBonus ? ` · inclui bônus diário de ${completion.dailyBonus}` : ''}` : 'Mais uma rodada e esse recorde é seu.'}</p><div className="result-actions"><button className="button-primary" onClick={begin} data-testid="button-play-again"><RotateCcw size={15} /> Jogar de novo</button><Link href="/games" className="button-quiet" data-testid="link-choose-game">Escolher outro</Link></div></div>}
    </div>
    <div className="play-scorebar"><div><span>PONTUAÇÃO</span><strong data-testid="text-live-score">{visibleScore}<small> {gameUnit(game.id)}</small></strong></div><div className="scorebar-divider" /><div><span>SEU RECORDE</span><strong>{bestScore}<small> {gameUnit(game.id)}</small></strong></div><div className="play-tip"><Sparkles size={15} /> {phase === 'playing' ? 'Você consegue!' : recentResult ? `Última partida: ${formattedDate(recentResult.playedAt)}` : 'Cada partida te deixa mais perto.'}</div></div>
    <p className="play-disclaimer"><LockKeyhole size={13} /> Desafio de habilidade. As fichas ganhas são virtuais e não podem ser convertidas em dinheiro.</p>
  </div></Shell>;
}

function ShopPage({ onPurchase, onCosmeticSelect }: Pick<ArcadeCallbacks, 'onPurchase' | 'onCosmeticSelect'>) {
  const state = useArcadeState();
  const [activeTab, setActiveTab] = useState('TUDO');
  const [notice, setNotice] = useState('');
  const categories = ['TUDO', 'PERSONAGENS', 'VISUAIS'];
  const filtered = shopItems.filter(item => activeTab === 'TUDO' || (activeTab === 'PERSONAGENS' ? item.type === 'PERSONAGEM' : item.type !== 'PERSONAGEM'));
  const featured = shopItems.find((item) => item.id === 'nina-neon')!;
  const owned = (item: Cosmetic) => ownsCosmetic(state, item);
  const equipped = (item: Cosmetic) => item.kind === 'personagem'
    ? state.selectedCharacterId === item.id
    : state.selectedSkinId === item.id;
  const buy = (item: Cosmetic) => {
    if (owned(item)) {
      const selected = onCosmeticSelect?.({ itemId: item.id }) ?? false;
      setNotice(selected ? `${item.name} equipado.` : 'Não foi possível equipar este item.');
      return;
    }
    const result = onPurchase?.({ itemId: item.id });
    if (result?.ok) {
      setNotice(`${item.name} comprado com fichas virtuais.`);
    } else if (result?.reason === 'not-enough-coins') {
      setNotice('Você ainda não tem fichas suficientes para este item.');
    } else {
      setNotice('Não foi possível concluir essa compra.');
    }
  };
  return <Shell active="loja"><div className="page-wrap">
    <div className="page-heading shop-heading"><div><SectionEyebrow>SEU ESTILO, SUAS REGRAS</SectionEyebrow><h1>Loja de itens</h1><p>Um toque de personalidade para cada partida.</p></div><div className="shop-balance"><span><Coins size={15} /></span><div><strong>{formatCoins(state.coins)}</strong><small>FICHAS</small></div></div></div>
    <section className="featured-item"><div className="featured-copy"><span className="featured-label"><Sparkles size={13} /> DESTAQUE DA SEMANA</span><h2>Chegou a<br /><i>galera neon.</i></h2><p>Personagens com brilho próprio, direto do fliperama do futuro.</p><div className="featured-price"><span><Coins size={16} /> {featured.price}</span><button onClick={() => buy(featured)} className="button-light" data-testid="button-buy-featured">{owned(featured) ? equipped(featured) ? 'Equipado' : 'Equipar' : 'Ver personagem'} <ArrowRight size={15} /></button></div></div><div className="featured-figure"><div className="figure-halo" /><div className="figure-body">NN</div><Sparkles className="figure-star" size={23} /><div className="figure-caption">NINA<br /><small>EDIÇÃO NEON</small></div></div></section>
    <div className="section-heading shop-section-title"><div><SectionEyebrow>FEITO PRA VOCÊ</SectionEyebrow><h2>Garimpe aí</h2></div><div className="filter-row compact" role="tablist">{categories.map(category => <button key={category} className={`filter-button ${activeTab === category ? 'active' : ''}`} onClick={() => setActiveTab(category)} data-testid={`button-shop-filter-${category.toLowerCase()}`}>{category}</button>)}</div></div>
    <div className="shop-grid">{filtered.map(item => <article key={item.id} className={`shop-card item-${item.color}`} data-testid={`card-shop-${item.id}`}><div className="item-art"><div className="item-disc">{item.look}</div><span className="item-type">{item.type}</span>{owned(item) && <span className="owned-tag"><Check size={11} /> NA COLEÇÃO</span>}</div><div className="item-info"><div><h3>{item.name}</h3><span>{item.type === 'PERSONAGEM' ? item.description : item.description}</span></div><button className={`item-buy ${owned(item) ? 'is-owned' : ''}`} onClick={() => buy(item)} data-testid={`button-buy-${item.id}`}>{owned(item) ? equipped(item) ? 'Equipado' : 'Equipar' : <><Coins size={13} /> {item.price}</>}</button></div></article>)}</div>
    {notice && <div className="shop-notice" role="status" data-testid="status-shop-notice"><Check size={15} />{notice}<button onClick={() => setNotice('')} aria-label="Fechar aviso">×</button></div>}
    <div className="shop-footnote"><LockKeyhole size={13} /> Itens e fichas são virtuais. Nenhuma compra envolve dinheiro real.</div>
  </div></Shell>;
}

function ProfilePage() {
  const state = useArcadeState();
  const streak = currentStreak(state);
  const level = getLevel(state.totalXp);
  const levelProgress = getLevelProgress(state.totalXp);
  const [shared, setShared] = useState(false);
  const achievements = [
    { name: 'Primeira partida', description: 'Complete seu primeiro jogo', unlocked: state.totalGames >= 1, icon: Gamepad2, color: 'purple' },
    { name: 'Fogo aceso', description: 'Jogue 3 dias seguidos', unlocked: streak >= 3, icon: Flame, color: 'gold' },
    { name: 'Dedos ligeiros', description: 'Faça 25 toques em uma rodada', unlocked: (state.bestScores['toque-rapido'] ?? 0) >= 25, icon: Zap, color: 'purple' },
  ];
  const unlockedAchievements = achievements.filter((badge) => badge.unlocked).length;
  const shareProfile = async () => {
    const text = `Meu progresso no R$1,50 — Desafio Infinito: nível ${level}, ${state.totalGames} partidas e ${formatCoins(state.totalScore)} pontos.`;
    try {
      await navigator.clipboard.writeText(text);
      setShared(true);
      window.setTimeout(() => setShared(false), 1800);
    } catch (error) {
      console.error('Não foi possível copiar o resumo do perfil.', error);
    }
  };
  return <Shell active="perfil"><div className="page-wrap profile-page">
    <div className="profile-cover"><div className="cover-grid" /><div className="profile-avatar">J<span className="avatar-online" /></div><div className="profile-intro"><span className="profile-label">PROGRESSO NESTE DISPOSITIVO</span><h1>Seu perfil</h1><p>Uma partida de cada vez.</p></div><div className="profile-level"><span><Star size={14} fill="currentColor" /></span><div><b>NÍVEL {String(level).padStart(2, '0')}</b><small>Arcadeiro</small></div></div></div>
    <section className="profile-xp"><div className="xp-label-row"><div><span>PROGRESSO DO NÍVEL</span><b>{levelProgress} <small>/ 100 XP</small></b></div><div className="next-level">{100 - levelProgress} XP para o próximo</div></div><div className="xp-track large"><span style={{ width: `${levelProgress}%` }} /></div></section>
    <div className="section-heading profile-stat-heading"><div><SectionEyebrow>SUAS CONQUISTAS</SectionEyebrow><h2>Olha só o que já fez</h2></div><button className="share-button" onClick={shareProfile} data-testid="button-share-profile"><ArrowDownLeft size={15} /> {shared ? 'Copiado!' : 'Compartilhar'}</button></div>
    <div className="stats-grid">
      <div className="stat-card"><div className="stat-icon violet"><Gamepad2 size={18} /></div><span>PARTIDAS JOGADAS</span><strong>{formatCoins(state.totalGames)}</strong><small>neste dispositivo</small></div>
      <div className="stat-card"><div className="stat-icon orange"><Flame size={18} /></div><span>SEQUÊNCIA ATUAL</span><strong>{streak} <i>{streak === 1 ? 'dia' : 'dias'}</i></strong><small>jogando em dias seguidos</small></div>
      <div className="stat-card"><div className="stat-icon lime"><Trophy size={18} /></div><span>PONTOS TOTAIS</span><strong>{formatCoins(state.totalScore)}</strong><small>em todas as partidas</small></div>
      <div className="stat-card"><div className="stat-icon pink"><Medal size={18} /></div><span>CONQUISTAS</span><strong>{unlockedAchievements} <i>/ {achievements.length}</i></strong><small>conquistas desbloqueadas</small></div>
    </div>
    <div className="profile-columns"><section className="record-panel"><div className="panel-title"><div><SectionEyebrow>SEUS RECORDES</SectionEyebrow><h2>Melhores marcas</h2></div><Award size={19} /></div>{games.map((game) => { const Icon = game.icon; const best = state.bestScores[game.id]; const last = state.recentResults.find((result) => result.gameId === game.id); return <div className="record-row" key={game.id}><span className={`record-game-icon ${game.color}`}><Icon size={16} /></span><div className="record-name"><b>{game.name}</b><small>{last ? `Última partida: ${formattedDate(last.playedAt)}` : 'Jogue para registrar um recorde'}</small></div><strong>{best ?? '—'} <small>{gameUnit(game.id)}</small></strong></div>; })}</section>
      <section className="badges-panel"><div className="panel-title"><div><SectionEyebrow>VITRINE</SectionEyebrow><h2>Medalhas recentes</h2></div><Crown size={19} /></div>{achievements.map((badge) => { const Icon = badge.icon; return <div className="badge-row" key={badge.name}><div className={`badge-medal badge-${badge.color}`}><Icon size={19} /></div><div><b>{badge.name}</b><small>{badge.description}</small></div><span className="badge-check">{badge.unlocked ? <Check size={13} /> : <LockKeyhole size={12} />}</span></div>; })}<Link href="/games" className="profile-more" data-testid="link-more-games">Buscar nova medalha <ChevronRight size={15} /></Link></section></div>
    <p className="profile-note"><Heart size={13} /> Seu progresso é só seu. Jogue no seu ritmo.</p>
  </div></Shell>;
}

function Router({ callbacks }: { callbacks: ArcadeCallbacks }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Switch>
    <Route path="/" component={HomePage} />
    <Route path="/games" component={GamesPage} />
    <Route path="/play/:gameId"><PlayPage onGameComplete={callbacks.onGameComplete} /></Route>
    <Route path="/shop"><ShopPage onPurchase={callbacks.onPurchase} onCosmeticSelect={callbacks.onCosmeticSelect} /></Route>
    <Route path="/profile" component={ProfilePage} />
    <Route component={NotFound} />
  </Switch></ErrorBoundary>;
}

function App() {
  const callbacks: ArcadeCallbacks = {
    onGameComplete: ({ gameId, score }) => completeGame(gameId, score),
    onPurchase: ({ itemId }) => purchaseCosmetic(itemId),
    onCosmeticSelect: ({ itemId }) => selectCosmetic(itemId),
  };
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router callbacks={callbacks} /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
