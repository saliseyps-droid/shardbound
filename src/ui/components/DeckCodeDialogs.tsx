import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { encodeDeck } from '@/domain/deckCode';
import type { Deck } from '@/domain/decks';
import { gameService } from '@/state/accountStore';
import { toast } from '@/state/uiStore';
import { audio } from '@/audio/audioService';
import { t } from '@/i18n';
import { Modal } from './common';

/** Shows a deck's share code with a copy button (the code is also selectable by hand). */
export function ShareDeckModal({ deck, onClose }: { deck: Pick<Deck, 'name' | 'heroFaction' | 'cards' | 'talents'>; onClose: () => void }) {
  const code = useMemo(() => encodeDeck(deck), [deck]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast('Deck code copied. Send it to a friend; they paste it under Decks → Import deck.', 'success');
      onClose();
    } catch {
      toast('Copy failed — select the code and copy it by hand.', 'error');
    }
  };
  return (
    <Modal open onClose={onClose} title={t('Share "{name}"', { name: deck.name })}>
      <p className="muted">{t('Anyone with this code can add the deck to their own list, including its Warden abilities.')}</p>
      <textarea className="input deck-code" readOnly value={code} rows={4} onFocus={(e) => e.currentTarget.select()} aria-label={t('Deck code')} />
      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onClose}>
          {t('Close')}
        </button>
        <button className="btn btn-primary" onClick={() => void copy()}>
          {t('Copy code')}
        </button>
      </div>
    </Modal>
  );
}

/** Paste a deck code to add that deck to your list. */
export function ImportDeckModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    const res = gameService.importDeck(code);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    audio.play('click');
    const { deck, missingCopies, unknownCards } = res.value;
    if (missingCopies > 0) toast(`Deck imported. You are missing ${missingCopies} card copies; the editor marks them.`, 'info');
    else toast('Deck imported.', 'success');
    if (unknownCards > 0) toast(`${unknownCards} cards from the code don't exist in this version and were left out.`, 'info');
    onClose();
    navigate(`/decks/${deck.id}`);
  };
  return (
    <Modal open onClose={onClose} title={t('Import deck')}>
      <p className="muted">{t('Paste a deck code. Cards you don’t own yet stay in the deck and are marked, so you can craft them.')}</p>
      <textarea
        className="input deck-code"
        autoFocus
        rows={4}
        value={code}
        placeholder="SB1.…"
        aria-label={t('Deck code')}
        onChange={(e) => {
          setCode(e.target.value);
          setError(null);
        }}
      />
      {error && <p className="deckbox-issue">{t(error)}</p>}
      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onClose}>
          {t('Cancel')}
        </button>
        <button className="btn btn-primary" disabled={!code.trim()} onClick={submit}>
          {t('Import')}
        </button>
      </div>
    </Modal>
  );
}
