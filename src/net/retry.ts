/**
 * Peer-to-peer connections between some networks (mobile data, strict routers)
 * only succeed on some attempts: each new attempt gets fresh port mappings.
 * A timed-out attempt is worth repeating; any other error (rejected, wrong code) is final.
 */
export class ConnectTimeout extends Error {}

export async function withRetries<T>(attempt: (n: number) => Promise<T>, opts: { attempts: number; delayMs?: number }): Promise<T> {
  for (let n = 1; ; n++) {
    try {
      return await attempt(n);
    } catch (e) {
      if (!(e instanceof ConnectTimeout) || n >= opts.attempts) throw e;
      await new Promise((r) => setTimeout(r, opts.delayMs ?? 1000));
    }
  }
}
