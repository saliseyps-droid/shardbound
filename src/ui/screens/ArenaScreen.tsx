import { useMemo, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { ARENA } from '@/config/arena';
import { SET_INFO } from '@/config/economy';
import { getCard } from '@/data/cards';
import { getCardBack } from '@/data/cardBacks';
import { FACTIONS } from '@/data/factions';
import { defaultBuild, talentSummary, type TalentPick } from '@/data/wardenTalents';
import { arenaDeck, arenaOpponent, arenaPhase, arenaWins, currentOffer, type ArenaRun, type ArenaSummary } from '@/domain/arena';
import type { CardDefinition } from '@/game/types';
import { gameService, useAccount } from '@/state/accountStore';
import { launchMatch } from '@/state/matchLaunch';
import { toast, useUi } from '@/state/uiStore';
import { audio } from '@/audio/audioService';
import { CardBack, CardView } from '@/ui/components/CardView';
import { confirmDialog, Gold, ScreenHeader } from '@/ui/components/common';
import { Glyph, PackIcon } from '@/ui/components/Icons';
import { TalentTree } from '@/ui/components/TalentTree';
import { WardenPortrait } from '@/ui/components/WardenPortrait';
import '@/ui/styles/decks.css';
import '@/ui/styles/shop.css';
import '@/ui/styles/arena.css';

const DIFF_LABEL: Record<string, string> = { EASY: 'Easy', NORMAL: 'Normal', HARD: 'Hard', EXPERT: 'Expert' };

function report(res: { ok: boolean; error?: string }, sound: 'click' | 'coin' | 'buff' = 'click') {
  if (res.ok) audio.play(sound);
  else {
    audio.play('error');
    toast(res.error ?? 'Something went wrong.', 'error');
  }
  return res.ok;
}

export default function ArenaScreen() {
  const save = useAccount((s) => s.save);
  const navigate = useNavigate();
  if (!save) return null;
  const run = save.arena.run;
  const last = save.arena.last;
  const showSummary = !run && last && !last.seen;

  return (
    <div className="screen arena-screen">
      <ScreenHeader
        title="Arena"
        subtitle={run ? runSubtitle(run) : 'Draft a deck from scratch, then see how far it takes you.'}
        actions={
          run ? (
            <button
              className="btn btn-ghost"
              onClick={async () => {
                const wins = arenaWins(run);
                const ok = await confirmDialog({ title: 'Retire from the Arena?', message: <p>The run ends now and you get the reward for {wins} win{wins === 1 ? '' : 's'}.</p>, confirmLabel: 'Retire', danger: true });
                if (ok) report(gameService.arenaRetire(), 'coin');
              }}
            >
              Retire
            </button>
          ) : (
            <span className="shop-wallet">
              <Gold amount={save.profile.gold} size={22} />
            </span>
          )
        }
      />
      {showSummary ? (
        <RunSummary last={last!} onDone={() => gameService.arenaAcknowledge()} />
      ) : !run ? (
        <ArenaLobby gold={save.profile.gold} runsPlayed={save.arena.runsPlayed} bestWins={save.arena.bestWins} />
      ) : arenaPhase(run) === 'FACTION' ? (
        <FactionPick run={run} />
      ) : arenaPhase(run) === 'DRAFT' ? (
        <Draft run={run} />
      ) : arenaPhase(run) === 'TALENTS' ? (
        <ArenaTalents run={run} />
      ) : (
        <ArenaMatches run={run} onPlay={() => launchMatch({ mode: 'ARENA', deckId: null, opponent: arenaOpponent(run) }, navigate)} />
      )}
    </div>
  );
}

function runSubtitle(run: ArenaRun): string {
  const phase = arenaPhase(run);
  if (phase === 'FACTION') return 'Choose your Warden.';
  if (phase === 'DRAFT') return `Pick ${run.picks.length + 1} of ${ARENA.deckSize}.`;
  if (phase === 'TALENTS') return 'Set up your Warden abilities.';
  return `${arenaWins(run)} win${arenaWins(run) === 1 ? '' : 's'} so far. One loss ends the run.`;
}

function RewardTable({ highlight }: { highlight?: number }) {
  return (
    <table className="arena-rewards">
      <thead>
        <tr>
          <th scope="col">Wins</th>
          <th scope="col">Reward</th>
        </tr>
      </thead>
      <tbody>
        {ARENA.rewards.map((r, wins) => (
          <tr key={wins} className={highlight === wins ? 'is-current' : ''}>
            <th scope="row" className="num">{wins}</th>
            <td>
              <span className="arena-reward-line">
                <span className="arena-reward-chip"><PackIcon size={16} /> {r.packs} pack{r.packs === 1 ? '' : 's'}</span>
                <span className="arena-reward-chip"><Gold amount={r.gold} /></span>
                {r.cardBack && <span className="arena-reward-chip is-back">+ a card back you don’t own</span>}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ArenaLobby({ gold, runsPlayed, bestWins }: { gold: number; runsPlayed: number; bestWins: number }) {
  const canEnter = gold >= ARENA.entryGold;
  return (
    <div className="arena-lobby">
      <section className="panel arena-intro">
        <Glyph name="trophy" size={56} />
        <h3>Enter the Arena</h3>
        <ol className="arena-steps">
          <li>Choose one of two Wardens.</li>
          <li>Draft {ARENA.deckSize} cards, one of three at a time, from that faction and Neutral.</li>
          <li>Set up your Warden abilities.</li>
          <li>Win up to {ARENA.maxWins} matches. Opponents get tougher with every win, and your first loss ends the run.</li>
        </ol>
        <p className="muted small">Drafted cards are only for this run. You don’t need to own them, and they don’t go into your collection.</p>
        <button className="btn btn-primary btn-xl" disabled={!canEnter} onClick={() => report(gameService.arenaStart(), 'coin')}>
          Enter for <Gold amount={ARENA.entryGold} />
        </button>
        {!canEnter && <p className="deckbox-issue">You need {ARENA.entryGold - gold} more Gold.</p>}
        {runsPlayed > 0 && (
          <p className="faint small">
            Runs played: <strong className="num">{runsPlayed}</strong> · Best: <strong className="num">{bestWins}</strong> win{bestWins === 1 ? '' : 's'}
          </p>
        )}
      </section>
      <section className="panel">
        <h3>Rewards</h3>
        <RewardTable />
      </section>
    </div>
  );
}

function FactionPick({ run }: { run: ArenaRun }) {
  return (
    <div className="arena-factions">
      {run.factionChoices.map((f) => {
        const info = FACTIONS[f];
        return (
          <button key={f} className="panel arena-faction" style={{ '--fc': info.colors.primary } as CSSProperties} onClick={() => report(gameService.arenaChooseFaction(f), 'buff')}>
            <WardenPortrait faction={f} size={120} />
            <strong className="arena-faction-name">{info.name}</strong>
            <em className="muted">{info.motto}</em>
            <span className="arena-faction-identity">{info.identity}</span>
            <span className="btn btn-primary">Choose {info.short}</span>
          </button>
        );
      })}
    </div>
  );
}

function DeckSidebar({ run }: { run: ArenaRun }) {
  const rows = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const id of run.picks) counts[id] = (counts[id] ?? 0) + 1;
    return Object.entries(counts)
      .map(([id, n]) => ({ card: getCard(id)!, n }))
      .filter((r) => r.card)
      .sort((a, b) => a.card.manaCost - b.card.manaCost || a.card.name.localeCompare(b.card.name));
  }, [run.picks]);
  const curve = Array.from({ length: 8 }, () => 0);
  for (const id of run.picks) curve[Math.min(7, getCard(id)?.manaCost ?? 0)]++;
  const max = Math.max(3, ...curve);
  const info = run.faction ? FACTIONS[run.faction] : null;
  return (
    <aside className="panel arena-deck" aria-label="Your Arena deck">
      <div className="arena-deck-head">
        {run.faction && <WardenPortrait faction={run.faction} size={40} />}
        <div>
          <strong>{info?.name}</strong>
          <span className="faint num">
            {run.picks.length} / {ARENA.deckSize} cards
          </span>
        </div>
      </div>
      <div className="arena-curve" aria-hidden>
        {curve.map((n, i) => (
          <span key={i} className="arena-curve-col">
            <span className="arena-curve-bar" style={{ height: `${(n / max) * 100}%` }} />
            <span className="num faint">{i === 7 ? '7+' : i}</span>
          </span>
        ))}
      </div>
      <ol className="deck-rows">
        {rows.length === 0 && <li className="empty small">Your picks show up here.</li>}
        {rows.map(({ card, n }) => (
          <li key={card.id}>
            <span
              className={`deck-row rarity-${card.rarity.toLowerCase()}`}
              style={{ '--rc': FACTIONS[card.faction].colors.primary } as CSSProperties}
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

function Draft({ run }: { run: ArenaRun }) {
  const offer = currentOffer(run);
  const rarity = offer[0] ? getCard(offer[0])?.rarity : undefined;
  return (
    <div className="arena-play">
      <section className="arena-offer-wrap">
        <div className="arena-offer-head">
          <span className="arena-pick-count">
            Pick <strong className="num">{run.picks.length + 1}</strong> / {ARENA.deckSize}
          </span>
          {rarity && <span className={`arena-rarity rarity-text-${rarity.toLowerCase()}`}>{rarity.charAt(0) + rarity.slice(1).toLowerCase()}</span>}
          <span className="faint small">Click a card to add it to your deck · right-click to inspect</span>
        </div>
        <div className="arena-offer" key={run.picks.length}>
          {offer.map((id, i) => {
            const card = getCard(id) as CardDefinition;
            return (
              <div key={id} className="arena-offer-card" style={{ '--i': i } as CSSProperties}>
                <CardView
                  card={card}
                  width={230}
                  onClick={() => report(gameService.arenaPick(id), 'click')}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    useUi.getState().inspectCard(id);
                  }}
                  ariaLabel={`Pick ${card.name}. ${card.description ?? ''}`}
                />
              </div>
            );
          })}
        </div>
      </section>
      <DeckSidebar run={run} />
    </div>
  );
}

function ArenaTalents({ run }: { run: ArenaRun }) {
  const [build, setBuild] = useState<TalentPick[]>(() => defaultBuild(run.faction!));
  return (
    <div className="arena-play">
      <section className="panel arena-talents">
        <TalentTree faction={run.faction!} build={build} onChange={setBuild} />
        <div className="arena-talents-foot">
          <button className="btn btn-primary btn-lg" onClick={() => report(gameService.arenaSetTalents(build), 'buff')}>
            Lock in and start
          </button>
        </div>
      </section>
      <DeckSidebar run={run} />
    </div>
  );
}

function ArenaMatches({ run, onPlay }: { run: ArenaRun; onPlay: () => void }) {
  const opp = arenaOpponent(run);
  const wins = arenaWins(run);
  const deck = arenaDeck(run);
  return (
    <div className="arena-play">
      <section className="panel arena-matches">
        <div className="arena-record" aria-label={`${wins} of ${ARENA.maxWins} wins`}>
          {Array.from({ length: ARENA.maxWins }, (_, i) => (
            <span key={i} className={`arena-pip ${i < wins ? 'is-win' : ''}`}>
              <Glyph name={i < wins ? 'crown' : 'shield'} size={22} />
            </span>
          ))}
        </div>
        <div className="arena-next" style={{ '--fc': FACTIONS[opp.faction].colors.primary } as CSSProperties}>
          <span className="faint small">Match {run.results.length + 1} of {ARENA.maxWins}</span>
          <WardenPortrait faction={opp.faction} size={110} />
          <strong className="arena-faction-name">{opp.name}</strong>
          <span className="muted">
            {opp.title} · <span className={`arena-diff diff-${opp.difficulty.toLowerCase()}`}>{DIFF_LABEL[opp.difficulty]}</span>
          </span>
          <button className="btn btn-primary btn-xl" onClick={onPlay}>
            Fight
          </button>
        </div>
        <p className="faint small">Your Warden: {talentSummary(deck.talents)}</p>
        <RewardTable highlight={wins} />
      </section>
      <DeckSidebar run={run} />
    </div>
  );
}

function RunSummary({ last, onDone }: { last: ArenaSummary; onDone: () => void }) {
  const back = getCardBack(last.reward.cardBack);
  return (
    <section className="panel arena-summary">
      <Glyph name="trophy" size={60} />
      <h3>
        {last.wins} win{last.wins === 1 ? '' : 's'}
      </h3>
      <p className="muted">{last.wins >= ARENA.maxWins ? 'A perfect run! The crowd roars your name.' : 'Your Arena run is over. Here is what you earned:'}</p>
      <div className="arena-summary-rewards">
        <span className="arena-reward-chip big">
          <Gold amount={last.reward.gold} size={22} />
        </span>
        {last.reward.packs.map((p) => (
          <span key={p.setId} className="arena-reward-chip big">
            <PackIcon size={20} /> {p.amount}× {SET_INFO[p.setId].name}
          </span>
        ))}
        {back && (
          <span className="arena-reward-back">
            <CardBack width={90} design={back.id} />
            <span>{back.name}</span>
          </span>
        )}
      </div>
      <button className="btn btn-primary btn-lg" onClick={onDone}>
        Continue
      </button>
    </section>
  );
}
