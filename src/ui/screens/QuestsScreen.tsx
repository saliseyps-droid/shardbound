import { useAccount } from '@/state/accountStore';
import { QUEST_CONFIG } from '@/config/quests';
import { canReroll } from '@/domain/quests';
import { ScreenHeader } from '@/ui/components/common';
import { DailyTrack, QuestRow } from '@/ui/components/meta/MetaWidgets';
import '@/ui/styles/meta.css';
import { t } from '@/i18n';

export default function QuestsScreen() {
  const save = useAccount((s) => s.save);
  if (!save) return null;
  const quests = save.quests.active;
  const rerollLeft = canReroll(save, Date.now());
  return (
    <div className="screen quests-screen">
      <ScreenHeader
        title={t('Quests')}
        subtitle={`${t('A new quest arrives each day, up to {n} at a time.', { n: QUEST_CONFIG.maxActive })} ${rerollLeft ? t('You can replace one unfinished quest today.') : t('Your replacement for today is used.')}`}
      />
      <div className="quests-layout">
        <section className="panel" aria-labelledby="q-active">
          <div className="panel-title">
            <span id="q-active">{t('Active quests')}</span>
            <span className="faint">{t('{n} completed all time', { n: save.quests.totalCompleted })}</span>
          </div>
          {quests.length === 0 ? (
            <div className="empty">
              <p>{t('All quests are done. Come back tomorrow for a new one.')}</p>
            </div>
          ) : (
            <div className="quest-list">
              {quests.map((q) => (
                <QuestRow key={q.id} quest={q} save={save} />
              ))}
            </div>
          )}
        </section>
        {save.quests.weekly.length > 0 && (
          <section className="panel" aria-labelledby="q-weekly">
            <div className="panel-title">
              <span id="q-weekly">{t('Weekly quests')}</span>
              <span className="faint">{t('A new set every Monday')}</span>
            </div>
            <div className="quest-list">
              {save.quests.weekly.map((q) => (
                <QuestRow key={q.id} quest={q} save={save} allowReroll={false} />
              ))}
            </div>
          </section>
        )}
        <section className="panel" aria-labelledby="q-daily">
          <div className="panel-title">
            <span id="q-daily">{t('Login rewards')}</span>
            <span className="faint">{t('One claim per day')}</span>
          </div>
          <p className="muted">{t('Claim once each day to advance the 7-day cycle. Missing more than a day starts the cycle again.')}</p>
          <DailyTrack save={save} />
        </section>
      </div>
    </div>
  );
}
