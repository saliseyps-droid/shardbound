# Warden Talents – design

Datum: 2026-10-02 · Stav: návrh k revizi

## Cíl

Jedinou Warden Sigil (jedna schopnost na frakci) nahradí **talentový strom Wardena**. Strom se nastavuje u každého decku v editoru. Hráč si z 5 schopností své frakce vybere 2 a vylepší je. Každý deck tak dostane vlastní identitu Wardena a dáváme hráči novou rozhodovací vrstvu, která nezávisí na kartách.

## Pravidla (odsouhlasená)

- Warden zůstává stejný (portrét, frakce). Žádná nová postava.
- Každá hratelná frakce má **5 schopností**. Každá schopnost má řetěz **základ → vylepšení I → vylepšení II**, celkem 15 uzlů na frakci.
- Každý uzel stojí 1 talentový bod. Hráč má **5 bodů** a **musí utratit všechny**.
- Deck musí mít **přesně 2 schopnosti**. Vylepšení II jde vzít jen po vylepšení I.
- Z toho plyne, že platný build má vždy tvar **jedna schopnost na úrovni II + druhá na úrovni I** (5 × 4 = 20 buildů na frakci).
- Schopnosti jsou **aktivní** (tlačítko, stojí energii, standardně 1× za kolo) nebo **pasivní** (spouští se samy triggerem). Hráč si vezme libovolné 2, klidně dvě aktivní nebo dvě pasivní.
- Vše je dostupné hned a zdarma a přestavět se dá kdykoli.
- Nový i migrovaný deck dostane **výchozí build** frakce. Deck s neplatným buildem nejde hrát.
- AI soupeři mají pevné buildy. **Bossové** mají vlastní 2 schopnosti místo Sigil.

## Datový model

### `src/data/wardenTalents.ts` (nový, nahrazuje `heroPowers.ts`)

```ts
type TalentLevel = 0 | 1 | 2;               // 0 = základ, 1 = +I, 2 = +I+II

interface ActiveLevel  { cost: number; target?: TargetRequirement; effects: Effect[]; usesPerTurn?: number; description: string }
interface PassiveLevel { abilities: Ability[]; limitPerTurn?: number; description: string }

interface TalentAbility {
  id: string;                               // 'wt_ember_cinder_bolt'
  faction: PlayableFaction | 'BOSS';
  name: string;
  kind: 'ACTIVE' | 'PASSIVE';
  levels: ActiveLevel[] | PassiveLevel[];   // délka 3 pro frakce, 1 pro bosse
  /** Krátký popis změny každého vylepšení pro tooltip uzlu (index 1 a 2). */
  upgradeNotes: [string, string] | [];
}

export interface TalentPick { abilityId: string; level: TalentLevel }
export type TalentBuild = [TalentPick, TalentPick];

export const FACTION_TALENTS: Record<PlayableFaction, TalentAbility[]>;   // 5 na frakci
export const DEFAULT_BUILD: Record<PlayableFaction, TalentBuild>;
export function getTalent(id: string): TalentAbility | undefined;
export function validateBuild(faction: PlayableFaction, build: unknown): string | null;  // null = OK
```

Každá úroveň je **ručně napsaná kompletní definice** (žádné patche). Texty v `description` píšu ručně. `describe.ts` se pro schopnosti nepoužívá, protože u nich chceme kratší formulace.

### Deck (`src/domain/decks.ts`)

- `Deck` dostane nové pole `talents: TalentBuild`.
- `validateDeck` přidá chybu `TALENTS` s textem „Choose 2 Warden abilities and spend all 5 talent points.“ Kontroluje:
  - právě 2 různé schopnosti, obě z frakce decku,
  - úrovně 0–2 a součet úrovní = 3, tedy 2 + 3 = 5 bodů.
- Při změně `heroFaction` v editoru se build resetuje na `DEFAULT_BUILD` nové frakce.
- Starter decky, `autoBuildDeck` i nové decky dostanou `DEFAULT_BUILD`.

