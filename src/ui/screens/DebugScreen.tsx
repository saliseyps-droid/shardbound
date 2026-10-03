import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameService, useAccount } from '@/state/accountStore';
import { launchMatch } from '@/state/matchLaunch';
import { toast } from '@/state/uiStore';
import { collectibleCards, getCardSafe } from '@/data/cards';
import { CAMPAIGN, DIFFICULTY_POOLS, PRACTICE_OPPONENTS, findEncounter } from '@/data/opponents';
import { FACTIONS } from '@/data/factions';
import { PACK_CONFIG } from '@/config/economy';
import { DIFFICULTIES, type Difficulty } from '@/config/progression';
import { createRng, randomSeed } from '@/core/rng';
import { generatePack, type PityState } from '@/domain/packs';
import { autoBuildDeck } from '@/domain/decks';
import { PLAYABLE_FACTIONS, RARITIES, type PlayableFaction, type Rarity, type SetId, type Variant } from '@/game/types';
import type { GameEvent, TargetRef } from '@/engine/types';
import { getLastMatchLog } from '@/ui/match/matchLog';
import { confirmDialog, ScreenHeader } from '@/ui/components/common';
import { DeckPicker, firstValidDeck } from '@/ui/components/meta/MetaWidgets';
import '@/ui/styles/meta.css';

interface SimResult {
  packs: number;
  setId: SetId;
  standard: Record<Rarity, number>;
  guaranteed: Record<Rarity, number>;
  variants: Record<Variant, number>;
  maxSinceEpic: number;
  maxSinceLegendary: number;
  packsWithLegendary: number;
  ms: number;
}

function simulatePacks(setId: SetId, n: number): SimResult {
  const t0 = performance.now();
  const rng = createRng(randomSeed());
  const zero = () => ({ COMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0 });
  const r: SimResult = { packs: n, setId, standard: zero(), guaranteed: zero(), variants: { NORMAL: 0, FOIL: 0, PRISMATIC: 0 }, maxSinceEpic: 0, maxSinceLegendary: 0, packsWithLegendary: 0, ms: 0 };
  let pity: PityState = { EPIC: 0, LEGENDARY: 0 };
  let sinceE = 0;
  let sinceL = 0;
  for (let i = 0; i < n; i++) {
    const p = generatePack(setId, pity, () => 0, rng);
    pity = p.pity;
    p.cards.forEach((c, idx) => {
      (idx === p.cards.length - 1 ? r.guaranteed : r.standard)[c.rarity]++;
      r.variants[c.variant]++;
    });
    const hasE = p.cards.some((c) => c.rarity === 'EPIC' || c.rarity === 'LEGENDARY');
    const hasL = p.cards.some((c) => c.rarity === 'LEGENDARY');
    sinceE = hasE ? 0 : sinceE + 1;
    sinceL = hasL ? 0 : sinceL + 1;
    if (hasL) r.packsWithLegendary++;
    r.maxSinceEpic = Math.max(r.maxSinceEpic, sinceE);
    r.maxSinceLegendary = Math.max(r.maxSinceLegendary, sinceL);
  }
  r.ms = performance.now() - t0;
  return r;
}

function pct(n: number, d: number) {
  return d ? `${((n / d) * 100).toFixed(2)}%` : '—';
}

function refName(ref: TargetRef | undefined, ev: GameEvent[]): string {
  if (!ref) return '';
  if (ref.type === 'hero') return `Warden ${ref.player}`;
  const summon = ev.find((e) => (e.type === 'UNIT_SUMMONED' && e.uid === ref.uid) || (e.type === 'UNIT_TRANSFORMED' && e.uid === ref.uid));
  return summon && 'cardId' in summon ? `${getCardSafe(summon.cardId).name}#${ref.uid}` : `unit#${ref.uid}`;
}

