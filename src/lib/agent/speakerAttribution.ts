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

  // If no speakers detected through prefix patterns, do NOT fabricate fake people.
  // Leave empty so that unattributed transcripts remain unresolved.
  if (speakerCounts.size === 0) {
    return [];
  }

  // Functional role keywords based on stated professional designations
  const roleKeywords: Record<string, string> = {
    lead: "Lead",
    vp: "Vice President",
    director: "Director",
    architect: "Architect",
    engineer: "Engineer",
    frontend: "Frontend Engineer",
    backend: "Backend Infrastructure",
    mobile: "Mobile Engineer",
    devops: "DevOps Engineer",
    security: "Security Engineer",
    product: "Product Lead",
    marketing: "Growth Marketing",
    operations: "Operations Lead",
    design: "Product Designer",
    qa: "QA Engineer",
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
