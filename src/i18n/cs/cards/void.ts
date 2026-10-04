import type { CardsOverlay } from '../../overlayTypes';

const cards: CardsOverlay = {
  vod_grave_whisperer: { name: 'Hrobový šeptač', description: 'Poslední dech: Vyvolej Prázdnou světlušku 1/1.', flavorText: 'Mluví jen s mrtvými. Mrtví mu bohužel odpovídají.' },
  vod_tithe_of_bone: { name: 'Desátek z kostí', description: 'Způsob 2 poškození jednotce. Pokud v tomto tahu zemřela spřátelená jednotka, lízni si kartu.', flavorText: 'Chór si vždy vybere své. Čí kosti vezme, je jen podrobnost.' },
  vod_choir_novice: { name: 'Novicka chóru', description: 'Kdykoli zemře jiná spřátelená jednotka, získá +1/+0.', flavorText: 'S každým pohřebním chorálem, který se naučí, jí hlas trochu zchladne.' },
  vod_hollow_leech: { name: 'Prázdná pijavice', description: 'Vysátí.', flavorText: 'Nepije krev, ale teplo. Jejím obětem je ten rozdíl celkem lhostejný.' },
  vod_cryptcrawler: { name: 'Kryptolez', description: 'Poslední dech: Vyvolej Povstalé kosti 2/2.', flavorText: 'Rozbij ho na kusy a ty kusy prostě zase vstanou.' },
  vod_marrow_priest: { name: 'Kněz morku', description: 'Při nasazení: Znič jinou spřátelenou jednotku. Pokud v tomto tahu zemřela spřátelená jednotka, získá +2/+2.', flavorText: '„Tvá oběť byla zaznamenána. A strávena.“' },
  vod_dirgebound_knight: { name: 'Rytíř spjatý žalozpěvem', description: 'Poslední dech: Způsob 2 poškození náhodnému nepříteli.', flavorText: 'Přísahal bojovat až do smrti – a pak ještě o kousek dál.' },
  vod_hollow_matron: { name: 'Prázdná matróna', description: 'Poslední dech: Vyvolej 2 Prázdné světlušky 1/1.', flavorText: 'Její děti jsou utkané ze šepotu. Vždycky mají hlad.' },
  vod_open_grave: { name: 'Otevřený hrob', description: 'Oživ náhodnou spřátelenou jednotku s cenou 3 nebo méně, která v této hře zemřela.', flavorText: 'Chór nikdy hrob nezasype. Mohl by se ještě hodit.' },
  vod_venomous_cantor: { name: 'Jedovatá kantorka', description: 'Jed.', flavorText: 'Jeden tón z jejího hrdla zastaví srdce. Dva tóny zastaví armádu.' },
  vod_pallbearer: { name: 'Mlčenlivý nosič rakví', description: 'Stráž. Poslední dech: Lízni si kartu.', flavorText: 'Nesl už tisíc rakví. Trpělivě čeká na tu svou.' },
  vod_reap: { name: 'Žeň', description: 'Znič nepřátelskou jednotku s útokem 3 nebo méně.', flavorText: 'Malí jdou první. Vždycky.' },
  vod_offering_blade: { name: 'Obětní čepel', description: 'Kdykoli zemře jiná spřátelená jednotka, dej náhodné spřátelené jednotce +1/+1. Náboje: 3.', flavorText: 'Nůž, který si pamatuje každý život, jejž vzal – a dělí se o ně.' },
  vod_requiem_conductor: { name: 'Dirigent rekviem', description: 'Při nasazení: Způsob X poškození náhodnému nepříteli. X je počet tvých jednotek, které v této hře zemřely (max. 6).', flavorText: 'Každý padlý hlas se přidá k jeho sboru. Každý hlas zpívá o pomstě.' },
  vod_choir_of_moths: { name: 'Chór můr', description: 'Poslední dech: Dej svým jednotkám +1/+1.', flavorText: 'Když se roj rozptýlí, každá svíce v Chóru zahoří o něco jasněji.' },
  vod_blood_pact: { name: 'Krvavá smlouva', description: 'Lízni si 2 karty. Způsob 4 poškození tvému Strážci.', flavorText: 'Podepsáno rudě. Splaceno do posledního haléře. Časem.' },
  vod_ossuary_colossus: { name: 'Kostnicový kolos', description: 'Stráž. Při nasazení: Získá +1/+1 za každou spřátelenou jednotku, která v této hře zemřela (až +4/+4).', flavorText: 'Postavený ze všech vojáků, které kdy Chór ztratil. Pamatuje si jméno každého z nich.' },
  vod_hollow_cathedral: { name: 'Prázdná katedrála', description: 'Kdykoli zemře jiná spřátelená jednotka, vyvolej Prázdnou světlušku 1/1. Trvá 3 tahy.', flavorText: 'Její zvony zvoní za každou smrt. Něco na to volání vždycky odpoví.' },
  vod_requiem_mass: { name: 'Zádušní mše', description: 'Znič všechny jednotky. Pak oživ 2 náhodné spřátelené jednotky, které v této hře zemřely.', flavorText: 'Před Hymnou jsou si všichni rovni. Někteří jsou si potom prostě rovnější.' },
  vod_siphoning_wraith: { name: 'Vysávající přízrak', description: 'Vysátí, Jed.', flavorText: 'Jeho dotek je pomalý polibek konce – pomalý pro tebe, lahodný pro něj.' },
  vod_hymn_of_unmaking: { name: 'Hymna zániku', description: 'Způsob 2 poškození všem jednotkám. Pak oživ náhodnou spřátelenou jednotku s cenou 3 nebo méně.', flavorText: 'Sloka, která ukončí všechny písně. Chór ji zpívá potichu.' },
  vod_ysolde: { name: 'Ysolde, Královna Prázdnoty', description: 'Při nasazení: Oživ 3 náhodné spřátelené jednotky, které v této hře zemřely.', flavorText: 'Mrtvé si nepodmanila. Prostě je pozvala domů.' },
  vod_nhal: { name: 'Nhal, Mlčenlivá hymna', description: 'Vysátí. Kdykoli zemře jiná spřátelená jednotka, způsob 2 poškození nepřátelskému Strážci.', flavorText: 'Poslední tón každé písně patří jemu.' },
  vod_tallys_the_menace: {
    name: 'Tallys Hrozivý',
    description: 'Stráž. Při nasazení: Znič náhodnou nepřátelskou jednotku.',
    flavorText: 'Kde zpívá Chór, kráčí on v čele. Za ním už nekráčí nic.',
  },
};

export default cards;
