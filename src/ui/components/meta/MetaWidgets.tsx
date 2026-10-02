import type { CSSProperties } from 'react';
import { FACTIONS } from '@/data/factions';
import { DAILY_REWARDS, type DailyReward } from '@/config/dailyRewards';
import { SET_INFO } from '@/config/economy';
import { deckSize, validateDeck, type Deck } from '@/domain/decks';
import { dailyStatus } from '@/domain/daily';
import { canReroll } from '@/domain/quests';
import { ownedCopies, type GameSave, type Quest } from '@/domain/save';
import { gameService } from '@/state/accountStore';
import { toast } from '@/state/uiStore';
import { audio } from '@/audio/audioService';
import { getCardSafe } from '@/data/cards';
import { talentSummary } from '@/data/wardenTalents';
import { Essence, Gold, ProgressBar } from '../common';
import { EssenceIcon, Glyph, GoldIcon, PackIcon } from '../Icons';
import { WardenPortrait } from '../WardenPortrait';

export function factionStyle(faction: keyof typeof FACTIONS): CSSProperties {
  const f = FACTIONS[faction];
  return { '--f1': f.colors.primary, '--f2': f.colors.secondary, '--fdark': f.colors.dark, '--fglow': f.colors.glow } as CSSProperties;
}

export function deckIssues(save: GameSave, deck: Deck) {
  return validateDeck(deck, (id) => ownedCopies(save.collection, id));
}

/** Compact "deck box" with faction colors. */
export function DeckBox({ deck, save, selected, onSelect, compact }: { deck: Deck; save: GameSave; selected?: boolean; onSelect?: () => void; compact?: boolean }) {
  const issues = deckIssues(save, deck);
  const valid = issues.length === 0;
  const f = FACTIONS[deck.heroFaction];
  const content = (
    <>
      <span className="deckbox-sigil" aria-hidden>
        <WardenPortrait faction={deck.heroFaction} size={compact ? 34 : 46} />
      </span>
      <span className="deckbox-text">
        <strong>
          {deck.name}
          {deck.favorite && <span className="deckbox-fav" title="Favorite deck"> ★</span>}
        </strong>
        <span className="faint">
          {f.name}, {deckSize(deck)} cards
        </span>
        {deck.talents.length > 0 && <span className="deckbox-talents faint small">{talentSummary(deck.talents)}</span>}
        {!valid && <span className="deckbox-issue">⚠ {issues[0].message}</span>}
      </span>
      {selected && <span className="deckbox-check" aria-hidden>✓</span>}
    </>
  );
  const cls = `deckbox ${selected ? 'selected' : ''} ${valid ? '' : 'invalid'} ${compact ? 'compact' : ''}`;
  if (!onSelect) return <div className={cls} style={factionStyle(deck.heroFaction)}>{content}</div>;
  return (
    <button
      type="button"
      className={cls}
      style={factionStyle(deck.heroFaction)}
      onClick={onSelect}
      disabled={!valid}
      aria-pressed={selected}
      aria-label={`${deck.name}, ${f.name}${valid ? '' : `, unavailable: ${issues[0].message}`}`}
    >
      {content}
    </button>
  );
}

/** Deck picker listing all decks; invalid ones disabled with reason. */
export function DeckPicker({ save, value, onChange }: { save: GameSave; value: string | null; onChange: (id: string) => void }) {
  return (
    <div className="deck-picker" role="radiogroup" aria-label="Choose your deck">
      {save.decks.map((d) => (
        <DeckBox
          key={d.id}
          deck={d}
          save={save}
          compact
          selected={d.id === value}
          onSelect={() => {
            audio.play('click');
            onChange(d.id);
            gameService.selectDeck(d.id);
          }}
        />
      ))}
    </div>
  );
}

export function firstValidDeck(save: GameSave, preferred: string | null): string | null {
  const pref = save.decks.find((d) => d.id === preferred);
  if (pref && deckIssues(save, pref).length === 0) return pref.id;
  return save.decks.find((d) => deckIssues(save, d).length === 0)?.id ?? null;
}

// ---------------------------------------------------------------------------
// Daily login rewards
// ---------------------------------------------------------------------------

function rewardLabel(r: DailyReward): { icon: React.ReactNode; text: string } {
  switch (r.kind) {
    case 'GOLD':
      return { icon: <GoldIcon size={22} />, text: `${r.amount} Gold` };
    case 'ESSENCE':
      return { icon: <EssenceIcon size={22} />, text: `${r.amount} Essence` };
    case 'PACK':
      return { icon: <PackIcon size={22} />, text: `${r.amount} ${SET_INFO[r.setId].name} pack` };
    case 'RANDOM_CARD':
      return { icon: <Glyph name="crystal" size={22} className={`rarity-text-${r.rarity.toLowerCase()}`} />, text: `${r.rarity.charAt(0) + r.rarity.slice(1).toLowerCase()} card` };
  }
}

