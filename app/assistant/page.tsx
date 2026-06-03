"use client";

import { useRef, useState } from "react";
import { parseOnyxStream } from "@/lib/onyx/stream";
import { renderWithCitations } from "@/lib/onyx/citations";
import type { OnyxSource } from "@/lib/onyx/types";

type Turn = {
  role: "user" | "ai";
  text: string;
  sources?: OnyxSource[];
  cited?: Map<number, string>;
  meta?: string;
  error?: boolean;
};

export default function AssistantPage() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const sessionRef = useRef<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  function scrollToEnd() {
    requestAnimationFrame(() => {
      threadRef.current?.scrollIntoView({ block: "end" });
    });
  }

  async function ensureSession(): Promise<string> {
    if (sessionRef.current) return sessionRef.current;
    const res = await fetch("/api/onyx/session", { method: "POST" });
    if (!res.ok) throw new Error((await res.json()).error ?? "session failed");
    const { chatSessionId } = await res.json();
    sessionRef.current = chatSessionId;
    return chatSessionId;
  }

  function newThread() {
    sessionRef.current = null;
    setTurns([]);
    setInput("");
  }

  async function send(message: string) {
    const text = message.trim();
    if (!text || busy) return;

    setBusy(true);
    setInput("");
    setTurns((prev) => [...prev, { role: "user", text }, { role: "ai", text: "" }]);
    scrollToEnd();

    const started = performance.now();
    const sources: OnyxSource[] = [];
    const cited = new Map<number, string>();

    const updateAi = (patch: Partial<Turn>) =>
      setTurns((prev) => {
        const next = [...prev];
        const last = next.length - 1;
        next[last] = { ...next[last], ...patch };
        return next;
      });

    try {
      const chatSessionId = await ensureSession();
      const res = await fetch("/api/onyx/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, chatSessionId }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`);

      let acc = "";
      for await (const packet of parseOnyxStream(res)) {
        if ("error" in packet) {
          throw new Error(String(packet.error));
        }
        switch (packet.type) {
          case "message_start":
            if (packet.final_documents) {
              sources.splice(0, sources.length, ...packet.final_documents);
              updateAi({ sources: [...sources] });
            }
            break;
          case "message_delta":
            acc += packet.content ?? "";
            updateAi({ text: acc });
            scrollToEnd();
            break;
          case "citation_info":
            cited.set(packet.citation_number, packet.document_id);
            updateAi({ cited: new Map(cited) });
            break;
          case "error":
            throw new Error("the model stream returned an error");
        }
      }
      const secs = ((performance.now() - started) / 1000).toFixed(1);
      updateAi({
        meta: `${cited.size} cited · ${sources.length} retrieved · ${secs}s · in-VPC`,
      });
    } catch (e) {
      updateAi({ text: (e as Error).message, error: true });
    } finally {
      setBusy(false);
      scrollToEnd();
    }
  }

  // Documents referenced in the most recent AI turn, for the context rail.
  const latestAi = [...turns].reverse().find((t) => t.role === "ai" && t.sources?.length);
  const referenced =
    latestAi?.cited && latestAi.sources
      ? [...latestAi.cited.entries()]
          .sort((a, b) => a[0] - b[0])
          .map(([num, docId]) => ({
            num,
            doc: latestAi.sources!.find((s) => s.document_id === docId),
          }))
          .filter((x): x is { num: number; doc: OnyxSource } => Boolean(x.doc))
      : [];

  return (
    <main className="main">
      <div className="page-head">
        <div>
          <div className="eyebrow">
            Your AI co-counsel · grounded in your corpus · in-VPC
          </div>
          <h1 className="page-title">Assistant</h1>
          <p className="page-sub">
            Discuss anything across your matters and contracts. Multi-turn, cites your own
            documents, and keeps the whole conversation inside your VPC.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={newThread}>
            + New thread
          </button>
        </div>
      </div>

      <div className="chat-wrap">
        <div>
          <div className="thread" ref={threadRef}>
            {turns.length === 0 && (
              <div className="muted" style={{ fontSize: 14 }}>
                Ask a question about your matters and contracts to begin.
              </div>
            )}
            {turns.map((t, i) =>
              t.role === "user" ? (
                <div key={i} className="turn user">
                  <div className="avatar me">SM</div>
                  <div className="bubble user-b">{t.text}</div>
                </div>
              ) : (
                <div key={i} className="turn">
                  <div className="avatar ai">✦</div>
                  <div className="bubble">
                    <div
                      className="ai-text"
                      style={t.error ? { color: "var(--sev-high)" } : undefined}
                    >
                      {t.text
                        ? renderWithCitations(t.text)
                        : busy && i === turns.length - 1
                          ? "…"
                          : ""}
                    </div>
                    {t.meta && (
                      <div className="ai-meta">
                        <span>{t.meta}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="composer">
            <div className="composer-box">
              <textarea
                rows={2}
                value={input}
                placeholder="Ask a follow-up, or describe a task to run…"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
              />
              <div className="composer-foot">
                <span className="pill">Scope: All matters</span>
                <span className="pill">in-VPC</span>
                <span className="spacer" />
                <button
                  className="btn btn-primary"
                  disabled={busy || !input.trim()}
                  onClick={() => send(input)}
                >
                  {busy ? "…" : "Send"}
                </button>
              </div>
            </div>
            <div className="composer-note">
              Answers are grounded in your corpus and pin-cited. Nothing in this
              conversation leaves your VPC.
            </div>
          </div>
        </div>

        <div className="ctx">
          <div className="ctx-head">This conversation</div>

          <div className="ctx-sec">
            <div className="ctx-label">Grounded in</div>
            <div className="muted" style={{ fontSize: 13 }}>
              All matters · your indexed corpus
            </div>
          </div>

          <div className="ctx-sec">
            <div className="ctx-label">Documents referenced</div>
            {referenced.length === 0 ? (
              <div className="ctx-empty">
                Cited documents will appear here as the assistant answers.
              </div>
            ) : (
              referenced.map(({ num, doc }) => (
                <div className="ctx-doc" key={num}>
                  <span className="n">{num}</span> {doc.semantic_identifier}
                </div>
              ))
            )}
          </div>

          <div className="ctx-sec">
            <div className="ctx-label">Hand off this work</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button className="btn" style={{ textAlign: "left" }}>
                ⊞ Send to Diligence
              </button>
              <button className="btn" style={{ textAlign: "left" }}>
                ✎ Open draft in Draft module
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
