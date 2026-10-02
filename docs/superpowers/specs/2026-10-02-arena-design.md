# Arena – design

Datum: 2026-10-02 · Stav: schváleno v chatu

## Cíl

Nový herní režim proti AI. Hráč zaplatí vstupné, zvolí jednu ze dvou frakcí a v draftu si poskládá deck. S tímto deckem pak hraje proti postupně těžším soupeřům, dokud neprohraje, nebo nevyhraje 4×. Odměna závisí na počtu výher.

## Pravidla

- **Vstup:** 300 goldů. Najednou může běžet jen jeden arena běh.
- **Frakce:** nabídnou se 2 náhodné různé hratelné frakce a hráč si vybere jednu.
- **Draft:** 30 kol. Každé kolo nabídne 3 různé sběratelské karty, všechny buď ze zvolené frakce, nebo neutrální. Hráč si jednu vezme.
  - Každé kolo má jednu vzácnost, losovanou s váhami Common 70, Rare 22, Epic 6 a Legendary 2.
  - Do nabídky se nedostane karta, která už je v decku v maximálním počtu kopií (2, Legendary 1).
  - Když pro vylosovanou vzácnost nejsou alespoň 3 vhodné karty, použije se nejbližší nižší vzácnost (a nakonec libovolná vzácnost).
- **Talenty:** po draftu si hráč nastaví talentový strom. Předvyplněný je výchozí build frakce a pravidla jsou stejná jako u decku.
- **Zápasy:** max. 4.
  - Soupeř je náhodná frakce s AI deckem, obtížnost podle počtu výher: Normal, Normal, Hard, Expert.
  - Běh končí první prohrou, remízou (počítá se jako prohra) nebo po 4 výhrách.
  - Za zápasy se dávají normální XP, goldy a postup úkolů jako v režimu Practice.
- **Retire:** hráč může běh kdykoli ukončit. Dostane odměnu podle dosavadních výher.
- **Draftované karty** platí jen pro běh. Hráč je nemusí vlastnit a do sbírky nepřibudou.

## Odměny

| Výhry | Odměna |
|---|---|
| 0 | 1 balíček + 50 goldů |
| 1 | 1 balíček + 150 goldů |
| 2 | 2 balíčky + 250 goldů |
| 3 | 2 balíčky + 400 goldů |
| 4 | 3 balíčky + 600 goldů + náhodný card back, který hráč nemá (když má všechny, dostane místo něj +300 goldů) |

Set každého balíčku se losuje.

## Technicky

- **`config/arena.ts`:** vstupné, počet karet, váhy vzácností, obtížnosti a tabulka odměn.
- **`domain/arena.ts`:** čisté funkce `startArena`, `chooseFaction`, `currentOffer`, `pickCard`, `setArenaTalents`, `arenaDeck`, `arenaOpponent`, `recordArenaMatch`, `retireArena` a `arenaRewards`.
  - Nabídky jsou deterministické ze seedu běhu a čísla kola, takže znovunačtení nic nepřelosuje.
- **`GameSave.arena`:** typ `ArenaState`, tedy `run` (rozehraný běh nebo `null`) a `last` (shrnutí posledního běhu).
  - Ukládá se ve slice progress.
  - Při načtení savu se opraví, neplatný běh se zahodí.
- **Režim zápasu `ARENA`:**
  - `MatchConfig.arena = true`, hraje se s virtuálním deckem z běhu.
  - `MatchRecord.mode` dostane hodnotu `'ARENA'`.
  - Po zápase se zavolá `recordArenaMatch`.
- **UI:**
  - Obrazovka `/arena` s fázemi vstup → frakce → draft → talenty → zápasy → shrnutí.
  - Karta „Arena“ na obrazovce Play.
  - Na obrazovce výsledků zápasu tlačítko „Back to Arena“.
