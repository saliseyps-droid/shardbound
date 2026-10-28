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
    version: '0.75.1',
    date: '2026-10-28',
    title: 'Guard behind walls',
    summary: 'Guard units on the 3D table stand inside castle walls.',
    sections: [
      {
        kind: 'improved',
        items: [
          '3D table: a unit with Guard stands inside castle walls: stone walls with merlons along every side and a round tower at each corner.',
          '3D table: the opponent’s cards in hand no longer flicker into each other.',
          '3D table: the cards on the table hover just above it instead of floating high, and are 15% bigger; your hand sits closer to the table and a little bigger.',
          '3D table: the cards on the table lean towards you much less; the Attack and Health plates have bigger icons and numbers.',
          '3D table: the Attack and Health numbers sit right in the middle of their plates.',
          '3D table: the painted board is bigger, so your Warden stands fully on it.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.75.0',
    date: '2026-10-28',
    title: 'New stat plates',
    summary: 'Attack and Health on the 3D table sit on plates in the faction’s colour.',
    sections: [
      {
        kind: 'improved',
        items: [
          '3D table: Attack and Health sit on small dark plates in the card’s bottom corners, rimmed in the unit’s faction colour, with a sword or a heart beside the number.',
          '3D table: Guard is a steel frame shaped like a shield round the card, and its icon sits with the other ability icons.',
          '3D table: the cards on the table are 10% bigger.',
          '3D table: the Attack and Health plates are smaller, with bigger numbers.',
          '3D table: the opponent holds cards as big as the decks on the table, fully in view behind their Warden.',
          '3D table: the usual view is a little closer and looks down on the table more steeply.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.74.4',
    date: '2026-10-28',
    title: 'Guard you can see',
    summary: 'Guard units stand out on the 3D table.',
    sections: [
      { kind: 'improved', items: ['3D table: a unit with Guard has a bright steel frame and a shield badge on its top edge.', '3D table: the opponent’s cards have the same glossy backs as the decks.'] },
      { kind: 'fixed', items: ['3D table: the opponent’s cards no longer sink into the table.'] },
    ],
    commits: [],
  },
  {
    version: '0.74.3',
    date: '2026-10-28',
    title: 'Cleaner card frames',
    summary: 'Finer frames for the cards on the 3D table, and a click fix.',
    sections: [
      {
        kind: 'improved',
        items: ['3D table: the cards on the table show their picture almost to the edge, in a thin antique-gold frame with an engraved line; Guard is a slim steel bezel instead of a thick stone frame.'],
      },
      { kind: 'fixed', items: ['3D table: after turning the view, the first click on a Warden ability (or anything else) is no longer ignored.'] },
    ],
    commits: [],
  },
  {
    version: '0.74.2',
    date: '2026-10-28',
    title: '3D table fixes',
    summary: 'A round of fixes on the 3D table.',
    sections: [
      {
        kind: 'fixed',
        items: [
          '3D table: cards drawn by you or your opponent fly from the deck to the right hand (they sometimes headed for the wrong place).',
          '3D table: the opponent’s hand is fully in view at the far edge of the table.',
          '3D table: a buffed unit shows a golden sparkle instead of a big yellow triangle that looked like a warning.',
          '3D table: a card you draw rises into your hand instead of flying in from the wrong side.',
          '3D table: the cards on the table and the decks reflect the lights much less.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.74.1',
    date: '2026-10-28',
    title: 'Your hand, a little higher',
    summary: 'On the 3D table your hand sits just below your Warden.',
    sections: [
      { kind: 'improved', items: ['3D table: in the usual view your hand sits just below your Warden, every card fully in view.'] },
      { kind: 'fixed', items: ['3D table: Guard’s stone frame, Freeze’s ice and Barrier’s golden shell sit on the card itself and float and tilt with it, no longer lying on the board apart from it and over its Attack and Health.'] },
    ],
    commits: [],
  },
  {
    version: '0.74.0',
    date: '2026-10-28',
    title: 'Finishes on the 3D table',
    summary: 'Foil, Prismatic and Gilded cards show their finish on the 3D table, and much more polish.',
    sections: [
      {
        kind: 'new',
        items: [
          '3D table: Foil cards have a silver edge and a sweep of light across the picture, Prismatic cards a rainbow edge and a rainbow sweep, Gilded cards a black-gold frame with a golden sweep.',
          '3D table: a Warden ability you can use burns at its rim in the Warden’s colour, with three sparks circling it.',
        ],
      },
      {
        kind: 'improved',
        items: [
          '3D table: the cards on the table and the decks have a soft gloss, the room reflecting in them, without hard highlights washing the pictures out; Wardens and their abilities have a satin sheen.',
          '3D table: the cards in your hand are sharper, and a card held near its lower edge no longer bobs; the glow of a unit ready to attack hugs its card.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.73.5',
    date: '2026-10-28',
    title: 'A clearer view of the cards',
    summary: 'The 3D table looks down a little more, and the board no longer shines through the cards.',
    sections: [
      {
        kind: 'fixed',
        items: [
          '3D table: the usual view looks down on the table a little more, so the cards read better.',
          '3D table: the board’s light effects and the middle line no longer shine through the cards on it.',
          '3D table: playable cards in your hand glow green again, tight round their edge; the cards on the table and the decks have a glossy finish.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.73.4',
    date: '2026-10-28',
    title: 'Your hand, sharp again',
    summary: 'The cards in your hand on the 3D table are the game’s real cards again.',
    sections: [
      {
        kind: 'fixed',
        items: [
          '3D table: your hand shows the real cards (sharp text, the usual playable glow, Foil, Prismatic and Gilded), held on a slant at the near edge of the table, a little closer to it and turned more towards you.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.73.3',
    date: '2026-10-28',
    title: 'Numbers on their gems',
    summary: 'Fixes for the cards on the 3D table and in your hand.',
    sections: [
      {
        kind: 'fixed',
        items: [
          '3D table: the cost, Attack and Health numbers lie right on their gems and turn with the card, instead of floating off them or showing through other cards.',
          '3D table: a playable card in your hand has a soft green glow hugging its edge instead of a hard frame.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.73.2',
    date: '2026-10-28',
    title: 'Wardens and energy as in the preview',
    summary: 'On the 3D table the Wardens and the energy look as in the first preview.',
    sections: [
      {
        kind: 'improved',
        items: [
          '3D table: each Warden lies in a thin gold frame on the table instead of on a tall plinth, with a bigger Health gem.',
          '3D table: the energy crystals are bigger, in rows of five, with a big energy count beside them.',
          '3D table: the view sits a little further back and your hand a little further from the table; playable cards in your hand have a soft green edge instead of a wide glow.',
          '3D table: the opponent holds their cards upright at the far edge, leaning towards themselves, their backs towards you.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.73.1',
    date: '2026-10-28',
    title: 'The table, laid out as in its preview',
    summary: 'The cards on the 3D table and in your hand are sized and placed as in the first preview.',
    sections: [
      {
        kind: 'fixed',
        items: [
          '3D table: your hand lies lower and smaller at the near edge of the table, so your Warden, its abilities and energy are always in view.',
          '3D table: the cards on the table are the preview’s size, and both rows sit close to the middle line, clear of the Wardens.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.73.0',
    date: '2026-10-28',
    title: 'The table as in its preview',
    summary: 'The 3D table now plays like its first preview: cards float, hands are held at the table.',
    sections: [
      {
        kind: 'new',
        items: [
          '3D table: the cards on the table float above it, leaning towards you and breathing gently; the one you point at comes up and stands taller, its shadow on the table below.',
          '3D table: your hand is fanned at the near edge of the table, leaning up towards you; it stays with the table as you zoom and look around. The opponent holds their cards in the air over the far edge.',
          '3D table: a Warden ability you can use has a bright green ring pulsing round it on the table.',
        ],
      },
      { kind: 'fixed', items: ['3D table: both decks lie the same distance from their edge of the board; the glow of a usable Warden ability no longer cuts through its token.'] },
    ],
    commits: [],
  },
  {
    version: '0.72.1',
    date: '2026-10-28',
    title: 'Back to the usual view',
    summary: 'A button and the Space bar bring the 3D table back to its usual view, and a few fixes.',
    sections: [
      {
        kind: 'new',
        items: ['3D table: a camera button in the bottom-left corner (and the Space bar) brings you back to the usual view.'],
      },
      {
        kind: 'improved',
        items: [
          '3D table: a Warden ability you can use now rises off the table and pulses with light; the abilities sit a little further from the Warden, clear of a purchased frame.',
          '3D table: the table top is made of wooden planks with grain and knots, no longer streaked.',
        ],
      },
      { kind: 'fixed', items: ['3D table: the Warden’s portrait (and the cards’ numbers) no longer slide off their place while you move the view.'] },
    ],
    commits: [],
  },
  {
    version: '0.72.0',
    date: '2026-10-28',
    title: 'Cards as in the preview',
    summary: 'The cards on the 3D table and in your hand now look as in the table’s first preview.',
    sections: [
      {
        kind: 'new',
        items: [
          '3D table: the units are cards shaped like real ones, their whole picture in a gold frame with the ability icons along the foot, and raised Attack and Health gems; ready, chosen and target units glow with a ring around the card.',
          '3D table: your hand is real 3D cards with their full text, a cost gem and Attack and Health gems; they lean back towards the table and stand up when you point at one.',
        ],
      },
      {
        kind: 'fixed',
        items: [
          '3D table: a Warden with a purchased frame rises with its frame onto the plinth, and the Warden ability tokens no longer show a square behind the icon.',
          '3D table: the decks lie a little further to the right; the cards on the table have more room between them for their gems.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.71.2',
    date: '2026-10-28',
    title: 'Wardens in 3D',
    summary: 'Wardens, their abilities, the decks and the hand look more solid on the 3D table.',
    sections: [
      {
        kind: 'improved',
        items: [
          '3D table: each Warden’s portrait sits on a raised gold plinth, and the Warden abilities are gold-rimmed tokens (hexagonal when active, round when passive) that glow when you can use them.',
          '3D table: the cards in your hand have a gold edge, like the cards on the table.',
          '3D table: the decks are bigger and lie closer to the middle of the table; the opponent’s hand lies further back, clear of their Warden.',
          '3D table: turning the view is half as sensitive, and it stops before the opponent’s side of the table, as in the first preview.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.71.1',
    date: '2026-10-28',
    title: 'The room around the table',
    summary: 'Moving around the 3D table works as in its first preview, and there is a room around it.',
    sections: [
      {
        kind: 'improved',
        items: [
          '3D table: drag the bare table (or the room) to move around the room; drag with the right mouse button (or with Shift) to turn the view, all the way around the table and up or down.',
          '3D table: zoom out with the mouse wheel to see the whole room: the table on its rug, stone walls and torches. The usual view stays as it was; double-click the table to get back to it.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.71.0',
    date: '2026-10-28',
    title: 'Look around the table',
    summary: 'On the 3D table you can now look around, and the cards read better.',
    sections: [
      {
        kind: 'new',
        items: [
          '3D table: drag the bare table (or drag with the right mouse button anywhere over it) to look around: sideways walks you around the table, up and down tilts the view. Zoomed in, a drag on the bare table moves across it. Double-click the table to sit back down.',
          '3D table: point at a unit to see its whole card right beside it.',
          '3D table: the abilities on the units are round icons in the colours of the mockup (Drain, Ward, Swift, Rush, Venom, after a spell, at the end of a turn…), with their explanations when you point at them.',
          '3D table: the cards in your hand lean back towards the table and stand up when you point at them.',
        ],
      },
      { kind: 'improved', items: ['3D table: no more light following the pointer: its glare on the board made the cards and the painting harder to read. The cards also shine less.'] },
    ],
    commits: [],
  },
  {
    version: '0.70.3',
    date: '2026-10-28',
    title: '3D table, checked over',
    summary: 'A round of fixes and finishing touches all over the 3D table.',
    sections: [
      {
        kind: 'improved',
        items: [
          '3D table: hold Space and drag to move around the zoomed table; on a touchscreen, pinch with two fingers to zoom.',
          '3D table: when several cards are drawn at once, each flies from the deck to the hand in turn; cards milled or burned no longer fly to the hand.',
          '3D table: Settings now say why the table stays 2D on this device (no 3D graphics, a phone).',
          '3D table: runs lighter: the board relief is worked out once per board, the camera and the cards do less work every frame, and the table rests behind the results.',
        ],
      },
      {
        kind: 'fixed',
        items: [
          '3D table: the opponent’s cards have their darker gold edge again, and the energy crystals of a co-op ally glow in the ally’s colours.',
          '3D table: the mouse wheel zooms only over the table; other panels in the match scroll normally.',
          '3D table: a card rises when pointed at equally smoothly at any frame rate.',
          '3D table: after the table could not start, turning 3D off and on again tries it anew.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.70.2',
    date: '2026-10-28',
    title: '3D table touch-ups',
    summary: 'Small fixes on the 3D table.',
    sections: [
      {
        kind: 'fixed',
        items: [
          '3D table: your Warden stays in the middle however many energy crystals you have.',
          '3D table: when you point at a unit, its glow, numbers and icons rise with the card.',
          '3D table: the number of cards in a deck sits right on top of its pile.',
          '3D table: the lights, glow and smoke of every board sit exactly on its painting (the pirate and starry boards were slightly off), and the sea and smoke no longer spill over the edge of the board.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.70.1',
    date: '2026-10-28',
    title: '3D table fixes',
    summary: 'Fixes for the 3D table.',
    sections: [
      {
        kind: 'fixed',
        items: [
          '3D table: the lower part of your Warden, its abilities and your energy can be clicked again; the strip with your hand no longer covered them.',
          '3D table: co-op matches fit their three rows on the table.',
          '3D table: a hit that kills a unit shows its number and sparks too.',
          '3D table: if the 3D table cannot load (for example right after an update), the match switches to the 2D board instead of showing an empty table.',
          '3D table: switching between 2D and 3D many times no longer uses up graphics memory, and if the graphics card drops the table, the match switches to 2D.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.70.0',
    date: '2026-10-28',
    title: 'The 3D table, finished',
    summary: 'The last touches to the 3D table: it adapts to slower computers and works in every kind of match.',
    sections: [
      {
        kind: 'improved',
        items: [
          '3D table: on a computer where it runs slowly it first turns off its shadows and renders at a lower resolution, and if that is not enough it offers to switch to the 2D board.',
          'Co-op matches, puzzles and the Final Blow work on the 3D table; the plinth of a Warden shatters with its portrait.',
          'The 3D table is still off by default: turn it on in Settings or with the 2D / 3D button in a match.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.69.0',
    date: '2026-10-28',
    title: 'Living boards on the table',
    summary: 'The animated boards now come alive on the 3D table too.',
    sections: [
      {
        kind: 'new',
        items: [
          '3D table: the board keeps its breathing glow, flames, sunbeams, mist and smoke, and its particles now move in the air over it: embers rise off the table, snow and leaves fall onto it, dust and fireflies hover above the cards.',
          'The flames and candles painted on a board are real lights on the 3D table and fall on the cards near them.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.68.0',
    date: '2026-10-28',
    title: 'Sparks on the table',
    summary: 'Hits, heals and deaths on the 3D table now happen in 3D.',
    sections: [
      {
        kind: 'new',
        items: [
          '3D table: every hit throws sparks and a flash of light across the table, heals and buffs rise as glowing motes, and the numbers float up facing you, also over the Wardens.',
          'A unit that dies shatters into pieces of its card that tumble across the table. A summoned unit drops onto the table, and an attacking card leaps at its target in an arc.',
          'Every card drawn flies off the top of its deck towards the hand, and heavy hits or hits on a Warden shake the table a little.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.67.0',
    date: '2026-10-28',
    title: 'Cards on the table',
    summary: 'On the 3D table, units, Wardens, decks and energy are now real objects.',
    sections: [
      {
        kind: 'new',
        items: [
          '3D table: every unit lies on the table as a thick card with a gold edge showing its whole picture, and rises a little when you point at it. Attack, Health and keyword icons stay on it; point at a unit to read the full card in the side panel.',
          'Your Warden stands on a gold plinth, both decks are real piles of card backs that shrink as you draw, and your energy is a row of tall cut crystals glowing in the colour of your faction.',
          'Guard, Barrier, Freeze and the ready, selected and target glows follow the shape of the cards on the table.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.66.0',
    date: '2026-10-27',
    title: 'A 3D table to try',
    summary: 'Matches can now be played on a 3D table. It is off by default and still being built.',
    sections: [
      {
        kind: 'new',
        items: [
          '3D table: the board lies as a mat on a wooden table in a dim room, its carving catching the light of a lantern, flickering candles and a lamp that follows your pointer. Everything plays exactly as before: drag cards onto the table, attack, target.',
          'Turn it on in Settings (3D table) or with the 2D / 3D button in the bottom-left corner of a match. Zoom in with the mouse wheel towards the pointer, pan with the middle button, double-click the table to see all of it again.',
          'It stays 2D in performance mode, with reduced motion and on phones. Cards, Wardens and effects get their own 3D look in the next versions.',
        ],
      },
      { kind: 'fixed', items: ['A card in your hand held near its lower edge no longer flickers up and down.'] },
    ],
    commits: [],
  },
  {
    version: '0.65.0',
    date: '2026-10-27',
    title: 'The Portal',
    summary: 'Legendaries without an entrance of their own now arrive through a portal.',
    sections: [
      {
        kind: 'new',
        items: [
          'When a Legendary without its own entrance is played, the board goes quiet and a round portal tears open, framed in gold with energy swirling in its faction’s colours. Inside is the Legendary’s art, drawing you in, with its name in gold. Then the portal closes like an iris.',
          'It plays in matches and when you turn a Legendary from a pack. Dragons and the Legendaries with their own entrance keep theirs.',
          'In performance mode, with reduced motion, or where 3D graphics are not available, the golden entrance plays as before.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.64.0',
    date: '2026-10-27',
    title: 'Packs open in 3D',
    summary: 'Opening a pack is now a little spell: the pack spins up, bursts, and the cards spiral out to you.',
    sections: [
      {
        kind: 'new',
        items: [
          'The pack floats in 3D, a glossy foil with light gliding over it.',
          'Open it and it spins faster and faster, draws in sparks, shrinks into a point of light and bursts. The cards spiral out, each with a trail in its rarity colour, and land in front of you.',
          'Before you turn a card, a glowing rim shows its rarity: blue for Rare, purple for Epic with rising motes, and gold for a Legendary, with turning sun rays behind it, embers circling it and a golden wave now and then.',
          'In performance mode, with reduced motion, or where 3D graphics are not available, packs open as before.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.63.0',
    date: '2026-10-27',
    title: 'The Sundered Crown',
    summary: 'The Sundered Crown now hovers behind the Play button on Home.',
    sections: [
      {
        kind: 'new',
        items: [
          'Home: the Sundered Crown floats behind the Play button in 3D. Its crystal points turn slowly, its core glows, one point is missing and two have broken loose, and small shards keep breaking off and drifting away.',
          'The crown takes the colours of your deck’s faction; without a deck it is a pale Aether blue on a gold band.',
          'In performance mode or with reduced motion the crown stands still.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.62.2',
    date: '2026-10-23',
    title: 'Whole gems',
    summary: 'The Attack and Health gems are no longer clipped, and the Thornpelt Packmother shows its jaws.',
    sections: [
      {
        kind: 'fixed',
        items: [
          'The Attack and Health gems (and the Charges and Duration gems) on cards were clipped at their tips by the card’s cut corners. They are now shown whole.',
          'Gilded Thornpelt Packmother: the art is framed further to the right, so its open jaws are in view.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.62.1',
    date: '2026-10-23',
    title: 'Black and gold',
    summary: 'Gilded cards get the look they were meant to have: black and gold, and a picture you look into like a window.',
    sections: [
      {
        kind: 'improved',
        items: [
          'Gilded cards now have a black lacquer frame with fine gold trim, a gold name and black gems with gold numbers. The art keeps its own colours.',
          'The picture is a window: move your pointer over a Gilded card and the art shifts towards it, with only a faint glare. Without a pointer the art drifts slowly on its own.',
          'Gilded relics and locations: the rules text no longer hides behind the Charges or Duration gem.',
          'On the battlefield a Gilded unit has a black rim with gold edges.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.62.0',
    date: '2026-10-23',
    title: 'Gilded',
    summary: 'A new, rarest card finish: Gilded, sold in its own pack, the Forbidden Spellbook.',
    sections: [
      {
        kind: 'new',
        items: [
          'Gilded cards: the art fills the whole card inside a gold frame, with a gold name and gold gems. The picture is alive: it slowly drifts and breathes inside the frame, a soft light pulses in it and a faint gold sheen crosses the card now and then. On the battlefield a Gilded unit gets a gold rim and the same living picture.',
          'Forbidden Spellbook: a new pack in the shop for 2500 Gold. Five Gilded cards from every set, and a Legendary at least every ten packs.',
          'Gilded cards come only from the Forbidden Spellbook. They cannot be crafted, but recycling one gives 16 times the Essence of a normal copy.',
          'Your Gilded copies go into your decks first, before Prismatic and Foil ones, and your opponents see them too.',
          'Gilded cards count towards the Shimmering Collection achievement.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.61.1',
    date: '2026-10-21',
    title: 'Pirates in sight',
    summary: 'The pirate boards show up in matches again.',
    sections: [{ kind: 'fixed', items: ['The two pirate boards showed only a blurred background in matches. They now show whole, as intended, a little brighter, and every animation runs smoothly at your screen’s frame rate.'] }],
    commits: [],
  },
  {
    version: '0.61.0',
    date: '2026-10-20',
    title: 'Pirate tables',
    summary: 'Two new animated pirate boards join the rotation.',
    sections: [
      {
        kind: 'new',
        items: [
          'Pirate flags: a treasure map between a red and a black pirate flag. The lantern and the candle flicker, the gold coins glint and dust drifts in the lamplight.',
          'Pirate deck: a ship’s deck with the sea all around it. The sea churns slowly, the lantern flickers and the treasure chest and the coins glint.',
          'Both pirate boards are always shown whole, never cropped, whatever the size of your screen.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.60.1',
    date: '2026-10-20',
    title: 'Dust in the candlelight',
    summary: 'Both Wraithwood Inn tables have fine dust drifting over them, and two boards are retired.',
    sections: [{ kind: 'improved', items: ['The Wraithwood Inn tables: tiny motes of dust now drift in the candlelight over both of them, also around the steaming teacup.', 'Two more boards are retired: the arcane sigil and the emerald hall.'] }],
    commits: [],
  },
  {
    version: '0.60.0',
    date: '2026-10-20',
    title: 'Living boards',
    summary: 'Every game board comes alive.',
    sections: [
      {
        kind: 'new',
        items: [
          'Animated boards: every board now moves. Glowing parts breathe, lamps and candles flicker, and each board has its own life: embers over lava and hellfire, red smoke curling around the infernal altar, snow on the frozen lake, sunbeams, mist and fireflies in the forest, falling leaves in the butterfly garden, stars in the sky of the Twin Oath, candlelight and steam on the Wraithwood Inn tables.',
          'When your turn starts, the Shardbound emblem rises in the middle of the board inside two turning rune rings.',
        ],
      },
      { kind: 'improved', items: ['With Reduced motion on, boards stay still with a steady glow. Performance mode shows fewer particles.', 'Two boards are retired: the purple diamond and the castle tapestry.'] },
    ],
    commits: [],
  },
  {
    version: '0.59.7',
    date: '2026-10-19',
    title: 'The Creator can fall',
    summary: 'Sali can now be beaten: his Warden abilities cost much more and come back more slowly.',
    sections: [{ kind: 'balance', items: ['The Black Sun, Sali: Raise the Sovereign and Call the Eclipse now cost 5 Energy and can be used every third turn (were 2 Energy, every other turn). In test fights he is now about as hard as the other final bosses.'] }],
    commits: [],
  },
  {
    version: '0.59.6',
    date: '2026-10-19',
    title: 'The Creator slows down',
    summary: 'Sali’s Warden abilities in The Black Sun cost more.',
    sections: [{ kind: 'balance', items: ['The Black Sun, Sali: Raise the Sovereign and Call the Eclipse now cost 2 Energy (was 1). Still usable every other turn.'] }],
    commits: [],
  },
  {
    version: '0.59.5',
    date: '2026-10-18',
    title: 'A sky of feathers',
    summary: 'Azrafel’s feathers keep falling for his whole entrance.',
    sections: [{ kind: 'improved', items: ['Azrafel’s entrance: the black feathers and red embers no longer fall in a single band; they keep falling across the whole screen until the entrance ends.'] }],
    commits: [],
  },
  {
    version: '0.59.4',
    date: '2026-10-18',
    title: 'Light and shadow',
    summary: 'The entrances of the Arbiter, Halcyon and Azrafel are reworked.',
    sections: [
      {
        kind: 'improved',
        items: [
          'The Arbiter’s entrance is now all in black and white, the Tribunal behind him included.',
          'Halcyon’s entrance: the shining Pearl Gate rises out of the dark behind him, his halo settles over his head and golden dust drifts up.',
          'Azrafel’s entrance: no more cuts across the screen; black feathers and red embers fall from the very first moment.',
        ],
      },
      { kind: 'fixed', items: ['Artemis’s entrance had lost its sparks since the last update. They are back.'] },
    ],
    commits: [],
  },
  {
    version: '0.59.3',
    date: '2026-10-18',
    title: 'Enter the Host',
    summary: 'Halcyon, Azrafel and the Arbiter get their own entrances, The Twin Oath gets its own table and a longer intro, and the Arbiter’s fight is harder.',
    sections: [
      {
        kind: 'new',
        items: [
          'Entrances: the Pearl Gate swings open for Halcyon; the Red Moon rises and two crimson cuts cross the screen for Azrafel; and the Arbiter gets the grandest entrance of all: the Tribunal behind him, beams of judgment, his golden scales tipping and settling, then the verdict in a flash of white and a rain of gold.',
          'The Twin Oath: every fight is now played on its own starry table of the Host. In other modes it can come up like any other mat.',
          'The Twin Oath intro is longer: the celestial city and the shining Pearl Gate at the top of the Rainbow Stair. The ending shows the knights of the Host lowering their swords.',
        ],
      },
      { kind: 'balance', items: ['The Arbiter’s fight: the Scales now deal 3 damage to a random unit of yours, then 2 damage to another, every turn (was 3 to one).'] },
    ],
    commits: [],
  },
  {
    version: '0.59.2',
    date: '2026-10-18',
    title: 'No one is spared',
    summary: 'The Arbiter now judges every other unit, his own side’s too, and his fight is tougher.',
    sections: [
      { kind: 'balance', items: ['The Arbiter: On Deploy he now destroys all other units, friend and foe, and gains +1/+1 for each one.', 'The Arbiter’s fight in the Tribunal: he starts with 100 Health and 20 Armor (was 80 and 15).'] },
      { kind: 'fixed', items: ['The Arbiter’s and Ostiarius’s art no longer shows a white stripe at the edge.'] },
    ],
    commits: [],
  },
  {
    version: '0.59.1',
    date: '2026-10-18',
    title: 'Judgment Day',
    summary: 'Three knights of The Twin Oath get new powers: the Arbiter, Solenne and Halcyon.',
    sections: [
      {
        kind: 'balance',
        items: [
          'The Arbiter (8 Energy, now 3/3): On Deploy he passes judgment, destroying all enemy units and gaining +1/+1 for each one. (Was 7/7: destroy an enemy unit and restore 5 Health.)',
          'Solenne, Voice of the Throne now belongs to the Brass Dominion (5 Energy, now 3/5): On Deploy she freezes all enemy units and draws a card for each Frozen enemy unit, up to 3. (Was an Astral 4/5 that drew 2 cards.) Her fight in the Tribunal is now a Brass Dominion boss.',
          'Halcyon, Captain of the Pearl Gate: besides giving your other units Barrier when he arrives, he now gives Barrier to every unit you summon after him.',
          'The Arbiter’s fight: he starts with 80 Health and 15 Armor and no longer deals two random hits each turn, so his new judgment does not make the last fight unwinnable.',
        ],
      },
      { kind: 'fixed', items: ['Halcyon’s card shows his crown instead of cutting it off at the top.'] },
    ],
    commits: [],
  },
  {
    version: '0.59.0',
    date: '2026-10-17',
    title: 'The Twin Oath',
    summary: 'A new co-op campaign: two Wardens climb to the Host above Aethra and stand trial before the Arbiter, with an AI teammate or a friend.',
    sections: [
      {
        kind: 'new',
        items: [
          'Campaign: The Twin Oath, a 2 v 1 co-op campaign in three chapters (the Rainbow Stair, the Seven Skies and the Tribunal). When the Crown broke, the Arbiter of the Host judged Aethra and sealed the sky. Heaven’s law hears no lone voice, so two Wardens swear an oath and climb together.',
          'Every fight is played with a teammate: pick an AI teammate’s faction, or choose “Play with a friend instead” to open an online room for that fight. The fight counts for your friend too if it is open in their own campaign; otherwise they play it for practice rewards.',
          'Nine knights of the Host to beat, each a boss with the co-op powers, and every one pays its own Angel card: six Epics and three Legendaries (Halcyon, Captain of the Pearl Gate; Azrafel, Angel of the Red Moon; and the Arbiter). The chapter bosses add a rule of their own: the Pearl Gate, the Red Moon and the Scales.',
          'Their “friendly unit” cards reach your teammate’s units too, so Ostiarius can shield your friend’s best unit.',
          'An intro, a scene at the Tribunal before the Arbiter and an ending, over paintings of the Empyrean and its Host.',
          'Nightmare I and II for every fight, four achievements (with the titles Witness of the Tribunal and Knight of the Host) and a Home banner for the new campaign.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.58.5',
    date: '2026-10-17',
    title: 'Three rows in your pocket',
    summary: '2 v 1 co-op fits on a phone held sideways.',
    sections: [{ kind: 'fixed', items: ['2 v 1 co-op on phones: the three rows of units overlapped and your teammate’s Warden covered your deck. The units are now smaller so all three rows fit, and your teammate’s Warden sits at the free right edge.'] }],
    commits: [],
  },
  {
    version: '0.58.4',
    date: '2026-10-17',
    title: 'Wrath, not a quake',
    summary: 'The co-op boss no longer hits every one of your units each turn, so builds of small units work again.',
    sections: [
      {
        kind: 'balance',
        items: [
          '2 v 1 co-op: Tyrant’s Quake (1 damage to each of your units every turn) shut out whole Warden builds of small units. It is now Tyrant’s Wrath: at the start of its turn the boss deals 1 damage to a random enemy twice.',
          'To keep the fight even the boss now has 60 Health and 10 Armor (was 50 Health). It still draws a card and gains 2 Energy every turn, and in test fights against two Hard AI Wardens it wins about half the time.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.58.3',
    date: '2026-10-17',
    title: 'A boss worth the name',
    summary: 'The 2 v 1 co-op boss is no longer a pushover: it gets three powers to make up for facing two Wardens.',
    sections: [
      {
        kind: 'balance',
        items: [
          '2 v 1 co-op: the lone boss plays one turn for every two of yours and faces two battlefields, so it almost never won. Every turn it now also draws a card (Tyrant’s Insight), gains 2 Energy (Tyrant’s Surge) and deals 1 damage to each of your units (Tyrant’s Quake). Its 50 Health and extra Energy stay.',
          'In test fights against two Hard AI Wardens the boss now wins about half the time, so a good team has the edge.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.58.2',
    date: '2026-10-17',
    title: 'Room to breathe',
    summary: 'Warden frames on the Home screen keep clear of your name, and the co-op boss picker is easier to read.',
    sections: [
      {
        kind: 'fixed',
        items: [
          'Home: a Warden frame (the wings and banners especially) reached into your name and level. They now have room beside it.',
          'Play a friend, 2 v 1 co-op: the boss picker squeezed six narrow tiles into a row and cut the names off. It is now three across, each portrait beside its name.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.58.1',
    date: '2026-10-17',
    title: 'Shoulder to shoulder',
    summary: 'In 2 v 1 co-op your teammate’s battlefield is centred like yours and the boss’s.',
    sections: [{ kind: 'fixed', items: ['2 v 1 co-op: your teammate’s row of units sat off-centre, pushed right by their Warden. It now lines up with the boss’s row and yours, with their Warden at the left edge.'] }],
    commits: [],
  },
  {
    version: '0.58.0',
    date: '2026-10-17',
    title: 'Two against one, with a friend',
    summary: 'The 2 v 1 co-op fight now works online too: a friend can join you as your teammate against the boss.',
    sections: [
      {
        kind: 'new',
        items: [
          'Play a friend: choose “2 v 1 co-op” when you create the room, pick the boss and its difficulty, and send your friend the code. They join as your teammate and your AI plays the boss.',
          'If your friend’s connection drops, the AI takes over their Warden and the fight goes on.',
          'Co-op fights give the rewards of a practice match.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.57.0',
    date: '2026-10-17',
    title: 'Two against one',
    summary: 'Practice matches have a new 2 v 1 co-op mode: you and an AI teammate take on a boss together.',
    sections: [
      {
        kind: 'new',
        items: [
          'Play → Practice: switch to “2 v 1 co-op” to fight the chosen rival as a boss with 50 Health and an extra Energy, side by side with an AI teammate of the faction you pick.',
          'You play first, then your teammate, then the boss. The boss attacks and targets either of you; your spells that help allies can also help your teammate’s Warden and units.',
          'A Warden who falls leaves the table and the other fights on. The boss wins only when both of you are down.',
          'Your teammate’s Warden, Energy, hand size and battlefield sit between yours and the boss’s.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.56.1',
    date: '2026-10-17',
    title: 'Numbers on top',
    summary: 'Warden frames no longer cover your Health and Armor in a match, and the frame buttons in Customization fit their tiles.',
    sections: [{ kind: 'fixed', items: ['Matches: with a Warden frame on, the Health and Armor numbers were hidden behind it. They now sit on top of every frame.', 'Customization: the frame buttons (“In use (click to remove)” and the shop prices) no longer spill out of their tiles.'] }],
    commits: [],
  },
  {
    version: '0.56.0',
    date: '2026-10-16',
    title: 'Nightmares for every guest',
    summary: 'Every campaign fight that gives a card now has a Nightmare too, so you can win its Foil and Prismatic copies and play two in a deck.',
    sections: [
      {
        kind: 'new',
        items: [
          'Nightmare I and II now open for every campaign fight that pays its own card, not just the bosses: all the guests of the Wraithwood Inn and the demons of the Underflame. They pay the card in Foil (Nightmare I) and Prismatic (Nightmare II), plus half a boss’s Gold and XP.',
          'Each copy counts, so a campaign card that is not Legendary can now go into a deck twice.',
          'On Nightmare II these fights carry a curse of their faction.',
        ],
      },
      { kind: 'improved', items: ['A card won in a fight: the “Added to your collection” title has a soft dark shadow, so it reads well on any background.'] },
    ],
    commits: [],
  },
  {
    version: '0.55.3',
    date: '2026-10-16',
    title: 'Embers, not floodlights',
    summary: 'The Underflame pictures are no longer washed out, and the Void Reckoning banner on Home gets a painting behind it.',
    sections: [
      { kind: 'fixed', items: ['The Underflame: the brightened cinematic shots and demon cards were overexposed (the reds burned out). They now keep their dark mood and only open up the shadows a little, in the cinematics and in the Codex alike.'] },
      { kind: 'improved', items: ['Home: the Void Reckoning banner now has a Black Sun cinematic painting behind it, like the Underflame banner, and both banners are the same height.'] },
    ],
    commits: [],
  },
  {
    version: '0.55.2',
    date: '2026-10-16',
    title: 'A new face for the Sovereign',
    summary: 'Azgaroth has new art, and his entrance rises over his cathedral of fire.',
    sections: [{ kind: 'improved', items: ['Azgaroth, the Ninth Sovereign: new card art and portrait, molten and glowing on his throne in the dark. His entrance now towers over the burning cathedral of Pyrethrone.'] }],
    commits: [],
  },
  {
    version: '0.55.1',
    date: '2026-10-16',
    title: 'The lords arrive',
    summary: 'The four lords of the Underflame get their own entrances, the campaign its own hellish tables, and Home a banner for it.',
    sections: [
      {
        kind: 'new',
        items: [
          'Legendary entrances for the four lords of the Underflame. Vhessa coils round herself in a swirl of ash and a wave of rot, Ghul strikes his anvil twice in a ring of molten metal and a fountain of sparks, and Rimegrave freezes the lake into a crown of ice. Azgaroth gets the grandest of all: his Burning Throne behind him, his colossal shadow, pillars of fire, a quake and his own stretch of the score.',
          'Two hellish game tables. Every Underflame fight is played on them, taking turns; other campaigns never use them (nor the Wraithwood Inn’s tavern tables), and any other match can land on any table.',
          'Home: a banner for the new campaign over one of its cinematic paintings, with its Legendaries and a way straight in.',
        ],
      },
      {
        kind: 'improved',
        items: ['The Underflame: the darkest demon cards and cinematic shots are brighter, Azgaroth most of all, and the demon cards are framed higher so their heads stay in view.'],
      },
    ],
    commits: [],
  },
  {
    version: '0.55.0',
    date: '2026-10-16',
    title: 'The Underflame',
    summary: 'A fifth campaign: go down into the fire beneath Aethra and face Azgaroth, the Ninth Sovereign, for twelve demon cards.',
    sections: [
      {
        kind: 'new',
        items: [
          'New campaign, The Underflame. When the Crown shattered, its heaviest Shard fell through the world into the fire beneath it, and Azgaroth, the Ninth Sovereign, set it in his crown. Now his legions muster to climb into Aethra, and a burning root in the Caldera leads all the way down to his throne.',
          'Four chapters of three fights, 1000 Gold each: The Burning Root, The Iron Muster, The Frozen Lake and Pyrethrone, the Sovereign’s citadel.',
          'Every demon plays for its own card and gives it up when beaten: twelve new campaign cards, two per faction. Vhessa the Ash Serpent, Ghul the Forgemaster, Rimegrave of the Frozen Lake and Azgaroth himself are Legendary.',
          'Three new cinematics: the way down at the start, the Burning Throne right before the last fight, and the end of the Ninth Sovereign.',
          'The four lords also have a Nightmare I and II once you beat them.',
          'New achievements: Into the Fire, The Forges Fall Silent, Kingslayer (with the title Bane of the Underflame) and The Burning Court for owning all twelve cards (with the title Lord of the Burning Court).',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.54.1',
    date: '2026-10-16',
    title: 'Level prices',
    summary: 'The frame prices in the Shop line up again.',
    sections: [{ kind: 'fixed', items: ['Shop: the price buttons under the Warden frames sit at the same height, however long the description above them.'] }],
    commits: [],
  },
  {
    version: '0.54.0',
    date: '2026-10-16',
    title: 'Frames for every Warden',
    summary: 'Four new Warden frames in the Shop that go with any faction: two still ones for 2500 Gold and two animated ones for 5000.',
    sections: [
      {
        kind: 'new',
        items: [
          'Shop: Warden frames for every faction. Silver Obsidian (polished black stone, silver filigree and engraved runes) and Royal Purple (velvet and gold, a jewelled crown and two banners) cost 2500 Gold. Aurora (the northern lights rippling over a moonlit band) and Shadow Wings (dark wings slowly beating behind your Warden) are animated and cost 5000 Gold.',
          'Each frame is previewed around your own Warden and goes on as soon as you buy it. It shows in every match (your online opponents see it too), on Home and in your Profile, whatever deck you play.',
          'Customization: bought frames sit next to the faction frames, so you can switch between them any time.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.53.8',
    date: '2026-10-16',
    title: 'Fifteen hands',
    summary: 'The Codex marks come in fifteen designs that take turns, and Warden portraits are sharper.',
    sections: [
      {
        kind: 'improved',
        items: [
          'Codex: the ink marks now come in five designs each for runes, tattoo linework and sigils (a hexagram, a pentagram, an octagram with an eye, the moon\u2019s phases and a sun). Neighbouring pages never share a style, and a design never comes twice in a row.',
          'Codex: the rune inscriptions no longer run into the corner seal.',
          'Warden and boss portraits now have twice the resolution, so they stay sharp on the large Codex pages, and the Wraithwood Inn cinematic shot that was still smaller now matches the others.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.53.7',
    date: '2026-10-16',
    title: 'Ink in the margins',
    summary: 'The Codex pages now carry faint inked runes, tattoo-like linework and arcane sigils.',
    sections: [{ kind: 'improved', items: ['Codex: every page has faint ink marks behind it: rune inscriptions with a corner seal, thorned tattoo linework, or a great arcane sigil. The two pages of a spread always differ, down to the runes, and every spread has its own.'] }],
    commits: [],
  },
  {
    version: '0.53.6',
    date: '2026-10-16',
    title: 'No more twins',
    summary: 'Seven cards that copied another card, or did the same thing worse, now have their own effect.',
    sections: [
      {
        kind: 'balance',
        items: [
          'Scorched Dawn (was the same as Wildfire Charge): Apply Burn 2 to all enemy units. Deal 2 damage to the enemy Warden.',
          'Umbral Acolyte (was the same as Choir Novice): Whenever another friendly unit dies, restore 2 Health to your Warden.',
          'Gravecloak Knight (was a weaker Dirgebound Knight): Last Breath: Deal 2 damage to all enemy units.',
          'Abyssal Pyre (was a costlier Starfall): Deal 3 damage to an enemy unit and the units next to it. Apply Burn 2 to them.',
          'Second Dawn (was a weaker Refit): now costs 3. Cleanse all friendly units and give them +0/+2.',
          'Dune Cutpurse (was a weaker Tidecaller Eel): Ambush. Whenever this attacks, draw a card.',
          'Redscarf Lancer (was a weaker Duskblade Legionnaire): Rush. On Deploy: Give a friendly Knight +1/+1.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.53.5',
    date: '2026-10-16',
    title: 'Sharper cards',
    summary: 'All card art is now twice as sharp.',
    sections: [{ kind: 'improved', items: ['Every card picture was upscaled to twice the resolution, with cleaner edges and no blocky compression. The difference shows most on large cards, in the card details and the Legendary entrances.'] }],
    commits: [],
  },
  {
    version: '0.53.4',
    date: '2026-10-16',
    title: 'A cheaper offering',
    summary: 'Feed the Void now costs 0 and draws a card.',
    sections: [{ kind: 'balance', items: ['Feed the Void: costs 0 (was 2) and draws 1 card (was 2). Destroy a friendly unit. Draw a card.'] }],
    commits: [],
  },
  {
    version: '0.53.3',
    date: '2026-10-16',
    title: 'Honest surplus',
    summary: 'Recycle surplus no longer counts campaign cards.',
    sections: [{ kind: 'fixed', items: ['Recycle surplus counted the Foil and Prismatic copies of campaign cards won on Nightmare, so it promised Essence it could not pay: campaign cards cannot be recycled. They no longer count as surplus, and their card page no longer marks them as surplus.'] }],
    commits: [],
  },
  {
    version: '0.53.2',
    date: '2026-10-16',
    title: 'Straight up',
    summary: 'A single face-down card now stands straight, and every pack shows under Packs.',
    sections: [
      { kind: 'fixed', items: ['A card won in a fight and the card in a Divine Ascension pack were tilted while face down and straightened only when turned over. They now stand straight from the start.'] },
      { kind: 'improved', items: ['Divine Ascension and Gears of Invention now show under Packs even when you have none, with a way to get them in the shop, like every other pack.'] },
    ],
    commits: [],
  },
  {
    version: '0.53.0',
    date: '2026-10-16',
    title: 'Nightmares',
    summary: 'Every campaign boss you have beaten can be fought again on Nightmare I and II, for Foil and Prismatic cards. Cards won in fights are now turned over like cards from a pack.',
    sections: [
      {
        kind: 'new',
        items: [
          'Nightmare: once you beat a campaign boss, pick Nightmare I next to the fight. The boss plays at Expert level with the full card pool, with half again as much Health and 1 more Energy.',
          'Beat Nightmare I to open Nightmare II, where the boss also carries its own curse. For example, Grom starts behind armor and Siege Walls, the Maw of the Deep freezes your units, Vulkara keeps drawing Dragons and the Hollow Host makes your cards cost 1 more. The fight panel lists everything that changes.',
          'First wins pay the boss’s card in Foil (Nightmare I) or Prismatic (Nightmare II). Bosses that give no card pay 1 extra pack on Nightmare I and 3 on Nightmare II, plus Gold and XP.',
          'Bosses beaten on a Nightmare show a red I or II on the campaign map.',
          'New achievements: Bad Dreams (beat a boss on Nightmare I) and Lord of Nightmares (beat every boss on Nightmare II, with the title Lord of Nightmares).',
        ],
      },
      {
        kind: 'improved',
        items: ['A card won in a fight now waits face down after the match. Turn it over to reveal it with the same sounds and effects as a card from a pack, Legendary entrance included. The card also shows in the rewards, where you can open it.'],
      },
    ],
    commits: [],
  },
  {
    version: '0.52.0',
    date: '2026-10-15',
    title: 'Fresh ink',
    summary: 'The Codex tells you when a new page is written, and four new achievements for the Codex and the Warden frames.',
    sections: [
      {
        kind: 'new',
        items: [
          'When a cinematic or a beaten boss writes a new page in the Codex, a message tells you which one. Click it to open the book. After a match, the message waits until you leave the match.',
          'A dot on the Codex menu item shows there are pages you have not read yet. In the book, new pages are marked New, and the contents show how many are new in each part.',
          'New achievements: Turning Pages (fill 25 pages of the Codex), The Whole Story (fill every page, with the title Loremaster), Thrice Framed (earn three Warden frames) and Gallery of Wardens (earn all six, with the title Warden of Six Frames).',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.51.0',
    date: '2026-10-15',
    title: 'Frames of the faithful',
    summary: 'Six animated Warden frames, one for each faction, earned with 100 wins.',
    sections: [
      {
        kind: 'new',
        items: [
          'Warden frames: win 100 matches with a faction to earn its animated frame. Cinder Legion burns in blackened iron under living fire, Thornweald Circle is wreathed in boughs and leaves, Brass Dominion turns its gears and gauges, Lumen Conclave carries a moon, a north star and its constellations, Hollow Choir burns black candles on a spiked iron railing, and Rimetide Court grows shards and icicles of glacier ice.',
          'Pick your frame under Customization, where locked frames show how many wins you still need. It shows around your Warden in every match (your online opponents see it too), on Home and in your Profile, with any deck.',
          'With reduced motion on, the frames stand still.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.50.1',
    date: '2026-10-15',
    title: 'A book on its side',
    summary: 'The Codex works on phones held sideways.',
    sections: [
      { kind: 'fixed', items: ['Codex: on a phone held sideways the book was tiny. It now fills the screen, with the page arrows beside it and Contents in the corner.'] },
      { kind: 'improved', items: ['Codex: turning a page plays the same sound as playing a card.', 'Codex: the page of Sali’s throne is open for everyone who has already beaten Sali.'] },
    ],
    commits: [],
  },
  {
    version: '0.50.0',
    date: '2026-10-15',
    title: 'The Codex of Aethra',
    summary: 'The whole story as a book you can leaf through, filling up as you play.',
    sections: [
      {
        kind: 'new',
        items: [
          'Codex (in the menu, and from Lore and keywords): an open book with turning pages that tells the story in order: the Shattering, then every campaign chapter by chapter, with the bosses and the cinematic paintings and narration.',
          'Pages fill in as you go: cinematic pages once you have seen them, chapters once you reach them, bosses once you beat them (with their faction, when you first won and how often, and the card they gave you). Blank pages say what fills them.',
          'The contents page jumps to each part and shows how much of it you have written. Turn pages with the arrows, the arrow keys or a swipe; any cinematic can be replayed from its page.',
          'The cinematic before the fight with Sali now counts as seen, so its page opens too.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.49.2',
    date: '2026-10-15',
    title: 'Compact stats',
    summary: 'Deck statistics fit on one screen.',
    sections: [{ kind: 'improved', items: ['Deck statistics: a more compact layout, with results by mode and by opponent side by side, so everything including the cards fits without scrolling.'] }],
    commits: [],
  },
  {
    version: '0.49.1',
    date: '2026-10-15',
    title: 'Steadier stats',
    summary: 'Small fixes for the new deck statistics.',
    sections: [
      {
        kind: 'fixed',
        items: [
          'Deck statistics: the window stays anchored at the same height when you switch modes, so the title and tabs no longer jump (only its bottom edge follows the content).',
          'Deck tiles: Stats is now a button next to Select and Edit, so Delete stays on one line with the other links.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.49.0',
    date: '2026-10-15',
    title: 'Know your deck',
    summary: 'Every deck keeps its own statistics, split by game mode.',
    sections: [
      {
        kind: 'new',
        items: [
          'Deck statistics: open Stats on any deck to see its win rate, games, wins and losses, average game length and when you last played it, for all modes together or one mode at a time (Practice, Campaign, Ranked vs AI, online, ranked, tournaments, Brawl).',
          'Each mode also shows how the deck does against every faction, and the cards that win the most and the least when you play them (once a card has been played in 3 games).',
          'Deck tiles show the number of games and the win rate at a glance.',
          'Results by mode are rebuilt from your last 100 matches; opponents and cards are counted from this version on.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.48.1',
    date: '2026-10-14',
    title: 'A table at the inn',
    summary: 'Sharper play-mats, and The Wraithwood Inn is played on its own tavern tables.',
    sections: [
      {
        kind: 'new',
        items: ['The Wraithwood Inn: every fight in the campaign is now played on one of two new tavern tables (a beer mug, dice, maps and a pile of bones), taking turns. No other board shows up there.'],
      },
      {
        kind: 'improved',
        items: [
          'All ten play-mats are now shown in full resolution, so they stay sharp on big screens.',
          'The fire and ice play-mats are less dimmed, so they look brighter on the table.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.48.0',
    date: '2026-10-14',
    title: 'Know your friends',
    summary: 'The friends list shows much more about each friend.',
    sections: [
      {
        kind: 'new',
        items: [
          'Friends list: under level and cards you now see each friend\u2019s Ranked vs AI rank, achievements unlocked, campaign fights won (across every campaign) and favourite faction (the one with the most wins).',
          'When a friend is in a match, you see what they are playing: Ranked vs AI, Campaign, Arena, Brawl, a tournament and so on.',
          'Friends on an older version of the game show what their version sends; the rest appears once they update.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.47.5',
    date: '2026-10-14',
    title: 'Fainter stars',
    summary: 'Star Fragment talent tuned down, sharper campaign portraits, a fix for Sali on phones.',
    sections: [
      { kind: 'balance', items: ['Star Fragment (Lumen Warden talent): its Fragments are now 0/1 instead of 1/1 (still with Empower 1). Fragments made by cards are unchanged.'] },
      { kind: 'improved', items: ['Sharper art for the Wraithwood Inn guests (portraits and cards) and the Nulwood Wardens of The Lamplighters’ Road, rebuilt from upscaled paintings.'] },
      { kind: 'fixed', items: ['Sali, the Creator: on some phones his portrait stayed over-bright at the end of his entrance.'] },
    ],
    commits: [],
  },
  {
    version: '0.47.4',
    date: '2026-10-14',
    title: 'Sharper cinematics',
    summary: 'Cinematic paintings in higher resolution.',
    sections: [{ kind: 'improved', items: ['Cinematics: 27 paintings across the world intro and every campaign (Aethra, The Black Sun, The Lamplighters’ Road and The Wraithwood Inn) are now upscaled to a much higher resolution, so they stay sharp on big screens and during the camera moves.'] }],
    commits: [],
  },
  {
    version: '0.47.3',
    date: '2026-10-14',
    title: 'Customization',
    summary: 'Portraits and card backs now live together, and Patch notes is now News.',
    sections: [
      {
        kind: 'improved',
        items: [
          'New Customization screen in the menu (it replaces Card Backs and sits right after Quests): pick the Warden portrait of each faction and your card back in one place. The portraits moved here from the Profile.',
          'Patch notes is now called News.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.47.2',
    date: '2026-10-14',
    title: 'Fairy lights',
    summary: 'New paintings for the end of the world intro.',
    sections: [{ kind: 'improved', items: ['World intro: the last two shots use new paintings of the glowing forest, with the butterflies and a fairy in the light, and the shattering shot is sharper.', 'The Shattering of Aethra: the intro opens on a new painting of a moonlit valley.'] }],
    commits: [],
  },
  {
    version: '0.47.1',
    date: '2026-10-14',
    title: 'The Throne in the Dark',
    summary: "Sali's throne now looms before his fight and behind his entrance.",
    sections: [
      {
        kind: 'new',
        items: [
          'The Black Sun: before every fight with Sali, a short cinematic shows his throne in the dark (skippable).',
          "Sali, the Creator: his Legendary entrance now plays in front of his throne, which flares violet when he arrives, with a burst of the cinematic score under it. The rest of the entrance is unchanged.",
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.47.0',
    date: '2026-10-13',
    title: 'Something is humming in the dark',
    summary: 'Every cinematic now has creepy ambient music.',
    sections: [
      {
        kind: 'new',
        items: [
          'Cinematics have music: a dark ambient score (Paranoid Truth by Tsorthan Grove, public domain) plays under every intro and ending, each one from a different part of the track. It fades in, fades out when the cinematic ends or is skipped, and follows your music volume and mute settings.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.46.2',
    date: '2026-10-13',
    title: 'A new coat of Nulwood',
    summary: "The Lamplighters' Road cinematics get all-new paintings.",
    sections: [
      {
        kind: 'improved',
        items: [
          "The Lamplighters' Road intro and ending: new paintings of the Nulwood (the walkers in the trees, the glowing mushrooms, the drowned ruins and the purple chapel at the end of the road), with the narration reworked to match.",
          'The Black Sun ending: a new final shot of the old citadel under the healing sky.',
          'World intro: a sharper opening shot of the floating castle.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.46.1',
    date: '2026-10-13',
    title: 'The intro for everyone',
    summary: 'Players who started before the world intro existed get to see it once too.',
    sections: [{ kind: 'improved', items: ['World intro: if your Warden has never seen it, it plays once the next time you open the game, then never again (remembered on your account, so on every device). It never interrupts a match.'] }],
    commits: [],
  },
  {
    version: '0.46.0',
    date: '2026-10-13',
    title: 'Where it all began',
    summary: 'New players are greeted by a cinematic about the shattering of the Crown.',
    sections: [
      { kind: 'new', items: ['World intro: a five-shot cinematic tells how the Sundered Crown broke into the Shards. It plays once before you awaken your first Warden, and anyone can replay it from Profile → Lore and keywords.'] },
      { kind: 'fixed', items: ['Cinematics: the Skip button could slide off the left edge of the screen.'] },
    ],
    commits: [],
  },
  {
    version: '0.45.7',
    date: '2026-10-13',
    title: 'Under the black sun',
    summary: 'The Black Sun now opens and ends with a cinematic.',
    sections: [{ kind: 'new', items: ['The Black Sun: a four-shot intro over the floating islands the black sun pulled into the sky, and a three-shot ending after you defeat Sali. Both play once on their own and can be replayed from the campaign screen.'] }],
    commits: [],
  },
  {
    version: '0.45.6',
    date: '2026-10-13',
    title: 'Where the Shards fell',
    summary: 'The Shattering of Aethra now opens and ends with a cinematic.',
    sections: [{ kind: 'new', items: ['The Shattering of Aethra: a four-shot intro through the forests where the Shards fell, and a three-shot ending after you defeat The Sundered Crown. Both play once on their own and can be replayed from the campaign screen.'] }],
    commits: [],
  },
  {
    version: '0.45.5',
    date: '2026-10-13',
    title: 'Ticks are back',
    summary: 'Beaten campaign fights show their green tick again.',
    sections: [{ kind: 'fixed', items: ['Campaign: the green tick on beaten fights was hidden under the opponent portraits. It now sits on the corner of each cleared fight.'] }],
    commits: [],
  },
  {
    version: '0.45.4',
    date: '2026-10-13',
    title: 'Campaign cards on their own shelf',
    summary: 'The collection can show campaign rewards as their own set and sort cards by set.',
    sections: [
      {
        kind: 'improved',
        items: [
          'Collection: the set filter has a new Campaign rewards option with every campaign-only card (the Lamplighter legends and the Wraithwood Inn guests). They no longer show up under the Core set.',
          'New sorting: Sort by set, in release order with campaign rewards last.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.45.3',
    date: '2026-10-13',
    title: 'The lodger always comes back',
    summary: 'The Pale Lodger gets a ghostly ability of its own.',
    sections: [{ kind: 'balance', items: ['The Pale Lodger (The Wraithwood Inn): now 2 Mana 2/2 with Ambush and "Last Breath: Add a new Pale Lodger to your hand" (was 1/3 that gained +1 Attack per spell, a weaker Orrery Apprentice).'] }],
    commits: [],
  },
  {
    version: '0.45.2',
    date: '2026-10-13',
    title: 'Trophies for the road and the inn',
    summary: "Seven new achievements for The Lamplighters' Road and The Wraithwood Inn.",
    sections: [
      {
        kind: 'new',
        items: [
          "The Lamplighters' Road: Lantern Lit (clear Chapter I), The Last Page (defeat Oblivia, title Lamplighter) and Keepers of the Flame (own Nyx, Vael and Oblivia).",
          'The Wraithwood Inn: A Seat at the Table (win your first game there), Last Orders Served (clear Chapter II), Closing Time (defeat the Hollow Host, title Regular of the Wraithwood) and Full House (own all twelve guest cards, title Innkeeper).',
          'Progress you already made counts: achievements you have earned unlock right away.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.45.1',
    date: '2026-10-13',
    title: 'Embers over the inn',
    summary: 'The Wraithwood Inn cinematics glow like a hearth.',
    sections: [{ kind: 'improved', items: ['The Wraithwood Inn intro and ending: flame-orange lettering, with glowing embers and fireflies drifting up instead of violet motes.'] }],
    commits: [],
  },
  {
    version: '0.45.0',
    date: '2026-10-13',
    title: 'The Wraithwood Inn',
    summary: 'A fourth campaign: play cards against dead rangers and ghosts in a haunted tavern, and win the card of everyone you beat.',
    sections: [
      {
        kind: 'new',
        items: [
          'New campaign The Wraithwood Inn: four chapters of three fights in a haunted tavern deep in the forest. Each chapter is unlocked for 1000 Gold, and the campaign opens and ends with its own cinematic.',
          'Twelve new campaign-only cards, two for every faction: every guest plays its own card and gives it to you the first time you beat it. The four chapter hosts (Mossmantle, Bramhorn, the Widow in White and the Hollow Host) are Legendary.',
          'Twelve new Warden portraits for the guests of the inn.',
        ],
      },
      { kind: 'improved', items: ['Campaign-only cards now say which campaign they come from.'] },
    ],
    commits: [],
  },
  {
    version: '0.44.2',
    date: '2026-10-13',
    title: 'Fluffseeker',
    summary: 'Collect all four cat Legendaries for a new title.',
    sections: [{ kind: 'new', items: ['New achievement Four Legendary Paws: own Artemis, Simba, Scar and Archmage Elinka to earn the title Fluffseeker.'] }],
    commits: [],
  },
  {
    version: '0.44.1',
    date: '2026-10-13',
    title: 'A sharper Nulwood',
    summary: "The Lamplighters' Road cinematics use new, sharp landscape paintings.",
    sections: [{ kind: 'improved', items: ["The Lamplighters' Road intro and ending: new full-resolution paintings of the Nulwood instead of the blurry close-ups, and a tighter three-shot ending."] }],
    commits: [],
  },
  {
    version: '0.44.0',
    date: '2026-10-13',
    title: 'Lights, camera, Nulwood',
    summary: "The Lamplighters' Road opens and closes with a short cinematic.",
    sections: [
      {
        kind: 'new',
        items: [
          "Campaign cinematics: The Lamplighters' Road now starts with a short intro the first time you open it, and ends with a short ending once you beat its last boss. Tap to move on, or Skip. Both can be watched again from the campaign screen.",
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.43.5',
    date: '2026-10-13',
    title: 'Your collection, set by set',
    summary: 'The Profile shows how much of each set you have collected.',
    sections: [{ kind: 'new', items: ['Profile: under Collection and economy, a new By set list shows how many cards of each set you have, plus the campaign-only legends.'] }],
    commits: [],
  },
  {
    version: '0.43.4',
    date: '2026-10-13',
    title: 'Clearer card text',
    summary: 'Mote of Insight and Kindle now say exactly when they draw.',
    sections: [{ kind: 'improved', items: ['Mote of Insight and Kindle: the text now reads "If this is at least your 2nd spell this turn, draw a card." They work as before: the spell itself counts, so one spell before it is enough. Units never count.'] }],
    commits: [],
  },
  {
    version: '0.43.3',
    date: '2026-10-13',
    title: "Read your opponent's hand",
    summary: "On phones you can see the opponent's hand and how many cards it holds.",
    sections: [{ kind: 'improved', items: ["Phones held sideways: the opponent's hand peeks further into the screen, so it is easier to see and tap, and a badge next to it always shows how many cards they hold."] }],
    commits: [],
  },
  {
    version: '0.43.2',
    date: '2026-10-13',
    title: 'Tidier shop',
    summary: 'Bundles you already bought move below the packs.',
    sections: [{ kind: 'improved', items: ['Shop: once you buy a bundle, its offer moves below the booster packs, so the top of the shop shows what you can still get.'] }],
    commits: [],
  },
  {
    version: '0.43.1',
    date: '2026-10-12',
    title: 'The Creator, every turn',
    summary: 'Once your Sali becomes your Warden, his two abilities work every turn. Sharper, centred art for Sali and the Lamplighter legends.',
    sections: [
      {
        kind: 'balance',
        items: [
          'Sali, the Creator: once he takes your Warden\'s place, Raise the Sovereign and Call the Eclipse can be used every turn (they used to recharge for a turn). Sali as the final boss of The Black Sun keeps the old pace.',
        ],
      },
      {
        kind: 'improved',
        items: [
          'Sali\'s card art and Warden portrait are centred, so his entrance is too.',
          'Nyx, Vael and Oblivia show their whole figure on the card, and their legendary entrance uses their sharp campaign portrait.',
          'Campaign: the Claimed tag of a first-clear reward lines up with the rest of the reward.',
          'Umbral Drake: zoomed-out card art that shows its whole head.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.43.0',
    date: '2026-10-12',
    title: "The Lamplighters' Road",
    summary: 'A new side campaign through the Nulwood. Each chapter boss joins you as a Neutral legend you cannot get anywhere else.',
    sections: [
      {
        kind: 'new',
        items: [
          "The Lamplighters' Road: a third campaign, apart from both other stories. 3 chapters of 3 fights against the Nul-touched wardens of the Nulwood, each with its own portrait. Pick it in the campaign switcher; each chapter opens for 500 Gold.",
          'Nyx, Lantern of Nul (3 Mana, 2/5, Guard): whenever you cast a spell, restore 2 Health to your Warden. Reward for Chapter I.',
          'Vael, the Void Knell (6 Mana, 3/6, Guard): On Deploy, deal 2 damage to all other units. Reward for Chapter II.',
          'Oblivia, Keeper of the Last Page (7 Mana, 5/6): On Deploy, add copies of the last 2 different spells you cast this game to your hand. Reward for Chapter III.',
          'These three legends are campaign rewards only: they never drop from packs and cannot be crafted or recycled. They are built to help slower, spell-heavy decks hold out against wide boards.',
          'While you play, an eye icon with a number in the top-right corner of the board shows how many spectators are watching your match.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.42.3',
    date: '2026-10-12',
    title: 'One account, one progress',
    summary: 'Signing in on another device now simply loads your account.',
    sections: [
      {
        kind: 'improved',
        items: [
          'Signing in on another device no longer asks which progress to keep: the game reloads straight into the progress saved in your account. The first time you link a device to an account that has no progress yet, the progress from that device is uploaded as before.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.42.2',
    date: '2026-10-12',
    title: 'Every bolt counts',
    summary: 'Blazing Barrage shows all of its hits, Cleanse gives Corrupted units their text back, and the daily reward can no longer be claimed twice.',
    sections: [
      {
        kind: 'fixed',
        items: [
          'Blazing Barrage and other spells that hit several times: hits on the same target now add up into one number. Before, they were drawn on top of each other, so 5 bolts looked like a single -1 on three targets.',
          'Cleanse now gives a Corrupted unit its text back: its keywords and abilities (such as Regenerate) work again and their badges show on the unit.',
          'Daily login rewards can no longer be claimed twice by playing on two devices: when you are signed in, the reward is offered only after your progress has synced with your account.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.42.1',
    date: '2026-10-12',
    title: 'Your cards stay put',
    summary: 'An old copy of the game can no longer take new cards out of your collection and decks.',
    sections: [
      {
        kind: 'fixed',
        items: [
          'An older copy of Shardbound (a tab left open, a cached page or another device) could load your save, drop the Void Reckoning cards it did not know from your collection and decks, and save that. Now the game marks your save with its version, and an older copy asks you to reload instead of touching it.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.42.0',
    date: '2026-10-12',
    title: 'Faces of the black sun',
    summary: 'Six new Warden portraits, one for every faction, and a Void Reckoning Bundle in the Shop.',
    sections: [
      {
        kind: 'new',
        items: [
          'New Warden portraits in the Shop (250 Gold each): Rift Herald (Hollow Choir), Maelstrom Wraith (Rimetide Court), Eclipse Priest (Brass Dominion), Blight King (Thornweald Circle), Cinder Fiend (Cinder Legion) and Fallen Seraph (Lumen Conclave).',
          'Void Reckoning Bundle: 10 Void Reckoning packs, the Void Eye card back and the Blight King portrait, 30% off what you don\'t own yet. One per account.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.41.1',
    date: '2026-10-11',
    title: 'A steadier Campaign screen',
    summary: 'Switching campaigns no longer moves the screen, and Sali is spoken of as he should be.',
    sections: [
      {
        kind: 'fixed',
        items: [
          'Switching between the two campaigns no longer shifts the Campaign screen.',
          'Sali is a he: his texts in The Black Sun, the patch notes and the Dethroned achievement now say so.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.41.0',
    date: '2026-10-11',
    title: 'The Black Sun',
    summary: 'A new Void Reckoning campaign: three chapters, fifteen rivals and Sali waiting on his throne at the end.',
    sections: [
      {
        kind: 'new',
        items: [
          'The Black Sun: a second campaign for Void Reckoning. Pick it at the top of the Campaign screen. It has its own progress and is open from the start, with no need to finish the first campaign.',
          'Three chapters and fifteen rivals: cultists of the black sun, the Mother of Rot, Simba, the Engine of Hunger, Nereth, The Reckoner and, at the end, Sali, the Creator himself.',
          'Five new boss abilities: Black Sun, Rot Bloom, Apex Hunt, Stoke the Furnace and Final Account.',
          'First clears pay mostly Void Reckoning packs; defeating Sali pays 1,000 Gold, 500 Essence and 5 packs.',
          'New achievement Dethroned for defeating Sali, with the title Sunbreaker.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.40.6',
    date: '2026-10-11',
    title: 'Both hands counted when watching',
    summary: "When watching a match, the bottom player's hand shows its card count too.",
    sections: [
      {
        kind: 'improved',
        items: ["When watching a match, hover over the bottom player's hand (tap it on a phone) to see how many cards they hold, just like the top player's."],
      },
    ],
    commits: [],
  },
  {
    version: '0.40.5',
    date: '2026-10-11',
    title: 'Hand count and a quieter spectator label',
    summary: "See how many cards your opponent holds, and the spectator label no longer covers the top of the board.",
    sections: [
      {
        kind: 'new',
        items: ["Hover over your opponent's hand (tap it on a phone) to see how many cards they hold, both in your games and when watching."],
      },
      {
        kind: 'improved',
        items: ['When watching a match, the "Watching A vs B" label sits in the bottom-right corner instead of over the top of the board.'],
      },
    ],
    commits: [],
  },
  {
    version: '0.40.4',
    date: '2026-10-11',
    title: 'A smaller hexagon',
    summary: 'The Play hexagon is smaller and simpler, and Sali sits on his throne again.',
    sections: [
      {
        kind: 'improved',
        items: ['The Play hexagon on Home is a tenth smaller and shows only Play.'],
      },
      {
        kind: 'fixed',
        items: ["Sali, the Creator's art is framed as it was before, so his throne is visible again."],
      },
    ],
    commits: [],
  },
  {
    version: '0.40.3',
    date: '2026-10-11',
    title: 'The Play hexagon',
    summary: 'The Play button on Home is now a gold hexagon.',
    sections: [
      {
        kind: 'improved',
        items: [
          'The Play button on Home is now an open gold hexagon with a double outline instead of the gold crystal. The whole hexagon is clickable, and it lifts and glows when you point at it.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.40.2',
    date: '2026-10-11',
    title: 'Faces in frame',
    summary: 'Void Reckoning art shows heads and faces, and the top menu no longer scrolls.',
    sections: [
      {
        kind: 'fixed',
        items: [
          'Void Reckoning cards whose art was cut too low now show the head, face or black sun at the top of the painting, Steelmaker Gorn and Sunbreaker Titan among them.',
          'The top menu on PC could be scrolled down to a gold underline under the current page. It no longer scrolls, and the underline is gone.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.40.1',
    date: '2026-10-11',
    title: 'News from the Void',
    summary: 'Home now shows what is new: the newest set, its pack and its Legendaries.',
    sections: [
      {
        kind: 'new',
        items: [
          'News on Home: the newest set with its pack, three of its Legendaries and buttons to buy packs, browse its cards in the Collection or read what is new.',
        ],
      },
    ],
    commits: [],
  },
  {
    version: '0.40.0',
    date: '2026-10-10',
    title: 'Void Reckoning',
    summary: 'A new set of 91 cards: a black sun rises and the Void comes to settle every debt.',
    sections: [
      {
        kind: 'new',
        items: [
          'Void Reckoning, the fifth set: 91 cards for every faction, with 15 new Legendaries and dragons of the Void, sold in its own packs in the Shop.',
          "Among the Legendaries: Artemis, Qinny's Bane; Scar, Liu Kano's Mauler; Archmage Elinka; Simba, the Ultimate Predator; Steelmaker Gorn; Nereth, Heart of the Maelstrom; and Sali, the Creator, who wipes the board and, when he dies, takes your Warden's place.",
          "Every one of those seven has its own entrance, and Sali taking the Warden's place has its own scene.",
          'New keyword Consume: On Deploy, destroy another friendly unit and gain its Attack and Health. It counts as a friendly unit dying.',
          'New status Corrupt: a Corrupted unit loses its text and buffs and gets -1/-1 at the start of each of its controller\'s turns until it dies. Cleanse removes it.',
          'The Hollow Choir welcomes the Void and Consumes, Cinder Legion burns out Corrupted enemies, Thornweald rots its foes, Brass Dominion builds engines that eat, Lumen Conclave Cleanses and shields, and the Rimetide Court drowns the light.',
          'New achievement Settled Accounts: own every card in Void Reckoning.',
        ],
      },
      {
        kind: 'improved',
        items: ['Tournament prizes, the Dungeon and Brawl rewards now give Void Reckoning packs, and Arena drafts include its cards.'],
      },
    ],
    commits: [],
  },
  {
    version: '0.36.0',
    date: '2026-10-10',
    title: 'Face-off',
    summary: 'Every match opens with the two Wardens facing each other.',
    sections: [
      {
        kind: 'new',
        items: [
          'Match intro: before the first card, both Wardens meet on a banner across the board, in gold frames with the glow of their factions, with VS between them.',
          'Above them is the kind of match, and below it the tournament round, the Brawl rules or the AI difficulty. Spectators see which match they are watching.',
          'Click anywhere to skip it. The tutorial and the daily puzzle start without it.',
        ],
      },
    ],
    commits: [],
  },
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
