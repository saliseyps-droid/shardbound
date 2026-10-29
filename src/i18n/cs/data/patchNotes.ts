import type { PatchNotesOverlay } from '../../overlayTypes';

const notes: PatchNotesOverlay = {
  '0.76.0': {
    title: 'Lounge',
    summary: 'Zařiď si vlastní herní místnost: obklopuje 3D stůl v tvých zápasech.',
    sections: [
      [
        'Lounge: nové místo v menu s tvou herní místností ve 3D. Volně se v ní rozhlížej a zařizuj ji: každé očíslované místo bere jeden druh vybavení.',
        'Vybavení za zlato: stoly, koberce, podlahy, zdi, obraz, plakáty a prapory, světla, čtyři místa pro nábytek a kus na strop, od levných po honosné, klasické, fantasy i frakční.',
        'Kus si můžeš v místnosti vyzkoušet, než ho koupíš; vlastněné kusy kdykoli umístíš, přesuneš nebo odebereš.',
        'Tvoje místnost obklopuje 3D stůl v tvých zápasech. Online oba hráči vidí místnost hostitele.',
      ],
    ],
  },
  '0.75.1': {
    title: 'Stráž za hradbami',
    summary: 'Jednotky se Stráží stojí na 3D stole v hradbách.',
    sections: [
      [
        '3D stůl: jednotka se Stráží stojí v hradbách: kamenné zdi s cimbuřím na všech stranách a kulatá věž v každém rohu.',
        '3D stůl: soupeřovy karty v ruce už se do sebe neprolínají.',
        '3D stůl: karty na stole se vznášejí jen kousek nad ním místo vysoko a jsou o 15 % větší; tvoje ruka je blíž ke stolu a trochu větší.',
        '3D stůl: karty na stole se k tobě naklánějí mnohem méně; destičky Útoku a Životů mají větší ikonky a čísla.',
        '3D stůl: čísla Útoku a Životů sedí přesně uprostřed svých destiček.',
        '3D stůl: malovaná deska je větší, takže tvůj Warden stojí celý na ní.',
        '3D stůl: hradby soupeřovy jednotky se Stráží už nezakrývají soupeřova Wardena.',
        '3D stůl: oba balíčky leží u okraje desky, takže do nich plná řada sedmi jednotek už nezasahuje.',
        'Otevírání packů: záře vzácnosti kolem karty lícem dolů se teď hýbe s ní, zvedne se, když na ni najedeš, a otočí se s ní, když ji odhalíš.',
      ],
    ],
  },
  '0.75.0': {
    title: 'Nové destičky Útoku a Životů',
    summary: 'Útok a Životy jsou na 3D stole na destičkách v barvě frakce.',
    sections: [
      [
        '3D stůl: Útok a Životy jsou na malých tmavých destičkách ve spodních rozích karty, s okrajem v barvě frakce jednotky a mečem nebo srdcem vedle čísla.',
        '3D stůl: Stráž je ocelový rámeček ve tvaru štítu kolem karty a její ikonka je mezi ostatními ikonkami schopností.',
        '3D stůl: karty na stole jsou o 10 % větší.',
        '3D stůl: destičky Útoku a Životů jsou menší a čísla na nich větší.',
        '3D stůl: soupeř drží karty stejně velké jako balíčky na stole, celé vidět za jeho Wardenem.',
        '3D stůl: výchozí pohled je o kousek blíž a dívá se na stůl víc shora.',
      ],
    ],
  },
  '0.74.4': {
    title: 'Stráž, kterou je vidět',
    summary: 'Jednotky se Stráží jsou na 3D stole dobře poznat.',
    sections: [
      ['3D stůl: jednotka se Stráží má světlý ocelový rámeček a na horní hraně odznak se štítem.', '3D stůl: soupeřovy karty mají stejně lesklé ruby jako balíčky.'],
      ['3D stůl: soupeřovy karty už se nezabořují do stolu.'],
    ],
  },
  '0.74.3': {
    title: 'Čistší rámečky karet',
    summary: 'Jemnější rámečky karet na 3D stole a oprava kliknutí.',
    sections: [
      ['3D stůl: karty na stole ukazují obrázek skoro až k okraji, v tenkém rámečku ze starého zlata s rytou linkou; Stráž je úzký ocelový rámeček místo tlustého kamenného.'],
      ['3D stůl: po otočení pohledu se už nezahodí první kliknutí na schopnost Wardena (ani na nic jiného).'],
    ],
  },
  '0.74.2': {
    title: 'Opravy 3D stolu',
    summary: 'Kolo oprav 3D stolu.',
    sections: [
      [
        '3D stůl: líznuté karty, tvoje i soupeřovy, letí z balíčku do správné ruky (občas mířily jinam).',
        '3D stůl: soupeřova ruka je u vzdálené hrany stolu celá vidět.',
        '3D stůl: posílená jednotka ukáže zlatou jiskru místo velkého žlutého trojúhelníku, který vypadal jako varování.',
        '3D stůl: líznutá karta do ruky vyjede zdola místo letu ze špatné strany.',
        '3D stůl: karty na stole a balíčky odrážejí světla mnohem méně.',
      ],
    ],
  },
  '0.74.1': {
    title: 'Ruka o kousek výš',
    summary: 'Na 3D stole leží tvoje ruka těsně pod tvým Wardenem.',
    sections: [
      ['3D stůl: ve výchozím pohledu leží tvoje ruka jen kousek pod tvým Wardenem a každá karta je celá vidět.'],
      ['3D stůl: kamenný rám Stráže, led zmražení a zlatý obal Bariéry jsou přímo na kartě a vznášejí se a naklánějí s ní, místo aby ležely odděleně na desce přes její Útok a Životy.'],
    ],
  },
  '0.74.0': {
    title: 'Varianty karet na 3D stole',
    summary: 'Karty Foil, Prismatic a Gilded ukazují na 3D stole svou úpravu, plus spousta doladění.',
    sections: [
      [
        '3D stůl: karty Foil mají stříbrnou hranu a přes obrázek jim přejíždí pruh světla, Prismatic duhovou hranu a duhový pruh, Gilded černozlatý rám se zlatým pruhem.',
        '3D stůl: schopnost Wardena, kterou můžeš použít, žhne na okraji barvou Wardena a kolem ní krouží tři jiskry.',
      ],
      [
        '3D stůl: karty na stole a balíčky mají jemný lesk, ve kterém se odráží místnost, bez ostrých odlesků, které přepalovaly obrázky; Wardeni a jejich schopnosti mají saténový lesk.',
        '3D stůl: karty v ruce jsou ostřejší a karta držená u spodního okraje už necuká; záře jednotky připravené k útoku těsně obepíná kartu.',
      ],
    ],
  },
  '0.73.5': {
    title: 'Lepší pohled na karty',
    summary: '3D stůl se dívá víc shora a deska už neprosvítá kartami.',
    sections: [
      [
        '3D stůl: výchozí pohled se dívá na stůl o kousek víc shora, takže jsou karty líp čitelné.',
        '3D stůl: světelné efekty desky a středová čára už neprosvítají kartami, které na ní leží.',
        '3D stůl: zahratelné karty v ruce zase září zeleně, těsně kolem okraje; karty na stole a balíčky mají lesklý povrch.',
      ],
    ],
  },
  '0.73.4': {
    title: 'Ostrá ruka',
    summary: 'Karty v ruce na 3D stole jsou zase skutečné karty hry.',
    sections: [
      ['3D stůl: ruka ukazuje skutečné karty (ostrý text, obvyklá záře zahratelných karet, Foil, Prismatic i Gilded), nakloněné u přední hrany stolu, o kousek blíž ke stolu a víc natočené k tobě.'],
    ],
  },
  '0.73.3': {
    title: 'Čísla na svých drahokamech',
    summary: 'Opravy karet na 3D stole i v ruce.',
    sections: [
      [
        '3D stůl: čísla ceny, Útoku a Životů leží přímo na svých drahokamech a natáčejí se s kartou, místo aby se od nich vznášela nebo prosvítala jinými kartami.',
        '3D stůl: zahratelná karta v ruce má měkkou zelenou záři těsně kolem okraje místo tvrdého rámu.',
      ],
    ],
  },
  '0.73.2': {
    title: 'Wardeni a energie jako v náhledu',
    summary: 'Na 3D stole vypadají Wardeni i energie jako v prvním náhledu.',
    sections: [
      [
        '3D stůl: každý Warden leží na stole v tenkém zlatém rámečku místo na vysokém podstavci a má větší drahokam Životů.',
        '3D stůl: krystaly energie jsou větší, v řadách po pěti, a vedle nich je velké číslo energie.',
        '3D stůl: pohled je o kousek dál a tvoje ruka trochu dál od stolu; zahratelné karty v ruce mají jemný zelený okraj místo široké záře.',
        '3D stůl: soupeř drží karty vzpřímeně u vzdálené hrany, nakloněné k sobě, rubem k tobě.',
      ],
    ],
  },
  '0.73.1': {
    title: 'Stůl rozložený jako v náhledu',
    summary: 'Karty na 3D stole i v ruce mají velikost a polohu jako v prvním náhledu.',
    sections: [
      [
        '3D stůl: tvoje ruka leží níž a je menší u přední hrany stolu, takže tvůj Warden, jeho schopnosti i energie jsou pořád vidět.',
        '3D stůl: karty na stole mají velikost jako v náhledu a obě řady leží blízko středové čáry, s odstupem od Wardenů.',
      ],
    ],
  },
  '0.73.0': {
    title: 'Stůl jako v náhledu',
    summary: '3D stůl se teď hraje jako v prvním náhledu: karty se vznášejí a ruce se drží u stolu.',
    sections: [
      [
        '3D stůl: karty na stole se vznášejí nad ním, naklánějí se k tobě a jemně se pohupují; ta, na kterou ukážeš, se zvedne a narovná a její stín zůstane dole na stole.',
        '3D stůl: tvoje ruka je rozložená vějířem u přední hrany stolu a naklání se k tobě; při přibližování i rozhlížení zůstává u stolu. Soupeř drží své karty ve vzduchu nad vzdálenou hranou.',
        '3D stůl: schopnost Wardena, kterou můžeš použít, má kolem sebe na stole jasný pulzující zelený kruh.',
      ],
      ['3D stůl: oba balíčky leží stejně daleko od svého okraje desky; záře použitelné schopnosti Wardena už neprořezává její žeton.'],
    ],
  },
  '0.72.1': {
    title: 'Zpátky do výchozího pohledu',
    summary: 'Tlačítko a mezerník vrátí 3D stůl do výchozího pohledu, plus pár oprav.',
    sections: [
      ['3D stůl: tlačítko s kamerou vlevo dole (a mezerník) tě vrátí do výchozího pohledu.'],
      [
        '3D stůl: schopnost Wardena, kterou můžeš použít, se teď zvedne ze stolu a pulzuje světlem; schopnosti jsou o kousek dál od Wardena, aby je nezakrýval koupený rámeček.',
        '3D stůl: deska stolu je z dřevěných prken s letokruhy a suky, už ne z rozmazaných pruhů.',
      ],
      ['3D stůl: portrét Wardena (ani čísla na kartách) už při pohybu pohledu neujíždí ze svého místa.'],
    ],
  },
  '0.72.0': {
    title: 'Karty jako v náhledu',
    summary: 'Karty na 3D stole i v ruce teď vypadají jako v prvním náhledu stolu.',
    sections: [
      [
        '3D stůl: jednotky jsou karty tvarované jako skutečné, s celým obrázkem ve zlatém rámu, ikonkami schopností dole a vystouplými drahokamy Útoku a Životů; připravené, vybrané a zaměřitelné jednotky září rámečkem kolem karty.',
        '3D stůl: ruka je ze skutečných 3D karet s celým textem, drahokamem ceny a drahokamy Útoku a Životů; naklánějí se dozadu ke stolu a narovnají se, když na některou najedeš.',
      ],
      [
        '3D stůl: Warden s koupeným rámečkem se zvedá na podstavec i s rámečkem a žetony schopností Wardena už za ikonkou neukazují čtverec.',
        '3D stůl: balíčky leží o kousek víc vpravo; karty na stole mají mezi sebou víc místa pro své drahokamy.',
      ],
    ],
  },
  '0.71.2': {
    title: 'Wardeni ve 3D',
    summary: 'Wardeni, jejich schopnosti, balíčky i ruka vypadají na 3D stole plastičtěji.',
    sections: [
      [
        '3D stůl: portrét každého Wardena stojí na vyvýšeném zlatém podstavci a schopnosti Wardena jsou žetony se zlatým okrajem (šestiúhelníkové aktivní, kulaté pasivní), které září, když je můžeš použít.',
        '3D stůl: karty v ruce mají zlatou hranu jako karty na stole.',
        '3D stůl: balíčky jsou větší a leží blíž ke středu stolu; soupeřova ruka leží dál vzadu a nezakrývá jeho Wardena.',
        '3D stůl: otáčení pohledu je o polovinu méně citlivé a zastaví se před soupeřovou stranou stolu, jako v prvním náhledu.',
      ],
    ],
  },
  '0.71.1': {
    title: 'Místnost kolem stolu',
    summary: 'Pohyb kolem 3D stolu funguje jako v jeho prvním náhledu a kolem stolu je místnost.',
    sections: [
      [
        '3D stůl: tažením po volném stole (nebo po místnosti) se posouváš po místnosti; tažením pravým tlačítkem myši (nebo se Shiftem) otáčíš pohled, kolem celého stolu i nahoru a dolů.',
        '3D stůl: kolečkem myši můžeš oddálit a uvidíš celou místnost: stůl na koberci, kamenné stěny a pochodně. Výchozí pohled zůstává stejný; dvojklikem na stůl se do něj vrátíš.',
      ],
    ],
  },
  '0.71.0': {
    title: 'Rozhlédni se po stole',
    summary: 'Na 3D stole se teď můžeš rozhlížet a karty jsou čitelnější.',
    sections: [
      [
        '3D stůl: tažením po volném místě stolu (nebo pravým tlačítkem myši kdekoli nad ním) se rozhlížíš: do stran obcházíš stůl, nahoru a dolů nakláníš pohled. Při přiblížení tažením po volném stole posouváš pohled. Dvojklikem na stůl se zase posadíš.',
        '3D stůl: když najedeš na jednotku, hned vedle ní uvidíš celou její kartu.',
        '3D stůl: schopnosti na jednotkách jsou kulaté ikonky v barvách z návrhu (Vysátí, Ochrana, Spěch, Výpad, Jed, po kouzlu, na konci tahu…), s vysvětlením, když na ně najedeš.',
        '3D stůl: karty v ruce se naklánějí dozadu ke stolu a narovnají se, když na ně najedeš.',
      ],
      ['3D stůl: už žádné světlo za kurzorem: jeho odlesky na desce zhoršovaly čitelnost karet i malby. Karty se navíc tolik nelesknou.'],
    ],
  },
  '0.70.3': {
    title: '3D stůl prověřený',
    summary: 'Kolo oprav a dodělávek po celém 3D stole.',
    sections: [
      [
        '3D stůl: s podrženým mezerníkem můžeš přiblíženým stolem posouvat tažením myši; na dotykové obrazovce přibližuješ roztažením dvou prstů.',
        '3D stůl: když si líznete víc karet najednou, každá letí z balíčku do ruky postupně; spálené a vymleté karty už do ruky nelétají.',
        '3D stůl: Nastavení teď řekne, proč na tomhle zařízení zůstává stůl ve 2D (chybí 3D grafika, telefon).',
        '3D stůl: běží lehčeji: reliéf desky se počítá jen jednou pro každou desku, kamera i karty dělají v každém snímku méně práce a za výsledky zápasu stůl odpočívá.',
      ],
      [
        '3D stůl: soupeřovy karty mají zase svou tmavší zlatou hranu a krystaly energie spojence v co-op září v jeho barvách.',
        '3D stůl: kolečko myši přibližuje jen nad stolem; ostatní panely v zápase se posouvají normálně.',
        '3D stůl: karta se po najetí zvedá stejně plynule při jakékoli snímkové frekvenci.',
        '3D stůl: když se stůl nepodařilo spustit, vypnutí a zapnutí 3D ho zkusí znovu.',
      ],
    ],
  },
  '0.70.2': {
    title: 'Drobnosti na 3D stole',
    summary: 'Drobné opravy 3D stolu.',
    sections: [
      [
        '3D stůl: tvůj Warden zůstává uprostřed, ať máš krystalů energie kolik chceš.',
        '3D stůl: když na jednotku najedeš, její záře, čísla a ikonky se zvednou spolu s kartou.',
        '3D stůl: počet karet v balíčku sedí přesně na vršku hromádky.',
        '3D stůl: světla, záře a kouř všech desek sedí přesně na malbě (pirátské a hvězdná deska byly mírně vedle) a moře ani kouř už nepřetékají přes okraj desky.',
      ],
    ],
  },
  '0.70.1': {
    title: 'Opravy 3D stolu',
    summary: 'Opravy 3D stolu.',
    sections: [
      [
        '3D stůl: na spodní část tvého Wardena, jeho schopnosti a energii se zase dá kliknout; pruh s tvou rukou je už nezakrývá.',
        '3D stůl: kooperativní zápasy se svými třemi řadami se na stůl vejdou.',
        '3D stůl: zásah, který jednotku zabije, také ukáže své číslo a jiskry.',
        '3D stůl: když se 3D stůl nemůže načíst (třeba hned po aktualizaci), zápas se přepne na 2D desku místo prázdného stolu.',
        '3D stůl: časté přepínání mezi 2D a 3D už nevyčerpá grafickou paměť, a když grafická karta stůl zahodí, zápas se přepne na 2D.',
      ],
    ],
  },
  '0.70.0': {
    title: '3D stůl hotový',
    summary: 'Poslední úpravy 3D stolu: přizpůsobí se pomalejším počítačům a funguje ve všech druzích zápasů.',
    sections: [
      [
        '3D stůl: na počítači, kde běží pomalu, nejdřív vypne stíny a sníží rozlišení, a když to nestačí, nabídne přepnutí na 2D desku.',
        'Kooperativní zápasy, puzzle i Final Blow fungují na 3D stole; podstavec Wardena se roztříští spolu s jeho portrétem.',
        '3D stůl je pořád ve výchozím stavu vypnutý: zapneš ho v Nastavení nebo tlačítkem 2D / 3D v zápase.',
      ],
    ],
  },
  '0.69.0': {
    title: 'Živé desky na stole',
    summary: 'Animované desky teď ožívají i na 3D stole.',
    sections: [
      [
        '3D stůl: deska si nechává svou dýchající záři, plameny, sluneční paprsky, mlhu i kouř a její částice se teď pohybují ve vzduchu nad ní: uhlíky stoupají ze stolu, sníh a listí na něj padají, prach a světlušky se vznášejí nad kartami.',
        'Plameny a svíčky namalované na desce jsou na 3D stole skutečná světla a osvětlují karty v jejich blízkosti.',
      ],
    ],
  },
  '0.68.0': {
    title: 'Jiskry na stole',
    summary: 'Zásahy, léčení i smrt se na 3D stole teď odehrávají ve 3D.',
    sections: [
      [
        '3D stůl: každý zásah rozhodí po stole jiskry a záblesk světla, léčení a posílení stoupají jako zářící světélka a čísla vyplouvají nahoru čelem k tobě, i nad Wardeny.',
        'Jednotka, která zemře, se roztříští na kusy své karty, které se kutálejí po stole. Vyvolaná jednotka dopadne na stůl a útočící karta skočí obloukem na svůj cíl.',
        'Každá líznutá karta vyletí z vršku balíčku směrem k ruce a silné zásahy nebo zásahy do Wardena stolem trochu otřesou.',
      ],
    ],
  },
  '0.67.0': {
    title: 'Karty na stole',
    summary: 'Na 3D stole jsou teď jednotky, Wardeni, balíčky i energie skutečné předměty.',
    sections: [
      [
        '3D stůl: každá jednotka leží na stole jako silná karta se zlatou hranou a celým svým obrázkem a trochu se zvedne, když na ni ukážeš. Útok, Životy a ikonky schopností na ní zůstávají; celou kartu si přečteš v bočním panelu, když na jednotku najedeš.',
        'Tvůj Warden stojí na zlatém podstavci, oba balíčky jsou skutečné hromádky rubů karet, které se líznutím zmenšují, a energie je řada vysokých broušených krystalů zářících barvou tvé frakce.',
        'Stráž, Bariéra, zmražení i záře připravené, vybrané a zaměřitelné jednotky kopírují na stole tvar karet.',
      ],
    ],
  },
  '0.66.0': {
    title: '3D stůl na vyzkoušení',
    summary: 'Zápasy se teď dají hrát na 3D stole. Ve výchozím stavu je vypnutý a ještě se na něm pracuje.',
    sections: [
      [
        '3D stůl: deska leží jako podložka na dřevěném stole v šeré místnosti a její řezba chytá světlo lucerny, mihotavých svíček a lampy, která jde za tvým kurzorem. Hraje se úplně stejně jako dřív: karty táhneš na stůl, útočíš, vybíráš cíle.',
        'Zapneš ho v Nastavení (3D stůl) nebo tlačítkem 2D / 3D v levém dolním rohu zápasu. Kolečkem myši přiblížíš místo pod kurzorem, prostředním tlačítkem posouváš a dvojklikem na stůl ho uvidíš zase celý.',
        'V úsporném režimu, s omezenými animacemi a na telefonech zůstává 2D. Karty, Wardeni a efekty dostanou vlastní 3D podobu v dalších verzích.',
      ],
      ['Karta v ruce, kterou držíš u spodního okraje, už necuká nahoru a dolů.'],
    ],
  },
  '0.65.0': {
    title: 'Portál',
    summary: 'Legendárky bez vlastního vstupu teď přicházejí portálem.',
    sections: [
      [
        'Když zahraješ legendárku bez vlastního vstupu, bojiště ztichne a otevře se kruhový portál se zlatou obroučkou a vírem energie v barvách její frakce. Uvnitř je její obraz, do kterého tě to vtáhne, a její jméno ve zlatě. Pak se portál zavře jako clona.',
        'Přehraje se v zápasech i při otočení legendárky z balíčku. Draci a legendárky s vlastním vstupem si nechávají svůj.',
        'Ve výkonovém režimu, s omezenými animacemi nebo tam, kde 3D grafika není dostupná, se přehraje zlatý vstup jako dřív.',
      ],
    ],
  },
  '0.64.0': {
    title: 'Balíčky se otevírají ve 3D',
    summary: 'Otevření balíčku je teď malé kouzlo: balíček se roztočí, vybuchne a karty k tobě vyletí po spirále.',
    sections: [
      [
        'Balíček se vznáší ve 3D jako lesklá fólie, po které přejíždí světlo.',
        'Když ho otevřeš, točí se čím dál rychleji, nasává jiskry, smrští se do zářícího bodu a vybuchne. Karty vyletí po spirále, každá se stopou v barvě své vzácnosti, a dopadnou před tebe.',
        'Než kartu otočíš, prozradí její vzácnost zářící rámeček: modrý u vzácné, fialový se stoupajícími částicemi u epické a zlatý u legendárky, za kterou se točí sluneční paprsky, krouží kolem ní žhavé jiskry a čas od času z ní vyjde zlatá vlna.',
        'Ve výkonovém režimu, s omezenými animacemi nebo tam, kde 3D grafika není dostupná, se balíčky otevírají jako dřív.',
      ],
    ],
  },
  '0.63.0': {
    title: 'Roztříštěná koruna',
    summary: 'Na Home se teď za tlačítkem Play vznáší Roztříštěná koruna.',
    sections: [
      [
        'Home: za tlačítkem Play se ve 3D vznáší Roztříštěná koruna. Její krystalové zuby se pomalu otáčejí, jádro září, jeden zub chybí a dva se uvolnily a z koruny se neustále odlamují drobné Střepy, které odplouvají pryč.',
        'Koruna má barvy frakce tvého balíčku; bez balíčku je světle modrá jako Aether, na zlaté obroučce.',
        'Ve výkonovém režimu a s omezenými animacemi koruna stojí.',
      ],
    ],
  },
  '0.62.2': {
    title: 'Celé drahokamy',
    summary: 'Drahokamy útoku a životů už nejsou useknuté a Thornpelt Packmother ukazuje tlamu.',
    sections: [
      [
        'Drahokamy útoku a životů (i nábojů a trvání) na kartách měly špičky useknuté zkosenými rohy karty. Teď jsou vidět celé.',
        'Zlacená Thornpelt Packmother: obrázek je posunutý víc doprava, takže je vidět její otevřená tlama.',
      ],
    ],
  },
  '0.62.1': {
    title: 'Černá a zlatá',
    summary: 'Zlacené karty dostaly vzhled, jaký měly mít: černozlatý, s obrázkem, do kterého se díváš jako oknem.',
    sections: [
      [
        'Zlacené karty mají teď černý lakovaný rámeček s jemným zlatým lemem, zlaté jméno a černé drahokamy se zlatými čísly. Obrázek si nechává své vlastní barvy.',
        'Obrázek je okno: když nad zlacenou kartou pohneš ukazatelem, obrázek se posune za ním a zůstane jen slabý odlesk. Bez ukazatele obrázek pomalu plyne sám.',
        'Zlacené relikvie a lokace: text už se neschovává za drahokamem s náboji nebo trváním.',
        'Na bojišti má zlacená jednotka černý rámeček se zlatými okraji.',
      ],
    ],
  },
  '0.62.0': {
    title: 'Zlacené',
    summary: 'Nová, nejvzácnější úprava karet: Zlacená, ve vlastním balíčku Forbidden Spellbook.',
    sections: [
      [
        'Zlacené karty: obrázek vyplňuje celou kartu ve zlatém rámečku, jméno i drahokamy jsou zlaté. Obrázek žije: pomalu v rámečku plyne a dýchá, pulzuje v něm jemné světlo a přes kartu občas přejede slabý zlatý lesk. Na bojišti má zlacená jednotka zlatý lem a stejný živý obrázek.',
        'Forbidden Spellbook: nový balíček v obchodě za 2500 zlata. Pět zlacených karet ze všech setů a legendárka nejméně v každém desátém balíčku.',
        'Zlacené karty padají jen z balíčku Forbidden Spellbook. Vyrobit je nejde, ale rozložení jedné dá 16krát víc esence než normální kopie.',
        'Tvoje zlacené kopie jdou do balíčků jako první, před prizmatickými a foil, a vidí je i soupeři.',
        'Zlacené karty se počítají do achievementu Třpytivá sbírka.',
      ],
    ],
  },
  '0.61.1': {
    title: 'Piráti na dohled',
    summary: 'Pirátské desky jsou v zápasech zase vidět.',
    sections: [['Obě pirátské desky v zápasech ukazovaly jen rozmazané pozadí. Teď jsou vidět celé, jak mají být, a trochu světlejší, a všechny animace běží plynule na plnou frekvenci tvé obrazovky.']],
  },
  '0.61.0': {
    title: 'Pirátské stoly',
    summary: 'Mezi desky přibyly dvě nové animované pirátské.',
    sections: [
      [
        'Pirátské vlajky: mapa pokladu mezi rudou a černou pirátskou vlajkou. Lucerna a svíčka plápolají, zlaté mince se třpytí a ve světle lampy se vznáší prach.',
        'Pirátská paluba: lodní paluba s mořem všude kolem. Moře se pomalu převaluje, lucerna plápolá a truhla s pokladem i mince se třpytí.',
        'Obě pirátské desky jsou vždy vidět celé, nikdy se neořezávají, ať máš obrazovku jakkoli velkou.',
      ],
    ],
  },
  '0.60.1': {
    title: 'Prach ve světle svíček',
    summary: 'Nad oběma stoly v Hostinci v Přízračném hvozdu se vznáší jemný prach a dvě desky jsme vyřadili.',
    sections: [['Stoly v Hostinci v Přízračném hvozdu: nad oběma teď ve světle svíček poletují drobné prachové částečky, i kolem kouřícího šálku.', 'Vyřadili jsme další dvě desky: arkánní pečeť a smaragdovou síň.']],
  },
  '0.60.0': {
    title: 'Živé desky',
    summary: 'Každá herní deska ožila.',
    sections: [
      [
        'Animované desky: každá deska se teď hýbe. Zářící části dýchají, lampy a svíčky plápolají a každá deska žije po svém: uhlíky nad lávou a pekelným ohněm, rudý kouř vinoucí se kolem pekelného oltáře, sníh na zamrzlém jezeře, sluneční paprsky, mlha a světlušky v lese, padající listí v motýlí zahradě, hvězdy na nebi Dvojí přísahy, světlo svíčky a pára na stolech v Hostinci v Přízračném hvozdu.',
        'Na začátku tvého tahu se uprostřed desky zjeví znak Shardbound ve dvou otáčejících se runových kruzích.',
      ],
      ['Se zapnutým Omezeným pohybem zůstávají desky v klidu a jen rovnoměrně září. Úsporný režim ukazuje méně částic.', 'Dvě desky jsme vyřadili: fialový diamant a hradní gobelín.'],
    ],
  },
  '0.59.7': {
    title: 'I Stvořitel může padnout',
    summary: 'Saliho jde teď porazit: jeho schopnosti Strážce stojí mnohem víc a vracejí se pomaleji.',
    sections: [['Černé slunce, Sali: Povstání vládce a Volání zatmění teď stojí 5 energie a dají se použít jednou za tři tahy (dřív 2 energie, jednou za dva tahy). V testovacích soubojích je teď zhruba stejně těžký jako ostatní finální bossové.']],
  },
  '0.59.6': {
    title: 'Stvořitel zpomaluje',
    summary: 'Saliho schopnosti Strážce v Černém slunci jsou dražší.',
    sections: [['Černé slunce, Sali: Povstání vládce a Volání zatmění teď stojí 2 energie (dřív 1). Dál se dají použít jednou za dva tahy.']],
  },
  '0.59.5': {
    title: 'Nebe plné peří',
    summary: 'Azrafelovo peří padá po celý jeho příchod.',
    sections: [['Příchod Azrafela: černé peří a rudé jiskry už nespadnou v jednom pásu, ale padají po celé obrazovce až do konce příchodu.']],
  },
  '0.59.4': {
    title: 'Světlo a stín',
    summary: 'Příchody Arbitra, Halcyona a Azrafela jsou přepracované.',
    sections: [
      [
        'Příchod Arbitra je teď celý černobílý, včetně Tribunálu za ním.',
        'Příchod Halcyona: za ním se ze tmy vynoří zářící Perlová brána, nad hlavou se mu usadí svatozář a vzhůru stoupá zlatý prach.',
        'Příchod Azrafela: už žádné seky přes obrazovku; černé peří a rudé jiskry padají hned od prvního okamžiku.',
      ],
      ['Příchod Artemis od minulé aktualizace přišel o jiskry. Jsou zpátky.'],
    ],
  },
  '0.59.3': {
    title: 'Příchod Zástupu',
    summary: 'Halcyon, Azrafel a Arbitr mají vlastní příchody, Dvojí přísaha vlastní herní desku a delší úvod a souboj s Arbitrem je těžší.',
    sections: [
      [
        'Příchody: pro Halcyona se otevře Perlová brána; pro Azrafela vyjde Rudý měsíc a přes obrazovku se zkříží dva karmínové seky; a Arbitr má ze všech nejvelkolepější příchod: za ním Tribunál, paprsky soudu, jeho zlaté váhy se zhoupnou a ustálí a pak rozsudek v bílém záblesku a zlatém dešti.',
        'Dvojí přísaha: každý souboj se teď hraje na vlastní hvězdné desce Zástupu. V ostatních režimech může padnout jako kterákoli jiná deska.',
        'Úvod Dvojí přísahy je delší: nebeské město a zářící Perlová brána na vrcholu Duhového schodiště. Konec ukazuje rytíře Zástupu, jak sklánějí meče.',
      ],
      ['Souboj s Arbitrem: Váhy teď každý tah způsobí 3 poškození náhodné vaší jednotce a pak 2 poškození další (dřív 3 jedné).'],
    ],
  },
  '0.59.2': {
    title: 'Nikdo není ušetřen',
    summary: 'Arbitr teď soudí všechny ostatní jednotky, i ty na své straně, a jeho souboj je těžší.',
    sections: [
      ['Arbitr: Při nasazení teď zničí všechny ostatní jednotky, spřátelené i nepřátelské, a za každou získá +1/+1.', 'Souboj s Arbitrem v Tribunálu: začíná se 100 životy a 20 brnění (dřív 80 a 15).'],
      ['Obrázky Arbitra a Ostiaria už nemají na okraji bílý pruh.'],
    ],
  },
  '0.59.1': {
    title: 'Soudný den',
    summary: 'Tři rytíři Dvojí přísahy mají nové schopnosti: Arbitr, Solenne a Halcyon.',
    sections: [
      [
        'Arbitr (8 energie, teď 3/3): Při nasazení vynese rozsudek, zničí všechny nepřátelské jednotky a za každou získá +1/+1. (Dřív 7/7: zničil nepřátelskou jednotku a obnovil 5 životů.)',
        'Solenne, hlas Trůnu teď patří k Mosaznému dominiu (5 energie, teď 3/5): Při nasazení zmrazí všechny nepřátelské jednotky a lízne si kartu za každou zmrazenou, nejvýš 3. (Dřív astrální 4/5, která si lízla 2 karty.) Její souboj v Tribunálu je teď boss Mosazného dominia.',
        'Halcyon, kapitán Perlové brány: kromě Bariéry pro tvé ostatní jednotky při nasazení teď dá Bariéru i každé jednotce, kterou po něm vyvoláš.',
        'Souboj s Arbitrem: začíná s 80 životy a 15 brnění a už každý tah nerozdává dva náhodné zásahy, aby kvůli jeho novému rozsudku nebyl poslední souboj nevyhratelný.',
      ],
      ['Karta Halcyona ukazuje jeho korunu, místo aby ji nahoře uřízla.'],
    ],
  },
  '0.59.0': {
    title: 'Dvojí přísaha',
    summary: 'Nová kooperační kampaň: dva Strážci vystoupají k Zástupu nad Aethrou a postaví se před soud Arbitra, se spoluhráčem s umělou inteligencí nebo s přítelem.',
    sections: [
      [
        'Kampaň: Dvojí přísaha, kooperační kampaň 2 na 1 ve třech kapitolách (Duhové schodiště, Sedm nebes a Tribunál). Když se Koruna roztříštila, Arbitr Zástupu Aethru odsoudil a zapečetil nebe. Nebeský zákon neslyší osamělý hlas, a tak dva Strážci složí přísahu a stoupají spolu.',
        'Každý souboj se hraje se spoluhráčem: vyber frakci spoluhráče s umělou inteligencí, nebo zvol „Hrát místo toho s přítelem“ a otevři pro ten souboj online místnost. Příteli se souboj započítá, pokud ho má otevřený i ve své kampani; jinak ho hraje za odměny jako za cvičný zápas.',
        'Devět rytířů Zástupu, každý z nich boss s kooperačními schopnostmi, a každý dává vlastní kartu Anděla: šest epických a tři legendární (Halcyon, kapitán Perlové brány; Azrafel, anděl Rudého měsíce; a Arbitr). Bossové kapitol mají i vlastní pravidlo: Perlovou bránu, Rudý měsíc a Váhy.',
        'Jejich karty „spřátelená jednotka“ zasáhnou i jednotky spoluhráče, takže Ostiarius může ochránit nejlepší jednotku tvého přítele.',
        'Úvod, scéna u Tribunálu před Arbitrem a konec nad obrazy Empyrea a jeho Zástupu.',
        'Noční můra I a II u každého souboje, čtyři achievementy (s tituly Svědek Tribunálu a Rytíř Zástupu) a upoutávka na novou kampaň na úvodní obrazovce.',
      ],
    ],
  },
  '0.58.5': {
    title: 'Tři řady do kapsy',
    summary: 'Kooperace 2 na 1 se vejde na telefon otočený na šířku.',
    sections: [['Kooperace 2 na 1 na telefonu: tři řady jednotek se překrývaly a Strážce spoluhráče zakrýval tvůj balíček. Jednotky jsou teď menší, takže se vejdou všechny tři řady, a Strážce spoluhráče je u volného pravého okraje.']],
  },
  '0.58.4': {
    title: 'Hněv místo zemětřesení',
    summary: 'Boss v kooperaci už každý tah nezasahuje všechny vaše jednotky, takže sestavy z malých jednotek zase fungují.',
    sections: [
      [
        'Kooperace 2 na 1: Tyranovo zemětřesení (každý tah 1 poškození každé vaší jednotce) znemožňovalo celé sestavy Strážců z malých jednotek. Teď je z něj Tyranův hněv: na začátku svého tahu boss dvakrát způsobí 1 poškození náhodnému nepříteli.',
        'Aby boj zůstal vyrovnaný, má boss teď 60 životů a 10 brnění (dřív 50 životů). Dál si každý tah lízne kartu a získá 2 energie a v testovacích soubojích proti dvěma Strážcům s těžkou AI vyhrává zhruba v polovině případů.',
      ],
    ],
  },
  '0.58.3': {
    title: 'Boss, jak má být',
    summary: 'Boss v kooperaci 2 na 1 už není snadná kořist: dostal tři schopnosti, které vyrovnávají boj proti dvěma Strážcům.',
    sections: [
      [
        'Kooperace 2 na 1: osamělý boss hraje jeden tah na každé dva vaše a čelí dvěma bojištím, takže skoro nikdy nevyhrál. Teď si každý tah navíc lízne kartu (Tyranův vhled), získá 2 energie (Tyranův příval) a způsobí 1 poškození každé vaší jednotce (Tyranovo zemětřesení). 50 životů a energie navíc mu zůstávají.',
        'V testovacích soubojích proti dvěma Strážcům s těžkou AI teď boss vyhrává zhruba v polovině případů, takže dobrý tým má navrch.',
      ],
    ],
  },
  '0.58.2': {
    title: 'Víc místa',
    summary: 'Rámečky Strážce na úvodní obrazovce už nezasahují do jména a výběr bosse v kooperaci je přehlednější.',
    sections: [
      [
        'Úvodní obrazovka: rámeček Strážce (hlavně křídla a prapory) zasahoval do tvého jména a úrovně. Teď má vedle sebe dost místa.',
        'Hrát s přítelem, kooperace 2 na 1: výběr bosse mačkal šest úzkých dlaždic do řady a ořezával jména. Teď jsou tři vedle sebe a u každého portrétu je jméno.',
      ],
    ],
  },
  '0.58.1': {
    title: 'Bok po boku',
    summary: 'V kooperaci 2 na 1 je bojiště spoluhráče vycentrované stejně jako tvoje a bossovo.',
    sections: [['Kooperace 2 na 1: řada jednotek spoluhráče byla posunutá doprava kvůli jeho Strážci. Teď je v ose s řadou bosse i tvou a jeho Strážce je u levého okraje.']],
  },
  '0.58.0': {
    title: 'Dva proti jednomu, s přítelem',
    summary: 'Kooperace 2 na 1 teď funguje i online: přítel se k tobě může přidat jako spoluhráč proti bossovi.',
    sections: [
      [
        'Hrát s přítelem: při vytváření místnosti zvol „2 na 1 kooperace“, vyber bosse a jeho obtížnost a pošli příteli kód. Připojí se jako tvůj spoluhráč a bosse hraje tvoje umělá inteligence.',
        'Když příteli vypadne spojení, jeho Strážce převezme umělá inteligence a boj pokračuje.',
        'Kooperační souboje dávají odměny jako cvičný zápas.',
      ],
    ],
  },
  '0.57.0': {
    title: 'Dva proti jednomu',
    summary: 'Cvičné zápasy mají nový režim 2 na 1: ty a spoluhráč s umělou inteligencí společně proti bossovi.',
    sections: [
      [
        'Hrát → Cvičný zápas: přepni na „2 na 1 kooperace“ a postav se vybranému soupeři jako bossovi s 50 životy a energií navíc, bok po boku se spoluhráčem s umělou inteligencí za frakci, kterou vybereš.',
        'Hraješ první, pak tvůj spoluhráč, pak boss. Boss útočí a cílí na kohokoli z vás; tvá kouzla pro spojence pomáhají i Strážci a jednotkám tvého spoluhráče.',
        'Strážce, který padne, opouští stůl a druhý bojuje dál. Boss vyhraje, až když padnete oba.',
        'Strážce tvého spoluhráče, jeho energie, počet karet v ruce a bojiště jsou mezi tvým a bossovým.',
      ],
    ],
  },
  '0.56.1': {
    title: 'Čísla navrchu',
    summary: 'Rámečky Strážce už v zápase nezakrývají životy a brnění a tlačítka rámečků v Přizpůsobení se vejdou do dlaždic.',
    sections: [['Zápasy: s nasazeným rámečkem Strážce se čísla životů a brnění schovávala pod ním. Teď jsou nad každým rámečkem.', 'Přizpůsobení: tlačítka u rámečků („Používá se (kliknutím odebereš)“ a ceny z obchodu) už nepřetékají z dlaždic.']],
  },
  '0.56.0': {
    title: 'Noční můry pro každého hosta',
    summary: 'Každý souboj v kampani, který dává kartu, má teď také Noční můru, takže můžeš získat její Foil a Prismatic kopie a mít ji v balíčku dvakrát.',
    sections: [
      [
        'Noční můra I a II se teď otevírá u každého souboje v kampani, který dává vlastní kartu, nejen u bossů: u všech hostů hostince v Přízračném hvozdu a démonů Pekelné hlubiny. Dávají kartu ve verzi Foil (Noční můra I) a Prismatic (Noční můra II) a k tomu polovinu zlata a zkušeností co boss.',
        'Každá kopie se počítá, takže nelegendární kartu z kampaně můžeš mít v balíčku dvakrát.',
        'Na Noční můru II mají tyto souboje prokletí své frakce.',
      ],
      ['Karta vyhraná v boji: nápis „Přidáno do tvé sbírky“ má jemný tmavý stín, aby byl dobře čitelný na jakémkoli pozadí.'],
    ],
  },
  '0.55.3': {
    title: 'Uhlíky, ne reflektory',
    summary: 'Obrázky z Pekelné hlubiny už nejsou přepálené a upoutávka na Void Reckoning na úvodní obrazovce má obrázek v pozadí.',
    sections: [
      ['Pekelná hlubina: zesvětlené záběry z klipů a karty démonů byly přeexponované (červené se přepalovaly). Teď si drží temnou atmosféru a jen mírně otevírají stíny, v klipech i v Kodexu.'],
      ['Úvodní obrazovka: upoutávka na Void Reckoning má teď v pozadí obrázek z klipu Černého slunce, stejně jako upoutávka na Pekelnou hlubinu, a obě upoutávky jsou stejně vysoké.'],
    ],
  },
  '0.55.2': {
    title: 'Nová tvář vládce',
    summary: 'Azgaroth má nový obrázek a jeho příchod se tyčí nad jeho ohnivou katedrálou.',
    sections: [['Azgaroth, Devátý vládce: nový obrázek karty i portrét, rozžhavený a zářící na svém trůnu. Jeho příchod se teď tyčí nad hořící katedrálou Pyrethronu.']],
  },
  '0.55.1': {
    title: 'Páni přicházejí',
    summary: 'Čtyři páni Pekelné hlubiny mají vlastní příchody, kampaň vlastní pekelné stoly a úvodní obrazovka její upoutávku.',
    sections: [
      [
        'Legendární příchody pro čtyři pány Pekelné hlubiny. Vhessa se obtočí ve víru popela s vlnou hniloby, Ghul dvakrát udeří do kovadliny v prstenci roztaveného kovu a fontáně jisker a Rimegrave zmrazí jezero do ledové koruny. Azgaroth má ze všech nejvelkolepější: za ním Hořící trůn, jeho obří stín, sloupy ohně, otřes země a vlastní úsek hudby.',
        'Dva pekelné herní stoly. Každý souboj v Pekelné hlubině se hraje na nich, střídavě; jiné kampaně je nikdy nepoužijí (stejně jako stoly z hostince v Přízračném hvozdu), ostatní zápasy můžou padnout na jakýkoli stůl.',
        'Úvodní obrazovka: upoutávka na novou kampaň s obrázkem z jejího klipu, jejími legendárkami a odkazem rovnou dovnitř.',
      ],
      [
        'Pekelná hlubina: nejtmavší karty démonů a záběry z klipů jsou světlejší, Azgaroth nejvíc, a karty démonů jsou oříznuté výš, aby jim byla vidět hlava.',
      ],
    ],
  },
  '0.55.0': {
    title: 'Pekelná hlubina',
    summary: 'Pátá kampaň: sestup do ohně pod Aethrou a postav se Azgarothovi, Devátému vládci, o dvanáct démonických karet.',
    sections: [
      [
        'Nová kampaň Pekelná hlubina. Když se Koruna roztříštila, její nejtěžší Střep se propadl světem do ohně pod ním a Azgaroth, Devátý vládce, si ho vsadil do koruny. Teď se jeho legie chystají vylézt do Aethry a hořící kořen v Kaldeře vede až k jeho trůnu.',
        'Čtyři kapitoly po třech soubojích za 1000 zlata: Hořící kořen, Zbrojení legií, Zamrzlé jezero a Pyrethron, vládcova pevnost.',
        'Každý démon hraje o svou vlastní kartu a po porážce ti ji dá: dvanáct nových karet z kampaně, dvě pro každou frakci. Vhessa, Popelná zmije, Ghul, mistr výhně, Rimegrave ze Zamrzlého jezera a sám Azgaroth jsou legendární.',
        'Tři nové klipy: sestup do hlubiny na začátku, Hořící trůn těsně před posledním soubojem a konec Devátého vládce.',
        'Čtyři páni hlubiny mají po porážce i Noční můru I a II.',
        'Nové úspěchy: Do ohně, Výhně utichly, Královrah (s titulem Metla Pekelné hlubiny) a Hořící dvůr za všech dvanáct karet (s titulem Pán Hořícího dvora).',
      ],
    ],
  },
  '0.54.1': {
    title: 'Ceny v řadě',
    summary: 'Ceny rámečků v Obchodě jsou zase srovnané.',
    sections: [['Obchod: tlačítka s cenou pod rámečky Strážce jsou ve stejné výšce, ať je popis nad nimi jakkoli dlouhý.']],
  },
  '0.54.0': {
    title: 'Rámečky pro každého Strážce',
    summary: 'Čtyři nové rámečky Strážce v Obchodě pro jakoukoli frakci: dva statické za 2500 zlata a dva animované za 5000.',
    sections: [
      [
        'Obchod: rámečky Strážce pro všechny frakce. Stříbrný obsidián (leštěný černý kámen, stříbrná filigránová výzdoba a vyryté runy) a Královský purpur (samet a zlato, koruna s drahokamy a dvě korouhve) stojí 2500 zlata. Polární záře (vlnící se světlo nad pásem s měsícem) a Stínová křídla (tmavá křídla, která se za tvým Strážcem pomalu zvedají) jsou animované a stojí 5000 zlata.',
        'Každý rámeček si prohlédneš kolem vlastního Strážce a po koupi ho hned máš nasazený. Je vidět v každém zápase (i online soupeřům), na úvodní obrazovce a v profilu, ať hraješ s jakýmkoli balíčkem.',
        'Přizpůsobení: koupené rámečky jsou vedle frakčních, takže mezi nimi můžeš kdykoli přepínat.',
      ],
    ],
  },
  '0.53.8': {
    title: 'Patnáct rukopisů',
    summary: 'Kresby v Kodexu mají patnáct podob, které se střídají, a portréty Strážců jsou ostřejší.',
    sections: [
      [
        'Kodex: inkoustové kresby mají teď po pěti podobách runy, kresba jako tetování i sigily (hexagram, pentagram, osmicípá hvězda s okem, fáze měsíce a slunce). Sousední stránky nikdy nemají stejný styl a stejná podoba se nikdy neobjeví dvakrát po sobě.',
        'Kodex: runové nápisy už nenarážejí do pečeti v rohu.',
        'Portréty Strážců a bossů mají dvojnásobné rozlišení, takže jsou ostré i na velkých stránkách Kodexu, a obrázek z klipu hostince Wraithwood, který byl menší, teď odpovídá ostatním.',
      ],
    ],
  },
  '0.53.7': {
    title: 'Inkoust na okrajích',
    summary: 'Stránky Kodexu teď zdobí jemně vepsané runy, kresba jako tetování a magické sigily.',
    sections: [['Kodex: za každou stránkou jsou jemné inkoustové kresby: runové nápisy s pečetí v rohu, trnitá kresba jako tetování nebo velký magický sigil. Dvě stránky jedné dvoustrany se vždy liší, až po jednotlivé runy, a každá dvoustrana je jiná.']],
  },
  '0.53.6': {
    title: 'Konec dvojčat',
    summary: 'Sedm karet, které kopírovaly jinou kartu nebo dělaly totéž hůř, má teď vlastní efekt.',
    sections: [
      [
        'Spálené svítání (stejná karta jako Útok divokého ohně): Uděl všem nepřátelským jednotkám Hoření 2. Způsob nepřátelskému Strážci 2 poškození.',
        'Stínová akolytka (stejná karta jako Novicka chóru): Kdykoli jiná spřátelená jednotka zemře, obnov svému Strážci 2 životy.',
        'Rytíř v hrobovém plášti (slabší verze karty Rytíř spjatý žalozpěvem): Poslední dech: Způsob 2 poškození všem nepřátelským jednotkám.',
        'Hranice Propasti (dražší verze karty Pád hvězd): Způsob 3 poškození nepřátelské jednotce a jednotkám vedle ní. Uděl jim Hoření 2.',
        'Druhé svítání (slabší verze karty Přestavba): teď stojí 3. Očisti všechny spřátelené jednotky a dej jim +0/+2.',
        'Pouštní kapsář (slabší verze karty Úhoř volající příliv): Léčka. Kdykoli zaútočí, lízni si kartu.',
        'Kopiník s rudou šálou (slabší verze karty Legionář soumračné čepele): Výpad. Při nasazení: Dej spřátelenému Rytíři +1/+1.',
      ],
    ],
  },
  '0.53.5': {
    title: 'Ostřejší karty',
    summary: 'Všechny obrázky karet jsou teď dvakrát ostřejší.',
    sections: [['Každý obrázek karty má teď dvojnásobné rozlišení, čistší hrany a žádné kostičky z komprese. Nejvíc je to vidět na velkých kartách, v detailu karty a při příchodech legendárních karet.']],
  },
  '0.53.4': {
    title: 'Levnější oběť',
    summary: 'Nasyť Prázdnotu teď stojí 0 a lízne kartu.',
    sections: [['Nasyť Prázdnotu: stojí 0 (dřív 2) a lízne 1 kartu (dřív 2). Znič spřátelenou jednotku. Lízni si kartu.']],
  },
  '0.53.3': {
    title: 'Poctivý přebytek',
    summary: 'Recyklace přebytků už nepočítá karty z kampaně.',
    sections: [['Recyklace přebytků započítávala Foil a Prismatic kopie karet z kampaně vyhraných na Noční můru, a slibovala tak esenci, kterou nemohla dát: karty z kampaně recyklovat nejde. Do přebytků se už nepočítají a ani na jejich stránce už nejsou označené jako přebytek.']],
  },
  '0.53.2': {
    title: 'Narovnáno',
    summary: 'Samotná karta lícem dolů teď stojí rovně a v Balíčcích jsou vidět všechny balíčky.',
    sections: [
      ['Karta vyhraná v boji a karta z balíčku Divine Ascension byly lícem dolů nakloněné a narovnaly se až po otočení. Teď stojí rovně hned od začátku.'],
      ['Divine Ascension a Gears of Invention jsou teď v Balíčcích vidět, i když žádný nemáš, s odkazem do obchodu jako u ostatních balíčků.'],
    ],
  },
  '0.53.0': {
    title: 'Noční můry',
    summary: 'Každého poraženého bosse kampaně můžeš vyzvat znovu na Noční můru I a II, o Foil a Prismatic karty. Karty vyhrané v boji se teď otáčejí jako karty z balíčku.',
    sections: [
      [
        'Noční můra: když porazíš bosse kampaně, vyber si u boje Noční můru I. Boss hraje na úrovni Expert s plným výběrem karet, má o polovinu víc životů a 1 energii navíc.',
        'Porazíš-li Noční můru I, otevře se Noční můra II, kde má boss navíc vlastní prokletí. Grom třeba začíná za brněním a obléhacími zdmi, Maw of the Deep ti mrazí jednotky, Vulkara si stále bere draky a Hollow Host zdražuje tvé karty o 1. V panelu boje je vypsané všechno, co se mění.',
        'První výhry dávají kartu bosse ve verzi Foil (Noční můra I) nebo Prismatic (Noční můra II). Bossové, kteří kartu nedávají, dají 1 balíček navíc na Noční můru I a 3 na Noční můru II, k tomu zlato a zkušenosti.',
        'Bossové poražení na Noční můru mají na mapě kampaně rudé I nebo II.',
        'Nové úspěchy: Zlé sny (poraz bosse na Noční můru I) a Pán nočních můr (poraz všechny bosse na Noční můru II, s titulem Pán nočních můr).',
      ],
      [
        'Karta vyhraná v boji teď po zápase čeká lícem dolů. Otoč ji a odkryj se stejnými zvuky a efekty jako kartu z balíčku, legendární příchod nevyjímaje. Karta je také vidět v odměnách, kde si ji můžeš otevřít.',
      ],
    ],
  },
  '0.52.0': {
    title: 'Čerstvý inkoust',
    summary: 'Kodex dá vědět, když přibude nová stránka, a čtyři nové úspěchy za Kodex a rámečky Strážce.',
    sections: [
      [
        'Když klip nebo poražený boss zapíše do Kodexu novou stránku, objeví se zpráva, o kterou jde. Kliknutím na ni otevřeš knihu. Po zápase zpráva počká, až zápas opustíš.',
        'Tečka u Kodexu v menu ukazuje, že máš nepřečtené stránky. V knize jsou nové stránky označené a obsah ukazuje, kolik nových je v každé části.',
        'Nové úspěchy: Listování (zaplň 25 stránek Kodexu), Celý příběh (zaplň všechny stránky, s titulem Znalec dějin), Trojí rámeček (získej tři rámečky Strážce) a Galerie Strážců (získej všech šest, s titulem Strážce šesti rámečků).',
      ],
    ],
  },
  '0.51.0': {
    title: 'Rámečky věrných',
    summary: 'Šest animovaných rámečků Strážce, jeden pro každou frakci, za 100 výher.',
    sections: [
      [
        'Rámečky Strážce: vyhraj 100 zápasů s frakcí a získáš její animovaný rámeček. Cinder Legion hoří v černěném železe pod živými plameny, Thornweald Circle obepínají větve a listí, Brass Dominion točí ozubenými koly a tlakoměry, Lumen Conclave nese měsíc, Polárku a souhvězdí, Hollow Choir pálí černé svíce na ostnatém železném plůtku a Rimetide Court vyrůstají ledové krystaly a rampouchy z ledovcového ledu.',
        'Rámeček si vybereš v Přizpůsobení, kde u zamčených uvidíš, kolik výher ještě chybí. Ukazuje se kolem tvého Strážce v každém zápase (vidí ho i online soupeři), na úvodní obrazovce i v profilu, s jakýmkoli balíčkem.',
        'Se zapnutým omezením pohybu se rámečky nehýbou.',
      ],
    ],
  },
  '0.50.1': {
    title: 'Kniha na šířku',
    summary: 'Kodex funguje i na telefonu otočeném na šířku.',
    sections: [
      ['Kodex: na telefonu otočeném na šířku byla kniha malinká. Teď vyplní obrazovku, šipky jsou vedle ní a Obsah v rohu.'],
      ['Kodex: otočení stránky zní stejně jako vyložení karty.', 'Kodex: stránka se Saliho trůnem je otevřená všem, kdo už Saliho porazili.'],
    ],
  },
  '0.50.0': {
    title: 'Kodex Aethry',
    summary: 'Celý příběh jako kniha, kterou můžeš listovat a která se plní, jak hraješ.',
    sections: [
      [
        'Kodex (v menu a ze stránky Příběh a klíčová slova): otevřená kniha s otáčejícími se listy, která vypráví příběh po pořadí: Roztříštění a pak všechny kampaně kapitolu po kapitole, s bossy a s malbami a vyprávěním z filmových klipů.',
        'Stránky se plní postupně: stránky klipů, když je uvidíš, kapitoly, když se k nim dostaneš, a bossové, když je porazíš (s frakcí, kdy jsi je poprvé porazil a kolikrát a jakou kartu ti dali). Prázdné stránky prozradí, co je zaplní.',
        'Obsah přeskočí na každou část a ukáže, kolik z ní máš popsáno. Listuje se šipkami, klávesami se šipkami nebo přejetím prstem; každý klip si můžeš z jeho stránky znovu pustit.',
        'Klip před soubojem se Salim se teď počítá jako zhlédnutý, takže se otevře i jeho stránka.',
      ],
    ],
  },
  '0.49.2': {
    title: 'Kompaktní statistiky',
    summary: 'Statistiky balíčku se vejdou na jednu obrazovku.',
    sections: [['Statistiky balíčků: kompaktnější rozložení, výsledky podle módu a podle soupeře jsou vedle sebe, takže se všechno včetně karet vejde bez posouvání.']],
  },
  '0.49.1': {
    title: 'Klidnější statistiky',
    summary: 'Drobné opravy nových statistik balíčků.',
    sections: [
      [
        'Statistiky balíčků: okno při přepínání módů zůstává ukotvené ve stejné výšce, takže nadpis a záložky už neposkakují (podle obsahu se mění jen jeho spodní okraj).',
        'Dlaždice balíčků: Statistiky jsou teď tlačítko vedle Vybrat a Upravit, takže Smazat zůstává na jednom řádku s ostatními odkazy.',
      ],
    ],
  },
  '0.49.0': {
    title: 'Poznej svůj balíček',
    summary: 'Každý balíček má vlastní statistiky, rozdělené podle herního módu.',
    sections: [
      [
        'Statistiky balíčků: u každého balíčku otevři Statistiky a uvidíš úspěšnost, počet her, výhry a prohry, průměrnou délku hry a kdy jsi s ním hrál naposledy, pro všechny módy dohromady nebo pro každý zvlášť (trénink, kampaň, hodnocená hra proti AI, online, hodnocená hra, turnaje, brawl).',
        'V každém módu je také vidět, jak si balíček vede proti jednotlivým frakcím, a karty, se kterými nejvíc a nejméně vyhráváš, když je zahraješ (jakmile kartu zahraješ ve 3 hrách).',
        'Dlaždice balíčku rovnou ukazuje počet her a úspěšnost.',
        'Výsledky podle módů se dopočítají z tvých posledních 100 zápasů; soupeři a karty se počítají od této verze.',
      ],
    ],
  },
  '0.48.1': {
    title: 'Stůl v hostinci',
    summary: 'Ostřejší herní plochy a Hostinec v Přízračném hvozdu se hraje na vlastních stolech.',
    sections: [
      ['Hostinec v Přízračném hvozdu: každý souboj v kampani se teď hraje na jednom ze dvou nových hospodských stolů (korbel piva, kostky, mapy a hromádka kostí), které se střídají. Jiná plocha se tam neobjeví.'],
      [
        'Všech deset herních ploch se teď zobrazuje v plném rozlišení, takže jsou ostré i na velké obrazovce.',
        'Ohnivá a ledová plocha jsou méně ztmavené, takže na stole vypadají jasněji.',
      ],
    ],
  },
  '0.48.0': {
    title: 'Poznej své přátele',
    summary: 'Seznam přátel o každém příteli ukazuje mnohem víc.',
    sections: [
      [
        'Seznam přátel: pod úrovní a kartami teď u každého přítele vidíš jeho úroveň v hodnocené hře proti AI, počet splněných úspěchů, vyhrané souboje v kampaních (ve všech dohromady) a oblíbenou frakci (tu, se kterou má nejvíc výher).',
        'Když je přítel ve hře, vidíš, co právě hraje: hodnocenou hru proti AI, kampaň, arénu, brawl, turnaj a tak dále.',
        'U přátel se starší verzí hry uvidíš to, co jejich verze posílá; zbytek se objeví, až si hru aktualizují.',
      ],
    ],
  },
  '0.47.5': {
    title: 'Slabší hvězdy',
    summary: 'Slabší talent Hvězdný úlomek, ostřejší portréty z kampaní a oprava Saliho na telefonech.',
    sections: [
      ['Hvězdný úlomek (talent Strážce Lumenu): jeho Úlomky jsou teď 0/1 místo 1/1 (dál s Posílením 1). Úlomky z karet se nemění.'],
      ['Ostřejší ilustrace hostů z Hostince v Přízračném hvozdu (portréty i karty) a Strážců Nulského hvozdu z Cesty lampářů, nově vyřezané z upscalovaných maleb.'],
      ['Sali, Stvořitel: na některých telefonech zůstal jeho portrét na konci příchodu přesvícený.'],
    ],
  },
  '0.47.4': {
    title: 'Ostřejší klipy',
    summary: 'Malby ve filmových klipech ve vyšším rozlišení.',
    sections: [['Filmové klipy: 27 maleb z úvodu do světa a ze všech kampaní (Aethra, Černé slunce, Cesta lampářů a Hostinec v Přízračném hvozdu) má teď mnohem vyšší rozlišení, takže zůstanou ostré i na velké obrazovce a při pohybu kamery.']],
  },
  '0.47.3': {
    title: 'Přizpůsobení',
    summary: 'Portréty a rubové strany jsou teď pohromadě.',
    sections: [
      [
        'Nová obrazovka Přizpůsobení v menu (nahrazuje Rubové strany a je hned za Úkoly): na jednom místě vybereš portrét Strážce pro každou frakci i rubovou stranu karet. Portréty se sem přesunuly z Profilu.',
        'Patch notes se teď v angličtině jmenují News (česky dál Novinky).',
      ],
    ],
  },
  '0.47.2': {
    title: 'Světla víl',
    summary: 'Nové malby na konci úvodu do světa.',
    sections: [['Úvod do světa: poslední dva záběry mají nové malby zářícího lesa s motýly a vílou ve světle a záběr roztříštění je ostřejší.', 'Roztříštění Aethry: úvod začíná novou malbou údolí v měsíčním světle.']],
  },
  '0.47.1': {
    title: 'Trůn ve tmě',
    summary: 'Saliho trůn se teď tyčí před soubojem s ním i za jeho příchodem.',
    sections: [
      [
        'Černé slunce: před každým soubojem se Salim ukáže krátký klip s jeho trůnem ve tmě (dá se přeskočit).',
        'Sali, Stvořitel: jeho legendární příchod se teď odehrává před jeho trůnem, který při jeho příchodu fialově vzplane, a pod ním zazní úryvek hudby z klipů. Zbytek příchodu je beze změny.',
      ],
    ],
  },
  '0.47.0': {
    title: 'Ve tmě něco hučí',
    summary: 'Všechny filmové klipy mají strašidelnou ambientní hudbu.',
    sections: [
      [
        'Filmové klipy mají hudbu: pod každým úvodem i závěrem hraje temný ambient (Paranoid Truth od Tsorthana Grovea, volné dílo), každý klip z jiné části skladby. Pozvolna se rozezní, po skončení nebo přeskočení klipu se ztratí a řídí se hlasitostí a ztlumením hudby v nastavení.',
      ],
    ],
  },
  '0.46.2': {
    title: 'Nulský hvozd v novém',
    summary: 'Klipy Cesty lampářů mají úplně nové malby.',
    sections: [
      [
        'Úvod a závěr Cesty lampářů: nové malby Nulského hvozdu (postavy mezi stromy, svítící houby, zarostlé ruiny a fialová kaple na konci cesty) a vyprávění upravené tak, aby k nim sedělo.',
        'Závěr Černého slunce: nový poslední záběr na starou citadelu pod hojícím se nebem.',
        'Úvod do světa: ostřejší první záběr létajícího hradu.',
      ],
    ],
  },
  '0.46.1': {
    title: 'Úvod pro všechny',
    summary: 'Úvod do světa uvidí jednou i hráči, kteří začali hrát dřív, než existoval.',
    sections: [['Úvod do světa: pokud ho tvůj Strážce ještě neviděl, pustí se jednou při příštím otevření hry a pak už nikdy (pamatuje si to tvůj účet, takže na všech zařízeních). Nikdy nepřeruší zápas.']],
  },
  '0.46.0': {
    title: 'Kde to všechno začalo',
    summary: 'Nové hráče přivítá filmový klip o roztříštění Koruny.',
    sections: [
      ['Úvod do světa: klip o pěti záběrech vypráví, jak se Rozťatá koruna roztříštila na Střepy. Pustí se jednou, než probudíš svého prvního Strážce, a kdokoli si ho může znovu přehrát v Profil → Příběh a klíčová slova.'],
      ['Filmové klipy: tlačítko Přeskočit mohlo ujet za levý okraj obrazovky.'],
    ],
  },
  '0.45.7': {
    title: 'Pod černým sluncem',
    summary: 'Černé slunce teď začíná i končí filmovým klipem.',
    sections: [['Černé slunce: úvod o čtyřech záběrech nad létajícími ostrovy, které černé slunce vytrhlo do nebe, a závěr o třech záběrech po porážce Saliho. Oba se jednou pustí samy a znovu si je můžeš přehrát z obrazovky kampaně.']],
  },
  '0.45.6': {
    title: 'Kam padaly Střepy',
    summary: 'Roztříštění Aethry teď začíná i končí filmovým klipem.',
    sections: [['Roztříštění Aethry: úvod o čtyřech záběrech lesy, kam dopadly Střepy, a závěr o třech záběrech po porážce Rozťaté koruny. Oba se jednou pustí samy a znovu si je můžeš přehrát z obrazovky kampaně.']],
  },
  '0.45.5': {
    title: 'Fajfky jsou zpátky',
    summary: 'Poražené souboje v kampani zase ukazují zelenou fajfku.',
    sections: [['Kampaň: zelená fajfka u poražených soubojů byla schovaná pod portréty soupeřů. Teď je vidět v rohu každého dokončeného souboje.']],
  },
  '0.45.4': {
    title: 'Karty z kampaní na vlastní polici',
    summary: 'Sbírka umí ukázat odměny z kampaní jako samostatný set a řadit karty podle setu.',
    sections: [
      [
        'Sbírka: filtr setu má novou volbu Odměny z kampaní se všemi kartami jen z kampaní (legendy lampářů a hosté z Hostince v Přízračném hvozdu). Pod setem Core se už neukazují.',
        'Nové řazení: Řadit podle setu, v pořadí vydání, odměny z kampaní na konec.',
      ],
    ],
  },
  '0.45.3': {
    title: 'Nocležník se vždycky vrátí',
    summary: 'Bledý nocležník dostal vlastní přízračnou schopnost.',
    sections: [['Bledý nocležník (Hostinec v Přízračném hvozdu): nově 2 many 2/2 s Léčkou a „Poslední dech: Přidej si do ruky nového Bledého nocležníka“ (dřív 1/3, který za každé kouzlo získal +1 k útoku, tedy slabší Orrery Apprentice).']],
  },
  '0.45.2': {
    title: 'Trofeje z cesty i z hostince',
    summary: 'Sedm nových úspěchů pro Cestu lampářů a Hostinec v Přízračném hvozdu.',
    sections: [
      [
        'Cesta lampářů: Lucerna rozsvícena (dokonči kapitolu I), Poslední stránka (poraz Oblivii, titul Lampář) a Strážci plamene (měj Nyx, Vaela a Oblivii).',
        'Hostinec v Přízračném hvozdu: Místo u stolu (vyhraj tam první hru), Poslední objednávka vyřízena (dokonči kapitolu II), Zavírací hodina (poraz Dutého hostitele, titul Štamgast Přízračného hvozdu) a Plný lokál (měj všech dvanáct karet hostů, titul Hostinský).',
        'Dosavadní postup se počítá: úspěchy, které už máš splněné, se odemknou hned.',
      ],
    ],
  },
  '0.45.1': {
    title: 'Uhlíky nad hostincem',
    summary: 'Klipy Hostince v Přízračném hvozdu žhnou jako krb.',
    sections: [['Úvod a závěr Hostince v Přízračném hvozdu: plamenně oranžové nápisy a místo fialových jisker stoupají žhavé uhlíky a světlušky.']],
  },
  '0.45.0': {
    title: 'Hostinec v Přízračném hvozdu',
    summary: 'Čtvrtá kampaň: hraj karty proti mrtvým hraničářům a přízrakům ve strašidelné hospodě a vyhraj kartu každého, koho porazíš.',
    sections: [
      [
        'Nová kampaň Hostinec v Přízračném hvozdu: čtyři kapitoly po třech soubojích ve strašidelném hostinci hluboko v lese. Každou kapitolu odemkneš za 1000 zlata a kampaň začíná i končí vlastním filmovým klipem.',
        'Dvanáct nových karet jen z kampaně, dvě pro každou frakci: každý host hraje se svou vlastní kartou a při první porážce ti ji dá. Čtyři hostitelé kapitol (Mechoplášť, Bramhorn, Vdova v bílém a Dutý hostitel) jsou legendární.',
        'Dvanáct nových portrétů Strážců pro hosty hostince.',
      ],
      ['Karty jen z kampaně teď ukazují, ze které kampaně pocházejí.'],
    ],
  },
  '0.44.2': {
    title: 'Lovec chlupáčů',
    summary: 'Nasbírej všechny čtyři kočičí legendárky a získej nový titul.',
    sections: [['Nový úspěch Čtyři legendární tlapky: měj Artemis, Simbu, Scara a Arcimágyni Elinku a získáš titul Lovec chlupáčů.']],
  },
  '0.44.1': {
    title: 'Ostřejší Nulský hvozd',
    summary: 'Klipy Cesty lampářů mají nové, ostré malby krajiny.',
    sections: [['Úvod a závěr Cesty lampářů: nové malby Nulského hvozdu v plném rozlišení místo rozmazaných detailů a sevřenější závěr o třech záběrech.']],
  },
  '0.44.0': {
    title: 'Světla, kamera, Nulský hvozd',
    summary: 'Cesta lampářů začíná i končí krátkým filmovým klipem.',
    sections: [
      [
        'Filmové klipy v kampani: Cesta lampářů teď při prvním otevření začne krátkým úvodem a po porážce posledního bosse skončí krátkým závěrem. Ťuknutím přejdeš dál, nebo dáš Přeskočit. Oba si můžeš znovu pustit z obrazovky kampaně.',
      ],
    ],
  },
  '0.43.5': {
    title: 'Sbírka po sadách',
    summary: 'Profil ukazuje, kolik máš nasbíráno z každé sady.',
    sections: [['Profil: v části Sbírka a ekonomika je nový přehled Podle sady, kolik karet z každé sady máš, a k tomu legendy jen z kampaní.']],
  },
  '0.43.4': {
    title: 'Jasnější text karet',
    summary: 'Jiskra vhledu a Rozdmýchání teď přesně říkají, kdy si lízneš.',
    sections: [['Jiskra vhledu a Rozdmýchání: text teď zní „Pokud je to už aspoň tvoje 2. kouzlo v tomto tahu, lízni si kartu.“ Fungují stejně jako dřív: počítá se i samotné kouzlo, takže stačí jedno kouzlo před ním. Jednotky se nepočítají nikdy.']],
  },
  '0.43.3': {
    title: 'Vidíš soupeři do karet',
    summary: 'Na mobilu je vidět soupeřova ruka i kolik v ní má karet.',
    sections: [['Telefon na šířku: soupeřova ruka víc vykukuje na obrazovku, takže je líp vidět a dá se na ni snáz ťuknout, a odznak vedle ní pořád ukazuje, kolik má karet.']],
  },
  '0.43.2': {
    title: 'Přehlednější obchod',
    summary: 'Už koupené balíčky se přesunou pod boostery.',
    sections: [['Obchod: když si balíček koupíš, jeho nabídka se přesune pod boostery, takže nahoře vidíš jen to, co ještě můžeš získat.']],
  },
  '0.43.1': {
    title: 'Stvořitel každé kolo',
    summary: 'Když se tvůj Sali stane tvým Strážcem, jeho dvě schopnosti fungují každé kolo. Ostřejší a vycentrované obrázky Saliho a legend z Cesty lampářů.',
    sections: [
      [
        'Sali, Stvořitel: jakmile nahradí tvého Strážce, můžeš Povstání vládce a Volání zatmění použít každé kolo (dřív se jedno kolo nabíjely). Sali jako finální boss Černého slunce si nechává původní tempo.',
      ],
      [
        'Obrázek karty Saliho i jeho portrét Strážce jsou vycentrované, takže i jeho vstup na scénu.',
        'Nyx, Vael a Oblivie ukazují na kartě celou postavu a při legendárním vstupu jejich ostrý portrét z kampaně.',
        'Kampaň: štítek Vyzvednuto u odměny za první výhru je teď v řádku se zbytkem odměny.',
        'Stínový drak: oddálený obrázek karty, na kterém je vidět celá hlava.',
      ],
    ],
  },
  '0.43.0': {
    title: 'Cesta lampářů',
    summary: 'Nová vedlejší kampaň Nulským hvozdem. Každý boss kapitoly se k tobě přidá jako neutrální legenda, kterou jinde nezískáš.',
    sections: [
      [
        'Cesta lampářů: třetí kampaň, oddělená od obou dalších příběhů. 3 kapitoly po 3 soubojích proti strážcům Nulského hvozdu, kterých se dotkla prázdnota, každý s vlastním portrétem. Vybereš ji v přepínači kampaní; každou kapitolu odemkneš za 500 zlata.',
        'Nyx, lucerna Nulu (3 many, 2/5, Stráž): kdykoli sešleš kouzlo, obnoví tvému Strážci 2 životy. Odměna za kapitolu I.',
        'Vael, umíráček prázdnoty (6 many, 3/6, Stráž): při nasazení způsobí 2 poškození všem ostatním jednotkám. Odměna za kapitolu II.',
        'Oblivie, strážkyně poslední stránky (7 many, 5/6): při nasazení ti přidá do ruky kopie posledních 2 různých kouzel, která jsi v této hře seslal. Odměna za kapitolu III.',
        'Tyhle tři legendy jsou jen odměnou z kampaně: nepadají z boosterů a nejde je vyrobit ani recyklovat. Mají pomoct pomalejším balíčkům postaveným na kouzlech ubránit se plnému stolu soupeře.',
        'Během hry ukazuje ikona oka s číslem v pravém horním rohu herní plochy, kolik diváků tvůj zápas sleduje.',
      ],
    ],
  },
  '0.42.3': {
    title: 'Jeden účet, jeden postup',
    summary: 'Přihlášení na jiném zařízení teď rovnou načte tvůj účet.',
    sections: [
      [
        'Přihlášení na jiném zařízení se už neptá, který postup si nechat: hra se znovu načte rovnou s postupem uloženým v tvém účtu. Když zařízení poprvé propojíš s účtem, který ještě žádný postup nemá, nahraje se do něj postup ze zařízení jako dřív.',
      ],
    ],
  },
  '0.42.2': {
    title: 'Každá střela se počítá',
    summary: 'Planoucí palba ukáže všechny své zásahy, Očištění vrátí rozloženým jednotkám jejich text a denní odměnu už nejde vyzvednout dvakrát.',
    sections: [
      [
        'Planoucí palba a další kouzla, která zasahují víckrát: zásahy do stejného cíle se teď sečtou do jednoho čísla. Dřív se kreslily přes sebe, takže 5 střel vypadalo jako jediné -1 na třech cílech.',
        'Očištění teď rozložené jednotce vrátí její text: klíčová slova a schopnosti (třeba Regenerace) zase fungují a jejich odznaky se na jednotce zobrazí.',
        'Denní odměnu za přihlášení už nejde vyzvednout dvakrát hraním na dvou zařízeních: když jsi přihlášený, odměna se nabídne až po synchronizaci postupu s tvým účtem.',
      ],
    ],
  },
  '0.42.1': {
    title: 'Karty zůstanou na svém místě',
    summary: 'Stará kopie hry ti už nemůže vzít nové karty z kolekce a balíčků.',
    sections: [
      [
        'Starší kopie Shardbound (zapomenutý otevřený tab, stránka z mezipaměti nebo jiné zařízení) mohla načíst tvou uloženou hru, vyhodit z kolekce a balíčků karty Void Reckoning, které neznala, a takhle ji uložit. Teď hra uloženou pozici označí svou verzí a starší kopie místo zásahu požádá o znovunačtení stránky.',
      ],
    ],
  },
  '0.42.0': {
    title: 'Tváře černého slunce',
    summary: 'Šest nových portrétů Strážce, jeden pro každou frakci, a v obchodě Balíček Void Reckoning.',
    sections: [
      [
        'Nové portréty Strážců v obchodě (po 250 zlata): Hlasatel trhliny (Prázdný chór), Přízrak víru (Dvůr Jinovatky), Kněz zatmění (Mosazné dominium), Král zhouby (Kruh Trnoboru), Škvárový běs (Popelavá legie) a Padlý serafín (Konkláve Lumenu).',
        'Balíček Void Reckoning: 10 boosterů Void Reckoning, rub karet Oko Prázdna a portrét Král zhouby, se slevou 30 % z toho, co ještě nemáš. Jednou na účet.',
      ],
    ],
  },
  '0.41.1': {
    title: 'Klidnější obrazovka Kampaň',
    summary: 'Přepnutí kampaně už neposune obrazovku a o Salim se mluví tak, jak má.',
    sections: [
      [
        'Přepnutí mezi dvěma kampaněmi už neposune obrazovku Kampaň.',
        'Sali je muž: jeho texty v Černém slunci, patch notes i úspěch Sesazený o něm teď mluví v mužském rodě.',
      ],
    ],
  },
  '0.41.0': {
    title: 'Černé slunce',
    summary: 'Nová kampaň k Void Reckoning: tři kapitoly, patnáct soupeřů a na konci Sali na svém trůnu.',
    sections: [
      [
        'Černé slunce: druhá kampaň k Void Reckoning. Vybereš ji nahoře na obrazovce Kampaň. Má vlastní postup a je otevřená hned od začátku, první kampaň dohrát nemusíš.',
        'Tři kapitoly a patnáct soupeřů: kultisté černého slunce, Matka hniloby, Simba, Stroj hladu, Nereth, Zúčtovatel a na konci samotný Sali, Stvořitel.',
        'Pět nových schopností bossů: Černé slunce, Květ hniloby, Vrcholný lov, Přiložit pod kotel a Konečné vyúčtování.',
        'První výhry platí hlavně balíčky Void Reckoning; za porážku Saliho dostaneš 1 000 zlatých, 500 esence a 5 balíčků.',
        'Nový úspěch Sesazený za porážku Saliho, s titulem Lamač slunce.',
      ],
    ],
  },
  '0.40.6': {
    title: 'Při sledování obě ruce',
    summary: 'Při sledování zápasu ukazuje počet karet i ruka spodního hráče.',
    sections: [
      ['Při sledování zápasu najeď myší na ruku spodního hráče (na mobilu na ni ťukni) a uvidíš, kolik karet v ní má – stejně jako u horního hráče.'],
    ],
  },
  '0.40.5': {
    title: 'Počet karet v ruce a nenápadnější sledování',
    summary: 'Uvidíš, kolik karet má soupeř v ruce, a nápis při sledování už nezakrývá horní část bojiště.',
    sections: [
      ['Najeď myší na soupeřovu ruku (na mobilu na ni ťukni) a uvidíš, kolik karet v ní má – ve vlastních hrách i při sledování.'],
      ['Při sledování zápasu je nápis „Sleduješ: A vs B“ vpravo dole místo nahoře přes bojiště.'],
    ],
  },
  '0.40.4': {
    title: 'Menší hexagon',
    summary: 'Hexagon Hrát je menší a jednodušší a Sali zase sedí na trůnu.',
    sections: [
      ['Hexagon Hrát na Home je o desetinu menší a je v něm jen nápis Hrát.'],
      ['Obrázek Sali, Stvořitele je zase oříznutý jako dřív, takže je vidět její trůn.'],
    ],
  },
  '0.40.3': {
    title: 'Hexagon Hrát',
    summary: 'Tlačítko Hrát na Home je teď zlatý hexagon.',
    sections: [
      ['Tlačítko Hrát na Home je teď místo zlatého krystalu otevřený zlatý hexagon s dvojitou linkou. Klikatelný je celý hexagon a při najetí myší se zvedne a rozzáří.'],
    ],
  },
  '0.40.2': {
    title: 'Tváře v rámu',
    summary: 'Obrázky z Void Reckoning ukazují hlavy a tváře a horní menu už nejde scrollovat.',
    sections: [
      [
        'Karty z Void Reckoning, které měly výřez obrázku moc dole, teď ukazují hlavu, tvář nebo černé slunce z horní části malby, mimo jiné Ocelář Gorn a Titán lámač slunce.',
        'Horní menu na PC šlo posunout dolů ke zlatému podtržítku pod aktuální stránkou. Už nescrolluje a podtržítko zmizelo.',
      ],
    ],
  },
  '0.40.1': {
    title: 'Zprávy z Prázdnoty',
    summary: 'Home teď ukazuje novinky: nejnovější set, jeho balíček a legendárky.',
    sections: [
      ['Novinky na Home: nejnovější set s balíčkem, třemi jeho legendárkami a tlačítky pro nákup balíčků, prohlédnutí karet v kolekci a přehled novinek.'],
    ],
  },
  '0.40.0': {
    title: 'Void Reckoning',
    summary: 'Nový set 91 karet: vychází černé slunce a Prázdnota si přichází vyrovnat všechny účty.',
    sections: [
      [
        'Void Reckoning, pátý set: 91 karet pro všechny frakce, z toho 15 nových legendárek a draci Prázdnoty, ve vlastních balíčcích v obchodě.',
        'Mezi legendárkami: Artemis, zkáza Qinnyho; Scar, trhač Liu Kana; Arcimágyně Elinka; Simba, dokonalý predátor; Ocelář Gorn; Nereth, srdce víru; a Sali, Stvořitel, který vyčistí stůl a po smrti nahradí tvého Strážce.',
        'Každá z těchto sedmi má vlastní příchod a nástup Sali na místo Strážce má vlastní scénu.',
        'Nové klíčové slovo Pohlcení: při nasazení znič jinou svou jednotku a získej její útok a životy. Počítá se jako smrt spřátelené jednotky.',
        'Nový stav Rozklad: rozložená jednotka ztratí text i posílení a na začátku každého tahu svého ovladatele dostane -1/-1, dokud nezemře. Odstraní ho Očištění.',
        'Prázdný chór Prázdnotu vítá a pohlcuje, Popelavá legie vypaluje rozložené nepřátele, Kruh Trnoboru nechává nepřátele hnít, Mosazné dominium staví stroje, které žerou, Konkláve Lumenu očišťuje a chrání a Dvůr Jinovatky topí světlo.',
        'Nový achievement Vyrovnané účty: vlastni všechny karty ze setu Void Reckoning.',
      ],
      ['Odměny z turnajů, Dungeonu a Brawlu teď dávají balíčky Void Reckoning a v Aréně se objevují i jeho karty.'],
    ],
  },
  '0.36.0': {
    title: 'Tváří v tvář',
    summary: 'Každý zápas začíná tím, že se oba Strážci postaví proti sobě.',
    sections: [
      [
        'Úvod zápasu: před první kartou se oba Strážci setkají na pásu přes celý stůl, ve zlatých rámech se září svých frakcí a s VS mezi sebou.',
        'Nad nimi je typ zápasu a pod nimi kolo turnaje, pravidla Brawlu nebo obtížnost AI. Divák vidí, jaký zápas sleduje.',
        'Kliknutím ho přeskočíš. Tutoriál a denní puzzle začínají bez něj.',
      ],
    ],
  },
  '0.35.1': {
    title: 'Draci vzlétají',
    summary: 'Legendární draci mají vlastní přílet.',
    sections: [
      [
        'Legendární draci mají vlastní příchod: přes stůl přeletí dračí stín, drak dopadne s řevem a rázovými vlnami a za ním se rozevřou velká křídla kreslená jemnými zářícími liniemi.',
        'Každý drak má barvu svého živlu: jiskry u Pyraxise a Vulkary, led u Glacivara, stín u Nyxaratha, úplněk u Selunith a déšť zlata u Aurumvexe.',
      ],
    ],
  },
  '0.35.0': {
    title: 'Sledování zápasů',
    summary: 'Sleduj naživo zápasy kamarádů i turnajové zápasy.',
    sections: [
      [
        'Přátelé: když kamarád hraje, objeví se u jeho jména tlačítko Sledovat. Funguje pro online zápasy, ranked, turnaje i zápasy proti AI.',
        'Turnaje: každý probíhající zápas s hráčem jde sledovat přímo z pavouka, i když už jsi vypadl(a).',
        'Divák vidí stůl, životy, energii, log a všechny animace, ale ruku ani jednoho z hráčů, takže nikdo nemůže radit ze strany.',
        'Jeden zápas mohou sledovat až čtyři diváci. Sledování nijak neovlivní tvou kolekci, statistiky ani questy.',
      ],
    ],
  },
  '0.34.0': {
    title: 'Velké okamžiky',
    summary: 'Efekty velkých kouzel, závěrečný úder, nová obrazovka výsledku a příchody legendárek v packech i v kolekci.',
    sections: [
      [
        'Epická a legendární kouzla se sesílají nad otáčejícím se runovým kruhem v barvě frakce, legendární navíc skončí výbuchem světla.',
        'Závěrečný úder: když padne Strážce, obraz se k němu přiblíží, Strážce zbělá a rozbije se na kousky, které se rozletí, a teprve pak se ukáže výsledek.',
        'Nová obrazovka výsledku: nápis padá písmeno po písmenu mezi zlatými křídly, která se kreslí pero po peru, a výsledky najedou po něm.',
        'Když z balíčku vytáhneš legendárku, přehraje se její příchod.',
        'Kolekce: legendární karty mají v detailu tlačítko Přehrát příchod.',
      ],
      ['Zmrazené jednotky mají navíc ledový obrys a při rozmrznutí se led rozprskne na střepy. S bariérou zároveň led přiléhá k jednotce a zlatý štít bariéry je kolem něj.'],
    ],
  },
  '0.33.3': {
    title: 'Tři další příchody',
    summary: 'Elinda, Skolky a R3-D3 mají vlastní příchody legendárek.',
    sections: [
      [
        'Elinda: po jejím rámu se vyšplhá réva a rozkvete, stoupají světlušky a rozběhne se vlna léčivého světla.',
        'Skolky: za ním se vykreslí fialový runový kruh, kolem něj se do spirály zvednou zářící runy a obrazovku pokryje fialová námraza.',
        'R3-D3: technický výkres, točící se ozubená kola a skenovací paprsek, na rám se přišroubují pancéřové pláty a pak „Systémy online“.',
      ],
    ],
  },
  '0.33.2': {
    title: 'Vlastní příchody legendárek',
    summary: 'Šest dalších legendárek má vlastní příchod a všechny příchody trvají o něco déle.',
    sections: [
      [
        'Liu Kano: do jeho temné siluety narazí komety světla, tma se roztříští, za ním vyrazí koruna ze světla a přijede traktor z hvězd.',
        'Captain Abandoneer: na stůl dopadne plakát „HLEDÁ SE“, sek šavlí a déšť zlatých dublonů.',
        'Rendoslav: rozvinou se královské prapory a na hlavu mu dopadne koruna, až se stůl otřese.',
        'Qvido: pod ním žhne láva a kolem stoupají jiskry.',
        'Bubblemaker Qinny: hvězdné nebe, duhové bubliny a velká bublina kolem Qinnyho, která se zavlní a praskne.',
        'Tallys the Menace: rudé tepání, stůl popraská a jeden smrtící sek.',
      ],
      ['Příchody legendárek trvají zhruba o čtvrtinu déle, aby sis je stihl prohlédnout.'],
    ],
  },
  '0.33.1': {
    title: 'Příchody legendárek',
    summary: 'Legendární jednotky mají teď při zahrání velkolepý příchod.',
    sections: [
      [
        'Když se zahraje legendární jednotka, tvoje i soupeřova, ukáže se krátký příchod: zlaté paprsky, její obrázek ve velkém rámu a jméno, než dopadne na stůl.',
        'Meowchick má vlastní komiksový příchod: červeno-žlutý výbuch, bublinu „Mňau!“ a zlaté tlapky přes celý stůl.',
      ],
    ],
  },
  '0.33.0': {
    title: 'Prizmatické a foil karty v zápasech',
    summary: 'Foil a prizmatické karty, které vlastníš, se teď třpytí i v zápasech a bariéra je lépe vidět.',
    sections: [
      [
        'Tvoje prizmatické a foil kopie se teď ukazují i v zápasech: v ruce, v náhledech i na stole, a vidí je oba hráči.',
        'Každá kopie má svou vlastní variantu: s jednou prizmatickou a jednou normální kopií v decku se třpytí jen jedna z nich.',
        'Editor decku ukazuje, kolik kopií v decku je prizmatických (✦) nebo foil (✧).',
        'Stávající decky fungují dál: tvoje nejlepší kopie se do nich dají automaticky, nic nemusíš nastavovat.',
      ],
      ['Bariéra je v zápasech mnohem lépe vidět: zářící zlatý štít kolem celé jednotky s pomalým odleskem.'],
    ],
  },
  '0.32.0': {
    title: 'Těžší denní puzzle',
    summary: 'Čtrnáct nových denních puzzle, každé má jen jedno řešení.',
    sections: [
      [
        'Denní puzzle: čtrnáct nových, mnohem těžších puzzle. Nepřátelský Strážce má přesně tolik životů, kolik dá tvůj nejlepší možný tah, dostat se tam dá jen jednou kombinací karet a potřebuješ k tomu aspoň tři karty a několik promyšlených kroků.',
        'Některá puzzle skrývají kartu-past, kterou musíš nechat v ruce; nápověda ti řekne, jestli potřebuješ všechny karty, nebo ne.',
      ],
    ],
  },
  '0.31.5': {
    title: 'Kočky v kápích',
    summary: 'Pět nových portrétů koček v kápích v obchodě.',
    sections: [['Nové portréty Strážců v obchodě (po 250 zlata): Kočičí věštec při svíci (Mosazné dominium), Kočka v mrazivé kápi (Dvůr Jinovatky), Kocour v žhnoucí kápi (Popelavá legie), Kocour v hvězdné kápi (Prázdný chór) a Kočka ve zlaté kápi (Konkláve Lumenu).']],
  },
  '0.31.4': {
    title: 'Tři kočičí portréty',
    summary: 'Tři nové kočičí portréty Strážců v obchodě.',
    sections: [['Nové portréty Strážců v obchodě (po 250 zlata): Kocour s květinovou korunou (Kruh Trnoboru), Stříbrná kočka (Konkláve Lumenu) a Kocour se stínovým znamením (Prázdný chór).']],
  },
  '0.31.3': {
    title: 'Oprava obrázků karet',
    summary: 'Karty už neukazují prázdný obrázek, když se jejich obrázek nenačte.',
    sections: [['Obrázek karty, který se nenačte (krátký výpadek sítě nebo aktualizace během hraní), se teď načte znovu. Když selže i podruhé, karta ukáže náhradní vygenerovaný obrázek místo prázdné plochy.']],
  },
  '0.31.2': {
    title: 'Gears of Invention',
    summary: 'Prismatický balíček za 1000 zlata má nový obrázek a zlatý třpyt.',
    sections: [['Prismatický balíček (1000 zlata) je teď Gears of Invention, s novým obrázkem a stejným zlatým třpytem jako Divine Ascension. Obsah se nemění.']],
  },
  '0.31.1': {
    title: 'Úpravy prismatických balíčků',
    summary: 'Čistěji oříznuté obrázky balíčků a prismatické balíčky v obchodě jako první.',
    sections: [['Divine Ascension: zlatý lesk teď plynule vjede zpoza balíčku a zase zmizí, místo aby skákal.', 'Stars Eternal a Divine Ascension: obrázky balíčků mají hladké a rovnoměrné okraje ze všech stran.', 'Obchod: prismatické balíčky jsou první, před Dragon Realm.']],
  },
  '0.31.0': {
    title: 'Prismatické balíčky',
    summary: 'Dva prémiové balíčky v obchodě: Stars Eternal a Divine Ascension.',
    sections: [
      [
        'Stars Eternal (1000 zlata): prismatický balíček s pěti kartami ze všech setů, všechny v prismatické variantě. Legendárka je zaručená nejméně v každém desátém balíčku.',
        'Divine Ascension (5000 zlata): jedna prismatická legendárka z libovolného setu, pokud možno taková, kterou ještě nemáš.',
        'Oba balíčky se v obchodě i na stránce balíčků třpytí: Stars Eternal v duhových barvách, Divine Ascension zlatě.',
      ],
    ],
  },
  '0.30.2': {
    title: 'Pořadí na obrazovce Hrát',
    summary: 'Tutoriál a denní puzzle jsou pod herními režimy.',
    sections: [['Hrát: tutoriál a denní puzzle jsou teď vedle sebe pod herními režimy, těsně nad tréninkovým zápasem.']],
  },
  '0.30.1': {
    title: 'Deset nových rubových stran',
    summary: 'Deset nových rubových stran karet v obchodě.',
    sections: [['Deset nových rubových stran karet v obchodě: Půlnoční havran, Lávový hranol, Zimní krystal, Lví štít, Brána propasti, Kormidlo navigátora, Čepel smrti, Hranolová růže, Démonská koruna a Stříbrný půlměsíc.']],
  },
  '0.30.0': {
    title: 'Denní puzzle',
    summary: 'Každý den nové puzzle: najdi cestu, jak vyhrát v jednom tahu.',
    sections: [
      [
        'Denní puzzle (Hrát, pod tutoriálem): připravená situace na stole, kde musíš vyhrát v jednom tahu. Všichni mají každý den stejné puzzle, s nápovědou.',
        'Ukončením tahu puzzle vzdáš a můžeš to zkoušet, kolikrát chceš. První vyřešení každý den dá 60 zlata a 120 XP a prodlouží tvou řadu dní po sobě.',
        'Puzzle se nepočítá jako vyhraný ani prohraný zápas a neposouvá úkoly.',
      ],
    ],
  },
  '0.29.0': {
    title: 'Dungeon',
    summary: 'Nový roguelike režim: tři patra, devět nepřátel, jeden život.',
    sections: [
      [
        'Dungeon (Hrát → Proti AI): vyber si Strážce a začni s 20 jednoduchými kartami, žádnou z nich nemusíš mít ve sbírce. Nejdřív si vybereš úvodní karty.',
        'Tři patra po třech soupeřích, čím hlouběji, tím těžší; třetí soupeř každého patra je boss z kampaně. Jedna prohra výpravu ukončí.',
        'Po každé výhře si přidáš karty: jeden ze dvou tematických balíčků po třech, nebo jednu silnou kartu. Po každém bossovi si vybereš jeden z deseti pokladů, který pomáhá ve všech dalších zápasech (energie navíc, brnění, životy, levnější kouzla a další).',
        'Odměny rostou s každou výhrou, až na 600 zlata, 4 boostery Dragon Realm a 250 esence za projití všech tří pater. První výprava každý den je zdarma, další stojí 200 zlata.',
        'Úspěchy za Dungeon: Do hlubin, Dobyvatel Dungeonu (s titulem Průzkumník hlubin) a Mnoho cest dolů.',
      ],
    ],
  },
  '0.28.0': {
    title: 'Nové úspěchy',
    summary: '20 nových úspěchů za Brawl, úkoly a sbírání, s novými tituly.',
    sections: [
      [
        'Úspěchy za Brawl (nová kategorie): Rváč, Dvojitá potíž (vyhraj oba fighty jedné rotace), Přemožitel obrů (poraz Šampiona), Porušitel pravidel a Král chaosu, s titulem Král chaosu.',
        'Sběratelské úspěchy: kompletní Fantasy Realms, Legions of Shadow nebo Dragon Realm, 20 draků, 10 nebo 30 legendárek, prizmatická karta, 15 karet ve Foil nebo Prismatic, 3 nebo všechny portréty Strážců a 6 rubových stran; otevři 100 boosterů; vyrob 50 karet. Nové tituly: Pán draků, Strážce legend a Mnohotvářný.',
        'Úspěchy za úkoly: splň 50 úkolů a vyzvedni všechny tři týdenní úkoly jednoho týdne.',
        'Úspěchy, na které už máš nárok, se odemknou při příštím spuštění hry.',
      ],
    ],
  },
  '0.27.9': {
    title: 'Šestiúhelníkové náhledy portrétů',
    summary: 'Každý portrét se ve velkém otevře ve stejném šestiúhelníku.',
    sections: [['Velký náhled portrétu (pravý klik nebo podržení) ukazuje každý portrét ve stejném šestiúhelníkovém rámu jako ve hře, v barvě jeho frakce.']],
  },
  '0.27.8': {
    title: 'Ostřejší náhledy portrétů',
    summary: 'Velký náhled nejnovějších portrétů ukazuje celou malbu v plném rozlišení.',
    sections: [['Pravý klik (nebo podržení) na některý z nejnovějších portrétů Strážců: velký náhled teď ukazuje celou oválnou malbu v plném rozlišení místo zvětšeného malého výřezu.']],
  },
  '0.27.7': {
    title: 'Plamenná korzárka',
    summary: 'Nový portrét Popelavé legie nahrazuje Orčího válečného náčelníka.',
    sections: [['Nový portrét Strážce v obchodě: Plamenná korzárka (Popelavá legie, 150 zlata).'], ['Portrét Orčí válečný náčelník byl stažen. Pokud sis ho koupil, zlato ti bylo vráceno.']],
  },
  '0.27.6': {
    title: 'Tři týdenní úkoly',
    summary: 'Místo jednoho týdenního úkolu jsou teď každý týden tři.',
    sections: [
      [
        'Týdenní úkoly: každé pondělí tři různé, každý se zlatem, XP a boosterem. Splněný úkol, za který sis ještě nevyzvedl odměnu, zůstane, dokud ji nevyzvedneš.',
        'Tři nové týdenní úkoly: Arcimág týdne (zahraj 40 kouzel), Pán legií (zahraj 70 jednotek) a Spolehlivý vítěz (vyhraj 5 zápasů).',
        'Odznak úkolů v menu teď počítá i splněné týdenní úkoly.',
      ],
    ],
  },
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
