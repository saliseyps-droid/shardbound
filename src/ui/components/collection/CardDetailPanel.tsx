import { getCard } from '@/data/cards';
import { FACTIONS } from '@/data/factions';
import { CRAFTING, SET_INFO } from '@/config/economy';
import { craftCost, recycleValue } from '@/domain/economy';
import { maxCopiesFor } from '@/domain/decks';
import { emptyVariants } from '@/domain/save';
import type { Variant } from '@/game/types';
import { VARIANTS } from '@/game/types';
import { gameService, useAccount } from '@/state/accountStore';
import { toast, useUi } from '@/state/uiStore';
import { audio } from '@/audio/audioService';
import { CardView } from '@/ui/components/CardView';
import { confirmDialog, Essence } from '@/ui/components/common';
import { EssenceIcon } from '@/ui/components/Icons';
import { t, tn } from '@/i18n';
import { useCallback, useState } from 'react';
import { LegendShowcase } from '@/ui/match/LegendaryEntrance';

export const VARIANT_LABEL: Record<Variant, string> = { NORMAL: 'Normal', FOIL: 'Foil', PRISMATIC: 'Prismatic' };

/** Variant-specific sentences (Czech declines the variant adjective). */
const CRAFTED: Record<Variant, string> = { NORMAL: 'Crafted normal {name}.', FOIL: 'Crafted foil {name}.', PRISMATIC: 'Crafted prismatic {name}.' };
const DESTROY_ONE: Record<Variant, string> = {
  NORMAL: 'You will destroy one normal copy and receive',
  FOIL: 'You will destroy one foil copy and receive',
  PRISMATIC: 'You will destroy one prismatic copy and receive',
};
const THIS_IS: Record<Variant, string> = { NORMAL: 'This is a normal copy.', FOIL: 'This is a foil copy.', PRISMATIC: 'This is a prismatic copy.' };

export function bestVariant(counts: Record<Variant, number> | undefined): Variant {
  if (!counts) return 'NORMAL';
  if (counts.PRISMATIC > 0) return 'PRISMATIC';
  if (counts.FOIL > 0) return 'FOIL';
  return 'NORMAL';
}

