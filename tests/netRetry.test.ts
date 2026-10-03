import { describe, expect, it } from 'vitest';
import { ConnectTimeout, withRetries } from '@/net/retry';

describe('withRetries', () => {
  it('tries again after a timeout and returns the first success', async () => {
    let calls = 0;
    const result = await withRetries(
      async () => {
        calls++;
        if (calls < 3) throw new ConnectTimeout('slow');
        return 'ok';
      },
      { attempts: 3, delayMs: 0 },
    );
    expect(result).toBe('ok');
    expect(calls).toBe(3);
  });

  it('gives up after the last attempt with the final timeout error', async () => {
    let calls = 0;
    await expect(
      withRetries(
        async () => {
          calls++;
          throw new ConnectTimeout(`attempt ${calls}`);
        },
        { attempts: 3, delayMs: 0 },
      ),
    ).rejects.toThrow('attempt 3');
    expect(calls).toBe(3);
  });

  it('does not retry other errors (e.g. the tournament is full)', async () => {
    let calls = 0;
    await expect(
      withRetries(
        async () => {
          calls++;
          throw new Error('This tournament is full.');
        },
        { attempts: 3, delayMs: 0 },
      ),
    ).rejects.toThrow('This tournament is full.');
    expect(calls).toBe(1);
  });
});
