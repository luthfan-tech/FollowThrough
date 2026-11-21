import { NextResponse } from "next/server";
import { getActionItems, updateActionItem, readDatabase, writeDatabase } from "@/lib/db";
import { ActionItem } from "@/lib/types";

export async function GET() {
  try {
    const tasks = getActionItems();
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newTask: ActionItem = {
      id: `act-manual-${Date.now()}`,
      meeting_id: body.meeting_id || "manual",
      decision_id: body.decision_id,
      title: body.title,
      description: body.description || "",
      owner: body.owner || "Unassigned",
      due_date: body.due_date,
      priority: body.priority || "MEDIUM",
      status: body.status || "APPROVED",
      external_task_id: `FLW-${Math.floor(1000 + Math.random() * 9000)}`,
      approved: true,
      created_at: new Date().toISOString(),
    };

    const db = readDatabase();
    db.action_items.unshift(newTask);
    writeDatabase(db);

    return NextResponse.json({ task: newTask }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const updated = updateActionItem(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task: updated });
  } catch (error) {
    console.error("PATCH /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
