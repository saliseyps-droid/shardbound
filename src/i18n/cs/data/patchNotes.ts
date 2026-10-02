import type { PatchNotesOverlay } from '../../overlayTypes';

const notes: PatchNotesOverlay = {
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
