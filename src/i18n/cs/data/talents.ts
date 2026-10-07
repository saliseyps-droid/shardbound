import type { TalentsOverlay } from '../../overlayTypes';

/** Warden talents: name, rules text per rank (I, II, III) and what ranks II and III change. */
const talents: TalentsOverlay = {
  // Cinder Legion
  wt_ember_cinder_bolt: {
    name: 'Popelavý šíp',
    levels: [
      'Způsob 1 poškození nepříteli.',
      'Způsob 1 poškození nepříteli a uděl mu Hoření 1.',
      'Způsob 1 poškození nepříteli a uděl mu Hoření 1.',
    ],
    upgradeNotes: ['Navíc udělí Hoření 1.', 'Cena 2 → 1.'],
  },
  wt_ember_kindled_fury: {
    name: 'Rozdmýchaný hněv',
    levels: [
      'Na začátku tvého tahu dej náhodné spřátelené jednotce +1 k útoku.',
      'Na začátku tvého tahu dej náhodné spřátelené jednotce +1/+1.',
      'Na začátku tvého tahu dej náhodné spřátelené jednotce +2/+1.',
    ],
    upgradeNotes: ['+1 k útoku → +1/+1.', '+1/+1 → +2/+1.'],
  },
  wt_ember_imp_summoning: {
    name: 'Vyvolání skřeta',
    levels: [
      'Vyvolej Žhavého skřeta 2/1.',
      'Vyvolej Žhavého skřeta 2/1.',
      'Vyvolej Žhavého skřeta 2/1 a způsob 1 poškození nepřátelskému Strážci.',
    ],
    upgradeNotes: ['Cena 3 → 2.', 'Navíc způsobí 1 poškození nepřátelskému Strážci.'],
  },
  wt_ember_searing_wrath: {
    name: 'Spalující zloba',
    levels: [
      'Kdykoli sešleš kouzlo, způsob 1 poškození nepřátelskému Strážci. Jednou za tah.',
      'Kdykoli sešleš kouzlo, způsob 1 poškození nepřátelskému Strážci. Dvakrát za tah.',
      'Kdykoli sešleš kouzlo, způsob 1 poškození nepřátelskému Strážci a 1 poškození náhodné nepřátelské jednotce. Dvakrát za tah.',
    ],
    upgradeNotes: ['Spustí se dvakrát za tah.', 'Navíc zasáhne náhodnou nepřátelskou jednotku za 1.'],
  },
  wt_ember_warcry: {
    name: 'Válečný pokřik',
    levels: [
      'Dej spřátelené jednotce v tomto tahu +2 k útoku.',
      'Dej spřátelené jednotce v tomto tahu +2 k útoku a Výpad.',
      'Dej spřátelené jednotce v tomto tahu +2 k útoku a Výpad.',
    ],
    upgradeNotes: ['Navíc udělí Výpad.', 'Cena 2 → 1.'],
  },

  // Thornweald Circle
  wt_verdant_sap_of_the_root: {
    name: 'Míza z kořene',
    levels: [
      'Obnov 2 životy spřátelené postavě.',
      'Obnov 3 životy spřátelené postavě.',
      'Obnov 4 životy spřátelené postavě.',
    ],
    upgradeNotes: ['Obnoví 3 místo 2.', 'Obnoví 4 místo 3.'],
  },
  wt_verdant_sprout: {
    name: 'Výhonek',
    levels: [
      'Vyvolej Semenáček 1/2.',
      'Vyvolej Semenáček 1/2 a obnov 1 život tvému Strážci.',
      'Vyvolej Semenáček 1/2 a obnov 1 život tvému Strážci.',
    ],
    upgradeNotes: ['Navíc obnoví 1 život tvému Strážci.', 'Cena 2 → 1.'],
  },
  wt_verdant_wellspring: {
    name: 'Pramen',
    levels: [
      'Na konci tvého tahu obnov 1 život všem spřáteleným postavám.',
      'Na konci tvého tahu obnov 1 život všem spřáteleným postavám a tvému Strážci ještě 1 navíc.',
      'Na konci tvého tahu obnov 2 životy všem spřáteleným postavám.',
    ],
    upgradeNotes: ['Tvůj Strážce dostane 1 život navíc.', 'Obnoví 2 všem.'],
  },
  wt_verdant_barkskin: {
    name: 'Kůra místo kůže',
    levels: [
      'Když poprvé v tahu vyvoláš jednotku, dej jí +0/+1.',
      'Když poprvé v tahu vyvoláš jednotku, dej jí +0/+2.',
      'Když poprvé a podruhé v tahu vyvoláš jednotku, dej jí +1/+2.',
    ],
    upgradeNotes: ['+0/+1 → +0/+2.', '+1/+2 a funguje dvakrát za tah.'],
  },
  wt_verdant_thornguard: {
    name: 'Trnová stráž',
    levels: [
      'Dej spřátelené jednotce +0/+2 a Stráž.',
      'Dej spřátelené jednotce +0/+2 a Stráž.',
      'Dej spřátelené jednotce +1/+3 a Stráž.',
    ],
    upgradeNotes: ['Cena 3 → 2.', '+0/+2 → +1/+3.'],
  },

  // Brass Dominion
  wt_iron_rivet_plating: {
    name: 'Nýtované plátování',
    levels: [
      'Získej 2 brnění.',
      'Získej 3 brnění.',
      'Získej 3 brnění, nebo 4, pokud ovládáš Konstrukt.',
    ],
    upgradeNotes: ['Získáš 3 brnění místo 2.', '+1 brnění, dokud ovládáš Konstrukt.'],
  },
  wt_iron_assemble: {
    name: 'Sestavení',
    levels: [
      'Vyvolej Šrotobota 1/1.',
      'Vyvolej Šrotobota 1/1 a získej 1 brnění.',
      'Vyvolej dva Šrotoboty 1/1.',
    ],
    upgradeNotes: ['Navíc získáš 1 brnění.', 'Místo toho vyvolá dva Šrotoboty (bez brnění); cena 3 → 4.'],
  },
  wt_iron_reinforced_hull: {
    name: 'Zesílený trup',
    levels: [
      'Na konci tvého tahu získej 1 brnění.',
      'Na konci tvého tahu získej 2 brnění.',
      'Na konci tvého tahu získej 2 brnění, nebo 3, pokud ovládáš Konstrukt.',
    ],
    upgradeNotes: ['Získáš 2 brnění místo 1.', '+1 brnění, dokud ovládáš Konstrukt.'],
  },
  wt_iron_assembly_protocol: {
    name: 'Montážní protokol',
    levels: [
      'Kdykoli vyvoláš Konstrukt, dej mu +1/+0. Dvakrát za tah.',
      'Kdykoli vyvoláš Konstrukt, dej mu +1/+0 a získej 1 brnění. Dvakrát za tah.',
      'Kdykoli vyvoláš Konstrukt, dej mu +1/+1 a získej 1 brnění. Dvakrát za tah.',
    ],
    upgradeNotes: ['Navíc získáš 1 brnění.', '+1/+0 → +1/+1.'],
  },
  wt_iron_overclock: {
    name: 'Přetaktování',
    levels: [
      'Dej spřátelené jednotce +1/+1.',
      'Dej spřátelené jednotce +1/+1.',
      'Dej spřátelené jednotce +2/+1.',
    ],
    upgradeNotes: ['Cena 3 → 2.', '+1/+1 → +2/+1.'],
  },

  // Lumen Conclave
  wt_astral_starlit_insight: {
    name: 'Hvězdný vhled',
    levels: [
      'Přidej si do ruky Jiskru vhledu.',
      'Přidej si do ruky Jiskru vhledu.',
      'Způsob 1 poškození náhodnému nepříteli. Přidej si do ruky Jiskru vhledu.',
    ],
    upgradeNotes: ['Cena 2 → 1.', 'Navíc způsobí 1 poškození náhodnému nepříteli.'],
  },
  wt_astral_arcane_volley: {
    name: 'Tajemná salva',
    levels: [
      'Dvakrát způsob 1 poškození náhodnému nepříteli.',
      'Třikrát způsob 1 poškození náhodnému nepříteli.',
      'Čtyřikrát způsob 1 poškození náhodnému nepříteli.',
    ],
    upgradeNotes: ['Tři střely místo dvou.', 'Čtyři střely místo tří.'],
  },
  wt_astral_spellweave: {
    name: 'Tkaní kouzel',
    levels: [
      'Kdykoli sešleš kouzlo, dej náhodné spřátelené jednotce +1/+1.',
      'Kdykoli sešleš kouzlo, dej náhodné spřátelené jednotce +1/+1 a obnov 2 životy tvému Strážci.',
      'Kdykoli sešleš kouzlo, dvakrát dej náhodné spřátelené jednotce +1/+1 a obnov 2 životy tvému Strážci.',
    ],
    upgradeNotes: ['Navíc obnoví 2 životy tvému Strážci.', '+1/+1 se udělí dvakrát.'],
  },
  wt_astral_foresight: {
    name: 'Prozíravost',
    levels: [
      'Na konci tvého tahu si lízni kartu, pokud máš v ruce 1 kartu nebo méně.',
      'Na konci tvého tahu si lízni kartu, pokud máš v ruce 2 karty nebo méně.',
      'Na konci tvého tahu si lízni kartu, pokud máš v ruce 3 karty nebo méně.',
    ],
    upgradeNotes: ['Funguje až se 2 kartami v ruce.', 'Funguje až se 3 kartami v ruce.'],
  },
  wt_astral_star_fragment: {
    name: 'Hvězdný úlomek',
    levels: [
      'Vyvolej Hvězdný úlomek 1/1 (Posílení 1).',
      'Vyvolej Hvězdný úlomek 1/1 (Posílení 1).',
      'Vyvolej dva Hvězdné úlomky 1/1 (Posílení 1).',
    ],
    upgradeNotes: ['Cena 2 → 1.', 'Vyvolá dva Úlomky (cena zpět na 2).'],
  },

  // Hollow Choir
  wt_void_hollow_summons: {
    name: 'Prázdné vyvolání',
    levels: [
      'Vyvolej Prázdnou světlušku 1/1.',
      'Vyvolej Povstalé kosti 2/2.',
      'Vyvolej Povstalé kosti 2/2.',
    ],
    upgradeNotes: ['Místo toho vyvolá Povstalé kosti 2/2.', 'Stojí 2.'],
  },
  wt_void_soul_harvest: {
    name: 'Žeň duší',
    levels: [
      'Kdykoli zemře spřátelená jednotka, způsob 1 poškození nepřátelskému Strážci. Dvakrát za tah.',
      'Kdykoli zemře spřátelená jednotka, způsob 1 poškození nepřátelskému Strážci a obnov 1 život tomu svému. Dvakrát za tah.',
      'Kdykoli zemře spřátelená jednotka, způsob 1 poškození nepřátelskému Strážci a obnov 1 život tomu svému. Až třikrát za tah.',
    ],
    upgradeNotes: ['Navíc obnoví 1 život tvému Strážci.', 'Až třikrát za tah.'],
  },
  wt_void_blood_price: {
    name: 'Krvavá daň',
    levels: [
      'Způsob 3 poškození tvému Strážci. Lízni si kartu.',
      'Způsob 2 poškození tvému Strážci. Lízni si kartu.',
      'Způsob 2 poškození tvému Strážci. Lízni si kartu.',
    ],
    upgradeNotes: ['Poškození sobě 3 → 2.', 'Cena 1 → 0.'],
  },
  wt_void_grave_pact: {
    name: 'Hrobový pakt',
    levels: [
      'Znič spřátelenou jednotku. Lízni si kartu.',
      'Znič spřátelenou jednotku. Lízni si kartu a způsob 2 poškození náhodnému nepříteli.',
      'Znič spřátelenou jednotku. Lízni si kartu a způsob 2 poškození náhodnému nepříteli.',
    ],
    upgradeNotes: ['Navíc způsobí 2 poškození náhodnému nepříteli.', 'Cena 2 → 1.'],
  },
  wt_void_unending: {
    name: 'Nekonečný',
    levels: [
      'Na konci tvého tahu, pokud v tomto tahu zemřela spřátelená jednotka, vyvolej Prázdnou světlušku 1/1.',
      'Na konci tvého tahu, pokud v tomto tahu zemřela spřátelená jednotka, vyvolej Prázdnou světlušku 1/1 a obnov 2 životy tvému Strážci.',
      'Na konci tvého tahu, pokud v tomto tahu zemřela spřátelená jednotka, vyvolej Povstalé kosti 2/2 a obnov 2 životy tvému Strážci.',
    ],
    upgradeNotes: ['Navíc obnoví 2 životy tvému Strážci.', 'Místo světlušky vyvolá Povstalé kosti.'],
  },

  // Rimetide Court
  wt_tide_rime_touch: {
    name: 'Dotek jinovatky',
    levels: [
      'Způsob 1 poškození nepřátelské jednotce a Zmraz ji.',
      'Způsob 1 poškození nepřátelské jednotce a Zmraz ji.',
      'Způsob 2 poškození nepřátelské jednotce a Zmraz ji.',
    ],
    upgradeNotes: ['Cena 2 → 1.', 'Způsobí 2 poškození místo 1.'],
  },
  wt_tide_undertow: {
    name: 'Spodní proud',
    levels: [
      'Vrať nepřátelskou jednotku, která stojí 3 nebo méně, do ruky jejího vlastníka. Lze použít jen ob tah.',
      'Vrať nepřátelskou jednotku, která stojí 3 nebo méně, do ruky jejího vlastníka. Lze použít jen ob tah.',
      'Vrať nepřátelskou jednotku, která stojí 4 nebo méně, do ruky jejího vlastníka. Lze použít jen ob tah.',
    ],
    upgradeNotes: ['Cena 3 → 2.', 'Zasáhne jednotky s cenou až 4.'],
  },
  wt_tide_cold_snap: {
    name: 'Náhlý mráz',
    levels: [
      'Na začátku tvého tahu, pokud máš v ruce 3 karty nebo méně, přidej si do ruky Pomíjivou kartu Střep jinovatky.',
      'Na začátku tvého tahu, pokud máš v ruce 4 karty nebo méně, přidej si do ruky Střep jinovatky.',
      'Na začátku tvého tahu, pokud máš v ruce 6 karet nebo méně, přidej si do ruky Střep jinovatky.',
    ],
    upgradeNotes: ['Až 4 karty v ruce a karta už není Pomíjivá.', 'Funguje až se 6 kartami v ruce.'],
  },
  wt_tide_tidepool: {
    name: 'Přílivová tůň',
    levels: [
      'Vyvolej Přílivové štěně 1/2.',
      'Vyvolej Přílivové štěně 1/2, obnov 2 životy tvému Strážci a Zmraz náhodnou nepřátelskou jednotku.',
      'Vyvolej Přílivové štěně 1/2, obnov 2 životy tvému Strážci a Zmraz náhodnou nepřátelskou jednotku.',
    ],
    upgradeNotes: ['Navíc obnoví 2 životy a Zmrazí náhodnou nepřátelskou jednotku.', 'Cena 2 → 1.'],
  },
  wt_tide_whirlpool: {
    name: 'Vír',
    levels: [
      'Kdykoli sešleš kouzlo, Zmraz náhodnou nepřátelskou jednotku. Jednou za tah.',
      'Kdykoli sešleš kouzlo, Zmraz náhodnou nepřátelskou jednotku a způsob 1 poškození náhodné nepřátelské jednotce. Jednou za tah.',
      'Kdykoli sešleš kouzlo, Zmraz náhodnou nepřátelskou jednotku a způsob 1 poškození náhodné nepřátelské jednotce. Dvakrát za tah.',
    ],
    upgradeNotes: ['Navíc způsobí 1 poškození náhodné nepřátelské jednotce.', 'Spustí se dvakrát za tah.'],
  },

  // Bosses
  wt_boss_caldera_eruption: { name: 'Erupce kaldery', levels: ['Způsob 1 poškození všem nepřátelům.'] },
  wt_boss_crushing_depths: { name: 'Drtivé hlubiny', levels: ['Vrať náhodnou nepřátelskou jednotku do ruky jejího vlastníka.'] },
  wt_boss_requiem_chorus: { name: 'Chór rekviem', levels: ['Vyvolej dvě Prázdné světlušky 1/1.'] },
  wt_boss_crown_fragment: { name: 'Úlomek Koruny', levels: ['Lízni si kartu a získej 2 brnění.'] },
  wt_boss_oath_of_cinders: { name: 'Přísaha popela', levels: ['Způsob 2 poškození náhodnému nepříteli.'] },
  wt_boss_black_tide: { name: 'Černý příliv', levels: ['Zmraz náhodnou nepřátelskou jednotku a získej 2 brnění.'] },
  wt_boss_soul_pyre: { name: 'Hranice duší', levels: ['Způsob 2 poškození nepřátelskému Strážci a vyleč svému 2 životy.'] },
  wt_boss_drake_brood: { name: 'Dračí plod', levels: ['Vyvolej Popelavého dráčka 2/2 se Spěchem.'] },
  wt_boss_siege_protocol: { name: 'Obléhací protokol', levels: ['Vyvolej Mosaznou hlídku 2/3 se Stráží a získej 2 brnění.'] },
  wt_boss_frozen_hymn: { name: 'Zamrzlá hymna', levels: ['Zmraz všechny nepřátelské jednotky.'] },
  wt_boss_starfall: { name: 'Pád hvězd', levels: ['Způsob 3 poškození náhodnému nepříteli.'] },
  wt_boss_last_shard: { name: 'Poslední Střep', levels: ['Lízni si kartu a způsob 2 poškození náhodnému nepříteli.'] },
  wt_boss_shadow_muster: { name: 'Stínový nábor', levels: ['Vyvolej dvoje Povstalé kosti 2/2.'] },
};

export default talents;
