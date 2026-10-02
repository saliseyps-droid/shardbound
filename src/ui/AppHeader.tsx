import { BrandLogo } from '@/ui/components/BrandLogo';
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAccount } from '@/state/accountStore';
import { xpToNext } from '@/domain/progression';
import { MAX_LEVEL } from '@/config/progression';
import { Essence, Gold, Packs, ProgressBar } from './components/common';
import { Glyph } from './components/Icons';
import { audio } from '@/audio/audioService';
import { useT, type MessageKey } from '@/i18n';
import { usePatchNotesSeen } from './patchNotesSeen';

const NAV: { to: string; label: MessageKey; icon: string }[] = [
  { to: '/', label: 'nav.home', icon: 'home' },
  { to: '/play', label: 'nav.play', icon: 'sword' },
  { to: '/arena', label: 'nav.arena', icon: 'trophy' },
  { to: '/campaign', label: 'nav.campaign', icon: 'map' },
  { to: '/collection', label: 'nav.collection', icon: 'crystal' },
  { to: '/decks', label: 'nav.decks', icon: 'deck' },
  { to: '/packs', label: 'nav.packs', icon: 'pack' },
  { to: '/shop', label: 'nav.shop', icon: 'coin' },
  { to: '/card-backs', label: 'nav.cardBacks', icon: 'cardback' },
  { to: '/quests', label: 'nav.quests', icon: 'scroll2' },
  { to: '/profile', label: 'nav.profile', icon: 'person' },
  { to: '/patch-notes', label: 'nav.patchNotes', icon: 'scroll' },
];

export function AppHeader() {
  const profile = useAccount((s) => s.save?.profile);
  const packs = useAccount((s) => Object.values(s.save?.economy.packs ?? {}).reduce((a, b) => a + (b ?? 0), 0));
  const claimable = useAccount((s) => s.save?.quests.active.filter((q) => q.completed && !q.claimed).length ?? 0);
  const t = useT();
  const patchSeen = usePatchNotesSeen((s) => s.seen);
  // Phones: the menu lives in a drawer behind a menu button.
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setMenuOpen(false), [location.pathname]);
  if (!profile) return null;
  const need = xpToNext(profile.level);
  return (
    <header className="app-header">
      <button className="nav-toggle icon-btn" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
        <span className={`burger ${menuOpen ? 'is-open' : ''}`} aria-hidden>
          <span />
          <span />
          <span />
        </span>
      </button>
      {menuOpen && <div className="nav-backdrop" onClick={() => setMenuOpen(false)} aria-hidden />}
      <NavLink to="/" className="brand" aria-label="Shardbound home">
        <BrandLogo size={34} />
        <span className="brand-name">Shardbound</span>
      </NavLink>
      <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className="nav-link" onClick={() => audio.play('click')}>
            <Glyph name={n.icon} size={16} />
            <span>{t(n.label)}</span>
            {n.to === '/quests' && claimable > 0 && <span className="nav-dot" aria-label={`${claimable} rewards to claim`} />}
            {n.to === '/packs' && packs > 0 && <span className="nav-count">{packs}</span>}
            {n.to === '/patch-notes' && !patchSeen && <span className="nav-dot" aria-label="New patch notes" />}
          </NavLink>
        ))}
      </nav>
      <div className="header-resources">
        <Gold amount={profile.gold} />
        <Essence amount={profile.essence} />
        <NavLink to="/packs" className="header-packs">
          <Packs amount={packs} />
        </NavLink>
        <NavLink to="/profile" className="level-badge" title={`Level ${profile.level}`}>
          <span className="level-gem num">{profile.level}</span>
          <span className="level-xp">
            <ProgressBar value={profile.level >= MAX_LEVEL ? 1 : profile.xp} max={profile.level >= MAX_LEVEL ? 1 : need} gold label="Experience" />
            <span className="faint num">{profile.level >= MAX_LEVEL ? 'Max level' : `${profile.xp} / ${need} XP`}</span>
          </span>
        </NavLink>
        <NavLink to="/settings" className="icon-btn" aria-label="Settings">
          <Glyph name="cog" size={18} />
        </NavLink>
      </div>
    </header>
  );
}
