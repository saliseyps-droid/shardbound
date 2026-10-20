import { useEffect, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { CARD_BACKS } from '@/data/cardBacks';
import { useAccount } from '@/state/accountStore';
import { ScreenHeader } from '@/ui/components/common';
import { CardBackGrid } from '@/ui/components/CardBackGrid';
import { ARENA } from '@/config/arena';
import { Link } from 'react-router-dom';
import { gameService } from '@/state/accountStore';
import { toast } from '@/state/uiStore';
import { FACTIONS } from '@/data/factions';
import { PLAYABLE_FACTIONS } from '@/game/types';
import { Glyph } from '@/ui/components/Icons';
import { PortraitPicker } from '@/ui/components/PortraitPicker';
import { factionStyle } from '@/ui/components/meta/MetaWidgets';
import '@/ui/styles/meta.css';
import { t } from '@/i18n';
import { WardenFrame } from '@/ui/components/WardenFrame';
import { WardenPortrait } from '@/ui/components/WardenPortrait';
import { FRAME_WINS } from '@/domain/frames';
import { SHOP_FRAMES } from '@/data/shopFrames';
import { FramedWarden } from '@/ui/components/FrameShop';
import { GoldIcon } from '@/ui/components/Icons';
import { BOARDS, boardOwnedBy } from '@/domain/boards';
import { BOARD_MATS, dimOf } from '@/ui/match/boardBackgrounds';
import { AnimatedBoard } from '@/ui/match/AnimatedBoard';
import '@/ui/styles/animatedBoard.css';

/** Customization: the Warden portrait of each faction and the card back used in matches. */
export default function CardBacksScreen() {
  const navigate = useNavigate();
  const owned = useAccount((s) => s.save?.profile.cardBacks.length ?? 1);
  const p = useAccount((s) => s.save?.profile);
  const save = useAccount((s) => s.save);
  const [viewing, setViewing] = useState<number | null>(null);
  if (!p || !save) return null;
  const pickBoard = (v: string | null) => {
    const res = gameService.chooseBoard(v);
    if (!res.ok) toast(res.error, 'error');
  };
  return (
    <div className="screen cardbacks-screen">
      <ScreenHeader
        title={t('Customization')}
        subtitle={t('Your Warden portraits, frames, boards and card backs.')}
        actions={
          <button className="btn btn-cyan" onClick={() => navigate('/shop')}>
            {t('Get more in the Shop')}
          </button>
        }
      />
      <section className="panel profile-portraits" aria-labelledby="cz-portraits">
        <div className="panel-title" id="cz-portraits">
          <span>{t('Warden portraits')}</span>
          <Link to="/shop" className="small-link">
            {t('More in the Shop')}
          </Link>
        </div>
        <p className="faint">{t('The portrait every deck of that faction shows. A deck can still pick its own in the deck editor.')}</p>
        <div className="profile-portrait-grid">
        {PLAYABLE_FACTIONS.map((f) => (
          <div key={f} className="profile-portrait-row" style={factionStyle(f)}>
            <span className="profile-portrait-faction">
              <Glyph name={FACTIONS[f].sigil} size={14} /> {FACTIONS[f].name}
            </span>
            <PortraitPicker
              faction={f}
              owned={p.portraits}
              value={p.factionPortraits[f] ?? null}
              onChange={(v) => {
                const res = gameService.choosePortrait(f, v);
                if (!res.ok) toast(res.error, 'error');
              }}
            />
          </div>
        ))}
        </div>
      </section>
      <section className="panel" aria-labelledby="cz-frames">
        <div className="panel-title" id="cz-frames">
          {t('Warden frames')}
        </div>
        <p className="faint">{t('Win {n} matches with a faction to earn its frame, or buy a frame for every faction in the Shop. Your frame shows around your Warden in every match, on Home and in your Profile, with any deck.', { n: FRAME_WINS })}</p>
        <div className="frame-grid">
          {PLAYABLE_FACTIONS.map((f) => {
            const wins = p.factionWins[f] ?? 0;
            const earned = wins >= FRAME_WINS;
            const chosen = p.wardenFrame === f;
            const pick = (v: string | null) => {
              const res = gameService.chooseFrame(v);
              if (!res.ok) toast(t(res.error, { n: FRAME_WINS }), 'error');
            };
            return (
              <div key={f} className={`frame-tile ${earned ? 'is-earned' : 'is-locked'} ${chosen ? 'is-chosen' : ''}`} style={factionStyle(f)}>
                <div className="frame-preview">
                  <WardenFrame faction={f} size={92}>
                    <WardenPortrait faction={f} size={92} />
                  </WardenFrame>
                </div>
                <strong>{FACTIONS[f].name}</strong>
                {earned ? (
                  <button type="button" className={`btn btn-sm ${chosen ? 'btn-primary' : ''}`} onClick={() => pick(chosen ? null : f)}>
                    {chosen ? t('In use (click to remove)') : t('Use this frame')}
                  </button>
                ) : (
                  <span className="frame-progress">
                    <span className="frame-bar" aria-hidden>
                      <span style={{ width: `${Math.min(100, (wins / FRAME_WINS) * 100)}%` }} />
                    </span>
                    <span className="faint num">{t('{n} / {max} wins', { n: wins, max: FRAME_WINS })}</span>
                  </span>
                )}
              </div>
            );
          })}
          {/* Frames from the Shop: any faction, any deck. */}
          {SHOP_FRAMES.map((f) => {
            const have = !!p.ownedFrames?.includes(f.id);
            const chosen = p.wardenFrame === f.id;
            const pick = (v: string | null) => {
              const res = gameService.chooseFrame(v);
              if (!res.ok) toast(res.error, 'error');
            };
            return (
              <div key={f.id} className={`frame-tile frame-tile-shop ${have ? 'is-earned' : 'is-locked'} ${chosen ? 'is-chosen' : ''}`}>
                <div className="frame-preview">
                  <FramedWarden frame={f.id} size={92} />
                </div>
                <strong>{t(f.name)}</strong>
                {have ? (
                  <button type="button" className={`btn btn-sm ${chosen ? 'btn-primary' : ''}`} onClick={() => pick(chosen ? null : f.id)}>
                    {chosen ? t('In use (click to remove)') : t('Use this frame')}
                  </button>
                ) : (
                  <button type="button" className="btn btn-sm" onClick={() => navigate('/shop')} title={t('In the Shop')}>
                    <GoldIcon size={13} /> <span className="num">{f.price.toLocaleString()}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
      <section className="panel" aria-labelledby="cz-boards">
        <div className="panel-title" id="cz-boards">
          {t('Game boards')}
        </div>
        <p className="faint">{t('Every board comes alive in your matches. Pick the one you play on, or leave it random. Campaigns with tables of their own keep them, and only you see your board.')}</p>
        <div className="frame-grid board-grid">
          <div className={`frame-tile is-earned ${!p.board ? 'is-chosen' : ''}`}>
            <div className="board-tile-preview board-tile-random" aria-hidden>
              ?
            </div>
            <strong>{t('Random')}</strong>
            <button type="button" className={`btn btn-sm ${!p.board ? 'btn-primary' : ''}`} onClick={() => pickBoard(null)} disabled={!p.board}>
              {!p.board ? t('In use') : t('Use this board')}
            </button>
          </div>
          {BOARDS.map((b) => {
            const have = boardOwnedBy(save, b.id);
            const chosen = p.board === b.id;
            return (
              <div key={b.id} className={`frame-tile ${have ? 'is-earned' : 'is-locked'} ${chosen ? 'is-chosen' : ''}`}>
                <button type="button" className="board-tile-preview" style={{ backgroundImage: `url(${BOARD_MATS[b.id]})` }} onClick={() => setViewing(BOARDS.indexOf(b))} title={t('View full screen')}>
                  {have && <AnimatedBoard board={b.id} preview />}
                </button>
                <strong>{t(b.name)}</strong>
                {have ? (
                  <button type="button" className={`btn btn-sm ${chosen ? 'btn-primary' : ''}`} onClick={() => pickBoard(chosen ? null : b.id)}>
                    {chosen ? t('In use (click to remove)') : t('Use this board')}
                  </button>
                ) : (
                  <span className="faint small">{t(b.unlockText ?? '')}</span>
                )}
              </div>
            );
          })}
        </div>
      </section>
      {viewing !== null && <BoardViewer index={viewing} onIndex={setViewing} onClose={() => setViewing(null)} />}
      <section className="panel" aria-labelledby="cz-backs">
        <div className="panel-title" id="cz-backs">
          {t('Card Backs')}
        </div>
        <p className="faint">{t('You own {n} of {max}. Pick the back your deck and hand show in every match.', { n: owned, max: CARD_BACKS.length })}</p>
        <CardBackGrid mode="owned" />
      </section>
      {owned < CARD_BACKS.length && (
        <section className="panel cardbacks-locked" aria-labelledby="cb-locked">
          <div className="panel-title" id="cb-locked">
            {t('Still to collect')}
          </div>
          <p className="muted">{t('Buy them with Gold in the Shop. An Arena run with {n} wins also brings a card back you don’t own yet.', { n: ARENA.rewards.findIndex((r) => r.cardBack) })}</p>
          <CardBackGrid mode="locked" />
        </section>
      )}
    </div>
  );
}

/** A board full screen, alive, with arrows (and the arrow keys) to the others; Esc or a click outside closes it. */
function BoardViewer({ index, onIndex, onClose }: { index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const b = BOARDS[index];
  const go = (d: number) => onIndex((index + d + BOARDS.length) % BOARDS.length);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });
  const url = BOARD_MATS[b.id];
  return (
    <div className="board-viewer" role="dialog" aria-label={t(b.name)} onClick={onClose}>
      <div className="board-viewer-mat" style={{ '--board-bg': `url(${url})`, '--board-dim': dimOf(url) } as CSSProperties}>
        <AnimatedBoard key={b.id} board={b.id} />
      </div>
      <div className="board-viewer-bar" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="btn btn-sm" onClick={() => go(-1)} aria-label={t('Previous')}>
          ‹
        </button>
        <strong>{t(b.name)}</strong>
        <span className="faint num">
          {index + 1} / {BOARDS.length}
        </span>
        <button type="button" className="btn btn-sm" onClick={() => go(1)} aria-label={t('Next')}>
          ›
        </button>
        <button type="button" className="btn btn-sm" onClick={onClose}>
          {t('Close')}
        </button>
      </div>
    </div>
  );
}
