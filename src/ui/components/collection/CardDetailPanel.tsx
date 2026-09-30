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

export const VARIANT_LABEL: Record<Variant, string> = { NORMAL: 'Normal', FOIL: 'Foil', PRISMATIC: 'Prismatic' };

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
  if (!card) return null;
  const owned = counts.NORMAL + counts.FOIL + counts.PRISMATIC;
  const max = maxCopiesFor(card);
  const usedIn = decks.filter((d) => (d.cards[cardId] ?? 0) > 0);
  const maxUsage = usedIn.reduce((m, d) => Math.max(m, d.cards[cardId] ?? 0), 0);
  const faction = FACTIONS[card.faction];

  const craft = (variant: Variant) => {
    const res = gameService.craft(cardId, variant);
    if (res.ok) {
      audio.play(card.rarity === 'LEGENDARY' ? 'legendaryReveal' : card.rarity === 'EPIC' ? 'epicReveal' : 'reveal');
      toast(`Crafted ${VARIANT_LABEL[variant].toLowerCase()} ${card.name}.`, 'success');
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
      if (remaining < maxUsage) warnings.push(`It is used in ${usedIn.length} deck${usedIn.length > 1 ? 's' : ''} (${usedIn.map((d) => d.name).join(', ')}), which will lose a copy.`);
      if (variant !== 'NORMAL') warnings.push(`This is a ${VARIANT_LABEL[variant].toLowerCase()} copy.`);
      const ok = await confirmDialog({
        title: `Recycle ${card.name}?`,
        message: (
          <>
            <p>
              You will destroy one {VARIANT_LABEL[variant].toLowerCase()} copy and receive <strong>{value} Essence</strong>. This can't be undone.
            </p>
            {warnings.map((w) => (
              <p key={w} className="warn-text">
                {w}
              </p>
            ))}
          </>
        ),
        confirmLabel: `Recycle for ${value} Essence`,
        danger: true,
      });
      if (!ok) return;
    }
    const res = gameService.recycle(cardId, variant, 1);
    if (res.ok) {
      audio.play('coin');
      toast(`Recycled ${card.name} for ${res.value} Essence.`, 'success');
    } else {
      audio.play('error');
      toast(res.error, 'error');
    }
  };

  return (
    <aside className="detail-panel panel" aria-label={`${card.name} details`}>
      <div className="detail-head">
        <h3>{card.name}</h3>
        <button className="icon-btn" onClick={onClose} aria-label="Close details">
          ✕
        </button>
      </div>
      <div className="detail-card">
        <CardView card={card} size="lg" variant={bestVariant(counts)} dimmed={owned === 0} onClick={() => useUi.getState().inspectCard(cardId, bestVariant(counts))} ariaLabel={`Inspect ${card.name}`} />
      </div>
      <p className="detail-meta">
        <span style={{ color: faction.colors.primary }}>{faction.name}</span>
        <span className={`rarity-text-${card.rarity.toLowerCase()}`}>{card.rarity.charAt(0) + card.rarity.slice(1).toLowerCase()}</span>
        <span className="faint">{SET_INFO[card.set].name}</span>
      </p>
      <div className="owned-line">
        <span>Owned</span>
        <strong className="num">
          {owned} / {max}
        </strong>
        {owned > max && <span className="chip surplus-chip">{owned - max} surplus</span>}
      </div>
      {usedIn.length > 0 && <p className="faint small">In decks: {usedIn.map((d) => `${d.name} ×${d.cards[cardId]}`).join(', ')}</p>}

      <table className="variant-table">
        <thead>
          <tr>
            <th scope="col">Variant</th>
            <th scope="col">Owned</th>
            <th scope="col">Craft</th>
            <th scope="col">Recycle</th>
          </tr>
        </thead>
        <tbody>
          {VARIANTS.map((v) => {
            const cost = craftCost(cardId, v);
            return (
              <tr key={v}>
                <th scope="row" className={`variant-name v-${v.toLowerCase()}`}>
                  {VARIANT_LABEL[v]}
                </th>
                <td className="num">{counts[v]}</td>
                <td>
                  <button
                    className="btn btn-sm btn-cyan"
                    disabled={essence < cost}
                    onClick={() => craft(v)}
                    aria-label={`Craft ${VARIANT_LABEL[v]} ${card.name} for ${cost} Essence`}
                    title={essence < cost ? `Needs ${cost - essence} more Essence` : undefined}
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
                    aria-label={`Recycle one ${VARIANT_LABEL[v]} ${card.name} for ${recycleValue(cardId, v)} Essence`}
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
          Inspect
        </button>
      </div>
      <p className="faint small">Variants are cosmetic only; they play identically.</p>
    </aside>
  );
}
