import { BrandLogo } from '@/ui/components/BrandLogo';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAccount } from '@/state/accountStore';
import { xpToNext } from '@/domain/progression';
import { MAX_LEVEL } from '@/config/progression';
import { Essence, Gold, Packs, ProgressBar } from './components/common';
import { Glyph } from './components/Icons';
import { audio } from '@/audio/audioService';
import { tn, useT, type MessageKey } from '@/i18n';
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
  { to: '/friends', label: 'nav.friends', icon: 'people' },
  { to: '/achievements', label: 'nav.achievements', icon: 'chalice' },
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
  // Labels only while every link fits with its label; otherwise icons only (any width, any language).
  const navRef = useRef<HTMLElement>(null);
  const [compact, setCompact] = useState(false);
  const labelWidth = useRef(0);
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      if (nav.classList.contains('is-open') || getComputedStyle(nav).position === 'fixed') return setCompact(false);
      // Width the links need with their labels (scrollWidth can't tell "fits exactly" from "fits").
      if (!nav.classList.contains('is-compact')) {
        const links = nav.querySelectorAll('.nav-link');
        const first = links[0]?.getBoundingClientRect();
        const last = links[links.length - 1]?.getBoundingClientRect();
        labelWidth.current = first && last ? last.right - first.left : 0;
      }
      setCompact(labelWidth.current > nav.clientWidth - 4);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [t, profile?.username, claimable > 0, packs > 0, patchSeen]);
  if (!profile) return null;
  const need = xpToNext(profile.level);
  return (
    <header className="app-header">
      <button className="nav-toggle icon-btn" aria-label={menuOpen ? t('Close menu') : t('Open menu')} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
        <span className={`burger ${menuOpen ? 'is-open' : ''}`} aria-hidden>
          <span />
          <span />
          <span />
        </span>
      </button>
      {menuOpen && <div className="nav-backdrop" onClick={() => setMenuOpen(false)} aria-hidden />}
      <NavLink to="/" className="brand" aria-label={t('Shardbound home')}>
        <BrandLogo size={34} />
        <span className="brand-name">Shardbound</span>
      </NavLink>
      <nav ref={navRef} className={`main-nav ${menuOpen ? 'is-open' : ''} ${compact ? 'is-compact' : ''}`} aria-label={t('Main')}>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className="nav-link" title={t(n.label)} aria-label={t(n.label)} onClick={() => audio.play('click')}>
            <Glyph name={n.icon} size={16} />
            <span>{t(n.label)}</span>
            {n.to === '/quests' && claimable > 0 && <span className="nav-dot" aria-label={tn(claimable, '{n} reward to claim', '{n} rewards to claim')} />}
            {n.to === '/packs' && packs > 0 && <span className="nav-count">{packs}</span>}
            {n.to === '/patch-notes' && !patchSeen && <span className="nav-dot" aria-label={t('New patch notes')} />}
          </NavLink>
        ))}
      </nav>
      <div className="header-resources">
        <Gold amount={profile.gold} />
        <Essence amount={profile.essence} />
        <NavLink to="/packs" className="header-packs">
          <Packs amount={packs} />
        </NavLink>
        <NavLink to="/profile" className="level-badge" title={t('Level {n}', { n: profile.level })}>
          <span className="level-gem num">{profile.level}</span>
          <span className="level-xp">
            <ProgressBar value={profile.level >= MAX_LEVEL ? 1 : profile.xp} max={profile.level >= MAX_LEVEL ? 1 : need} gold label={t('Experience')} />
            <span className="faint num">{profile.level >= MAX_LEVEL ? t('Max level') : t('{xp} / {need} XP', { xp: profile.xp, need })}</span>
          </span>
        </NavLink>
        <NavLink to="/settings" className="icon-btn" aria-label={t('Settings')} title={t('Settings')}>
          <Glyph name="cog" size={18} />
        </NavLink>
      </div>
    </header>
  );
}
