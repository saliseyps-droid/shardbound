import type { CardsOverlay } from '../../overlayTypes';

const cards: CardsOverlay = {
  tid_frostfin_scout: { name: 'Mrazoploutvý zvěd', description: 'Při nasazení: Zmraz nepřátelskou jednotku.', flavorText: 'Mihne se pod ledem a zanechá za sebou stopu jinovatky.' },
  tid_rimebound_acolyte: { name: 'Akolyta spoutaný jinovatkou', flavorText: 'Novicové Dvora stráví rok pod ledem, než smějí promluvit.' },
  tid_chill_snap: { name: 'Náhlý mráz', description: 'Zmraz nepřátelskou jednotku. Lízni si kartu.', flavorText: 'Moře si pamatuje každou teplou věc, kterou kdy utišilo.' },
  tid_tidecaller_eel: { name: 'Úhoř volající příliv', description: 'Léčka.', flavorText: 'Než zahlédneš vlnku, už udeřil.' },
  tid_drowned_sentinel: { name: 'Utonulý hlídač', description: 'Stráž.', flavorText: 'Jeho přísaha přežila jeho plíce.' },
  tid_frost_lance: { name: 'Mrazivé kopí', description: 'Způsob 2 poškození nepřátelské jednotce. Pokud je Zmrazená, způsob 2 další.', flavorText: 'Zmrzlé maso se tříští tak krásně.' },
  tid_riptide_reaver: { name: 'Pustošitel zpětného proudu', description: 'Při nasazení: Vrať nepřátelskou jednotku s cenou 3 nebo méně do ruky jejího vlastníka.', flavorText: 'Proud si vezme, na co Pustošitel ukáže.' },
  tid_glacier_hulk: { name: 'Ledovcový obr', description: 'Při nasazení: Zmraz náhodnou nepřátelskou jednotku.', flavorText: 'Tisíc zim, které dostaly nohy a zášť.' },
  tid_wavebreaker_bard: { name: 'Bard lamač vln', description: 'Při nasazení: Vrať jinou spřátelenou jednotku do ruky jejího vlastníka. Bude stát o (1) méně.', flavorText: '„Příliv ustupuje, aby se vrátil silnější. Zazpívej to znovu, příteli.“' },
  tid_hailstorm: { name: 'Krupobití', description: 'Způsob 1 poškození všem nepřátelským jednotkám. Zmraz všechny nepřátelské jednotky.', flavorText: 'Každá jeho kroupa bývala kapkou Jinovatého moře.' },
  tid_shivering_harpooner: { name: 'Roztřesený harpunář', description: 'Při nasazení: Způsob 3 poškození Zmrazené nepřátelské jednotce.', flavorText: 'Nehybné cíle jsou snadné trofeje.' },
  tid_undertow_smuggler: { name: 'Pašeračka spodního proudu', description: 'Při nasazení: Ukradni náhodnou kartu z balíčku protivníka.', flavorText: 'Co se potopí, to najde. Co plave, to najde ještě rychleji.' },
  tid_icebound_oracle: { name: 'Věštkyně spoutaná ledem', description: 'Na konci tvého tahu Zmraz náhodnou nepřátelskou jednotku.', flavorText: 'Tvůj útok předvídala. Už ho zastavila.' },
  tid_rimed_tide_bell: { name: 'Ojíněný přílivový zvon', description: 'Na začátku tvého tahu Zmraz náhodnou nepřátelskou jednotku. Náboje: 3.', flavorText: 'Když zazvoní, vlny se zastaví a naslouchají.' },
  tid_shatterpoint: { name: 'Bod roztříštění', description: 'Pokud je nepřátelská jednotka Zmrazená, znič ji. Jinak ji Zmraz.', flavorText: 'Jediné ťuknutí, přesně na správném místě.' },
  tid_tidal_recall: { name: 'Návrat přílivu', description: 'Vrať spřátelenou jednotku do své ruky. Bude stát o (2) méně. Lízni si kartu.', flavorText: 'Moře vrací, co si vypůjčí – dřív nebo později.' },
  tid_floe_lancer: { name: 'Kopiník ledových ker', description: 'Výpad. Kdykoli tato jednotka zaútočí, Zmraz náhodnou nepřátelskou jednotku.', flavorText: 'Její kopí je vyřezané z jediného rampouchu, který nikdy neroztaje.' },
  tid_the_drowned_court: { name: 'Utonulý dvůr', description: 'Na začátku tvého tahu Zmraz náhodnou nepřátelskou jednotku. Lízni si kartu. Trvá 3 tahy.', flavorText: 'Pod ledem jsou trůny stále obsazené.' },
  tid_deep_winter: { name: 'Hluboká zima', description: 'Zmraz všechny nepřátelské jednotky. Lízni si kartu za každou Zmrazenou nepřátelskou jednotku (až 3).', flavorText: 'Není to roční období. Je to rozsudek.' },
  tid_undertow_maelstrom: { name: 'Vír spodního proudu', description: 'Vrať všechny jednotky do rukou jejich vlastníků.', flavorText: 'Moře si vezme všechno zpátky. Všechno.' },
  tid_tidewitch_of_the_rime: { name: 'Přílivová čarodějka jinovatky', description: 'Léčka. Kdykoli zemře nepřátelská jednotka, přidej si do ruky Střep jinovatky.', flavorText: 'Každá duše, kterou utopí, se stane ledovou třískou pro tu příští.' },
  tid_ysolde: { name: 'Ysolde, Ojíněná vládkyně', description: 'Při nasazení: Zmraz všechny nepřátelské jednotky. Pak způsob 2 poškození nepřátelskému Strážci za každou Zmrazenou nepřátelskou jednotku.', flavorText: 'Královna dvora, který už tisíc let nevydechl.' },
  tid_skolky: { name: 'Skolky', description: 'Při nasazení: Zmraz všechny nepřátelské jednotky. Poslední dech: Vrať náhodnou nepřátelskou jednotku do ruky jejího vlastníka.', flavorText: 'Čte chlad tak, jako jiní čtou hvězdy, a chlad mu vždycky odpoví.' },
  tid_morrowgast: { name: 'Morrowgast, Leviatan z hlubin', description: 'Při nasazení: Vrať 2 náhodné nepřátelské jednotky do ruky jejich vlastníka. Vyvolej dvě Svírající chapadla 1/1 se Stráží.', flavorText: 'Když se vynoří, zvedne se s ním i obzor.' },
};

export default cards;