/** Side panel for one card: ownership per variant, crafting and recycling. */
export function CardDetailPanel({ cardId, onClose }: { cardId: string; onClose: () => void }) {
  const card = getCard(cardId);
  const counts = useAccount((s) => s.save?.collection.cards[cardId]) ?? emptyVariants();
  const essence = useAccount((s) => s.save?.profile.essence ?? 0);
  const decks = useAccount((s) => s.save?.decks ?? []);
  const [showcase, setShowcase] = useState(false);
  const endShowcase = useCallback(() => setShowcase(false), []);
  if (!card) return null;
  const owned = counts.NORMAL + counts.FOIL + counts.PRISMATIC;
  const max = maxCopiesFor(card);
  const usedIn = decks.filter((d) => (d.cards[cardId] ?? 0) > 0);
  const maxUsage = usedIn.reduce((m, d) => Math.max(m, d.cards[cardId] ?? 0), 0);
  const faction = FACTIONS[card.faction];

  const craft = (variant: Variant) => {
    const res = gameService.craft(cardId, variant);
    if (res.ok) {
      toast(t(CRAFTED[variant], { name: card.name }), 'success');
    } else {
      audio.play('error');
      toast(res.error, 'error');
    }
  };

  const recycle = async (variant: Variant) => {
    const value = recycleValue(cardId, variant);
    const remaining = owned - 1;
    const needsConfirm = CRAFTING.confirmRecycle.includes(card.rarity) || variant !== 'NORMAL' || remaining < maxUsage;
    if (needsConfirm) {
      const warnings: string[] = [];
      if (remaining < maxUsage) warnings.push(tn(usedIn.length, 'It is used in {n} deck ({names}), which will lose a copy.', 'It is used in {n} decks ({names}), which will lose a copy.', { names: usedIn.map((d) => d.name).join(', ') }));
      if (variant !== 'NORMAL') warnings.push(t(THIS_IS[variant]));
      const ok = await confirmDialog({
        title: t('Recycle {name}?', { name: card.name }),
        message: (
          <>
            <p>
              {t(DESTROY_ONE[variant])} <strong>{t('{n} Essence', { n: value })}</strong>. {t("This can't be undone.")}
            </p>
            {warnings.map((w) => (
              <p key={w} className="warn-text">
                {w}
              </p>
            ))}
          </>
        ),
        confirmLabel: t('Recycle for {n} Essence', { n: value }),
        danger: true,
      });
      if (!ok) return;
    }
    const res = gameService.recycle(cardId, variant, 1);
    if (res.ok) {
      audio.play('coin');
      toast(t('Recycled {name} for {n} Essence.', { name: card.name, n: res.value }), 'success');
    } else {
      audio.play('error');
      toast(res.error, 'error');
    }
  };

  return (
    <aside className="detail-panel panel" aria-label={t('{name} details', { name: card.name })}>
      <div className="detail-head">
        <h3>{card.name}</h3>
        <button className="icon-btn" onClick={onClose} aria-label={t('Close details')}>
          ✕
        </button>
      </div>
      <div className="detail-card">
        <CardView card={card} size="lg" variant={bestVariant(counts)} dimmed={owned === 0} onClick={() => useUi.getState().inspectCard(cardId, bestVariant(counts))} ariaLabel={t('Inspect {name}', { name: card.name })} />
      </div>
      <p className="detail-meta">
        <span style={{ color: faction.colors.primary }}>{faction.name}</span>
        <span className={`rarity-text-${card.rarity.toLowerCase()}`}>{t(card.rarity.charAt(0) + card.rarity.slice(1).toLowerCase())}</span>
        <span className="faint">{SET_INFO[card.set].name}</span>
      </p>
      <div className="owned-line">
        <span>{t('Owned')}</span>
        <strong className="num">
          {owned} / {max}
        </strong>
        {owned > max && <span className="chip surplus-chip">{t('{n} surplus', { n: owned - max })}</span>}
      </div>
      {usedIn.length > 0 && <p className="faint small">{t('In decks:')} {usedIn.map((d) => `${d.name} ×${d.cards[cardId]}`).join(', ')}</p>}

      <table className="variant-table">
        <thead>
          <tr>
            <th scope="col">{t('Variant')}</th>
            <th scope="col">{t('Owned')}</th>
            <th scope="col">{t('Craft')}</th>
            <th scope="col">{t('Recycle')}</th>
          </tr>
        </thead>
        <tbody>
          {VARIANTS.map((v) => {
            const cost = craftCost(cardId, v);
            return (
              <tr key={v}>
                <th scope="row" className={`variant-name v-${v.toLowerCase()}`}>
                  {t(VARIANT_LABEL[v])}
                </th>
                <td className="num">{counts[v]}</td>
                <td>
                  <button
                    className="btn btn-sm btn-cyan"
                    disabled={essence < cost}
                    onClick={() => craft(v)}
                    aria-label={t('Craft {variant} {name} for {n} Essence', { variant: t(VARIANT_LABEL[v]), name: card.name, n: cost })}
                    title={essence < cost ? t('Needs {n} more Essence', { n: cost - essence }) : undefined}
                  >
                    <EssenceIcon size={14} />
                    {cost}
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-sm"
                    disabled={counts[v] === 0}
                    onClick={() => void recycle(v)}
                    aria-label={t('Recycle one {variant} {name} for {n} Essence', { variant: t(VARIANT_LABEL[v]), name: card.name, n: recycleValue(cardId, v) })}
                  >
                    +{recycleValue(cardId, v)}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="detail-foot">
        <Essence amount={essence} />
        <button className="btn btn-ghost btn-sm" onClick={() => useUi.getState().inspectCard(cardId, bestVariant(counts))}>
          {t('Inspect')}
        </button>
        {card.rarity === 'LEGENDARY' && (
          <button className="btn btn-sm" onClick={() => setShowcase(true)}>
            {t('Play entrance')}
          </button>
        )}
      </div>
      {showcase && <LegendShowcase cardId={cardId} onDone={endShowcase} />}
      <p className="faint small">{t('Variants are cosmetic only; they play identically.')}</p>
    </aside>
  );
}
