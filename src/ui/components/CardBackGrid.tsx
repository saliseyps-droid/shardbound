import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CARD_BACKS, type CardBackDef } from '@/data/cardBacks';
import { gameService, useAccount } from '@/state/accountStore';
import { toast } from '@/state/uiStore';
import { audio } from '@/audio/audioService';
import { CardBack } from './CardView';
import { confirmDialog, Gold } from './common';
import { GoldIcon } from './Icons';
import { t } from '@/i18n';
import '@/ui/styles/cardbacks.css';

/**
 * Card backs as a grid of previews. `shop` lists every back with Buy / Equip;
 * `owned` lists only the player's backs to pick from (Collection); `locked` shows the ones still
 * missing as dark silhouettes with where to get them.
 */
export function CardBackGrid({ mode }: { mode: 'shop' | 'owned' | 'locked' }) {
  const navigate = useNavigate();
  const gold = useAccount((s) => s.save?.profile.gold ?? 0);
  const owned = useAccount((s) => s.save?.profile.cardBacks ?? []);
  const equipped = useAccount((s) => s.save?.profile.cardBack);
  const [justBought, setJustBought] = useState<string | null>(null);
  const list = mode === 'shop' ? CARD_BACKS : CARD_BACKS.filter((b) => owned.includes(b.id) === (mode === 'owned'));

  const buy = async (b: CardBackDef) => {
    const ok = await confirmDialog({
      title: t('Buy {name}?', { name: b.name }),
      message: (
        <p>
          {t('This spends')} <Gold amount={b.price} /> {t('of your')} <Gold amount={gold} />. {t('Card backs are cosmetic.')}
        </p>
      ),
      confirmLabel: t('Buy for {n} Gold', { n: b.price.toLocaleString() }),
    });
    if (!ok) return;
    const res = gameService.buyCardBack(b.id);
    if (!res.ok) {
      audio.play('error');
      toast(res.error, 'error');
      return;
    }
    gameService.equipCardBack(b.id);
    audio.play('coin');
    toast(t('{name} is yours and now in use.', { name: b.name }), 'success');
    setJustBought(b.id);
    window.setTimeout(() => setJustBought(null), 900);
  };

  const equip = (b: CardBackDef) => {
    const res = gameService.equipCardBack(b.id);
    if (res.ok) {
      audio.play('click');
      toast(t('Now using {name}.', { name: b.name }), 'success');
    } else toast(res.error, 'error');
  };

  if (mode === 'locked') {
    return (
      <ul className="cardback-grid">
        {list.map((b) => (
          <li key={b.id} className="cardback-item is-locked">
            <button className="cardback-preview" onClick={() => navigate('/shop')} aria-label={t('{name}, not owned yet. {n} Gold in the Shop.', { name: b.name, n: b.price })}>
              <CardBack width={132} design={b.id} />
              <svg className="cardback-lock" viewBox="0 0 24 24" width="28" height="28" aria-hidden>
                <path fill="currentColor" d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Z" />
              </svg>
            </button>
            <strong className="cardback-name">{b.name}</strong>
            <span className="cardback-source faint">
              <GoldIcon size={14} /> <span className="num">{b.price.toLocaleString()}</span> · {t('Shop')}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="cardback-grid">
      {list.map((b) => {
        const has = owned.includes(b.id);
        const using = equipped === b.id;
        const affordable = gold >= b.price;
        return (
          <li key={b.id} className={`cardback-item ${using ? 'is-equipped' : ''} ${justBought === b.id ? 'just-bought' : ''}`}>
            <button className="cardback-preview" onClick={() => (has ? equip(b) : void buy(b))} disabled={using || (!has && !affordable)} aria-label={has ? (using ? t('{name}, in use', { name: b.name }) : t('Use {name}', { name: b.name })) : t('Buy {name}', { name: b.name })}>
              <CardBack width={132} design={b.id} />
              {using && <span className="cardback-badge">{t('In use')}</span>}
            </button>
            <strong className="cardback-name">{b.name}</strong>
            <span className="cardback-desc faint">{b.description}</span>
            {has ? (
              <button className="btn btn-sm cardback-action" onClick={() => equip(b)} disabled={using} aria-label={using ? t('{name} is in use', { name: b.name }) : t('Use {name}', { name: b.name })}>
                {using ? t('Equipped') : t('Equip')}
              </button>
            ) : (
              <button
                className="btn btn-sm btn-primary cardback-action"
                onClick={() => void buy(b)}
                disabled={!affordable}
                aria-label={t('Buy {name} for {n} Gold', { name: b.name, n: b.price })}
                title={affordable ? undefined : t('Need {n} more Gold', { n: (b.price - gold).toLocaleString() })}
              >
                <GoldIcon size={16} />
                <span className="num">{b.price.toLocaleString()}</span>
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
