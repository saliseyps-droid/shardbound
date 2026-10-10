import { useEffect, type CSSProperties } from 'react';
import { FACTIONS } from '@/data/factions';
import type { Faction } from '@/game/types';
import type { HeroState } from '@/engine/types';
import { useMatch } from '@/state/matchStore';
import { anim } from '@/state/settingsStore';
import { WardenPortrait } from '@/ui/components/WardenPortrait';
import { introSubtitle, modeLabel } from './matchLabels';
import { t } from '@/i18n';
import type { MatchConfig } from '@/state/matchLaunch';
import '@/ui/styles/intro.css';

/** How long the intro stays up (ms, before reduced-motion scaling). */
export const INTRO_MS = 2900;

const NEUTRAL_GLOW = '#a99ad8';

function factionOf(hero: HeroState): Faction | null {
  return hero.faction && FACTIONS[hero.faction as Faction] ? (hero.faction as Faction) : null;
}

/** One Warden: a portrait in an ornate gold frame with a soft glow of its faction, its name and faction. */
function Duelist({ hero, side }: { hero: HeroState; side: 'left' | 'right' }) {
  const faction = factionOf(hero);
  return (
    <div className={`duelist ${side}`} style={{ '--glow': faction ? FACTIONS[faction].colors.glow : NEUTRAL_GLOW } as CSSProperties}>
      <div className="duelist-frame">
        <div className="duelist-portrait">
          <WardenPortrait faction={faction ?? undefined} portrait={hero.portrait ?? null} fill inset={0} fallbackGlyph={hero.avatar} />
        </div>
      </div>
      <div className="duelist-name">{hero.name}</div>
      {faction && <div className="duelist-faction">{FACTIONS[faction].name}</div>}
    </div>
  );
}

/** VS in gold with a fine rule either side. */
const Versus = () => (
  <div className="intro-vs" aria-hidden>
    <span className="vs-rule left" />
    <span className="vs-word">VS</span>
    <span className="vs-rule right" />
  </div>
);

/** Before the first card: the two Wardens meet on a banner across the board, with the kind of match. Click to skip. */
export function MatchIntro() {
  const intro = useMatch((s) => s.intro);
  const game = useMatch((s) => s.game);
  const config = useMatch((s) => s.config);
  const watching = useMatch((s) => s.watching);
  useEffect(() => {
    if (intro === null) return;
    const id = setTimeout(() => useMatch.setState({ intro: null }), anim(INTRO_MS));
    return () => clearTimeout(id);
  }, [intro]);
  if (intro === null || !game) return null;
  const [a, b] = game.players;
  // A spectator sees which kind of match they are watching.
  const subtitle = config?.online === 'spectator' ? (watching ? modeLabel({ ...config, mode: watching.mode as MatchConfig['mode'], online: undefined }) : '') : introSubtitle(config);
  return (
    <div key={intro} className="match-intro" onClick={() => useMatch.setState({ intro: null })} role="dialog" aria-label={`${a.hero.name} vs ${b.hero.name}`}>
      <div className="intro-veil" />
      <div className="intro-band">
        <span className="intro-band-gleam" />
      </div>
      <div className="intro-title">
        <span className="intro-rule" />
        <strong>{config?.online === 'spectator' ? t('Watching') : modeLabel(config)}</strong>
        <span className="intro-rule" />
      </div>
      {subtitle && <div className="intro-subtitle">{subtitle}</div>}
      <div className="intro-row">
        <Duelist hero={a.hero} side="left" />
        <Versus />
        <Duelist hero={b.hero} side="right" />
      </div>
      <div className="intro-skip">{t('Click to skip')}</div>
    </div>
  );
}
