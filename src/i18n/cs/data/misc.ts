import type { MiscOverlay } from '../../overlayTypes';

const v: MiscOverlay = {
  cardBacks: {
    compass: { name: 'Kompas Strážce', description: 'Půlnoční modř a zlatá kompasová růžice. Má ji každý Strážce od začátku.' },
    crimson_sigil: { name: 'Karmínová pečeť', description: 'Pozlacená pečeť na sytě rudém sametu.' },
    arcane_hexagram: { name: 'Tajemný hexagram', description: 'Zářící runy kroužící kolem fialové hvězdy.' },
    tree_of_life: { name: 'Strom života', description: 'Zlatý strom Trnoboru na živé zeleni.' },
    silver_thorn: { name: 'Stříbrný trn', description: 'Kované stříbrné trny na černé.' },
    brass_clockwork: { name: 'Mosazný strojek', description: 'Nýtované bronzové pláty kolem velkého ozubeného kola.' },
    sunlit_ivory: { name: 'Slunná slonovina', description: 'Zlaté sluneční paprsky na bledé slonovině.' },
    rimetide_frost: { name: 'Mráz Jinovatky', description: 'Dokonalý ledový krystal na zamrzlé modři.' },
    hollow_vortex: { name: 'Prázdný vír', description: 'Fialový vír, který stahuje do temnoty.' },
    leather_tome: { name: 'Kožený foliant', description: 'Zdobená kůže z desek staré knihy kouzel.' },
    moonlit_night: { name: 'Měsíčná noc', description: 'Zlatý srpek mezi hvězdami.' },
    ember_rune: { name: 'Žhnoucí runa', description: 'Hořící runa v popraskané sopečné hornině.' },
    royal_crest: { name: 'Královský erb', description: 'Štít s lilií na zestárlém pergamenu.' },
    tidal_wave: { name: 'Přílivová vlna', description: 'Valící se vlna v tyrkysové hlubině.' },
    gilded_obsidian: { name: 'Zlacený obsidián', description: 'Čisté zlaté linie na leštěné černi.' },
    cathedral_glass: { name: 'Katedrální sklo', description: 'Rozeta z barevného skla.' },
    golden_star: { name: 'Zlatá hvězda', description: 'Zlatý drahokam v mosazné hvězdě na půlnoční modři.' },
    verdant_spiral: { name: 'Zelená spirála', description: 'Zářící zelená spirála na mechem porostlém kameni.' },
    violet_crystal: { name: 'Fialový krystal', description: 'Ametyst zasazený v kruhu run.' },
    crimson_dragon: { name: 'Karmínový drak', description: 'Pečeť stočeného draka na krvavě rudém sametu.' },
    ivory_sapphire: { name: 'Slonovinový safír', description: 'Safírová hvězda na popraskaném bledém mramoru.' },
    teal_eclipse: { name: 'Tyrkysové zatmění', description: 'Chladné tyrkysové oko v kovaném železném kompasu.' },
    bronze_hammer: { name: 'Bronzové kladivo', description: 'Kovářské kladivo Dominia v bronzovém reliéfu.' },
    frost_star: { name: 'Mrazivá hvězda', description: 'Střepy ledu tryskající z promrzlé hvězdy.' },
    void_eye: { name: 'Oko Prázdna', description: 'Fialové oko, které se nikdy nezavře.' },
    ruby_filigree: { name: 'Rubínový filigrán', description: 'Rubín mezi nekonečným zlatým filigránem.' },
    bone_skull: { name: 'Kostěná lebka', description: 'Lebka ze staré bronzi na otráveně zelené.' },
    crescent_moon: { name: 'Měsíční srpek', description: 'Zlatý srpek uvnitř hvězdného astrolábu.' },
    jade_phoenix: { name: 'Nefritový fénix', description: 'Nefritový drahokam s křídly fénixe na tesaném pískovci.' },
    molten_core: { name: 'Roztavené jádro', description: 'Hořící runa v popraskaném žhnoucím kameni.' },
    elder_oak: { name: 'Prastarý dub', description: 'Velký dub Kruhu vyřezaný do starého dřeva.' },
    nebula_spiral: { name: 'Spirála mlhoviny', description: 'Galaxie otáčející se v rámu z tmavého stříbra.' },
  },
  sets: {
    CORE: { tagline: 'Prapory stoupají, koruny se střetávají. Strážci vstupují do boje.' },
    DEEP: { tagline: 'V říších za okrajem mapy se probouzejí draci.' },
    ABYSS: { tagline: 'Rytíři pod všemi prapory táhnou ve službách stínu.' },
    DRAGON: { tagline: 'Draci se zmocňují nebe a jejich rytíři i víly letí s nimi.' },
  },
  titles: ['Hledač Střepů', 'Lamač korun', 'Strážce Éteru', 'Vladař Střepů'],
  tutorial: {
    welcome: {
      title: 'Vítej, Strážce',
      text: 'Každý Strážce začíná s 30 životy. Sniž životy nepřátelského Strážce na 0 a vyhraješ. Instruktor Hale má dnes jen 12.',
    },
    energy: {
      title: 'Energie',
      text: 'Karty stojí energii, kterou ukazuje modrý drahokam. Každý tah získáš jeden krystal energie (nejvýš 10) a energie se ti každý tah doplní.',
    },
    'play-unit': {
      title: 'Zahraj jednotku',
      text: 'Přetáhni Panoše Střepu na bojiště, nebo na něj klikni. Zářící karty můžeš zahrát právě teď.',
      touchText: 'Ťukni na Panoše Střepu, abys ho viděl zblízka, a ťukni znovu, abys ho zahrál. Zářící karty můžeš zahrát právě teď.',
    },
    'end-turn': {
      title: 'Ukonči tah',
      text: 'Nové jednotky se musejí jeden tah připravovat, než mohou zaútočit. Stiskni Ukončit tah.',
    },
    attack: {
      title: 'Útok',
      text: 'Tvůj Panoš je připravený. Klikni na něj (nebo z něj táhni) a vyber nepřátelského Šrotového goblina. Obě jednotky si navzájem způsobí poškození ve stejnou chvíli.',
      touchText: 'Tvůj Panoš je připravený. Ťukni na něj a pak na nepřátelského Šrotového goblina. Obě jednotky si navzájem způsobí poškození ve stejnou chvíli.',
    },
    spell: {
      title: 'Sešli kouzlo a zvol cíl',
      text: 'Jiskrový šíp způsobí 2 poškození. Zahraj ho a vyber cíl – zkus nepřátelského Strážce.',
    },
    inspect: {
      title: 'Přečti si kteroukoli kartu',
      text: 'Klikni pravým tlačítkem na kteroukoli kartu v ruce nebo na bojišti a uvidíš ji zvětšenou i s vysvětlením všech klíčových slov. Zkus to na Rytíři korunní stráže a pak stiskni Další.',
      touchText: 'Podrž prst na kterékoli kartě v ruce nebo na bojišti a uvidíš ji zvětšenou i s vysvětlením všech klíčových slov. Zkus to na Rytíři korunní stráže a pak stiskni Další.',
    },
    'end-turn-2': {
      title: 'Nepolevuj',
      text: 'Zahraj další jednotky, pokud můžeš, a pak ukonči tah.',
    },
    sigil: {
      title: 'Schopnosti tvého Strážce',
      text: 'Každý Strážce má dvě schopnosti, které si vybereš na kartě Talenty v editoru balíčku. Šestiúhelník vedle tvého portrétu je aktivní schopnost: Popelavý šíp za 1 energii způsobí 1 poškození a udělí Hoření. Klikni na něj (najetím myší si ho přečteš) a vyber cíl. Kulatý odznak je pasivní schopnost a funguje sám.',
      touchText: 'Každý Strážce má dvě schopnosti, které si vybereš na kartě Talenty v editoru balíčku. Šestiúhelník vedle tvého portrétu je aktivní schopnost: Popelavý šíp za 1 energii způsobí 1 poškození a udělí Hoření. Ťukni na něj (podržením prstu si ho přečteš) a vyber cíl. Kulatý odznak je pasivní schopnost a funguje sám.',
    },
    win: {
      title: 'Dokonči boj',
      text: 'Jednotky se Stráží musí být napadeny jako první – najetím na ikonu štítu se dozvíš víc. Zaútoč svými jednotkami a sraz životy nepřátelského Strážce na 0.',
      touchText: 'Jednotky se Stráží musí být napadeny jako první – podržením prstu na jednotce si přečteš její klíčová slova. Zaútoč svými jednotkami a sraz životy nepřátelského Strážce na 0.',
    },
  },
  tutorialOpponent: {
    name: 'Instruktor Hale',
    title: 'Cvičitel Strážců',
    intro: 'Ukaž mi, co Strážce dokáže.',
  },
};

export default v;
