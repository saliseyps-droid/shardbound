import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAccount } from '@/state/accountStore';
import { launchMatch } from '@/state/matchLaunch';
import { toast } from '@/state/uiStore';
import { netSession } from '@/net/session';
import { onlineOpponent, validateRemoteSide } from '@/net/lobby';
import { factionOfList } from '@/domain/decks';
import { ScreenHeader, Spinner } from '@/ui/components/common';
import { DeckPicker, firstValidDeck } from '@/ui/components/meta/MetaWidgets';
import { audio } from '@/audio/audioService';
import { COOP_BOSS_ARMOR, COOP_BOSS_HEALTH, coopBoss, isCoopEncounter, type CoopMeta } from '@/domain/coop';
import { findEncounter } from '@/data/opponents';
import { isUnlocked } from '@/ui/components/meta/campaign';
import { PLAYABLE_FACTIONS } from '@/game/types';
import { DIFFICULTIES } from '@/config/progression';
import { PRACTICE_OPPONENTS } from '@/data/opponents';
import { FACTIONS } from '@/data/factions';
import { WardenPortrait } from '@/ui/components/WardenPortrait';
import { DIFFICULTY_INFO, factionStyle } from '@/ui/components/meta/MetaWidgets';
import { t } from '@/i18n';
import '@/ui/styles/meta.css';
import '@/ui/styles/online.css';

