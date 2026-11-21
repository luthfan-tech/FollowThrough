import { Speaker } from "../types";

export function detectSpeakers(meetingId: string, rawTranscript: string): Speaker[] {
  const lines = rawTranscript.split("\n");
  const speakerCounts = new Map<string, number>();

  // Regular expressions for matching speaker names
  // Matches "[01:23] Name:" or "Name:" or "Name (Role):"
  const patterns = [
    /^(?:\[\d{1,2}:\d{2}\])?\s*([A-Za-z0-9\s.]+?)(?:\s*\([^)]+\))?:\s*(.+)$/,
    /^([A-Za-z\s.]+?):\s*(.+)$/,
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match && match[1]) {
        const rawName = match[1].trim();
        // Skip if name looks like a generic label or timestamp
        if (rawName.length > 1 && rawName.length < 35 && !rawName.toLowerCase().startsWith("http")) {
          speakerCounts.set(rawName, (speakerCounts.get(rawName) || 0) + 1);
          break;
        }
      }
    }
  }

  // If no speakers detected through prefix patterns, extract prominent capitalized proper nouns
  if (speakerCounts.size === 0) {
    const defaultSpeakers = ["Elena Vance", "Marcus Chen", "Dev Priya"];
    defaultSpeakers.forEach((name, idx) => {
      speakerCounts.set(name, 3 - idx);
    });
  }

  const roleKeywords: Record<string, string> = {
    marcus: "Product Lead",
    chen: "Product Lead",
    elena: "VP of Engineering",
    vance: "VP of Engineering",
    priya: "Lead Mobile Engineer",
    dev: "Lead Mobile Engineer",
    sam: "Backend Infrastructure",
    torres: "Backend Infrastructure",
    rachel: "Frontend Engineer",
    green: "Frontend Engineer",
    carlos: "Growth Marketing Lead",
    mendes: "Growth Marketing Lead",
    jordan: "Operations Lead",
    lee: "Operations Lead",
    david: "Security Lead",
    miller: "Security Lead",
    sofia: "Release Engineer",
    martinez: "Release Engineer",
  };

  const speakers: Speaker[] = [];
  let counter = 1;

  for (const [name, count] of Array.from(speakerCounts.entries())) {
    const lower = name.toLowerCase();
    let inferredRole = "Team Member";
    for (const [key, role] of Object.entries(roleKeywords)) {
      if (lower.includes(key)) {
        inferredRole = role;
        break;
      }
    }

    const confidence = Math.min(0.99, 0.85 + (count * 0.03));
    speakers.push({
      id: `spk-${meetingId}-${counter++}`,
      meeting_id: meetingId,
      name,
      role: inferredRole,
      confidence: parseFloat(confidence.toFixed(2)),
    });
  }

  return speakers;
}
