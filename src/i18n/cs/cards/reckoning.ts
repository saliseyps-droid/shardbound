import type { CardsOverlay } from '../../overlayTypes';

/** Void Reckoning (set RECKONING). */
const cards: CardsOverlay = {
  // Void
  vod_rift_cultist: { name: 'Kultista trhliny', description: 'Poslední dech: Rozlož náhodnou nepřátelskou jednotku.', flavorText: 'Vešel do trhliny se zpěvem. Píseň pokračovala i poté, co přestal.' },
  vod_umbral_acolyte: { name: 'Stínová akolytka', description: 'Kdykoli jiná spřátelená jednotka zemře, získá +1/+0.', flavorText: 'Každá ztráta je lekce. Naučila se už velmi mnoho.' },
  vod_sunless_hymn: { name: 'Hymnus bez slunce', description: 'Rozlož nepřátelskou jednotku.', flavorText: 'Zpívá se jednou, potmě, něčemu, co odpovídá.' },
  vod_hollow_glutton: { name: 'Prázdný žrout', description: 'Při nasazení: Pohlť jinou spřátelenou jednotku.', flavorText: 'Nikdy není sytý. Jen si dává pauzu.' },
  vod_black_sun_chanter: { name: 'Zpěvák černého slunce', description: 'Při nasazení: Rozlož náhodnou nepřátelskou jednotku.', flavorText: 'Sbor se každé ráno obracel k východu. Teď se obrací vzhůru.' },
  vod_gaping_maw: { name: 'Zející chřtán', description: 'Stráž. Při nasazení: Pohlť jinou spřátelenou jednotku.', flavorText: 'Cokoli spolkne, to ho drží v cestě.' },
  vod_reckoning_bell: { name: 'Zvon zúčtování', description: 'Na začátku tvého tahu: Způsob 2 poškození všem rozloženým nepřátelským jednotkám.', flavorText: 'Nezvoní pro živé.' },
  vod_feed_the_void: { name: 'Nasyť Prázdnotu', description: 'Znič spřátelenou jednotku. Lízni si 2 karty.', flavorText: 'Prázdnota vrací. Nikdy to, co jsi jí dal.' },
  vod_hungering_shade: { name: 'Hladový stín', description: 'Kdykoli jiná spřátelená jednotka zemře, získá +1/+1.', flavorText: 'Roste ze žalu.' },
  vod_star_eater: { name: 'Požírač hvězd', description: 'Vysátí. Kdykoli nepřátelská jednotka zemře, získá +1/+0.', flavorText: 'Dřív bývalo víc hvězd.' },
  vod_eclipse_rite: { name: 'Rituál zatmění', description: 'Rozlož všechny nepřátelské jednotky.', flavorText: 'Na jeden nádech slunce zčerná. Všechno pod ním si to pamatuje.' },
  vod_devourer_of_names: { name: 'Požírač jmen', description: 'Vysátí. Při nasazení: Pohlť jinou spřátelenou jednotku.', flavorText: 'Nejdřív sní jméno. Pak už nikomu nechybí, co sní potom.' },
  vod_black_sun_herald: { name: 'Hlasatel černého slunce', description: 'Při nasazení: Pohlť jinou spřátelenou jednotku a pak rozlož 2 náhodné nepřátelské jednotky.', flavorText: 'První, kdo spatřil vycházet černé slunce. První, kdo poklekl. První, kdo byl odměněn.' },
  vod_the_reckoner: { name: 'Zúčtovatel', description: 'Při nasazení: Nastav útok a životy všech ostatních jednotek na 1.', flavorText: 'Každý dluh splacen. Každý účet uzavřen. Všichni stejní.' },

  // Ember
  emb_purging_bolt: { name: 'Očistný blesk', description: 'Způsob 2 poškození jednotce. Pokud je rozložená, způsob o 2 víc.', flavorText: 'Oheň se s Prázdnotou nehádá. Prostě nesouhlasí.' },
  emb_ember_zealot: { name: 'Žhavá horlivkyně', description: 'Při nasazení: Způsob 1 poškození všem rozloženým nepřátelským jednotkám.', flavorText: 'Přísahala spálit každý stín. Od té doby nespala.' },
  emb_duskblade_legionnaire: { name: 'Legionář soumračné čepele', description: 'Výpad.', flavorText: 'Legie vytáhla za soumraku. Soumrak už neskončil.' },
  emb_kindle_the_dark: { name: 'Zapal tmu', description: 'Způsob 3 poškození nepřátelské jednotce a uděl jí Hoření 2.', flavorText: 'Zapal ve tmě oheň a uvidíš, co před ním uteče.' },
  emb_lantern_bearer: { name: 'Nositelka lucerny', description: 'Kdykoli nepřátelská jednotka zemře, způsob 1 poškození nepřátelskému Strážci.', flavorText: 'Nese poslední plamen starého slunce. Stačí, aby bylo vidět.' },
  emb_scorched_dawn: { name: 'Spálené svítání', description: 'Způsob 2 poškození všem nepřátelským jednotkám a uděl jim Hoření 1.', flavorText: 'Když slunce nevyjde, Legie rozsvítí nebe sama.' },
  emb_flamebound_inquisitor: { name: 'Plamenná inkvizitorka', description: 'Při nasazení: Znič rozloženou nepřátelskou jednotku.', flavorText: 'Klade jedinou otázku. Nikdo, koho se dotkla Prázdnota, na ni ještě neodpověděl.' },
  emb_sunbreaker_titan: { name: 'Titán lámač slunce', description: 'Při nasazení: Způsob 3 poškození všem rozloženým nepřátelským jednotkám a 2 poškození nepřátelskému Strážci.', flavorText: 'Vyrobený ze slupky mrtvé hvězdy a pořádně kvůli tomu naštvaný.' },
  emb_ashen_warden_kael: { name: 'Popelavý strážce Kael', description: 'Na konci tvého tahu: Způsob 1 poškození všem nepřátelským jednotkám a rozloženým o 2 víc.', flavorText: 'Přísahal držet bránu, dokud se slunce nevrátí. Pořád ji drží.' },

  // Verdant
  ver_rotroot_sentinel: { name: 'Strážce shnilých kořenů', description: 'Stráž.', flavorText: 'Polovina z něj je pořád živá. Ta polovina je velmi odhodlaná.' },
  ver_spore_cloud: { name: 'Mrak výtrusů', description: 'Rozlož nepřátelskou jednotku. Obnov tvému Strážci 2 životy.', flavorText: 'Háj se naučil hnít schválně.' },
  ver_blighted_druid: { name: 'Zpustošená druidka', description: 'Při nasazení: Rozlož nepřátelskou jednotku s útokem 3 nebo méně.', flavorText: 'Pořád se o háj stará. Háj teď ale kouše.' },
  ver_mossback_grazer: { name: 'Mechohřbetý pasák', description: 'Regenerace.', flavorText: 'Mech na jeho hřbetě dorůstá rychleji, než ho cokoli stihne ožrat.' },
  ver_grove_mender: { name: 'Léčitelka háje', description: 'Při nasazení: Očisti své jednotky a pak obnov všem spřáteleným postavám 2 životy.', flavorText: 'Vyřezává hnilobu stříbrným nožem a zpěvem vrací zeleň zpátky.' },
  ver_creeping_decay: { name: 'Plíživý rozpad', description: 'Rozlož 2 náhodné nepřátelské jednotky.', flavorText: 'Začíná u kořenů. Než si toho někdo všimne, je v koruně.' },
  ver_rotting_colossus: { name: 'Hnijící kolos', description: 'Stráž. Poslední dech: Rozlož náhodnou nepřátelskou jednotku.', flavorText: 'Nejstarší strom Trnoháje padl. Vstalo něco jiného.' },
  ver_heart_of_the_withered_wood: { name: 'Srdce zvadlého lesa', description: 'Na začátku tvého tahu: Rozlož náhodnou nepřátelskou jednotku a obnov tvému Strážci 2 životy.', flavorText: 'Pořád bije. Pomalu. Hladově.' },
  ver_mother_of_rot: { name: 'Matka hniloby', description: 'Na konci tvého tahu: Rozlož náhodnou nepřátelskou jednotku a obnov tvému Strážci 3 životy.', flavorText: 'Všechno, co padne v jejím lese, krmí její děti.' },

  // Iron
  irn_scrap_drone: { name: 'Šrotový dron', description: 'Poslední dech: Získej 2 brnění.', flavorText: 'Postavený, aby se rozbil. Jde mu to skvěle.' },
  irn_rivet_gnasher: { name: 'Nýtožrout', description: 'Při nasazení: Pohlť jinou spřátelenou jednotku.', flavorText: 'Žere šrot. Všechno je jednou šrot.' },
  irn_void_furnace: { name: 'Pec Prázdnoty', description: 'Kdykoli spřátelená jednotka zemře, získej 2 brnění.', flavorText: 'Spálí cokoli. Vrací teplo a o kousek méně všeho ostatního.' },
  irn_plated_harvester: { name: 'Pancéřovaný žnec', description: 'Stráž.', flavorText: 'Po každé bitvě sklízí bojiště. Nikdo se neptá, k čemu.' },
  irn_hungry_crucible: { name: 'Hladový tyglík', description: 'Při nasazení: Pohlť jinou spřátelenou jednotku. Získej 3 brnění.', flavorText: 'Nalij do něj vojáka, vylij štít.' },
  irn_null_engine: { name: 'Nulový stroj', description: 'Při nasazení: Umlč nepřátelskou jednotku (odstraň její text a vylepšení).', flavorText: 'Bručí tón, který zpívá Prázdnota, pozpátku.' },
  irn_refit: { name: 'Přestavba', description: 'Očisti spřátelenou jednotku a dej jí +2/+2.', flavorText: 'Nové pláty, nové nýty, hniloba seškrabaná. Jako nový. Lepší.' },
  irn_iron_maw: { name: 'Železný chřtán', description: 'Stráž. Bariéra. Při nasazení: Pohlť jinou spřátelenou jednotku.', flavorText: 'Dominium postavilo zeď, která žere. Funguje až moc dobře.' },
  irn_engine_of_hunger: { name: 'Stroj hladu', description: 'Na konci tvého tahu: Pohlť náhodnou jinou spřátelenou jednotku a získej 2 brnění.', flavorText: 'Měl pohánět město. Nikdo mu neřekl, kdy přestat.' },

  // Astral
  ast_lantern_novice: { name: 'Novicka s lucernou', description: 'Při nasazení: Dej jiné spřátelené jednotce Bariéru.', flavorText: 'Její lucerna drží jednu hvězdu. Dělí se o ni.' },
  ast_purify: { name: 'Očištění', description: 'Očisti své jednotky. Lízni si kartu.', flavorText: 'Slovo světla, vyslovené tiše, aby ho tma neslyšela.' },
  ast_starwatch_sentinel: { name: 'Strážce hvězdné hlídky', description: 'Stráž.', flavorText: 'Každou noc počítá hvězdy. Každou noc jich je méně.' },
  ast_radiant_lance: { name: 'Zářivé kopí', description: 'Způsob 4 poškození nepřátelské jednotce.', flavorText: 'Světlo, nabroušené.' },
  ast_dawnward_paladin: { name: 'Paladin úsvitu', description: 'Bariéra. Při nasazení: Očisti své jednotky.', flavorText: 'Stojí tam, kde by mělo být svítání, a září místo něj.' },
  ast_starfall_vow: { name: 'Slib padajících hvězd', description: 'Dej svým jednotkám Bariéru.', flavorText: 'Každá padající hvězda je něčí slib. Dnes v noci se plní všechny.' },
  ast_shard_sage: { name: 'Mudrcka střepů', description: 'Kdykoli sešleš kouzlo, získá +1/+1.', flavorText: 'Každé kouzlo v ní nechá třísku světla. Teď už je skoro celá ze světla.' },
  ast_eclipse_breaker: { name: 'Lámačka zatmění', description: 'Ochrana. Tvé ostatní jednotky mají Ochranu.', flavorText: 'Kde stojí ona, tam se černé slunce nedokáže podívat.' },
  ast_sol_the_last_lantern: { name: 'Sol, poslední lucerna', description: 'Při nasazení: Očisti své jednotky a dej jim Bariéru.', flavorText: 'Poslední kousek starého slunce. Malý, tvrdohlavý a pořád hořící.' },

  // Tide
  tid_abyssal_eel: { name: 'Úhoř z hlubin', description: 'Při nasazení: Zmraz nepřátelskou jednotku.', flavorText: 'Vyplouvá odtamtud, kde končí světlo, a přináší s sebou chlad.' },
  tid_undertow_wraith: { name: 'Přízrak spodního proudu', description: 'Poslední dech: Rozlož náhodnou nepřátelskou jednotku.', flavorText: 'Utonulí námořníci zpívají v hlubinách. Teď zpívají pro něco jiného.' },
  tid_black_tide: { name: 'Černý příliv', description: 'Zmraz nepřátelskou jednotku a rozlož ji.', flavorText: 'Moře v poledne zčernalo. Rybáři nepřišli domů.' },
  tid_drowned_sentry: { name: 'Utonulá hlídka', description: 'Stráž. Při nasazení: Zmraz náhodnou nepřátelskou jednotku.', flavorText: 'Pořád na svém stanovišti, tři sáhy pod hladinou.' },
  tid_nul_reaver: { name: 'Nájezdník z Nulu', description: 'Při nasazení: Vrať zmraženou nepřátelskou jednotku do ruky jejího vlastníka.', flavorText: 'Co drží led, to si vezme příliv.' },
  tid_depth_charge: { name: 'Hlubinná nálož', description: 'Způsob 3 poškození všem zmraženým nepřátelským jednotkám. Lízni si kartu.', flavorText: 'Led praská zespodu.' },
  tid_tidecaller_of_nul: { name: 'Vyvolávačka přílivu z Nulu', description: 'Na konci tvého tahu: Zmraz náhodnou nepřátelskou jednotku.', flavorText: 'Nul bývalo město. Teď je to příliv a ona ho volá.' },
  tid_maelstrom_of_nothing: { name: 'Vír nicoty', description: 'Zmraz všechny nepřátelské jednotky. Lízni si kartu.', flavorText: 'Vír se točí a uprostřed něj není vůbec žádná voda.' },
  tid_the_drowned_choir: { name: 'Utonulý sbor', description: 'Při nasazení: Rozlož všechny nepřátelské jednotky.', flavorText: 'Tisíc hlasů pod mořem zpívá, aby vyšlo černé slunce.' },

  // Neutral
  neu_rift_spawn: { name: 'Zplozenec trhliny', flavorText: 'Malý, rychlý a velmi se o tebe zajímá.' },
  neu_voidtouched_wanderer: { name: 'Poutnice dotčená Prázdnotou', description: 'Při nasazení: Pokud v tomto tahu zemřela spřátelená jednotka, lízni si kartu.', flavorText: 'Jednou se podívala do trhliny. Od té doby od ní odchází.' },
  neu_riftbound_scavenger: { name: 'Mrchožrout z trhliny', description: 'Při nasazení: Rozlož nepřátelskou jednotku s útokem 2 nebo méně.', flavorText: 'Přebírá, co Prázdnota nechá. Občas tam Prázdnota ještě je.' },
  neu_rift_hound: { name: 'Pes z trhliny', description: 'Při nasazení: Pohlť jinou spřátelenou jednotku.', flavorText: 'Prošel trhlinou hladový a nic na téhle straně ho nezasytilo.' },
  neu_rift_bruiser: { name: 'Rváč z trhliny', flavorText: 'Nikdo neví, čím byl před trhlinou. On si to taky nepamatuje.' },
  neu_reckoning_herald: { name: 'Posel zúčtování', description: 'Při nasazení: Rozlož nepřátelskou jednotku.', flavorText: 'Čte jména z černého svitku. Každé jméno zešedne, když ho vysloví.' },
  neu_voidglass_golem: { name: 'Golem z prázdnotového skla', description: 'Stráž. Bariéra.', flavorText: 'Sklo z okraje trhliny. Světlo dovnitř jde. Ven nic.' },
  neu_second_dawn: { name: 'Druhé svítání', description: 'Očisti spřátelenou jednotku a dej jí +1/+2.', flavorText: 'Někde se na chvíli vrátilo slunce.' },
  neu_ravenous_abomination: { name: 'Nenasytná ohavnost', description: 'Při nasazení: Pohlť 2 náhodné jiné spřátelené jednotky.', flavorText: 'Dvě tlamy. Ani jedna nikdy nepřestane.' },
  neu_null_field: { name: 'Nulové pole', description: 'Umlč všechny jednotky.', flavorText: 'Na okamžik není nic nikde ničím.' },
  neu_void_knight: { name: 'Rytíř Prázdnoty', description: 'Spěch. Při nasazení: Pohlť jinou spřátelenou jednotku.', flavorText: 'Jede na koni, kterým se stal poslední rytíř, co řekl ne.' },
  neu_herald_of_silence: { name: 'Hlasatel ticha', description: 'Při nasazení: Rozlož 2 náhodné nepřátelské jednotky.', flavorText: 'Kudy projde, ptáci přestanou zpívat, a pak přestanou úplně.' },
  neu_the_unmaker: { name: 'Neutvořitel', description: 'Při nasazení: Pohlť všechny své ostatní jednotky.', flavorText: 'Na konci zúčtování zbude jen jedna věc. Je velmi velká.' },
  // Additional Legendaries
  emb_artemis_qinnys_bane: { name: 'Artemis, zkáza Qinnyho', description: 'Posílení 1. Při nasazení: Způsob 1 poškození všem nepřátelským jednotkám, dvakrát.', flavorText: 'Qinny fouká bubliny. Artemis je propichuje. Dvakrát, pro jistotu.' },
  ver_scar_liu_kanos_mauler: { name: 'Scar, trhač Liu Kana', description: 'Zuřivost. Kdykoli tato jednotka zničí jednotku, obnov tvému Strážci 3 životy.', flavorText: 'Kouzla od Liu Kana sklouznou. Drápy ne.' },
  ast_archmage_elinka: { name: 'Arcimágyně Elinka', description: 'Při nasazení: Umlč náhodnou nepřátelskou jednotku, dej jí Výpad a převezmi nad ní kontrolu do konce tohoto tahu.', flavorText: 'Jeden pohled těch modrých očí a nepřítel zapomene, na čí straně stojí. Na chvíli.' },
  vod_simba_ultimate_predator: { name: 'Simba, dokonalý predátor', description: 'Spěch. Vysátí. Při nasazení: Pohlť jinou spřátelenou jednotku. Kdykoli tato jednotka zničí jednotku, získá +1/+1 a může zaútočit znovu. Poslední dech: Rozlož všechny nepřátelské jednotky.', flavorText: 'Každý lov končí stejně. Otázka je jen, kolika kořistmi.' },
  irn_steelmaker_gorn: { name: 'Ocelář Gorn', description: 'Stráž. Při nasazení: Získej 4 brnění. Kdykoli získáš brnění, dej náhodné spřátelené jednotce +1/+1.', flavorText: 'Každý plát, který ukove, skončí na někom. Obvykle na tom, kdo ho potřeboval.' },
  neu_sali_the_creator: { name: 'Sali, Stvořitel', description: 'Stráž. Ochrana. Při nasazení: Znič všechny ostatní jednotky. Poslední dech: Sali nahradí tvého Strážce.', flavorText: 'Před první hvězdou, před prvním slovem stál ve tmě trůn. Už na něm někdo seděl.' },
  tid_nereth_heart_of_the_maelstrom: { name: 'Nereth, srdce víru', description: 'Při nasazení: Zmraz všechny nepřátelské jednotky. Na konci tvého tahu: Způsob 2 poškození všem zmraženým nepřátelským jednotkám a pak zmraz náhodnou nepřátelskou jednotku.', flavorText: 'Na dně každého víru stojí trůn. Nic, co k němu klesne, už nevystoupí.' },
  // Added with the set's artwork
  vod_void_wyrmling: { name: 'Dráče Prázdnoty', description: 'Poslední dech: Rozlož náhodnou nepřátelskou jednotku.', flavorText: 'Vylíhlo se ve stínu černého slunce. Jiné nikdy nevidělo.' },
  vod_umbral_drake: { name: 'Stínový drak', description: 'Vysátí. Při nasazení: Rozlož nepřátelskou jednotku.', flavorText: 'Jeho stín dopadne první. Na co dopadne, to se už nikdy úplně nevzpamatuje.' },
  vod_nihil_dragon: { name: 'Nihil, nerozžatý drak', description: 'Při nasazení: Rozlož náhodnou nepřátelskou jednotku a pak způsob 2 poškození všem rozloženým nepřátelským jednotkám.', flavorText: 'Draci starého slunce hořeli. Tenhle světlo místo toho polyká.' },
  vod_eye_of_the_abyss: { name: 'Oko propasti', description: 'Kdykoli nepřátelská jednotka zemře, lízni si kartu.', flavorText: 'Nemrká. Už nemá před čím se skrývat.' },
  emb_voidflame_wisp: { name: 'Bludička fialového plamene', description: 'Při nasazení: Uděl všem rozloženým nepřátelským jednotkám Hoření 2.', flavorText: 'Plamen, který hoří fialově. Živí se jen tím, čeho se dotkla Prázdnota.' },
  ver_hollow_husk: { name: 'Prázdná slupka', description: 'Poslední dech: Obnov tvému Strážci 3 životy a rozlož náhodnou nepřátelskou jednotku.', flavorText: 'Háj mu dal tělo. Hniloba mu dala smysl.' },
  irn_horned_overseer: { name: 'Rohatý dozorce', description: 'Kdykoli jiná spřátelená jednotka zemře, získá +1/+0 a ty získej 1 brnění.', flavorText: 'Počítá ztráty. Je jediný, kdo na nich vydělává.' },
  tid_nightwing_drake: { name: 'Drak nočních křídel', description: 'Při nasazení: Zmraz nepřátelskou jednotku. Pokud ovládáš jiného Draka, rozlož ji také.', flavorText: 'Loví nad černou vodou, kde ho nic neodráží.' },
  tid_deepmaw_horror: { name: 'Hrůza z hlubinného chřtánu', description: 'Při nasazení: Vrať všechny rozložené nepřátelské jednotky do ruky jejich vlastníka.', flavorText: 'Vynoří se z příkopu s jedním okem otevřeným a shnilé věci před ním prchají.' },
  neu_rift_wyrm: { name: 'Drak z trhliny', description: 'Výpad.', flavorText: 'Prošel trhlinou křídly napřed a trhlina se mu zavřela za ocasem.' },
  neu_carrion_raven: { name: 'Mrchožravý havran', description: 'Kdykoli nepřátelská jednotka zemře, získá +1/+1.', flavorText: 'Po každém zúčtování si přiletí pro svůj díl.' },
  neu_black_sun_idol: { name: 'Modla černého slunce', description: 'Stráž. Na konci tvého tahu: Rozlož náhodnou nepřátelskou jednotku.', flavorText: 'Nikdo ji nevytesal. Jednoho rána tam prostě stála, obrácená k nebi.' },
};

export default cards;
