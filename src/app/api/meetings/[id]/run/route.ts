import { NextResponse } from "next/server";
import { runAgentPipeline } from "@/lib/agent/orchestrator";
import { checkRateLimit, agentPipelineSemaphore } from "@/lib/rateLimiter";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 1. Rate Limiting Check (10 heavy extraction runs per minute per IP)
  const clientIp = request.headers.get("x-forwarded-for") || "localhost";
  const rateLimit = checkRateLimit(`run_${clientIp}`, 10, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many concurrent meeting extraction requests. Please wait." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rateLimit.resetMs / 1000)) },
      }
    );
  }

  // 2. Concurrency Semaphore (Limits simultaneous heavy AI extractions to 3)
  const releaseSlot = await agentPipelineSemaphore.acquire();

  try {
    let apiKey = process.env.GEMINI_API_KEY;
    try {
      const body = await request.json();
      if (body.apiKey) apiKey = body.apiKey;
    } catch {
      // Body empty or optional
    }

    const meeting = await runAgentPipeline(params.id, apiKey);
    return NextResponse.json({ success: true, meeting });
  } catch (error: any) {
    console.error("POST /api/meetings/[id]/run error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to run agent pipeline" },
      { status: 500 }
    );
  } finally {
    releaseSlot();
  }
}
