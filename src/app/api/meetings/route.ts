import { NextResponse } from "next/server";
import { getMeetings, saveMeeting } from "@/lib/db";
import { Meeting } from "@/lib/types";
import { runAgentPipeline } from "@/lib/agent/orchestrator";

export async function GET() {
  try {
    const meetings = getMeetings();
    return NextResponse.json({ meetings });
  } catch (error) {
    console.error("GET /api/meetings error:", error);
    return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, raw_transcript, date, source_type, run_pipeline } = body;

    if (!title || !raw_transcript) {
      return NextResponse.json(
        { error: "Title and transcript are required" },
        { status: 400 }
      );
    }

    const newMeeting: Meeting = {
      id: `meet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      source_type: source_type || "paste",
      raw_transcript: raw_transcript.trim(),
      summary: "",
      execution_score: 0,
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = saveMeeting(newMeeting);

    let finalMeeting = saved;
    if (run_pipeline) {
      try {
        const apiKey = body.apiKey || process.env.GEMINI_API_KEY;
        finalMeeting = await runAgentPipeline(saved.id, apiKey);
      } catch (runErr) {
        console.error("Error auto-running pipeline during meeting creation:", runErr);
      }
    }

    return NextResponse.json({ meeting: finalMeeting }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/meetings error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create meeting" }, { status: 500 });
  }
}