### Migrace savu (`src/persistence/migrations.ts`)

- Zvýší se `saveVersion`. Nová migrace doplní každému decku `talents = DEFAULT_BUILD[heroFaction]`.
- Oprava při načítání: neplatný build se nahradí výchozím, aby se save nerozbil.

## Engine

### Stav

```ts
interface HeroAbilityState { id: string; level: TalentLevel; uses: number }   // uses = použití / spuštění tento tah
interface HeroState { …; abilities: HeroAbilityState[] }                     // místo heroPowerId / heroPowerUses
interface PlayerSetup { …; talents?: TalentPick[] }                           // místo heroPowerId
```

- `uses` se nuluje na začátku tahu vlastníka, tam kde se dnes nuluje `heroPowerUses`.

### Aktivní schopnosti

- Akce je `{ type: 'HERO_POWER'; player; slot: 0 | 1; target? }`. Zachovávám jméno akce, aby změna v AI, síti a logu zůstala malá.
- `canUseHeroPower(state, player, slot)` kontroluje, že schopnost je aktivní, je na ni energie, nepřekročila `usesPerTurn` a existuje validní cíl.
- `legal.ts` generuje akce pro oba sloty.
- Událost `HERO_POWER_USED` dostane `slot` a `abilityId` místo `powerId`.

### Pasivní schopnosti

- `listenersFor` přidá zdroj `{ kind: 'hero', uid: -1 - slot, controller }` s `abilities` dané úrovně. Klíč pro dedupe je unikátní díky `uid`.
- `limitPerTurn`: před zařazením triggeru se zkontroluje a zvýší `uses` daného slotu. Po dosažení limitu se trigger tento tah nezařadí.
- Kontrola `sourceStillValid` pro `hero` už dnes vrací `true`.
- Používají se jen existující triggery a efekty. Jediné nové rozšíření engine je `limitPerTurn`.

### Ward

- Text klíčového slova se změní na „Cannot be targeted by enemy spells or Warden abilities.“ Logika zůstává.

## Obsah: 30 schopností frakcí

Formát: **Název** (A = aktivní, P = pasivní), pak úrovně L0 / L1 / L2. ★ označuje bývalou Sigil frakce. Čísla jsou výchozí návrh, finální balanc ladíme po simulaci.

### Ember (Cinder Legion)
1. **Cinder Bolt** ★ (A)
   - L0: 2⚡, deal 1 damage to an enemy.
   - L1: 2⚡, deal 1 damage and apply Burn 1.
   - L2: 1⚡, deal 1 damage and apply Burn 1.
2. **Kindled Fury** (P), na začátku tvého tahu:
   - L0: a random friendly unit gets +1 Attack this turn.
   - L1: +1 Attack permanently.
   - L2: +1/+1 permanently.
3. **Imp Summoning** (A)
   - L0: 3⚡, summon a 2/1 Ember Imp.
   - L1: 2⚡, summon a 2/1 Ember Imp.
   - L2: 2⚡, summon an Ember Imp and deal 1 damage to the enemy Warden.
4. **Searing Wrath** (P), whenever you cast a spell:
   - L0: deal 1 damage to the enemy Warden (1× per turn).
   - L1: same effect, 2× per turn.
   - L2: 2× per turn, plus 1 damage to a random enemy unit.
5. **Warcry** (A)
   - L0: 2⚡, give a friendly unit +2 Attack this turn.
   - L1: 2⚡, +2 Attack this turn and Rush.
   - L2: 1⚡, +2 Attack this turn and Rush.

Výchozí build: Cinder Bolt L2 + Kindled Fury L1.

### Verdant (Thornweald Circle)
1. **Sap of the Root** ★ (A)
   - L0: 2⚡, restore 2 Health to a friendly character.
   - L1: 2⚡, restore 3 Health.
   - L2: 1⚡, restore 3 Health.
