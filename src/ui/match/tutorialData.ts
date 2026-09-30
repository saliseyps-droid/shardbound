import type { OpponentDef } from '@/data/opponents';

/** Scripted tutorial opponent (see tutorial.ts for the scripted behaviour). */
export const TUTORIAL_OPPONENT: OpponentDef = {
  id: 'tutorial',
  name: 'Instructor Hale',
  title: 'Warden Trainer',
  avatar: 'compass',
  faction: 'IRON',
  difficulty: 'EASY',
  personality: 'BALANCED',
  rarities: ['COMMON'],
  intro: 'Show me what a Warden can do.',
};
