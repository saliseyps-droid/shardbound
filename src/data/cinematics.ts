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
  shots: CinematicShot[];
}

export const CINEMATICS: Record<string, CinematicDef> = {
  lamp_intro: {
    id: 'lamp_intro',
    title: 'The Lamplighters’ Road',
    shots: [
      { image: 'lamp_road', motion: 'push-in', ms: 5500, text: 'For a hundred years, the lamplighters kept a road of light through the Nulwood.' },
      { image: 'lamp_waking', motion: 'pan-left', ms: 5000, text: 'Then Nul woke beneath the roots, and the lanterns began to go out.' },
      { image: 'lamp_torn_sky', motion: 'pull-out', ms: 5000, text: 'The sky tore open, and the grove itself began to change.' },
      { image: 'lamp_purple_flame', motion: 'push-in', ms: 5500, focus: '56% 40%', text: 'Now something else carries the last flame of the wood. And it burns purple.' },
      { image: 'lamp_call', motion: 'push-in', ms: 5000, focus: '58% 55%', text: 'Take up your lantern, Warden. The road is waiting.' },
    ],
  },
  lamp_outro: {
    id: 'lamp_outro',
    title: 'The road is lit',
    shots: [
      { image: 'lamp_eye_closing', motion: 'push-in', ms: 5500, focus: '57% 30%', text: 'The last page is turned, and the eye above the grove begins to close.' },
      { image: 'lamp_light', motion: 'pull-out', ms: 5500, focus: '50% 25%', text: 'One by one, the lanterns of the old road catch fire again.' },
      { image: 'lamp_waking', motion: 'pan-right', ms: 5500, text: 'The Nulwood sleeps. Somewhere beneath it, Nul is still dreaming.' },
    ],
  },
};
