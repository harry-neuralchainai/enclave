import type { OnyxPacket } from "./types";

// Parse Onyx's NDJSON stream into packets. Each line is a `Packet` envelope
// ({ placement, obj }); we unwrap to the inner `obj`. The exception fallback
// line is a bare {"error": "..."} with no envelope, so we pass it through.
export async function* parseOnyxStream(
  res: Response
): AsyncGenerator<OnyxPacket> {
  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const flush = function* (chunk: string): Generator<OnyxPacket> {
    const line = chunk.trim();
    if (!line) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch {
      return;
    }
    const p = parsed as { obj?: unknown };
    yield (p && typeof p === "object" && "obj" in p ? p.obj : parsed) as OnyxPacket;
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const chunk = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 1);
      yield* flush(chunk);
    }
  }
  yield* flush(buffer);
}
