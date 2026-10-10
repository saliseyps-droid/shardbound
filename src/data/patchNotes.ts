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
    version: '0.35.1',
    date: '2026-10-10',
    title: 'Dragons take flight',
    summary: 'Legendary Dragons fly in with their own entrance.',
    sections: [
      {
        kind: 'new',
        items: [
          'Legendary Dragons have their own entrance: a dragon\'s shadow sweeps over the table, the dragon lands with a roar and rings of force, and great wings drawn in fine glowing lines unfold behind it.',
          'Each dragon is coloured by its element: embers for Pyraxis and Vulkara, ice for Glacivar, shadow for Nyxarath, a full moon for Selunith and a rain of gold for Aurumvex.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.35.0',
    date: '2026-10-10',
    title: 'Spectating',
    summary: 'Watch your friends\' matches and tournament matches live.',
    sections: [
      {
        kind: 'new',
        items: [
          'Friends: when a friend is in a match, a Watch button appears next to their name. It works for online matches, Ranked, tournaments and matches against the AI.',
          'Tournaments: every match in progress that has a player in it can be watched from the bracket, also after you are knocked out.',
          'Spectators see the board, health, energy, the battle log and every animation, but neither player\'s hand, so nobody can be helped from the side.',
          'Up to four spectators per match. Watching never affects your collection, stats or quests.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.34.0',
    date: '2026-10-09',
    title: 'Big moments',
    summary: 'Flourishes for big spells, a final blow, a new results screen, and Legendary entrances in packs and the collection.',
    sections: [
      {
        kind: 'new',
        items: [
          'Epic and Legendary spells are cast over a turning rune circle in their faction\'s colour; Legendary spells end in a burst of light.',
          'The final blow: when a Warden falls, the view leans in, the Warden flares white and shatters into pieces that fly apart, and only then do the results appear.',
          'A new results screen: the title drops in letter by letter between golden wings drawn feather by feather, and the results slide in after it.',
          'Pulling a Legendary from a pack plays its entrance.',
          'Collection: Legendary cards have a Play entrance button in their details.',
        ],
      },
      { kind: 'improved', items: ['Frozen units now also have an ice outline around them, and the ice bursts into shards when they thaw. With Barrier as well, the ice hugs the unit and the golden Barrier sits outside it.'] },
    ],
    commits: [],
  },
  {
    version: '0.33.3',
    date: '2026-10-09',
    title: 'Three more entrances',
    summary: 'Elinda, Skolky and R3-D3 get their own Legendary entrances.',
    sections: [
      {
        kind: 'new',
        items: [
          'Elinda: vines climb her frame and burst into flowers, fireflies rise and a wave of healing light washes outward.',
          'Skolky: a purple rune circle is drawn behind him, glowing runes spiral up around him and violet frost spreads over the screen.',
          'R3-D3: a blueprint, turning gears and a scanning beam, armour plates bolting onto its frame, then "Systems online".',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.33.2',
    date: '2026-10-09',
    title: 'Signature entrances',
    summary: 'Six more Legendaries get their own entrance, and every entrance lasts a little longer.',
    sections: [
      {
        kind: 'new',
        items: [
          'Liu Kano: comets of light crash into his dark silhouette, the darkness shatters, a crown of light bursts up behind him, and a tractor made of stars rolls in.',
          'Captain Abandoneer: a WANTED poster slapped onto the table, a cutlass slash and a rain of gold doubloons.',
          'Rendoslav: royal banners unfurl and a crown falls onto his head hard enough to shake the table.',
          'Qvido: glowing lava below and embers rising around him.',
          'Bubblemaker Qinny: a starlit sky, rainbow bubbles, and a big bubble around Qinny that wobbles and pops.',
          'Tallys the Menace: a heartbeat of red, the table cracking open, and one killing slash.',
        ],
      },
      { kind: 'improved', items: ['Legendary entrances last about a quarter longer, so there is time to take them in.'] },
    ],
    commits: [],
  },
  {
    version: '0.33.1',
    date: '2026-10-09',
    title: 'Legendary entrances',
    summary: 'Legendary units now make a grand entrance when they are played.',
    sections: [
      {
        kind: 'new',
        items: [
          'Playing a Legendary unit, yours or your opponent\'s, shows a short entrance: golden rays, its art in a large frame and its name, before it lands on the board.',
          'Meowchick has its own comic-book entrance: a red and yellow burst, a "Meow!" bubble and golden paw prints across the board.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.33.0',
    date: '2026-10-09',
    title: 'Prismatic and Foil cards in matches',
    summary: 'The Foil and Prismatic cards you own now shine in matches too, and Barrier is easier to see.',
    sections: [
      {
        kind: 'new',
        items: [
          'Your Prismatic and Foil copies now show in matches: in your hand, in previews and on the board, for both players.',
          'Each copy keeps its own variant: with one Prismatic and one normal copy in a deck, only one of them shines.',
          'The deck editor shows how many copies in each deck are Prismatic (✦) or Foil (✧).',
          'Existing decks work as before: your best copies go into them automatically, nothing to set up.',
        ],
      },
      { kind: 'improved', items: ['Barrier is much easier to see in matches: a glowing golden shield around the whole unit, with a slow gleam.'] },
    ],
    commits: [],
  },
  {
    version: '0.32.0',
    date: '2026-10-09',
    title: 'Harder daily puzzles',
    summary: 'Fourteen new daily puzzles, each with only one way to win.',
    sections: [
      {
        kind: 'improved',
        items: [
          'Daily puzzle: fourteen new, much harder puzzles. The enemy Warden has exactly as much Health as your best possible turn deals, only one combination of cards gets there, and it takes at least three cards and several careful steps.',
          'Some puzzles hide a trap card that must stay in your hand; the hint tells you whether you need every card or not.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.31.5',
    date: '2026-10-09',
    title: 'Hooded cat portraits',
    summary: 'Five new hooded cat Warden portraits in the Shop.',
    sections: [{ kind: 'new', items: ['New Warden portraits in the Shop (250 Gold each): Candlelit Seer Cat (Brass Dominion), Frosthood Cat (Rimetide Court), Emberhood Cat (Cinder Legion), Starhood Cat (Hollow Choir) and Goldhood Cat (Lumen Conclave).'] }],
    commits: [],
  },
  {
    version: '0.31.4',
    date: '2026-10-09',
    title: 'Three cat portraits',
    summary: 'Three new cat Warden portraits in the Shop.',
    sections: [{ kind: 'new', items: ['New Warden portraits in the Shop (250 Gold each): Bloomcrown Cat (Thornweald Circle), Silvermoon Cat (Lumen Conclave) and Shadowmark Cat (Hollow Choir).'] }],
    commits: [],
  },
  {
    version: '0.31.3',
    date: '2026-10-08',
    title: 'Card art fix',
    summary: 'Cards no longer show an empty picture when their art fails to load.',
    sections: [{ kind: 'fixed', items: ['Card art that fails to load (a network hiccup, or an update while the game was open) is now loaded again, and if that fails too the card shows generated art instead of an empty picture.'] }],
    commits: [],
  },
  {
    version: '0.31.2',
    date: '2026-10-08',
    title: 'Gears of Invention',
    summary: 'The 1000 Gold Prismatic pack has new art and a gold shimmer.',
    sections: [{ kind: 'improved', items: ['The Prismatic pack (1000 Gold) is now Gears of Invention, with new art and the same gold shimmer as Divine Ascension. What it holds has not changed.'] }],
    commits: [],
  },
  {
    version: '0.31.1',
    date: '2026-10-08',
    title: 'Prismatic pack touch-ups',
    summary: 'Cleaner pack art and the Prismatic packs first in the Shop.',
    sections: [{ kind: 'fixed', items: ['Divine Ascension: the gold gleam now glides in from off the pack and fades out smoothly instead of jumping.', 'Stars Eternal and Divine Ascension: the pack art has smooth, even edges on every side.', 'Shop: the Prismatic packs come first, before Dragon Realm.'] }],
    commits: [],
  },
  {
    version: '0.31.0',
    date: '2026-10-08',
    title: 'Prismatic packs',
    summary: 'Two premium packs in the Shop: Stars Eternal and Divine Ascension.',
    sections: [
      {
        kind: 'new',
        items: [
          'Stars Eternal (1000 Gold): a Prismatic pack of five cards from every set, all of them Prismatic. A Legendary is guaranteed at least every ten packs.',
          'Divine Ascension (5000 Gold): one Prismatic Legendary from any set, one you do not own yet whenever possible.',
          'Both packs shimmer in the Shop and on the Packs screen: Stars Eternal in rainbow colours, Divine Ascension in gold.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.30.2',
    date: '2026-10-08',
    title: 'Play screen order',
    summary: 'Tutorial and Daily puzzle sit below the game modes.',
    sections: [{ kind: 'improved', items: ['Play: the Tutorial and the Daily puzzle are now side by side below the game modes, just above Practice match.'] }],
    commits: [],
  },
  {
    version: '0.30.1',
    date: '2026-10-08',
    title: 'Ten new card backs',
    summary: 'Ten new card backs in the Shop.',
    sections: [{ kind: 'new', items: ["Ten new card backs in the Shop: Midnight Raven, Lava Prism, Winter Crystal, Lion Bulwark, Abyssal Gate, Navigator's Wheel, Death's Blade, Prism Rose, Demon Crown and Silver Crescent."] }],
    commits: [],
  },
  {
    version: '0.30.0',
    date: '2026-10-08',
    title: 'Daily puzzle',
    summary: 'A new puzzle every day: find the way to win in one turn.',
    sections: [
      {
        kind: 'new',
        items: [
          'Daily puzzle (Play, under the Tutorial): a set board where you must win in one turn. Everyone gets the same puzzle each day, with a hint.',
          'Ending your turn gives the puzzle up, and you can try again as often as you like. The first solve each day pays 60 Gold and 120 XP and extends your streak of days in a row.',
          'Puzzles never count as matches won or lost and do not advance quests.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.29.0',
    date: '2026-10-08',
    title: 'The Dungeon',
    summary: 'A new roguelike mode: three floors, nine foes, one life.',
    sections: [
      {
        kind: 'new',
        items: [
          'Dungeon (Play → Against the AI): pick a Warden and start from 20 simple cards; you do not need to own any of them. First you choose your opening cards.',
          'Three floors of three opponents, harder as you go down; the third on each floor is a boss from the campaign. One loss ends the run.',
          'After each win, add cards: one of two themed bundles of three, or one strong card. After each boss, take one of ten treasures that helps in every later match (extra energy, Armor, Health, cheaper spells and more).',
          'Rewards grow with every win, up to 600 Gold, 4 Dragon Realm packs and 250 Essence for clearing all three floors. Your first run each day is free, then it costs 200 Gold.',
          'Dungeon achievements: Into the Depths, Dungeon Conqueror (with the title Delver of the Deep) and Many Paths Down.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.28.0',
    date: '2026-10-08',
    title: 'New achievements',
    summary: '20 new achievements for Brawl, quests and collecting, with new titles.',
    sections: [
      {
        kind: 'new',
        items: [
          'Brawl achievements (a new category): Brawler, Double Trouble (win both fights of a rotation), Giant Slayer (beat a Champion), Rule Breaker and King of Chaos, with the title King of Chaos.',
          'Collection achievements: complete Fantasy Realms, Legions of Shadow or Dragon Realm, own 20 Dragons, 10 or 30 Legendaries, a Prismatic card, 15 Foil or Prismatic cards, 3 or every Warden portrait and 6 card backs; open 100 packs; craft 50 cards. New titles: Dragonlord, Keeper of Legends and Many-Faced.',
          'Quest achievements: complete 50 quests, and claim all three weekly quests of one week.',
          'Achievements you already qualify for unlock the next time you open the game.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.27.9',
    date: '2026-10-08',
    title: 'Hexagon portrait previews',
    summary: 'Every portrait opens large in the same hexagon frame.',
    sections: [{ kind: 'improved', items: ['The large portrait view (right-click or hold) shows every portrait in the same hexagon frame as in the game, in its faction colour.'] }],
    commits: [],
  },
  {
    version: '0.27.8',
    date: '2026-10-08',
    title: 'Sharper portrait previews',
    summary: 'The large view of the newest portraits shows the whole painting at full resolution.',
    sections: [{ kind: 'improved', items: ['Right-click (or hold) on one of the newest Warden portraits: the large view now shows the whole oval painting at its full resolution instead of the enlarged small crop.'] }],
    commits: [],
  },
  {
    version: '0.27.7',
    date: '2026-10-08',
    title: 'Flame Corsair',
    summary: 'A new Cinder Legion portrait replaces the Orc Warchief.',
    sections: [
      { kind: 'new', items: ['New Warden portrait in the Shop: Flame Corsair (Cinder Legion, 150 Gold).'] },
      { kind: 'balance', items: ['The Orc Warchief portrait has been withdrawn. If you bought it, its Gold has been refunded.'] },
    ],
    commits: [],
  },
  {
    version: '0.27.6',
    date: '2026-10-08',
    title: 'Three weekly quests',
    summary: 'There are now three weekly quests every week instead of one.',
    sections: [
      {
        kind: 'new',
        items: [
          'Weekly quests: three different ones every Monday, each with its Gold, XP and a booster pack. A finished one you have not claimed yet stays until you do.',
          'Three new weekly quests in the rotation: Archmage of the Week (play 40 spells), Lord of Legions (play 70 units) and Steady Victor (win 5 matches).',
          'The quest badge in the menu now also counts finished weekly quests.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.27.5',
    date: '2026-10-08',
    title: 'Shop portraits aligned',
    summary: 'Every faction of portraits in the Shop lines up at the top.',
    sections: [{ kind: 'fixed', items: ['Shop: a faction with fewer portraits (like Brass Dominion) no longer has them pushed down the middle of its box; all start at the top.'] }],
    commits: [],
  },
  {
    version: '0.27.4',
    date: '2026-10-08',
    title: 'Portrait touch-ups',
    summary: 'Two portraits leave the Shop, two get brighter.',
    sections: [
      {
        kind: 'balance',
        items: [
          'The Dread Overlord and Hooded Wraith portraits have been withdrawn. If you bought one, its Gold has been refunded.',
          'The Spectral King and Frost Elf Lord portraits are brighter.',
        ],
      },
      { kind: 'fixed', items: ['Hovering a portrait in the Shop shows the normal pointer again instead of a magnifier.'] },
    ],
    commits: [],
  },
  {
    version: '0.27.3',
    date: '2026-10-08',
    title: 'Card names in patch notes',
    summary: 'Card names in the patch notes are highlighted, and portraits can be viewed large.',
    sections: [
      {
        kind: 'improved',
        items: [
          'Patch notes: every card name is highlighted. Hover it to see the card, click it to open the large view.',
          'Warden portraits: right-click one (or hold it on a phone) in the Shop, Profile or deck editor to see it large.',
          'Dread Overlord and Hooded Wraith portraits are framed closer and brighter, so they read better when small.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.27.2',
    date: '2026-10-08',
    title: 'Eleven new Warden portraits',
    summary: 'New portraits in the Shop, a Brawl panel on Home and a tidier Profile.',
    sections: [
      {
        kind: 'new',
        items: [
          'Eleven new Warden portraits in the Shop: Exiled Warlord, Crimson Dragon and Fire Demon (Cinder Legion), Forest Elf (Thornweald Circle), Dread Overlord (Brass Dominion), Golden Eagle and Starlit Elf (Lumen Conclave), Shadow Tyrant, Spectral King and Hooded Wraith (Hollow Choir), Frost Elf Lord (Rimetide Court).',
          'Home shows the current Brawl: both fights, which free packs are still to win and when new fights arrive, with a link straight to it.',
        ],
      },
      {
        kind: 'improved',
        items: [
          'Profile on wide screens: Collection and economy spreads over two columns with its numbers as tiles beside the rarity bars, and Warden portraits fill the full width with a box per faction.',
        ],
      },
      { kind: 'fixed', items: ['The tutorial banner on Home looks as before again (the new Play screen strip had restyled it).'] },
    ],
    commits: [],
  },
  {
    version: '0.27.1',
    date: '2026-10-08',
    title: 'Tidier Play screen',
    summary: 'The Tutorial has its own strip above the game modes.',
    sections: [{ kind: 'improved', items: ['Play: the Tutorial moved out of the AI modes into its own strip at the top, so the mode tiles have more room. Once you have finished it, the strip stays small and offers a replay.'] }],
    commits: [],
  },
  {
    version: '0.27.0',
    date: '2026-10-08',
    title: 'Brawl',
    summary: 'A new mode: two fights with special rules against the Expert AI, new ones every three days.',
    sections: [
      {
        kind: 'new',
        items: [
          'Brawl (Play → Against the AI): two fights against the Expert AI, played with your own deck. Each fight mixes two special rules, and the two fights never share one.',
          'Every three days (at 00:00 UTC) two new fights replace the old ones. Your first win in each fight pays a free pack of the newest set.',
          'The rules: Fire Surge, Long Winter, Dragon Nest, Blood Arena, Spell Storm, Munitions Depot, Siege, Rich Treasury, Final Breath and Champion. The active rules are shown in the match side panel.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.26.16',
    date: '2026-10-08',
    title: 'Undertow',
    summary: 'Undertow rank III costs 3.',
    sections: [{ kind: 'balance', items: ['Undertow (Rimetide Court talent), rank III: costs 3 (was 2). It still returns an enemy unit that costs 4 or less.'] }],
    commits: [],
  },
  {
    version: '0.26.15',
    date: '2026-10-08',
    title: 'Glacial Thornwings',
    summary: 'Glacial Thornwings is no longer a copy of Hailstorm.',
    sections: [{ kind: 'balance', items: ['Glacial Thornwings (Rimetide Court, Epic): now deals 2 damage to all enemy units that are already Frozen, then Freezes all enemy units (was: Freeze all enemy units and deal 1 damage to them).'] }],
    commits: [],
  },
  {
    version: '0.26.14',
    date: '2026-10-08',
    title: 'Barkskin',
    summary: 'Barkskin rank III gives +1/+1.',
    sections: [{ kind: 'balance', items: ['Barkskin (Thornweald Circle talent), rank III: the first unit you summon each turn gets +1/+1 (was +1/+2).'] }],
    commits: [],
  },
  {
    version: '0.26.13',
    date: '2026-10-07',
    title: 'R3-D3',
    summary: 'A new Brass Dominion Legendary joins Dragon Realm.',
    sections: [
      { kind: 'fixed', items: ['The rarity gem on cards stays centred even when the type or tag label is long.'] },
      { kind: 'new', items: ['R3-D3 (Brass Dominion, Legendary, Dragon Realm): 8 energy 1/1 Construct. On Deploy: gain +1/+1 for each Armor you have, then your Warden loses all Armor.'] },
    ],
    commits: [],
  },
  {
    version: '0.26.12',
    date: '2026-10-07',
    title: 'Balance follow-up',
    summary: 'Sap of the Root goes back to 2 energy, a few small buffs including three for the Brass Dominion.',
    sections: [
      {
        kind: 'balance',
        items: [
          'Sap of the Root (Thornweald Circle talent), rank III: back to 2 energy (still heals 4). At 1 energy it made the Thornweald Circle far too strong.',
          'Ashfang Raider: now 3/1 with Swift.',
          'Duskhorn Dragon: costs 5 instead of 6.',
          'Rivet Volley: deals 3 damage instead of 2.',
          'Assemble (Brass Dominion talent), rank III: costs 3 instead of 4.',
          'Steamstride Walker: 4/4 → 4/5.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.26.11',
    date: '2026-10-07',
    title: 'Frostfin Scout',
    summary: 'Frostfin Scout is now 2/1.',
    sections: [{ kind: 'balance', items: ['Frostfin Scout: 1/2 → 2/1.', 'Reap: costs 2 (was 1 since the last update, 3 before).'] }],
    commits: [],
  },
  {
    version: '0.26.10',
    date: '2026-10-07',
    title: 'Warden talent changes',
    summary: 'Undertow is usable every other turn; Barkskin and Sap of the Root change at rank III.',
    sections: [
      {
        kind: 'balance',
        items: [
          'Undertow (Rimetide Court talent): after you use it, it recharges during your next turn and can be used again the turn after (every other turn). The button shows when it is recharging.',
          'Barkskin (Thornweald Circle talent), rank III: works on one unit per turn (was two), still +1/+2.',
          'Sap of the Root (Thornweald Circle talent), rank III: costs 1 instead of 2.',
          'Hollow Summons (Hollow Choir talent), ranks II and III: summons 2/1 Risen Bones instead of 2/2.',
          'Grove Tender: costs 1 instead of 2.',
          'Briarhelm Knight: costs 2 instead of 3.',
          'Rimebound Acolyte: now has Empower 1.',
          'Ashfang Raider: 3/2 → 4/1.',
          'Nyxarath, the Hollow Wyrm: destroys an enemy unit with 4 or more Attack (was 4 or less).',
          'Reap: costs 1 instead of 3.',
          'Bloodcape Zealot: 3/3 → 3/4.',
          'Hollow Leech: 2/3 → 3/2.',
          'Nightshade Fae: Last Breath deals 2 damage to a random enemy (was 1).',
          "Choir's Lament: costs 1 instead of 2.",
          'Soulfire Rite: costs 1 instead of 2.',
          'Duskhorn Dragon: 6/6 → 8/4.',
          'Sigil of the Abyss Lord: costs 5 instead of 6.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.26.9',
    date: '2026-10-07',
    title: 'Hollow Summons and Meowchick',
    summary: 'Hollow Summons is cheaper at rank III without its heal, and Meowchick is reworked.',
    sections: [
      {
        kind: 'balance',
        items: [
          'Hollow Summons (Hollow Choir talent), rank III: costs 2 instead of 3, but no longer restores Health to your Warden.',
          'Meowchick: now 4 energy 1/1. On Deploy: give all your units, including itself, +2 Attack. Whenever it attacks, it first gains +1 Attack. At the end of your turn, it deals 3 damage to a random enemy. (Was 4 energy 3/4 with Barrier that gave your other units +1 Attack this turn when it attacked.)',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.26.8',
    date: '2026-10-06',
    title: 'New art for Bubblemaker Qinny',
    summary: 'Bubblemaker Qinny has new card art.',
    sections: [
      { kind: 'improved', items: ['Bubblemaker Qinny has new, sharper card art.'] },
      { kind: 'fixed', items: ['The Dragon Realm pack no longer has see-through gaps along both sides.'] },
    ],
    commits: [],
  },
  {
    version: '0.26.7',
    date: '2026-10-06',
    title: 'Compact card view on phones',
    summary: 'The large card view on phones is a compact window that fits without scrolling.',
    sections: [{ kind: 'improved', items: ['Phones: the large card view (long-press a card) is a compact window in portrait and landscape and fits on screen without scrolling.'] }],
    commits: [],
  },
  {
    version: '0.26.6',
    date: '2026-10-06',
    title: 'Fire and ice battlefields',
    summary: 'Two new match backgrounds: molten lava rock and cracked ice.',
    sections: [{ kind: 'new', items: ['New match backgrounds: a lava field of black rock with glowing cracks, and a frozen field of cracked blue ice, in rotation with the others.'] }],
    commits: [],
  },
  {
    version: '0.26.5',
    date: '2026-10-06',
    title: 'A new battlefield',
    summary: 'A new match background: a castle play-mat in blue and gold.',
    sections: [{ kind: 'new', items: ['New match background: a heraldic castle play-mat in blue and gold, in rotation with the others.'] }],
    commits: [],
  },
  {
    version: '0.26.4',
    date: '2026-10-06',
    title: 'Phone fixes: packs, Arena draft, Guard',
    summary: 'Opening packs and drafting in the Arena work properly on phones, and the Guard frame fits small units.',
    sections: [
      {
        kind: 'fixed',
        items: [
          'Phones: opening packs in portrait no longer pushes cards off the top or the Done button off the bottom; cards are laid out 3 + 2, and the sealed pack fits in landscape.',
          'Phones: in the Arena draft the next card no longer looks selected at the spot you just tapped, and in landscape the offered cards fit the screen.',
          'Phones: the Guard frame around a unit is now as thick as on PC relative to the unit, instead of a heavy band.',
          'Phones: pack opening and the Arena say tap and long-press instead of click and right-click.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.26.3',
    date: '2026-10-06',
    title: 'Dragon Realm bundle portrait',
    summary: 'The Dragon Realm bundle now comes with the Black Drake portrait.',
    sections: [{ kind: 'improved', items: ['Dragon Realm bundle: the Warden portrait is now the Black Drake (was the Sapphire Dragon).'] }],
    commits: [],
  },
  {
    version: '0.26.2',
    date: '2026-10-05',
    title: 'Faction names on cards',
    summary: 'Card texts name factions the way the game does.',
    sections: [
      {
        kind: 'fixed',
        items: ['Selunith, Glass Observatory, Pyroclast Sage and Blazeheart Fae said "Astral" or "Ember" spells; they now say Lumen Conclave and Cinder Legion spells.'],
      },
    ],
    commits: [],
  },
  {
    version: '0.26.1',
    date: '2026-10-05',
    title: 'Iron and Astral get stronger',
    summary: 'Many small buffs for the Brass Dominion and the Lumen Conclave.',
    sections: [
      {
        kind: 'balance',
        items: [
          'Brass Dominion: Plated Bastion 2/4, Steelwatch Knight 2/4, Ironvow Axeman 3/4, Stormrivet Dreadknight 4/5, Aetherdyne Core 1/5, Bronzecoil Wyrm 6/7, Gearwright Apprentice 2/3, Assembly Foreman 3/4, Steamstride Walker 4/4, Overclock Engineer 3/4, Clockwork Commander 3/5, Gearspike Commander 4/5; Fortress Plating costs 2, Aegis Titan 7, Molten Bulwark 3.',
          'Lumen Conclave: Lumen Acolyte 1/3, Glimmerwing Sprite 1/3, Glimmer Wisp 2/3, Orrery Apprentice 2/4, Spellweaver Adept 4/4, Isera of the Violet Blade 4/5, Veiled Astromancer 4/5, Duskstar Sentinel 3/5, Moonlit Duelist 3/4, Starbound Inquisitor 4/5, Halberdier of the Last Light 5/5, Starveil Drake 5/7, Selenne 4/7.',
          'Warden talent Spellweave (ranks II and III): heals your Warden for 2 instead of 1.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.26.0',
    date: '2026-10-05',
    title: 'Dragon Realm',
    summary: 'A new set of 70 cards: Dragons, Dragon Knights and Fae across every faction.',
    sections: [
      {
        kind: 'new',
        items: [
          'Dragon Realm: 70 new cards (48 units, 16 spells, 3 relics, 3 locations) for every faction, including 7 Legendaries: Pyraxis, Glacivar, Nyxarath, Maelis, Selunith, Valdrek and Aurumvex.',
          'Dragons, Dragon Knights and Fae: many cards get stronger while you control a Dragon, and Fae have their own payoffs.',
          'Dragon Realm packs, a Dragon Realm bundle in the Shop, and Dragon Realm packs in the Arena, level rewards and as tournament prizes.',
        ],
      },
      {
        kind: 'improved',
        items: [
          'Cinder Drakeling, Cinderbreath Drake, Skyrift Wyrm and Vulkara are now Dragons, so they work with the new set.',
          'Cards that make spells or Knights in your hand cheaper (Veiled Astromancer, Crown of the Abyss) now say clearly that only the cards currently in your hand get cheaper.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.25.3',
    date: '2026-10-05',
    title: 'Targeting on PC',
    summary: 'On PC the card you are playing stays in your hand while you choose its target, and turns see-through.',
    sections: [
      {
        kind: 'improved',
        items: [
          'PC: while choosing a target, the card stays raised in your hand as before (instead of moving to the corner), turns see-through, and clicks go through it, so your Warden or a unit under it can be seen and chosen.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.25.2',
    date: '2026-10-05',
    title: 'Invite friends to tournaments',
    summary: 'Tournament organisers can invite friends with one click, and big tournaments show every seat.',
    sections: [
      {
        kind: 'new',
        items: [
          'Tournament lobby: an Invite friends panel lists your friends; invite the ones who are online with one click. They join straight away with their selected deck when they accept.',
        ],
      },
      { kind: 'improved', items: ['Tournaments for 16 and 32 players show every seat in a compact grid, like the smaller ones.'] },
    ],
    commits: [],
  },
  {
    version: '0.25.1',
    date: '2026-10-05',
    title: 'Smoother matches on every screen',
    summary: 'A round of gameplay fixes for phones, tablets and PC, plus the battle log and Warden details on phones.',
    sections: [
      {
        kind: 'new',
        items: [
          'Phones: a log button (under the leave button) opens the battle log; tap a card name in it to inspect the card.',
          'Phones: long-press a Warden ability to read it without using it.',
          'Right-click or long-press a Warden to see its health, armor and both abilities.',
        ],
      },
      {
        kind: 'fixed',
        items: [
          'Phones: the first tap on a card only enlarges it, it no longer plays it by accident.',
          'Phones: long-pressing a target to read it no longer also uses the card or ability on it.',
          'The board no longer shifts up after the mulligan (the leave button and the enemy Warden were cut off).',
          'PC: while choosing a target, the card moves aside so it no longer covers your own Warden.',
          'Messages no longer cover the Continue and Concede buttons on phones.',
          'Tablets: the energy crystals no longer run under End turn, the targeting card no longer covers the log, and the card preview no longer sticks.',
          'An empty deck pile no longer overlaps its counter, and a freshly drawn card can be tapped right away.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.25.0',
    date: '2026-10-05',
    title: 'A guided start and smoother phones',
    summary: 'A stricter tutorial with an introduction to the world, a richer friends list, and many fixes for phones and smaller screens.',
    sections: [
      {
        kind: 'new',
        items: [
          'Tutorial: it opens with the story of Aethra, the six factions and the keywords you will meet on cards.',
          'Tutorial: each step now only allows what it asks for, with a hint if you try something else.',
          'Friends list: see when an offline friend was last online, and the level, title and number of collected cards of every friend.',
        ],
      },
      {
        kind: 'improved',
        items: [
          'Favourite decks come first wherever you pick a deck.',
          'The top menu shows labels only when they all fit, icons otherwise, and switches to the ☰ menu on narrower screens; phones held sideways get a two-column menu.',
          'Phones: your Essence is always visible in the header.',
          'Phones: when a card needs a target, it moves to the bottom-right corner so you can see every unit, with a red cross to cancel.',
        ],
      },
      {
        kind: 'fixed',
        items: ['Phones: cards no longer stay enlarged after a tap, and nothing flickers while choosing a target.'],
      },
    ],
    commits: [],
  },
  {
    version: '0.24.4',
    date: '2026-10-05',
    title: 'Match and deck builder comforts',
    summary: 'Card names in the battle log, right-click previews everywhere in a match, faction-tinted Warden abilities and crafting from the deck editor.',
    sections: [
      {
        kind: 'improved',
        items: [
          'Battle log: card names are highlighted in gold; hover one to see the card.',
          'Match: right-click any card you can see (hand, units, relics, location, mulligan, the card just played, revealed enemy cards, names in the log) to open the full card view.',
          'Warden abilities have a soft tint of their faction colour.',
          'Deck editor: craft cards you are missing right on the card (Craft button with its Essence cost); the new copy goes straight into your deck.',
        ],
      },
      { kind: 'fixed', items: ['The Legions of Shadow pack no longer has a notch in its right edge.'] },
    ],
    commits: [],
  },
  {
    version: '0.24.3',
    date: '2026-10-05',
    title: 'Lighter online matches',
    summary: 'Online matches send about 30 times less data, and both players always see exactly the same board.',
    sections: [
      {
        kind: 'improved',
        items: [
          'Online: after each move only the changes are sent, compressed, instead of the whole game state. A typical match drops from about 2 MB to under 100 KB.',
          'Both players need this version: if your friend has an older one open, you will be asked to reload.',
        ],
      },
      { kind: 'fixed', items: ['Online: small differences between how the two players see the board can no longer build up.'] },
    ],
    commits: [],
  },
  {
    version: '0.24.2',
    date: '2026-10-05',
    title: 'Reliable online connections',
    summary: 'Online matches now connect between networks that blocked each other before.',
    sections: [
      {
        kind: 'fixed',
        items: ['Online, Ranked, tournaments and friend invites: when two players cannot connect directly (strict home routers, mobile data, company networks), the game now relays the match through a TURN server. Direct connections are still tried first.'],
      },
    ],
    commits: [],
  },
  {
    version: '0.24.1',
    date: '2026-10-04',
    title: 'Deck list previews',
    summary: 'Hovering a card in the deck list shows it large.',
    sections: [
      { kind: 'improved', items: ['Deck editor: hover a card in your deck list (right panel) to see the full card next to it.'] },
      { kind: 'fixed', items: ['Campaign: Warden portraits sit centred in their frames again instead of sticking out at the bottom right.'] },
    ],
    commits: [],
  },
  {
    version: '0.24.0',
    date: '2026-10-04',
    title: 'Leaderboards, friends and achievements',
    summary: 'Monthly seasons with leaderboards and rewards, a friends list with one-click invites, and 35 achievements.',
    sections: [
      {
        kind: 'new',
        items: [
          'Leaderboards for Ranked vs AI and Ranked (signed-in players appear on them), with your position even outside the top 100.',
          'Monthly seasons: at the start of each month you get a reward for the best Ranked vs AI rank you reached, from 100 Gold at Bronze up to 1000 Gold, 5 packs and 400 Essence at Crown. Then your rank drops by six (Crown starts at Diamond III).',
          'Friends (needs a cloud account): share your friend code, accept requests, see who is online or in a match, and invite a friend to a match with one click. Playing with a room code still works as before.',
          'Achievements: 35 goals across battle, campaign, Ranked vs AI, Arena, collection, factions and online play. Each pays out once, the moment you unlock it; anything you have already earned is granted right away.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.23.0',
    date: '2026-10-04',
    title: 'Balance and polish',
    summary: 'Balance changes for Tide, Void, Iron and Ember, fairer online disconnects, cheaper 10-pack deals and many interface fixes.',
    sections: [
      {
        kind: 'balance',
        items: [
          'Skolky: 6 → 7 mana.',
          'Kaelthar, Pyre of Souls: deals up to 4 damage (was 5).',
          'Tallys the Menace: 5/5 → 4/5.',
          'Grave Whisperer: 1/1 → 1/2. Cryptcrawler: 2/2 → 2/3. Open Grave: 2 → 1 mana.',
          'Dominion Forge: 3 → 2 mana. Cogspire Foundry: lasts 4 turns (was 3). Steelwatch Knight: 1/3 → 2/3.',
          'Kharzul Caldera: 3 → 2 mana.',
        ],
      },
      {
        kind: 'improved',
        items: [
          'Shop: 10 packs now come with 2 bonus packs, so the big deal is always the cheapest per pack.',
          'Ranked vs AI: your next rival is fixed until you play (no more rerolling by leaving the screen), a draw ends your win streak, and Crown explains Crown points.',
          'Long card text shrinks to fit and hides the flavor text first, so it never runs into the Attack and Health gems.',
          'Phones: the tutorial box sits at the side and never covers the units you need, the results screen fits in landscape and shows in portrait too, and the campaign path becomes a vertical trail on narrow screens.',
          'The results screen shows your XP numbers; the match log names the right mode; strategy names are translated.',
        ],
      },
      {
        kind: 'fixed',
        items: [
          'Online: when the link breaks but both players are online, both now get the same result (a draw), and nobody can keep playing while the connection is being checked.',
          'Online: no more "connection lost" message after a normal concede, and a host no longer accepts a stranger after the link dropped.',
          'Tournament: a draw is replayed instead of counting as a loss.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.22.5',
    date: '2026-10-04',
    title: 'New Legendaries',
    summary: 'Four new Legendaries join Fantasy Realms: Bubblemaker Qinny, Elinda, Skolky and Qvido.',
    sections: [
      {
        kind: 'new',
        items: [
          'Bubblemaker Qinny (Lumen Conclave): 6 mana 4/5. On Deploy: give your other units Barrier.',
          'Elinda (Thornweald Circle): 5 mana 3/5. On Deploy: restore 3 Health to all friendly characters. Whenever a friendly character is healed, give a random friendly unit +1 Attack.',
          'Skolky (Rimetide Court): 6 mana 5/5. On Deploy: Freeze all enemy units. Last Breath: return a random enemy unit to its owner\'s hand.',
          'Qvido (Cinder Legion): 5 mana 3/4. On Deploy: deal 1 damage to all enemies and apply Burn 2 to all enemy units.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.21.2',
    date: '2026-10-04',
    title: 'A clearer Play screen',
    summary: 'The Play screen now shows every mode at a glance, with practice matches below.',
    sections: [
      {
        kind: 'improved',
        items: [
          'Play is now a hub: Campaign, Ranked vs AI, Arena and the Tutorial against the AI; Ranked, Play a friend and Tournament against players.',
          'Each mode shows where you stand: campaign progress, your rank, an Arena run or the free entry of the day.',
          'Practice matches keep their opponent, difficulty and deck choice below the modes. On phones the modes come first, two per row.',
          'Modes against other players have their own see-through azure tiles.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.21.1',
    date: '2026-10-04',
    title: 'A better tutorial',
    summary: 'The tutorial points at what to do, speaks touch on phones, teaches card inspection and suggests where to go next.',
    sections: [
      {
        kind: 'improved',
        items: [
          'A bobbing arrow points at the card, unit or button each step is about.',
          'On phones and tablets the steps say tap and long-press instead of click, drag and hover, and the step box no longer covers your deck or the sound buttons.',
          'New step: how to inspect any card and read its keywords.',
          'After the tutorial you can jump straight to the campaign, your packs or the deck builder.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.21.0',
    date: '2026-10-04',
    title: 'Ranked vs AI',
    summary: 'A new ranked ladder against the AI: climb from Bronze to Crown, and the AI gets stronger with every rank.',
    sections: [
      {
        kind: 'new',
        items: [
          'Ranked vs AI (Play screen): Bronze, Silver, Gold, Platinum and Diamond, three divisions each, then Crown.',
          'Win a star, lose a star; three stars rank you up, and from the third win in a row each win gives a bonus star. You never fall out of Silver, Gold or Diamond once you reach them.',
          'The AI gets sharper with every division and brings rarer cards with every tier; from Diamond it has extra Health, and at Crown extra Energy too.',
          'Wins pay more Gold the higher you are, and reaching each tier for the first time gives a one-time reward with Gold, Essence and packs.',
          'Leaving or reloading during a ranked AI match counts as a loss.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.20.1',
    date: '2026-10-04',
    title: 'Faces of the campaign',
    summary: 'Every campaign Warden now has their own portrait.',
    sections: [
      {
        kind: 'improved',
        items: ['Campaign Wardens use the portraits from the Shop that fit them (an orc deserter, a goblin tinker, a sapphire dragon...), on the map and in the match.'],
      },
    ],
    commits: [],
  },
  {
    version: '0.20.0',
    date: '2026-10-04',
    title: 'The Last Shard',
    summary: 'Four new campaign chapters take the story to its end, with nine new bosses.',
    sections: [
      {
        kind: 'new',
        items: [
          'Chapter VI, The Burning Bloom: fire and root fight over the fallen Shards; boss Vulkara, Mother of Drakes.',
          'Chapter VII, The Clockwork Heavens: the Brass Dominion races the Lumen Conclave; boss Omnifex, the Prime Assembler.',
          'Chapter VIII, The Drowned Hymn: the Rimetide Court and the Hollow Choir; boss Morrowgast, the Deep Leviathan.',
          'Chapter IX, The Last Shard: Aeon, Ysolde the Thrice-Crowned, Ignivar and the final battle against the Sundered Crown.',
          'Five new boss abilities, and bigger first-clear rewards for the later chapters.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.19.1',
    date: '2026-10-04',
    title: 'Fair disconnects',
    summary: 'A broken connection between two online players is now a draw, the campaign is split into tabs, and the Legions of Shadow pack is cut cleanly.',
    sections: [
      {
        kind: 'improved',
        items: [
          'Online: when the connection between you breaks but both players are still online, the match ends in a draw. If your opponent really left, you still win; if your own connection dropped, it is still a loss.',
          'Campaign: at most three chapters are shown at once; later chapters are on their own tab.',
        ],
      },
      {
        kind: 'fixed',
        items: ['The Legions of Shadow pack art no longer has a dark band and shadow around its edges.'],
      },
    ],
    commits: [],
  },
  {
    version: '0.19.0',
    date: '2026-10-04',
    title: 'Legions of Shadow',
    summary: 'The newest set is now Legions of Shadow, the campaign gains two chapters, and a large round of fixes.',
    sections: [
      {
        kind: 'new',
        items: [
          'The newest set is renamed Legions of Shadow, with new pack art. Your cards and packs stay as they were.',
          'Campaign Chapter IV, Legions of Shadow: four sworn Knights and Vorgrath, the Burning Oath.',
          'Campaign Chapter V, The Shadow Throne: Azhrel, Kaelthar and the final battle against Rendoslav.',
          'Card Backs shows the backs you can still collect.',
          'Collection and deck editor on phones: filters open in their own panel, and long-press a card to inspect it.',
        ],
      },
      {
        kind: 'balance',
        items: ['Ossuary Colossus: now costs 5 and is a 3/4 that grows by up to +4/+4 (was 6 mana, 5/6, up to +5/+5).'],
      },
      {
        kind: 'fixed',
        items: [
          'Empower is added only once to spells that deal extra damage under a condition (Abyssal Flare, Frost Lance), and never to damage against your own side.',
          'Silence no longer kills a damaged unit by removing its Health buffs.',
          '"Whenever this destroys a unit" also triggers when the unit kills an attacker with its counter-damage.',
          'Relics only use up a charge when their effect actually happens.',
          'Spellweaver Adept now deals separate 2-damage hits to random enemies, as its text says.',
          'Units with a deploy target can be played without one; Ward text now mentions deploy effects.',
          'A deck\'s chosen Warden portrait is kept after reloading.',
          'A damaged deck code shows an error instead of doing nothing.',
          'Reloading or closing the game during an Arena, Ranked, tournament or online match counts as a loss.',
          'Losing your own connection no longer gives you the win.',
          'Tournament results only count when the match was really played and both players agree.',
          'Changing the computer clock no longer gives extra free Arena entries or new quests.',
          'Retiring a free Arena run before playing gives no reward.',
          'Cloud save keeps changes made while signing in.',
          'Many layout fixes on phones and in Czech: deck buttons, Lore, Settings, Campaign, Quests, Profile, larger buttons in matches.',
          'Dates follow the game language.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.18.14',
    date: '2026-10-04',
    title: 'Tidier Profile and Shop',
    summary: 'The level rewards in your Profile line up neatly, and the set bundle lost its coloured frame.',
    sections: [
      {
        kind: 'improved',
        items: [
          'Next level rewards: levels with several rewards keep the level badge on the first line and wrap the rest neatly underneath.',
          'The set bundle in the Shop no longer has a coloured frame.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.18.13',
    date: '2026-10-04',
    title: 'More titles',
    summary: 'Titles now come every 5 levels instead of every 10, with four new ones.',
    sections: [
      {
        kind: 'improved',
        items: [
          'You now earn a title every 5 levels: Wayfarer (5), Bladebound (15), Stormcaller (25) and Rift Marshal (35) join the existing ones.',
          'If you are already past those levels, the new titles are waiting in your Profile.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.18.12',
    date: '2026-10-04',
    title: 'Quieter match music',
    summary: 'The background music is half as loud during matches, and two new buttons turn music or sounds off.',
    sections: [
      {
        kind: 'improved',
        items: [
          'During a match the background music plays at half volume.',
          'Two buttons in the bottom-left corner of the board turn the music (top) and the sound effects (bottom) off and on.',
          'The same switches are also in Settings, next to Mute all.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.18.11',
    date: '2026-10-04',
    title: 'One sound for playing cards',
    summary: 'Every card you play makes the same soft card sound; crafting is silent.',
    sections: [{ kind: 'improved', items: ['Spells, relics and locations now make the same soft card sound as units when played, instead of the magic sound.', 'Crafting a card no longer plays a sound.'] }],
    commits: [],
  },
  {
    version: '0.18.10',
    date: '2026-10-03',
    title: 'Volume sliders',
    summary: 'Volume sliders start at full and the game is about half as loud at full volume.',
    sections: [{ kind: 'improved', items: ['The volume sliders now start at Master 100, Music 80 and Sound effects 100, and full volume is about half as loud as before. Your volume settings were reset once to these new defaults.'] }],
    commits: [],
  },
  {
    version: '0.18.9',
    date: '2026-10-03',
    title: 'Softer card play',
    summary: 'Playing a card makes a soft card flip.',
    sections: [{ kind: 'improved', items: ['Playing a card now makes the same soft card flip as revealing cards from a pack.'] }],
    commits: [],
  },
  {
    version: '0.18.8',
    date: '2026-10-03',
    title: 'Gentler pack opening',
    summary: 'Opening packs and revealing cards sound much quieter and softer.',
    sections: [{ kind: 'improved', items: ['Opening a pack is a quiet rustle, and each revealed card is a soft card flip. Rare, Epic and Legendary cards add one, two or three gentle tones instead of loud fanfares.'] }],
    commits: [],
  },
  {
    version: '0.18.7',
    date: '2026-10-03',
    title: 'Softer end of turn',
    summary: 'A quieter end-turn sound and no sound when starting a match.',
    sections: [{ kind: 'improved', items: ['Ending your turn makes a soft wooden knock instead of the book closing, and it is quieter.', 'Starting a match from Play or the campaign no longer makes a sound.'] }],
    commits: [],
  },
  {
    version: '0.18.6',
    date: '2026-10-03',
    title: 'Turn sounds',
    summary: 'New sounds for playing a card and ending your turn; the extra chime at the start of your turn is gone.',
    sections: [
      {
        kind: 'improved',
        items: [
          'Playing a card now lands on the table with a soft leather slap.',
          'Ending your turn closes it with the sound of a book shutting.',
          'The old chime at the start of your turn is gone; only the card you draw is heard.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.18.5',
    date: '2026-10-03',
    title: 'Quieter sounds',
    summary: 'Sound effects are about half as loud and buttons no longer click.',
    sections: [{ kind: 'improved', items: ['The recorded sound effects are about half as loud.', 'Clicking buttons in the menus no longer makes a sound.'] }],
    commits: [],
  },
  {
    version: '0.18.4',
    date: '2026-10-03',
    title: 'Better sounds',
    summary: 'Real sound effects in battle, and the ambient music keeps playing during matches.',
    sections: [
      {
        kind: 'improved',
        items: [
          'Attacks now sound like a sword swing and hits like a slash instead of a bouncing beep. Drawing a card rustles, playing one lands on the table, and spells, Barrier, coins, dying units and opening packs got recorded sounds too (public-domain recordings).',
          'Each sound has a few variants at a slightly different pitch, so repeated attacks don\'t sound identical.',
          'The ambient background music now keeps playing during matches instead of going silent.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.18.3',
    date: '2026-10-03',
    title: 'iPhone and phone fixes',
    summary: 'The menu works on iPhones again, and the shop fits phone screens.',
    sections: [
      {
        kind: 'fixed',
        items: [
          'iPhone: the top bar and the menu button no longer hide under the notch or the clock, so the menu opens again in portrait. Matches, the leave button, messages and the welcome screen also keep clear of the notch and the home bar.',
          'Phones: Warden portraits in the shop fit the screen (three per row) instead of spilling past the edge.',
          'Your Warden portrait now also shows in tournament lists and brackets, when picking an Arena Warden and when creating a deck.',
          'Booster packs lists the newest set first, like the shop. The shop subtitle mentions bundles and portraits.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.18.2',
    date: '2026-10-03',
    title: '16 new card backs',
    summary: 'A second collection of card backs joins the shop.',
    sections: [
      {
        kind: 'new',
        items: ['16 new card backs in the shop, from 300 to 750 Gold: gem stars, a frozen star, a void eye, a crescent moon, a dragon seal, a nebula and more.'],
      },
      {
        kind: 'improved',
        items: [
          'Warden portraits are much cheaper: 150 Gold, or 250 for the dragons, the lion, the panda and the eagle (were 400 and 600). The Curse of the Abyss Bundle gets cheaper with them.',
          'The shop shows Warden portraits below the card backs, grouped by faction side by side.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.18.1',
    date: '2026-10-03',
    title: 'Curse of the Abyss Bundle',
    summary: 'A one-time bundle for the newest set: 10 packs, a card back and a Warden portrait for 30% less.',
    sections: [
      {
        kind: 'new',
        items: [
          'Shop: the Curse of the Abyss Bundle has 10 Curse of the Abyss packs, the Hollow Vortex card back and the Frost Lich Warden portrait for 30% less than buying them one by one. One per account.',
          'If you already own the card back or the portrait, it isn\'t charged: the price only counts what you still get, still with 30% off.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.18.0',
    date: '2026-10-03',
    title: 'Warden portraits',
    summary: '16 new Warden portraits to buy in the shop and show for a faction or a single deck.',
    sections: [
      {
        kind: 'new',
        items: [
          'Shop → Warden portraits: 16 new portraits, two or three for every faction, for 400–600 Gold.',
          'Profile → Warden portraits: pick the portrait every deck of a faction shows. The deck editor can give a single deck its own portrait (or keep the Profile choice or the default Warden).',
          'Your portrait shows on the home screen, in your deck lists and on the board in matches, including to your opponent online. Computer opponents now appear with different portraits too.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.17.3',
    date: '2026-10-03',
    title: 'Balance: Curse of the Abyss',
    summary: 'The Lumen Conclave and Thornweald Circle get a little weaker, the Hollow Choir a little stronger.',
    sections: [
      {
        kind: 'balance',
        items: [
          'Azure Maelstrom no longer draws a card (still 4 energy: deal 2 damage to all enemy units).',
          'Sunburst Covenant now costs 7 energy (was 6).',
          'Verdigris Knight: at the end of your turn, restore 2 Health to your Warden (was 1 Health to every friendly character).',
          'Briarhelm Knight is now 2/3 (was 3/3).',
          'Kaelthar, Pyre of Souls now costs 5 energy (was 6).',
          'Hornmoon Reaver is now 4 energy 4/4 (was 5 energy 5/4).',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.17.2',
    date: '2026-10-03',
    title: 'Curse of the Abyss: more spells',
    summary: '15 more spells join Curse of the Abyss, bringing the set to 75 cards. The shop lists the newest set first.',
    sections: [
      {
        kind: 'new',
        items: [
          '15 more spells in Curse of the Abyss (6 Common, 4 Rare, 3 Epic, 2 Legendary).',
          'Legendaries: Sigil of the Abyss Lord (Neutral, 6 energy): Take control of an enemy unit that costs 5 or less. Sunburst Covenant (Lumen Conclave, 6 energy): Deal 3 damage to all enemies. Restore 3 Health to all friendly characters.',
        ],
      },
      { kind: 'improved', items: ['The shop lists booster packs newest set first.'] },
    ],
    commits: [],
  },
  {
    version: '0.17.1',
    date: '2026-10-03',
    title: 'Curse of the Abyss: spells',
    summary: '15 spells join Curse of the Abyss, bringing the set to 60 cards.',
    sections: [
      {
        kind: 'new',
        items: [
          '15 new spells in Curse of the Abyss for every faction (6 Common, 4 Rare, 3 Epic, 2 Legendary). Several reward controlling a Knight, such as Forge Oath, Abyssal Flare and Ember of Oaths.',
          'Legendaries: Crown of the Abyss (Neutral, 5 energy): Draw 2 Knights from your deck. Knights in your hand cost (1) less. Wings of the Last Light (Lumen Conclave, 5 energy): Give your units +2/+2 and Ward.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.17.0',
    date: '2026-10-03',
    title: 'Tournaments up to 32 players',
    summary: 'Choose the tournament size when you create it; bigger tournaments pay bigger prizes.',
    sections: [
      {
        kind: 'new',
        items: [
          'Tournament size: the organizer picks 4, 8, 16 or 32 players before creating it. Up to that many friends can join; bots fill the empty seats.',
          'The bracket shows every round: Round of 32, Round of 16, Quarter-finals, Semi-finals, the Final and the third-place match.',
          'Prizes grow with the size. 4 players: 250 / 100 / 50 Gold. 8: 400 Gold and a Curse of the Abyss pack / 200 / 100. 16: 600 Gold and 2 packs / 300 Gold and 1 pack / 150. 32: 1000 Gold and 3 packs / 500 Gold and 2 packs / 250 Gold and 1 pack.',
        ],
      },
      {
        kind: 'fixed',
        items: ['Bot-against-bot tournament matches are no longer scheduled twice, and many of them at once no longer freeze the organizer\'s game.'],
      },
    ],
    commits: [],
  },
  {
    version: '0.16.0',
    date: '2026-10-03',
    title: 'Weekly quest, free Arena and deck codes',
    summary: 'A bigger quest every week, one free Arena run a day, shareable deck codes and better level rewards.',
    sections: [
      {
        kind: 'new',
        items: [
          'Weekly quest: one bigger quest each week (for example "Win 10 matches") worth 150 Gold, 400 XP and a Curse of the Abyss pack. A new one arrives every Monday; a finished one waits until you claim it.',
          'Arena: your first run each day is free. Further runs cost 300 Gold as before.',
          'Deck codes: Share on a deck (in Decks or the deck editor) gives a code with the cards and Warden abilities. Decks → Import deck adds a deck from a code; cards you don\'t own yet stay in it and are marked.',
          'Level rewards: Profile shows what the next five levels give. Pack rewards now rotate through all three sets, and every 10th level also gives a card back you don\'t own yet.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.15.1',
    date: '2026-10-03',
    title: 'Sharper booster packs',
    summary: 'The booster pack artwork is cut out cleanly.',
    sections: [
      {
        kind: 'fixed',
        items: [
          'Kingdoms at War, Fantasy Realms and Curse of the Abyss packs now have clean, straight edges and complete crimped seals at the top and bottom, without leftover dark background or ragged corners.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.15.0',
    date: '2026-10-03',
    title: 'Accounts and cloud save',
    summary: 'Sign in to keep your progress in an account and continue on any device.',
    sections: [
      {
        kind: 'new',
        items: [
          'Sign in with Google or with e-mail and password: in Settings under Cloud save, or on the welcome screen of a new device.',
          'While you are signed in, your collection, decks, Gold, quests and progress are saved to your account a few seconds after every change. The game still works offline and catches up later.',
          'On a new device, signing in loads your progress. If a device and your account both have different progress, you choose which one to keep.',
          'Only one device saves to your account at a time. When you sign in somewhere else, the previous device shows a notice and can continue with the latest progress.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.14.0',
    date: '2026-10-03',
    title: 'Third-place match',
    summary: 'Tournaments now have a match for third place.',
    sections: [
      {
        kind: 'new',
        items: [
          'Tournament: the two semi-final losers play a third-place match at the same time as the final. Third place wins 50 Gold.',
          'The tournament ends when both the final and the third-place match are over.',
        ],
      },
      {
        kind: 'fixed',
        items: ['A tournament no longer gets stuck when a player who still had a match to play has already left: their opponent wins that match.'],
      },
    ],
    commits: [],
  },
  {
    version: '0.13.5',
    date: '2026-10-03',
    title: 'Talent balance: summoning',
    summary: 'The Hollow Choir and Brass Dominion summoning talents are a little weaker.',
    sections: [
      {
        kind: 'balance',
        items: [
          'Hollow Summons III: instead of an extra Hollow Wisp when a friendly unit died this turn, it restores 2 Health to your Warden.',
          'Unending: Risen Bones only at rank III. Rank II summons a Hollow Wisp and restores 2 Health to your Warden.',
          'Assemble III (two Scrapbots) now costs 4 energy (was 3).',
          'Assembly Protocol II: +1/+0 and 1 Armor per Construct (was +1/+1). +1/+1 with Armor stays at rank III.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.13.4',
    date: '2026-10-03',
    title: 'Silence you can see',
    summary: 'Silenced units now show it when you look at them.',
    sections: [
      {
        kind: 'improved',
        items: [
          'Hovering over or inspecting a Silenced unit shows its card with a "Silenced" label and the rules text struck through, so it is clear the text no longer applies.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.13.3',
    date: '2026-10-03',
    title: 'Steadier tournament connections',
    summary: 'Joining a tournament from another network now waits longer and tries again by itself.',
    sections: [
      {
        kind: 'fixed',
        items: [
          'Joining a tournament now makes up to 3 attempts of 20 seconds each before giving up (was one attempt of 15 seconds). Direct connections between some networks only succeed on a later try.',
          'If it still fails, the message says the networks could not connect and suggests trying again or switching networks, instead of only "The tournament did not answer".',
          'Tournament matches between two players wait longer for each connection attempt.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.13.2',
    date: '2026-10-03',
    title: 'Curse of the Abyss: third wave',
    summary: '15 more Knights join Curse of the Abyss, bringing the set to 45 cards.',
    sections: [
      {
        kind: 'new',
        items: [
          '15 new Knights in Curse of the Abyss: 2 for every faction and 3 Neutral (6 Common, 3 Rare, 4 Epic, 2 Legendary).',
          "Legendaries: Rendoslav (Neutral, 7 energy 6/6): On Deploy: Draw 2 Knights from your deck. Give your other units +1/+1. Kaelthar, Pyre of Souls (Hollow Choir, 6 energy 5/5): Drain. On Deploy: Deal 1 damage to all enemy units for each friendly unit that died this game (up to 5).",
        ],
      },
      {
        kind: 'fixed',
        items: [
          'The Curse of the Abyss pack art no longer has its top-right and bottom-right corners cut off.',
          'Booster packs: the sets sit two per row, so the third one moves to the next row instead of squeezing all three together.',
          'Computer opponents playing the Hollow Choir build stronger decks again now that the new Knights are in the card pool.',
        ],
      },
      {
        kind: 'balance',
        items: [
          'Sylvara, the Thornwinged now costs 7 energy (was 6).',
          'Verdigris Knight now restores 1 Health to all friendly characters at the end of your turn (was 2).',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.13.1',
    date: '2026-10-03',
    title: 'Curse of the Abyss: second wave',
    summary: '15 more Knights join Curse of the Abyss, bringing the set to 30 cards.',
    sections: [
      {
        kind: 'new',
        items: [
          '15 new Knights in Curse of the Abyss: 2 for every faction and 3 Neutral (6 Common, 3 Rare, 4 Epic, 2 Legendary).',
          'More Knight synergy: Scarlet Oathbreaker gives every Knight you summon +1/+1, Gloomwing Squire draws a Knight when it dies, and Ashroad Sellsword and Ironvow Axeman get stronger next to another Knight.',
          'Legendaries: Sylvara, the Thornwinged (Thornweald Circle, 6 energy 4/6): At the end of your turn, give your other units +1/+1. Brannoch, the Bronze Bastion (Brass Dominion, 7 energy 6/8): Guard. On Deploy: Gain 2 Armor for each unit you control.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.13.0',
    date: '2026-10-03',
    title: 'Curse of the Abyss',
    summary: 'A new set of 15 Knights from every faction, including the new Legendary Liu Kano.',
    sections: [
      {
        kind: 'new',
        items: [
          'New set: Curse of the Abyss. 15 Knights from every faction (4 Common, 4 Rare, 3 Epic, 4 Legendary). Its packs are in the shop at the usual prices and can also be won in the Arena.',
          'New card tag: Knight. Duskwing Knight draws a Knight from your deck, and Redcloak Sentinel grows when you already control another Knight.',
          'Legendaries: Vorgrath, the Burning Oath (Cinder Legion, 7 energy 6/6): On Deploy: Deal 2 damage to all enemies. Azhrel, the Drowned Champion (Rimetide Court, 6 energy 5/6): On Deploy: Freeze all enemy units. Draw a card.',
          'Liu Kano (Lumen Conclave Legendary, 6 energy, 5/5): Ward. After you cast a spell, deal 2 damage to a random enemy.',
          'Tallys the Menace moves from Fantasy Realms to Curse of the Abyss and is now also a Knight. Copies you own stay in your collection.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.12.2',
    date: '2026-10-03',
    title: 'Tallys the Menace',
    summary: 'A new Hollow Choir Legendary joins the Fantasy Realms set.',
    sections: [{ kind: 'new', items: ['Tallys the Menace (Hollow Choir Legendary, 6 energy, 5/5 Undead): Guard. On Deploy: Destroy a random enemy unit.'] }],
    commits: [],
  },
  {
    version: '0.12.1',
    date: '2026-10-03',
    title: 'Talent balance',
    summary: 'Summoning abilities of the Hollow Choir and the Brass Dominion cost a bit more.',
    sections: [
      {
        kind: 'balance',
        items: [
          'Hollow Summons now costs 3 energy at every rank (was 2): it combined too well with Soul Harvest and Unending.',
          'Assemble now costs 3 energy at every rank (was 2): it combined too well with Assembly Protocol.',
        ],
      },
      { kind: 'fixed', items: ['Screens no longer show “This screen ran into a problem” when the game was updated while you had it open: it now reloads itself once and opens the new version.'] },
    ],
    commits: [],
  },
  {
    version: '0.12.0',
    date: '2026-10-02',
    title: 'Czech language',
    summary: 'The whole game is now available in Czech, and the campaign plays by the same rules as you.',
    sections: [
      { kind: 'new', items: ['Czech language: switch between English and Čeština in Settings or on the welcome screen. Every screen, card, ability, opponent, quest and patch note is translated.'] },
      {
        kind: 'balance',
        items: [
          'Campaign bosses no longer get extra Health, extra energy or units on the board at the start: they play by the same rules as you and are set apart only by their two Warden abilities.',
          'Campaign difficulty retuned so every chapter can be won with the starter decks: Tinker Wobblesprocket, The Thornwidow, Kharzul Reborn and The Endless Choir play a little less ruthlessly.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.11.0',
    date: '2026-10-02',
    title: 'Play on your phone',
    summary: 'Shardbound now works on phones.',
    sections: [
      {
        kind: 'new',
        items: [
          'Phones: the main menu opens from the ☰ button, and every screen fits a phone held upright.',
          'Matches on phones are played with the phone held sideways: smaller cards, the battle log tucked away, and a reminder to rotate when you hold it upright.',
          'Touch controls: tap a card in your hand to see it large (even on your opponent’s turn), tap it again to play it, or drag it straight onto the board. Drag a unit onto a target to attack, and press and hold a card or unit to inspect it.',
          'Collection on phones: tapping a card opens its details in a panel that slides up from the bottom.',
          'Phones held sideways: your Warden and its abilities sit in the bottom-left corner and your opponent’s in the top-right, so the battlefield stays clear.',
          'Fullscreen on phones: on Android the match switches to fullscreen on your first tap with the phone sideways (or use Play fullscreen on the rotate reminder, which also turns the screen). Add Shardbound to your home screen to play without browser bars, also on iPhone.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.10.1',
    date: '2026-10-02',
    title: 'A new emblem',
    summary: 'Shardbound has a new logo.',
    sections: [
      { kind: 'improved', items: ['The new Shardbound emblem appears in the header, on the loading and welcome screens, as the browser tab icon, and in the match sidebar above the battle log.'] },
      { kind: 'fixed', items: ['Booster packs: a set with several unopened packs no longer shows its pack art twice.', 'Arena: once you press Continue on the run summary, it stays dismissed; coming back to the Arena shows Enter the Arena again.'] },
    ],
    commits: [],
  },
  {
    version: '0.10.0',
    date: '2026-10-02',
    title: 'The Arena',
    summary: 'A new mode: draft a deck one card at a time and see how far it gets you.',
    sections: [
      {
        kind: 'new',
        items: [
          'Arena (its own item in the main menu, entry 300 Gold): choose one of two Wardens, then draft 30 cards by picking one of three each time, from that faction and Neutral.',
          'Set up your Warden abilities, then fight up to 4 AI opponents that get tougher with every win. Your first loss ends the run.',
          'Rewards by wins: 0 – 1 pack and 50 Gold, 1 – 1 pack and 150 Gold, 2 – 2 packs and 250 Gold, 3 – 2 packs and 400 Gold, 4 – 3 packs, 600 Gold and a card back you don’t own yet.',
          'Drafted cards are only for the run: you don’t need to own them. Your run is saved, so you can leave and come back; Retire ends it early with the reward for your wins.',
        ],
      },
      { kind: 'fixed', items: ['Collection and deck editor: a selected card in the first row is no longer cut off at the top.'] },
    ],
    commits: [],
  },
  {
    version: '0.9.2',
    date: '2026-10-02',
    title: 'Meowchick',
    summary: 'A new Neutral Legendary joins the Fantasy Realms set.',
    sections: [
      { kind: 'new', items: ['Meowchick (Neutral Legendary, 4 energy, 3/4 Beast): Barrier. Whenever it attacks, your other units get +1 Attack this turn.'] },
    ],
    commits: [],
  },
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
          'Card Backs: a new item in the main menu shows the card backs you own. Pick the one you want to use there.',
          'Shop: the Buy and Equip buttons of all card backs line up at the same height.',
          'Booster packs: your unopened packs are shown as large as in the Shop, tilted the same way.',
          'Card backs are now in high resolution.',
          'Cards: the text area under the card name is a panel with a soft tint of the faction colour, a thin darker border and a faint faction emblem behind the text.',
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
