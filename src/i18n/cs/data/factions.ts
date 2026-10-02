import type { FactionsOverlay } from '../../overlayTypes';

const v: FactionsOverlay = {
  factions: {
    EMBER: {
      name: 'Popelavá legie',
      short: 'Popel',
      motto: 'Hoř jasně. Hoř první.',
      identity: 'Útočné jednotky, přímé poškození a Hoření. Vyhrává rychle, než se soupeř vzpamatuje.',
      lore: 'Legie zrozená v sopečné kaldeře Kharzulu věří, že pád Koruny byl očistou. Její pyromanti a jezdci na dracích pochodují pod prapory živého plamene a raději by viděli Aethru spálenou na popel, než aby jí vládl kdokoli jiný.',
      archetypes: [
        { name: 'Bleskový útok', description: 'Levné jednotky se Spěchem a ohnivá kouzla mířená na nepřátelského Strážce.' },
        { name: 'Pyromancie', description: 'Posílení a odměny za poškození kouzly, které z každého kouzla udělají ohnivou kouli.' },
      ],
    },
    VERDANT: {
      name: 'Kruh Trnoboru',
      short: 'Trnobor',
      motto: 'Co má kořeny, přetrvá.',
      identity: 'Léčení, růst, posilování a odolní obránci. Vydrží déle a všechno přeroste.',
      lore: 'Druidové z Trnoboru zpívají Světokořeni, který se táhne pod každým kontinentem. Kde v jejich lesích dopadne Střep, vyrostou háje za jedinou noc, a Kruh přísahá, že moc Koruny udrží v půdě, kam patří.',
      archetypes: [
        { name: 'Bujení', description: 'Posiluj své jednotky každý tah, dokud se nad bojištěm netyčí jako obři.' },
        { name: 'Pramen', description: 'Odměny za léčení, které z obnovených životů dělají výhodu.' },
      ],
    },
    IRON: {
      name: 'Mosazné dominium',
      short: 'Mosaz',
      motto: 'Pokrok je nevyhnutelný.',
      identity: 'Konstrukty, brnění a získávání energie. Postaví si soukolí a pak soupeře zavalí.',
      lore: 'Slévárenská města Mosazného dominia sklízejí Střepy, aby jimi poháněla své stroje. Jejich artificeři věří, že Koruna byla jen stroj – a stroje lze postavit znovu: lepší, silnější a poslušné jen Shromáždění dominia.',
      archetypes: [
        { name: 'Montážní linka', description: 'Souhra konstruktů, která odměňuje zaplavení bojiště stroji.' },
        { name: 'Bašta', description: 'Získávej brnění a energii, abys v pozdní hře vyložil obrovské hrozby.' },
      ],
    },
    ASTRAL: {
      name: 'Konkláve Lumenu',
      short: 'Lumen',
      motto: 'Každá hvězda je psané slovo.',
      identity: 'Kouzla, lízání karet a manipulace. Ovládá hru a vyhraje jediným skvělým tahem.',
      lore: 'Vysoko nad oblaky mapují astromanti Konkláve Lumenu dráhy padajících Střepů. Považují se za právoplatné archiváře Koruny a bojují kouzly psanými hvězdným světlem.',
      archetypes: [
        { name: 'Spřádání kouzel', description: 'Sešli v jednom tahu mnoho kouzel a posil tím odměny za spřádání kouzel.' },
        { name: 'Hvězdná kontrola', description: 'Lízej, odstraňuj a zdržuj, dokud hru neukončí rozhodující karta.' },
      ],
    },
    VOID: {
      name: 'Prázdný chór',
      short: 'Chór',
      motto: 'Každá píseň končí tichem.',
      identity: 'Obětování, efekty Posledního dechu a oživování. Mění smrt v moc.',
      lore: 'Tam, kde Střepy pronikly do země příliš hluboko, se otevřela Prázdnota. Chór tvoří ti, kdo zaslechli její píseň a odpověděli – kultisté, přízraky a bytosti, které kdysi bývaly lidmi a věří, že smrt je jen sloka v delším chorálu.',
      archetypes: [
        { name: 'Rekviem', description: 'Jednotky s Posledním dechem a efekty, které se spouštějí, kdykoli zemře spojenec.' },
        { name: 'Oběť', description: 'Obětuj vlastní jednotky pro drtivé odměny a oživování.' },
      ],
    },
    TIDE: {
      name: 'Dvůr Jinovatky',
      short: 'Jinovatka',
      motto: 'Příliv se vždy vrátí.',
      identity: 'Tempo, Zmrazení, vracení do ruky a opožděné efekty. Bere soupeři jeho tahy.',
      lore: 'Pod zamrzlým Jinovatým mořem leží utopený dvůr leviatanských pánů a mrazivých čarodějnic. Dvůr hraje dlouhou hru: zmrazí nepřátele na místě, stáhne je zpět do hlubin a udeří, až se příliv obrátí.',
      archetypes: [
        { name: 'Hluboký mráz', description: 'Zmraz nepřátele a trestej zmrazené cíle.' },
        { name: 'Spodní proud', description: 'Vracej jednotky do ruky, abys znovu využil jejich efekty Při nasazení, a zdržuj nepřátele.' },
      ],
    },
    NEUTRAL: {
      name: 'Poutníci',
      short: 'Neutrální',
      motto: 'Cesta nepatří nikomu.',
      identity: 'Univerzální karty použitelné v každém balíčku.',
      lore: 'Žoldnéři, kupci, zvířata a potulní čarodějové, kteří nejsou zavázáni žádné frakci. Každý Strážce si je dřív nebo později najme.',
      archetypes: [
        { name: 'Užitek', description: 'Solidní jednotky a univerzální efekty, které doplní křivku cen v jakémkoli balíčku.' },
      ],
    },
  },
  world: {
    title: 'Roztříštění Aethry',
    paragraphs: [
      'Tisíc let se nad světem Aethry vznášela Rozťatá koruna, mřížka živého krystalu, která udržovala živly v rovnováze. Když zmizel poslední vladař, Koruna pukla na deset tisíc Střepů, které se snesly na všechny kontinenty.',
      'Každý Střep je úlomek čistého Éteru – dost moci, aby přes noc vyrostl les, vyvřelo moře nebo procitli mrtví. Ti, kdo dokážou Střepy podrobit své vůli, se nazývají Strážci, a všechny frakce Aethry teď závodí, kdo je získá dřív, než bude Koruna znovu ukována k obrazu někoho jiného.',
      'Jsi nově probuzený Strážce. Tvé Střepy odpovídají, když je povoláš do boje jako karty: vojáky, kouzla, relikvie i samotná místa, kde se píšou dějiny.',
    ],
  },
};

export default v;