function formatEvent(e: GameEvent, all: GameEvent[]): string {
  const n = (id: string) => getCardSafe(id).name;
  switch (e.type) {
    case 'CARD_PLAYED':
      return `P${e.player} plays ${n(e.cardId)}${e.target ? ` → ${refName(e.target, all)}` : ''}`;
    case 'CARD_DRAWN':
      return `P${e.player} draws ${n(e.cardId)}`;
    case 'UNIT_SUMMONED':
      return `P${e.player} summons ${n(e.cardId)}#${e.uid}`;
    case 'UNIT_DIED':
      return `${n(e.cardId)}#${e.uid} dies`;
    case 'DAMAGE_DEALT':
      return `${e.amount} damage to ${refName(e.target, all)}${e.combat ? ' (combat)' : ''}`;
    case 'HEALED':
      return `${refName(e.target, all)} healed ${e.amount}`;
    case 'UNIT_ATTACKED':
      return `#${e.attackerUid} attacks ${refName(e.target, all)}`;
    case 'TRIGGER_RESOLVED':
      return `${n(e.sourceCardId)} ${e.trigger.toLowerCase().replace(/_/g, ' ')} resolves`;
    case 'SPELL_CAST':
      return `P${e.player} casts ${n(e.cardId)}`;
    case 'TURN_STARTED':
      return `— Turn ${e.turn} (P${e.player}) —`;
    case 'GAME_ENDED':
      return `Game ended: winner ${e.winner} (${e.reason})`;
    default: {
      const { seq: _s, type, ...rest } = e as GameEvent & Record<string, unknown>;
      return `${type.toLowerCase()} ${JSON.stringify(rest)}`;
    }
  }
}

