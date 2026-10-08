import { useMemo, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { DUNGEON, DUNGEON_MATCHES } from '@/config/dungeon';
import { SET_INFO } from '@/config/economy';
import { getCard } from '@/data/cards';
import { FACTIONS } from '@/data/factions';
import { getTreasure } from '@/data/dungeonTreasures';
import {
  dungeonFloor, dungeonOf, dungeonOffers, dungeonOpponent, dungeonTreasureOffers, hasFreeDungeonEntry, isBossMatch,
  type DungeonRun, type DungeonSummary,
} from '@/domain/dungeon';
import { PLAYABLE_FACTIONS, type PlayableFaction } from '@/game/types';
import { gameService, useAccount } from '@/state/accountStore';
import { launchMatch } from '@/state/matchLaunch';
import { toast, useUi } from '@/state/uiStore';
import { audio } from '@/audio/audioService';
import { CardView, isTouchScreen } from '@/ui/components/CardView';
import { confirmDialog, Gold, ScreenHeader } from '@/ui/components/common';
import { Glyph, PackIcon } from '@/ui/components/Icons';
import { WardenPortrait } from '@/ui/components/WardenPortrait';
import { t, tn } from '@/i18n';
import '@/ui/styles/decks.css';
import '@/ui/styles/shop.css';
import '@/ui/styles/arena.css';
import '@/ui/styles/dungeon.css';

const DIFF_LABEL: Record<string, string> = { EASY: 'Easy', NORMAL: 'Normal', HARD: 'Hard', EXPERT: 'Expert' };
const FLOOR_NAMES = ['The Sunken Halls', 'The Ember Vaults', 'The Throne Below'];

function report(res: { ok: boolean; error?: string }, sound: 'click' | 'coin' | 'buff' = 'click') {
  if (res.ok) audio.play(sound);
  else {
    audio.play('error');
    toast(res.error ?? t('Something went wrong.'), 'error');
  }
  return res.ok;
}

/** Dungeon run: three floors of three opponents with a growing deck and treasures. */
export default function DungeonScreen() {
  const save = useAccount((s) => s.save);
  const navigate = useNavigate();
  if (!save) return null;
  const d = dungeonOf(save);
  const run = d.run;
  const showSummary = !run && d.last && !d.last.seen;

  return (
    <div className="screen arena-screen dungeon-screen">
      <ScreenHeader
        title={t('Dungeon')}
        subtitle={run ? tn(run.wins, '{n} win so far. One loss ends the run.', '{n} wins so far. One loss ends the run.') : t('Three floors, nine foes, one life. Build your deck as you go down.')}
        actions={
          run ? (
            <button
              className="btn btn-ghost"
              onClick={async () => {
                const ok = await confirmDialog({ title: t('Leave the Dungeon?'), message: <p>{tn(run.wins, 'The run ends now and you get the reward for {n} win.', 'The run ends now and you get the reward for {n} wins.')}</p>, confirmLabel: t('Leave'), danger: true });
                if (ok) report(gameService.dungeonRetire(), 'coin');
              }}
            >
              {t('Leave')}
            </button>
          ) : (
            <span className="shop-wallet">
              <Gold amount={save.profile.gold} size={22} />
            </span>
          )
        }
      />
      {showSummary ? (
        <RunSummary last={d.last!} onDone={() => gameService.dungeonAcknowledge()} />
      ) : !run ? (
        <Lobby gold={save.profile.gold} free={hasFreeDungeonEntry(save, Date.now())} runsPlayed={d.runsPlayed} bestWins={d.bestWins} clears={d.clears} />
      ) : (
        <div className="arena-play">
          <section className="panel dungeon-main">
            <FloorMap run={run} />
            {run.pending === 'CARDS' ? <CardOffers run={run} /> : run.pending === 'TREASURE' ? <TreasureOffers run={run} /> : <NextFoe run={run} onPlay={() => launchMatch({ mode: 'DUNGEON', deckId: null, opponent: dungeonOpponent(run) }, navigate)} />}
            <Treasures ids={run.treasures} />
          </section>
          <DeckSidebar run={run} />
        </div>
      )}
    </div>
  );
}

function Lobby({ gold, free, runsPlayed, bestWins, clears }: { gold: number; free: boolean; runsPlayed: number; bestWins: number; clears: number }) {
  const [faction, setFaction] = useState<PlayableFaction>('EMBER');
  const canEnter = free || gold >= DUNGEON.entryGold;
  return (
    <div className="dungeon-lobby">
      <section className="panel">
        <h3>{t('Choose your Warden')}</h3>
        <div className="dungeon-factions" role="radiogroup" aria-label={t('Choose your Warden')}>
          {PLAYABLE_FACTIONS.map((f) => {
            const info = FACTIONS[f];
            return (
              <button key={f} type="button" role="radio" aria-checked={f === faction} className={`dungeon-faction ${f === faction ? 'selected' : ''}`} style={{ '--fc': info.colors.primary } as CSSProperties} onClick={() => (audio.play('click'), setFaction(f))}>
                <WardenPortrait faction={f} size={64} />
                <strong>{info.name}</strong>
              </button>
            );
          })}
        </div>
        <ol className="arena-steps">
          <li>{t('Start with 20 simple cards of your Warden and Neutral cards. You do not need to own them.')}</li>
          <li>{t('After each win, add cards to your deck: one of two themed bundles of three, or one strong card.')}</li>
          <li>{t('Each floor ends with a boss. Beat it to take a treasure that helps in every later match.')}</li>
          <li>{t('One loss ends the run. The deeper you get, the bigger the reward.')}</li>
        </ol>
        <button className="btn btn-primary btn-xl" disabled={!canEnter} onClick={() => report(gameService.dungeonStart(faction), 'coin')}>
          {free ? t('Enter for free') : t('Enter for {n} Gold', { n: DUNGEON.entryGold })}
        </button>
        <p className="faint small">{free ? t('Your first Dungeon run each day is free.') : t('Your free run for today is used. A new one is ready tomorrow.')}</p>
        {!canEnter && <p className="deckbox-issue">{t('You need {n} more Gold.', { n: DUNGEON.entryGold - gold })}</p>}
        {runsPlayed > 0 && (
          <p className="faint small">
            {t('Runs played:')} <strong className="num">{runsPlayed}</strong> · {t('Best:')} <strong className="num">{bestWins}</strong> {tn(bestWins, 'win', 'wins')} · {t('Full clears:')} <strong className="num">{clears}</strong>
          </p>
        )}
      </section>
      <section className="panel">
        <h3>{t('Rewards')}</h3>
        <RewardTable />
      </section>
    </div>
  );
}

function RewardTable({ highlight }: { highlight?: number }) {
  return (
    <table className="arena-rewards">
      <tbody>
        {DUNGEON.rewards.map((r, wins) => (
          <tr key={wins} className={highlight === wins ? 'is-current' : ''}>
            <th scope="row" className="num">{wins}</th>
            <td>
              <span className="arena-reward-line">
                <span className="arena-reward-chip"><Gold amount={r.gold} /></span>
                {r.packs > 0 && <span className="arena-reward-chip"><PackIcon size={16} /> {tn(r.packs, '{n} pack', '{n} packs')}</span>}
                {r.essence > 0 && <span className="arena-reward-chip">{t('{n} Essence', { n: r.essence })}</span>}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FloorMap({ run }: { run: DungeonRun }) {
  return (
    <div className="dungeon-map" aria-label={t('{n} of {max} wins', { n: run.wins, max: DUNGEON_MATCHES })}>
      {Array.from({ length: DUNGEON.floors }, (_, f) => (
        <div key={f} className={`dungeon-floor ${dungeonFloor(run.wins) === f ? 'is-current' : ''}`}>
          <span className="dungeon-floor-name">
            {t('Floor {n}', { n: f + 1 })} · {t(FLOOR_NAMES[f])}
          </span>
          <span className="dungeon-nodes">
            {Array.from({ length: DUNGEON.perFloor }, (_, j) => {
              const i = f * DUNGEON.perFloor + j;
              const state = i < run.wins ? 'is-won' : i === run.wins ? 'is-next' : '';
              return (
                <span key={j} className={`dungeon-node ${state} ${isBossMatch(i) ? 'is-boss' : ''}`} title={isBossMatch(i) ? t('Boss') : undefined}>
                  <Glyph name={i < run.wins ? 'crown' : isBossMatch(i) ? 'skull' : 'sword'} size={isBossMatch(i) ? 22 : 16} />
                </span>
              );
            })}
          </span>
        </div>
      ))}
    </div>
  );
}

function NextFoe({ run, onPlay }: { run: DungeonRun; onPlay: () => void }) {
  const opp = dungeonOpponent(run);
  return (
    <div className="arena-next" style={{ '--fc': FACTIONS[opp.faction].colors.primary } as CSSProperties}>
      <span className="faint small">{t('Match {n} of {max}', { n: run.wins + 1, max: DUNGEON_MATCHES })}</span>
      <WardenPortrait faction={opp.faction} portrait={opp.portrait} size={110} />
      <strong className="arena-faction-name">
        {opp.name}
        {opp.boss && <span className="boss-tag">{t('Boss')}</span>}
      </strong>
      <span className="muted">
        {opp.title} · <span className={`arena-diff diff-${opp.difficulty.toLowerCase()}`}>{t(DIFF_LABEL[opp.difficulty])}</span>
      </span>
      {opp.special?.description.length ? (
        <ul className="dungeon-boss-rules">
          {opp.special.description.map((line) => (
            <li key={line}>{t(line)}</li>
          ))}
        </ul>
      ) : null}
      <button className="btn btn-primary btn-xl" onClick={onPlay}>
        {t('Fight')}
      </button>
    </div>
  );
}

function CardOffers({ run }: { run: DungeonRun }) {
  const offers = dungeonOffers(run);
  return (
    <div className="dungeon-offers-wrap">
      <h3>{run.wins === 0 && run.deck.length <= DUNGEON.startDeckSize ? t('Pick your first cards:') : t('Victory! Add to your deck:')}</h3>
      <p className="faint small">{isTouchScreen() ? t('Long-press a card to inspect it.') : t('Right-click a card to inspect it.')}</p>
      <div className="dungeon-offers">
        {offers.map((o, i) => (
          <button key={i} type="button" className="dungeon-offer panel" onClick={() => report(gameService.dungeonPickOffer(i), 'buff')}>
            <span className="dungeon-offer-label">{o.kind === 'BUNDLE' ? t('{name} bundle', { name: t(o.label ?? '') }) : t('One strong card')}</span>
            <span className={`dungeon-offer-cards n${o.cards.length}`}>
              {o.cards.map((id, j) => (
                <span
                  key={j}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    useUi.getState().inspectCard(id);
                  }}
                >
                  <CardView card={id} width={o.cards.length === 1 ? 140 : 100} />
                </span>
              ))}
            </span>
            <span className="btn btn-primary">{t('Take')}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TreasureOffers({ run }: { run: DungeonRun }) {
  const ids = dungeonTreasureOffers(run);
  return (
    <div className="dungeon-offers-wrap">
      <h3>{t('The boss falls! Choose a treasure:')}</h3>
      <div className="dungeon-offers">
        {ids.map((id) => {
          const tr = getTreasure(id)!;
          return (
            <button key={id} type="button" className="dungeon-treasure panel" onClick={() => report(gameService.dungeonPickTreasure(id), 'coin')}>
              <span className="dungeon-treasure-icon" aria-hidden>
                <Glyph name={tr.icon} size={34} />
              </span>
              <strong>{t(tr.name)}</strong>
              <span className="muted">{t(tr.description)}</span>
              <span className="btn btn-primary">{t('Take')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Treasures({ ids }: { ids: string[] }) {
  if (!ids.length) return null;
  return (
    <div className="dungeon-treasures">
      <span className="faint small">{t('Your treasures')}</span>
      {ids.map((id) => {
        const tr = getTreasure(id);
        return tr ? (
          <span key={id} className="dungeon-treasure-chip" title={t(tr.description)}>
            <Glyph name={tr.icon} size={14} /> {t(tr.name)}
          </span>
        ) : null;
      })}
    </div>
  );
}

function DeckSidebar({ run }: { run: DungeonRun }) {
  const rows = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const id of run.deck) counts[id] = (counts[id] ?? 0) + 1;
    return Object.entries(counts)
      .map(([id, n]) => ({ card: getCard(id)!, n }))
      .filter((r) => r.card)
      .sort((a, b) => a.card.manaCost - b.card.manaCost || a.card.name.localeCompare(b.card.name));
  }, [run.deck]);
  const info = FACTIONS[run.faction];
  return (
    <aside className="panel arena-deck" aria-label={t('Your Dungeon deck')}>
      <div className="arena-deck-head">
        <WardenPortrait faction={run.faction} size={40} />
        <div>
          <strong>{info.name}</strong>
          <span className="faint num">{tn(run.deck.length, '{n} card', '{n} cards')}</span>
        </div>
      </div>
      <ol className="deck-rows">
        {rows.map(({ card, n }) => (
          <li key={card.id}>
            <span
              className={`deck-row rarity-${card.rarity.toLowerCase()}`}
              style={{ '--rc': FACTIONS[card.faction].colors.primary } as CSSProperties}
              onClick={() => useUi.getState().inspectCard(card.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                useUi.getState().inspectCard(card.id);
              }}
            >
              <span className="row-cost num">{card.manaCost}</span>
              <span className="row-name">{card.name}</span>
              <span className="row-count num">×{n}</span>
            </span>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function RunSummary({ last, onDone }: { last: DungeonSummary; onDone: () => void }) {
  return (
    <section className="panel arena-summary">
      <Glyph name={last.cleared ? 'crown' : 'skull'} size={60} />
      <h3>{tn(last.wins, '{n} win', '{n} wins')}</h3>
      <p className="muted">{last.cleared ? t('You conquered the Dungeon! Its treasures are yours.') : t('Your Dungeon run is over. Here is what you earned:')}</p>
      <div className="arena-summary-rewards">
        <span className="arena-reward-chip big">
          <Gold amount={last.reward.gold} size={22} />
        </span>
        {last.reward.packs > 0 && (
          <span className="arena-reward-chip big">
            <PackIcon size={20} /> {last.reward.packs}× {SET_INFO[DUNGEON.packSet].name}
          </span>
        )}
        {last.reward.essence > 0 && <span className="arena-reward-chip big">{t('{n} Essence', { n: last.reward.essence })}</span>}
      </div>
      <button className="btn btn-primary btn-lg" onClick={onDone}>
        {t('Continue')}
      </button>
    </section>
  );
}
