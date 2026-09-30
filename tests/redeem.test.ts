import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { GameService } from '@/services/gameService';
import { IndexedDbStore } from '@/persistence/storage';
import { REDEEM_CODES } from '@/config/redeemCodes';
import { sha256Hex } from '@/domain/redeem';

const CODE = 'sqRssfHBskASZWeQs';

describe('redeem codes', () => {
  it('the source only contains the hash, not the code', async () => {
    expect(JSON.stringify(REDEEM_CODES)).not.toContain(CODE);
    expect(REDEEM_CODES.some((c) => c.sha256 === '43adb0a56a8bd5f68b568c45eaf4c3feeff594a68ae56229052e9083be41ac73')).toBe(true);
    expect(await sha256Hex(CODE)).toBe('43adb0a56a8bd5f68b568c45eaf4c3feeff594a68ae56229052e9083be41ac73');
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
    expect((await svc.redeemCode('sqrssfhbskaszweqs')).ok).toBe(false);
    expect((await svc.redeemCode('nope')).ok).toBe(false);
    expect((await svc.redeemCode('')).ok).toBe(false);
  });
});
