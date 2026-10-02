import 'fake-indexeddb/auto';
import { beforeAll, describe, expect, it } from 'vitest';
import { GameService } from '@/services/gameService';
import { IndexedDbStore } from '@/persistence/storage';
import { REDEEM_CODES } from '@/config/redeemCodes';
import { sha256Hex } from '@/domain/redeem';

// Tests use their own throwaway code so no real code ever appears in the (public) repository.
const CODE = 'Test-Only-Code-42';

describe('redeem codes', () => {
  beforeAll(async () => {
    REDEEM_CODES.push({ id: 'test-code', sha256: await sha256Hex(CODE), label: 'Test: 1000 Gold', reward: { gold: 1000 } });
  });

  it('codes are stored only as SHA-256 hashes', () => {
    for (const c of REDEEM_CODES) expect(c.sha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it('grants 1000 Gold once per account, persisted across reloads', async () => {
    const svc = new GameService(new IndexedDbStore('test_redeem'));
    await svc.init();
    await svc.createProfile('R', 'a');
    const gold = svc.current!.profile.gold;
    const first = await svc.redeemCode(CODE);
    expect(first.ok).toBe(true);
    expect(svc.current!.profile.gold).toBe(gold + 1000);
    const again = await svc.redeemCode(`  ${CODE} `);
    expect(again.ok).toBe(false);
    expect(svc.current!.profile.gold).toBe(gold + 1000);
    await svc.flush();
    const reloaded = new GameService(new IndexedDbStore('test_redeem'));
    await reloaded.init();
    expect(reloaded.current!.profile.gold).toBe(gold + 1000);
    expect((await reloaded.redeemCode(CODE)).ok).toBe(false);
  });

  it('rejects wrong or differently-cased codes', async () => {
    const svc = new GameService(new IndexedDbStore('test_redeem_bad'));
    await svc.init();
    await svc.createProfile('R', 'a');
    expect((await svc.redeemCode(CODE.toLowerCase())).ok).toBe(false);
    expect((await svc.redeemCode('nope')).ok).toBe(false);
    expect((await svc.redeemCode('')).ok).toBe(false);
  });
});

describe('card redeem codes', () => {
  it('the Meowchick code adds one Prismatic Meowchick, once per account', async () => {
    const { applyRedeem } = await import('@/domain/redeem');
    const { createNewSave } = await import('@/domain/newAccount');
    const def = REDEEM_CODES.find((c) => c.id === 'gift-prismatic-meowchick');
    expect(def).toBeTruthy();
    const save = createNewSave('A', 'flame', 1, 'p');
    const first = applyRedeem(save, def, 2);
    if (!first.ok) throw new Error(first.error);
    expect(first.value.save.collection.cards.neu_meowchick?.PRISMATIC).toBe(1);
    expect(first.value.save.collection.unseen).toContain('neu_meowchick');
    expect(applyRedeem(first.value.save, def, 3).ok).toBe(false);
  });
});
