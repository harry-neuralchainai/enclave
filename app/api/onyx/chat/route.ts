import { NextRequest } from "next/server";
import { sendChatMessageStream } from "@/lib/onyx/client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let payload: { message?: string; chatSessionId?: string; includeCitations?: boolean };
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { message, chatSessionId, includeCitations } = payload;
  if (!message || typeof message !== "string") {
    return Response.json({ error: "message is required" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await sendChatMessageStream({ message, chatSessionId, includeCitations });
  } catch (e) {
    return Response.json(
      { error: `onyx unreachable: ${(e as Error).message}` },
      { status: 502 }
    );
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    return Response.json(
      { error: `onyx ${upstream.status}: ${text}` },
      { status: 502 }
    );
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
