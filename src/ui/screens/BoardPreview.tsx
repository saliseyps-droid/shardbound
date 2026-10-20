import { useEffect, useState, type CSSProperties } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { GameState } from '@/engine/types';
import { useMatch, HUMAN, AI, type Ghost } from '@/state/matchStore';
import { AnimatedBoard } from '@/ui/match/AnimatedBoard';
import { BOARD_FX } from '@/ui/match/boardFx';
import { boardByKey } from '@/ui/match/boardBackgrounds';
import '@/ui/styles/animatedBoard.css';

const KEYS = Object.keys(BOARD_FX);

/**
 * DEV ONLY (#/boards/<mat>, e.g. #/boards/board-9): one animated board full screen, with buttons that set off
 * what it answers in a match (a unit dying on either side, your turn, low Health, the final blow).
 */
export default function BoardPreview() {
  const { id = KEYS[0] } = useParams();
  const navigate = useNavigate();
  const bg = boardByKey(id);
  const [turn, setTurn] = useState(0);
  const [low, setLow] = useState(false);
  const index = KEYS.indexOf(id);
  const go = (d: number) => navigate(`/boards/${KEYS[(index + d + KEYS.length) % KEYS.length]}`);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });
  useEffect(() => () => useMatch.setState({ ghosts: [], finale: null }), []);
  if (!bg) return <p className="screen">Unknown board: {id}</p>;
  // Just what the board reads from a match.
  const game = { turn, activePlayer: turn > 0 ? HUMAN : AI, phase: 'MAIN', players: [{ hero: { health: low ? 6 : 30 } }] } as unknown as GameState;
  const die = (owner: typeof HUMAN | typeof AI) => useMatch.setState({ ghosts: [{ owner, index: 0, unit: {} } as unknown as Ghost] });
  return (
    <div className="board-preview">
      <div className="board-preview-mat" style={{ '--board-bg': `url(${bg.url})`, '--board-dim': bg.dim } as CSSProperties}>
        <AnimatedBoard key={id} board={id} game={game} />
      </div>
      <div className="board-preview-bar">
        <button type="button" className="btn btn-sm" onClick={() => go(-1)}>
          ‹
        </button>
        <strong>{id}</strong>
        <span className="faint num">
          {index + 1} / {KEYS.length}
        </span>
        <button type="button" className="btn btn-sm" onClick={() => go(1)}>
          ›
        </button>
        <button type="button" className="btn btn-sm" onClick={() => die(AI)}>
          Enemy unit dies
        </button>
        <button type="button" className="btn btn-sm" onClick={() => die(HUMAN)}>
          Your unit dies
        </button>
        <button type="button" className="btn btn-sm" onClick={() => setTurn((n) => n + 1)}>
          Your turn
        </button>
        <button type="button" className={`btn btn-sm ${low ? 'btn-primary' : ''}`} onClick={() => setLow((v) => !v)}>
          Low Health
        </button>
        <button type="button" className="btn btn-sm" onClick={() => useMatch.setState({ finale: { loser: AI, id: Date.now() } })}>
          Final blow
        </button>
        <Link to="/" className="btn btn-sm">
          Home
        </Link>
      </div>
    </div>
  );
}