2. **Sprout** (A)
   - L0: 2⚡, summon a 1/2 Sapling.
   - L1: 2⚡, summon a Sapling and restore 1 Health to your Warden.
   - L2: 1⚡, summon a Sapling and restore 1 Health to your Warden.
3. **Wellspring** (P), na konci tvého tahu:
   - L0: restore 1 Health to all friendly characters.
   - L1: restore 2 Health to all friendly characters.
   - L2: restore 3 Health to all friendly characters.
4. **Barkskin** (P), whenever you summon a unit, give it:
   - L0: +0/+1.
   - L1: +0/+2.
   - L2: +1/+2.
5. **Thornguard** (A)
   - L0: 3⚡, give a friendly unit +0/+2 and Guard.
   - L1: 2⚡, +0/+2 and Guard.
   - L2: 2⚡, +1/+3 and Guard.

Výchozí build: Sap of the Root L2 + Barkskin L1.

### Iron (Brass Dominion)
1. **Rivet Plating** ★ (A)
   - L0: 2⚡, gain 2 Armor.
   - L1: 2⚡, gain 3 Armor.
   - L2: 2⚡, gain 4 Armor.
2. **Assemble** (A)
   - L0: 2⚡, summon a 1/1 Scrapbot.
   - L1: 2⚡, summon a Scrapbot and gain 1 Armor.
   - L2: 2⚡, summon two Scrapbots.
3. **Reinforced Hull** (P), na konci tvého tahu:
   - L0: gain 1 Armor.
   - L1: gain 2 Armor.
   - L2: gain 3 Armor.
4. **Assembly Protocol** (P), whenever you summon a Construct:
   - L0: give it +1/+0.
   - L1: give it +1/+1.
   - L2: give it +1/+1 and gain 1 Armor.
5. **Overclock** (A)
   - L0: 3⚡, give a friendly unit +1/+1.
   - L1: 2⚡, +1/+1.
   - L2: 2⚡, +2/+1.

Výchozí build: Rivet Plating L2 + Assembly Protocol L1.

### Astral (Lumen Conclave)
1. **Starlit Insight** ★ (A)
   - L0: 2⚡, add a Fleeting Mote of Insight to your hand.
   - L1: 1⚡, Fleeting Mote.
   - L2: 1⚡, Mote without Fleeting.
2. **Arcane Volley** (A)
   - L0: 3⚡, deal 1 damage to a random enemy twice.
   - L1: 2⚡, twice.
   - L2: 2⚡, three times.
3. **Spellweave** (P), whenever you cast a spell:
   - L0: a random friendly unit gets +1/+0.
   - L1: +1/+1.
   - L2: +1/+1 and restore 1 Health to your Warden.
4. **Foresight** (P), na začátku tvého tahu draw a card, if you have:
   - L0: 2 or fewer cards in hand.
   - L1: 3 or fewer.
   - L2: 4 or fewer.
5. **Star Fragment** (A)
   - L0: 2⚡, summon a 1/1 Star Fragment (Empower 1).
   - L1: 1⚡, summon one Star Fragment.
   - L2: 2⚡, summon two Star Fragments.

Výchozí build: Starlit Insight L2 + Foresight L1.

### Void (Hollow Choir)
1. **Hollow Summons** ★ (A)
   - L0: 2⚡, summon a 1/1 Hollow Wisp.
   - L1: 2⚡, summon 2/2 Risen Bones.
   - L2: 2⚡, summon Risen Bones and a Hollow Wisp.
2. **Soul Harvest** (P), whenever a friendly unit dies (max 3× per turn):
   - L0: deal 1 damage to the enemy Warden.
   - L1: deal 1 damage and restore 1 Health to your Warden.
   - L2: deal 2 damage and restore 1 Health to your Warden.
3. **Blood Price** (A)
   - L0: 1⚡, deal 3 damage to your Warden and draw a card.
   - L1: 1⚡, 2 damage to your Warden and draw a card.
   - L2: 0⚡, 2 damage to your Warden and draw a card.
