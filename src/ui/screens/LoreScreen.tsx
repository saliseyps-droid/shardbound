import { FACTIONS, WORLD_LORE } from '@/data/factions';
import { KEYWORD_LIST } from '@/data/keywords';
import { ALL_FACTIONS } from '@/game/types';
import { ScreenHeader } from '@/ui/components/common';
import { Glyph } from '@/ui/components/Icons';
import { factionStyle } from '@/ui/components/meta/MetaWidgets';
import '@/ui/styles/meta.css';

const CATEGORY = { static: 'Unit abilities', trigger: 'Triggers', status: 'Statuses' } as const;

export default function LoreScreen() {
  return (
    <div className="screen lore-screen">
      <ScreenHeader title={WORLD_LORE.title} />
      <section className="lore-intro">
        {WORLD_LORE.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </section>

      <div className="faction-codex">
        {ALL_FACTIONS.map((id) => {
          const f = FACTIONS[id];
          return (
            <article key={id} className="panel codex-entry" style={factionStyle(id)} aria-labelledby={`fx-${id}`}>
              <header>
                <span className="codex-sigil" aria-hidden>
                  <Glyph name={f.sigil} size={40} />
                </span>
                <div>
                  <h3 id={`fx-${id}`}>{f.name}</h3>
                  <em className="codex-motto">“{f.motto}”</em>
                </div>
              </header>
              <p className="codex-identity">{f.identity}</p>
              <p className="muted">{f.lore}</p>
              <ul className="codex-archetypes">
                {f.archetypes.map((a) => (
                  <li key={a.name}>
                    <strong>{a.name}</strong> <span className="muted">{a.description}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <h3 style={{ marginTop: 'var(--space-6)' }}>Keyword glossary</h3>
      {(Object.keys(CATEGORY) as (keyof typeof CATEGORY)[]).map((cat) => (
        <section key={cat} className="glossary-section">
          <h4 className="muted">{CATEGORY[cat]}</h4>
          <dl className="glossary">
            {KEYWORD_LIST.filter((k) => k.category === cat).map((k) => (
              <div key={k.id} className="glossary-item">
                <dt>
                  <span aria-hidden>{k.icon}</span> {k.name}
                </dt>
                <dd>{k.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
