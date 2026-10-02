import type { CSSProperties } from 'react';
import { FACTIONS } from '@/data/factions';
import {
  FACTION_TALENTS,
  RANK_LABEL,
  TALENT_POINTS,
  buildPoints,
  defaultBuild,
  toggleNode,
  type TalentAbility,
  type TalentLevel,
  type TalentPick,
} from '@/data/wardenTalents';
import type { PlayableFaction } from '@/game/types';
import { audio } from '@/audio/audioService';
import { toast } from '@/state/uiStore';
import { Glyph } from './Icons';
import { Tip } from './Tooltip';
import { t } from '@/i18n';

const RANKS: TalentLevel[] = [0, 1, 2];

/** Talent tree of one Warden: 5 abilities × ranks I–III; a deck learns 2 of them with 5 points. */
export function TalentTree({ faction, build, onChange }: { faction: PlayableFaction; build: TalentPick[]; onChange: (b: TalentPick[]) => void }) {
  const spent = buildPoints(build);
  const info = FACTIONS[faction];

  const click = (abilityId: string, rank: TalentLevel) => {
    const next = toggleNode(build, abilityId, rank);
    if (typeof next === 'string') {
      audio.play('error');
      toast(t(next), 'error');
      return;
    }
    audio.play(next.length >= build.length && buildPoints(next) > spent ? 'buff' : 'click');
    onChange(next);
  };

  return (
    <div className="talent-tree" style={{ '--fc': info.colors.primary } as CSSProperties}>
      <header className="talent-head">
        <div>
          <h3>{t('Warden Talents')}</h3>
          <p className="faint small">{t('Learn 2 abilities and spend all {n} points: one ability reaches rank III, the other rank II.', { n: TALENT_POINTS })}</p>
        </div>
        <div className="talent-points" aria-label={t('Talent points {n} of {max}', { n: spent, max: TALENT_POINTS })}>
          <span className="talent-pips" aria-hidden>
            {Array.from({ length: TALENT_POINTS }, (_, i) => (
              <span key={i} className={`talent-pip ${i < spent ? 'is-spent' : ''}`} />
            ))}
          </span>
          <span className="num">
            {spent} / {TALENT_POINTS}
          </span>
          <button className="btn btn-sm btn-ghost" onClick={() => onChange(defaultBuild(faction))}>
            {t('Reset to default')}
          </button>
        </div>
      </header>
      <div className="talent-columns">
        {FACTION_TALENTS[faction].map((tal) => (
          <TalentColumn key={tal.id} talent={tal} pick={build.find((x) => x.abilityId === tal.id)} build={build} glyph={info.sigil} onClick={click} />
        ))}
      </div>
    </div>
  );
}

function TalentColumn({ talent, pick, build, glyph, onClick }: { talent: TalentAbility; pick?: TalentPick; build: TalentPick[]; glyph: string; onClick: (id: string, rank: TalentLevel) => void }) {
  const learned = pick ? pick.level : -1;
  const shown = talent.levels[Math.max(0, learned)];
  return (
    <section className={`talent-col ${pick ? 'is-picked' : ''}`} aria-label={`${talent.name}, ${talent.kind === 'ACTIVE' ? t('active') : t('passive')}`}>
      <div className="talent-title">
        <span className={`talent-kind kind-${talent.kind.toLowerCase()}`}>{talent.kind === 'ACTIVE' ? t('Active') : t('Passive')}</span>
        <strong>{talent.name}</strong>
      </div>
      <ol className="talent-nodes">
        {RANKS.map((rank) => {
          const level = talent.levels[rank];
          const isLearned = rank <= learned;
          const blocker = isLearned ? null : nodeBlocker(build, talent.id, rank);
          const reason = blocker && t(blocker);
          const cost = 'cost' in level ? level.cost : null;
          const note = rank > 0 ? talent.upgradeNotes[rank - 1] : null;
          return (
            <li key={rank}>
              <Tip title={`${talent.name} ${RANK_LABEL[rank]}`} body={[level.description, note && t('Upgrade: {note}', { note }), reason].filter(Boolean).join(' ')}>
                <button
                  className={`talent-node ${isLearned ? 'is-learned' : reason ? 'is-locked' : 'is-available'}`}
                  onClick={() => onClick(talent.id, rank)}
                  aria-pressed={isLearned}
                  aria-label={`${t('{name} rank {rank}', { name: talent.name, rank: RANK_LABEL[rank] })}${isLearned ? t(', learned') : ''}. ${level.description}`}
                >
                  {rank === 0 ? <Glyph name={glyph} size={20} /> : <span className="talent-rank">{RANK_LABEL[rank]}</span>}
                  {cost !== null && <span className="talent-cost num">{cost}</span>}
                </button>
              </Tip>
            </li>
          );
        })}
      </ol>
      <p className="talent-desc small">
        <span className="talent-desc-rank">{RANK_LABEL[Math.max(0, learned)]}</span> {shown.description}
      </p>
    </section>
  );
}

/** Why a not-yet-learned rank can't be learned right now (null when it can). */
function nodeBlocker(build: TalentPick[], abilityId: string, rank: TalentLevel): string | null {
  const result = toggleNode(build, abilityId, rank);
  return typeof result === 'string' ? result : null;
}
