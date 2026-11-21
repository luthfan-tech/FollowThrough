import { NextResponse } from "next/server";
import { executeHumanConfirmedActions, HumanConfirmationPayload } from "@/lib/agent/orchestrator";
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

  if (!canUserPerform(auth.user.role, "CONFIRM_TASKS")) {
    return NextResponse.json(
      { error: `Role '${auth.user.role}' lacks permission to confirm tasks or ratify decisions.` },
      { status: 403 }
    );
  }

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
    return NextResponse.json({
      success: true,
      meeting: updated,
      confirmedBy: { id: auth.user.id, name: auth.user.name, role: auth.user.role },
    });
  } catch (error: any) {
    console.error("POST /api/meetings/[id]/confirm error:", error);
    return NextResponse.json(
      { error: error.message || "Confirmation failed" },
      { status: 500 }
    );
  }
}
