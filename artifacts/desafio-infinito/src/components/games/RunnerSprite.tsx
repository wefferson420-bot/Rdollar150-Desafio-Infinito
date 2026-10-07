import type { CSSProperties } from 'react';

export interface RunnerSpriteProps {
  characterId: string;
  skinId?: string;
  running?: boolean;
  className?: string;
  style?: CSSProperties;
}

const labels: Record<string, string> = {
  robot: 'Robô de Bolso',
  ninja: 'Ninja da Meia-Noite',
  explorer: 'Exploradora',
  warrior: 'Guerreiro do Eclipse',
  astronaut: 'Astronauta Orbital',
  samurai: 'Samurai Carmesim',
  'cyber-runner': 'Cyber Runner',
  'legendary-runner': 'Corredor Lendário',
  'nina-neon': 'Nina Neon',
  cosmo: 'Cosmo',
};

function CharacterArt({ characterId }: { characterId: string }) {
  switch (characterId) {
    case 'ninja':
      return <>
        <path d="M28 48 17 30l19 4 14-22 13 19 20-4-12 22Z" fill="#201d2d" stroke="#51445e" strokeWidth="3" />
        <path d="M34 41q16-14 32 0v15H34Z" fill="#efc7ae" />
        <path d="M32 48q18 8 36 0v11q-18 8-36 0Z" fill="#df536e" />
        <path d="M36 45h7m12 0h7" stroke="#f8f1ff" strokeWidth="3" strokeLinecap="round" />
        <path d="m28 65-13 6 5 10 16-5m36-10 14 7-6 10-16-6" fill="#282334" stroke="#726181" strokeWidth="3" strokeLinecap="round" />
        <path d="M34 60h32l8 24-9 12H37l-10-12Z" fill="#352d43" stroke="#d35770" strokeWidth="3" />
        <path d="M36 73h28" stroke="#ed6477" strokeWidth="5" strokeLinecap="round" />
        <path d="m17 72-5 27m59-5 12 18m-44-15-5 18" stroke="#24212f" strokeWidth="9" strokeLinecap="round" />
        <path d="M8 112h17m41 3h18" stroke="#e35c71" strokeWidth="8" strokeLinecap="round" />
        <path d="m81 63 9-32m-12 35 13-3" stroke="#d8e1f4" strokeWidth="3" strokeLinecap="round" />
      </>;
    case 'explorer':
      return <>
        <path d="M22 36q27-29 55 0l-5 12H28Z" fill="#a77643" stroke="#f4ce7d" strokeWidth="3" />
        <path d="M32 24q13-19 31 0l4 14H28Z" fill="#d6a954" stroke="#ffe49a" strokeWidth="3" />
        <path d="M35 44q15-9 30 0v16q-15 11-30 0Z" fill="#eac4a1" />
        <path d="M38 49h6m12 0h6" stroke="#3e342d" strokeWidth="3" strokeLinecap="round" />
        <path d="M26 62h14v30H26q-7-15 0-30Z" fill="#648461" stroke="#a3c48b" strokeWidth="3" />
        <path d="M28 68v12m5-12v12" stroke="#d8e2b2" strokeWidth="2" />
        <path d="M38 61h25l10 31-12 10H36l-9-10Z" fill="#c7794e" stroke="#f0bd74" strokeWidth="3" />
        <path d="M37 73h27m-13-10v31" stroke="#f6d59a" strokeWidth="3" />
        <path d="m30 66-13 11 7 8 14-8m26-10 12 11-7 8-12-8" fill="#dba16d" stroke="#f1c17c" strokeWidth="3" strokeLinecap="round" />
        <path d="m39 99-3 14m25-14 6 14" stroke="#805a42" strokeWidth="9" strokeLinecap="round" />
        <path d="M28 115h17m14 0h17" stroke="#f0c271" strokeWidth="8" strokeLinecap="round" />
        <circle cx="70" cy="80" r="4" fill="#f7df9c" />
      </>;
    case 'warrior':
      return <>
        <path d="m34 37-13-21 20 7 10-14 9 14 20-7-13 23Z" fill="#6379bd" stroke="#bbceff" strokeWidth="3" />
        <path d="M36 38h29l-2 18q-13 12-27 0Z" fill="#d8bdad" />
        <path d="M33 47q17 7 34 0v10H33Z" fill="#34415f" />
        <path d="M39 47h5m12 0h5" stroke="#e9edff" strokeWidth="3" strokeLinecap="round" />
        <path d="M28 64 15 73v20l17 10 7-11V66Zm41 0 14 9-2 20-18 10-7-11V66Z" fill="#586aa2" stroke="#bbceff" strokeWidth="3" />
        <path d="M37 60h27l10 29-13 12H37L25 89Z" fill="#485985" stroke="#9baee7" strokeWidth="3" />
        <path d="m50 67 9 14-9 13-9-13Z" fill="#f1cb70" stroke="#fff0b0" strokeWidth="2" />
        <path d="m34 67-12 9m43-9 12 9m-42 15 15 6 16-6" fill="none" stroke="#c5d4ff" strokeWidth="3" />
        <path d="m40 99-3 14m24-14 4 14" stroke="#333c5d" strokeWidth="10" strokeLinecap="round" />
        <path d="M29 115h18m12 0h18" stroke="#a9b8e9" strokeWidth="8" strokeLinecap="round" />
        <path d="M16 78h-7v18h12m63-18h7v18H79" fill="#f0c96d" stroke="#fff1b5" strokeWidth="2" />
      </>;
    case 'astronaut':
      return <>
        <rect x="17" y="54" width="15" height="33" rx="7" fill="#7987c5" stroke="#c9ebff" strokeWidth="3" />
        <path d="M35 34a16 16 0 1 1 31 0v17H35Z" fill="#dbe6fa" stroke="#9ce4ff" strokeWidth="4" />
        <path d="M38 38q13-13 25 0v11H38Z" fill="#527499" stroke="#d2f6ff" strokeWidth="2" />
        <path d="M43 43h5m8 0h4" stroke="#9ff3ff" strokeWidth="3" strokeLinecap="round" />
        <path d="M33 57h34l7 32-13 12H39L27 89Z" fill="#e4e9f7" stroke="#adc8ff" strokeWidth="3" />
        <path d="M44 65h12v12H44Z" fill="#91e5f0" stroke="#7387b8" strokeWidth="2" />
        <circle cx="50" cy="71" r="3" fill="#52649e" />
        <path d="m30 64-12 12 8 8 13-9m29-11 11 12-8 8-12-9" fill="#d9e3f6" stroke="#a9c6f7" strokeWidth="3" strokeLinecap="round" />
        <path d="m41 98-4 14m23-14 4 14" stroke="#aab8d6" strokeWidth="10" strokeLinecap="round" />
        <path d="M28 115h18m12 0h18" stroke="#d4efff" strokeWidth="8" strokeLinecap="round" />
        <path d="M48 56v-7m5 7v-7" stroke="#fafcff" strokeWidth="2" />
      </>;
    case 'samurai':
      return <>
        <path d="M26 37 20 19l20 5 10-17 9 17 19-5-7 19Z" fill="#b9434d" stroke="#ffb1a0" strokeWidth="3" />
        <path d="m36 28 14-8 15 8v17H35Z" fill="#762f42" />
        <path d="m34 43 16-7 17 7v8q-17 10-33 0Z" fill="#e6b69c" />
        <path d="M35 46h12m6 0h12" stroke="#342633" strokeWidth="3" strokeLinecap="round" />
        <path d="M31 56h38l7 34-14 12H39L24 90Z" fill="#a93448" stroke="#ff8a83" strokeWidth="3" />
        <path d="M37 62h26v8H37Zm13 8v29" fill="#f2d18a" />
        <path d="m30 63-14 10 8 10 14-8m31-12 13 10-7 10-14-8" fill="#9b3448" stroke="#ff8a83" strokeWidth="3" strokeLinecap="round" />
        <path d="m40 100-5 13m24-13 6 13" stroke="#642c40" strokeWidth="10" strokeLinecap="round" />
        <path d="M28 115h18m12 0h18" stroke="#d84a56" strokeWidth="8" strokeLinecap="round" />
        <path d="M82 69 92 34m-13 37 15-3" stroke="#e5edf9" strokeWidth="4" strokeLinecap="round" />
        <path d="M79 70q-8-3-10-10" fill="none" stroke="#f1cf89" strokeWidth="3" />
      </>;
    case 'cyber-runner':
      return <>
        <path d="M34 37V23l16-13 16 13v15Z" fill="#345478" stroke="#73f5e1" strokeWidth="3" />
        <path d="m36 31 14-6 15 6v9H36Z" fill="#14283d" />
        <path d="M39 33h8m7 0h8" stroke="#6affec" strokeWidth="4" strokeLinecap="round" />
        <path d="m30 62 8-11h25l9 11-5 34H38Z" fill="#3a527e" stroke="#65edd4" strokeWidth="3" />
        <path d="m44 58 6 8 7-8v22l-7 8-6-8Z" fill="#92fff0" />
        <path d="m30 64-14 7 5 12 17-8m29-11 13 8-7 11-15-8" fill="#43598a" stroke="#65edd4" strokeWidth="3" strokeLinecap="round" />
        <path d="m41 96-5 17m24-17 8 17" stroke="#263b62" strokeWidth="10" strokeLinecap="round" />
        <path d="M28 115h18m12 0h18" stroke="#53ddca" strokeWidth="8" strokeLinecap="round" />
        <path d="M28 49 17 40m55 8 11-9" stroke="#79ffee" strokeWidth="3" strokeLinecap="round" />
        <circle cx="17" cy="40" r="4" fill="#79ffee" /><circle cx="83" cy="39" r="4" fill="#79ffee" />
      </>;
    case 'legendary-runner':
      return <>
        <path d="m34 30 1-18 15 12 14-12 2 19-7 12H40Z" fill="#e2b85c" stroke="#fff0b6" strokeWidth="3" />
        <circle cx="50" cy="22" r="4" fill="#b777e8" />
        <path d="M36 43q14-12 29 0v12H36Z" fill="#e8c3a0" />
        <path d="M40 47h5m10 0h5" stroke="#493451" strokeWidth="3" strokeLinecap="round" />
        <path d="m31 61-14 13 11 25 15 4 7-14 9 14 15-4 10-25-15-13Z" fill="#8554b8" stroke="#d9a7ff" strokeWidth="3" />
        <path d="M40 59h20l10 32-10 10H40L30 91Z" fill="#c08bda" stroke="#ffe291" strokeWidth="3" />
        <path d="m50 65 8 12-8 14-8-14Z" fill="#ffe38c" stroke="#fff4ca" strokeWidth="2" />
        <path d="m30 66-13 9 7 10 15-8m29-11 14 9-8 10-14-8" fill="#a875cf" stroke="#e1b9ff" strokeWidth="3" strokeLinecap="round" />
        <path d="m41 99-5 14m22-14 6 14" stroke="#6c478e" strokeWidth="10" strokeLinecap="round" />
        <path d="M28 115h18m12 0h18" stroke="#ffdf83" strokeWidth="8" strokeLinecap="round" />
        <path d="m31 76-10 14m48-14 10 14" stroke="#fff0b8" strokeWidth="2" />
      </>;
    case 'nina-neon':
      return <>
        <path d="m35 38-9-16 17 5 8-16 9 16 16-5-8 21Z" fill="#e66cc2" stroke="#ffd0f0" strokeWidth="3" />
        <path d="M35 35q15-14 30 0v21H35Z" fill="#f2c7ce" />
        <path d="M40 43h5m10 0h5" stroke="#38243c" strokeWidth="3" strokeLinecap="round" />
        <path d="m31 63 8-8h23l9 8-4 32H36Z" fill="#d652bb" stroke="#ffb6eb" strokeWidth="3" />
        <path d="M40 67h20m-10 0v24" stroke="#f7e8ff" strokeWidth="3" />
        <path d="m31 64-13 10 7 10 13-8m30-12 13 10-7 10-13-8" fill="#bb45a8" stroke="#ffb6eb" strokeWidth="3" strokeLinecap="round" />
        <path d="m41 95-4 18m22-18 6 18" stroke="#51314f" strokeWidth="10" strokeLinecap="round" />
        <path d="M28 115h18m12 0h18" stroke="#ff87d5" strokeWidth="8" strokeLinecap="round" />
        <path d="M31 28 22 15m47 13 10-13" stroke="#ff92df" strokeWidth="4" strokeLinecap="round" />
      </>;
    case 'cosmo':
      return <>
        <rect x="20" y="58" width="13" height="26" rx="6" fill="#5463d6" stroke="#9ee9ff" strokeWidth="3" />
        <circle cx="50" cy="35" r="23" fill="#d7e5ff" stroke="#88dfff" strokeWidth="4" />
        <path d="M35 37q15-15 30 0v10H35Z" fill="#42609b" />
        <path d="M40 41h6m8 0h6" stroke="#b7f4ff" strokeWidth="3" strokeLinecap="round" />
        <path d="M34 61h32l8 30-13 10H39L26 91Z" fill="#6977da" stroke="#a7edff" strokeWidth="3" />
        <path d="m43 70 7-8 7 8-7 10Z" fill="#ffe890" />
        <path d="m30 66-14 10 8 10 13-8m29-12 13 10-8 10-13-8" fill="#6175ce" stroke="#a7edff" strokeWidth="3" strokeLinecap="round" />
        <path d="m41 99-4 14m22-14 5 14" stroke="#4355ad" strokeWidth="10" strokeLinecap="round" />
        <path d="M28 115h18m12 0h18" stroke="#a7edff" strokeWidth="8" strokeLinecap="round" />
        <path d="m29 22 4-9m39 9-4-9" stroke="#9be8ff" strokeWidth="3" />
      </>;
    case 'robot':
    default:
      return <>
        <path d="M50 13v8" stroke="#f1d783" strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="10" r="5" fill="#f1d783" />
        <rect x="30" y="20" width="40" height="34" rx="13" fill="#cbb2ff" stroke="#f1e7ff" strokeWidth="3" />
        <path d="M36 36h8m12 0h8" stroke="#48386e" strokeWidth="5" strokeLinecap="round" />
        <path d="M43 46q7 5 14 0" fill="none" stroke="#775bb4" strokeWidth="2" strokeLinecap="round" />
        <path d="M25 64q0-9 11-9h28q11 0 11 9v23q0 9-11 9H36q-11 0-11-9Z" fill="#8c71c7" stroke="#d8c3ff" strokeWidth="3" />
        <rect x="40" y="65" width="20" height="15" rx="5" fill="#dffcf6" />
        <path d="M44 72h12" stroke="#5d7fa1" strokeWidth="3" strokeLinecap="round" />
        <path d="m29 64-13 9 6 11 14-7m35-13 13 9-7 11-13-7" fill="#b49be8" stroke="#e4d6ff" strokeWidth="3" strokeLinecap="round" />
        <path d="m39 94-4 19m24-19 5 19" stroke="#6651a0" strokeWidth="10" strokeLinecap="round" />
        <path d="M26 115h19m12 0h19" stroke="#d6c5ff" strokeWidth="8" strokeLinecap="round" />
        <circle cx="20" cy="79" r="3" fill="#f1d783" /><circle cx="80" cy="79" r="3" fill="#f1d783" />
      </>;
  }
}

export function RunnerSprite({
  characterId,
  skinId = 'aurora',
  running = false,
  className = '',
  style,
}: RunnerSpriteProps) {
  const skinClass = skinId === 'pixel'
    ? 'runner-skin-pixel'
    : skinId === 'comet-trail'
      ? 'runner-skin-comet'
      : skinId === 'aurora-pulse'
        ? 'runner-skin-pulse'
        : skinId === 'supernova'
          ? 'runner-skin-nova'
          : 'runner-skin-aurora';
  const characterName = labels[characterId] ?? labels.robot;

  return (
    <svg
      className={`runner-sprite ${running ? 'is-running' : ''} ${skinClass} ${className}`.trim()}
      viewBox="0 0 100 122"
      role="img"
      aria-label={characterName}
      style={style}
      focusable="false"
    >
      <ellipse className="runner-shadow" cx="50" cy="116" rx="31" ry="5" fill="#08070d" opacity=".55" />
      <g className="runner-legs"><CharacterArt characterId={characterId} /></g>
    </svg>
  );
}
