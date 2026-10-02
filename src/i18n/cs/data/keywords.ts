import type { KeywordsOverlay } from '../../overlayTypes';

const keywords: KeywordsOverlay = {
  GUARD: { name: 'Stráž', definition: 'Nepřátelé musí nejdřív zaútočit na jednotky se Stráží, než mohou útočit na cokoli jiného.' },
  RUSH: { name: 'Výpad', definition: 'Může útočit na nepřátelské jednotky už v tahu, kdy byla nasazena.' },
  SWIFT: { name: 'Spěch', definition: 'Může útočit na cokoli už v tahu, kdy byla nasazena.' },
  DRAIN: { name: 'Vysátí', definition: 'Poškození, které tato jednotka způsobí, zároveň obnoví stejný počet životů tvému Strážci.' },
  BARRIER: { name: 'Bariéra', definition: 'Když by tato jednotka poprvé utrpěla poškození, zabraň mu a odstraň Bariéru.' },
  AMBUSH: { name: 'Léčka', definition: 'Nepřátelé na ni nemohou útočit ani ji zaměřit, dokud sama nezaútočí nebo nezpůsobí poškození.' },
  WARD: { name: 'Ochrana', definition: 'Nemůže být cílem nepřátelských kouzel ani schopností Strážce.' },
  FRENZY: { name: 'Zuřivost', definition: 'Může útočit dvakrát za tah.' },
  VENOM: { name: 'Jed', definition: 'Jakékoli poškození, které tato jednotka způsobí jednotce, ji zničí.' },
  REGENERATE: { name: 'Regenerace', definition: 'Na konci tvého tahu si tato jednotka obnoví všechny životy.' },
  EMPOWER: { name: 'Posílení', definition: 'Tvá útočná kouzla způsobí navíc tolik poškození, kolik je hodnota Posílení.' },
  ECHO: { name: 'Ozvěna', definition: 'Až tuto kartu zahraješ, přidej si do ruky její Pomíjivou kopii (bez Ozvěny).' },
  FLEETING: { name: 'Pomíjivá', definition: 'Tato karta se na konci tvého tahu odhodí z ruky.', aliases: ['Pomíjivou', 'Pomíjivé'] },
  ON_DEPLOY: { name: 'Při nasazení', definition: 'Spustí se, když tuto kartu zahraješ z ruky.' },
  LAST_BREATH: { name: 'Poslední dech', definition: 'Spustí se, když tato jednotka zemře.' },
  OVERCHARGE: { name: 'Přebití', definition: 'Pokud ti po zahrání zbyde aspoň X nevyužité energie, utrať X a odemkni bonusový efekt.' },
  BURN: { name: 'Hoření', definition: 'Na začátku tahu svého ovladatele utrpí hořící jednotka poškození rovné svému Hoření, pak Hoření klesne o 1.', aliases: ['Hořící'] },
  FREEZE: {
    name: 'Zmrazení',
    definition: 'Zmrazená jednotka nemůže útočit během příštího tahu svého ovladatele.',
    aliases: ['Zmraz', 'Zmrazí', 'Zmrazený', 'Zmrazená', 'Zmrazenou', 'Zmrazené', 'Zmrazených', 'zmraz', 'zmrazí', 'zmrazený', 'zmrazená', 'zmrazenou', 'zmrazené', 'zmrazených'],
  },
};

export default keywords;
