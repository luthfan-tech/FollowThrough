import { NextResponse } from "next/server";
import { getMeetingById, saveMeeting, deleteMeeting } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const meeting = getMeetingById(params.id);
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }
    return NextResponse.json({ meeting });
  } catch (error) {
    console.error("GET /api/meetings/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch meeting" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const meeting = getMeetingById(params.id);
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }
    const body = await request.json();
    const updated = saveMeeting({
      ...meeting,
      ...body,
      id: params.id,
      updated_at: new Date().toISOString(),
    });
    return NextResponse.json({ meeting: updated });
  } catch (error) {
    console.error("PATCH /api/meetings/[id] error:", error);
    return NextResponse.json({ error: "Failed to update meeting" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = deleteMeeting(params.id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("DELETE /api/meetings/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete meeting" }, { status: 500 });
  }
}
