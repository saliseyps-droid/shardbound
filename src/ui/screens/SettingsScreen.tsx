import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSettings, type Settings } from '@/state/settingsStore';
import { gameService } from '@/state/accountStore';
import { toast } from '@/state/uiStore';
import { audio } from '@/audio/audioService';
import { confirmDialog, ScreenHeader } from '@/ui/components/common';
import '@/ui/styles/meta.css';

/** Languages the UI can load. Strings are English-only for now; the selector and persisted setting form the i18n seam. */
import { LANGUAGES } from '@/i18n';

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const id = `s-${label.replace(/\s/g, '')}`;
  return (
    <div className="toggle-row">
      <label htmlFor={id}>{label}</label>
      <span className="slider-wrap">
        <input id={id} type="range" min={0} max={100} step={5} value={Math.round(value * 100)} onChange={(e) => onChange(Number(e.target.value) / 100)} onPointerUp={() => audio.play('coin')} onKeyUp={() => audio.play('click')} />
        <span className="num slider-val">{Math.round(value * 100)}</span>
      </span>
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle-row">
      <span>
        {label}
        {hint && <span className="faint toggle-hint">{hint}</span>}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => (audio.play('click'), onChange(e.target.checked))} />
    </label>
  );
}

export default function SettingsScreen() {
  const s = useSettings();
  const navigate = useNavigate();
  const [fullscreen, setFullscreen] = useState(!!document.fullscreenElement);
  useEffect(() => {
    const on = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);
  const set = (patch: Partial<Settings>) => s.update(patch);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      toast('Fullscreen is not available here.', 'error');
    }
  };

  const resetAccount = async () => {
    const ok = await confirmDialog({
      title: 'Reset account?',
      message: 'This permanently deletes your Warden: collection, decks, currency, quests and campaign progress. This cannot be undone.',
      confirmLabel: 'Delete everything',
      danger: true,
    });
    if (!ok) return;
    await gameService.resetAccount();
    navigate('/');
  };

  return (
    <div className="screen settings-screen">
      <ScreenHeader title="Settings" subtitle="Changes save automatically on this device." />
      <div className="settings-layout">
        <section className="panel">
          <div className="panel-title">Audio</div>
          <Slider label="Master volume" value={s.masterVolume} onChange={(v) => set({ masterVolume: v })} />
          <Slider label="Music" value={s.musicVolume} onChange={(v) => set({ musicVolume: v })} />
          <Slider label="Sound effects" value={s.sfxVolume} onChange={(v) => set({ sfxVolume: v })} />
          <Toggle label="Mute all" checked={s.muted} onChange={(v) => set({ muted: v })} />
        </section>

        <section className="panel">
          <div className="panel-title">Gameplay</div>
          <div className="toggle-row">
            <span>Animation speed</span>
            <div className="segmented" role="group" aria-label="Animation speed">
              {[
                { v: 0.5, l: 'Fast' },
                { v: 1, l: 'Normal' },
                { v: 1.5, l: 'Slow' },
              ].map((o) => (
                <button key={o.v} aria-pressed={s.animationSpeed === o.v} onClick={() => set({ animationSpeed: o.v })}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          <Toggle label="Confirm end turn" hint="Ask before ending a turn with energy or ready units left." checked={s.confirmEndTurn} onChange={(v) => set({ confirmEndTurn: v })} />
          <Toggle label="Turn timer" hint="Your turn ends automatically after 90 seconds." checked={s.turnTimer} onChange={(v) => set({ turnTimer: v })} />
          <Toggle label="Show damage numbers" checked={s.showDamageNumbers} onChange={(v) => set({ showDamageNumbers: v })} />
        </section>

        <section className="panel">
          <div className="panel-title">Display and accessibility</div>
          <Toggle label="Reduced motion" hint="Minimises animations and screen movement." checked={s.reducedMotion} onChange={(v) => set({ reducedMotion: v })} />
          <Toggle label="Performance mode" hint="Disables blur and animated foil effects." checked={s.performanceMode} onChange={(v) => set({ performanceMode: v })} />
          {document.fullscreenEnabled && <Toggle label="Fullscreen" checked={fullscreen} onChange={() => void toggleFullscreen()} />}
          <div className="toggle-row">
            <label htmlFor="lang">Language</label>
            <select id="lang" className="select" value={s.language} onChange={(e) => set({ language: e.target.value })}>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <p className="faint">More languages will be added in future updates.</p>
          <button className="btn btn-ghost btn-sm" onClick={() => (s.reset(), toast('Settings restored to defaults', 'success'))}>
            Restore default settings
          </button>
        </section>

        <section className="panel danger-zone">
          <div className="panel-title">Account</div>
          <p className="muted">Resetting deletes all progress stored on this device.</p>
          <button className="btn btn-danger" onClick={resetAccount}>
            Reset account
          </button>
          {import.meta.env.DEV && (
            <p style={{ marginTop: 'var(--space-4)' }}>
              <Link to="/debug" className="small-link">
                Developer tools
              </Link>
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
