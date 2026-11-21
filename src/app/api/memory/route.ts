import { NextResponse } from "next/server";
import { getDecisions, getApprovedDecisions, updateDecision, readDatabase, writeDatabase } from "@/lib/db";
import { Decision } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const approvedOnly = searchParams.get("approved") === "true";
    const query = searchParams.get("q")?.toLowerCase();

    let decisions = approvedOnly ? getApprovedDecisions() : getDecisions();

    if (query) {
      decisions = decisions.filter(
        (d) =>
          d.decision_text.toLowerCase().includes(query) ||
          (d.owner && d.owner.toLowerCase().includes(query)) ||
          (d.context && d.context.toLowerCase().includes(query))
      );
    }

    return NextResponse.json({ decisions });
  } catch (error) {
    console.error("GET /api/memory error:", error);
    return NextResponse.json({ error: "Failed to fetch decisions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newDecision: Decision = {
      id: `dec-manual-${Date.now()}`,
      meeting_id: body.meeting_id || "manual",
      meeting_title: body.meeting_title || "Direct Architecture Entry",
      decision_text: body.decision_text,
      owner: body.owner || "Organization",
      status: "approved",
      decision_date: body.decision_date || new Date().toISOString(),
      effective_date: body.effective_date,
      context: body.context || "Manually codified organizational decision",
      confidence: 1.0,
      approved: true,
      created_at: new Date().toISOString(),
    };

    const db = readDatabase();
    db.decisions.unshift(newDecision);
    writeDatabase(db);

    return NextResponse.json({ decision: newDecision }, { status: 201 });
  } catch (error) {
    console.error("POST /api/memory error:", error);
    return NextResponse.json({ error: "Failed to create decision" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "Decision ID required" }, { status: 400 });
    }

    const updated = updateDecision(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 });
    }

    return NextResponse.json({ decision: updated });
  } catch (error) {
    console.error("PATCH /api/memory error:", error);
    return NextResponse.json({ error: "Failed to update decision" }, { status: 500 });
  }
}
