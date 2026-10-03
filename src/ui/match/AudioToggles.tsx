import { useSettings } from '@/state/settingsStore';
import { t } from '@/i18n';

/** Two small switches in the bottom-left corner of the board: music on top, sound effects below. */
export function AudioToggles() {
  const musicMuted = useSettings((s) => s.musicMuted);
  const sfxMuted = useSettings((s) => s.sfxMuted);
  const update = useSettings((s) => s.update);
  return (
    <div className="audio-toggles">
      <button
        type="button"
        className={`icon-btn audio-toggle ${musicMuted ? 'is-off' : ''}`}
        aria-pressed={!musicMuted}
        aria-label={musicMuted ? t('Unmute music') : t('Mute music')}
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
        aria-label={sfxMuted ? t('Unmute sound effects') : t('Mute sound effects')}
        title={sfxMuted ? t('Unmute sound effects') : t('Mute sound effects')}
        onClick={() => update({ sfxMuted: !sfxMuted })}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
          {sfxMuted ? <path d="M16 9l6 6M22 9l-6 6" /> : <path d="M15.5 8.5a5 5 0 010 7M19 5a10 10 0 010 14" />}
        </svg>
      </button>
    </div>
  );
}
