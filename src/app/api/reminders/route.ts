import { NextResponse } from "next/server";
import { getReminders, updateReminder, readDatabase, writeDatabase } from "@/lib/db";
import { Reminder } from "@/lib/types";

export async function GET() {
  try {
    const reminders = getReminders();
    return NextResponse.json({ reminders });
  } catch (error) {
    console.error("GET /api/reminders error:", error);
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newReminder: Reminder = {
      id: `rem-manual-${Date.now()}`,
      action_item_id: body.action_item_id || "general",
      action_item_title: body.action_item_title || "General Follow-up",
      owner: body.owner || "Team",
      remind_at: body.remind_at,
      channel: body.channel || "in-app",
      status: "SCHEDULED",
      created_at: new Date().toISOString(),
    };

    const db = readDatabase();
    db.reminders.push(newReminder);
    writeDatabase(db);

    return NextResponse.json({ reminder: newReminder }, { status: 201 });
  } catch (error) {
    console.error("POST /api/reminders error:", error);
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "Reminder ID required" }, { status: 400 });
    }

    const updated = updateReminder(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }

    return NextResponse.json({ reminder: updated });
  } catch (error) {
    console.error("PATCH /api/reminders error:", error);
    return NextResponse.json({ error: "Failed to update reminder" }, { status: 500 });
  }
}
