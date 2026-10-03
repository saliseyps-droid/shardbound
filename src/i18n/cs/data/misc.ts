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
  },
  sets: {
    CORE: { tagline: 'Prapory stoupají, koruny se střetávají. Strážci vstupují do boje.' },
    DEEP: { tagline: 'V říších za okrajem mapy se probouzejí draci.' },
    ABYSS: { tagline: 'Rytíři pod všemi prapory, přísahající temnotě pod světem.' },
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
    },
    'end-turn': {
      title: 'Ukonči tah',
      text: 'Nové jednotky se musejí jeden tah připravovat, než mohou zaútočit. Stiskni Ukončit tah.',
    },
    attack: {
      title: 'Útok',
      text: 'Tvůj Panoš je připravený. Klikni na něj (nebo z něj táhni) a vyber nepřátelského Šrotového goblina. Obě jednotky si navzájem způsobí poškození ve stejnou chvíli.',
    },
    spell: {
      title: 'Sešli kouzlo a zvol cíl',
      text: 'Jiskrový šíp způsobí 2 poškození. Zahraj ho a vyber cíl – zkus nepřátelského Strážce.',
    },
    'end-turn-2': {
      title: 'Nepolevuj',
      text: 'Zahraj další jednotky, pokud můžeš, a pak ukonči tah.',
    },
    sigil: {
      title: 'Schopnosti tvého Strážce',
      text: 'Každý Strážce má dvě schopnosti, které si vybereš na kartě Talenty v editoru balíčku. Šestiúhelník vedle tvého portrétu je aktivní schopnost: Popelavý šíp za 1 energii způsobí 1 poškození a udělí Hoření. Klikni na něj (najetím myší si ho přečteš) a vyber cíl. Kulatý odznak je pasivní schopnost a funguje sám.',
    },
    win: {
      title: 'Dokonči boj',
      text: 'Jednotky se Stráží musí být napadeny jako první – najetím na ikonu štítu se dozvíš víc. Zaútoč svými jednotkami a sraz životy nepřátelského Strážce na 0.',
    },
  },
  tutorialOpponent: {
    name: 'Instruktor Hale',
    title: 'Cvičitel Strážců',
    intro: 'Ukaž mi, co Strážce dokáže.',
  },
};

export default v;
