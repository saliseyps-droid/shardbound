import { useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { DECK_RULES } from '@/config/gameRules';
import { FACTIONS } from '@/data/factions';
import { PLAYABLE_FACTIONS, type PlayableFaction } from '@/game/types';
import { deckFactions, deckSize, validateDeck, type Deck } from '@/domain/decks';
import { ownedCopies } from '@/domain/save';
import { gameService, useAccount } from '@/state/accountStore';
import { toast } from '@/state/uiStore';
import { audio } from '@/audio/audioService';
import { confirmDialog, Modal, ScreenHeader } from '@/ui/components/common';
import { Glyph } from '@/ui/components/Icons';
import '@/ui/styles/decks.css';

function FactionPicker({ value, onChange }: { value: PlayableFaction; onChange: (f: PlayableFaction) => void }) {
  return (
    <div className="faction-picker" role="radiogroup" aria-label="Warden faction">
      {PLAYABLE_FACTIONS.map((f) => {
        const info = FACTIONS[f];
        return (
          <button
            key={f}
            type="button"
            role="radio"
            aria-checked={value === f}
            className="faction-choice"
            style={{ '--fc': info.colors.primary, '--fd': info.colors.dark } as CSSProperties}
            onClick={() => onChange(f)}
          >
            <Glyph name={info.sigil} size={26} />
            <span className="fc-name">{info.name}</span>
            <span className="fc-identity">{info.identity}</span>
          </button>
        );
      })}
    </div>
  );
}

function NameModal({ title, initial, confirmLabel, withFaction, onSubmit, onClose }: {
  title: string;
  initial: string;
  confirmLabel: string;
  withFaction?: boolean;
  onSubmit: (name: string, faction: PlayableFaction) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial);
  const [faction, setFaction] = useState<PlayableFaction>('EMBER');
  return (
    <Modal open onClose={onClose} title={title} wide={withFaction} labelledBy="deck-name-title">
      <form
        className="deck-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) onSubmit(name.trim(), faction);
        }}
      >
        <label className="field">
          <span>Deck name</span>
          <input className="input" autoFocus maxLength={DECK_RULES.maxDeckNameLength} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        {withFaction && (
          <fieldset className="field">
            <legend>Warden faction. Decks may add one ally faction plus Neutral cards.</legend>
            <FactionPicker value={faction} onChange={setFaction} />
          </fieldset>
        )}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
            {confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function DeckBox({ deck, selected, onRename }: { deck: Deck; selected: boolean; onRename: () => void }) {
  const navigate = useNavigate();
  const collection = useAccount((s) => s.save!.collection);
  const issues = validateDeck(deck, (id) => ownedCopies(collection, id));
  const valid = issues.length === 0;
  const hero = FACTIONS[deck.heroFaction];
  const second = deckFactions(deck).find((f) => f !== deck.heroFaction);
  const size = deckSize(deck);

  const remove = async () => {
    const ok = await confirmDialog({
      title: `Delete "${deck.name}"?`,
      message: <p>The deck list is removed. Your cards stay in your collection.</p>,
      confirmLabel: 'Delete deck',
      danger: true,
    });
    if (!ok) return;
    const res = gameService.deleteDeck(deck.id);
    if (res.ok) toast(`Deleted ${deck.name}.`);
    else toast(res.error, 'error');
  };

  const duplicate = () => {
    const res = gameService.duplicateDeck(deck.id);
    if (res.ok) toast(`Created ${res.value.name}.`, 'success');
    else toast(res.error, 'error');
  };

  return (
    <article
      className={`deck-box ${selected ? 'is-selected' : ''} ${valid ? '' : 'is-invalid'}`}
      style={{ '--fc': hero.colors.primary, '--fc2': second ? FACTIONS[second].colors.primary : hero.colors.secondary, '--fd': hero.colors.dark } as CSSProperties}
      aria-label={`${deck.name}, ${hero.name}${second ? ` and ${FACTIONS[second].name}` : ''}, ${size} of ${DECK_RULES.deckSize} cards${valid ? '' : ', incomplete'}`}
    >
      <button className="deck-box-face" onClick={() => navigate(`/decks/${deck.id}`)} aria-label={`Edit ${deck.name}`}>
        <span className="deck-sigil" aria-hidden>
          <Glyph name={hero.sigil} size={44} />
          {second && <Glyph name={FACTIONS[second].sigil} size={22} className="deck-sigil-second" />}
        </span>
        <span className="deck-name">{deck.name}</span>
        <span className="deck-factions">
          {hero.short}
          {second ? ` + ${FACTIONS[second].short}` : ''}
        </span>
        <span className={`deck-count num ${valid ? 'ok' : 'bad'}`}>
          {valid ? <Glyph name="shield" size={14} /> : <span aria-hidden>!</span>}
          {size} / {DECK_RULES.deckSize}
        </span>
        {!valid && <span className="deck-issue">{issues[0].message}</span>}
      </button>
      <button
        className={`fav-toggle ${deck.favorite ? 'on' : ''}`}
        aria-pressed={deck.favorite}
        aria-label={deck.favorite ? `Unset ${deck.name} as favorite` : `Set ${deck.name} as favorite`}
        title="Favorite"
        onClick={() => {
          audio.play('click');
          gameService.setFavoriteDeck(deck.id);
        }}
      >
        <Glyph name="star" size={18} />
      </button>
      {selected && <span className="selected-flag">Selected for play</span>}
      <div className="deck-actions">
        <button
          className="btn btn-sm btn-cyan"
          disabled={selected}
          onClick={() => {
            audio.play('click');
            gameService.selectDeck(deck.id);
            toast(`${deck.name} selected for play.`, 'success');
          }}
        >
          {selected ? 'Selected' : 'Select'}
        </button>
        <button className="btn btn-sm" onClick={() => navigate(`/decks/${deck.id}`)}>
          Edit
        </button>
        <span className="deck-links">
        <button className="text-btn" onClick={onRename} aria-label={`Rename ${deck.name}`}>
          Rename
        </button>
        <button className="text-btn" onClick={duplicate} aria-label={`Duplicate ${deck.name}`}>
          Copy
        </button>
        <button className="text-btn danger" onClick={() => void remove()} aria-label={`Delete ${deck.name}`}>
          Delete
        </button>
        </span>
      </div>
    </article>
  );
}

export default function DeckListScreen() {
  const navigate = useNavigate();
  const decks = useAccount((s) => s.save?.decks ?? []);
  const selectedId = useAccount((s) => s.save?.profile.selectedDeckId);
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<Deck | null>(null);
  const full = decks.length >= DECK_RULES.maxDecks;
  const sorted = [...decks].sort((a, b) => Number(b.favorite) - Number(a.favorite) || a.createdAt - b.createdAt);

  return (
    <div className="screen deck-list-screen">
      <ScreenHeader
        title="Decks"
        subtitle={`${decks.length} / ${DECK_RULES.maxDecks} decks. Decks hold ${DECK_RULES.deckSize} cards from your Warden faction, one ally faction and Neutral.`}
        actions={
          <button className="btn btn-primary" disabled={full} onClick={() => setCreating(true)} title={full ? 'Deck limit reached' : undefined}>
            New deck
          </button>
        }
      />
      <div className="deck-grid">
        {sorted.map((d) => (
          <DeckBox key={d.id} deck={d} selected={d.id === selectedId} onRename={() => setRenaming(d)} />
        ))}
        {!full && (
          <button className="deck-box deck-new" onClick={() => setCreating(true)} aria-label="Create a new deck">
            <span className="deck-new-plus" aria-hidden>
              +
            </span>
            <span>New deck</span>
          </button>
        )}
      </div>
      {creating && (
        <NameModal
          title="New deck"
          initial="New deck"
          confirmLabel="Create and edit"
          withFaction
          onClose={() => setCreating(false)}
          onSubmit={(name, faction) => {
            const res = gameService.createDeck(name, faction);
            setCreating(false);
            if (res.ok) navigate(`/decks/${res.value.id}`);
            else toast(res.error, 'error');
          }}
        />
      )}
      {renaming && (
        <NameModal
          title="Rename deck"
          initial={renaming.name}
          confirmLabel="Rename"
          onClose={() => setRenaming(null)}
          onSubmit={(name) => {
            const res = gameService.updateDeck({ ...renaming, name });
            setRenaming(null);
            if (!res.ok) toast(res.error, 'error');
          }}
        />
      )}
    </div>
  );
}
