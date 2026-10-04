import { useEffect, useState } from 'react';
import { PATCH_NOTES, LATEST_PATCH, type PatchSection } from '@/data/patchNotes';
import { ScreenHeader } from '@/ui/components/common';
import { markPatchNotesSeen } from '@/ui/patchNotesSeen';
import '@/ui/styles/meta.css';
import '@/ui/styles/patchnotes.css';
import { formatDate, t } from '@/i18n';

const KIND_LABEL: Record<PatchSection['kind'], string> = { new: 'New', improved: 'Improved', balance: 'Balance', fixed: 'Fixed' };

export default function PatchNotesScreen() {
  const [open, setOpen] = useState<Set<string>>(() => new Set([LATEST_PATCH]));
  useEffect(() => markPatchNotesSeen(), []);
  const toggle = (v: string) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(v)) n.delete(v);
      else n.add(v);
      return n;
    });
  return (
    <div className="screen patch-screen">
      <ScreenHeader title={t('Patch notes')} subtitle={t('What changed in each update of Shardbound.')} />
      <ol className="patch-list">
        {PATCH_NOTES.map((p, i) => {
          const expanded = open.has(p.version);
          return (
            <li key={p.version} className={`panel patch ${i === 0 ? 'latest' : ''}`}>
              <button className="patch-head" aria-expanded={expanded} onClick={() => toggle(p.version)}>
                <span className="patch-version num">{p.version}</span>
                <span className="patch-title">
                  <strong>{p.title}</strong>
                  <span className="muted">{p.summary}</span>
                </span>
                <span className="patch-date faint">{formatDate(`${p.date}T12:00:00`, { dateStyle: 'long' })}</span>
                <span className="patch-chevron" aria-hidden>
                  {expanded ? '−' : '+'}
                </span>
              </button>
              {expanded && (
                <div className="patch-body">
                  {p.sections.map((s) => (
                    <section key={s.kind} className={`patch-section kind-${s.kind}`}>
                      <h4>{t(KIND_LABEL[s.kind])}</h4>
                      <ul>
                        {s.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