export function DailyTrack({ save }: { save: GameSave }) {
  const status = dailyStatus(save, Date.now());
  const claimedToday = !status.canClaim && save.daily.lastClaimDay !== null;
  const claim = () => {
    const res = gameService.claimDaily();
    if (res.ok) {
      audio.play('coin');
      const r = rewardLabel(res.value.reward);
      toast(res.value.cardId ? `Daily reward: ${getCardSafe(res.value.cardId).name}` : `Daily reward: ${r.text}`, 'reward');
    } else {
      audio.play('error');
      toast(res.error, 'error');
    }
  };
  return (
    <div className="daily-track">
      <ol className="daily-days">
        {DAILY_REWARDS.map((r, i) => {
          const lbl = rewardLabel(r);
          const isNext = i === status.index;
          // After claiming day 7 the cycle wraps to 0: show the whole week as claimed until tomorrow.
          const done = i < status.index || (!status.canClaim && claimedToday && status.index === 0);
          const state = isNext && status.canClaim ? 'ready' : done ? 'done' : 'future';
          return (
            <li key={i} className={`daily-day ${state}`} aria-label={`Day ${i + 1}: ${lbl.text}${state === 'done' ? ', claimed' : state === 'ready' ? ', ready to claim' : ''}`}>
              <span className="daily-num">Day {i + 1}</span>
              <span className="daily-icon">{lbl.icon}</span>
              <span className="daily-text">{lbl.text}</span>
              {state === 'done' && <span className="daily-mark" aria-hidden>✓</span>}
            </li>
          );
        })}
      </ol>
      <div className="daily-actions">
        {status.canClaim ? (
          <button className="btn btn-primary" onClick={claim}>
            Claim day {status.index + 1}
          </button>
        ) : (
          <span className="muted">{status.reason === 'Already claimed today.' ? 'Come back tomorrow for the next reward.' : status.reason}</span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quests
// ---------------------------------------------------------------------------

export function QuestRow({ quest, save, allowReroll = true }: { quest: Quest; save: GameSave; allowReroll?: boolean }) {
  const claim = () => {
    const res = gameService.claimQuest(quest.id);
    if (res.ok) {
      audio.play('coin');
      toast(`Quest complete: +${res.value.gold} Gold, +${res.value.xp} XP`, 'reward');
      for (const l of res.value.levelUps) {
        audio.play('levelUp');
        toast(`Level up! You reached level ${l.level}`, 'reward');
      }
    } else toast(res.error, 'error');
  };
  const reroll = () => {
    const res = gameService.rerollQuest(quest.id);
    if (res.ok) {
      audio.play('click');
      toast('Quest replaced', 'info');
    } else toast(res.error, 'error');
  };
  const rerollable = allowReroll && !quest.completed && canReroll(save, Date.now());
  return (
    <div className={`quest-row ${quest.completed ? 'complete' : ''} ${quest.claimed ? 'claimed' : ''}`} style={quest.faction ? factionStyle(quest.faction) : undefined}>
      <span className="quest-icon" aria-hidden>
        <Glyph name={quest.faction ? FACTIONS[quest.faction].sigil : quest.completed ? 'trophy' : 'scroll2'} size={22} />
      </span>
      <div className="quest-main">
        <div className="quest-title">
          <strong>{quest.name}</strong>
          <span className="quest-reward">
            <Gold amount={quest.gold} size={15} /> <span className="num faint">+{quest.xp} XP</span>
          </span>
        </div>
        <span className="muted quest-desc">{quest.description}</span>
        <div className="quest-progress">
          <ProgressBar value={quest.progress} max={quest.target} gold={quest.completed} label={`${quest.name} progress`} />
          <span className="num">
            {quest.progress} / {quest.target}
          </span>
        </div>
      </div>
      <div className="quest-actions">
        {quest.claimed ? (
          <span className="chip">Claimed</span>
        ) : quest.completed ? (
          <button className="btn btn-primary btn-sm" onClick={claim}>
            Claim
          </button>
        ) : (
          rerollable && (
            <button className="btn btn-ghost btn-sm" onClick={reroll} title="Replace this quest (once per day)">
              Replace
            </button>
          )
        )}
      </div>
    </div>
  );
}

export function RewardSummary({ reward }: { reward: GameSave['recentRewards'][number] }) {
  return (
    <span className="reward-bits">
      {reward.gold ? <Gold amount={reward.gold} size={15} /> : null}
      {reward.essence ? <Essence amount={reward.essence} size={15} /> : null}
      {reward.xp ? <span className="num faint">+{reward.xp} XP</span> : null}
      {reward.packs ? (
        <span className="currency">
          <PackIcon size={15} /> {reward.packs.amount}
        </span>
      ) : null}
      {reward.cards?.map((c, i) => (
        <span key={i} className={`chip rarity-text-${getCardSafe(c.cardId).rarity.toLowerCase()}`}>
          {getCardSafe(c.cardId).name}
        </span>
      ))}
      {reward.title ? <span className="chip gold-text">Title: {reward.title}</span> : null}
    </span>
  );
}

export function timeAgo(ts: number): string {
  const s = Math.max(0, (Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

export const DIFFICULTY_INFO: Record<string, { label: string; text: string }> = {
  EASY: { label: 'Easy', text: 'Plays greedily one move at a time and sometimes blunders or passes with energy left.' },
  NORMAL: { label: 'Normal', text: 'Makes sensible trades, reads board advantage and takes lethal when it sees it.' },
  HARD: { label: 'Hard', text: 'Plans several actions ahead, sequences combos and manages energy carefully.' },
  EXPERT: { label: 'Expert', text: 'Deep search that also predicts your counter-attack before committing.' },
};
