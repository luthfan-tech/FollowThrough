import { NextResponse } from "next/server";
import { runAgentPipeline } from "@/lib/agent/orchestrator";
import { checkRateLimit, agentPipelineSemaphore } from "@/lib/rateLimiter";
import { authenticateRequest, canUserPerform } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 1. Authentication & RBAC Authorization Check
  const auth = authenticateRequest(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
  }

  if (!canUserPerform(auth.user.role, "RUN_PIPELINE")) {
    return NextResponse.json(
      { error: `Role '${auth.user.role}' lacks permission to run agent pipelines.` },
      { status: 403 }
    );
  }

  // 2. Rate Limiting Check (10 heavy extraction runs per minute)
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

  // 3. Concurrency Semaphore (Limits simultaneous heavy AI extractions to 3)
  const releaseSlot = await agentPipelineSemaphore.acquire();

  try {
    let apiKey = process.env.GEMINI_API_KEY;
    try {
      const body = await request.json();
      if (body.apiKey) {
        apiKey = body.apiKey;
      }
    } catch {
      // JSON body is optional
    }

    const result = await runAgentPipeline(params.id, apiKey);
    return NextResponse.json({
      success: true,
      meeting: result,
      executedBy: { id: auth.user.id, name: auth.user.name, role: auth.user.role },
    });
  } catch (error: any) {
    console.error("POST /api/meetings/[id]/run error:", error);
    return NextResponse.json(
      { error: error.message || "Agent pipeline execution failed" },
      { status: 500 }
    );
  } finally {
    releaseSlot();
  }
}
