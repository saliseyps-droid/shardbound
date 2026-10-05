import { collectibleCards } from '@/data/cards';
import { seasonKeyOf } from '@/domain/season';
import { PLAYABLE_FACTIONS } from '@/game/types';
import { FakeSocialBackend } from './fakeBackend';
import { aiScore } from './leaderboard';

/**
 * DEV ONLY: a signed-in look at the social screens without Firebase (open the app with
 * ?devsocial before the #). Imported only behind import.meta.env.DEV, so production builds
 * never contain it. Nothing here touches the real Firestore.
 * ?devsocial=invites also seeds one incoming invite of each kind (tournament first, then a match
 * invite once that one is answered).
 */
export const DEV_UID = 'dev-me';

const NAMES = ['Aldric', 'Brynja', 'Corvin', 'Dalia', 'Eskel', 'Fenna', 'Garrick', 'Hesper', 'Ilsa', 'Jorund', 'Kestrel', 'Lysander', 'Maelis', 'Nyx', 'Orrin', 'Perrin', 'Quill', 'Rowan', 'Saskia', 'Tamsin'];

export function createDevSocial(opts: { invites?: boolean } = {}): { uid: string; backend: FakeSocialBackend } {
  const b = new FakeSocialBackend();
  const now = Date.now();
  const season = seasonKeyOf(now);
  for (let i = 0; i < 130; i++) {
    const name = `${NAMES[i % NAMES.length]}${i >= NAMES.length ? ` ${Math.floor(i / NAMES.length) + 1}` : ''}`;
    const avatar = PLAYABLE_FACTIONS[i % PLAYABLE_FACTIONS.length];
    const rank = Math.max(0, 15 - Math.floor(i / 7));
    const crownPoints = rank === 15 ? Math.max(0, 30 - i * 3) : 0;
    b.seedEntry(season, 'aiRanked', { uid: `bot${i}`, name, avatar, portrait: '', wins: 60 - Math.floor(i / 3), rank, crownPoints, score: aiScore(rank, crownPoints), updatedAt: now - i * 60_000 });
    b.seedEntry(season, 'ranked', { uid: `bot${i}`, name, avatar, portrait: '', wins: 40 - Math.floor(i / 4), rating: Math.max(100, 2100 - i * 9), updatedAt: now - i * 60_000 });
  }
  // The preview player: high on the AI board, outside the top 100 on the PvP board.
  b.seedEntry(season, 'aiRanked', { uid: DEV_UID, name: 'You (preview)', avatar: 'ASTRAL', portrait: '', wins: 31, rank: 14, crownPoints: 0, score: aiScore(14, 0), updatedAt: now });
  b.seedEntry(season, 'ranked', { uid: DEV_UID, name: 'You (preview)', avatar: 'ASTRAL', portrait: '', wins: 3, rating: 900, updatedAt: now });
  const total = collectibleCards().length;
  b.seedProfile('f1', { name: 'Brynja', avatar: 'TIDE', portrait: '', friendCode: 'BRYN2345', level: 23, title: 'Crownbreaker', cardsOwned: Math.round(total * 0.62), cardsTotal: total }, { lastSeen: now - 20_000, inMatch: false });
  b.seedProfile('f2', { name: 'Corvin', avatar: 'VOID', portrait: '', friendCode: 'CORV2345', level: 40, title: 'Sovereign of Shards', cardsOwned: total, cardsTotal: total }, { lastSeen: now - 40_000, inMatch: true });
  b.seedProfile('f3', { name: 'Dalia', avatar: 'VERDANT', portrait: '', friendCode: 'DALI2345', level: 7, title: null, cardsOwned: 58, cardsTotal: total }, { lastSeen: now - 3 * 3600_000, inMatch: false });
  b.seedProfile('f4', { name: 'Eskel', avatar: 'IRON', portrait: '', friendCode: 'ESKE2345', level: 2, title: null, cardsOwned: 31, cardsTotal: total });
  b.seedProfile('f5', { name: 'Fenna', avatar: 'EMBER', portrait: '', friendCode: 'FENN2345', level: 15, title: 'Shardseeker', cardsOwned: 120, cardsTotal: total }, { lastSeen: now - 30 * 3600_000, inMatch: false });
  // A profile written by an older version: no level, title or cards.
  b.seedProfile('f6', { name: 'Garrick', avatar: 'ASTRAL', portrait: '', friendCode: 'GARR2345' }, { lastSeen: now - 12 * 86_400_000, inMatch: false });
  b.seedProfile('f7', { name: 'Hesper', avatar: 'TIDE', portrait: '', friendCode: 'HESP2345', level: 11, title: 'Bladebound', cardsOwned: 96, cardsTotal: total }, { lastSeen: now - 4 * 86_400_000, inMatch: false });
  for (const f of ['f1', 'f2', 'f3', 'f5', 'f6', 'f7']) b.seedFriendship(DEV_UID, f);
  b.seedRequest({ from: 'f4', to: DEV_UID, fromName: 'Eskel', fromAvatar: 'IRON', createdAt: now - 600_000 });
  if (opts.invites) {
    b.seedInvite(DEV_UID, { id: 'dev-tour', from: 'f1', fromName: 'Brynja', code: 'K7Q2M', createdAt: now - 30_000, status: 'pending', kind: 'tournament', size: 16 });
    // As written by an older version: no kind, so it is a match invite.
    b.seedInvite(DEV_UID, { id: 'dev-match', from: 'f2', fromName: 'Corvin', code: 'ABC234', createdAt: now - 10_000, status: 'pending' });
  }
  return { uid: DEV_UID, backend: b };
}
