import { NextResponse } from "next/server";
import { runAgentPipeline } from "@/lib/agent/orchestrator";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    return NextResponse.json({ success: true, meeting: result });
  } catch (error: any) {
    console.error("POST /api/meetings/[id]/run error:", error);
    return NextResponse.json(
      { error: error.message || "Agent pipeline execution failed" },
      { status: 500 }
    );
  }
}
