// Server-only Onyx client. Credentials stay here; the browser never talks to
// Onyx directly — it goes through the /api/onyx/* route handlers.

const ONYX_API_URL = process.env.ONYX_API_URL ?? "http://localhost:3001/api";
const ONYX_API_KEY = process.env.ONYX_API_KEY;

function authHeaders(): Record<string, string> {
  return ONYX_API_KEY ? { Authorization: `Bearer ${ONYX_API_KEY}` } : {};
}

export async function createChatSession(personaId = 0): Promise<string> {
  const res = await fetch(`${ONYX_API_URL}/chat/create-chat-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ persona_id: personaId }),
  });
  if (!res.ok) {
    throw new Error(
      `create-chat-session failed: ${res.status} ${await res.text().catch(() => "")}`
    );
  }
  const data = (await res.json()) as { chat_session_id: string };
  return data.chat_session_id;
}

export async function sendChatMessageStream(opts: {
  message: string;
  chatSessionId?: string | null;
  includeCitations?: boolean;
}): Promise<Response> {
  const body: Record<string, unknown> = {
    message: opts.message,
    stream: true,
    include_citations: opts.includeCitations ?? true,
  };
  if (opts.chatSessionId) body.chat_session_id = opts.chatSessionId;

  return fetch(`${ONYX_API_URL}/chat/send-chat-message`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
}
