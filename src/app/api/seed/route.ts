import { NextResponse } from "next/server";
import { resetDatabase, clearDatabase } from "@/lib/db";
import { generateAllDigests } from "@/lib/agent/digestGenerator";
import { authenticateRequest, canUserPerform } from "@/lib/auth";

export async function POST(request: Request) {
  // 1. Authentication & RBAC Authorization Check
  const auth = authenticateRequest(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
  }

  if (!canUserPerform(auth.user.role, "CLEAR_WORKSPACE")) {
    return NextResponse.json(
      { error: `Role '${auth.user.role}' lacks administrator privileges to reset workspace.` },
      { status: 403 }
    );
  }

  try {
    let action = "clear";
    try {
      const body = await request.json();
      if (body.action) action = body.action;
    } catch {
      // Default to clear if no payload
    }

    if (action === "seed") {
      const seed = resetDatabase();
      generateAllDigests();
      return NextResponse.json({ success: true, message: "Workspace initialized", data: seed });
    } else {
      const empty = clearDatabase();
      return NextResponse.json({ success: true, message: "Workspace cleared for real tasks", data: empty });
    }
  } catch (error: any) {
    console.error("POST /api/seed error:", error);
    return NextResponse.json({ error: error.message || "Operation failed" }, { status: 500 });
  }
}
