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
