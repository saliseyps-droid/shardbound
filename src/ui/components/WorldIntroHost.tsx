import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { gameService, useAccount } from '@/state/accountStore';
import { Cinematic } from '@/ui/components/Cinematic';
import { introSeen, markIntroSeen } from '@/ui/introSeen';

const ID = 'world_intro';

/**
 * Plays the world intro once per account: new players see it on the welcome screen, players who
 * started before it existed get it the first time they open the game afterwards. It is remembered
 * in the save (pve.seenCinematics, so on every device) and never interrupts a match or a join link.
 */
export function WorldIntroHost() {
  const seenInSave = useAccount((s) => !!s.save?.pve.seenCinematics?.includes(ID));
  const location = useLocation();
  const busy = location.pathname.startsWith('/match') || location.pathname.startsWith('/join');
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (seenInSave) return;
    // Watched (or skipped) on the welcome screen before this Warden existed: just remember it.
    if (introSeen()) gameService.markCinematicSeen(ID);
    else if (!busy) setPlaying(true);
  }, [seenInSave, busy]);

  if (!playing) return null;
  return (
    <Cinematic
      id={ID}
      onDone={() => {
        markIntroSeen();
        gameService.markCinematicSeen(ID);
        setPlaying(false);
      }}
    />
  );
}
