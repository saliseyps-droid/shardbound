/**
 * Short campaign cinematics: a few painted shots (src/assets/cinematics/<image>.webp) with a slow
 * camera move and a line of narration each. A campaign names its intro and outro (CampaignDef).
 * Texts are translated through t() (Czech in src/i18n/cs/ui/meta.ts).
 */
export type CinematicMotion = 'push-in' | 'pull-out' | 'pan-left' | 'pan-right' | 'tilt-up';

export interface CinematicShot {
  image: string;
  text: string;
  motion: CinematicMotion;
  /** How long the shot stays (ms, real time so the line stays readable). */
  ms: number;
  /** Point of the image to keep in frame and zoom towards (CSS position); default the upper middle. */
  focus?: string;
}

export interface CinematicDef {
  id: string;
  /** Shown big over the first shot. */
  title: string;
  /** Look of the lettering and the floating particles: violet motes (default) or flame-orange embers. */
  theme?: 'void' | 'ember';
  /** Recorded music under the shots (src/assets/music/<id>.mp3) and where in it to start (s); the generative music pauses meanwhile. */
  music?: { track: string; at: number };
  shots: CinematicShot[];
}

// Music: Paranoid Truth by Tsorthan Grove (CC0, opengameart.org/content/paranoid-truth), a different part for each cinematic.
export const CINEMATICS: Record<string, CinematicDef> = {
  // The world intro: plays once on the welcome screen before the first Warden (and from the Lore screen).
  world_intro: {
    id: 'world_intro',
    music: { track: 'paranoid_truth', at: 0 },
    title: 'Shardbound',
    shots: [
      { image: 'world_crown_isle', motion: 'push-in', ms: 6000, focus: '50% 45%', text: 'For a thousand years the Sundered Crown hovered above the world of Aethra and held the elements in balance.' },
      { image: 'world_shattering', motion: 'pull-out', ms: 6000, focus: '48% 35%', text: 'When the last Sovereign vanished, the Crown cracked into ten thousand Shards and rained across the continents.' },
      { image: 'world_aether', motion: 'tilt-up', ms: 6000, text: 'Each Shard is raw Aether: power enough to raise a forest overnight, boil a sea, or wake the dead.' },
      { image: 'world_wardens', motion: 'pan-left', ms: 6000, text: 'Those who can bind the Shards are called Wardens, and every faction of Aethra now races to claim them.' },
      { image: 'world_awaken', motion: 'push-in', ms: 5500, focus: '55% 50%', text: 'You are a newly awakened Warden. Your Shards are waiting for your call.' },
    ],
  },
  // Before the fight with Sali (OpponentDef.preCinematic): one shot of his throne.
  sali_throne: {
    id: 'sali_throne',
    title: 'The Throne in the Dark',
    music: { track: 'paranoid_truth', at: 145 },
    shots: [{ image: 'sali_throne', motion: 'push-in', ms: 7000, focus: '50% 62%', text: 'Before the first star, before the first word, he was already sitting here.' }],
  },
  void_intro: {
    id: 'void_intro',
    music: { track: 'paranoid_truth', at: 51 },
    title: 'The Black Sun',
    shots: [
      { image: 'bs_spire', motion: 'push-in', ms: 5500, focus: '62% 25%', text: 'At noon a black sun climbed over Aethra, and the sky around it turned the colour of a bruise.' },
      { image: 'bs_cathedral', motion: 'pull-out', ms: 5500, focus: '50% 35%', text: 'Islands of rock tore loose from the earth and rose towards it, carrying their cathedrals with them.' },
      { image: 'bs_eye_isle', motion: 'tilt-up', ms: 6000, text: 'Under the black sun the cultists sing, and the land they sing over begins to rot.' },
      { image: 'bs_vortex', motion: 'push-in', ms: 5500, focus: '50% 45%', text: 'Above it all stands a throne older than the first star. Someone has been sitting on it the whole time.' },
    ],
  },
  void_outro: {
    id: 'void_outro',
    music: { track: 'paranoid_truth', at: 68 },
    title: 'The sun goes out',
    shots: [
      { image: 'bs_crystal', motion: 'push-in', ms: 5500, focus: '55% 55%', text: 'The Creator falls from his throne, and the black sun flickers out like a snuffed candle.' },
      { image: 'bs_eye_isle', motion: 'pan-right', ms: 5500, focus: '50% 40%', text: 'One by one the floating islands sink back towards the earth.' },
      { image: 'bs_citadel', motion: 'push-in', ms: 6000, focus: '68% 35%', text: 'The sky heals slowly. But a sun that has turned black once remembers how.' },
    ],
  },
  aethra_intro: {
    id: 'aethra_intro',
    music: { track: 'paranoid_truth', at: 17 },
    title: 'The Shattering of Aethra',
    shots: [
      { image: 'aethra_valley', motion: 'push-in', ms: 5500, focus: '50% 40%', text: 'For a thousand years the Sundered Crown hung above Aethra and held its wild places in balance.' },
      { image: 'aethra_fairy', motion: 'pan-right', ms: 5500, focus: '60% 40%', text: 'Then the last Sovereign vanished, and the Crown broke into ten thousand Shards.' },
      { image: 'aethra_glade', motion: 'pull-out', ms: 5500, focus: '48% 45%', text: 'They fell through the forests like stars. Wherever one lands, something old wakes up to look at it.' },
      { image: 'aethra_deep_path', motion: 'push-in', ms: 5500, focus: '50% 45%', text: 'You are a newly awakened Warden. Follow the falling Shards, before someone else gathers them.' },
    ],
  },
  aethra_outro: {
    id: 'aethra_outro',
    music: { track: 'paranoid_truth', at: 34 },
    title: 'The last Shard',
    shots: [
      { image: 'aethra_butterflies', motion: 'pull-out', ms: 5500, text: 'The Sundered Crown falls silent, and its last Shard answers only to you.' },
      { image: 'aethra_clearing', motion: 'push-in', ms: 6000, focus: '50% 45%', text: 'Across Aethra the forests grow quiet again. Whatever comes next, it will be written by a Warden.' },
      { image: 'aethra_path', motion: 'pull-out', ms: 5500, focus: '50% 45%', text: 'The road you came by is still there. It always leads to the next story.' },
    ],
  },
  lamp_intro: {
    id: 'lamp_intro',
    music: { track: 'paranoid_truth', at: 85 },
    title: 'The Lamplighters’ Road',
    shots: [
      { image: 'lamp_walkers', motion: 'push-in', ms: 5500, focus: '55% 50%', text: 'For a hundred years the lamplighters walked the Nulwood, and wherever they stopped, the dark stepped back.' },
      { image: 'lamp_waking', motion: 'pan-left', ms: 5500, focus: '50% 50%', text: 'Then Nul woke beneath the roots, and the lanterns began to go out.' },
      { image: 'lamp_ruins', motion: 'pull-out', ms: 5500, focus: '50% 45%', text: 'The wardens of the grove did not die. They changed, and they still keep the road.' },
      { image: 'lamp_chapel', motion: 'push-in', ms: 5500, focus: '50% 45%', text: 'At its end, something reads by the last flame of the wood. And it burns purple.' },
      { image: 'lamp_road', motion: 'push-in', ms: 5000, focus: '52% 60%', text: 'Take up your lantern, Warden. The road is waiting.' },
    ],
  },
  inn_intro: {
    id: 'inn_intro',
    music: { track: 'paranoid_truth', at: 119 },
    title: 'The Wraithwood Inn',
    theme: 'ember',
    shots: [
      { image: 'inn_0', motion: 'push-in', ms: 5500, focus: '45% 55%', text: 'Deep in the Wraithwood stands an inn that is on no map.' },
      { image: 'inn_1', motion: 'pan-left', ms: 6000, text: 'Its lanterns burn all night. The rangers who once guarded the forest came here to rest, and never left.' },
      { image: 'inn_2', motion: 'pull-out', ms: 5500, text: 'Now the dead drink beside the living, and every night the cards are dealt.' },
      { image: 'inn_3', motion: 'pan-right', ms: 5500, text: 'Every guest plays for the card they carry. Beat them, and it is yours.' },
      { image: 'inn_4', motion: 'push-in', ms: 5500, focus: '50% 45%', text: 'A seat is waiting for you, Warden. Deal yourself in.' },
    ],
  },
  inn_outro: {
    id: 'inn_outro',
    music: { track: 'paranoid_truth', at: 136 },
    title: 'Last orders',
    theme: 'ember',
    shots: [
      { image: 'inn_0', motion: 'pull-out', ms: 5500, focus: '45% 55%', text: 'The Hollow Host lays down his last card, and for the first time in a hundred years the inn falls silent.' },
      { image: 'inn_end1', motion: 'push-in', ms: 5500, focus: '52% 55%', text: 'One by one the guests rise from their tables. Their cards are yours now, and so are their stories.' },
      { image: 'inn_end2', motion: 'push-in', ms: 6000, focus: '50% 40%', text: 'Behind you, the lanterns of the Wraithwood light the road home.' },
    ],
  },
  // The Underflame: the way down (intro), the Burning Throne (before Azgaroth) and his death (outro).
  inferno_intro: {
    id: 'inferno_intro',
    music: { track: 'paranoid_truth', at: 154 },
    title: 'The Underflame',
    theme: 'ember',
    shots: [
      { image: 'inf_underflame', motion: 'pull-out', ms: 6000, focus: '50% 60%', text: 'Beneath Aethra, deeper than any root or mine, lies the Underflame: a world of fire that was burning long before the first dawn.' },
      { image: 'inf_vortex', motion: 'push-in', ms: 6000, focus: '55% 35%', text: 'When the Crown shattered, its heaviest Shard did not fall on the land. It fell through it, and the Underflame swallowed it whole.' },
      { image: 'inf_throne', motion: 'push-in', ms: 6500, focus: '60% 30%', text: 'There it found a master. Azgaroth, the Ninth Sovereign, set the Shard in his own crown, and the fires of the deep learned to obey.' },
      { image: 'inf_legions', motion: 'pan-right', ms: 6000, focus: '50% 40%', text: 'Under a red moon he calls his legions to muster: more demons than there are living souls in all of Aethra.' },
      { image: 'inf_march', motion: 'pan-left', ms: 6000, text: 'Above them the ground has begun to crack. Ash falls on the Thornweald, and the Rimetide steams like a kettle.' },
      { image: 'inf_lords', motion: 'push-in', ms: 6000, focus: '50% 30%', text: 'Four lords hold the road to his throne, each at a gate of the deep, each sworn to burn whoever comes down it.' },
      { image: 'inf_root', motion: 'push-in', ms: 6000, focus: '58% 40%', text: 'In the Caldera, a great burning tree has split the earth open. Its root runs all the way down.' },
      { image: 'inf_descent', motion: 'pull-out', ms: 6500, focus: '45% 60%', text: 'Someone has to follow it, Warden. Take your deck, and go down into the fire.' },
    ],
  },
  inferno_throne: {
    id: 'inferno_throne',
    music: { track: 'paranoid_truth', at: 192 },
    title: 'The Burning Throne',
    theme: 'ember',
    shots: [
      { image: 'inf_pyrethrone', motion: 'push-in', ms: 6000, focus: '55% 45%', text: 'At the heart of the Underflame stands Pyrethrone, the citadel Azgaroth raised around the fallen Shard.' },
      { image: 'inf_gate', motion: 'push-in', ms: 5500, focus: '55% 70%', text: 'Its great gate stands open. He has watched you come the whole way down, and he wants you to see him.' },
      { image: 'inf_wyrm_hall', motion: 'pull-out', ms: 5500, focus: '50% 55%', text: 'Through the hall of the chained wyrms, every step hotter than the last…' },
      { image: 'inf_throne_room', motion: 'push-in', ms: 5500, focus: '50% 70%', text: '…to the throne room, where the air itself is on fire.' },
      { image: 'inf_sovereign', motion: 'push-in', ms: 6000, focus: '50% 45%', text: 'Azgaroth rises from his throne: older than fire, crowned with the stolen Shard.' },
      { image: 'inf_face', motion: 'pull-out', ms: 6500, focus: '50% 55%', text: 'Ten thousand years he has waited for someone worth burning. Tonight, it is you.' },
    ],
  },
  heaven_intro: {
    id: 'heaven_intro',
    music: { track: 'paranoid_truth', at: 30 },
    title: 'The Twin Oath',
    shots: [
      { image: 'hv_sky_isles', motion: 'push-in', ms: 7000, focus: '50% 45%', text: 'Above the clouds of Aethra lies the Empyrean, home of the Host, who forged the Crown at the dawn of the world.' },
      { image: 'hv_celestial_city', motion: 'pan-right', ms: 7000, focus: '55% 40%', text: 'For a thousand years the Host kept the Crown whole and the sky open. Its rivers ran down to Aethra, and Aethra prayed upward.' },
      { image: 'hv_host_rising', motion: 'push-in', ms: 7000, focus: '50% 35%', text: 'When the Crown shattered, the Arbiter weighed the world below and found it wanting. The sky was sealed, and the Host stopped singing.' },
      { image: 'hv_war_banners', motion: 'pull-out', ms: 7000, focus: '50% 40%', text: 'Now its legions gather on the clouds. When they come down, they will not come to save Aethra. They will come to end it.' },
      { image: 'hv_radiant_door', motion: 'push-in', ms: 8000, focus: '50% 45%', text: 'Only the Pearl Gate still shines, at the top of the Rainbow Stair. Heaven’s law hears no lone voice, so two Wardens swear one oath and climb toward it together.' },
    ],
  },
  heaven_tribunal: {
    id: 'heaven_tribunal',
    music: { track: 'paranoid_truth', at: 150 },
    title: 'The Tribunal',
    shots: [
      { image: 'hv_falls_of_heaven', motion: 'push-in', ms: 6000, focus: '62% 45%', text: 'Above the seventh sky the rivers of heaven fall into nothing, and at their head stands the Tribunal.' },
      { image: 'hv_rainbow_halls', motion: 'push-in', ms: 6500, focus: '50% 45%', text: 'Two halls face each other across the light, one for the accused and one for the witness. Between them the Arbiter waits with his scales.' },
    ],
  },
  heaven_outro: {
    id: 'heaven_outro',
    music: { track: 'paranoid_truth', at: 90 },
    title: 'The Open Sky',
    shots: [
      { image: 'hv_gates_open', motion: 'push-in', ms: 6500, focus: '50% 40%', text: 'The scales break, and the Arbiter falls silent for ever. For the first time since the Crown shattered, the gates of heaven swing open.' },
      { image: 'hv_kneel', motion: 'push-in', ms: 6500, focus: '50% 35%', text: 'Light pours down the Rainbow Stair, and one by one the knights of the Host lower their swords.' },
      { image: 'hv_hymn', motion: 'pull-out', ms: 7500, focus: '50% 35%', text: 'Somewhere above, the choirs begin to sing again, and the rivers of the Empyrean flow down to Aethra once more. Two voices were enough.' },
    ],
  },
  inferno_outro: {
    id: 'inferno_outro',
    music: { track: 'paranoid_truth', at: 60 },
    title: 'The Last Fire',
    theme: 'ember',
    shots: [
      { image: 'inf_last_wings', motion: 'pull-out', ms: 6000, focus: '50% 40%', text: 'Azgaroth spreads his wings one last time over the river of fire, and falls.' },
      { image: 'inf_eruption', motion: 'push-in', ms: 5500, focus: '62% 40%', text: 'As the Shard tears free of his crown, the mountain beneath his throne splits open.' },
      { image: 'inf_fall', motion: 'pan-right', ms: 5500, focus: '50% 40%', text: 'Pyrethrone’s towers crack, and its falls of fire run dry.' },
      { image: 'inf_dead_king', motion: 'push-in', ms: 7000, focus: '50% 45%', text: 'The Ninth Sovereign lies dead in the flames that once obeyed him. For the first time since the world began, the Underflame has no king.' },
      { image: 'inf_scatter', motion: 'pan-left', ms: 6000, text: 'Without his voice his legions scatter like sparks into the dark, and the cracks in the world above slowly close.' },
      { image: 'inf_return', motion: 'pull-out', ms: 6500, focus: '30% 75%', text: 'You climb back toward the light with the Shard in your hand. Behind you the deep is quiet, for now.' },
    ],
  },
  lamp_outro: {
    id: 'lamp_outro',
    music: { track: 'paranoid_truth', at: 102 },
    title: 'The road is lit',
    shots: [
      { image: 'lamp_chapel', motion: 'pull-out', ms: 5500, focus: '50% 45%', text: 'The last page is turned, and the purple flame in the old chapel burns down to nothing.' },
      { image: 'lamp_glow', motion: 'pan-right', ms: 5500, focus: '30% 60%', text: 'One by one, warm lights wake again between the roots of the old road.' },
      { image: 'lamp_waking', motion: 'pull-out', ms: 5500, text: 'The Nulwood sleeps. Somewhere beneath it, Nul is still dreaming.' },
    ],
  },
};
