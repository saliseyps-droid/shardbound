/**
 * Player-facing patch notes, newest first. Every change that ships gets an entry
 * (see `commits` for the git history each release covers).
 */

export interface PatchSection {
  kind: 'new' | 'improved' | 'fixed' | 'balance';
  items: string[];
}

export interface PatchNote {
  version: string;
  date: string; // YYYY-MM-DD
  title: string;
  summary: string;
  sections: PatchSection[];
  commits: string[];
}

export const PATCH_NOTES: PatchNote[] = [
  {
    version: '0.6.3',
    date: '2026-10-01',
    title: 'Clearer odds',
    summary: 'See your Foil and Prismatic chances at a glance, and every card now has its own art.',
    sections: [
      { kind: 'improved', items: ['Tides of the Hollow Deep packs now carry a trident rising from the waves instead of the crystal.', 'Shop: Odds and guarantees now has a table with the Foil and Prismatic chances, per card and per pack.'] },
      { kind: 'fixed', items: ['Shop: the Buy buttons of 1, 5 and 10 packs now line up at the same height.', 'Every card now has its own artwork. Bog Toad, Aether Shard, Spark Bolt, Star Fragment and Icebound Oracle got new art.'] },
    ],
    commits: [],
  },
  {
    version: '0.6.2',
    date: '2026-10-01',
    title: 'Shinier shines',
    summary: 'Foil and Prismatic cards sparkle smoothly, in full color.',
    sections: [
      { kind: 'improved', items: ['Foil cards now have a soft rainbow sheen.', 'Prismatic cards get a stronger rainbow sheen and a rainbow frame that keeps turning.'] },
      { kind: 'fixed', items: ['The Foil and Prismatic shine no longer stutters while it loops: it now glides fully off the card and back in.'] },
    ],
    commits: [],
  },
  {
    version: '0.6.1',
    date: '2026-10-01',
    title: 'Balance update',
    summary: 'The Cinder Legion hits harder and the Bramble Boar charges in sharper.',
    sections: [
      {
        kind: 'balance',
        items: [
          'Kindling Imp now has Swift.',
          'Flame Jolt now deals 3 damage (was 2).',
          'Pyre Hound is now 4/1 (was 3/2).',
          'Ashfang Raider is now 3/1 and no longer has Swift (was 2/1 Swift).',
          'Blazing Barrage now fires 6 bolts (was 4).',
          'Bramble Boar is now 4/2 (was 3/3).',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.6.0',
    date: '2026-10-01',
    title: 'Captain Abandoneer',
    summary: 'A new Neutral Legendary joins the crew.',
    sections: [
      {
        kind: 'new',
        items: [
          'New Neutral Legendary: Captain Abandoneer (6 mana, 5/4, Rush). On Deploy she steals a random card from the enemy hand. Last Breath: two 1/1 Deckhands jump ship onto your board.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.5.2',
    date: '2026-10-01',
    title: 'Prismatic shine',
    summary: 'Prismatic cards now shimmer.',
    sections: [{ kind: 'improved', items: ['Prismatic cards now have a moving rainbow sheen across the whole card, like the shine on Foil cards but in full color.'] }],
    commits: [],
  },
  {
    version: '0.5.0',
    date: '2026-10-01',
    title: 'Painted cards',
    summary: 'Every card now has hand-painted artwork.',
    sections: [
      {
        kind: 'new',
        items: [
          'All cards got painted art: fiery knights and drakes for the Cinder Legion, war-mechs for Iron, living trees and beasts for Verdant, star mages for Astral, skeletons and vampires for the Void, sea knights and pirates for the Tide.',
          'Spells, relics and locations show glowing sigils and elemental flames in their faction colors.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.4.0',
    date: '2026-09-30',
    title: 'Patch notes',
    summary: 'You can now read what changed in every update, right here.',
    sections: [{ kind: 'new', items: ['Patch notes in the main menu. A dot on the menu item tells you when there is something new to read.'] }],
    commits: [],
  },
  {
    version: '0.3.0',
    date: '2026-09-30',
    title: 'The Online Arena',
    summary: 'Ranked matchmaking, tournaments for friends, and units that finally look like units.',
    sections: [
      {
        kind: 'new',
        items: [
          'Ranked: press Find match and get paired with a random Warden who is searching at the same time. Climb from Bronze to Crown; wins and losses move your rating.',
          'Tournaments: create one, share the code, and play a 4-player knockout with 2–4 friends. Bots fill the empty seats. The champion gets 250 Gold, the runner-up 100 Gold.',
          'Every unit card now shows a character — knights, mages, wolves, drakes, golems, wraiths and more — so units and spells are easy to tell apart.',
        ],
      },
      {
        kind: 'improved',
        items: [
          'Online matches now give the same Gold, XP and quest progress as any other match.',
          'Play a friend now uses a short room code instead of a link.',
          'Turns last 2 minutes; the countdown appears for the final 30 seconds.',
        ],
      },
      {
        kind: 'balance',
        items: ['Decks may only use cards of their Warden’s faction plus Neutral cards.'],
      },
      {
        kind: 'fixed',
        items: ['A dragged card could stay stuck to the cursor after letting go. It now always returns to your hand unless it is played.'],
      },
    ],
    commits: ['464e996', 'adecce5', '8ae1b10'],
  },
  {
    version: '0.2.0',
    date: '2026-09-30',
    title: 'Wardens and Tables',
    summary: 'Every faction gets a Warden portrait, every match a new play-mat.',
    sections: [
      {
        kind: 'new',
        items: [
          'Warden portraits for all six factions: on the battlefield, on your decks, in the campaign and on your profile. Your portrait follows the Warden of the deck you play.',
          'Seven play-mats: every match is played on a randomly chosen table.',
          'The tutorial now also teaches your Warden Sigil.',
        ],
      },
      {
        kind: 'improved',
        items: [
          'A new magical backdrop behind all menus.',
          'Both Wardens now face each other in the middle of the board, framed in gold together with their Sigils, relics and locations.',
          'Each Warden Sigil shows its faction’s symbol, and the deck editor explains what your Sigil does.',
          'End turn and Concede moved to the left side of the table.',
          'A larger unit drop zone that only appears while you drag a unit.',
          'A larger portrait on the home screen and clearer campaign chapters.',
        ],
      },
      { kind: 'balance', items: ['The 5-pack bundle costs 450 Gold instead of 500.'] },
      { kind: 'fixed', items: ['Portraits in the campaign encounter details were missing.'] },
    ],
    commits: ['b42c10d', 'd76bb2d', '01c07c7', '36d8ef0', '16d1c48', 'e6f8444', '07b12c9', '643b3c6', 'f528793', 'e688f06', '91eb2ec', 'ebe2d3f', '1013ab2', 'dfc4bf9'],
  },
  {
    version: '0.1.0',
    date: '2026-09-30',
    title: 'Shardfall',
    summary: 'The first release of Shardbound.',
    sections: [
      {
        kind: 'new',
        items: [
          '164 collectible cards across six factions and Neutral, in two sets.',
          'Matches against AI Wardens on four difficulty levels, plus a guided tutorial.',
          'A 13-encounter campaign with bosses and first-clear rewards.',
          'Booster packs, crafting and recycling, card variants, and a full collection browser.',
          'A deck builder with validation, mana curve and auto-complete.',
          'Daily quests, a 7-day login reward, 40 levels and match history.',
          'Online matches against a friend.',
        ],
      },
    ],
    commits: ['301f223'],
  },
];

export const LATEST_PATCH = PATCH_NOTES[0].version;
