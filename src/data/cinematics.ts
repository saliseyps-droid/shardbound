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
      { image: 'aethra_path', motion: 'push-in', ms: 5500, focus: '50% 45%', text: 'For a thousand years the Sundered Crown hung above Aethra and held its wild places in balance.' },
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
