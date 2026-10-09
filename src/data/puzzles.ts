/**
 * Daily puzzles: a fixed board where you must win this turn. Every puzzle is checked by a
 * brute-force solver in tests/puzzles.test.ts (solvable; no card with a random outcome).
 */
export interface PuzzleUnit {
  cardId: string;
  frozen?: boolean;
}

export interface PuzzleDef {
  id: string;
  name: string;
  /** A short hint at the idea, shown under the goal. */
  hint: string;
  energy: number;
  hand: string[];
  board: (string | PuzzleUnit)[];
  enemy: { health: number; board: (string | PuzzleUnit)[] };
}

/**
 * Generated and checked by brute force: the enemy Warden has exactly as much Health as the best
 * possible turn deals, only one set of cards reaches it, it needs at least three of them and at
 * least five actions, and "play everything, then attack the Warden" falls short.
 */
export const PUZZLES: PuzzleDef[] = [
  { id: 'war_council', name: "War Council", hint: 'Not every card in your hand helps: one of them is a trap.', energy: 9, hand: ['ast_hush_of_stars', 'emb_legion_warbringer', 'emb_ember_volley', 'emb_cinderhelm_knight'], board: ['emb_legion_banneret', 'emb_ashen_duelist', 'vod_gloomcoil_serpent'], enemy: { health: 26, board: ['emb_hellshield_marauder', 'vod_venomous_cantor'] } },
  { id: 'shielded_wall', name: "Behind the Shields", hint: 'Not every card in your hand helps: one of them is a trap.', energy: 10, hand: ['vod_marrow_priest', 'emb_crimson_surge', 'emb_searing_brand', 'neu_redscarf_lancer'], board: ['emb_redsky_wyrm', 'vod_cryptcrawler', 'emb_ashen_duelist'], enemy: { health: 18, board: ['emb_hellshield_marauder', 'ast_nebula_sentinel', 'vod_venomous_cantor'] } },
  { id: 'fire_and_venom', name: "Fire and Venom", hint: 'Not every card in your hand helps: one of them is a trap.', energy: 7, hand: ['emb_crimson_surge', 'emb_cinderperch_drake', 'vod_soulfire_rite', 'emb_pyre_hound'], board: ['emb_scorch_adept', 'vod_grave_whisperer', 'vod_gloomcoil_serpent'], enemy: { health: 10, board: ['neu_oathbound_shieldbearer', 'neu_aegis_pilgrim', 'emb_hellshield_marauder'] } },
  { id: 'wisps_of_war', name: "Wisps of War", hint: 'You will need every card in your hand.', energy: 8, hand: ['emb_legion_warbringer', 'vod_soulfire_rite', 'vod_choirs_lament', 'emb_crimson_surge'], board: ['vod_grave_whisperer', 'vod_cryptcrawler', 'emb_redsky_wyrm'], enemy: { health: 13, board: ['neu_crag_colossus', 'neu_aegis_pilgrim', 'emb_hellshield_marauder'] } },
  { id: 'double_surge', name: "Double Surge", hint: 'Not every card in your hand helps: one of them is a trap.', energy: 7, hand: ['emb_crimson_surge', 'emb_legion_warbringer', 'emb_kindling_imp', 'emb_crimson_surge'], board: ['vod_cryptcrawler', 'neu_scarred_pitfighter'], enemy: { health: 9, board: ['neu_oathbound_shieldbearer', 'neu_caravan_sellsword', 'neu_crag_colossus'] } },
  { id: 'hollow_requiem', name: "Hollow Requiem", hint: 'You will need every card in your hand.', energy: 14, hand: ['neu_redscarf_lancer', 'emb_redsky_wyrm', 'emb_magma_brute', 'vod_marrow_priest'], board: ['vod_nhal', 'vod_choir_novice', 'vod_choir_of_moths'], enemy: { health: 22, board: ['neu_oathbound_shieldbearer', 'ast_nebula_sentinel'] } },
  { id: 'quick_blades', name: "Quick Blades", hint: 'You will need every card in your hand.', energy: 5, hand: ['emb_crimson_surge', 'emb_kindling_imp', 'emb_ashfang_raider'], board: ['emb_sparkblade_duelist', 'vod_choir_of_moths', 'emb_ashen_duelist'], enemy: { health: 16, board: ['tut_dummy', 'neu_emberward_shieldbearer', 'neu_stonehide_ox'] } },
  { id: 'dragonfire', name: "Dragonfire", hint: 'You will need every card in your hand.', energy: 9, hand: ['emb_cinderhelm_knight', 'emb_wyrmfire_breath', 'emb_wyrmfire_breath', 'emb_ashfang_raider'], board: ['vod_choir_novice', 'emb_ignivar', 'neu_trail_hound'], enemy: { health: 18, board: ['vod_venomous_cantor', 'neu_oathbound_shieldbearer'] } },
  { id: 'ember_storm', name: "Ember Storm", hint: 'You will need every card in your hand.', energy: 9, hand: ['emb_cinderperch_drake', 'emb_ember_volley', 'emb_ashfang_raider', 'emb_kindled_roar'], board: ['emb_redsky_wyrm', 'emb_ashen_duelist'], enemy: { health: 14, board: ['neu_oathbound_shieldbearer', 'vod_venomous_cantor'] } },
  { id: 'toad_trick', name: "The Toad Trick", hint: 'You will need every card in your hand.', energy: 10, hand: ['emb_ashfang_raider', 'neu_toadcurse', 'emb_wyrmfire_breath', 'emb_ember_volley'], board: ['vod_nhal', 'emb_legion_banneret', 'emb_ashen_duelist'], enemy: { health: 20, board: ['neu_stonehide_ox', 'emb_hellshield_marauder'] } },
  { id: 'lancers', name: "Lancers at Dawn", hint: 'You will need every card in your hand.', energy: 10, hand: ['emb_redsky_wyrm', 'emb_pyre_hound', 'neu_redscarf_lancer'], board: ['vod_choir_of_moths', 'vod_grave_whisperer', 'vod_gloomcoil_serpent'], enemy: { health: 11, board: ['neu_caravan_sellsword', 'ast_prismwarden', 'emb_hellshield_marauder'] } },
  { id: 'brand_of_kings', name: "Brand of Kings", hint: 'Not every card in your hand helps: one of them is a trap.', energy: 9, hand: ['emb_searing_brand', 'emb_kindling_imp', 'emb_redsky_wyrm', 'ast_prismwing_enchantress'], board: ['emb_legion_banneret', 'emb_ignivar', 'neu_scarred_pitfighter'], enemy: { health: 22, board: ['emb_hellshield_marauder', 'ast_nebula_sentinel'] } },
  { id: 'imps_gambit', name: "The Imp's Gambit", hint: 'You will need every card in your hand.', energy: 7, hand: ['emb_ember_volley', 'emb_kindling_imp', 'emb_cinderhelm_knight', 'emb_flame_jolt'], board: ['vod_choir_novice', 'vod_choir_of_moths', 'vod_cryptcrawler'], enemy: { health: 16, board: ['neu_oathbound_shieldbearer', 'vod_venomous_cantor'] } },
  { id: 'bounty', name: "Bounty on the Wall", hint: 'Not every card in your hand helps: one of them is a trap.', energy: 6, hand: ['neu_bounty_stalker', 'emb_kindling_imp', 'neu_hedge_mage', 'emb_flame_jolt'], board: ['neu_scarred_pitfighter', 'emb_redsky_wyrm', 'token_recruit'], enemy: { health: 7, board: ['neu_oathbound_shieldbearer', 'ast_prismwarden', 'tut_dummy'] } },
];
