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
    version: '0.9.1',
    date: '2026-10-02',
    title: 'Kingdoms at War & Fantasy Realms',
    summary: 'Both card sets have new names and new pack art, and your card backs live in the Collection.',
    sections: [
      {
        kind: 'improved',
        items: [
          'Shardfall is now called Kingdoms at War and Tides of the Hollow Deep is now Fantasy Realms, each with a new illustrated booster pack in high resolution.',
          'Collection: the new Card backs button below Recycle surplus shows the card backs you own. Pick the one you want to use there.',
          'Shop: the Buy and Equip buttons of all card backs line up at the same height.',
          'Booster packs: your unopened packs are shown as large as in the Shop, tilted the same way.',
          'Card backs are now in high resolution.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.9.0',
    date: '2026-10-02',
    title: 'Card backs',
    summary: '16 card backs to collect in the Shop, and a new look for the Tides packs.',
    sections: [
      {
        kind: 'new',
        items: [
          'Card backs: the Shop now sells 15 card backs for 300 to 1,250 Gold. Your deck on the table, the cards in your hand as your opponent sees them, and freshly opened packs all wear the back you choose.',
          'Every Warden starts with Warden’s Compass. Buying a back equips it right away; switch any time with Equip.',
          'AI opponents and bosses bring a random card back to every match. Online opponents show the back they picked.',
        ],
      },
      { kind: 'improved', items: ['Tides of the Hollow Deep packs: a new polished trident with leaf-shaped blades over rolling waves.'] },
    ],
    commits: [],
  },
  {
    version: '0.8.2',
    date: '2026-10-02',
    title: 'Draw pile',
    summary: 'Your deck sits on the table, End turn is back on the right.',
    sections: [
      {
        kind: 'improved',
        items: [
          'Both decks now lie on the left side of the board as a stack of cards that gets thinner as you draw. Drawn cards fly from the deck into your hand.',
          'The decks on the table are twice as big, with the card count shown on the top card.',
          'End turn and Concede are back on the right side.',
          'The battle log on the right keeps the whole match. Scroll up to read older lines; it follows new ones while you are at the bottom.',
          'Warden abilities sit on both sides of the portrait: the first on the left, the second on the right.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.8.1',
    date: '2026-10-02',
    title: 'Talent balance',
    summary: 'Warden abilities retuned so every faction lands close to an even win rate.',
    sections: [
      {
        kind: 'balance',
        items: [
          'Hollow Summons III: summons Risen Bones, plus a Hollow Wisp only if a friendly unit died this turn (was always both).',
          'Soul Harvest: twice per turn at ranks I and II (was 3); rank III keeps 3 but deals 1 damage (was 2).',
          'Unending III: summons Risen Bones and restores 2 Health to your Warden (was Bones and a Wisp).',
          'Barkskin: works on the first unit you summon each turn (rank III: the first two).',
          'Wellspring: II restores 1 to everyone and 1 more to your Warden, III restores 2 (was 2 and 3).',
          'Sap of the Root III: restores 4 Health for 2 energy (was 3 Health for 1).',
          'Rivet Plating III and Reinforced Hull III: +1 Armor only while you control a Construct.',
          'Assembly Protocol: twice per turn.',
          'Kindled Fury: I gives +1 Attack permanently, II +1/+1, III +2/+1.',
          'Starlit Insight: the Mote is no longer Fleeting; III also deals 1 damage to a random enemy.',
          'Arcane Volley: 2 energy at every rank, 2 / 3 / 4 bolts.',
          'Spellweave: +1/+1 from rank I; II adds 1 Health to your Warden; III gives +1/+1 twice.',
          'Foresight: now checks at the end of your turn (1 / 2 / 3 or fewer cards in hand).',
          'Rime Touch: deals 1 damage from rank I; II costs 1; III deals 2 damage.',
          'Undertow: II costs 2, III reaches units costing up to 4.',
          'Cold Snap: the Shard is not Fleeting from rank II (up to 4 cards in hand), III up to 6 cards.',
          'Tidepool: II also Freezes a random enemy unit, III costs 1.',
          'New default builds: Lumen Conclave Starlit Insight III + Spellweave II, Rimetide Court Rime Touch III + Tidepool II.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.8.0',
    date: '2026-10-02',
    title: 'Warden Talents',
    summary: 'The Warden Sigil is gone. Every deck now builds its own Warden from a talent tree.',
    sections: [
      {
        kind: 'new',
        items: [
          'Warden Talents: the deck editor has a new Talents tab. Each Warden has 5 abilities, each with ranks I, II and III.',
          'Every deck learns 2 abilities and spends all 5 talent points: one ability reaches rank III, the other rank II. You can change the build at any time, for free.',
          'Abilities are active (click the hexagon next to your portrait, pay energy, once per turn) or passive (a round badge that triggers on its own and lights up when it does).',
          'Your old decks got their faction’s default build: the former Sigil at rank III plus one more ability at rank II.',
          'Campaign bosses and AI opponents bring their own abilities. Bosses keep their signature power and add a second one.',
        ],
      },
      {
        kind: 'improved',
        items: ['Deck boxes show the two abilities a deck uses. Ward now protects against enemy Warden abilities.'],
      },
    ],
    commits: [],
  },
  {
    version: '0.7.0',
    date: '2026-10-01',
    title: 'Faction balance',
    summary: 'The Cinder Legion cools down a little and the Lumen Conclave gets the help it needed.',
    sections: [
      {
        kind: 'balance',
        items: [
          'Vulkara, Mother of Drakes: her On Deploy now deals 1 damage to all enemies (was 2).',
          'Blazing Barrage: 5 bolts (was 6).',
          'Ashfang Raider: now 3/2 (was 3/1).',
          'Chart the Heavens: costs 1 (was 2).',
          'Prismwarden: now 2/6 (was 2/5).',
          'Moonlit Librarian: now 2/4 (was 2/3).',
          'Comet Scholar: costs 3 (was 4).',
          'Collapse of Heaven: costs 4 (was 5).',
          'Blood Pact: deals 4 damage to your Warden (was 3).',
        ],
      },
    ],
    commits: [],
  },
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
