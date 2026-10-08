import { useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleHelp,
  Coins,
  Gamepad2,
  LockKeyhole,
  Medal,
  Package,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from 'lucide-react';
import './meta-pages.css';

export type RankingPageProps = {
  points: number;
  tier: { id: string; label: string; coinsReward: number; xpReward: number; minPoints: number };
  nextTier?: { id: string; label: string; minPoints: number };
  progressPercent: number;
  daysRemaining: number;
  endsAt: string | Date;
  history: {
    id: string;
    tierLabel: string;
    points: number;
    coinsAwarded: number;
    xpAwarded: number;
    cosmeticAwarded?: string;
    endedAt: string | Date;
  }[];
};

export type MissionsPageProps = {
  missions: {
    id: string;
    title: string;
    description: string;
    progress: number;
    target: number;
    coinsReward: number;
    xpReward: number;
    claimed: boolean;
    claimable: boolean;
  }[];
  onClaim: (id: string) => void;
};

export type CoinShopPageProps = { balance: number };
export type AboutPageProps = Record<string, never>;

const number = (value: number) => new Intl.NumberFormat('pt-BR').format(value);
const date = (value: string | Date) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));

function PageIntro({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof Trophy;
}) {
  return (
    <header className="meta-intro">
      <div className="meta-intro-copy">
        <div className="meta-eyebrow"><span />{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="meta-intro-mark" aria-hidden="true"><Icon size={25} strokeWidth={1.7} /></div>
    </header>
  );
}

function RewardLine({ coins, xp }: { coins: number; xp: number }) {
  return (
    <div className="meta-reward-line">
      <span><Coins size={14} /> {number(coins)} fichas</span>
      <span><Star size={13} /> {number(xp)} XP</span>
    </div>
  );
}

export function RankingPage({
  points,
  tier,
  nextTier,
  progressPercent,
  daysRemaining,
  endsAt,
  history,
}: RankingPageProps) {
  const progress = Math.min(100, Math.max(0, progressPercent));
  const pointsToNext = nextTier ? Math.max(0, nextTier.minPoints - points) : 0;

  return (
    <main className="meta-page ranking-page">
      <PageIntro
        eyebrow="TEMPORADA LOCAL"
        title="Seu ritmo, seu ranking."
        description="Acompanhe a evolução das suas partidas neste dispositivo."
        icon={Trophy}
      />

      <section className="ranking-hero" aria-labelledby="ranking-current-title">
        <div className="ranking-hero-top">
          <div className="meta-eyebrow"><span />TEMPORADA EM ANDAMENTO</div>
          <div className="season-countdown"><CalendarDays size={14} /> {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}</div>
        </div>
        <div className="ranking-hero-main">
          <div>
            <span className="ranking-label">SUA CATEGORIA</span>
            <h2 id="ranking-current-title">{tier.label}</h2>
            <p className="ranking-points"><strong>{number(points)}</strong> pontos</p>
          </div>
          <div className="standing-stamp" aria-label="Sua colocação pessoal neste dispositivo: 1 de 1">
            <span>POSIÇÃO PESSOAL</span><strong>1<span>/1</span></strong><small>neste dispositivo</small>
          </div>
        </div>
        <div className="ranking-progress-wrap">
          <div className="ranking-progress-caption">
            <span>PROGRESSO DA CATEGORIA</span>
            <strong>{Math.round(progress)}%</strong>
          </div>
          <div className="meta-progress" role="progressbar" aria-label="Progresso da categoria" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="ranking-progress-foot">
            <span>{number(tier.minPoints)} pts · {tier.label}</span>
            {nextTier && <span>Faltam {number(pointsToNext)} pts para {nextTier.label}</span>}
          </div>
        </div>
        <div className="ranking-reward">
          <div className="ranking-reward-copy"><Medal size={17} /><span><b>Recompensa ao fim da temporada</b><small>Por alcançar esta categoria</small></span></div>
          <RewardLine coins={tier.coinsReward} xp={tier.xpReward} />
        </div>
        <div className="ranking-season-end">Temporada encerra em <strong>{date(endsAt)}</strong></div>
      </section>

      <aside className="meta-notice" role="note">
        <ShieldCheck size={17} />
        <p><strong>Ranking pessoal, não online.</strong> Este é um protótipo local: sua posição 1/1 representa apenas seu progresso neste dispositivo. Não há outros jogadores nem classificação pela internet.</p>
      </aside>

      <section className="meta-history" aria-labelledby="ranking-history-heading">
        <div className="meta-section-heading">
          <div><div className="meta-eyebrow"><span />SEU CAMINHO</div><h2 id="ranking-history-heading">Temporadas anteriores</h2></div>
          <span className="meta-count">{history.length} {history.length === 1 ? 'registro' : 'registros'}</span>
        </div>
        {history.length ? (
          <div className="history-list">
            {history.map((item) => (
              <article className="history-row" key={item.id}>
                <span className="history-medal"><Trophy size={16} /></span>
                <div className="history-info"><strong>{item.tierLabel}</strong><span>{date(item.endedAt)} · {number(item.points)} pontos</span>{item.cosmeticAwarded && <span className="skin-unlock-badge"><Sparkles size={11} /> Skin desbloqueada: {item.cosmeticAwarded.replace(/-/g, ' ')}</span>}</div>
                <RewardLine coins={item.coinsAwarded} xp={item.xpAwarded} />
              </article>
            ))}
          </div>
        ) : (
          <div className="meta-empty"><div className="meta-empty-icon"><RotateCcw size={18} /></div><div><strong>Seu histórico começa aqui</strong><p>Quando uma temporada terminar, o resultado aparece neste espaço.</p></div></div>
        )}
      </section>
    </main>
  );
}

export function MissionsPage({ missions, onClaim }: MissionsPageProps) {
  const total = missions.length;
  const completed = missions.filter((mission) => mission.progress >= mission.target).length;
  return (
    <main className="meta-page missions-page">
      <PageIntro
        eyebrow="OBJETIVOS DO ARCADE"
        title="Missões da vez."
        description="Pequenos objetivos para dar outro ritmo às suas partidas."
        icon={Zap}
      />
      <section className="mission-summary">
        <div className="mission-summary-mark"><Sparkles size={20} /></div>
        <div><span>MISSÕES CONCLUÍDAS</span><strong>{number(completed)} <small>/ {number(total)}</small></strong></div>
        <div className="mission-summary-rule" />
        <p>As recompensas são virtuais e ficam no seu progresso local.</p>
      </section>
      <div className="meta-section-heading mission-list-heading">
        <div><div className="meta-eyebrow"><span />NO SEU TEMPO</div><h2>Uma partida de cada vez</h2></div>
      </div>
      {missions.length ? (
        <div className="mission-list">
          {missions.map((mission, index) => {
            const ratio = mission.target > 0 ? Math.min(100, Math.max(0, (mission.progress / mission.target) * 100)) : 0;
            const finished = mission.progress >= mission.target;
            return (
              <article className={`mission-card ${finished ? 'is-finished' : ''}`} key={mission.id} style={{ animationDelay: `${index * 55}ms` }}>
                <div className="mission-card-head">
                  <span className="mission-index">{String(index + 1).padStart(2, '0')}</span>
                  <div className="mission-card-copy"><h3>{mission.title}</h3><p>{mission.description}</p></div>
                  <div className="mission-check" aria-hidden="true">{finished ? <Check size={16} /> : <Gamepad2 size={16} />}</div>
                </div>
                <div className="mission-progress-line">
                  <div className="meta-progress" role="progressbar" aria-label={`Progresso: ${mission.title}`} aria-valuemin={0} aria-valuemax={mission.target} aria-valuenow={Math.min(mission.progress, mission.target)}>
                    <span style={{ width: `${ratio}%` }} />
                  </div>
                  <span>{number(Math.min(mission.progress, mission.target))}<i>/</i>{number(mission.target)}</span>
                </div>
                <div className="mission-card-foot">
                  <RewardLine coins={mission.coinsReward} xp={mission.xpReward} />
                  {mission.claimed ? (
                    <span className="mission-claimed"><Check size={14} /> Resgatada</span>
                  ) : (
                    <button className="meta-button mission-claim" onClick={() => onClaim(mission.id)} disabled={!mission.claimable} data-testid={`button-claim-mission-${mission.id}`}>
                      {mission.claimable ? 'Resgatar' : 'Em andamento'} {mission.claimable && <ArrowRight size={14} />}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="meta-empty"><div className="meta-empty-icon"><Sparkles size={18} /></div><div><strong>Nenhuma missão por enquanto</strong><p>Quando houver novos objetivos, eles aparecem por aqui.</p></div></div>
      )}
      <p className="meta-footnote"><LockKeyhole size={13} /> Fichas e XP são virtuais; não têm valor em dinheiro.</p>
    </main>
  );
}

const coinPackages = [
  { amount: 100, label: 'Primeiro impulso', detail: 'Um começo leve' },
  { amount: 500, label: 'Boa sequência', detail: 'Para mais partidas' },
  { amount: 1200, label: 'Fôlego extra', detail: 'Um estoque maior' },
  { amount: 3000, label: 'Modo maratona', detail: 'Para quem não para' },
];

export function CoinShopPage({ balance }: CoinShopPageProps) {
  const [notice, setNotice] = useState('');
  return (
    <main className="meta-page coin-shop-page">
      <PageIntro
        eyebrow="FICHAS VIRTUAIS"
        title="Seu próximo impulso."
        description="Confira as opções de fichas do arcade. Nenhum pagamento é processado aqui."
        icon={Coins}
      />
      <section className="coin-balance-panel">
        <div className="coin-balance-icon"><Coins size={23} /></div>
        <div><span>SALDO NESTE DISPOSITIVO</span><strong>{number(balance)} <small>fichas</small></strong></div>
        <div className="balance-orbit" aria-hidden="true"><span /><span /><span /></div>
      </section>
      <div className="meta-section-heading coin-packages-heading">
        <div><div className="meta-eyebrow"><span />PACOTES DISPONÍVEIS</div><h2>Escolha um pacote</h2></div>
      </div>
      <div className="coin-package-list">
        {coinPackages.map((pack, index) => (
          <article className={`coin-package coin-package-${index + 1}`} key={pack.amount}>
            <div className="package-art" aria-hidden="true"><span className="package-coin"><Coins size={21} /></span><span className="package-spark"><Sparkles size={13} /></span></div>
            <div className="package-copy"><span>{pack.label}</span><strong>{number(pack.amount)} <small>fichas</small></strong><p>{pack.detail}</p></div>
            <button className="meta-button package-button" onClick={() => setNotice('Compra disponível na versão Android')} data-testid={`button-coin-package-${pack.amount}`}>
              <Package size={15} /> Compra disponível na versão Android
            </button>
          </article>
        ))}
      </div>
      {notice && <div className="coin-shop-notice" role="status" data-testid="status-coin-shop-notice"><CircleHelp size={16} /><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Fechar aviso"><span aria-hidden="true">×</span></button></div>}
      <aside className="meta-notice coin-shop-note" role="note">
        <LockKeyhole size={16} />
        <p>As fichas são itens virtuais, sem valor em dinheiro. Este protótipo não conclui nem registra compras.</p>
      </aside>
    </main>
  );
}

export function AboutPage() {
  return (
    <main className="meta-page about-page">
      <PageIntro
        eyebrow="SOBRE O ARCADE"
        title="Um desafio de cada vez."
        description="Um fliperama de bolso para superar as suas próprias marcas."
        icon={Gamepad2}
      />
      <section className="about-title-card">
        <div className="about-title-art" aria-hidden="true"><div className="about-orbit about-orbit-a" /><div className="about-orbit about-orbit-b" /><div className="about-mark"><Zap size={39} /></div><span className="about-dot dot-a" /><span className="about-dot dot-b" /></div>
        <div className="about-title-copy"><div className="meta-eyebrow"><span />ARCADE DE HABILIDADE</div><h2>R$1,50 <i>—</i><br />Desafio Infinito</h2><p>O nome é identidade de jogo, não preço. Aqui, o desafio é melhorar o seu próprio reflexo, memória e distância de corrida, partida após partida.</p><span className="about-version">VERSÃO 0.1 · PROTÓTIPO LOCAL</span></div>
      </section>
      <section className="about-values" aria-label="Como funciona o jogo">
        <article className="about-value">
          <span className="about-value-icon"><TargetIcon /></span>
          <div><span>01 / PRÁTICA</span><h3>Seu ritmo é a meta</h3><p>Minijogos rápidos para acompanhar seu progresso e buscar marcas pessoais melhores.</p></div>
        </article>
        <article className="about-value">
          <span className="about-value-icon is-gold"><Coins size={19} /></span>
          <div><span>02 / RECOMPENSAS</span><h3>Só no jogo</h3><p>Fichas, pontos e recompensas são virtuais. Não existem prêmios em dinheiro nem conversão em valor real.</p></div>
        </article>
        <article className="about-value">
          <span className="about-value-icon is-mint"><ShieldCheck size={19} /></span>
          <div><span>03 / PROTÓTIPO</span><h3>Progresso local</h3><p>Esta versão guarda a experiência no dispositivo. Não há ranking online ou competição com outros jogadores.</p></div>
        </article>
      </section>
      <section className="about-store-note">
        <div className="store-note-icon"><Package size={19} /></div>
        <div><span>SE UM DIA HOUVER UMA COMPRA</span><h3>Somente no Android, pela Google Play.</h3><p>Qualquer compra futura só seria oferecida pela Google Play na versão Android, se essa opção vier a existir. Esta versão não oferece nem processa compras.</p></div>
      </section>
      <div className="about-signoff"><span>R$1,50 — DESAFIO INFINITO</span><span>Jogue. Pratique. Supere-se.</span></div>
    </main>
  );
}

function TargetIcon() {
  return <span className="about-target-icon" aria-hidden="true"><span /><span /><span /></span>;
}
