import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { CINEMATICS } from '@/data/cinematics';
import { anim, useSettings } from '@/state/settingsStore';
import { audio } from '@/audio/audioService';
import { t } from '@/i18n';
import '@/ui/styles/cinematic.css';

const images = import.meta.glob('../../assets/cinematics/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const imageUrl = (id: string) => images[`../../assets/cinematics/${id}.webp`];
const tracks = import.meta.glob('../../assets/music/*.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const trackUrl = (id: string) => tracks[`../../assets/music/${id}.mp3`];

/** Floating motes of light over the shots (fixed positions, so every replay looks the same). */
const MOTES = Array.from({ length: 22 }, (_, i) => ({ x: (i * 37) % 100, d: 6 + ((i * 13) % 7), delay: (i * 0.7) % 6, size: 2 + (i % 3) }));

/**
 * A full-screen campaign cinematic: shot after shot with a slow camera move and a line of
 * narration. A tap moves to the next shot; Skip (or the last shot ending) calls `onDone`.
 */
export function Cinematic({ id, onDone }: { id: string; onDone: () => void }) {
  const def = CINEMATICS[id];
  const reduced = useSettings((s) => s.reducedMotion);
  const [shot, setShot] = useState(0);
  const [closing, setClosing] = useState(false);

  // Its own music while it plays (fades out with the closing fade).
  const stopMusic = useRef<() => void>(() => {});
  useEffect(() => {
    const url = def?.music && trackUrl(def.music.track);
    if (!url) return;
    const at = def.music!.at;
    let stop = () => {};
    const start = () => {
      stop = audio.playTrack(url, at);
      stopMusic.current = stop;
    };
    if (audio.ready) start();
    // Before any user gesture (the world intro on a first visit) the browser keeps audio locked:
    // the first tap or key unlocks it and the music starts then.
    const onGesture = () => {
      audio.unlock();
      if (audio.ready) start();
    };
    if (!audio.ready) {
      window.addEventListener('pointerdown', onGesture, { once: true });
      window.addEventListener('keydown', onGesture, { once: true });
    }
    return () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
      stop();
    };
  }, [def]);

  const finish = useCallback(() => {
    stopMusic.current();
    setClosing(true);
    window.setTimeout(onDone, anim(600));
  }, [onDone]);
  const next = useCallback(() => {
    if (!def || closing) return;
    if (shot + 1 >= def.shots.length) finish();
    else setShot(shot + 1);
  }, [def, shot, closing, finish]);

  useEffect(() => {
    if (!def) {
      onDone();
      return;
    }
    // Real time, not anim(): the narration has to stay readable with reduced motion or fast animations.
    const timer = window.setTimeout(next, def.shots[shot].ms);
    return () => window.clearTimeout(timer);
  }, [def, shot, next, onDone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
      else if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, finish]);

  if (!def) return null;
  return createPortal(
    <div className={`cinematic theme-${def.theme ?? 'void'} ${closing ? 'is-closing' : ''} ${reduced ? 'is-reduced' : ''}`} role="dialog" aria-label={t(def.title)} onClick={next}>
      {def.shots.map((s, i) => (
        <div key={i} className={`cine-shot ${i === shot ? 'is-on' : ''} ${i < shot ? 'is-past' : ''}`} aria-hidden={i !== shot}>
          <img className={`cine-img motion-${s.motion}`} src={imageUrl(s.image)} alt="" draggable={false} style={{ '--ms': `${s.ms + 1200}ms`, ...(s.focus ? { objectPosition: s.focus, transformOrigin: s.focus } : {}) } as CSSProperties} />
        </div>
      ))}
      <div className="cine-vignette" aria-hidden />
      <div className="cine-motes" aria-hidden>
        {MOTES.map((m, i) => (
          <span key={i} style={{ '--x': `${m.x}%`, '--d': `${m.d}s`, '--delay': `${m.delay}s`, '--size': `${m.size}px` } as CSSProperties} />
        ))}
      </div>
      <div className="cine-bar top" aria-hidden />
      <div className="cine-bar bottom" aria-hidden />
      {shot === 0 && <h2 className="cine-title">{t(def.title)}</h2>}
      <p key={shot} className="cine-text" aria-live="polite">
        {t(def.shots[shot].text)}
      </p>
      <div className="cine-dots" aria-hidden>
        {def.shots.map((_, i) => (
          <span key={i} className={i === shot ? 'is-on' : ''} />
        ))}
      </div>
      <button
        type="button"
        className="btn btn-sm cine-skip"
        onClick={(e) => {
          e.stopPropagation();
          audio.play('click');
          finish();
        }}
      >
        {t('Skip')}
      </button>
    </div>,
    document.body,
  );
}
