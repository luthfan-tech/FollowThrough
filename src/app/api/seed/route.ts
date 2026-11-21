import { NextResponse } from "next/server";
import { resetDatabase } from "@/lib/db";
import { generateAllDigests } from "@/lib/agent/digestGenerator";

export async function POST() {
  try {
    const seed = resetDatabase();
    generateAllDigests();
    return NextResponse.json({ success: true, message: "Database re-seeded successfully", data: seed });
  } catch (error: any) {
    console.error("POST /api/seed error:", error);
    return NextResponse.json({ error: error.message || "Failed to seed database" }, { status: 500 });
  }
}