/** Host lobby: create a room, share the link, wait for the friend. */
export default function OnlineScreen() {
  const save = useAccount((s) => s.save);
  const navigate = useNavigate();
  const [deckId, setDeckId] = useState<string | null>(() => (save ? firstValidDeck(save, save.profile.selectedDeckId) : null));
  const [code, setCode] = useState<string | null>(null);
  const [status, setStatus] = useState(netSession.status);
  const [error, setError] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  // 2 v 1 co-op: the friend joins as your teammate against a boss played by your AI. Opened from a
  // co-op campaign (?coop=<fight>), the boss is that fight.
  const [params] = useSearchParams();
  const asked = params.get('coop');
  const campaignFight = save && asked && isCoopEncounter(asked) && isUnlocked(save, asked) ? findEncounter(asked)! : null;
  const [coop, setCoop] = useState<CoopMeta | null>(() => (campaignFight ? { encounter: campaignFight.encounter.id } : null));

  useEffect(() => netSession.onStatus(() => setStatus(netSession.status)), []);

  // Friend connected: start the match as host.
  useEffect(() => {
    if (status !== 'connected' || netSession.role !== 'host' || !netSession.remoteSide) return;
    audio.play('turn');
    const faction = factionOfList(netSession.remoteSide.deck);
    const friend = onlineOpponent(netSession.remoteName, netSession.remoteAvatar, faction);
    if (coop && 'encounter' in coop) {
      const fight = findEncounter(coop.encounter)!;
      launchMatch({ mode: 'PVE', online: 'host', deckId, opponent: fight.encounter, encounterId: fight.encounter.id, coop: { ally: friend } }, navigate);
    } else if (coop) launchMatch({ mode: 'PRACTICE', online: 'host', deckId, opponent: coopBoss(coop.boss, coop.difficulty), coop: { ally: friend } }, navigate);
    else launchMatch({ mode: 'ONLINE', online: 'host', deckId, opponent: friend }, navigate);
  }, [status, deckId, navigate, coop]);

  // Leaving the lobby before a friend joins closes the room.
  useEffect(
    () => () => {
      if (netSession.role === 'host' && netSession.status === 'waiting') netSession.close();
    },
    [],
  );

  if (!save) return null;
  const valid = !!deckId && deckId === firstValidDeck(save, deckId);

  const create = async () => {
    setError(null);
    try {
      const c = await netSession.host(save.profile.username, save.profile.avatar, (hello) => validateRemoteSide(hello.side), coop ? { meta: { coop } } : {});
      setCode(c);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code ?? '');
      toast('Code copied', 'success');
    } catch {
      toast('Copy failed — write the code down instead.', 'error');
    }
  };

  const waiting = !!code && status === 'waiting';

  return (
    <div className="screen online-screen">
      <ScreenHeader title={t('Play a friend')} subtitle={t('Create a match and send your friend the room code. The match starts as soon as they join.')} />
      <div className="online-grid">
        <section className="panel" aria-labelledby="online-deck">
          <div className="panel-title" id="online-deck">
            {t('Your deck')}
          </div>
          <DeckPicker save={save} value={deckId} onChange={setDeckId} />
        </section>

        <section className="panel online-host" aria-live="polite">
          {!waiting && (
            <>
              <div className="panel-title">{t('Create a match')}</div>
              {campaignFight && coop && 'encounter' in coop && (
                <>
                  <p className="coop-campaign-fight">
                    <strong>{t('Campaign fight: {name}', { name: campaignFight.encounter.name })}</strong>
                    <span className="faint">{campaignFight.chapter.name}</span>
                  </p>
                  <p className="muted">{t('Your friend joins as your teammate for this fight. If it is open in their campaign too, it counts for them as well; otherwise they get practice rewards.')}</p>
                </>
              )}
              {!(coop && 'encounter' in coop) && (
              <>
              <div className="practice-mode" role="radiogroup" aria-label={t('Match type')}>
                <button type="button" role="radio" aria-checked={!coop} className={`btn btn-sm ${!coop ? 'btn-primary' : ''}`} onClick={() => (audio.play('click'), setCoop(null))}>
                  {t('1 v 1')}
                </button>
                <button type="button" role="radio" aria-checked={!!coop} className={`btn btn-sm ${coop ? 'btn-primary' : ''}`} onClick={() => (audio.play('click'), setCoop((c) => c ?? { boss: 'VERDANT', difficulty: 'NORMAL' }))}>
                  {t('2 v 1 co-op')}
                </button>
              </div>
              {!coop && <p className="muted">{t('Online matches give the same Gold, XP and quest progress as normal matches. Both players need an internet connection.')}</p>}
              {coop && 'boss' in coop && (
                <>
                  <p className="muted">
                    {t('Your friend joins as your teammate. Together you face a boss with {n} Health, {a} Armor and an extra Energy, played by the AI. Rewards are those of a practice match.', { n: COOP_BOSS_HEALTH, a: COOP_BOSS_ARMOR })} {t('Every turn the boss also draws a card, gains 2 Energy and deals 1 damage to a random enemy twice.')}
                  </p>
                  <div className="panel-title">{t('Boss')}</div>
                  <div className="opponent-grid coop-boss-grid" role="radiogroup" aria-label={t('Boss')}>
                    {PLAYABLE_FACTIONS.map((f) => {
                      const sel = f === coop.boss;
                      return (
                        <button key={f} type="button" role="radio" aria-checked={sel} className={`opponent-tile ${sel ? 'selected' : ''}`} style={factionStyle(f)} onClick={() => (audio.play('click'), setCoop({ ...coop, boss: f }))}>
                          <span className="opp-sigil" aria-hidden>
                            <WardenPortrait faction={f} size={40} />
                          </span>
                          <strong>{PRACTICE_OPPONENTS[f].name}</strong>
                          <span className="faint">{FACTIONS[f].name}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="practice-mode" role="radiogroup" aria-label={t('Difficulty')}>
                    {DIFFICULTIES.map((d) => (
                      <button key={d} type="button" role="radio" aria-checked={d === coop.difficulty} className={`btn btn-sm ${d === coop.difficulty ? 'btn-primary' : ''}`} onClick={() => (audio.play('click'), setCoop({ ...coop, difficulty: d }))}>
                        {t(DIFFICULTY_INFO[d].label)}
                      </button>
                    ))}
                  </div>
                </>
              )}
              </>
              )}
              <button className="btn btn-primary btn-lg" disabled={!valid || status === 'opening'} onClick={() => void create()}>
                {status === 'opening' ? t('Creating…') : t('Create match')}
              </button>
              {!valid && <p className="deckbox-issue">{t('Choose a valid 30-card deck first.')}</p>}
            </>
          )}
          {waiting && (
            <>
              <div className="panel-title">{t('Waiting for your friend')}</div>
              <p className="muted">{t('Send your friend this code — they enter it under “Have a code?”. Keep this screen open until they join.')}</p>
              <div className="invite-row">
                <strong className="room-code" aria-label={t('Room code {code}', { code: code ?? '' })}>{code}</strong>
                <button className="btn btn-cyan" onClick={() => void copy()}>
                  {t('Copy code')}
                </button>
              </div>
              <Spinner label={t('Waiting for your friend')} />
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  netSession.close();
                  setCode(null);
                }}
              >
                {t('Cancel')}
              </button>
            </>
          )}
          {error && <p className="online-error">{t(error)}</p>}

          <hr className="divider" />
          <div className="panel-title">{t('Have a code?')}</div>
          <form
            className="invite-row"
            onSubmit={(e) => {
              e.preventDefault();
              const c = joinCode.trim().toUpperCase();
              if (c.length >= 4) navigate(`/join/${c}`);
            }}
          >
            <input className="input" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder={t('Room code')} maxLength={8} aria-label={t('Room code')} />
            <button className="btn" type="submit" disabled={joinCode.trim().length < 4}>
              {t('Join')}
            </button>
          </form>

          <hr className="divider" />
          <Link to="/friends" className="small-link">
            {t('Invite someone from your friends list instead')}
          </Link>
        </section>
      </div>
    </div>
  );
}
