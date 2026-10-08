import type { PatchNotesOverlay } from '../../overlayTypes';

const notes: PatchNotesOverlay = {
  '0.27.5': {
    title: 'Zarovnané portréty v obchodě',
    summary: 'Portréty všech frakcí v obchodě začínají nahoře.',
    sections: [['Obchod: frakce s menším počtem portrétů (třeba Mosazné dominium) už je nemá posunuté doprostřed boxu, všechny začínají nahoře.']],
  },
  '0.27.4': {
    title: 'Úpravy portrétů',
    summary: 'Dva portréty odcházejí z obchodu, dva jsou světlejší.',
    sections: [
      [
        'Portréty Děsivý vládce a Zakuklený přízrak byly staženy. Pokud sis některý koupil, zlato ti bylo vráceno.',
        'Portréty Přízračný král a Mrazivý elfí pán jsou světlejší.',
      ],
      ['Kurzor nad portrétem v obchodě je zase normální šipka místo lupy.'],
    ],
  },
  '0.27.3': {
    title: 'Názvy karet v poznámkách k verzi',
    summary: 'Názvy karet v poznámkách k verzi jsou zvýrazněné a portréty jde zobrazit ve velkém.',
    sections: [
      [
        'Poznámky k verzi: každý název karty je zvýrazněný. Najetím myší kartu uvidíš, kliknutím otevřeš velký náhled.',
        'Portréty Strážců: pravým klikem (na mobilu podržením) v obchodě, profilu nebo editoru balíčku portrét zvětšíš.',
        'Portréty Děsivý vládce a Zakuklený přízrak jsou víc přiblížené a světlejší, takže se v malém lépe čtou.',
      ],
    ],
  },
  '0.27.2': {
    title: 'Jedenáct nových portrétů Strážců',
    summary: 'Nové portréty v obchodě, panel Brawlu na úvodní obrazovce a přehlednější profil.',
    sections: [
      [
        'Jedenáct nových portrétů Strážců v obchodě: Vyhnaný vojevůdce, Karmínový drak a Ohnivý démon (Popelavá legie), Lesní elfka (Kruh Trnoboru), Děsivý vládce (Mosazné dominium), Zlatý orel a Hvězdná elfka (Konkláve Lumenu), Stínový tyran, Přízračný král a Zakuklený přízrak (Prázdný chór), Mrazivý elfí pán (Dvůr Jinovatky).',
        'Úvodní obrazovka ukazuje aktuální Brawl: oba fighty, které balíčky zdarma ještě můžeš vyhrát a kdy přijdou nové fighty, s prokliknutím přímo do Brawlu.',
      ],
      [
        'Profil na širokých obrazovkách: Sbírka a ekonomika se roztáhne přes dva sloupce, čísla jsou v dlaždicích vedle pruhů vzácnosti a portréty Strážců vyplní celou šířku s boxem pro každou frakci.',
      ],
      ['Pruh s tutoriálem na úvodní obrazovce vypadá zase jako dřív (nový pruh na obrazovce Hrát ho omylem přestyloval).'],
    ],
  },
  '0.27.1': {
    title: 'Přehlednější obrazovka Hrát',
    summary: 'Tutoriál má vlastní pruh nad herními režimy.',
    sections: [['Hrát: tutoriál se přesunul z režimů proti AI do vlastního pruhu nahoře, takže dlaždice režimů mají víc místa. Po dokončení zůstane pruh malý a nabídne zahrát si ho znovu.']],
  },
  '0.27.0': {
    title: 'Brawl',
    summary: 'Nový režim: dva fighty se zvláštními pravidly proti AI na úrovni Expert, nové každé tři dny.',
    sections: [
      [
        'Brawl (Hrát → Proti AI): dva fighty proti AI na úrovni Expert, hraješ s vlastním balíčkem. Každý fight spojuje dvě zvláštní pravidla a oba fighty nikdy nemají stejné.',
        'Každé tři dny (v 00:00 UTC) nahradí stávající fighty dva nové. První výhra v každém fightu dá balíček nejnovějšího setu zdarma.',
        'Pravidla: Ohnivý příval, Dlouhá zima, Dračí hnízdo, Krvavá aréna, Magická bouře, Sklad munice, Obléhání, Bohatá pokladnice, Poslední dech a Šampion. Platná pravidla vidíš v zápase v postranním panelu.',
      ],
    ],
  },
  '0.26.16': {
    title: 'Spodní proud',
    summary: 'Spodní proud na stupni III stojí 3.',
    sections: [['Spodní proud (talent Dvora Jinovatky), stupeň III: stojí 3 (dříve 2). Dál vrací nepřátelskou jednotku, která stojí 4 nebo méně.']],
  },
  '0.26.15': {
    title: 'Ledová trnitá křídla',
    summary: 'Ledová trnitá křídla už nejsou kopií Krupobití.',
    sections: [['Ledová trnitá křídla (epická): nově způsobí 2 poškození všem nepřátelským jednotkám, které už jsou zmrazené, a pak zmrazí všechny nepřátelské jednotky (dříve: zmraz všechny nepřátelské jednotky a způsob jim 1 poškození).']],
  },
  '0.26.14': {
    title: 'Kůra místo kůže',
    summary: 'Kůra místo kůže na stupni III dává +1/+1.',
    sections: [['Kůra místo kůže (talent Kruhu Trnoboru), stupeň III: první jednotka, kterou v tahu vyvoláš, dostane +1/+1 (dříve +1/+2).']],
  },
  '0.26.13': {
    title: 'R3-D3',
    summary: 'Do Dragon Realm přibyla nová legendární karta Mosazného dominia.',
    sections: [['Znak vzácnosti na kartách zůstává uprostřed, i když je popisek typu nebo značky dlouhý.'], ['R3-D3 (Mosazné dominium, legendární, Dragon Realm): 8 energie, 1/1, Konstrukt. Při nasazení: získá +1/+1 za každý bod brnění, který máš, a tvůj Strážce pak přijde o všechno brnění.']],
  },
  '0.26.12': {
    title: 'Doladění vyváženosti',
    summary: 'Míza z kořene se vrací na 2 energie a pár drobných posílení, z toho tři pro Mosazné dominium.',
    sections: [[
      'Míza z kořene (talent Kruhu Trnoboru), stupeň III: zpět na 2 energie (léčí dál 4). Za 1 energii dělala Kruh Trnoboru mnohem silnějším.',
      'Popelozubý nájezdník: teď 3/1 se Spěchem.',
      'Soumrakorohý drak: stojí 5 místo 6.',
      'Nýtová salva: způsobí 3 poškození místo 2.',
      'Sestavení (talent Mosazného dominia), stupeň III: stojí 3 místo 4.',
      'Parní kráčivec: 4/4 → 4/5.',
    ]],
  },
  '0.26.11': {
    title: 'Mrazoploutvý zvěd',
    summary: 'Mrazoploutvý zvěd je teď 2/1.',
    sections: [['Mrazoploutvý zvěd: 1/2 → 2/1.', 'Žeň: stojí 2 (od minulé aktualizace 1, předtím 3).']],
  },
  '0.26.10': {
    title: 'Úpravy talentů Strážců',
    summary: 'Spodní proud jde použít ob tah; Kůra místo kůže a Míza z kořene se mění na stupni III.',
    sections: [[
      'Spodní proud (talent Dvora Jinovatky): po použití se během tvého dalšího tahu nabíjí a znovu ho použiješ až v tahu potom (ob tah). Tlačítko ukazuje, že se nabíjí.',
      'Kůra místo kůže (talent Kruhu Trnoboru), stupeň III: působí na jednu jednotku za tah (dříve dvě), pořád +1/+2.',
      'Míza z kořene (talent Kruhu Trnoboru), stupeň III: stojí 1 místo 2.',
      'Prázdné vyvolání (talent Prázdného chóru), stupně II a III: vyvolá Povstalé kosti 2/1 místo 2/2.',
      'Ošetřovatel háje: stojí 1 místo 2.',
      'Rytíř s trnitou přilbou: stojí 2 místo 3.',
      'Akolyta spoutaný jinovatkou: teď má Posílení 1.',
      'Popelozubý nájezdník: 3/2 → 4/1.',
      'Nyxarath, Prázdný drak: zničí nepřátelskou jednotku s útokem 4 nebo více (dříve 4 nebo méně).',
      'Žeň: stojí 1 místo 3.',
      'Fanatik v krvavém plášti: 3/3 → 3/4.',
      'Prázdná pijavice: 2/3 → 3/2.',
      'Víla rulíku: Poslední dech způsobí náhodnému nepříteli 2 poškození (dříve 1).',
      'Nářek chóru: stojí 1 místo 2.',
      'Obřad duševního ohně: stojí 1 místo 2.',
      'Soumrakorohý drak: 6/6 → 8/4.',
      'Pečeť Pána Propasti: stojí 5 místo 6.',
    ]],
  },
  '0.26.9': {
    title: 'Prázdné vyvolání a Meowchick',
    summary: 'Prázdné vyvolání je na stupni III levnější, ale bez léčení, a Meowchick je předělaný.',
    sections: [
      [
        'Prázdné vyvolání (talent Prázdného chóru), stupeň III: stojí 2 místo 3, ale už neobnovuje životy tvému Strážci.',
        'Meowchick: teď za 4 energie, 1/1. Při nasazení: dej všem svým jednotkám, včetně sebe, +2 k útoku. Kdykoli zaútočí, nejdřív získá +1 k útoku. Na konci tvého tahu způsobí 3 poškození náhodnému nepříteli. (Dříve za 4 energie, 3/4 s Bariérou, a když zaútočil, dal ostatním jednotkám v tomto tahu +1 k útoku.)',
      ],
    ],
  },
  '0.26.8': {
    title: 'Nový obrázek pro Bublináře Qinnyho',
    summary: 'Bublinář Qinny má nový obrázek karty.',
    sections: [
      ['Bublinář Qinny má nový, ostřejší obrázek karty.'],
      ['Balíček Dragon Realm už nemá průhledné mezery podél obou boků.'],
    ],
  },
  '0.26.7': {
    title: 'Kompaktní náhled karty na mobilu',
    summary: 'Velký náhled karty je na mobilu kompaktní okno, které se vejde bez posouvání.',
    sections: [['Mobily: velký náhled karty (podržení prstu na kartě) je na výšku i na šířku kompaktní okno a vejde se na obrazovku bez posouvání.']],
  },
  '0.26.6': {
    title: 'Bojiště ohně a ledu',
    summary: 'Dvě nová pozadí zápasů: rozžhavená láva a popraskaný led.',
    sections: [['Nová pozadí zápasů: lávové pole z černého kamene se žhnoucími trhlinami a zamrzlé pole z popraskaného modrého ledu, střídají se s ostatními.']],
  },
  '0.26.5': {
    title: 'Nové bojiště',
    summary: 'Nové pozadí zápasů: hradní hrací plocha v modré a zlaté.',
    sections: [['Nové pozadí zápasů: heraldická hradní hrací plocha v modré a zlaté, střídá se s ostatními.']],
  },
  '0.26.4': {
    title: 'Opravy pro mobil: balíčky, aréna, Stráž',
    summary: 'Otevírání balíčků a výběr karet do arény na mobilu fungují správně a rámeček Stráže sedí i na malé jednotky.',
    sections: [
      [
        'Mobily: otevírání balíčků na výšku už neodsune karty nad horní okraj ani tlačítko Hotovo pod spodní; karty jsou po 3 + 2 a zavřený balíček se vejde i na šířku.',
        'Mobily: při výběru karet do arény už další karta nevypadá jako vybraná na místě, kam jsi ťukl, a na šířku se nabízené karty vejdou na obrazovku.',
        'Mobily: rámeček Stráže kolem jednotky je teď poměrně stejně tenký jako na PC, žádný těžký pruh.',
        'Mobily: otevírání balíčků a aréna říkají ťukni a podrž prst místo klikni a pravé tlačítko.',
      ],
    ],
  },
  '0.26.3': {
    title: 'Portrét v bundlu Dragon Realm',
    summary: 'Bundle Dragon Realm teď obsahuje portrét Černého draka.',
    sections: [['Bundle Dragon Realm: portrét Strážce je teď Černý drak (dříve Safírový drak).']],
  },
  '0.26.2': {
    title: 'Názvy frakcí na kartách',
    summary: 'Texty karet jmenují frakce tak, jak je zná hra.',
    sections: [['Anglické texty karet Selunith, Glass Observatory, Pyroclast Sage a Blazeheart Fae mluvily o kouzlech „Astral“ a „Ember“; teď o kouzlech Konkláve Lumenu a Popelavé legie (čeština už byla správně).']],
  },
  '0.26.1': {
    title: 'Silnější Iron a Astral',
    summary: 'Spousta malých posílení pro Mosazné dominium a Konkláve Lumenu.',
    sections: [
      [
        'Mosazné dominium: Plated Bastion 2/4, Rytíř ocelové hlídky 2/4, Ironvow Axeman 3/4, Stormrivet Dreadknight 4/5, Éterodynové jádro 1/5, Bronzecoil Wyrm 6/7, Gearwright Apprentice 2/3, Assembly Foreman 3/4, Steamstride Walker 4/4, Overclock Engineer 3/4, Clockwork Commander 3/5, Gearspike Commander 4/5; Fortress Plating stojí 2, Titán egidy 7, Molten Bulwark 3.',
        'Konkláve Lumenu: Lumen Acolyte 1/3, Glimmerwing Sprite 1/3, Glimmer Wisp 2/3, Orrery Apprentice 2/4, Spellweaver Adept 4/4, Isera of the Violet Blade 4/5, Zahalená astromantka 4/5, Duskstar Sentinel 3/5, Moonlit Duelist 3/4, Starbound Inquisitor 4/5, Halberdier of the Last Light 5/5, Starveil Drake 5/7, Selenne 4/7.',
        'Talent Strážce Tkaní kouzel (stupně II a III): léčí tvého Strážce za 2 místo 1.',
      ],
    ],
  },
  '0.26.0': {
    title: 'Dragon Realm',
    summary: 'Nový set 70 karet: draci, dračí rytíři a víly ve všech frakcích.',
    sections: [
      [
        'Dragon Realm: 70 nových karet (48 jednotek, 16 kouzel, 3 relikvie, 3 lokace) pro všechny frakce, včetně 7 legendárních: Pyraxis, Glacivar, Nyxarath, Maelis, Selunith, Valdrek a Aurumvex.',
        'Draci, dračí rytíři a víly: spousta karet zesílí, když ovládáš draka, a víly mají vlastní bonusy.',
        'Balíčky Dragon Realm, bundle Dragon Realm v Obchodě a balíčky Dragon Realm v Aréně, v odměnách za úrovně a jako výhra v turnaji.',
      ],
      [
        'Popelavý dráček, Cinderbreath Drake, Skyrift Wyrm a Vulkara jsou teď Draci, takže fungují s novým setem.',
        'Karty, které zlevňují kouzla nebo Rytíře v ruce (Zahalená astromantka, Koruna Propasti), teď jasně říkají, že zlevní jen karty, které máš právě v ruce.',
      ],
    ],
  },
  '0.25.3': {
    title: 'Míření na PC',
    summary: 'Na PC zůstává hraná karta při výběru cíle v ruce a zprůhlední.',
    sections: [
      ['PC: při výběru cíle zůstane karta zvednutá v ruce jako dřív (místo přesunu do rohu), zprůhlední a klik projde skrz ni, takže tvého Strážce nebo jednotku pod ní uvidíš i vybereš.'],
    ],
  },
  '0.25.2': {
    title: 'Pozvánky přátel do turnaje',
    summary: 'Organizátor turnaje může jedním klikem pozvat přátele a velké turnaje ukazují všechna místa.',
    sections: [
      ['Čekárna turnaje: panel Pozvat přátele ukazuje tvé přátele; ty, kdo jsou online, pozveš jedním klikem. Po přijetí se rovnou připojí se svým vybraným balíčkem.'],
      ['Turnaje pro 16 a 32 hráčů ukazují všechna místa v kompaktní mřížce, stejně jako ty menší.'],
    ],
  },
  '0.25.1': {
    title: 'Plynulejší zápasy na každé obrazovce',
    summary: 'Várka oprav hratelnosti pro mobily, tablety i PC a k tomu záznam zápasu a detail Strážce na mobilu.',
    sections: [
      [
        'Mobily: tlačítko záznamu (pod tlačítkem odchodu) otevře záznam zápasu; ťuknutím na jméno karty si ji prohlédneš.',
        'Mobily: podržením prstu na schopnosti Strážce si ji přečteš, aniž by se použila.',
        'Pravým tlačítkem nebo podržením prstu na Strážci uvidíš jeho životy, brnění a obě schopnosti.',
      ],
      [
        'Mobily: první ťuknutí kartu jen zvětší, už ji omylem nezahraje.',
        'Mobily: podržení prstu na cíli kvůli prohlédnutí už na něj zároveň nepoužije kartu ani schopnost.',
        'Bojiště se po výměně ruky už neposune nahoru (tlačítko odchodu a nepřátelský Strážce byly oříznuté).',
        'PC: při výběru cíle se karta odsune stranou, takže už nezakrývá tvého Strážce.',
        'Oznámení už na mobilu nezakrývají tlačítka Pokračovat a Vzdát se.',
        'Tablety: krystaly energie už nezasahují pod Ukončit tah, karta při míření nezakrývá záznam a náhled karty nezůstává viset.',
        'Prázdný balíček už se nepřekrývá s počítadlem a právě líznutou kartu jde ťuknout hned.',
      ],
    ],
  },
  '0.25.0': {
    title: 'Začátek s průvodcem a plynulejší mobily',
    summary: 'Přísnější výuka s úvodem do světa, bohatší seznam přátel a spousta oprav pro mobily a menší obrazovky.',
    sections: [
      [
        'Výuka: začíná příběhem Aethry, šesti frakcemi a klíčovými slovy, která potkáš na kartách.',
        'Výuka: každý krok teď dovolí jen to, co po tobě chce, a když zkusíš něco jiného, poradí ti.',
        'Seznam přátel: uvidíš, kdy byl offline přítel naposledy online, a u každého přítele jeho úroveň, titul a kolik karet má sesbíraných.',
      ],
      [
        'Oblíbené balíčky jsou při výběru balíčku vždy první.',
        'Horní menu ukazuje popisky jen tehdy, když se všechny vejdou, jinak ikony, a na užších obrazovkách se přepne na menu ☰; na mobilu na šířku má dva sloupce.',
        'Mobily: esence je v hlavičce vždy vidět.',
        'Mobily: karta, která potřebuje cíl, se přesune do pravého dolního rohu, abys viděl všechny jednotky, a červený křížek zahrání zruší.',
      ],
      ['Mobily: karty už po ťuknutí nezůstávají zvětšené a při výběru cíle nic nebliká.'],
    ],
  },
  '0.24.4': {
    title: 'Pohodlnější zápas a editor balíčku',
    summary: 'Jména karet v záznamu zápasu, náhled pravým tlačítkem všude v zápase, schopnosti Strážce v barvě frakce a výroba karet přímo v editoru balíčku.',
    sections: [
      [
        'Záznam zápasu: jména karet jsou zvýrazněná zlatě; najetím myší kartu uvidíš.',
        'Zápas: pravým tlačítkem na kteroukoli viditelnou kartu (ruka, jednotky, relikvie, lokace, výměna ruky, právě zahraná karta, odhalené karty soupeře, jména v záznamu) otevřeš velký náhled karty.',
        'Schopnosti Strážce mají jemný nádech barvy jeho frakce.',
        'Editor balíčku: chybějící karty vyrobíš přímo na kartě (tlačítko Vyrobit s cenou v esenci); nová kopie jde rovnou do balíčku.',
      ],
      ['Balíček Legions of Shadow už nemá zářez na pravém okraji.'],
    ],
  },
  '0.24.3': {
    title: 'Lehčí online zápasy',
    summary: 'Online zápasy posílají zhruba 30× méně dat a hostovo bojiště se vždy přesně shoduje s hostitelovým.',
    sections: [
      [
        'Online: po každém tahu se místo celého stavu hry posílají jen změny, a to zkomprimované. Běžný zápas klesne zhruba ze 2 MB pod 100 KB.',
        'Oba hráči potřebují tuto verzi: pokud má přítel otevřenou starší, hra vás vyzve k obnovení stránky.',
      ],
      ['Online: drobné rozdíly mezi tím, jak bojiště vidí hostitel a host, se už nemohou hromadit.'],
    ],
  },
  '0.24.2': {
    title: 'Spolehlivé online spojení',
    summary: 'Online zápasy se teď spojí i mezi sítěmi, které se dřív navzájem blokovaly.',
    sections: [['Online, Ranked, turnaje i pozvánky přátel: když se dva hráči nemohou spojit napřímo (přísné domácí routery, mobilní data, firemní sítě), hra teď zápas přenese přes TURN server. Přímé spojení se pořád zkouší jako první.']],
  },
  '0.24.1': {
    title: 'Náhled karet v balíčku',
    summary: 'Najetím na kartu v seznamu balíčku ji uvidíš zvětšenou.',
    sections: [
      ['Editor balíčku: najeď myší na kartu v seznamu balíčku (pravý panel) a vedle se ukáže celá karta.'],
      ['Kampaň: portréty Strážců jsou zase vycentrované v rámečku a nevyčnívají vpravo dole.'],
    ],
  },
  '0.24.0': {
    title: 'Žebříčky, přátelé a úspěchy',
    summary: 'Měsíční sezóny se žebříčky a odměnami, seznam přátel s pozváním jedním klikem a 35 úspěchů.',
    sections: [
      [
        'Žebříčky pro Ranked proti AI a Ranked (objevují se v nich přihlášení hráči), s tvým pořadím i mimo první stovku.',
        'Měsíční sezóny: na začátku každého měsíce dostaneš odměnu podle nejlepšího ranku v Ranked proti AI, od 100 zlatých za Bronz až po 1000 zlatých, 5 balíčků a 400 esence za Korunu. Pak ti rank klesne o šest (z Koruny začínáš na Diamantu III).',
        'Přátelé (potřebuješ cloudový účet): sdílej svůj kód přítele, přijímej žádosti, uvidíš, kdo je online nebo ve hře, a jedním klikem pozveš přítele do zápasu. Hra přes kód místnosti funguje dál jako dřív.',
        'Úspěchy: 35 cílů v boji, kampani, Ranked proti AI, Aréně, sbírce, frakcích a online hře. Každý se vyplatí jednou, ve chvíli odemčení; co už máš splněné, dostaneš hned.',
      ],
    ],
  },
  '0.23.0': {
    title: 'Vyvážení a doladění',
    summary: 'Úpravy vyváženosti pro Tide, Void, Iron a Ember, férovější výpadky online, výhodnější balení po 10 a spousta oprav rozhraní.',
    sections: [
      [
        'Skolky: 6 → 7 many.',
        'Kaelthar, Hranice duší: způsobí nejvýš 4 poškození (dříve 5).',
        'Tallys Hrozivý: 5/5 → 4/5.',
        'Hrobový šeptač: 1/1 → 1/2. Kryptolez: 2/2 → 2/3. Otevřený hrob: 2 → 1 many.',
        'Výheň Dominia: 3 → 2 many. Slévárna Ozubené věže: trvá 4 tahy (dříve 3). Rytíř ocelové hlídky: 1/3 → 2/3.',
        'Kaldera Kharzul: 3 → 2 many.',
      ],
      [
        'Obchod: k 10 balíčkům teď dostaneš 2 balíčky navíc, takže velké balení je vždy nejlevnější na kus.',
        'Ranked proti AI: další soupeř je pevně daný, dokud nezahraješ (odchodem z obrazovky už ho nepřerolíš), remíza ukončí sérii výher a Koruna vysvětluje body Koruny.',
        'Dlouhý text karty se zmenší, aby se vešel, a nejdřív skryje podtext, takže už nezasahuje do ikon útoku a životů.',
        'Mobily: okno výuky je u okraje a nezakrývá jednotky, které potřebuješ, výsledky se vejdou na šířku a zobrazí se i na výšku a cesta kampaně je na úzké obrazovce svislá.',
        'Výsledky ukazují čísla zkušeností, záznam zápasu uvádí správný režim a názvy strategií jsou přeložené.',
      ],
      [
        'Online: když se spojení přeruší a oba hráči jsou online, dostanou teď oba stejný výsledek (remízu) a během kontroly spojení už nikdo nemůže hrát dál.',
        'Online: po normálním vzdání už se neobjeví hláška o ztrátě spojení a hostitel po výpadku nepřijme cizího hráče.',
        'Turnaj: remíza se hraje znovu místo toho, aby se počítala jako prohra.',
      ],
    ],
  },
  '0.22.5': {
    title: 'Nové legendárky',
    summary: 'Do Fantasy Realms přibyly čtyři nové legendární karty: Bublinář Qinny, Elinda, Skolky a Qvido.',
    sections: [
      [
        'Bublinář Qinny (Konkláve Lumenu): 6 many, 4/5. Při nasazení: dej svým ostatním jednotkám Bariéru.',
        'Elinda (Kruh Trnoboru): 5 many, 3/5. Při nasazení: obnov všem spřáteleným postavám 3 životy. Kdykoli se spřátelená postava vyléčí, dej náhodné spřátelené jednotce +1 k útoku.',
        'Skolky (Dvůr Jinovatky): 6 many, 5/5. Při nasazení: zmraz všechny nepřátelské jednotky. Poslední dech: vrať náhodnou nepřátelskou jednotku do ruky jejího vlastníka.',
        'Qvido (Popelavá legie): 5 many, 3/4. Při nasazení: způsob 1 poškození všem nepřátelům a všem nepřátelským jednotkám uděl Hoření 2.',
      ],
    ],
  },
  '0.21.2': {
    title: 'Přehlednější Hrát',
    summary: 'Obrazovka Hrát teď ukazuje všechny režimy na první pohled a pod nimi tréninkové zápasy.',
    sections: [
      [
        'Hrát je teď rozcestník: proti AI Kampaň, Ranked proti AI, Aréna a Výuka; proti hráčům Ranked, Hra s přítelem a Turnaj.',
        'Každý režim ukazuje, jak na tom jsi: postup kampaně, tvůj rank, rozehranou arénu nebo dnešní vstup zdarma.',
        'Tréninkové zápasy s výběrem soupeře, obtížnosti a balíčku zůstávají pod režimy. Na mobilu jsou režimy první, dva vedle sebe.',
        'Režimy proti jiným hráčům mají vlastní průsvitné azurové dlaždice.',
      ],
    ],
  },
  '0.21.1': {
    title: 'Lepší výuka',
    summary: 'Výuka ukazuje, co udělat, na mobilu mluví o ťukání, učí prohlížet karty a na konci poradí, kam dál.',
    sections: [
      [
        'Poskakující šipka ukazuje na kartu, jednotku nebo tlačítko, o kterém krok mluví.',
        'Na mobilech a tabletech kroky říkají ťukni a podrž prst místo klikni, táhni a najeď myší, a okno s krokem už nezakrývá tvůj balíček ani tlačítka zvuku.',
        'Nový krok: jak si prohlédnout kteroukoli kartu a přečíst si její klíčová slova.',
        'Po výuce můžeš rovnou pokračovat do kampaně, k balíčkům nebo do editoru balíčků.',
      ],
    ],
  },
  '0.21.0': {
    title: 'Ranked proti AI',
    summary: 'Nový žebříček proti AI: vyšplhej z Bronzu až na Korunu a AI s každým rankem zesiluje.',
    sections: [
      [
        'Ranked proti AI (obrazovka Hrát): Bronz, Stříbro, Zlato, Platina a Diamant, každý se třemi divizemi, a nad nimi Koruna.',
        'Výhra dává hvězdu, prohra ji bere; tři hvězdy znamenají postup a od třetí výhry v řadě dává každá výhra hvězdu navíc. Ze Stříbra, Zlata a Diamantu už nikdy nespadneš.',
        'AI je s každou divizí ostřejší a s každou úrovní přináší vzácnější karty; od Diamantu má víc životů a na Koruně i energii navíc.',
        'Čím výš jsi, tím víc zlata za výhru, a první dosažení každé úrovně dá jednorázovou odměnu se zlatem, esencí a balíčky.',
        'Odchod nebo obnovení stránky během zápasu se počítá jako prohra.',
      ],
    ],
  },
  '0.20.1': {
    title: 'Tváře kampaně',
    summary: 'Každý Strážce v kampani má teď vlastní portrét.',
    sections: [['Strážci v kampani používají portréty z Obchodu, které k nim sedí (orčí dezertér, goblinní kutil, safírový drak…), na mapě i v zápase.']],
  },
  '0.20.0': {
    title: 'Poslední Střep',
    summary: 'Čtyři nové kapitoly kampaně dovádějí příběh do konce, s devíti novými bossy.',
    sections: [
      [
        'Kapitola VI, Hořící rozkvět: o padlé Střepy se přetahuje oheň s kořeny; boss Vulkara, Matka draků.',
        'Kapitola VII, Hodinová nebesa: Mosazné dominium závodí s Konkláve Lumenu; boss Omnifex, Prvotní montér.',
        'Kapitola VIII, Utopená hymna: Dvůr Jinovatky a Prázdný chór; boss Morrowgast, Leviatan hlubin.',
        'Kapitola IX, Poslední Střep: Aeon, Ysolde Třikrát korunovaná, Ignivar a závěrečná bitva s Rozťatou korunou.',
        'Pět nových schopností bossů a větší odměny za první vítězství v pozdějších kapitolách.',
      ],
    ],
  },
  '0.19.1': {
    title: 'Férové výpadky',
    summary: 'Přerušené spojení mezi dvěma online hráči je teď remíza, kampaň je rozdělená do záložek a balíček Legions of Shadow je čistě vyříznutý.',
    sections: [
      [
        'Online: když se spojení mezi vámi přeruší, ale oba hráči jsou pořád online, zápas končí remízou. Pokud soupeř opravdu odešel, pořád vyhráváš; pokud vypadlo tvoje připojení, je to pořád prohra.',
        'Kampaň: najednou se zobrazují nejvýš tři kapitoly, další jsou na vlastní záložce.',
      ],
      ['Obrázek balíčku Legions of Shadow už nemá kolem okrajů tmavý pruh a stín.'],
    ],
  },
  '0.19.0': {
    title: 'Legions of Shadow',
    summary: 'Nejnovější set se teď jmenuje Legions of Shadow, kampaň má dvě nové kapitoly a přišla velká várka oprav.',
    sections: [
      [
        'Nejnovější set se přejmenoval na Legions of Shadow a má nový obrázek balíčku. Tvoje karty i balíčky zůstávají.',
        'Kampaň, Kapitola IV – Legie stínu: čtyři zapřisáhlí Rytíři a Vorgrath, Hořící přísaha.',
        'Kampaň, Kapitola V – Stínový trůn: Azhrel, Kaelthar a závěrečná bitva s Rendoslavem.',
        'Rubové strany karet ukazují i ty, které teprve můžeš získat.',
        'Sbírka a editor balíčku na mobilu: filtry se otevírají ve vlastním panelu a dlouhým podržením si kartu prohlédneš.',
      ],
      ['Kostnicový kolos: teď stojí 5 a je 3/4, který může vyrůst až o +4/+4 (dříve 6 many, 5/6, až +5/+5).'],
      [
        'Posílení se přičte jen jednou u kouzel, která za podmínky dávají poškození navíc (Abyssal Flare, Frost Lance), a nikdy proti vlastní straně.',
        'Umlčení už nezabije zraněnou jednotku tím, že jí odebere bonus k životům.',
        '„Kdykoli tato jednotka zničí jednotku“ se spustí i tehdy, když zabije útočníka protiúderem.',
        'Relikvie spotřebují náboj, jen když jejich efekt opravdu proběhne.',
        'Spellweaver Adept teď dává samostatné zásahy po 2 náhodným nepřátelům, jak říká text.',
        'Jednotky s cílem při nasazení jde zahrát i bez cíle; popis Ochrany teď zmiňuje i efekty při nasazení.',
        'Vybraný portrét Strážce u balíčku zůstane i po načtení hry.',
        'Poškozený kód balíčku teď ukáže chybu místo toho, aby nic neudělal.',
        'Obnovení nebo zavření hry během zápasu v aréně, Ranked, turnaji nebo online se počítá jako prohra.',
        'Výpadek vlastního připojení už ti nepřinese výhru.',
        'Výsledek turnaje platí, jen když se zápas opravdu odehrál a oba hráči se shodnou.',
        'Přetočení hodin v počítači už nedává další arénu zdarma ani nové úkoly.',
        'Vzdání bezplatné arény před prvním zápasem nedává odměnu.',
        'Cloudové ukládání nezahodí změny provedené během přihlašování.',
        'Spousta oprav rozložení na mobilu a v češtině: tlačítka u balíčků, Lore, Nastavení, Kampaň, Úkoly, Profil, větší tlačítka v zápase.',
        'Data se zobrazují podle jazyka hry.',
      ],
    ],
  },
  '0.18.14': {
    title: 'Úhlednější Profil a Obchod',
    summary: 'Odměny za úrovně v Profilu jsou úhledně zarovnané a balíček setu v Obchodě už nemá barevný rámeček.',
    sections: [
      [
        'Odměny za další úrovně: u úrovní s více odměnami zůstává odznak úrovně na prvním řádku a zbytek se úhledně zalomí pod něj.',
        'Balíček setu v Obchodě už nemá barevný rámeček.',
      ],
    ],
  },
  '0.18.13': {
    title: 'Více titulů',
    summary: 'Tituly teď získáváš každých 5 úrovní místo 10 a přibyly čtyři nové.',
    sections: [
      [
        'Titul teď získáš každých 5 úrovní: k dosavadním přibyli Poutník (5), Spjatý s čepelí (15), Vyvolávač bouří (25) a Maršál trhlin (35).',
        'Pokud už jsi tyto úrovně přeskočil, nové tituly na tebe čekají v Profilu.',
      ],
    ],
  },
  '0.18.12': {
    title: 'Tišší hudba v zápase',
    summary: 'Hudba v pozadí hraje v zápase o polovinu tišeji a dvě nová tlačítka vypínají hudbu nebo zvuky.',
    sections: [
      [
        'V zápase hraje hudba v pozadí poloviční hlasitostí.',
        'Dvě tlačítka v levém dolním rohu hrací plochy vypínají a zapínají hudbu (nahoře) a zvukové efekty (dole).',
        'Stejné přepínače najdeš i v Nastavení vedle Ztlumit vše.',
      ],
    ],
  },
  '0.18.11': {
    title: 'Jeden zvuk pro zahrání karty',
    summary: 'Každá zahraná karta zní stejně jemně; výroba karty je potichu.',
    sections: [['Kouzla, relikvie a lokace teď při zahrání zní stejně jemně jako jednotky, místo magického zvuku.', 'Výroba karty už nevydává zvuk.']],
  },
  '0.18.10': {
    title: 'Posuvníky hlasitosti',
    summary: 'Posuvníky hlasitosti začínají na maximu a plná hlasitost je zhruba poloviční.',
    sections: [['Posuvníky hlasitosti teď začínají na hodnotách Celková 100, Hudba 80 a Zvukové efekty 100 a plná hlasitost je zhruba o polovinu tišší než dřív. Tvoje nastavení hlasitosti se jednou nastavilo na tyto nové výchozí hodnoty.']],
  },
  '0.18.9': {
    title: 'Jemnější zahrání karty',
    summary: 'Zahrání karty zní jako jemné otočení karty.',
    sections: [['Zahrání karty teď zní stejně jemně jako otočení karty při odhalování z balíčku.']],
  },
  '0.18.8': {
    title: 'Jemnější otevírání balíčků',
    summary: 'Otevírání balíčků a odhalování karet zní mnohem tišeji a jemněji.',
    sections: [['Otevření balíčku je tiché zašustění a každá odhalená karta jemné otočení. Vzácné, epické a legendární karty přidají jeden, dva nebo tři tiché tóny místo hlasitých fanfár.']],
  },
  '0.18.7': {
    title: 'Jemnější konec tahu',
    summary: 'Tišší zvuk konce tahu a žádný zvuk při spuštění zápasu.',
    sections: [['Konec tahu teď zní jako tiché dřevěné ťuknutí místo zaklapnutí knihy a je tišší.', 'Spuštění zápasu z obrazovky Hrát nebo z kampaně už nevydává zvuk.']],
  },
  '0.18.6': {
    title: 'Zvuky tahu',
    summary: 'Nové zvuky pro zahrání karty a konec tahu; zvonění na začátku tahu zmizelo.',
    sections: [
      [
        'Zahraná karta teď dopadne na stůl s měkkým plesknutím kůže.',
        'Konec tahu zazní jako zaklapnutí knihy.',
        'Staré zvonění na začátku tvého tahu zmizelo; slyšet je jen líznutí karty.',
      ],
    ],
  },
  '0.18.5': {
    title: 'Tišší zvuky',
    summary: 'Zvukové efekty jsou zhruba o polovinu tišší a tlačítka už necvakají.',
    sections: [['Nahrané zvukové efekty jsou zhruba o polovinu tišší.', 'Klikání na tlačítka v menu už nevydává zvuk.']],
  },
  '0.18.4': {
    title: 'Lepší zvuky',
    summary: 'V boji jsou skutečné zvukové efekty a hudba v pozadí hraje i během zápasu.',
    sections: [
      [
        'Útok teď zní jako máchnutí mečem a zásah jako seknutí, místo poskakujícího pípnutí. Líznutí karty zašustí, zahraná karta dopadne na stůl a vlastní nahrávky dostala i kouzla, Bariéra, mince, umírající jednotky a otevírání balíčků (nahrávky ve volném užití).',
        'Každý zvuk má několik variant s trochu jinou výškou, takže opakované útoky nezní pořád stejně.',
        'Hudba v pozadí teď hraje i během zápasu a neztichne.',
      ],
    ],
  },
  '0.18.3': {
    title: 'Opravy pro iPhone a telefony',
    summary: 'Menu na iPhonu zase funguje a obchod se vejde na displej telefonu.',
    sections: [
      [
        'iPhone: horní lišta a tlačítko menu už nejsou schované pod výřezem displeje a hodinami, takže menu jde na výšku zase otevřít. Odstup od výřezu a spodní lišty drží i zápasy, tlačítko pro opuštění zápasu, zprávy a úvodní obrazovka.',
        'Telefony: portréty Strážců se v obchodě vejdou na displej (tři v řádku) a nepřetékají přes okraj.',
        'Tvůj portrét Strážce se teď ukazuje i v seznamu a pavouku turnaje, při výběru Strážce v Aréně a při zakládání decku.',
        'Booster balíčky jsou seřazené od nejnovějšího setu, stejně jako obchod. Podnadpis obchodu zmiňuje i balíčky a portréty.',
      ],
    ],
  },
  '0.18.2': {
    title: '16 nových rubů karet',
    summary: 'Do obchodu přibývá druhá kolekce rubů karet.',
    sections: [
      ['16 nových rubů karet v obchodě za 300 až 750 zlata: hvězdy s drahokamy, mrazivá hvězda, oko Prázdna, měsíční srpek, dračí pečeť, mlhovina a další.'],
      [
        'Portréty Strážců jsou výrazně levnější: 150 zlata, nebo 250 za draky, lva, pandu a orla (dřív 400 a 600). Zlevní s nimi i Balíček Curse of the Abyss.',
        'Obchod ukazuje portréty Strážců pod ruby karet, seskupené podle frakcí vedle sebe.',
      ],
    ],
  },
  '0.18.1': {
    title: 'Balíček Curse of the Abyss',
    summary: 'Jednorázový balíček k nejnovějšímu setu: 10 boosterů, rub karet a portrét Strážce o 30 % levněji.',
    sections: [
      [
        'Obchod: Balíček Curse of the Abyss obsahuje 10 boosterů Curse of the Abyss, rub karet Hollow Vortex a portrét Strážce Mrazivý lich o 30 % levněji než po jednom. Jednou na účet.',
        'Pokud rub nebo portrét už máš, neplatíš za něj: cena počítá jen to, co ještě dostaneš, stále se slevou 30 %.',
      ],
    ],
  },
  '0.18.0': {
    title: 'Portréty Strážců',
    summary: '16 nových portrétů Strážců ke koupi v obchodě, které můžeš nastavit pro frakci nebo jednotlivý deck.',
    sections: [
      [
        'Obchod → Portréty Strážců: 16 nových portrétů, dva nebo tři pro každou frakci, za 400–600 zlata.',
        'Profil → Portréty Strážců: vyber portrét, který ukazují všechny decky dané frakce. V editoru může jednotlivý deck dostat vlastní portrét (nebo si nechat volbu z Profilu či výchozího Strážce).',
        'Tvůj portrét se ukazuje na úvodní obrazovce, v seznamech decků a na bojišti v zápasech, i soupeři online. Počítačoví soupeři se teď také objevují s různými portréty.',
      ],
    ],
  },
  '0.17.3': {
    title: 'Balanc: Curse of the Abyss',
    summary: 'Konkláve Lumenu a Kruh Trnoboru jsou o něco slabší, Prázdný chór o něco silnější.',
    sections: [
      [
        'Azurový vír už nelíže kartu (dál stojí 4 energie: způsob 2 poškození všem nepřátelským jednotkám).',
        'Úmluva slunečního zášlehu teď stojí 7 energie (dřív 6).',
        'Měděnkový rytíř: na konci tvého tahu obnoví 2 životy tvému Strážci (dřív 1 život všem spřáteleným postavám).',
        'Rytíř s trnitou přilbou je teď 2/3 (dřív 3/3).',
        'Kaelthar, Hranice duší teď stojí 5 energie (dřív 6).',
        'Žnec rohatého měsíce je teď 4 energie 4/4 (dřív 5 energie 5/4).',
      ],
    ],
  },
  '0.17.2': {
    title: 'Curse of the Abyss: další kouzla',
    summary: 'Do setu Curse of the Abyss přibývá dalších 15 kouzel, set má teď 75 karet. Obchod ukazuje nejnovější set jako první.',
    sections: [
      [
        'Dalších 15 kouzel v Curse of the Abyss (6 běžných, 4 vzácná, 3 epická, 2 legendární).',
        'Legendárky: Pečeť Pána Propasti (Poutníci, 6 energie): Převezmi kontrolu nad nepřátelskou jednotkou s cenou 5 nebo méně. Úmluva slunečního zášlehu (Konkláve Lumenu, 6 energie): Způsob 3 poškození všem nepřátelům. Obnov 3 životy všem spřáteleným postavám.',
      ],
      ['Obchod řadí balíčky od nejnovějšího setu.'],
    ],
  },
  '0.17.1': {
    title: 'Curse of the Abyss: kouzla',
    summary: 'Do setu Curse of the Abyss přibývá 15 kouzel, set má teď 60 karet.',
    sections: [
      [
        '15 nových kouzel v Curse of the Abyss pro všechny frakce (6 běžných, 4 vzácná, 3 epická, 2 legendární). Několik z nich odměňuje, když ovládáš Rytíře, například Kovaná přísaha, Plamen z Propasti a Uhlík přísahy.',
        'Legendárky: Koruna Propasti (Poutníci, 5 energie): Lízni si z balíčku 2 Rytíře. Rytíři v tvé ruce stojí o (1) méně. Křídla posledního světla (Konkláve Lumenu, 5 energie): Dej svým jednotkám +2/+2 a Ochranu.',
      ],
    ],
  },
  '0.17.0': {
    title: 'Turnaje až pro 32 hráčů',
    summary: 'Velikost turnaje si vybereš při jeho vytvoření; čím větší turnaj, tím větší ceny.',
    sections: [
      [
        'Velikost turnaje: pořadatel před vytvořením vybere 4, 8, 16 nebo 32 hráčů. Připojit se může až tolik přátel, prázdná místa obsadí boti.',
        'Pavouk ukazuje všechna kola: šestnáctifinále, osmifinále, čtvrtfinále, semifinále, finále a zápas o třetí místo.',
        'Ceny rostou s velikostí. 4 hráči: 250 / 100 / 50 zlata. 8: 400 zlata a booster Curse of the Abyss / 200 / 100. 16: 600 zlata a 2 boostery / 300 zlata a 1 booster / 150. 32: 1000 zlata a 3 boostery / 500 zlata a 2 boostery / 250 zlata a 1 booster.',
      ],
      ['Turnajové zápasy botů proti sobě se už neplánují dvakrát a víc takových zápasů najednou už pořadateli nezasekne hru.'],
    ],
  },
  '0.16.0': {
    title: 'Týdenní úkol, Aréna zdarma a kódy decků',
    summary: 'Větší úkol každý týden, jeden vstup do Arény denně zdarma, sdílení decků kódem a lepší odměny za úrovně.',
    sections: [
      [
        'Týdenní úkol: jeden větší úkol na týden (třeba „Vyhraj 10 zápasů“) za 150 zlata, 400 XP a booster Curse of the Abyss. Nový přijde každé pondělí, splněný počká, dokud si odměnu nevyzvedneš.',
        'Aréna: první vstup každý den je zdarma. Další vstupy stojí 300 zlata jako dřív.',
        'Kódy decků: tlačítko Sdílet u decku (v Deckách i v editoru) dá kód s kartami a schopnostmi Strážce. Decky → Importovat deck přidá deck z kódu; karty, které ještě nemáš, v něm zůstanou a budou označené.',
        'Odměny za úrovně: v Profilu je vidět, co dá dalších pět úrovní. Balíčky v odměnách se střídají ze všech tří setů a každá 10. úroveň dá navíc rub karet, který ještě nemáš.',
      ],
    ],
  },
  '0.15.1': {
    title: 'Ostřejší balíčky',
    summary: 'Obrázky balíčků jsou čistě vystřižené.',
    sections: [['Balíčky Kingdoms at War, Fantasy Realms a Curse of the Abyss mají teď čisté rovné okraje a celé zalepené pruhy nahoře i dole, bez zbytků tmavého pozadí a roztřepených rohů.']],
  },
  '0.15.0': {
    title: 'Účty a ukládání do účtu',
    summary: 'Přihlas se, ať se tvůj postup ukládá do účtu a můžeš pokračovat na jakémkoli zařízení.',
    sections: [
      [
        'Přihlášení přes Google nebo e-mailem a heslem: v Nastavení v části Uložení do účtu, nebo na úvodní obrazovce nového zařízení.',
        'Když jsi přihlášený, tvoje sbírka, balíčky, zlato, úkoly a postup se uloží do účtu pár sekund po každé změně. Hra dál funguje i offline a dožene to později.',
        'Na novém zařízení se po přihlášení načte tvůj postup. Když má zařízení i účet každý jiný postup, vybereš si, který si necháš.',
        'Do účtu ukládá vždy jen jedno zařízení. Když se přihlásíš jinde, předchozí zařízení ukáže upozornění a může pokračovat s nejnovějším postupem.',
      ],
    ],
  },
  '0.14.0': {
    title: 'Zápas o třetí místo',
    summary: 'Turnaje mají nově zápas o třetí místo.',
    sections: [
      [
        'Turnaj: poražení ze semifinále hrají zápas o třetí místo, souběžně s finále. Třetí místo vyhrává 50 zlata.',
        'Turnaj skončí, až dohraje finále i zápas o třetí místo.',
      ],
      ['Turnaj se už nezasekne, když hráč, který měl ještě hrát, mezitím odešel: zápas vyhraje jeho soupeř.'],
    ],
  },
  '0.13.5': {
    title: 'Balanc talentů: vyvolávání',
    summary: 'Vyvolávací talenty Prázdného chóru a Mosazného dominia jsou o něco slabší.',
    sections: [
      [
        'Prázdné vyvolání III: místo další Prázdné světlušky, když v tomto tahu zemřela spřátelená jednotka, obnoví 2 životy tvému Strážci.',
        'Nekonečný: Povstalé kosti až na úrovni III. Úroveň II vyvolá Prázdnou světlušku a obnoví 2 životy tvému Strážci.',
        'Sestavení III (dva Šrotoboti) teď stojí 4 energie (dřív 3).',
        'Montážní protokol II: +1/+0 a 1 brnění za každý Konstrukt (dřív +1/+1). +1/+1 s brněním zůstává na úrovni III.',
      ],
    ],
  },
  '0.13.4': {
    title: 'Viditelné umlčení',
    summary: 'Umlčené jednotky to teď ukazují, když se na ně podíváš.',
    sections: [['Když najedeš na umlčenou jednotku nebo si ji prohlédneš, karta má štítek „Umlčeno“ a přeškrtnutý text, takže je jasné, že už neplatí.']],
  },
  '0.13.3': {
    title: 'Spolehlivější připojení do turnaje',
    summary: 'Připojení do turnaje z jiné sítě teď čeká déle a samo to zkusí znovu.',
    sections: [
      [
        'Připojení do turnaje teď udělá až 3 pokusy po 20 sekundách, než to vzdá (dřív jeden pokus na 15 sekund). Přímé spojení mezi některými sítěmi projde až na další pokus.',
        'Když se to přesto nepovede, hláška řekne, že se sítě nedokázaly spojit, a poradí zkusit to znovu nebo přepnout síť. Dřív jen psala „Turnaj neodpovídá“.',
        'Turnajové zápasy mezi dvěma hráči čekají na každý pokus o spojení déle.',
      ],
    ],
  },
  '0.13.2': {
    title: 'Curse of the Abyss: třetí vlna',
    summary: 'Do setu Curse of the Abyss přibývá dalších 15 Rytířů, set má teď 45 karet.',
    sections: [
      [
        '15 nových Rytířů v Curse of the Abyss: 2 pro každou frakci a 3 Poutníci (6 běžných, 3 vzácní, 4 epičtí, 2 legendární).',
        'Legendárky: Rendoslav (Poutníci, 7 energie 6/6): Při nasazení: Lízni si z balíčku 2 Rytíře. Dej svým ostatním jednotkám +1/+1. Kaelthar, Hranice duší (Prázdný chór, 6 energie 5/5): Vysátí. Při nasazení: Způsob všem nepřátelským jednotkám 1 poškození za každou spřátelenou jednotku, která v této hře zemřela (nejvýš 5).',
      ],
      [
        'Obrázek balíčku Curse of the Abyss už nemá useknutý pravý horní a pravý dolní roh.',
        'Booster balíčky: sety jsou po dvou v řadě, takže třetí se přesune na další řádek a nemačkají se všechny tři vedle sebe.',
        'Počítačoví soupeři za Prázdný chór si po příchodu nových Rytířů zase skládají silnější balíčky.',
      ],
      [
        'Sylvara Trnokřídlá teď stojí 7 energie (dřív 6).',
        'Měděnkový rytíř teď na konci tvého tahu obnoví všem spřáteleným postavám 1 život (dřív 2).',
      ],
    ],
  },
  '0.13.1': {
    title: 'Curse of the Abyss: druhá vlna',
    summary: 'Do setu Curse of the Abyss přibývá 15 dalších Rytířů, set má teď 30 karet.',
    sections: [
      [
        '15 nových Rytířů v Curse of the Abyss: 2 pro každou frakci a 3 Poutníci (6 běžných, 3 vzácní, 4 epičtí, 2 legendární).',
        'Víc souhry Rytířů: Šarlatový zrádce přísah dá každému vyvolanému Rytíři +1/+1, Panoš šerých křídel si při smrti lízne Rytíře a Žoldnéř z Popelavé cesty se Sekerníkem železné přísahy zesílí vedle jiného Rytíře.',
        'Legendárky: Sylvara Trnokřídlá (Kruh Trnoboru, 6 energie 4/6): Na konci tvého tahu dej svým ostatním jednotkám +1/+1. Brannoch, Bronzová bašta (Mosazné dominium, 7 energie 6/8): Stráž. Při nasazení: Získej 2 brnění za každou jednotku, kterou ovládáš.',
      ],
    ],
  },
  '0.13.0': {
    title: 'Curse of the Abyss',
    summary: 'Nový set 15 Rytířů ze všech frakcí, včetně nové legendárky Liu Kano.',
    sections: [
      [
        'Nový set: Curse of the Abyss. 15 Rytířů ze všech frakcí (4 běžné, 4 vzácné, 3 epické, 4 legendární). Jeho balíčky jsou v obchodě za obvyklé ceny a dají se vyhrát i v Aréně.',
        'Nová značka karet: Rytíř. Rytíř soumračných křídel si lízne z balíčku Rytíře a Hlídka v rudém plášti zesílí, když už ovládáš jiného Rytíře.',
        'Legendárky: Vorgrath, Hořící přísaha (Popelavá legie, 7 energie 6/6): Při nasazení: Způsob 2 poškození všem nepřátelům. Azhrel, Utonulý šampion (Dvůr Jinovatky, 6 energie 5/6): Při nasazení: Zmraz všechny nepřátelské jednotky. Lízni si kartu.',
        'Liu Kano (legendárka Konkláve Lumenu, 6 energie, 5/5): Ochrana. Když sešleš kouzlo, způsob 2 poškození náhodnému nepříteli.',
        'Tallys Hrozivý přechází ze setu Fantasy Realms do Curse of the Abyss a je teď také Rytíř. Kopie, které vlastníš, ti zůstávají.',
      ],
    ],
  },
  '0.12.2': {
    title: 'Tallys Hrozivý',
    summary: 'Do setu Fantasy Realms přibývá nová legendárka Prázdného chóru.',
    sections: [['Tallys Hrozivý (Prázdný chór, Legendární, 6 energie, Nemrtvý 5/5): Stráž. Při nasazení: Znič náhodnou nepřátelskou jednotku.']],
  },
  '0.12.1': {
    title: 'Balanc talentů',
    summary: 'Vyvolávací schopnosti Prázdného chóru a Mosazného dominia jsou o něco dražší.',
    sections: [
      [
        'Prázdné vyvolání teď stojí na všech úrovních 3 energie (dřív 2): příliš dobře se kombinovalo se Žní duší a Nekonečným.',
        'Sestavení teď stojí na všech úrovních 3 energie (dřív 2): příliš dobře se kombinovalo s Montážním protokolem.',
      ],
      ['Obrazovky už nehlásí „Na této obrazovce došlo k chybě“, když se hra aktualizovala, zatímco jsi ji měl otevřenou: sama se jednou znovu načte a otevře novou verzi.'],
    ],
  },
  '0.12.0': {
    title: 'Čeština',
    summary: 'Celá hra je teď i v češtině a kampaň hraje podle stejných pravidel jako ty.',
    sections: [
      ['Čeština: mezi angličtinou a češtinou přepneš v Nastavení nebo na uvítací obrazovce. Přeložené jsou všechny obrazovky, karty, schopnosti, soupeři, úkoly i novinky.'],
      [
        'Bossové kampaně už nezačínají s životy navíc, energií navíc ani jednotkami na stole: hrají podle stejných pravidel jako ty a liší se jen svými dvěma schopnostmi Strážce.',
        'Obtížnost kampaně je přeladěná tak, aby šla každá kapitola vyhrát se startovními balíčky: Kutil Vrtikolečko, Trnová vdova, Znovuzrozený Kharzul a Nekonečný chór hrají o něco mírněji.',
      ],
    ],
  },
  '0.11.0': {
    title: 'Hraj na mobilu',
    summary: 'Shardbound teď funguje i na telefonech.',
    sections: [
      [
        'Telefony: hlavní menu otevřeš tlačítkem ☰ a každá obrazovka se vejde na telefon držený na výšku.',
        'Zápasy se na telefonu hrají s telefonem na šířku: menší karty, schovaný záznam bitvy a připomínka k otočení, když ho držíš na výšku.',
        'Dotykové ovládání: klepnutím na kartu v ruce si ji zobrazíš ve velkém (i během soupeřova tahu), dalším klepnutím ji zahraješ, nebo ji rovnou přetáhni na bojiště. Přetažením jednotky na cíl útočíš a podržením prstu na kartě či jednotce si ji prohlédneš.',
        'Sbírka na telefonu: klepnutím na kartu se otevřou její detaily v panelu, který vyjede zespodu.',
        'Telefon na šířku: tvůj Strážce a jeho schopnosti sedí v levém dolním rohu a soupeřův v pravém horním, takže bojiště zůstává volné.',
        'Celá obrazovka na telefonu: na Androidu se zápas přepne na celou obrazovku při prvním klepnutí s telefonem na šířku (nebo použij Hrát na celou obrazovku v připomínce k otočení, která obrazovku i otočí). Přidej si Shardbound na plochu a hraj bez lišt prohlížeče, i na iPhonu.',
      ],
    ],
  },
  '0.10.1': {
    title: 'Nový znak',
    summary: 'Shardbound má nové logo.',
    sections: [
      [
        'Nový znak Shardboundu najdeš v záhlaví, na načítací a uvítací obrazovce, jako ikonu panelu prohlížeče a v postranním panelu zápasu nad záznamem bitvy.',
      ],
      [
        'Boostery: sada s několika neotevřenými boostery už neukazuje obrázek boosteru dvakrát.',
        'Aréna: jakmile v souhrnu běhu stiskneš Pokračovat, souhrn už zůstane zavřený; po návratu do Arény se znovu ukáže Vstoupit do Arény.',
      ],
    ],
  },
  '0.10.0': {
    title: 'Aréna',
    summary: 'Nový režim: sestav si balíček kartu po kartě a zjisti, jak daleko s ním dojdeš.',
    sections: [
      [
        'Aréna (vlastní položka v hlavním menu, vstup za 300 zlata): vyber si jednoho ze dvou Strážců a pak sestav 30 karet tak, že pokaždé vybereš jednu ze tří, z dané frakce a z Neutrálních.',
        'Nastav si schopnosti Strážce a pak se utkej až se 4 AI soupeři, kteří jsou s každou výhrou silnější. První porážka běh ukončí.',
        'Odměny podle výher: 0 – 1 booster a 50 zlata, 1 – 1 booster a 150 zlata, 2 – 2 boostery a 250 zlata, 3 – 2 boostery a 400 zlata, 4 – 3 boostery, 600 zlata a rubová strana, kterou ještě nemáš.',
        'Vybrané karty platí jen pro daný běh: nemusíš je vlastnit. Běh se ukládá, takže můžeš odejít a vrátit se; Odejít ho ukončí předčasně s odměnou za tvé dosavadní výhry.',
      ],
      [
        'Sbírka a editor balíčků: vybraná karta v první řadě už není nahoře oříznutá.',
      ],
    ],
  },
  '0.9.2': {
    title: 'Meowchick',
    summary: 'Do sady Fantasy Realms přibývá nová Neutrální Legendární karta.',
    sections: [
      [
        'Meowchick (Neutrální, Legendární, 4 energie, Zvíře 3/4): Bariéra. Kdykoli útočí, tvé ostatní jednotky získají v tomto tahu +1 k útoku.',
      ],
    ],
  },
  '0.9.1': {
    title: 'Kingdoms at War a Fantasy Realms',
    summary: 'Obě sady karet mají nová jména a nové obrázky boosterů a tvoje rubové strany najdeš ve Sbírce.',
    sections: [
      [
        'Shardfall se nově jmenuje Kingdoms at War a Tides of the Hollow Deep je teď Fantasy Realms, každá s novým ilustrovaným boosterem ve vysokém rozlišení.',
        'Rubové strany: nová položka v hlavním menu ukazuje rubové strany, které vlastníš. Tam si vybereš tu, kterou chceš používat.',
        'Obchod: tlačítka Koupit a Použít u všech rubových stran jsou zarovnaná ve stejné výšce.',
        'Boostery: tvoje neotevřené boostery jsou zobrazené stejně velké jako v Obchodě a stejně natočené.',
        'Rubové strany jsou teď ve vysokém rozlišení.',
        'Karty: textové pole pod jménem karty je panel s jemným nádechem barvy frakce, tenkým tmavším okrajem a decentním znakem frakce za textem.',
      ],
    ],
  },
  '0.9.0': {
    title: 'Rubové strany',
    summary: '16 rubových stran ke sbírání v Obchodě a nový vzhled boosterů Tides.',
    sections: [
      [
        'Rubové strany: v Obchodě se teď prodává 15 rubových stran za 300 až 1 250 zlata. Tvůj balíček na stole, karty v ruce tak, jak je vidí soupeř, i čerstvě otevřené boostery nosí rubovou stranu, kterou si vybereš.',
        'Každý Strážce začíná s Kompasem Strážce. Koupená rubová strana se rovnou použije; přepnout můžeš kdykoli tlačítkem Použít.',
        'AI soupeři a bossové si do každého zápasu přinesou náhodnou rubovou stranu. Online soupeři ukazují tu, kterou si vybrali.',
      ],
      [
        'Boostery Tides of the Hollow Deep: nový leštěný trojzubec s čepelemi ve tvaru listů nad vlnícím se mořem.',
      ],
    ],
  },
  '0.8.2': {
    title: 'Dobírací balíček',
    summary: 'Tvůj balíček leží na stole a Ukončit tah je zpět vpravo.',
    sections: [
      [
        'Oba balíčky teď leží na levé straně bojiště jako hromádka karet, která se při líznutí ztenčuje. Líznuté karty letí z balíčku do tvé ruky.',
        'Balíčky na stole jsou dvakrát větší a počet karet je vidět na horní kartě.',
        'Ukončit tah a Vzdát jsou zpět na pravé straně.',
        'Záznam bitvy vpravo uchovává celý zápas. Posuň se nahoru a přečti si starší řádky; dokud jsi dole, sleduje nové.',
        'Schopnosti Strážce sedí po obou stranách portrétu: první vlevo, druhá vpravo.',
      ],
    ],
  },
  '0.8.1': {
    title: 'Vyvážení talentů',
    summary: 'Schopnosti Strážců jsou upravené tak, aby se každá frakce blížila vyrovnanému poměru výher.',
    sections: [
      [
        'Prázdné vyvolání III: vyvolá Povstalé kosti a Prázdnou světlušku jen tehdy, pokud v tomto tahu zemřela spřátelená jednotka (dřív vždy obojí).',
        'Žeň duší: na úrovních I a II dvakrát za tah (dřív 3×); úroveň III zůstává na 3×, ale způsobí 1 poškození (dřív 2).',
        'Nekonečný III: vyvolá Povstalé kosti a obnoví 2 životy tvému Strážci (dřív kosti a světlušku).',
        'Kůra místo kůže: funguje na první jednotku, kterou v každém tahu vyvoláš (úroveň III: na první dvě).',
        'Pramen: II obnoví 1 život všem a další 1 tvému Strážci, III obnoví 2 (dřív 2 a 3).',
        'Míza z kořene III: obnoví 4 životy za 2 energie (dřív 3 životy za 1).',
        'Nýtované plátování III a Zesílený trup III: +1 brnění jen dokud ovládáš Konstrukt.',
        'Montážní protokol: dvakrát za tah.',
        'Rozdmýchaný hněv: I dá trvale +1 k útoku, II +1/+1, III +2/+1.',
        'Hvězdný vhled: Jiskra už není Pomíjivá; III navíc způsobí 1 poškození náhodnému nepříteli.',
        'Tajemná salva: na každé úrovni za 2 energie, 2 / 3 / 4 střely.',
        'Tkaní kouzel: +1/+1 už od úrovně I; II přidá 1 život tvému Strážci; III dá +1/+1 dvakrát.',
        'Prozíravost: teď se kontroluje na konci tvého tahu (1 / 2 / 3 nebo méně karet v ruce).',
        'Dotek jinovatky: od úrovně I způsobí 1 poškození; II stojí 1; III způsobí 2 poškození.',
        'Spodní proud: II stojí 2, III zasáhne jednotky s cenou až 4.',
        'Náhlý mráz: Střep není Pomíjivý od úrovně II (až 4 karty v ruce), III až 6 karet.',
        'Přílivová tůň: II navíc Zmrazí náhodnou nepřátelskou jednotku, III stojí 1.',
        'Nové výchozí sestavy: Konkláve Lumenu Hvězdný vhled III + Tkaní kouzel II, Dvůr Jinovatky Dotek jinovatky III + Přílivová tůň II.',
      ],
    ],
  },
  '0.8.0': {
    title: 'Talenty Strážců',
    summary: 'Pečeť Strážce je pryč. Každý balíček si teď staví vlastního Strážce z talentového stromu.',
    sections: [
      [
        'Talenty Strážců: editor balíčků má novou záložku Talenty. Každý Strážce má 5 schopností, každou s úrovněmi I, II a III.',
        'Každý balíček se naučí 2 schopnosti a utratí všech 5 talentových bodů: jedna schopnost dosáhne úrovně III, druhá úrovně II. Sestavu můžeš kdykoli zdarma změnit.',
        'Schopnosti jsou aktivní (klikni na šestiúhelník vedle svého portrétu, zaplať energii, jednou za tah) nebo pasivní (kulatý odznak, který se spouští sám a při spuštění se rozsvítí).',
        'Tvé staré balíčky dostaly výchozí sestavu své frakce: dřívější Pečeť na úrovni III a k ní další schopnost na úrovni II.',
        'Bossové kampaně a AI soupeři mají vlastní schopnosti. Bossové si ponechávají svou typickou sílu a přidávají k ní druhou.',
      ],
      [
        'Krabičky balíčků ukazují dvě schopnosti, které balíček používá. Ochrana teď chrání i před schopnostmi nepřátelského Strážce.',
      ],
    ],
  },
  '0.7.0': {
    title: 'Vyvážení frakcí',
    summary: 'Popelavá legie trochu chladne a Konkláve Lumenu dostává pomoc, kterou potřebovalo.',
    sections: [
      [
        'Vulkara, Matka draků: její Při nasazení teď způsobí 1 poškození všem nepřátelům (dřív 2).',
        'Planoucí palba: 5 střel (dřív 6).',
        'Popelozubý nájezdník: nově 3/2 (dřív 3/1).',
        'Mapa nebes: stojí 1 (dřív 2).',
        'Hranolový strážný: nově 2/6 (dřív 2/5).',
        'Knihovnice v měsíčním svitu: nově 2/4 (dřív 2/3).',
        'Badatelka komet: stojí 3 (dřív 4).',
        'Zhroucení nebes: stojí 4 (dřív 5).',
        'Krvavá smlouva: způsobí 4 poškození tvému Strážci (dřív 3).',
      ],
    ],
  },
  '0.6.3': {
    title: 'Jasnější šance',
    summary: 'Šance na Foil a Prizmatické karty uvidíš na první pohled a každá karta má teď vlastní ilustraci.',
    sections: [
      [
        'Boostery Tides of the Hollow Deep teď místo krystalu zdobí trojzubec vystupující z vln.',
        'Obchod: Šance a záruky teď obsahují tabulku se šancemi na Foil a Prizmatické karty, na kartu i na booster.',
      ],
      [
        'Obchod: tlačítka Koupit u 1, 5 a 10 boosterů jsou teď zarovnaná ve stejné výšce.',
        'Každá karta má teď vlastní ilustraci. Bažinná ropucha, Éterový střep, Jiskrový šíp, Hvězdný úlomek a Věštkyně spoutaná ledem dostaly nové obrázky.',
      ],
    ],
  },
  '0.6.2': {
    title: 'Třpytivější třpyt',
    summary: 'Foil a Prizmatické karty se plynule třpytí v plných barvách.',
    sections: [
      [
        'Foil karty teď mají jemný duhový lesk.',
        'Prizmatické karty dostávají silnější duhový lesk a duhový rámeček, který se neustále otáčí.',
      ],
      [
        'Lesk Foil a Prizmatických karet už při opakování necuká: teď plynule sjede celý z karty a zase zpátky.',
      ],
    ],
  },
  '0.6.1': {
    title: 'Úprava vyvážení',
    summary: 'Popelavá legie udeří silněji a Ostružinový kanec se řítí do boje ostřeji.',
    sections: [
      [
        'Jiskřivý skřítek teď má Spěch.',
        'Plamenný šleh teď způsobí 3 poškození (dřív 2).',
        'Hranicový ohař je teď 4/1 (dřív 3/2).',
        'Popelozubý nájezdník je teď 3/1 a už nemá Spěch (dřív 2/1 se Spěchem).',
        'Planoucí palba teď vystřelí 6 střel (dřív 4).',
        'Ostružinový kanec je teď 4/2 (dřív 3/3).',
      ],
    ],
  },
  '0.6.0': {
    title: 'Kapitánka Abandoneer',
    summary: 'K posádce se přidává nová Neutrální Legendární karta.',
    sections: [
      [
        'Nová Neutrální Legendární karta: Kapitánka Abandoneer (6 many, 5/4, Výpad). Při nasazení ukradne náhodnou kartu z nepřítelovy ruky. Poslední dech: dva Plavčíci 1/1 opustí loď a skočí na tvé bojiště.',
      ],
    ],
  },
  '0.5.2': {
    title: 'Prizmatický lesk',
    summary: 'Prizmatické karty se teď třpytí.',
    sections: [
      [
        'Prizmatické karty teď mají po celé ploše pohyblivý duhový lesk, podobný lesku Foil karet, ale v plných barvách.',
      ],
    ],
  },
  '0.5.0': {
    title: 'Malované karty',
    summary: 'Každá karta má teď ručně malovanou ilustraci.',
    sections: [
      [
        'Všechny karty dostaly malované ilustrace: ohniví rytíři a draci pro Popelavou legii, válečné stroje pro Železo, živé stromy a zvířata pro Zeleň, hvězdní mágové pro Astrál, kostlivci a upíři pro Prázdnotu, mořští rytíři a piráti pro Příliv.',
        'Kouzla, relikvie a lokace ukazují zářící pečeti a živelné plameny v barvách svých frakcí.',
      ],
    ],
  },
  '0.4.0': {
    title: 'Novinky',
    summary: 'Teď si můžeš přímo tady přečíst, co se v každé aktualizaci změnilo.',
    sections: [
      [
        'Novinky v hlavním menu. Tečka u položky menu ti dá vědět, když je co nového ke čtení.',
      ],
    ],
  },
  '0.3.0': {
    title: 'Online aréna',
    summary: 'Hodnocené hledání soupeřů, turnaje s přáteli a jednotky, které konečně vypadají jako jednotky.',
    sections: [
      [
        'Hodnocená hra: stiskni Najít zápas a spáruješ se s náhodným Strážcem, který zrovna také hledá. Stoupej od Bronzu až ke Koruně; výhry a prohry mění tvé hodnocení.',
        'Turnaje: založ turnaj, sdílej kód a zahraj si vyřazovací turnaj pro 4 hráče se 2–4 přáteli. Prázdná místa doplní boti. Vítěz získá 250 zlata, druhý 100 zlata.',
        'Každá karta jednotky teď ukazuje postavu – rytíře, mágy, vlky, draky, golemy, přízraky a další –, takže jednotky a kouzla snadno rozeznáš.',
      ],
      [
        'Online zápasy teď dávají stejné zlato, XP a postup v úkolech jako kterýkoli jiný zápas.',
        'Hra s přítelem teď místo odkazu používá krátký kód místnosti.',
        'Tahy trvají 2 minuty; odpočet se objeví v posledních 30 sekundách.',
      ],
      [
        'Balíčky smějí obsahovat jen karty frakce svého Strážce a Neutrální karty.',
      ],
      [
        'Přetahovaná karta mohla po puštění zůstat přilepená ke kurzoru. Teď se vždy vrátí do ruky, pokud není zahrána.',
      ],
    ],
  },
  '0.2.0': {
    title: 'Strážci a stoly',
    summary: 'Každá frakce dostává portrét Strážce, každý zápas novou hrací podložku.',
    sections: [
      [
        'Portréty Strážců pro všech šest frakcí: na bojišti, u tvých balíčků, v kampani i na profilu. Tvůj portrét odpovídá Strážci balíčku, se kterým hraješ.',
        'Sedm hracích podložek: každý zápas se hraje na náhodně vybraném stole.',
        'Výukový režim teď učí i Pečeť tvého Strážce.',
      ],
      [
        'Nové kouzelné pozadí za všemi menu.',
        'Oba Strážci teď stojí proti sobě uprostřed bojiště, ve zlatém rámu spolu se svými Pečetěmi, relikviemi a lokacemi.',
        'Každá Pečeť Strážce ukazuje symbol své frakce a editor balíčků vysvětluje, co tvá Pečeť dělá.',
        'Ukončit tah a Vzdát se přesunuly na levou stranu stolu.',
        'Větší oblast pro položení jednotky, která se objeví jen při přetahování jednotky.',
        'Větší portrét na domovské obrazovce a přehlednější kapitoly kampaně.',
      ],
      [
        'Balíček 5 boosterů stojí 450 zlata místo 500.',
      ],
      [
        'V detailech střetnutí v kampani chyběly portréty.',
      ],
    ],
  },
  '0.1.0': {
    title: 'Shardfall',
    summary: 'První vydání Shardboundu.',
    sections: [
      [
        '164 sběratelských karet napříč šesti frakcemi a Neutrálními, ve dvou sadách.',
        'Zápasy proti AI Strážcům na čtyřech obtížnostech a k tomu výukový režim s průvodcem.',
        'Kampaň s 13 střetnutími, bossy a odměnami za první vítězství.',
        'Boostery, výroba a recyklace, varianty karet a kompletní prohlížeč sbírky.',
        'Tvorba balíčků s kontrolou, křivkou many a automatickým doplněním.',
        'Denní úkoly, odměna za 7 dní přihlášení, 40 úrovní a historie zápasů.',
        'Online zápasy proti příteli.',
      ],
    ],
  },
};

export default notes;
