import { NextResponse } from "next/server";
import { getWeeklyDigests } from "@/lib/db";
import { generateAllDigests, generateDigestForPerson } from "@/lib/agent/digestGenerator";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const person = searchParams.get("person");

    if (person) {
      const digest = generateDigestForPerson(person);
      return NextResponse.json({ digest });
    }

    let digests = getWeeklyDigests();
    if (digests.length === 0) {
      digests = generateAllDigests();
    }
    return NextResponse.json({ digests });
  } catch (error) {
    console.error("GET /api/digest error:", error);
    return NextResponse.json({ error: "Failed to fetch digests" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const freshDigests = generateAllDigests();
    return NextResponse.json({ digests: freshDigests });
  } catch (error) {
    console.error("POST /api/digest error:", error);
    return NextResponse.json({ error: "Failed to regenerate digests" }, { status: 500 });
  }
}
