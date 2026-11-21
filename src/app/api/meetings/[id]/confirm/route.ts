import { NextResponse } from "next/server";
import { executeHumanConfirmedActions, HumanConfirmationPayload } from "@/lib/agent/orchestrator";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const payload: HumanConfirmationPayload = {
      meetingId: params.id,
      approvedDecisionIds: body.approvedDecisionIds || [],
      rejectedDecisionIds: body.rejectedDecisionIds || [],
      approvedActionItemIds: body.approvedActionItemIds || [],
      rejectedActionItemIds: body.rejectedActionItemIds || [],
      scheduleReminders: body.scheduleReminders !== false,
    };

    const updated = await executeHumanConfirmedActions(payload);
    return NextResponse.json({ success: true, meeting: updated });
  } catch (error: any) {
    console.error("POST /api/meetings/[id]/confirm error:", error);
    return NextResponse.json(
      { error: error.message || "Confirmation failed" },
      { status: 500 }
    );
  }
}
