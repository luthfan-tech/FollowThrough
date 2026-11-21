import { NextResponse } from "next/server";

export async function GET() {
  const hasEnvKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
  return NextResponse.json({
    hasServerKey: hasEnvKey,
    mode: hasEnvKey ? "live_llm" : "deterministic_agent",
  });
}