4. **Grave Pact** (A)
   - L0: 2⚡, destroy a friendly unit and draw a card.
   - L1: 2⚡, destroy a friendly unit, draw a card and deal 2 damage to a random enemy.
   - L2: 1⚡, same effect as L1.
5. **Unending** (P), na konci tvého tahu, if a friendly unit died this turn:
   - L0: summon a Hollow Wisp.
   - L1: summon Risen Bones.
   - L2: summon Risen Bones and a Hollow Wisp.

Výchozí build: Hollow Summons L2 + Soul Harvest L1.

### Tide (Rimetide Court)
1. **Rime Touch** ★ (A)
   - L0: 2⚡, Freeze an enemy unit.
   - L1: 2⚡, Freeze and deal 1 damage.
   - L2: 1⚡, Freeze and deal 1 damage.
2. **Undertow** (A)
   - L0: 3⚡, return an enemy unit costing 3 or less to its owner's hand.
   - L1: 3⚡, units costing 4 or less.
   - L2: 2⚡, units costing 4 or less.
3. **Cold Snap** (P), na začátku tvého tahu add a Fleeting Rime Shard to your hand, if you have:
   - L0: 3 or fewer cards in hand.
   - L1: 5 or fewer cards in hand.
   - L2: 5 or fewer cards, and the Shard is not Fleeting.
4. **Tidepool** (A)
   - L0: 2⚡, summon a 1/2 Tidepup.
   - L1: 2⚡, summon a Tidepup and restore 2 Health to your Warden.
   - L2: 2⚡, summon a Tidepup, restore 2 Health and Freeze a random enemy unit.
5. **Whirlpool** (P), whenever you cast a spell:
   - L0: Freeze a random enemy unit (1× per turn).
   - L1: Freeze a random enemy unit and deal 1 damage to a random enemy unit (1× per turn).
   - L2: same as L1, 2× per turn.

Výchozí build: Rime Touch L2 + Undertow L1.

## Bossové

Bossovské schopnosti jsou `TalentAbility` s `faction: 'BOSS'` a jedinou úrovní. `SpecialRules.heroPowerId` se nahradí za `talents: TalentPick[]`. Validace bossů je volná (nepodléhá pravidlu 5 bodů).

| Boss | Schopnost 1 | Schopnost 2 |
|---|---|---|
| Grom the Unbroken | Rivet Plating L2 | Reinforced Hull L1 |
| Maw of the Deep | Crushing Depths (stávající) | Rime Touch L2 |
| Kharzul Reborn | Caldera Eruption (stávající) | Searing Wrath L1 |
| The Endless Choir | Requiem Chorus (stávající) | Unending L2 |
| The Shattered Sovereign | Crown Fragment (stávající) | Foresight L2 |

Popisy bossů v kampani („Warden Sigil: …“) se přepíšou na „Warden abilities: …, …“. Nepoužívaný `hp_boss_colossus` odstraním.

## AI soupeři

- Practice soupeři a AI v turnaji dostanou build podle osobnosti:
  - AGGRESSIVE: aktivní poškození na L2 a útočná pasivní na L1,
  - CONTROL: L2 na tempo nebo draw,
  - SWARM: L2 na summon,
  - BALANCED: `DEFAULT_BUILD`.
- Mapování osobnosti na build je per frakce v `opponents.ts`.
- AI používá aktivní schopnosti přes `legal.ts`. Priorita v `search.ts` (dnes `HERO_POWER → 4`) platí pro oba sloty.
- Pasivní schopnosti AI neřeší. Do `evaluate.ts` nic nepřidávám (YAGNI).
- Tutoriál: hráč má Cinder Bolt L2 + Kindled Fury L1. Krok „sigil“ se přejmenuje na „Warden ability“.

## Online

