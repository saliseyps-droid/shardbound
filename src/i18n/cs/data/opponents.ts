import type { OpponentsOverlay } from '../../overlayTypes';

const v: OpponentsOverlay = {
  opponents: {
    practice_ember: {
      name: 'Kapitánka Sera Vossová',
      title: 'Předvoj Popelavé legie',
      intro: 'Zkus mi stačit.',
    },
    practice_verdant: {
      name: 'Stařešina Mechohrob',
      title: 'Strážce Trnoboru',
      intro: 'Háj je trpělivý. A ty?',
    },
    practice_iron: {
      name: 'Dozorce Kettleman',
      title: 'Inženýr Mosazného dominia',
      intro: 'Efektivita je vítězství.',
    },
    practice_astral: {
      name: 'Archivářka Lyrae',
      title: 'Učenkyně Konkláve Lumenu',
      intro: 'Už jsem četla, jak to skončí.',
    },
    practice_void: {
      name: 'Kantor Nihl',
      title: 'Předzpěvák Prázdného chóru',
      intro: 'Zpívej s námi.',
    },
    practice_tide: {
      name: 'Markýza Brine',
      title: 'Duelantka Dvora Jinovatky',
      intro: 'Nehýbej se. Jen to trochu štípne.',
    },
    c1_e1: {
      name: 'Pip Tallow',
      title: 'Sběrač Střepů',
      intro: 'Kdo dřív přijde, ten bere! Ten Střep je můj!',
    },
    c1_e2: {
      name: 'Brakka Popeloruká',
      title: 'Dezertérka z Legie',
      intro: 'Legie mě vyhnala. Na trénink mi postačíš.',
    },
    c1_e3: {
      name: 'Kutil Vrtikolečko',
      title: 'Odpadlý artificer',
      intro: 'Moje automaty potřebují polní zkoušky. Nehýbej se.',
    },
    c1_e4: {
      name: 'Sestra Vey',
      title: 'Novicka Putujícího chóru',
      intro: 'Tvůj Střep zpívá tak hlasitě. Nech mě ho utišit.',
    },
    c1_boss: {
      name: 'Grom Nezlomný',
      title: 'Vojevůdce Cesty',
      intro: 'Každý Strážce na téhle cestě mi platí mýto.',
      special: [
        'Schopnosti Strážce: Nýtované plátování III, Zesílený trup II.',
      ],
    },
    c2_e1: {
      name: 'Harpunář Quell',
      title: 'Kapitán ledoborce',
      intro: 'Moře vrátí, co si vzalo. Jednou.',
    },
    c2_e2: {
      name: 'Písař Lumenu Aurel',
      title: 'Kartograf Konkláve',
      intro: 'Tvá cesta už je zakreslená. A končí tady.',
    },
    c2_e3: {
      name: 'Trnová vdova',
      title: 'Zkažená druidka',
      intro: 'Hniloba je jen další druh růstu.',
    },
    c2_e4: {
      name: 'Velitel Ignis Rael',
      title: 'Dračí jezdec Legie',
      intro: 'Z nebe vidí Legie všechno.',
    },
    c2_boss: {
      name: 'Chřtán hlubin',
      title: 'Leviatan Utopeného dvora',
      intro: 'Voda pod tebou se pohne. Cosi obrovského otevírá oko.',
      special: [
        'Schopnosti Strážce: Drtivé hlubiny, Dotek jinovatky III.',
      ],
    },
    c3_b1: {
      name: 'Znovuzrozený Kharzul',
      title: 'Živoucí kaldera',
      intro: 'Sama hora povstává, aby se s tebou střetla.',
      special: [
        'Schopnosti Strážce: Erupce kaldery, Spalující zloba II.',
      ],
    },
    c3_b2: {
      name: 'Nekonečný chór',
      title: 'Hlas Prázdnoty',
      intro: 'Je nás mnoho. Kdysi jsme byli tebou.',
      special: [
        'Schopnosti Strážce: Chór rekviem, Nekonečný III.',
      ],
    },
    c3_final: {
      name: 'Roztříštěný vladař',
      title: 'Ozvěna Koruny',
      intro: 'Chceš obnovit mou Korunu? Pak poklekni před tím, čím bývala.',
      special: [
        'Schopnosti Strážce: Úlomek Koruny, Prozíravost III.',
      ],
    },
    c4_e1: {
      name: 'Dáma Rowena Trnová',
      title: 'Strážkyně přísahy Trnové přilby',
      intro: 'Přísahala jsem háji. Stín v něm jen vyrostl dřív.',
      special: ['V balíčku má navíc Rytíře trní.'],
    },
    c4_e2: {
      name: 'Sir Halvard Slaný',
      title: 'Rytíř utopeného praporu',
      intro: 'Jednou už jsem se utopil. Nechytlo se to.',
      special: ['V balíčku má navíc utopené Rytíře.'],
    },
    c4_e3: {
      name: 'Maršálka Dagna Železná přísaha',
      title: 'Děsivá rytířka výhně',
      intro: 'Každý nýt v téhle zbroji je slib. Žádný z nich tobě.',
      special: ['V balíčku má navíc Děsivé rytíře.'],
    },
    c4_e4: {
      name: 'Fialová čepel',
      title: 'Duelantka Posledního světla',
      intro: 'Hvězdy zhasly. Moje čepel ne.',
      special: ['V balíčku má navíc Rytíře Posledního světla.'],
    },
    c4_boss: {
      name: 'Vorgrath',
      title: 'Hořící přísaha',
      intro: 'Přísahal jsem hořet pro Korunu. Teď hořím pro to, co přijde po ní.',
      special: [
        'Schopnosti Strážce: Přísaha popela, Válečný pokřik III.',
        'V balíčku má samotného Vorgratha a své zapřisáhlé Rytíře.',
      ],
    },
    c5_b1: {
      name: 'Azhrel',
      title: 'Utopený šampion',
      intro: 'Příliv mi vzal království. Stín mi dal meč, abych si ho vzal zpátky.',
      special: [
        'Začíná s 35 životy.',
        'Schopnosti Strážce: Černý příliv, Náhlý mráz II.',
      ],
    },
    c5_b2: {
      name: 'Kaelthar',
      title: 'Hranice duší',
      intro: 'Každá duše, kterou jsi obětoval, abys mě našel, teď hoří v mém ohni.',
      special: [
        'Začíná s 35 životy.',
        'Schopnosti Strážce: Hranice duší, Žeň duší III.',
      ],
    },
    c5_final: {
      name: 'Rendoslav',
      title: 'Pán stínových legií',
      intro: 'Nakonec přede mnou poklekne každý prapor. Tvůj bude poslední.',
      special: [
        'Začíná se 40 životy.',
        'Schopnosti Strážce: Stínový nábor, Úlomek Koruny.',
        'V balíčku má samotného Rendoslava a relikvie Pána propasti.',
      ],
    },
  },
  chapters: {
    ch1: {
      name: 'Kapitola I – Padající nebe',
      description: 'Nad Poutní cestou prší Střepy. Soupeřící Strážci už jsou na lovu.',
    },
    ch2: {
      name: 'Kapitola II – Jinovaté moře',
      description: 'Stopa Střepů vede na sever, k zamrzlému pobřeží a utopenému dvoru pod ním.',
    },
    ch3: {
      name: 'Kapitola III – Vzestup Koruny',
      description: 'Mezi tebou a srdcem Rozťaté koruny stojí tři mocnosti.',
    },
    ch4: {
      name: 'Kapitola IV – Legie stínu',
      description: 'Koruna je obnovená, ale její stín kráčí dál. Rytíři pod všemi prapory teď táhnou pro něj.',
    },
    ch5: {
      name: 'Kapitola V – Stínový trůn',
      description: 'Na dně světa se Legie shromažďují kolem prázdného trůnu. Někdo na něm chce usednout.',
    },
  },
};

export default v;
