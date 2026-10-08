/**
 * Daily puzzles: a fixed board where you must win this turn. Every puzzle is checked by a
 * brute-force solver in tests/puzzles.test.ts (solvable; no card with a random outcome).
 */
export interface PuzzleUnit {
  cardId: string;
  frozen?: boolean;
}

export interface PuzzleDef {
  id: string;
  name: string;
  /** A short hint at the idea, shown under the goal. */
  hint: string;
  energy: number;
  hand: string[];
  board: (string | PuzzleUnit)[];
  enemy: { health: number; board: (string | PuzzleUnit)[] };
}

export const PUZZLES: PuzzleDef[] = [
  {
    id: 'through_the_wall', name: 'Through the Wall', hint: 'A wall stands between your hound and the enemy Warden.',
    energy: 1, hand: ['emb_flame_jolt'], board: ['emb_pyre_hound'], enemy: { health: 4, board: ['token_sentry'] },
  },
  {
    id: 'rally', name: 'Rally the Legion', hint: 'One card can make your whole board hit harder.',
    energy: 4, hand: ['emb_legion_warbringer'], board: ['emb_kindling_imp', 'emb_ashfang_raider'], enemy: { health: 12, board: [] },
  },
  {
    id: 'overcharged', name: 'Overcharged', hint: 'Some spells do more if you keep energy to spare.',
    energy: 4, hand: ['emb_searing_brand'], board: ['emb_pyre_hound'], enemy: { health: 6, board: ['token_treant'] },
  },
  {
    id: 'spell_chain', name: 'Burning Crown', hint: 'Ignivar turns every spell into a strike at the enemy Warden.',
    energy: 3, hand: ['emb_flame_jolt', 'emb_ember_volley'], board: ['emb_ignivar'], enemy: { health: 12, board: ['token_golem'] },
  },
  {
    id: 'bloodline', name: 'The Silent Hymn', hint: 'Nhal grieves for every friend that falls. Let them strike first.',
    energy: 2, hand: ['vod_tithe_of_bone', 'vod_tithe_of_bone'], board: ['vod_nhal', 'token_recruit', 'token_recruit'], enemy: { health: 10, board: [] },
  },
  {
    id: 'starfall', name: 'Falling Stars', hint: 'Three guards stand shoulder to shoulder.',
    energy: 3, hand: ['ast_starfall'], board: ['emb_cinderbreath_drake', 'emb_pyre_hound'], enemy: { health: 8, board: ['token_sentry', 'token_sentry', 'token_sentry'] },
  },
  {
    id: 'mother_of_drakes', name: 'Mother of Drakes', hint: 'Clear the way before the dragon takes the sky.',
    energy: 8, hand: ['emb_vulkara'], board: ['emb_kindling_imp', 'emb_pyre_hound'], enemy: { health: 7, board: ['tut_dummy', 'tut_dummy'] },
  },
  {
    id: 'meowchick', name: 'Feline Fury', hint: 'Meowchick cannot attack this turn, but it inspires everyone else.',
    energy: 4, hand: ['neu_meowchick'], board: ['emb_kindling_imp', 'emb_ashfang_raider'], enemy: { health: 9, board: [] },
  },
];