- Guest posílá `talents` v setupu. Host ho ověří přes `validateBuild(faction, talents)` místo dnešní kontroly `FACTION_HERO_POWER`.
- Mirrored view obsahuje `abilities` obou hráčů (`id`, `level`, `uses`). Build je veřejná informace.
- Verze protokolu se zvýší, aby se nesrovnaly staré a nové klienty.

## UI

### Editor decku: sekce „Warden Talents“

- Přepínač **Cards | Talents** v hlavičce editoru. Na mobilu jsou to záložky.
- Strom má 5 sloupců, jeden na schopnost. Každý sloupec má 3 uzly pod sebou (schopnost, I, II) spojené čárou.
- U každého uzlu jsou ikona frakce, štítek ACTIVE nebo PASSIVE a u aktivních cena ⚡.
- Nahoře počítadlo **„Talent points 3 / 5“** a tlačítko **„Reset to default“**.
- Kliknutí na uzel ho naučí, pokud to jde:
  - musí být naučený předchozí uzel,
  - musí zbývat bod,
  - nesmí to být třetí schopnost.
- Kliknutí na naučený uzel ho odnaučí, a s ním i všechny uzly pod ním.
- Nedostupné uzly jsou ztlumené a tooltip vysvětlí proč.
- Tooltip / detail uzlu: plný text dané úrovně a u vylepšení `upgradeNotes`, například „Cost 2 → 1“.
- Neúplný build se zobrazí v seznamu chyb decku a deck nejde vybrat ke hře. Nevznikají žádné nové typy chyb.
- Deck list a PlayScreen ukazují pod portrétem dvě malé ikony zvolených schopností s tooltipem.

### Zápas

- Vedle portrétu Wardena budou **2 sloty** místo dnešního jednoho krystalu Sigil.
  - Aktivní slot: klikatelný krystal s cenou, stav „použito“ a cílení jako dnes.
  - Pasivní slot: kulatý neklikatelný odznak. Při spuštění krátce zasvítí (událost s `abilityId`).
- Hover a pravé kliknutí ukáží text, i u soupeře.
- Log zápasu: „You used Cinder Bolt“ a „Kindled Fury triggered“.
- Klávesové zkratky Q a W pro sloty 1 a 2.

## Texty a přejmenování

„Warden Sigil“ se v UI, tutoriálu, keywordech a patch notes přejmenuje na „Warden ability“. Interní názvy (`HERO_POWER`) zůstávají.

## Testy

- `tests/talents.test.ts`:
  - `validateBuild` pro všechny tvary (2 schopnosti, součet 3, cizí frakce, duplicita, 1 nebo 3 schopnosti, nevyužité body),
  - každý `DEFAULT_BUILD` je validní.
- Engine:
  - oba sloty fungují nezávisle, každý má vlastní `usesPerTurn`,
  - cílení, nedostatek energie,
  - pasivní trigger se spustí a respektuje `limitPerTurn`,
  - determinismus zůstane zachovaný.
- Live test (jako `cards.test.ts`): každá schopnost na každé úrovni se jednou použije nebo spustí v živé hře bez chyby.
- Migrace: starý save bez `talents` → výchozí build. Rozbitý build se opraví.
- Online: host odmítne neplatný build.
- Stávající testy upravím (heroPowerId → talents).

## Balanc a nasazení

- AI-vs-AI simulace (dočasný harness mimo `tests/`) s `DEFAULT_BUILD` a se všemi 20 buildy na frakci. Výsledek: win-rate frakcí a buildů a outliery.
- Úpravy čísel navrhnu, ale rozhoduje uživatel.
- Patch notes: nový záznam „Warden Talents“, minor verze.
- Kontroly: `tsc`, `vitest`, `build:html`, deploy pushem na `main`.

## Mimo rozsah

- Odemykání talentů progresem, cena za přestavění.
- Volné pořadí vylepšení.
- Nové portréty nebo postavy.
- AI, které si samo volí build.
- Ohodnocení pasivních schopností v `evaluate.ts`.
