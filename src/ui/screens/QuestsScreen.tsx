import { useAccount } from '@/state/accountStore';
import { QUEST_CONFIG } from '@/config/quests';
import { canReroll } from '@/domain/quests';
import { ScreenHeader } from '@/ui/components/common';
import { DailyTrack, QuestRow } from '@/ui/components/meta/MetaWidgets';
import '@/ui/styles/meta.css';

export default function QuestsScreen() {
  const save = useAccount((s) => s.save);
  if (!save) return null;
  const quests = save.quests.active;
  const rerollLeft = canReroll(save, Date.now());
  return (
    <div className="screen quests-screen">
      <ScreenHeader
        title="Quests"
        subtitle={`A new quest arrives each day, up to ${QUEST_CONFIG.maxActive} at a time. ${rerollLeft ? 'You can replace one unfinished quest today.' : 'Your replacement for today is used.'}`}
      />
      <div className="quests-layout">
        <section className="panel" aria-labelledby="q-active">
          <div className="panel-title">
            <span id="q-active">Active quests</span>
            <span className="faint">{save.quests.totalCompleted} completed all time</span>
          </div>
          {quests.length === 0 ? (
            <div className="empty">
              <p>All quests are done. Come back tomorrow for a new one.</p>
            </div>
          ) : (
            <div className="quest-list">
              {quests.map((q) => (
                <QuestRow key={q.id} quest={q} save={save} />
              ))}
            </div>
          )}
        </section>
        <section className="panel" aria-labelledby="q-daily">
          <div className="panel-title">
            <span id="q-daily">Login rewards</span>
            <span className="faint">One claim per day</span>
          </div>
          <p className="muted">Claim once each day to advance the 7-day cycle. Missing more than a day starts the cycle again.</p>
          <DailyTrack save={save} />
        </section>
      </div>
    </div>
  );
}
