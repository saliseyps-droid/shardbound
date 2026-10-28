import { useSettings } from '@/state/settingsStore';
import { t } from '@/i18n';
import { table3dAllowed, table3dEnv } from './table3d/table3dRules';

/** Two small switches (fixed label + aria-pressed = on; the tooltip names the action) in the bottom-left corner of the board: music on top, sound effects below. */
export function AudioToggles() {
  const musicMuted = useSettings((s) => s.musicMuted);
  const sfxMuted = useSettings((s) => s.sfxMuted);
  const update = useSettings((s) => s.update);
  const table3d = useSettings((s) => s.table3d);
  const can3d = useSettings((s) => table3dAllowed({ ...s, table3d: true }, table3dEnv()));
  return (
    <div className="audio-toggles">
      <button
        type="button"
        className={`icon-btn audio-toggle ${musicMuted ? 'is-off' : ''}`}
        aria-pressed={!musicMuted}
        aria-label={t('Music')}
        title={musicMuted ? t('Unmute music') : t('Mute music')}
        onClick={() => update({ musicMuted: !musicMuted })}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l11-2v13" />
          <circle cx="6" cy="18" r="3" fill="currentColor" />
          <circle cx="17" cy="16" r="3" fill="currentColor" />
          {musicMuted && <path d="M3 3l18 18" />}
        </svg>
      </button>
      <button
        type="button"
        className={`icon-btn audio-toggle ${sfxMuted ? 'is-off' : ''}`}
        aria-pressed={!sfxMuted}
        aria-label={t('Sound effects')}
        title={sfxMuted ? t('Unmute sound effects') : t('Mute sound effects')}
        onClick={() => update({ sfxMuted: !sfxMuted })}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
          {sfxMuted ? <path d="M16 9l6 6M22 9l-6 6" /> : <path d="M15.5 8.5a5 5 0 010 7M19 5a10 10 0 010 14" />}
        </svg>
      </button>
      {can3d && (
        <button
          type="button"
          className="icon-btn audio-toggle table3d-toggle"
          aria-pressed={table3d}
          aria-label={t('3D table')}
          title={table3d ? t('Switch to the 2D board') : t('Switch to the 3D table')}
          onClick={() => update({ table3d: !table3d })}
        >
          {table3d ? '3D' : '2D'}
        </button>
      )}
      {can3d && table3d && (
        <button
          type="button"
          className="icon-btn audio-toggle table3d-reset"
          aria-label={t('Reset the view')}
          title={t('Reset the view (Space)')}
          // TableView listens for it (and Space does the same).
          onClick={() => window.dispatchEvent(new Event('table3d-reset'))}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 9V4h5" />
            <path d="M4.5 4.5A9 9 0 1 1 3 12" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" />
          </svg>
        </button>
      )}
    </div>
  );
}
