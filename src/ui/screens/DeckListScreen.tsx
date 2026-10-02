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
import { WardenPortrait } from '@/ui/components/WardenPortrait';
import { t } from '@/i18n';
import '@/ui/styles/decks.css';

function FactionPicker({ value, onChange }: { value: PlayableFaction; onChange: (f: PlayableFaction) => void }) {
  return (
    <div className="faction-picker" role="radiogroup" aria-label={t('Warden faction')}>
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
            <WardenPortrait faction={f} size={40} />
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
          <span>{t('Deck name')}</span>
          <input className="input" autoFocus maxLength={DECK_RULES.maxDeckNameLength} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        {withFaction && (
          <fieldset className="field">
            <legend>{t('Warden faction. Decks use cards of this faction plus Neutral cards.')}</legend>
            <FactionPicker value={faction} onChange={setFaction} />
          </fieldset>
        )}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {t('Cancel')}
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
      title: t('Delete "{name}"?', { name: deck.name }),
      message: <p>{t('The deck list is removed. Your cards stay in your collection.')}</p>,
      confirmLabel: t('Delete deck'),
      danger: true,
    });
    if (!ok) return;
    const res = gameService.deleteDeck(deck.id);
    if (res.ok) toast(t('Deleted {name}.', { name: deck.name }));
    else toast(res.error, 'error');
  };

  const duplicate = () => {
    const res = gameService.duplicateDeck(deck.id);
    if (res.ok) toast(t('Created {name}.', { name: res.value.name }), 'success');
    else toast(res.error, 'error');
  };

  return (
    <article
      className={`deck-box ${selected ? 'is-selected' : ''} ${valid ? '' : 'is-invalid'}`}
      style={{ '--fc': hero.colors.primary, '--fc2': second ? FACTIONS[second].colors.primary : hero.colors.secondary, '--fd': hero.colors.dark } as CSSProperties}
      aria-label={`${deck.name}, ${hero.name}${second ? t(' and {name}', { name: FACTIONS[second].name }) : ''}, ${t('{n} of {max} cards', { n: size, max: DECK_RULES.deckSize })}${valid ? '' : t(', incomplete')}`}
    >
      <button className="deck-box-face" onClick={() => navigate(`/decks/${deck.id}`)} aria-label={t('Edit {name}', { name: deck.name })}>
        <span className="deck-sigil" aria-hidden>
          <WardenPortrait faction={deck.heroFaction} fill />
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
        {!valid && <span className="deck-issue">{t(issues[0].message)}</span>}
      </button>
      <button
        className={`fav-toggle ${deck.favorite ? 'on' : ''}`}
        aria-pressed={deck.favorite}
        aria-label={deck.favorite ? t('Unset {name} as favorite', { name: deck.name }) : t('Set {name} as favorite', { name: deck.name })}
        title={t('Favorite')}
        onClick={() => {
          audio.play('click');
          gameService.setFavoriteDeck(deck.id);
        }}
      >
        <Glyph name="star" size={18} />
      </button>
      {selected && <span className="selected-flag">{t('Selected for play')}</span>}
      <div className="deck-actions">
        <button
          className="btn btn-sm btn-cyan"
          disabled={selected}
          onClick={() => {
            audio.play('click');
            gameService.selectDeck(deck.id);
            toast(t('{name} selected for play.', { name: deck.name }), 'success');
          }}
        >
          {selected ? t('Selected') : t('Select')}
        </button>
        <button className="btn btn-sm" onClick={() => navigate(`/decks/${deck.id}`)}>
          {t('Edit')}
        </button>
        <span className="deck-links">
        <button className="text-btn" onClick={onRename} aria-label={t('Rename {name}', { name: deck.name })}>
          {t('Rename')}
        </button>
        <button className="text-btn" onClick={duplicate} aria-label={t('Duplicate {name}', { name: deck.name })}>
          {t('Copy')}
        </button>
        <button className="text-btn danger" onClick={() => void remove()} aria-label={t('Delete {name}', { name: deck.name })}>
          {t('Delete')}
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
        title={t('Decks')}
        subtitle={t('{n} / {max} decks. Decks hold {size} cards from your Warden faction and Neutral.', { n: decks.length, max: DECK_RULES.maxDecks, size: DECK_RULES.deckSize })}
        actions={
          <button className="btn btn-primary" disabled={full} onClick={() => setCreating(true)} title={full ? t('Deck limit reached') : undefined}>
            {t('New deck')}
          </button>
        }
      />
      <div className="deck-grid">
        {sorted.map((d) => (
          <DeckBox key={d.id} deck={d} selected={d.id === selectedId} onRename={() => setRenaming(d)} />
        ))}
        {!full && (
          <button className="deck-box deck-new" onClick={() => setCreating(true)} aria-label={t('Create a new deck')}>
            <span className="deck-new-plus" aria-hidden>
              +
            </span>
            <span>{t('New deck')}</span>
          </button>
        )}
      </div>
      {creating && (
        <NameModal
          title={t('New deck')}
          initial={t('New deck')}
          confirmLabel={t('Create and edit')}
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
          title={t('Rename deck')}
          initial={renaming.name}
          confirmLabel={t('Rename')}
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
