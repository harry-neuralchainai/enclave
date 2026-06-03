// Shapes mirrored from Onyx's streaming_models.py / search models.
// The chat endpoint streams NDJSON; each line is a `Packet` envelope
// ({ placement, obj }) whose `obj` is one of the packets below.

export type OnyxSource = {
  document_id: string;
  semantic_identifier: string;
  link: string | null;
  blurb: string;
  source_type: string;
  score: number | null;
  match_highlights: string[];
};

export type MessageStart = {
  type: "message_start";
  final_documents: OnyxSource[] | null;
  pre_answer_processing_seconds: number | null;
};

export type MessageDelta = { type: "message_delta"; content: string };

export type CitationInfo = {
  type: "citation_info";
  citation_number: number;
  document_id: string;
};

export type OverallStop = { type: "stop" };
export type StreamError = { type: "error" };

// Synthetic error line emitted by Onyx's exception handler: {"error": "..."}
// (no Packet envelope, no `type`).
export type ErrorLine = { error: string };

// Note: unknown packet types (reasoning_*, search_tool_*, etc.) flow through at
// runtime as one of these via a cast; the switch in consumers ignores them.
// We deliberately omit a broad `{ type: string }` member so the discriminated
// union narrows cleanly in `switch (packet.type)`.
export type OnyxPacket =
  | MessageStart
  | MessageDelta
  | CitationInfo
  | OverallStop
  | StreamError
  | ErrorLine;

export type ChatRole = "user" | "ai";
