/**
 * Gzip for large online messages via the browser's CompressionStream (Chrome 80+,
 * Firefox 113+, Safari 16.4+). Without it messages are sent as plain objects.
 */

/** Messages whose JSON is shorter than this are not worth compressing. */
export const COMPRESS_MIN_BYTES = 1024;

export function gzipSupported(): boolean {
  return typeof CompressionStream === 'function' && typeof DecompressionStream === 'function' && typeof TextEncoder === 'function' && typeof TextDecoder === 'function';
}

/** Pushes `bytes` through a (de)compression stream and collects the output. */
async function through(stream: CompressionStream | DecompressionStream, bytes: Uint8Array): Promise<Uint8Array> {
  const writer = stream.writable.getWriter();
  const written = writer.write(bytes as Uint8Array<ArrayBuffer>).then(() => writer.close());
  const reader = stream.readable.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  await written;
  const out = new Uint8Array(total);
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.byteLength;
  }
  return out;
}

export function gzip(text: string): Promise<Uint8Array> {
  return through(new CompressionStream('gzip'), new TextEncoder().encode(text));
}

export async function gunzip(data: ArrayBuffer | ArrayBufferView): Promise<string> {
  const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data.buffer as ArrayBuffer, data.byteOffset, data.byteLength);
  return new TextDecoder().decode(await through(new DecompressionStream('gzip'), bytes));
}

/** Payload actually put on the wire: `{ t: 'z', d }` for compressed messages. */
export type Compressed = { t: 'z'; d: Uint8Array | ArrayBuffer };

/** Compresses `msg` when gzip is usable and the message is large; otherwise returns it unchanged. */
export async function pack<T>(msg: T, enabled: boolean): Promise<T | Compressed> {
  if (!enabled || !gzipSupported()) return msg;
  const json = JSON.stringify(msg);
  if (json.length < COMPRESS_MIN_BYTES) return msg;
  try {
    return { t: 'z', d: await gzip(json) };
  } catch {
    return msg; // compression failed: send it plain
  }
}

/** Reverses `pack`. */
export async function unpack<T>(raw: T | Compressed): Promise<T> {
  if (raw && typeof raw === 'object' && (raw as Compressed).t === 'z') return JSON.parse(await gunzip((raw as Compressed).d)) as T;
  return raw as T;
}
