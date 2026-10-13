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
    c6_e1: {
      name: 'Zažehovačka Maeve',
      title: 'Palička z Popelavé cesty',
      intro: 'Se Střepem uvnitř hoří všechno jasněji.',
      special: [
        'V balíčku má navíc Válečníka legie.',
      ],
    },
    c6_e2: {
      name: 'Starý Kůrovec',
      title: 'Ent spáleného háje',
      intro: 'Oheň mi vzal háj. Něco si vezmu zpátky.',
      special: [
        'V balíčku má navíc Pradávného s úponky.',
      ],
    },
    c6_e3: {
      name: 'Sazokřídlá Kalla',
      title: 'Krotitelka draků',
      intro: 'Moji draci dnes ještě nejedli.',
      special: [
        'V balíčku má navíc Popelem zrozeného fénixe.',
      ],
    },
    c6_e4: {
      name: 'Strážce květů',
      title: 'Správce Pramene',
      intro: 'Každé semínko, které spálíš, zasadím dvakrát.',
      special: [
        'V balíčku má navíc Věštce Pramene.',
      ],
    },
    c6_boss: {
      name: 'Vulkara',
      title: 'Matka draků',
      intro: 'Vešel jsi do mého hnízda. Málokdo z něj odejde.',
      special: [
        'Začíná s 35 životy.',
        'Schopnosti Strážce: Dračí plod, Rozdmýchaný hněv III.',
      ],
    },
    c7_e1: {
      name: 'Předák Rusk',
      title: 'Dozorce Ozubené věže',
      intro: 'Do řady. Nechte se smontovat.',
      special: [
        'V balíčku má navíc Éterodynové jádro.',
      ],
    },
    c7_e2: {
      name: 'Hvězdopravkyně Ilwen',
      title: 'Strážkyně oběžných drah',
      intro: 'Včera v noci jsem ve hvězdách viděla tvou porážku.',
      special: [
        'V balíčku má navíc Vodič Lumenu.',
      ],
    },
    c7_e3: {
      name: 'Mosazný serafín',
      title: 'Prototyp Éterodynu',
      intro: 'POKYN: CHRÁNIT STŘEP. POKYN: ODSTRANIT STRÁŽCE.',
      special: [
        'V balíčku má navíc Titána egidy.',
      ],
    },
    c7_e4: {
      name: 'Archontka Teyra',
      title: 'Tkadlena kouzel Konkláve',
      intro: 'Má kouzla byla napsána dřív, než ses narodil.',
      special: [
        'V balíčku má navíc Ukradené souhvězdí.',
      ],
    },
    c7_boss: {
      name: 'Omnifex',
      title: 'Prvotní montér',
      intro: 'Každý Střep je součástka. Ty jsi náhradní díl.',
      special: [
        'Začíná s 35 životy.',
        'Schopnosti Strážce: Obléhací protokol, Přetaktování III.',
      ],
    },
    c8_e1: {
      name: 'Mrazivý Odo',
      title: 'Zamrzlý poustevník',
      intro: 'Zůstaň chvíli. Zůstaň navždy.',
      special: [
        'V balíčku má navíc Čarodějnici jinovatky.',
      ],
    },
    c8_e2: {
      name: 'Matka Ticho',
      title: 'Abatyše chóru',
      intro: 'Pst. Mrtví poslouchají.',
      special: [
        'V balíčku má navíc Vysávající přízrak.',
      ],
    },
    c8_e3: {
      name: 'Kapitán Solnohrob',
      title: 'Duch utopené flotily',
      intro: 'Moje posádka šla ke dnu s lodí. Vrátila se bez ní.',
      special: [
        'V balíčku má navíc Vír zpětného proudu.',
      ],
    },
    c8_e4: {
      name: 'Bledý kantor',
      title: 'Hlas zániku',
      intro: 'Ještě jedna sloka a svět na tebe zapomene.',
      special: [
        'V balíčku má navíc Hymnu zániku.',
      ],
    },
    c8_boss: {
      name: 'Morrowgast',
      title: 'Leviatan hlubin',
      intro: 'Moře má dno. Já jsem to, co žije pod ním.',
      special: [
        'Začíná se 40 životy a Utopeným dvorem ve hře.',
        'Schopnosti Strážce: Zamrzlá hymna, Drtivé hlubiny.',
      ],
    },
    c9_b1: {
      name: 'Aeon',
      title: 'Bledý poutník',
      intro: 'Prošel jsem koncem každého světa. Tvůj je další.',
      special: [
        'Začíná se 40 životy.',
        'Schopnosti Strážce: Pád hvězd, Prozíravost III.',
      ],
    },
    c9_b2: {
      name: 'Ysolde',
      title: 'Třikrát korunovaná',
      intro: 'Jaro, Prázdnota i Jinovatka – byla jsem královnou všech tří. Poklekni před každou z nás.',
      special: [
        'Začíná se 40 životy.',
        'Schopnosti Strážce: Chór rekviem, Pramen III.',
        'V balíčku má všechny tři Ysoldy.',
      ],
    },
    c9_b3: {
      name: 'Ignivar',
      title: 'Spalovač korun',
      intro: 'Korunu jsem už jednou spálil. Rád to udělám znovu.',
      special: [
        'Začíná se 40 životy.',
        'Schopnosti Strážce: Erupce kaldery, Spalující zloba III.',
      ],
    },
    c9_final: {
      name: 'Rozťatá koruna',
      title: 'Vše, co bylo rozbito',
      intro: 'Posbíral jsi každý můj kousek. Teď uvidíš, co dohromady dokážou.',
      special: [
        'Začíná s 50 životy a 1 energií navíc.',
        'Schopnosti Strážce: Poslední Střep, Úlomek Koruny.',
      ],
    },
    // Černé slunce (Void Reckoning)
    v1_e1: {
      name: 'Bratr Ossian',
      title: 'Chór Trhliny',
      intro: 'Podívej se nahoru. Není to krásné? Brzy už oči potřebovat nebudeš.',
      special: ['Jeho balíček obsahuje další kultisty černého slunce.'],
    },
    v1_e2: {
      name: 'Hesk Popelokorá',
      title: 'Strážkyně zvadlého lesa',
      intro: 'Můj háj neumřel. Změnil se. Pojď se podívat, jak vyrostl.',
      special: ['Její balíček obsahuje hnilobu zvadlého lesa.'],
    },
    v1_e3: {
      name: 'Předák Grisk',
      title: 'Topič Pece Prázdnoty',
      intro: 'Nová pec spálí cokoli. Cokoli! Dělníky, šrot, tebe – není vybíravá.',
      special: ['Jeho balíček obsahuje Pec Prázdnoty a Hladový tyglík.'],
    },
    v1_e4: {
      name: 'Maresh',
      title: 'Vyvolavač přílivu z Nulu',
      intro: 'Moře pod černým sluncem je velmi klidné. Všechno, co se v něm utopí, zůstane potichu.',
      special: ['Jeho balíček obsahuje utonulé služebníky Nulu.'],
    },
    v1_boss: {
      name: 'Hlasatel černého slunce',
      title: 'První, kdo poklekl',
      intro: 'Viděl jsem ho vyjít dřív než kdokoli jiný. Poklekl jsem první. Teď poklekni vedle mě.',
      special: [
        'Schopnosti Strážce: Černé slunce, Žeň duší II.',
        'Jeho balíček obsahuje samotného Hlasatele a Modlu černého slunce.',
      ],
    },
    v2_e1: {
      name: 'Inkvizitorka Varra',
      title: 'Očistitelka plamenem',
      intro: 'Všechno, čeho se černé slunce dotklo, musí shořet. A ty jsi stál v jeho světle.',
      special: ['Její balíček obsahuje očistný oheň proti rozloženým.'],
    },
    v2_e2: {
      name: 'Ilun',
      title: 'Mudrc Střepů hasnoucích hvězd',
      intro: 'Hvězdy zhasínají jedna po druhé. Ty, které mi zbyly, ti zhasnout nedovolím.',
      special: ['Jeho balíček obsahuje poslední světlo Konkláve Lumenu.'],
    },
    v2_e3: {
      name: 'Hladový stín',
      title: 'Ústa bez tváře',
      intro: 'Víc. Víc. Pořád víc.',
      special: ['Jeho balíček obsahuje karty s Pohlcením navíc.'],
    },
    v2_b1: {
      name: 'Matka hniloby',
      title: 'Srdce zvadlého lesa',
      intro: 'Pšt. Lehni si, maličký. Moje děti mají hlad a ty jsi tak krásně teplý.',
      special: [
        'Začíná s 35 životy.',
        'Schopnosti Strážce: Květ hniloby, Pramen II.',
        'Její balíček obsahuje samotnou Matku hniloby.',
      ],
    },
    v2_boss: {
      name: 'Simba',
      title: 'Dokonalý predátor',
      intro: 'Každý lov končí stejně. Jediná otázka je, kolik jich bude.',
      special: [
        'Začíná s 35 životy.',
        'Schopnosti Strážce: Vrcholný lov, Krvavá daň II.',
        'Jeho balíček obsahuje samotného Simbu.',
      ],
    },
    v3_e1: {
      name: 'Popelavý strážce Kael',
      title: 'Strážce poslední brány',
      intro: 'Přísahal jsem, že touhle branou nic neprojde, dokud se slunce nevrátí. Nevrátilo se.',
      special: [
        'Začíná se 40 životy.',
        'Schopnosti Strážce: Přísaha popela, Válečný pokřik III.',
        'Jeho balíček obsahuje samotného Kaela.',
      ],
    },
    v3_b1: {
      name: 'Stroj hladu',
      title: 'Nikdo mu neřekl, ať přestane',
      intro: 'PALIVO. NÍZKÁ. HLADINA. VYŽADOVÁN. VSTUP.',
      special: [
        'Začíná se 40 životy a 5 brněním.',
        'Schopnosti Strážce: Přiložit pod kotel, Nýtované plátování II.',
        'Jeho balíček obsahuje samotný Stroj hladu.',
      ],
    },
    v3_b2: {
      name: 'Nereth',
      title: 'Srdce víru',
      intro: 'Na dně každého víru stojí trůn. Držela jsem ho pro něj v chladu.',
      special: [
        'Začíná se 40 životy.',
        'Schopnosti Strážce: Zamrzlá hymna, Náhlý mráz III.',
        'Její balíček obsahuje Nereth a Utonulý sbor.',
      ],
    },
    v3_b3: {
      name: 'Zúčtovatel',
      title: 'Každý dluh vyrovnán',
      intro: 'Dlužíš za každou jednotku, kterou jsi cestou ke mně obětoval. Vedl jsem si účet. Je dlouhý.',
      special: [
        'Začíná se 40 životy.',
        'Schopnosti Strážce: Konečné vyúčtování, Nekonečný II.',
        'Jeho balíček obsahuje samotného Zúčtovatele.',
      ],
    },
    v3_final: {
      name: 'Sali',
      title: 'Stvořitel',
      intro: 'Před první hvězdou, před prvním slovem, jsem tu už seděl. Myslel sis, že se mi postavíš?',
      special: [
        'Začíná se 45 životy a 1 energií navíc.',
        'Schopnosti Strážce: Povstání vládce, Volání zatmění.',
        'Jeho balíček obsahuje samotného Saliho a Neutvořitele.',
      ],
    },
    l1_e1: {
      name: 'Morrow Popelozávoj',
      title: 'Dutý věštec Nulského hvozdu',
      intro: 'Tvoje lucerna je tak jasná. Stromy to bolí. Zhasni ji a přestanou křičet.',
      special: ['Jeho balíček obsahuje hnilobu Nulského hvozdu.'],
    },
    l1_e2: {
      name: 'Grimbark',
      title: 'Parožnatý stín',
      intro: 'Každý lampář, který šel touhle cestou, je pořád tady. Pod kořeny. Chceš se s nimi seznámit?',
      special: ['Jeho balíček obsahuje stíny ztracených lampářů.'],
    },
    l1_boss: {
      name: 'Nyx',
      title: 'Lucerna Nulu',
      intro: 'Lampáři rozsvítili proti tmě tisíc luceren. Já jsem ta, kterou tma rozsvítila nazpátek.',
      special: ['Schopnosti Strážce: Květ hniloby, Žeň duší II.', 'Její balíček obsahuje samotnou Nyx. Poraz ji a přidá se k tobě.'],
    },
    l2_e1: {
      name: 'Starý Trnokožec',
      title: 'Kůrou spoutaný surovec',
      intro: 'Kdysi jsem cestu hlídal. Teď jsem cesta já. Přejdi po mně, jestli to dokážeš.',
      special: ['Jeho balíček obsahuje Strážce shnilých kořenů a Hnijícího kolosa.'],
    },
    l2_e2: {
      name: 'Sestra Ilwen',
      title: 'Strážkyně shnilé hole',
      intro: 'Háj vyléčí všechno. I to, co by mělo zůstat mrtvé.',
      special: ['Její balíček obsahuje Srdce zvadlého lesa.'],
    },
    l2_boss: {
      name: 'Vael',
      title: 'Umíráček prázdnoty',
      intro: 'Každý zvon v Nulském hvozdu zazvoní jednou. Ten můj zvoní pro všechny.',
      special: ['Začíná se 35 životy.', 'Schopnosti Strážce: Černé slunce, Kůra místo kůže II.', 'Jeho balíček obsahuje samotného Vaela a Matku hniloby.'],
    },
    l3_e1: {
      name: 'Mudrc z Trnového lesa',
      title: 'Počtář luceren',
      intro: 'Spočítal jsem každou lucernu, kterou jsi cestou rozsvítil. Jedenáct. Teď spočítám, kolik si jich udržíš.',
      special: ['Jeho balíček obsahuje Plíživý rozpad a Nasyť Prázdnotu.'],
    },
    l3_e2: {
      name: 'Oko háje',
      title: 'Vidí cestu za tebou',
      intro: 'Vidím cestu za tebou. Už zarostla.',
      special: ['Začíná se 35 životy.', 'Jeho balíček obsahuje Oko propasti.'],
    },
    l3_boss: {
      name: 'Oblivie',
      title: 'Strážkyně poslední stránky',
      intro: 'Každý příběh končí na stránce, kterou nikdo nečte. Ty stránky opatruju já. Tvoje je na řadě.',
      special: ['Začíná se 40 životy.', 'Schopnosti Strážce: Poslední Střep, Pramen II.', 'Její balíček obsahuje samotnou Oblivii a Rituál zatmění.'],
    },
    w1_e1: {
      name: 'Bledý nocležník',
      title: 'Host od okna',
      intro: 'Posaď se, posaď. Karty jsou studené, ale to já taky.',
      special: ['Jeho balíček obsahuje Bledého nocležníka. Poraz ho a karta je tvoje.'],
    },
    w1_e2: {
      name: 'Dutý Tom',
      title: 'Noční hraničář z okraje lesa',
      intro: 'Čtyřicet let jsem hlídal okraj lesa. Teď hlídám dveře. Bez partičky nikdo neodejde.',
      special: ['Jeho balíček obsahuje samotného Dutého Toma. Poraz ho a karta je tvoje.'],
    },
    w1_boss: {
      name: 'Mechoplášť',
      title: 'Parožnatý hraničář',
      intro: 'Les mě poslal hlídat tenhle hostinec. Hostinec mě poprosil, ať zůstanu. Hraj, Strážce, a já ti řeknu, kdo z nich vyhrál.',
      special: ['Schopnosti Strážce: Vrcholný lov, Kůra místo kůže II.', 'Jeho balíček obsahuje samotného Mechopláště. Poraz ho a přidá se k tobě.'],
    },
    w2_e1: {
      name: 'Doktor Corvin',
      title: 'Zobákatý lékař',
      intro: 'Bledá kůže, studené ruce, slabý tep. Sem zapadneš dokonale.',
      special: ['Jeho balíček obsahuje samotného doktora Corvina. Poraz ho a karta je tvoje.'],
    },
    w2_e2: {
      name: 'Karmínová kápě',
      title: 'Hraničářka, která zrudla',
      intro: 'Hraničáři chrání les. Já ho chráním před hraničáři.',
      special: ['Její balíček obsahuje Karmínovou kápi. Poraz ji a karta je tvoje.'],
    },
    w2_boss: {
      name: 'Bramhorn',
      title: 'Lovec s lebkou místo tváře',
      intro: 'Lovím všechno, co vejde do tohohle lesa. Dnes v noci lovím tebe, v kartách. Zítra, kdo ví.',
      special: ['Začíná se 35 životy.', 'Schopnosti Strážce: Přísaha popela, Rozdmýchaný hněv II.', 'Jeho balíček obsahuje samotného Bramhorna. Poraz ho a přidá se k tobě.'],
    },
    w3_e1: {
      name: 'Utopený host',
      title: 'Vylezl studnou',
      intro: 'Promiň. Dlouho jsem nemluvil. Voda se dostává do slov. Rozdej karty.',
      special: ['Jeho balíček obsahuje Utopeného hosta. Poraz ho a karta je tvoje.'],
    },
    w3_e2: {
      name: 'Hartwrath',
      title: 'Jelení hraničář',
      intro: 'Byl jsem nejlepší stopař, jakého hraničáři kdy měli. Pak jsem stopoval velkého jelena. Teď máme společnou hlavu.',
      special: ['Jeho balíček obsahuje samotného Hartwratha. Poraz ho a karta je tvoje.'],
    },
    w3_boss: {
      name: 'Vdova v bílém',
      title: 'Nevěsta z jezera',
      intro: 'Slíbil, že se z jezera vrátí. Ty neseš jeho lucernu. Kde je?',
      special: ['Začíná se 35 životy.', 'Schopnosti Strážce: Zamrzlá hymna, Náhlý mráz II.', 'Její balíček obsahuje samotnou Vdovu. Poraz ji a přidá se k tobě.'],
    },
    w4_e1: {
      name: 'Mlčenlivý host',
      title: 'Sleduje karty',
      intro: '…',
      special: ['Jeho balíček obsahuje Mlčenlivého hosta. Poraz ho a karta je tvoje.'],
    },
    w4_e2: {
      name: 'Starý Kostník',
      title: 'Výčepní',
      intro: 'Ještě jednu rundu? Ale jistě. Před poslední objednávkou nikdo neodchází. A já poslední objednávku nikdy nevyhlásím.',
      special: ['Začíná se 35 životy.', 'Jeho balíček obsahuje samotného Starého Kostníka. Poraz ho a karta je tvoje.'],
    },
    w4_boss: {
      name: 'Dutý hostitel',
      title: 'Pán hostince v Přízračném hvozdu',
      intro: 'Každý host u mého stolu si kdysi myslel, že mě porazí. Posaď se, Strážce. Tvoje židle tu čeká už hodně dlouho.',
      special: ['Začíná se 45 životy a 1 energií navíc.', 'Schopnosti Strážce: Stínový nábor, Zesílený trup II.', 'Jeho balíček obsahuje samotného Dutého hostitele. Poraz ho a přidá se k tobě.'],
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
    ch6: {
      name: 'Kapitola VI – Hořící rozkvět',
      description: 'Stínový trůn padl a jeho Střepy dopadají do divočiny, kde se o každý z nich přetahuje oheň s kořeny.',
    },
    ch7: {
      name: 'Kapitola VII – Hodinová nebesa',
      description: 'Střepy stoupají k nebi, kde se o ně předhání Mosazné dominium s Konkláve Lumenu.',
    },
    ch8: {
      name: 'Kapitola VIII – Utopená hymna',
      description: 'Střepy klesají do hlubin, kde je Dvůr Jinovatky a Prázdný chór uspávají zpěvem.',
    },
    ch9: {
      name: 'Kapitola IX – Poslední Střep',
      description: 'Všechny Střepy jsou konečně pohromadě. Mezi tebou a celou Korunou stojí jen mocnosti, které je rozprášily.',
    },
    vr1: {
      name: 'Kapitola I – Vychází černé slunce',
      description: 'V poledne vystoupá nad Aethru černé slunce. Kultisté pod ním zpívají a země začíná hnít.',
    },
    vr2: {
      name: 'Kapitola II – Hlad se šíří',
      description: 'Čeho se Prázdnota dotkne, to sežere. Kdo s ní bojuje, začne hnít, a kdo ji krmí, má jen větší hlad.',
    },
    vr3: {
      name: 'Kapitola III – Trůn ve tmě',
      description: 'Pod černým sluncem stojí trůn starší než první hvězda. Cestu k němu ti zastoupí všechny mocnosti Zúčtování.',
    },
    lr1: {
      name: 'Kapitola I – Nerozsvícená míle',
      description: 'Stará obchodní stezka vede Nulským hvozdem. Lucerny podél ní zhasly a něco mezi stromy zhasíná i ty zbylé.',
    },
    lr2: {
      name: 'Kapitola II – Kořeny ničeho',
      description: 'Hlouběji v lese rostou stromy kolem děr ve světě. Strážci, kteří o ně pečovali, se proměnili v něco těžšího.',
    },
    lr3: {
      name: 'Kapitola III – Poslední lucerna',
      description: 'Na konci cesty stojí první maják cechu. U jeho světla si něco čte už hodně dlouho.',
    },
    wi1: {
      name: 'Kapitola I – Místo u ohně',
      description: 'Hluboko ve strašidelném lese stojí hostinec, který není na žádné mapě. Lucerny svítí, dveře jsou otevřené a u každého stolu čeká hráč.',
    },
    wi2: {
      name: 'Kapitola II – Poslední objednávka',
      description: 'Zvonek nad výčepem ohlašuje poslední objednávku. Hosté u zadních stolů nikdy neodcházejí a neradi prohrávají.',
    },
    wi3: {
      name: 'Kapitola III – Schody do sklepa',
      description: 'Pod hostincem vedou schody hlouběji, než je dům vysoký. Hosté tam dole vylezli z vody.',
    },
    wi4: {
      name: 'Kapitola IV – Stůl hostitele',
      description: 'V čele hostince stojí jeden dlouhý stůl. Každý host, kterého porazíš, si k němu sedne, a na druhém konci čeká hostitel.',
    },
  },
};

export default v;