export default function DebugScreen() {
  const save = useAccount((s) => s.save);
  const navigate = useNavigate();
  const [amount, setAmount] = useState(1000);
  const [level, setLevel] = useState(10);
  const [sim, setSim] = useState<SimResult | null>(null);
  const [simSet, setSimSet] = useState<SetId>('CORE');
  const [oppFaction, setOppFaction] = useState<PlayableFaction>('EMBER');
  const [oppDiff, setOppDiff] = useState<Difficulty>('NORMAL');
  const [encId, setEncId] = useState(CAMPAIGN[0].encounters[0].id);
  const [deckId, setDeckId] = useState<string | null>(() => (save ? firstValidDeck(save, save.profile.selectedDeckId) : null));
  const [cardQuery, setCardQuery] = useState('');
  const [logFilter, setLogFilter] = useState('');
  const [logTick, setLogTick] = useState(0);
  const cards = useMemo(() => {
    const q = cardQuery.trim().toLowerCase();
    return q ? collectibleCards().filter((c) => c.name.toLowerCase().includes(q) || c.id.includes(q)).slice(0, 12) : [];
  }, [cardQuery]);
  const log = useMemo(() => getLastMatchLog(), [logTick]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!import.meta.env.DEV || !save) return null;

  const startVsBot = () => {
    if (!deckId) return toast('Pick a valid deck first', 'error');
    launchMatch({ mode: 'PRACTICE', deckId, opponent: { ...PRACTICE_OPPONENTS[oppFaction], difficulty: oppDiff, rarities: DIFFICULTY_POOLS[oppDiff] } }, navigate);
  };
  const startEncounter = () => {
    const e = findEncounter(encId)?.encounter;
    if (!e || !deckId) return toast('Pick a valid deck first', 'error');
    launchMatch({ mode: 'PVE', deckId, opponent: e, encounterId: e.id }, navigate);
  };
  const testCard = (cardId: string) => {
    const card = getCardSafe(cardId);
    const hero: PlayableFaction = card.faction === 'NEUTRAL' ? 'EMBER' : card.faction;
    const copies = card.rarity === 'LEGENDARY' ? 1 : 2;
    const deck = autoBuildDeck({ heroFaction: hero, owned: null, base: { [cardId]: copies }, seed: randomSeed() });
    // Test decks may use cards not owned; unlock the tested card so the deck validates.
    gameService.debugUnlockAll();
    const res = gameService.createDeck(`Test: ${card.name}`.slice(0, 28), hero, deck);
    if (!res.ok) return toast(res.error, 'error');
    launchMatch({ mode: 'PRACTICE', deckId: res.value.id, opponent: { ...PRACTICE_OPPONENTS[oppFaction], difficulty: oppDiff, rarities: DIFFICULTY_POOLS[oppDiff] } }, navigate);
  };

  const shownLog = log.filter((e) => !logFilter || e.type.includes(logFilter.toUpperCase()) || formatEvent(e, log).toLowerCase().includes(logFilter.toLowerCase()));
  const stdTotal = sim ? Object.values(sim.standard).reduce((a, b) => a + b, 0) : 0;
  const gTotal = sim ? Object.values(sim.guaranteed).reduce((a, b) => a + b, 0) : 0;
  const wStd = Object.values(PACK_CONFIG.standardSlotWeights).reduce((a, b) => a + b, 0);
  const wG = Object.values(PACK_CONFIG.guaranteedSlotWeights).reduce((a, b) => a + b, 0);

  return (
    <div className="screen debug-screen">
      <ScreenHeader title="Developer tools" subtitle="Only available in development builds." />
      <div className="debug-grid">
        <section className="panel">
          <div className="panel-title">Economy</div>
          <label className="field">
            <span>Amount</span>
            <input className="input" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} />
          </label>
          <div className="btn-row">
            <button className="btn btn-sm" onClick={() => gameService.debugGrant('gold', amount)}>
              Grant Gold
            </button>
            <button className="btn btn-sm" onClick={() => gameService.debugGrant('essence', amount)}>
              Grant Essence
            </button>
            <button className="btn btn-sm" onClick={() => gameService.debugGrantPacks('CORE', 10)}>
              +10 Kingdoms at War packs
            </button>
            <button className="btn btn-sm" onClick={() => gameService.debugGrantPacks('DEEP', 10)}>
              +10 Deep packs
            </button>
            <button className="btn btn-sm" onClick={() => (gameService.debugUnlockAll(), toast('All cards unlocked', 'success'))}>
              Unlock all cards
            </button>
          </div>
          <div className="divider" />
          <div className="panel-title">Progression</div>
          <div className="btn-row">
            <input className="input" type="number" min={1} max={40} value={level} onChange={(e) => setLevel(Number(e.target.value) || 1)} aria-label="Level" style={{ width: 90 }} />
            <button className="btn btn-sm" onClick={() => gameService.debugSetLevel(level)}>
              Set level
            </button>
            <button className="btn btn-sm" onClick={() => gameService.debugGrantXp(500)}>
              +500 XP
            </button>
          </div>
          <div className="divider" />
          <button
            className="btn btn-danger btn-sm"
            onClick={async () => {
              if (await confirmDialog({ title: 'Reset account?', message: 'Deletes all local progress.', confirmLabel: 'Reset', danger: true })) {
                await gameService.resetAccount();
                navigate('/');
              }
            }}
          >
            Reset account
          </button>
        </section>

        <section className="panel">
          <div className="panel-title">Pack simulation</div>
          <div className="btn-row">
            <select className="select" value={simSet} onChange={(e) => setSimSet(e.target.value as SetId)} aria-label="Set">
              <option value="CORE">Kingdoms at War</option>
              <option value="DEEP">Fantasy Realms</option>
              <option value="ABYSS">Curse of the Abyss</option>
            </select>
            <button className="btn btn-sm btn-cyan" onClick={() => setSim(simulatePacks(simSet, 1000))}>
              Simulate 1000 packs
            </button>
          </div>
          {sim && (
            <>
              <table className="debug-table">
                <thead>
                  <tr>
                    <th>Rarity</th>
                    <th className="r">Standard slots</th>
                    <th className="r">Configured</th>
                    <th className="r">Guaranteed slot</th>
                    <th className="r">Configured</th>
                  </tr>
                </thead>
                <tbody>
                  {RARITIES.map((r) => (
                    <tr key={r}>
                      <td className={`rarity-text-${r.toLowerCase()}`}>{r.toLowerCase()}</td>
                      <td className="r num">
                        {sim.standard[r]} ({pct(sim.standard[r], stdTotal)})
                      </td>
                      <td className="r num faint">{pct(PACK_CONFIG.standardSlotWeights[r], wStd)}</td>
                      <td className="r num">
                        {sim.guaranteed[r]} ({pct(sim.guaranteed[r], gTotal)})
                      </td>
                      <td className="r num faint">{pct(PACK_CONFIG.guaranteedSlotWeights[r], wG)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="muted">
                Foil {sim.variants.FOIL}, prismatic {sim.variants.PRISMATIC}. Packs with a legendary: {sim.packsWithLegendary}. Longest drought: epic {sim.maxSinceEpic} (pity {PACK_CONFIG.pity.EPIC}), legendary {sim.maxSinceLegendary} (pity {PACK_CONFIG.pity.LEGENDARY}). {sim.ms.toFixed(0)} ms.
              </p>
            </>
          )}
        </section>

        <section className="panel">
          <div className="panel-title">Start a match</div>
          <DeckPicker save={save} value={deckId} onChange={setDeckId} />
          <div className="btn-row" style={{ marginTop: 'var(--space-3)' }}>
            <select className="select" value={oppFaction} onChange={(e) => setOppFaction(e.target.value as PlayableFaction)} aria-label="Opponent">
              {PLAYABLE_FACTIONS.map((f) => (
                <option key={f} value={f}>
                  {PRACTICE_OPPONENTS[f].name} ({FACTIONS[f].short})
                </option>
              ))}
            </select>
            <select className="select" value={oppDiff} onChange={(e) => setOppDiff(e.target.value as Difficulty)} aria-label="Difficulty">
              {DIFFICULTIES.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <button className="btn btn-sm btn-primary" onClick={startVsBot}>
              Fight bot
            </button>
          </div>
          <div className="btn-row">
            <select className="select" value={encId} onChange={(e) => setEncId(e.target.value)} aria-label="Encounter">
              {CAMPAIGN.flatMap((c) => c.encounters).map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.difficulty})
                </option>
              ))}
            </select>
            <button className="btn btn-sm btn-primary" onClick={startEncounter}>
              Fight encounter
            </button>
          </div>
          <div className="divider" />
          <div className="panel-title">Test a card</div>
          <input className="input" placeholder="Search card name or id" value={cardQuery} onChange={(e) => setCardQuery(e.target.value)} aria-label="Search card to test" style={{ width: '100%' }} />
          <ul className="debug-card-list">
            {cards.map((c) => (
              <li key={c.id}>
                <span className={`rarity-text-${c.rarity.toLowerCase()}`}>{c.name}</span> <span className="faint">{c.id}</span>
                <button className="btn btn-sm" onClick={() => testCard(c.id)}>
                  Test in match
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel debug-log">
          <div className="panel-title">
            <span>Battle event log</span>
            <span className="faint">{log.length} events</span>
          </div>
          <div className="btn-row">
            <input className="input" placeholder="Filter" value={logFilter} onChange={(e) => setLogFilter(e.target.value)} aria-label="Filter events" />
            <button className="btn btn-sm" onClick={() => setLogTick((t) => t + 1)}>
              Refresh
            </button>
          </div>
          {log.length === 0 ? (
            <p className="muted">Play a match to see its event log here.</p>
          ) : (
            <ol className="event-log">
              {shownLog.map((e) => (
                <li key={e.seq} className={`ev-${e.type.toLowerCase()}`}>
                  <span className="faint num">{e.seq}</span> {formatEvent(e, log)}
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
