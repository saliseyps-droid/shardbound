import type { CardsOverlay } from '../../overlayTypes';

/** Wanderers (Neutral) cards. */
const cards: CardsOverlay = {
  neu_trail_hound: { name: 'Stopařský pes', flavorText: 'Každá karavana má jednoho. Ty chytré mají dva.' },
  neu_caravan_sellsword: { name: 'Žoldák z karavany', flavorText: 'Platí ho liga, ne nepřítel.' },
  neu_hedge_mage: { name: 'Mág samouk', description: 'Při nasazení: Způsob 1 poškození postavě.', flavorText: 'Samouk, špatně placený a překvapivě přesný.' },
  neu_oathbound_shieldbearer: { name: 'Přísahou vázaná štítonoška', description: 'Stráž.', flavorText: 'Přísahala, že bude chránit cestu. Ta cesta je hodně dlouhá.' },
  neu_wandering_cartographer: { name: 'Putující kartografka', description: 'Při nasazení: Lízni si kartu.', flavorText: 'Její mapy ukazují, kam dopadly Střepy. Za příslušný poplatek.' },
  neu_wayfarer_captain: { name: 'Kapitán pocestných', description: 'Při nasazení: Vyvolej Rekruta z karavany 1/1.', flavorText: '„Drž krok, rekrute. Cesta na nikoho nečeká.“' },
  neu_stonehide_ox: { name: 'Kamenokožý vůl', flavorText: 'Táhne karavanu. A když se chytnou, táhne i bandity.' },
  neu_crag_colossus: { name: 'Skalní kolos', description: 'Stráž.', flavorText: 'Hora se probudila. Hora je naštvaná.' },
  neu_bog_toadcaller: { name: 'Bažinný svolavač ropuch', description: 'Poslední dech: Vyvolej 2 Bažinné ropuchy (0/1).', flavorText: 'Nikdo neví, odkud se ty ropuchy berou. Nikdo se nechce ptát.' },
  neu_dune_cutpurse: { name: 'Pouštní kapsář', description: 'Léčka.', flavorText: 'Že ti chybí měšec, si všimneš zhruba ve stejnou chvíli jako nože.' },
  neu_roving_herbalist: { name: 'Potulný bylinkář', description: 'Při nasazení: Obnov 3 životy spřátelené postavě.', flavorText: 'Obklad z bahnokořene na rány. Čaj z ohnivého mechu na všechno ostatní.' },
  neu_ironwood_sellsword: { name: 'Železnodřevý žoldnéř', description: 'Výpad.', flavorText: 'Účtuje si za hodinu. Do útoku se ale žene zadarmo.' },
  neu_shardstone_behemoth: { name: 'Střepokamenný behemot', flavorText: 'Do lomu spadl Střep. Lom se postavil na nohy.' },
  neu_hush_wanderer: { name: 'Tichá poutnice', description: 'Při nasazení: Umlč jednotku (odstraň její text a bonusy).', flavorText: 'Složila slib mlčení. Všechno kolem ní taky.' },
  neu_bounty_stalker: { name: 'Lovec odměn', description: 'Při nasazení: Znič nepřátelskou jednotku s útokem 2 nebo méně.', flavorText: 'Malé odměny, vyplacené do posledního groše.' },
  neu_giantbane_ranger: { name: 'Hraničář obrobijce', description: 'Při nasazení: Znič nepřátelskou jednotku s útokem 6 nebo více.', flavorText: 'Čím větší jsou, tím větší trofej.' },
  neu_pilgrims_lantern: { name: 'Poutníkova lucerna', description: 'Na konci tvého tahu obnov 2 životy tvému Strážci. Náboje: 3.', flavorText: 'Její plamen vede pocestné už od dob před pádem Koruny.' },
  neu_crossroads_inn: { name: 'Hostinec Na rozcestí', description: 'Na začátku tvého tahu vyvolej Rekruta z karavany 1/1. Trvá 3 tahy.', flavorText: 'Každá cesta sem jednou dovede. Stejně jako každého nadějného žoldáka.' },
  neu_aegis_pilgrim: { name: 'Poutnice egidy', description: 'Bariéra.', flavorText: 'Víra je štít. Ten její je štít doslova.' },
  neu_scarred_pitfighter: { name: 'Zjizvený zápasník z jámy', description: 'Kdykoli tato jednotka utrpí poškození a přežije, získá +2/+0.', flavorText: 'Každá jizva je lekce. Každá lekce ho rozzuří ještě víc.' },
  neu_toadcurse: { name: 'Ropuší kletba', description: 'Proměň jednotku v Bažinnou ropuchu 0/1.', flavorText: 'Kvák.' },
  neu_grand_bazaar: { name: 'Velký bazar ve Vey', description: 'Tvé jednotky stojí o (1) méně. Trvá 3 tahy.', flavorText: 'Každý žoldák v Aethře je tu k najmutí — a když budeš smlouvat, tak se slevou.' },
  neu_silvertongue_envoy: { name: 'Medovoustý vyslanec', description: 'Při nasazení: Převezmi kontrolu nad nepřátelskou jednotkou s útokem 3 nebo méně.', flavorText: '„Proč bojovat za ně, když ti můžu platit já?“' },
  neu_skyrift_wyrm: { name: 'Drak nebeské trhliny', description: 'Ochrana, Výpad.', flavorText: 'Hnízdí v trhlinách, které Koruna zanechala na nebi.' },
  neu_oskar_vell: { name: 'Oskar Vell, kupecký kníže', description: 'Na konci tvého tahu si přidej do ruky náhodnou kartu, která stojí 3 nebo méně.', flavorText: 'Prodal Střepy všem frakcím. Dvakrát.' },
  neu_aeon_pale_wanderer: { name: 'Aeon, Bledý poutník', description: 'Při nasazení: Znič všechny ostatní jednotky.', flavorText: 'Vyšel z Koruny v den, kdy se roztříštila, a od té doby všemu přináší konec.' },
  neu_captain_abandoneer: { name: 'Kapitánka Abandoneer', description: 'Výpad. Při nasazení: Ukradni náhodnou kartu z ruky soupeře. Poslední dech: Vyvolej 2 Plavčíky (1/1).', flavorText: 'Opustila tři lodě, dvě posádky a jedno království. Poklad nikdy.' },
  neu_meowchick: { name: 'Meowchick', description: 'Spěch. Při nasazení: Dej všem svým jednotkám, včetně této, +2 k útoku.', flavorText: 'Nikdo neví, odkud se vzal. Do boje ho ale stejně všichni následují.' },
};

export default cards;
