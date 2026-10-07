import type { CardsOverlay } from '../../overlayTypes';

/** Dragon Realm (set DRAGON). */
const cards: CardsOverlay = {
  // Ember
  emb_redsky_wyrm: { name: 'Drak rudého nebe', description: 'Výpad.', flavorText: 'Když se nebe nad Kalderou zbarví do ruda, pastýři počítají stáda dvakrát.' },
  emb_cinderperch_drake: { name: 'Drak z popelavého útesu', description: 'Při nasazení: Pokud ovládáš jiného Draka, získá Spěch.', flavorText: 'Čeká na teplých skalách, dokud nad ním nepřeletí hejno. Pak se přidá k lovu.' },
  emb_magmaclaw_drake: { name: 'Drak s magmatickými drápy', description: 'Výpad. Kdykoli tato jednotka zničí jednotku, způsob 2 poškození nepřátelskému Strážci.', flavorText: 'Jeho drápy zanechávají hořící stopy a každá vede do nepřátelského tábora.' },
  emb_ashwing_matriarch: { name: 'Matriarcha popelavých křídel', description: 'Při nasazení: Vyvolej 2 Popelavé dráčky 2/2.', flavorText: 'Nikdy nelétá sama. Mláďata se učí pálit tím, že ji pozorují.' },
  emb_pyraxis_ashen_sovereign: { name: 'Pyraxis, Popelavý vládce', description: 'Při nasazení: Způsob 3 poškození všem nepřátelským jednotkám. Pokud ovládáš jiného Draka, způsob 3 poškození nepřátelskému Strážci.', flavorText: 'Pod jeho křídly povstávala a padala království. Pamatuje si jen ta, která dobře hořela.' },
  emb_flamebrand_dragonknight: { name: 'Dračí rytíř s plamenným mečem', description: 'Při nasazení: Pokud ovládáš Draka, způsob 2 poškození náhodnému nepříteli.', flavorText: 'Jeho meč byl zakalen v dračím ohni. Od té doby nepřestal žhnout.' },
  emb_cinderwing_pixie: { name: 'Skřítka popelavých křídel', description: 'Při nasazení: Způsob 1 poškození náhodnému nepříteli.', flavorText: 'Z každé jiskry, která odletí z dračího ohně, se stane jedna z nich. Většina z nich je kvůli tomu naštvaná.' },
  emb_blazeheart_fae: { name: 'Víla planoucího srdce', description: 'Posílení 1. Při nasazení: Přidej si do ruky náhodné kouzlo Popelavé legie, které stojí 2 nebo méně.', flavorText: 'Nosí plamen v dlani, jako jiní nosí lucernu.' },
  emb_wyrmfire_breath: { name: 'Dech dračího ohně', description: 'Způsob 3 poškození jednotce. Pokud ovládáš Draka, způsob o 1 víc.', flavorText: 'Vypůjčený od draka na jediný dech. Vrácený i s úroky.' },
  emb_kindled_roar: { name: 'Rozžhavený řev', description: 'Způsob 1 poškození všem nepřátelům. Pokud ovládáš Draka, uděl všem nepřátelským jednotkám Hoření 1.', flavorText: 'Řev sám pálí dost. Když se přidá drak, chytne tráva.' },
  emb_call_of_the_red_sun: { name: 'Volání rudého slunce', description: 'Lízni si z balíčku Draka. Způsob 2 poškození náhodnému nepříteli.', flavorText: 'Kněží slunce za úsvitu zvednou ruce a něco s křídly odpoví.' },
  emb_ashen_ascension: { name: 'Popelavé vzkříšení', description: 'Způsob 2 poškození všem nepřátelům. Pokud ovládáš Draka, způsob o 1 víc.', flavorText: 'Povstala z hranice s ohnivým ptákem na zápěstí. Její nepřátelé nepovstali vůbec.' },

  // Tide
  tid_brinescale_drake: { name: 'Drak se slanými šupinami', description: 'Při nasazení: Zmraz nepřátelskou jednotku.', flavorText: 'Jeho dech je mořská tříšť na prahu zimy. Námořníci mu říkají bílá bouře.' },
  tid_stormtide_wyrm: { name: 'Drak bouřlivého přílivu', description: 'Při nasazení: Vrať nepřátelskou jednotku s cenou 3 nebo méně do ruky jejího vlastníka.', flavorText: 'Jedno máchnutí křídel a ty malé to odnese zpátky na břeh.' },
  tid_wavebreaker_wyrm: { name: 'Drak lamač vln', description: 'Ochrana. Při nasazení: Dvakrát Zmraz náhodnou nepřátelskou jednotku. Lízni si kartu.', flavorText: 'Vynoří se z příboje v ledové bouři. Vlnolam ho nezastavil. Nezastaví ho nic.' },
  tid_glacivar_rime_sovereign: { name: 'Glacivar, Vládce jinovatky', description: 'Ochrana. Při nasazení: Zmraz všechny nepřátelské jednotky. Lízni si kartu za každou Zmrazenou nepřátelskou jednotku (až 2).', flavorText: 'Ledovce nejsou led. Jsou to místa, kde si Glacivar kdysi lehl ke spánku.' },
  tid_rimewing_dragoon: { name: 'Dragoun jinovatkových křídel', description: 'Při nasazení: Pokud ovládáš Draka, Zmraz náhodnou nepřátelskou jednotku.', flavorText: 'Jezdí ve studených větrech za bílými draky a dokončuje, co začal jejich dech.' },
  tid_frostblade_dragonknight: { name: 'Dračí rytíř s mrazivou čepelí', description: 'Kdykoli tato jednotka zaútočí na jednotku, Zmraz ji.', flavorText: 'Rána od jeho čepele nekrvácí. Namrzne.' },
  tid_dewglass_sprite: { name: 'Skřítka z rosného skla', description: 'Při nasazení: Vrať jinou spřátelenou jednotku do ruky jejího vlastníka. Bude stát o (1) méně.', flavorText: 'Unavenou přítelkyni složí do kapky rosy a odnese ji domů.' },
  tid_tidewhisper_fae: { name: 'Víla šepotu přílivu', description: 'Na konci tvého tahu Zmraz náhodnou nepřátelskou jednotku.', flavorText: 'Zpívá písně, které moře zpívá pod ledem, a kdo je uslyší, stojí velmi tiše.' },
  tid_frostwyrm_lodestar: { name: 'Polárka mrazivého draka', description: 'Kdykoli vyvoláš Draka, Zmraz náhodnou nepřátelskou jednotku. Náboje: 3.', flavorText: 'Ledová hvězda, která vždy ukazuje na sever, tam, kde spí bílí draci.' },
  tid_tideglass_grasp: { name: 'Sevření přílivového skla', description: 'Zmraz nepřátelskou jednotku. Pokud ovládáš Draka, způsob jí také 2 poškození.', flavorText: 'Moře sevře dlaň. Když se dívá drak, stiskne.' },
  tid_deep_current_rite: { name: 'Obřad hlubinného proudu', description: 'Vrať nepřátelskou jednotku do ruky jejího vlastníka. Lízni si kartu.', flavorText: 'Obřad přivolá hlubinný proud skrz kámen. Jednoho hosta si vezme s sebou dolů.' },

  // Void
  vod_nyxarath_hollow_wyrm: { name: 'Nyxarath, Prázdný drak', description: 'Vysátí. Při nasazení: Znič nepřátelskou jednotku s útokem 4 nebo více.', flavorText: 'Chór mu zpívá každou noc. On nikdy nezazpíval nazpátek. Jen žral.' },
  vod_ruinwing_drake: { name: 'Drak zkázonosných křídel', description: 'Poslední dech: Způsob 2 poškození náhodnému nepříteli.', flavorText: 'Hnízdí v troskách, které sám způsobil. Když padne, padnou trosky s ním.' },
  vod_gloomcoil_serpent: { name: 'Drak šerých smyček', description: 'Kdykoli zemře jiná spřátelená jednotka, získá +1/+1.', flavorText: 'Každá duše, která kolem něj proklouzne, mu prodlouží smyčky.' },
  vod_duskmaw_dragon: { name: 'Soumračná tlama', description: 'Vysátí. Kdykoli tato jednotka zničí jednotku, získá +2/+2.', flavorText: 'Za soumraku otevře tlamu a světlo do ní vejde jako první.' },
  vod_duskblade_dragonknight: { name: 'Dračí rytíř se soumračnou čepelí', description: 'Při nasazení: Pokud ovládáš Draka, získá Vysátí.', flavorText: 'Jeho čepel pije stejně jako jeho drak: pomalu a nikdy dost.' },
  vod_bloodwing_reaver: { name: 'Žnec krvavých křídel', description: 'Poslední dech: Lízni si z balíčku Draka.', flavorText: 'Když padne, jeho poslední výkřik doletí až k hnízdišti. Vždycky něco odpoví.' },
  vod_nightshade_fae: { name: 'Víla rulíku', description: 'Poslední dech: Způsob 2 poškození náhodnému nepříteli.', flavorText: 'Utrhni ji a píchne. Rozmačkej ji a píchne víc.' },
  vod_gloamveil_fae: { name: 'Víla soumračného závoje', description: 'Léčka, Jed.', flavorText: 'Její křídla uvidíš jednou, v šeru mezi dvěma stromy. Jednou to stačí.' },
  vod_soulflame_orb: { name: 'Koule duševního plamene', description: 'Způsob 3 poškození jednotce. Pokud v tomto tahu zemřela spřátelená jednotka, lízni si kartu.', flavorText: 'Hoří vším, co se dnes ztratilo. Některé dny hoří velmi jasně.' },
  vod_wyrmsoul_rebirth: { name: 'Znovuzrození dračí duše', description: 'Oživ 2 náhodné spřátelené jednotky za 5 nebo méně, které v této hře zemřely.', flavorText: 'Chór zazpívá staré jméno pozpátku a kosti si vzpomenou, jak se stojí.' },
  vod_wyrmbone_sanctum: { name: 'Svatyně dračích kostí', description: 'Na začátku tvého tahu si lízni kartu, pokud ovládáš Draka. Trvá 3 tahy.', flavorText: 'Postavená uvnitř hrudního koše prvního draka. Pořád šeptá jeho dětem.' },
  vod_grave_dragons_pact: { name: 'Pakt hrobového draka', description: 'Znič spřátelenou jednotku. Lízni si z balíčku 2 Draky.', flavorText: 'Hrobový drak žádá jeden život. Na oplátku pošle dva ze svého rodu.' },
  vod_umbral_siphon: { name: 'Stínový sifon', description: 'Způsob 3 poškození nepříteli. Obnov 3 životy svému Strážci.', flavorText: 'Co jim vezme, si nechá. Co si nechá, dá tobě.' },

  // Verdant
  ver_thornhide_drake: { name: 'Drak s trnitou kůží', description: 'Regenerace.', flavorText: 'Mezi šupinami mu roste mech. Když ho raníš, mech ránu přes noc zacelí.' },
  ver_glade_wyrm: { name: 'Drak paseky', description: 'Na konci tvého tahu dej jiné náhodné spřátelené jednotce +1/+1.', flavorText: 'Kde si lehne ke spánku, vyroste paseka. Kdo se v ní ukryje, probudí se silnější.' },
  ver_elderhorn_wyrm: { name: 'Drak prastarých rohů', description: 'Při nasazení: Obnov 5 životů svému Strážci. Dej svým ostatním jednotkám +1/+1.', flavorText: 'Je starší než Trnobor. Kruh říká, že první stromy vyrostly z jeho shozených rohů.' },
  ver_emerald_dragonknight: { name: 'Smaragdový dračí rytíř', description: 'Při nasazení: Obnov 2 životy svému Strážci. Pokud ovládáš Draka, získá +1/+1.', flavorText: 'Jeho čepel je úlomek živého nefritu. Každé jaro trochu povyroste.' },
  ver_sunspear_dragoon: { name: 'Dragoun slunečního kopí', description: 'Při nasazení: Dej jiné spřátelené jednotce +2/+2.', flavorText: 'Pozvedne kopí ke slunci a celá řada se napřímí.' },
  ver_bramblewing_pixie: { name: 'Skřítka ostružinových křídel', description: 'Při nasazení: Dej jiné spřátelené jednotce +1/+1.', flavorText: 'Polibek ostružinové skřítky zanechá škrábnutí a trochu odvahy navíc.' },
  ver_glowmoss_fae: { name: 'Víla světélkujícího mechu', description: 'Kdykoli vyvoláš Vílu, dej jí +1/+1.', flavorText: 'Svítí na cestu svým sestrám. Každá dorazí jasnější než ta předchozí.' },
  ver_maelis_queen_of_the_glade: { name: 'Maelis, Královna paseky', description: 'Tvé Víly stojí o (1) méně. Při nasazení: Lízni si z balíčku 2 Víly.', flavorText: 'Když se Královna paseky zasměje, každá květina v Trnoboru se otočí, aby poslouchala.' },
  ver_sapsong_blessing: { name: 'Požehnání mízní písně', description: 'Dej spřátelené jednotce +2/+2. Obnov 2 životy svému Strážci.', flavorText: 'Druidové zpívají míze a míza zpívá zpátky skrz každého, koho se dotknou.' },
  ver_the_faerie_ring: { name: 'Kruh víl', description: 'Tvé Víly stojí o (1) méně. Na začátku tvého tahu obnov 3 životy svému Strážci. Trvá 3 tahy.', flavorText: 'Vstup do kruhu světla a víly přijdou za tebou. Vystup z něj, jestli to dokážeš.' },

  // Astral
  ast_selunith_the_moonwyrm: { name: 'Selunith, Měsíční drak', description: 'Ochrana. Při nasazení: Přidej si do ruky 2 náhodná kouzla Lumenu. Budou stát o (2) méně.', flavorText: 'Konkláve mapuje měsíc. Nakonec zjistilo, že měsíc mapuje je.' },
  ast_starveil_drake: { name: 'Drak hvězdného závoje', description: 'Posílení 1. Při nasazení: Lízni si kouzlo.', flavorText: 'Jeho šupiny mají barvu oblohy hodinu po západu slunce, i kouzel, která tam žijí.' },
  ast_sunscarf_dragoon: { name: 'Dragoun se sluneční šálou', description: 'Při nasazení: Pokud ovládáš Draka, lízni si kartu.', flavorText: 'Čte hvězdy pro svého draka. Jeho drak čte bojiště pro něj.' },
  ast_highspire_dragonkin: { name: 'Dračí potomek z Vysoké věže', description: 'Při nasazení: Přidej si do ruky náhodného Draka. Bude stát o (2) méně.', flavorText: 'Napůl rytíř, napůl drak a správce všech hnízdišť Vysoké věže.' },
  ast_glimmerwing_sprite: { name: 'Skřítka třpytivých křídel', description: 'Bariéra, Posílení 1.', flavorText: 'Sedí na okraji kouzla a dělá ho o kousek jasnějším.' },
  ast_prismwing_enchantress: { name: 'Čarodějka hranolových křídel', description: 'Při nasazení: Kouzla, která máš právě v ruce, stojí o (1) méně.', flavorText: 'Světlo projde jejími křídly a vyjde z nich jako sedm snazších kouzel.' },
  ast_amethyst_spark: { name: 'Ametystová jiskra', description: 'Způsob 2 poškození nepříteli. Pokud ovládáš Draka, lízni si kartu.', flavorText: 'Úlomek dračího ametystu, hozený dost silně, aby to něco znamenalo.' },
  ast_radiant_wyrmlight: { name: 'Zářivé dračí světlo', description: 'Dej spřátelené jednotce +2/+2 a Ochranu. Lízni si kartu.', flavorText: 'Světlo, které drak vydává, když je s tebou spokojený.' },
  ast_the_moonfire_circle: { name: 'Kruh měsíčního ohně', description: 'Tví Draci stojí o (1) méně. Trvá 3 tahy.', flavorText: 'Modrý oheň, který hoří jen za úplňku. Draci přeletí půl světa, aby u něj mohli hnízdit.' },
  ast_halo_of_the_starwyrm: { name: 'Svatozář hvězdného draka', description: 'Způsob 3 poškození všem nepřátelským jednotkám. Lízni si kartu.', flavorText: 'Hvězdný drak za ní roztáhne křídla a hvězdy padají tam, kam ukáže.' },

  // Iron
  irn_anvilwing_drake: { name: 'Drak kovadlinových křídel', description: 'Při nasazení: Získej 2 brnění.', flavorText: 'Kováři Dominia ho okovají jako koně a obrní jako pevnost.' },
  irn_silverscale_drake: { name: 'Drak se stříbrnými šupinami', description: 'Stráž.', flavorText: 'Jeho šupiny zvoní jako zvon. Šípy ho jen rozezpívají.' },
  irn_bronzecoil_wyrm: { name: 'Drak bronzových smyček', description: 'Stráž. Při nasazení: Získej 4 brnění.', flavorText: 'Obtáčí slévárny Dominia a dovnitř se nedostane nic, co sám nepustí.' },
  irn_ironspine_dragon: { name: 'Drak s železnou páteří', description: 'Stráž. Při nasazení: Získej 3 brnění. Kdykoli získáš brnění, získá tato jednotka +1/+1.', flavorText: 'Každý plát, který mu kováři přidají, nosí jako trofej.' },
  irn_goldwing_vanguard: { name: 'Předvoj zlatých křídel', description: 'Stráž. Při nasazení: Získej 2 brnění. Pokud ovládáš Draka, získá +1/+1.', flavorText: 'Stojí před draky, aby draci mohli stát před všemi ostatními.' },
  irn_valdrek_wingmarshal: { name: 'Valdrek, Maršál křídel', description: 'Tví Draci mají +1 k útoku. Při nasazení: Lízni si z balíčku 2 Draky.', flavorText: 'Dominium mu dalo pevnost. Vyměnil ji za nebe plné křídel.' },
  irn_dragonforge_star: { name: 'Hvězda dračí výhně', description: 'Kdykoli vyvoláš Draka, získej 3 brnění. Náboje: 3.', flavorText: 'Ukovaná v dračím ohni. Rozzáří se, kdykoli je nablízku některý z jejích tvůrců.' },
  irn_runeforged_scales: { name: 'Runami kované šupiny', description: 'Získej 4 brnění. Pokud ovládáš Draka, lízni si kartu.', flavorText: 'Shozené dračí šupiny, vyklepané naplocho a pokryté runou. Lepší než jakákoli ocel.' },

  // Neutral
  neu_redcrag_drake: { name: 'Drak z rudých skal', description: 'Při nasazení: Pokud ovládáš jiného Draka, získá +1/+1.', flavorText: 'Sám je to otrava. V hejnu je to pohroma.' },
  neu_duskhorn_dragon: { name: 'Soumrakorohý drak', flavorText: 'Žádný prapor, žádný pán, žádný spěch. Jde, kam chce, a bere si, co najde.' },
  neu_aurumvex_the_hoardwyrm: { name: 'Aurumvex, Strážce pokladu', description: 'Při nasazení: Přidej si do ruky 2 náhodné Draky.', flavorText: 'Jeho poklad není zlato. Je to koule vajec a každé z nich má hlad.' },
  neu_wanderwing_fae: { name: 'Víla toulavých křídel', description: 'Při nasazení: Lízni si z balíčku Vílu.', flavorText: 'Navštívila každou paseku v Aethře a vždycky si přivede kamarádku.' },
  neu_wyrmcall: { name: 'Dračí volání', description: 'Lízni si z balíčku Draka.', flavorText: 'Jediné slovo ve staré řeči, tvarované jako svinutý drak.' },
  neu_wyrmlord_sigil: { name: 'Pečeť dračích pánů', description: 'Na začátku tvého tahu bude nejdražší Drak v tvé ruce stát o (1) méně. Náboje: 3.', flavorText: 'Dračí páni ji vypálili do nebe. Draci na ni pořád odpovídají rychleji, než by měli.' },
};

export default cards;
