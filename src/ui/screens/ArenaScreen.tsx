import { useMemo, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { ARENA } from '@/config/arena';
import { SET_INFO } from '@/config/economy';
import { getCard } from '@/data/cards';
import { getCardBack } from '@/data/cardBacks';
import { FACTIONS } from '@/data/factions';
import { defaultBuild, talentSummary, type TalentPick } from '@/data/wardenTalents';
import { arenaDeck, arenaOpponent, arenaPhase, arenaWins, currentOffer, hasFreeArenaEntry, type ArenaRun, type ArenaSummary } from '@/domain/arena';
import type { CardDefinition, PlayableFaction } from '@/game/types';
import { gameService, useAccount } from '@/state/accountStore';
import { launchMatch } from '@/state/matchLaunch';
import { toast, useUi } from '@/state/uiStore';
import { audio } from '@/audio/audioService';
import { CardBack, CardView } from '@/ui/components/CardView';
import { confirmDialog, Gold, ScreenHeader } from '@/ui/components/common';
import { Glyph, PackIcon } from '@/ui/components/Icons';
import { TalentTree } from '@/ui/components/TalentTree';
import { WardenPortrait } from '@/ui/components/WardenPortrait';
import { t, tn } from '@/i18n';
import '@/ui/styles/decks.css';
import '@/ui/styles/shop.css';
import '@/ui/styles/arena.css';

const DIFF_LABEL: Record<string, string> = { EASY: 'Easy', NORMAL: 'Normal', HARD: 'Hard', EXPERT: 'Expert' };

function report(res: { ok: boolean; error?: string }, sound: 'click' | 'coin' | 'buff' = 'click') {
  if (res.ok) audio.play(sound);
  else {
    audio.play('error');
    toast(res.error ?? t('Something went wrong.'), 'error');
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
        title={t('Arena')}
        subtitle={run ? runSubtitle(run) : t('Draft a deck from scratch, then see how far it takes you.')}
        actions={
          run ? (
            <button
              className="btn btn-ghost"
              onClick={async () => {
                const wins = arenaWins(run);
                const ok = await confirmDialog({ title: t('Retire from the Arena?'), message: <p>{tn(wins, 'The run ends now and you get the reward for {n} win.', 'The run ends now and you get the reward for {n} wins.')}</p>, confirmLabel: t('Retire'), danger: true });
                if (ok) report(gameService.arenaRetire(), 'coin');
              }}
            >
              {t('Retire')}
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
        <ArenaLobby gold={save.profile.gold} runsPlayed={save.arena.runsPlayed} bestWins={save.arena.bestWins} free={hasFreeArenaEntry(save, Date.now())} />
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
  if (phase === 'FACTION') return t('Choose your Warden.');
  if (phase === 'DRAFT') return t('Pick {n} of {max}.', { n: run.picks.length + 1, max: ARENA.deckSize });
  if (phase === 'TALENTS') return t('Set up your Warden abilities.');
  return tn(arenaWins(run), '{n} win so far. One loss ends the run.', '{n} wins so far. One loss ends the run.');
}

function RewardTable({ highlight }: { highlight?: number }) {
  return (
    <table className="arena-rewards">
      <thead>
        <tr>
          <th scope="col">{t('Wins')}</th>
          <th scope="col">{t('Reward')}</th>
        </tr>
      </thead>
      <tbody>
        {ARENA.rewards.map((r, wins) => (
          <tr key={wins} className={highlight === wins ? 'is-current' : ''}>
            <th scope="row" className="num">{wins}</th>
            <td>
              <span className="arena-reward-line">
                <span className="arena-reward-chip"><PackIcon size={16} /> {tn(r.packs, '{n} pack', '{n} packs')}</span>
                <span className="arena-reward-chip"><Gold amount={r.gold} /></span>
                {r.cardBack && <span className="arena-reward-chip is-back">{t('+ a card back you don’t own')}</span>}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ArenaLobby({ gold, runsPlayed, bestWins, free }: { gold: number; runsPlayed: number; bestWins: number; free: boolean }) {
  const canEnter = free || gold >= ARENA.entryGold;
  return (
    <div className="arena-lobby">
      <section className="panel arena-intro">
        <Glyph name="trophy" size={56} />
        <h3>{t('Enter the Arena')}</h3>
        <ol className="arena-steps">
          <li>{t('Choose one of two Wardens.')}</li>
          <li>{t('Draft {n} cards, one of three at a time, from that faction and Neutral.', { n: ARENA.deckSize })}</li>
          <li>{t('Set up your Warden abilities.')}</li>
          <li>{t('Win up to {n} matches. Opponents get tougher with every win, and your first loss ends the run.', { n: ARENA.maxWins })}</li>
        </ol>
        <p className="muted small">{t('Drafted cards are only for this run. You don’t need to own them, and they don’t go into your collection.')}</p>
        <button className="btn btn-primary btn-xl" disabled={!canEnter} onClick={() => report(gameService.arenaStart(), 'coin')}>
          {free ? t('Enter for free') : <>{t('Enter for')} <Gold amount={ARENA.entryGold} /></>}
        </button>
        <p className="faint small">{free ? t('Your first Arena run each day is free.') : t('Your free run for today is used. A new one is ready tomorrow.')}</p>
        {!canEnter && <p className="deckbox-issue">{t('You need {n} more Gold.', { n: ARENA.entryGold - gold })}</p>}
        {runsPlayed > 0 && (
          <p className="faint small">
            {t('Runs played:')} <strong className="num">{runsPlayed}</strong> · {t('Best:')} <strong className="num">{bestWins}</strong> {tn(bestWins, 'win', 'wins')}
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

/** Your chosen portrait for a faction (Profile → Warden portraits). */
const useMyPortrait = (f: PlayableFaction | null) => useAccount((s) => (f ? (s.save?.profile.factionPortraits[f] ?? null) : null));

function FactionPick({ run }: { run: ArenaRun }) {
  const chosen = useAccount((s) => s.save?.profile.factionPortraits ?? {});
  return (
    <div className="arena-factions">
      {run.factionChoices.map((f) => {
        const info = FACTIONS[f];
        return (
          <button key={f} className="panel arena-faction" style={{ '--fc': info.colors.primary } as CSSProperties} onClick={() => report(gameService.arenaChooseFaction(f), 'buff')}>
            <WardenPortrait faction={f} portrait={chosen[f]} size={120} />
            <strong className="arena-faction-name">{info.name}</strong>
            <em className="muted">{info.motto}</em>
            <span className="arena-faction-identity">{info.identity}</span>
            <span className="btn btn-primary">{t('Choose {name}', { name: info.short })}</span>
          </button>
        );
      })}
    </div>
  );
}

function DeckSidebar({ run }: { run: ArenaRun }) {
  const portrait = useMyPortrait(run.faction);
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
    <aside className="panel arena-deck" aria-label={t('Your Arena deck')}>
      <div className="arena-deck-head">
        {run.faction && <WardenPortrait faction={run.faction} portrait={portrait} size={40} />}
        <div>
          <strong>{info?.name}</strong>
          <span className="faint num">
            {run.picks.length} / {ARENA.deckSize} {t('cards')}
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
        {rows.length === 0 && <li className="empty small">{t('Your picks show up here.')}</li>}
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
            {t('Pick')} <strong className="num">{run.picks.length + 1}</strong> / {ARENA.deckSize}
          </span>
          {rarity && <span className={`arena-rarity rarity-text-${rarity.toLowerCase()}`}>{t(rarity.charAt(0) + rarity.slice(1).toLowerCase())}</span>}
          <span className="faint small">{t('Click a card to add it to your deck · right-click to inspect')}</span>
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
                  ariaLabel={`${t('Pick {name}.', { name: card.name })} ${card.description ?? ''}`}
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
            {t('Lock in and start')}
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
        <div className="arena-record" aria-label={t('{n} of {max} wins', { n: wins, max: ARENA.maxWins })}>
          {Array.from({ length: ARENA.maxWins }, (_, i) => (
            <span key={i} className={`arena-pip ${i < wins ? 'is-win' : ''}`}>
              <Glyph name={i < wins ? 'crown' : 'shield'} size={22} />
            </span>
          ))}
        </div>
        <div className="arena-next" style={{ '--fc': FACTIONS[opp.faction].colors.primary } as CSSProperties}>
          <span className="faint small">{t('Match {n} of {max}', { n: run.results.length + 1, max: ARENA.maxWins })}</span>
          <WardenPortrait faction={opp.faction} size={110} />
          <strong className="arena-faction-name">{opp.name}</strong>
          <span className="muted">
            {opp.title} · <span className={`arena-diff diff-${opp.difficulty.toLowerCase()}`}>{t(DIFF_LABEL[opp.difficulty])}</span>
          </span>
          <button className="btn btn-primary btn-xl" onClick={onPlay}>
            {t('Fight')}
          </button>
        </div>
        <p className="faint small">{t('Your Warden:')} {talentSummary(deck.talents)}</p>
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
        {tn(last.wins, '{n} win', '{n} wins')}
      </h3>
      <p className="muted">{last.wins >= ARENA.maxWins ? t('A perfect run! The crowd roars your name.') : t('Your Arena run is over. Here is what you earned:')}</p>
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
        {t('Continue')}
      </button>
    </section>
  );
}
