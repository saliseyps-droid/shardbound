import type { CardsOverlay } from '../../overlayTypes';

const cards: CardsOverlay = {
  ast_lumen_acolyte: { name: 'Akolytka Lumenu', description: 'Posílení 1.', flavorText: 'Studenti prvního ročníku leští dalekohledy. Druháci se učí, proč září.' },
  ast_starlit_spark: { name: 'Hvězdná jiskra', description: 'Způsob 1 poškození postavě. Lízni si kartu.', flavorText: 'Jediná jiskra, popsaná a pojmenovaná, dokáže rozsvítit tisíc stránek.' },
  ast_orrery_apprentice: { name: 'Učednice planetária', description: 'Když sešleš kouzlo, získá +1/+0.', flavorText: 'Každé kouzlo pootočí další mosazný prstenec jejího planetária. Každý prstenec zpřesní její mušku.' },
  ast_glimmer_wisp: { name: 'Třpytivá bludička', description: 'Při nasazení: Přidej si do ruky Jiskru vhledu. Je Pomíjivá.', flavorText: 'Kudy pluje, tam roní jiskry hvězdného světla. Učenci za ní chodí se sklenicemi.' },
  ast_prismwarden: { name: 'Hranolový strážný', description: 'Stráž.', flavorText: 'Světlo se kolem něj ohýbá. Stejně jako čepele každého, kdo je tak pošetilý, že zaútočí.' },
  ast_comet_scholar: { name: 'Badatelka komet', description: 'Při nasazení: Způsob 2 poškození nepřátelské jednotce.', flavorText: 'Místo dopadu komety předpověděla na palec přesně. Její rival neuhnul včas.' },
  ast_nebula_sentinel: { name: 'Mlhovinový hlídač', description: 'Ochrana.', flavorText: 'Je utkaný z prachu mezi hvězdami a pouhé zaklínadlo ho nedokáže rozplést.' },
  ast_chart_the_heavens: { name: 'Mapa nebes', description: 'Lízni si 2 karty.', flavorText: 'Každé souhvězdí je věta. Každá věta je tajemství.' },
  ast_hush_of_stars: { name: 'Ticho hvězd', description: 'Umlč nepřátelskou jednotku (odstraň její text a vylepšení).', flavorText: 'V tichu horního nebe zapomenou slova i kletby.' },
  ast_ringing_refrain: { name: 'Zvonivý refrén', description: 'Ozvěna. Způsob 1 poškození náhodnému nepříteli.', flavorText: 'Sbory Konkláve zpívají jediný tón světla – a nechají nebesa, ať ho zopakují.' },
  ast_moonlit_librarian: { name: 'Knihovnice v měsíčním svitu', description: 'Při nasazení: Lízni si kouzlo.', flavorText: 'Knihy řadí podle fází měsíce. Nikdo jiný v nich nic nenajde.' },
  ast_spellweaver_adept: { name: 'Adeptka tkaní kouzel', description: 'Při nasazení: Způsob 2 poškození náhodnému nepříteli za každé kouzlo, které jsi v tomto tahu seslal.', flavorText: 'Každé dokončené kouzlo vetká do dalšího, dokud vzorec nezačne kousat.' },
  ast_starfall: { name: 'Pád hvězd', description: 'Způsob 3 poškození nepřátelské jednotce a jejím sousedům.', flavorText: 'Konkláve hvězdy nehází. Prostě je přestane držet nahoře.' },
  ast_astrolabe_of_seers: { name: 'Astroláb věštců', description: 'Když sešleš kouzlo, lízni si kartu. Náboje: 3.', flavorText: 'Srovnej prstence, vyslov kouzlo a budoucnost za tebe obrátí stránku.' },
  ast_starlight_mirror: { name: 'Zrcadlo hvězdného svitu', description: 'Přidej si do ruky kopii jednotky.', flavorText: 'Co zrcadlo spatří, to si Konkláve ponechá.' },
  ast_veiled_astromancer: { name: 'Zahalená astromantka', description: 'Ochrana. Při nasazení: Kouzla v tvé ruce stojí o (1) méně.', flavorText: 'Za jejím závojem je nebe, jaké nikdy nikdo jiný neviděl.' },
  ast_archive_unbound: { name: 'Rozpoutaný archiv', description: 'Lízni si 2 karty. Přebití 2: Lízni si další kartu a získej 3 brnění.', flavorText: 'Některé knihy jsou spoutané kvůli bezpečí čtenáře. Některé kvůli bezpečí světa.' },
  ast_glass_observatory: { name: 'Skleněná observatoř', description: 'Na začátku tvého tahu si přidej do ruky náhodné kouzlo Lumenu. Trvá 3 tahy.', flavorText: 'Její kopule je vybroušená z jediného padlého Střepu. Hvězdy se dívají zpátky.' },
  ast_collapse_of_heaven: { name: 'Zhroucení nebes', description: 'Způsob 4 poškození všem jednotkám.', flavorText: 'Astromanti tomu říkají „přepsání mapy“. Všichni ostatní tomu říkají konec.' },
  ast_conduit_of_lumen: { name: 'Vodič Lumenu', description: 'Tvá kouzla stojí o (1) méně.', flavorText: 'Mřížka čoček, která pije hvězdné světlo a levně ho vlévá do kouzel.' },
  ast_pilfered_constellation: { name: 'Ukradené souhvězdí', description: 'Ukradni 2 náhodné karty z balíčku protivníka.', flavorText: 'Čti nepřítelovy hvězdy dost pozorně a stanou se tvými.' },
  ast_bubblemaker_qinny: { name: 'Bublinář Qinny', description: 'Při nasazení: Dej svým ostatním jednotkám Bariéru.', flavorText: 'Každá bublina v sobě nese dech hvězdného světla. Každý dech odrazí čepel.' },
  ast_liu_kano: { name: 'Liu Kano', description: 'Ochrana. Když sešleš kouzlo, způsob 2 poškození náhodnému nepříteli.', flavorText: 'Opustil světlo Konkláve, aby lovil to, co se skrývá ve tmě. Světlo si vzal s sebou.' },
  ast_selenne: { name: 'Selenne, Strážkyně oběžnic', description: 'Když sešleš kouzlo, vyvolej Hvězdný úlomek 1/1.', flavorText: 'Každé její kouzlo zanechá na oběžné dráze kolem ní novou hvězdu. Už ztratila přehled.' },
  ast_oruvael: { name: 'Oruvael, Poslední hvězda', description: 'Ochrana. Při nasazení: Umlč všechny nepřátelské jednotky. Lízni si 2 karty.', flavorText: 'Až na mapě Konkláve vyhasne poslední hvězda, bude to tahle.' },
};

export default cards;
