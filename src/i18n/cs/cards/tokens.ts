import type { CardsOverlay } from '../../overlayTypes';

/** Tokens and tutorial cards. These names are referenced by other cards' rules text. */
const cards: CardsOverlay = {
  token_aether_shard: { name: 'Éterový střep', description: 'Získej v tomto tahu 1 energii.', flavorText: 'Úlomek Koruny, který bzučí vypůjčeným časem.' },
  token_mote_insight: { name: 'Jiskra vhledu', description: 'Způsob 1 poškození náhodnému nepříteli. Pokud jsi v tomto tahu seslal 2 nebo více kouzel, lízni si kartu.' },
  token_hollow_wisp: { name: 'Prázdná světluška' },
  token_ember_imp: { name: 'Žhavý skřet' },
  token_sapling: { name: 'Semenáček' },
  token_treant: { name: 'Prastarý stromovous', description: 'Stráž.' },
  token_wolf: { name: 'Trnosrstý vlk', description: 'Výpad.' },
  token_scrapbot: { name: 'Šrotobot' },
  token_sentry: { name: 'Mosazná hlídka', description: 'Stráž.' },
  token_star_fragment: { name: 'Hvězdný úlomek', description: 'Posílení 1.' },
  token_skeleton: { name: 'Povstalé kosti' },
  token_horror: { name: 'Prázdná hrůza' },
  token_ice_shard: { name: 'Střep jinovatky', description: 'Způsob 1 poškození nepřátelské jednotce. Zmraz nepřátelskou jednotku.' },
  token_tidepup: { name: 'Přílivové štěně' },
  token_frog: { name: 'Bažinná ropucha' },
  token_deckhand: { name: 'Plavčík' },
  token_recruit: { name: 'Rekrut z karavany' },
  token_drakeling: { name: 'Popelavý dráček', description: 'Spěch.' },
  token_golem: { name: 'Obléhací golem', description: 'Stráž.' },
  token_kraken_tentacle: { name: 'Svírající chapadlo', description: 'Stráž.' },
  token_unknown: { name: 'Neznámá karta' },
  tut_squire: { name: 'Panoš Střepu' },
  tut_knight: { name: 'Rytíř korunní stráže' },
  tut_bolt: { name: 'Jiskrový šíp', description: 'Způsob 2 poškození postavě.' },
  tut_dummy: { name: 'Cvičná figurína', description: 'Stráž.' },
  tut_goblin: { name: 'Šrotový goblin' },
};

export default cards;
