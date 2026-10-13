import type { CardsOverlay } from '../../overlayTypes';

/** The Wraithwood Inn campaign rewards (two per faction). */
const cards: CardsOverlay = {
  ast_the_pale_lodger: { name: 'Bledý nocležník', description: 'Kdykoli sešleš kouzlo, získá +1/+0.', flavorText: 'Pokoj u okna si vzal před sto lety. Pořád si v něm čte při měsíčním světle.' },
  vod_hollow_tom_night_ranger: { name: 'Dutý Tom, noční hraničář', description: 'Vysátí. Při nasazení: Způsob 2 poškození nepřátelské jednotce.', flavorText: 'Čtyřicet let obcházel každou noc okraj lesa. Jedné noci ho les doprovodil domů.' },
  ver_mossmantle_the_antlered_ranger: { name: 'Mechoplášť, parožnatý hraničář', description: 'Stráž. Na konci tvého tahu dej jiné náhodné spřátelené jednotce +1/+1.', flavorText: 'Mech přerostl posledního hraničáře Přízračného hvozdu. Nechal ho. Hřeje ho.' },
  irn_doctor_corvin: { name: 'Doktor Corvin', description: 'Jed. Při nasazení: Získej 3 brnění.', flavorText: 'V zobáku masky nosí lék. V hostinci si o něj ještě nikdo neřekl.' },
  emb_the_crimson_hood: { name: 'Karmínová kápě', description: 'Léčka. Při nasazení: Způsob 2 poškození nepřátelskému Strážci.', flavorText: 'Hraničáři říkají, že kdysi nosila zelenou kápi. Čím ji obarvila, už neříkají.' },
  emb_bramhorn_the_skull_masked: { name: 'Bramhorn s lebkou místo tváře', description: 'Výpad. Kdykoli tato jednotka zničí jednotku, získá +2/+2.', flavorText: 'Nosí lebku prvního tvora, kterého v Přízračném hvozdu ulovil. Pořád hledá nějaký větší.' },
  tid_the_drowned_guest: { name: 'Utopený host', description: 'Při nasazení: Zmraz nepřátelskou jednotku. Lízni si kartu.', flavorText: 'Vylezl studnou ve sklepě a požádal o stůl. Z jeho židle pořád kape voda.' },
  ver_hartwrath_the_stag_ranger: { name: 'Hartwrath, jelení hraničář', description: 'Výpad. Regenerace.', flavorText: 'Velkého jelena Přízračného hvozdu nikdo neulovil. On ulovil lovce a odnesl si ho domů.' },
  tid_the_widow_in_white: { name: 'Vdova v bílém', description: 'Ochrana. Při nasazení: Zmraz všechny nepřátelské jednotky.', flavorText: 'U okna čeká na hraničáře, který odešel do jezera. Kam se podívá, tam sklo zamrzne.' },
  ast_the_quiet_patron: { name: 'Mlčenlivý host', description: 'Stráž. Při nasazení: Ukradni náhodnou kartu z balíčku protivníka.', flavorText: 'Nic si neobjedná, nic neřekne a nikdy neprohraje. Jen sleduje karty.' },
  vod_old_marrow_the_barkeep: { name: 'Starý Kostník, výčepní', description: 'Při nasazení: Oživ náhodnou spřátelenou jednotku za 4 nebo méně, která v této hře zemřela.', flavorText: '„Z hostince v Přízračném hvozdu nikdo neodchází před poslední objednávkou. Ani mrtví.“' },
  irn_the_hollow_host: { name: 'Dutý hostitel', description: 'Při nasazení: Vyvolej dvoje Povstalé kosti 2/2 a pak dej svým ostatním jednotkám +1/+1.', flavorText: 'Hostinec postavili kolem jeho stolu. Každý host, který s ním kdy prohrál, u něj pořád sedí.' },
};

export default cards;
