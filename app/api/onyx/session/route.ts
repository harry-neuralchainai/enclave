import { NextResponse } from "next/server";
import { createChatSession } from "@/lib/onyx/client";

export const runtime = "nodejs";

export async function POST() {
  try {
    const chatSessionId = await createChatSession(0);
    return NextResponse.json({ chatSessionId });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 502 }
    );
  }
}
