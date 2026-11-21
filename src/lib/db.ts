import fs from "fs";
import path from "path";
import {
  Meeting,
  Speaker,
  Decision,
  ActionItem,
  Conflict,
  Reminder,
  WeeklyDigest,
  AgentEvent,
} from "./types";

interface DatabaseSchema {
  meetings: Meeting[];
  speakers: Speaker[];
  decisions: Decision[];
  action_items: ActionItem[];
  conflicts: Conflict[];
  reminders: Reminder[];
  digests: WeeklyDigest[];
  agent_events: AgentEvent[];
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "database.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

export function readDatabase(): DatabaseSchema {
  ensureDirectoryExists();
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialSeedData();
    writeDatabase(initial);
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw) as DatabaseSchema;
  } catch (err) {
    console.error("Error reading database file, returning default seed", err);
    const initial = getInitialSeedData();
    writeDatabase(initial);
    return initial;
  }
}

export function writeDatabase(data: DatabaseSchema): void {
  ensureDirectoryExists();
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempFile, DB_FILE);
}

// -------------------------------------------------------------
// Database Operations
// -------------------------------------------------------------

export function getMeetings(): Meeting[] {
  const db = readDatabase();
  return db.meetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getMeetingById(id: string): Meeting | null {
  const db = readDatabase();
  const meeting = db.meetings.find((m) => m.id === id);
  if (!meeting) return null;

  return {
    ...meeting,
    speakers: db.speakers.filter((s) => s.meeting_id === id),
    decisions: db.decisions.filter((d) => d.meeting_id === id),
    action_items: db.action_items.filter((a) => a.meeting_id === id),
    conflicts: db.conflicts.filter((c) => c.meeting_id === id),
    agent_events: db.agent_events
      .filter((e) => e.meeting_id === id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
  };
}

export function saveMeeting(meeting: Meeting): Meeting {
  const db = readDatabase();
  const existingIdx = db.meetings.findIndex((m) => m.id === meeting.id);
  const now = new Date().toISOString();

  const toSave: Meeting = {
    ...meeting,
    updated_at: now,
  };

  if (existingIdx >= 0) {
    db.meetings[existingIdx] = toSave;
  } else {
    db.meetings.unshift(toSave);
  }

  writeDatabase(db);
  return toSave;
}

export function deleteMeeting(id: string): boolean {
  const db = readDatabase();
  db.meetings = db.meetings.filter((m) => m.id !== id);
  db.speakers = db.speakers.filter((s) => s.meeting_id !== id);
  db.decisions = db.decisions.filter((d) => d.meeting_id !== id);
  db.action_items = db.action_items.filter((a) => a.meeting_id !== id);
  db.conflicts = db.conflicts.filter((c) => c.meeting_id !== id);
  db.agent_events = db.agent_events.filter((e) => e.meeting_id !== id);
  writeDatabase(db);
  return true;
}

// Speakers
export function saveSpeakers(meetingId: string, speakers: Speaker[]): void {
  const db = readDatabase();
  db.speakers = db.speakers.filter((s) => s.meeting_id !== meetingId);
  db.speakers.push(...speakers);
  writeDatabase(db);
}

// Decisions
export function getDecisions(): Decision[] {
  const db = readDatabase();
  return db.decisions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getApprovedDecisions(): Decision[] {
  const db = readDatabase();
  return db.decisions.filter((d) => d.approved || d.status === "approved");
}

export function saveDecisions(meetingId: string, decisions: Decision[]): void {
  const db = readDatabase();
  db.decisions = db.decisions.filter((d) => d.meeting_id !== meetingId);
  db.decisions.push(...decisions);
  writeDatabase(db);
}

export function updateDecision(id: string, updates: Partial<Decision>): Decision | null {
  const db = readDatabase();
  const idx = db.decisions.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  db.decisions[idx] = { ...db.decisions[idx], ...updates };
  writeDatabase(db);
  return db.decisions[idx];
}

// Action Items / Tasks
export function getActionItems(): ActionItem[] {
  const db = readDatabase();
  return db.action_items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function saveActionItems(meetingId: string, items: ActionItem[]): void {
  const db = readDatabase();
  db.action_items = db.action_items.filter((a) => a.meeting_id !== meetingId);
  db.action_items.push(...items);
  writeDatabase(db);
}

export function updateActionItem(id: string, updates: Partial<ActionItem>): ActionItem | null {
  const db = readDatabase();
  const idx = db.action_items.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  db.action_items[idx] = { ...db.action_items[idx], ...updates };
  writeDatabase(db);
  return db.action_items[idx];
}

// Conflicts
export function getConflicts(): Conflict[] {
  const db = readDatabase();
  return db.conflicts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function saveConflicts(meetingId: string, conflicts: Conflict[]): void {
  const db = readDatabase();
  db.conflicts = db.conflicts.filter((c) => c.meeting_id !== meetingId);
  db.conflicts.push(...conflicts);
  writeDatabase(db);
}

export function resolveConflict(id: string): Conflict | null {
  const db = readDatabase();
  const idx = db.conflicts.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  db.conflicts[idx].resolved = true;
  writeDatabase(db);
  return db.conflicts[idx];
}

// Reminders
export function getReminders(): Reminder[] {
  const db = readDatabase();
  return db.reminders.sort((a, b) => new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime());
}

export function saveReminders(reminders: Reminder[]): void {
  const db = readDatabase();
  db.reminders.push(...reminders);
  writeDatabase(db);
}

export function updateReminder(id: string, updates: Partial<Reminder>): Reminder | null {
  const db = readDatabase();
  const idx = db.reminders.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  db.reminders[idx] = { ...db.reminders[idx], ...updates };
  writeDatabase(db);
  return db.reminders[idx];
}

// Weekly Digests
export function getWeeklyDigests(): WeeklyDigest[] {
  const db = readDatabase();
  return db.digests.sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime());
}

export function saveWeeklyDigest(digest: WeeklyDigest): WeeklyDigest {
  const db = readDatabase();
  const existingIdx = db.digests.findIndex((d) => d.person.toLowerCase() === digest.person.toLowerCase());
  if (existingIdx >= 0) {
    db.digests[existingIdx] = digest;
  } else {
    db.digests.push(digest);
  }
  writeDatabase(db);
  return digest;
}

// Agent Events
export function getAgentEvents(meetingId: string): AgentEvent[] {
  const db = readDatabase();
  return db.agent_events
    .filter((e) => e.meeting_id === meetingId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export function addAgentEvent(event: Omit<AgentEvent, "id" | "created_at">): AgentEvent {
  const db = readDatabase();
  const newEvent: AgentEvent = {
    ...event,
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
  };
  db.agent_events.push(newEvent);
  writeDatabase(db);
  return newEvent;
}

// -------------------------------------------------------------
// Seed Data Initialization
// -------------------------------------------------------------

export function getInitialSeedData(): DatabaseSchema {
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

  // Historical Meetings already in organizational memory
  const meetingArch: Meeting = {
    id: "hist-meet-arch",
    title: "Q2 Architecture Decision Record - Authentication & Mobile Standards",
    date: twoWeeksAgo,
    source_type: "sample",
    raw_transcript: "Elena Vance: We are ratifying ADR-24. We select PostgreSQL + Supabase as our unified identity and database stack for all microservices. Any changes to auth requires formal architectural review.\nMarcus Chen: Agreed. For mobile, Mobile v2.0 iOS release must maintain full backward compatibility with iOS 15+ to protect 28% of our enterprise customer base.\nElena Vance: Also, Mobile v2.0 global public release is locked for October 15th to align with the Q4 marketing push.",
    summary: "Ratified ADR-24 for unified Supabase auth, mandated iOS 15+ backward compatibility, and locked October 15 launch date.",
    execution_score: 96,
    status: "executed",
    created_at: twoWeeksAgo,
    updated_at: twoWeeksAgo,
  };

  const meetingSec: Meeting = {
    id: "hist-meet-sec",
    title: "Enterprise Security & Infrastructure Sync",
    date: tenDaysAgo,
    source_type: "sample",
    raw_transcript: "David Miller: All external API integrations must enforce OAuth2 with PKCE and pass third-party pen-testing before going live.\nSofia Martinez: Confirmed. Also, Sofia Martinez is designated as the sole code-freeze gatekeeper for production releases.",
    summary: "Enforced OAuth2 PKCE security standard and designated Sofia as release gatekeeper.",
    execution_score: 92,
    status: "executed",
    created_at: tenDaysAgo,
    updated_at: tenDaysAgo,
  };

  const meetingOps: Meeting = {
    id: "hist-meet-ops",
    title: "Operations & Growth Strategy Review",
    date: fiveDaysAgo,
    source_type: "sample",
    raw_transcript: "Jordan Lee: We decided to freeze all Google Ads spend adjustments until month-end so we can measure clean attribution.\nCarlos Mendes: Understood, I will focus on referral channels instead.",
    summary: "Enacted marketing ad-spend freeze through end of month to calibrate attribution baseline.",
    execution_score: 88,
    status: "executed",
    created_at: fiveDaysAgo,
    updated_at: fiveDaysAgo,
  };

  // Decisions in persistent memory
  const dec1: Decision = {
    id: "seed-dec-1",
    meeting_id: "hist-meet-arch",
    meeting_title: "Q2 Architecture Decision Record - Authentication & Mobile Standards",
    decision_text: "PostgreSQL + Supabase chosen as unified identity and database stack; any change requires formal architectural review.",
    owner: "Elena Vance",
    status: "approved",
    decision_date: twoWeeksAgo,
    context: "Ratified in ADR-24 to standardize identity across microservices.",
    confidence: 0.98,
    approved: true,
    created_at: twoWeeksAgo,
  };

  const dec2: Decision = {
    id: "seed-dec-2",
    meeting_id: "hist-meet-arch",
    meeting_title: "Q2 Architecture Decision Record - Authentication & Mobile Standards",
    decision_text: "Mobile v2.0 iOS release must maintain full backward compatibility with iOS 15+ to protect 28% of enterprise customers.",
    owner: "Marcus Chen",
    status: "approved",
    decision_date: twoWeeksAgo,
    context: "Customer analytics revealed 28% of enterprise users are on older iOS versions.",
    confidence: 0.99,
    approved: true,
    created_at: twoWeeksAgo,
  };

  const dec3: Decision = {
    id: "seed-dec-3",
    meeting_id: "hist-meet-arch",
    meeting_title: "Q2 Architecture Decision Record - Authentication & Mobile Standards",
    decision_text: "Mobile v2.0 global public release is locked for October 15th to align with Q4 marketing push.",
    owner: "Marcus Chen",
    status: "approved",
    decision_date: twoWeeksAgo,
    context: "Executive board commitment for Q4 revenue push.",
    confidence: 0.95,
    approved: true,
    created_at: twoWeeksAgo,
  };

  const dec4: Decision = {
    id: "seed-dec-4",
    meeting_id: "hist-meet-sec",
    meeting_title: "Enterprise Security & Infrastructure Sync",
    decision_text: "All external API integrations must enforce OAuth2 with PKCE and pass third-party pen-testing before going live.",
    owner: "David Miller",
    status: "approved",
    decision_date: tenDaysAgo,
    context: "Mandatory compliance for SOC2 Type II certification.",
    confidence: 0.96,
    approved: true,
    created_at: tenDaysAgo,
  };

  const dec5: Decision = {
    id: "seed-dec-5",
    meeting_id: "hist-meet-ops",
    meeting_title: "Operations & Growth Strategy Review",
    decision_text: "Freeze all Google Ads spend adjustments until month-end to calibrate clean conversion attribution.",
    owner: "Jordan Lee",
    status: "approved",
    decision_date: fiveDaysAgo,
    context: "Marketing analytics audit requiring stationary budget baseline.",
    confidence: 0.94,
    approved: true,
    created_at: fiveDaysAgo,
  };

  // Seed tasks in tracker
  const actionItems: ActionItem[] = [
    {
      id: "seed-act-1",
      meeting_id: "hist-meet-arch",
      meeting_title: "Q2 Architecture Decision Record",
      decision_id: "seed-dec-2",
      title: "Set up iOS 15 test matrix on GitHub Actions CI",
      description: "Ensure automated test runner spins up iOS 15 simulator images before merge.",
      owner: "Dev Priya",
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      priority: "HIGH",
      status: "IN_PROGRESS",
      external_task_id: "LIN-104",
      approved: true,
      created_at: twoWeeksAgo,
    },
    {
      id: "seed-act-2",
      meeting_id: "hist-meet-arch",
      meeting_title: "Q2 Architecture Decision Record",
      decision_id: "seed-dec-3",
      title: "Finalize App Store metadata and localized screenshots",
      description: "Prepare App Store Connect package for Oct 15 submission.",
      owner: "Marcus Chen",
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      priority: "CRITICAL",
      status: "APPROVED",
      external_task_id: "LIN-108",
      approved: true,
      created_at: twoWeeksAgo,
    },
    {
      id: "seed-act-3",
      meeting_id: "hist-meet-sec",
      meeting_title: "Enterprise Security Sync",
      decision_id: "seed-dec-4",
      title: "Schedule third-party penetration test vendor",
      description: "Confirm scope and test credentials for OAuth PKCE endpoints.",
      owner: "David Miller",
      due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Overdue
      priority: "HIGH",
      status: "OVERDUE",
      external_task_id: "SEC-42",
      approved: true,
      created_at: tenDaysAgo,
    },
    {
      id: "seed-act-4",
      meeting_id: "hist-meet-ops",
      meeting_title: "Operations & Growth Strategy",
      decision_id: "seed-dec-5",
      title: "Configure attribution tracking pixel on checkout funnel",
      description: "Ensure GA4 and Segment tags record undisturbed cohort data.",
      owner: "Carlos Mendes",
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      external_task_id: "MKT-89",
      approved: true,
      created_at: fiveDaysAgo,
    },
  ];

  // Seed Reminders
  const reminders: Reminder[] = [
    {
      id: "seed-rem-1",
      action_item_id: "seed-act-2",
      action_item_title: "Finalize App Store metadata and localized screenshots",
      owner: "Marcus Chen",
      remind_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      channel: "in-app",
      status: "SCHEDULED",
      created_at: twoWeeksAgo,
    },
    {
      id: "seed-rem-2",
      action_item_id: "seed-act-1",
      action_item_title: "Set up iOS 15 test matrix on GitHub Actions CI",
      owner: "Dev Priya",
      remind_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      channel: "in-app",
      status: "SCHEDULED",
      created_at: twoWeeksAgo,
    },
  ];

  // Seed Weekly Digests
  const digests: WeeklyDigest[] = [
    {
      id: "seed-dig-marcus",
      person: "Marcus Chen",
      week_start: new Date().toISOString(),
      summary: "You have 1 critical launch preparation task active and 2 key architectural decisions depending on your review.",
      tasks_due: [
        {
          id: "seed-act-2",
          title: "Finalize App Store metadata and localized screenshots",
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          priority: "CRITICAL",
          status: "APPROVED",
        },
      ],
      overdue_tasks: [],
      decisions_affecting_them: [
        {
          id: "seed-dec-2",
          decision_text: "Mobile v2.0 iOS release must maintain full backward compatibility with iOS 15+.",
          meeting_title: "Q2 Architecture Decision Record",
        },
        {
          id: "seed-dec-3",
          decision_text: "Mobile v2.0 global public release is locked for October 15th.",
          meeting_title: "Q2 Architecture Decision Record",
        },
      ],
      conflicts_requiring_attention: [],
      completed_work: [
        { id: "comp-1", title: "Product requirements specification review for Mobile v2.0" },
      ],
      generated_at: new Date().toISOString(),
    },
    {
      id: "seed-dig-dev",
      person: "Dev Priya",
      week_start: new Date().toISOString(),
      summary: "High priority focus on iOS compatibility testing before next sprint freeze.",
      tasks_due: [
        {
          id: "seed-act-1",
          title: "Set up iOS 15 test matrix on GitHub Actions CI",
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          priority: "HIGH",
          status: "IN_PROGRESS",
        },
      ],
      overdue_tasks: [],
      decisions_affecting_them: [
        {
          id: "seed-dec-1",
          decision_text: "PostgreSQL + Supabase chosen as unified identity and database stack.",
          meeting_title: "Q2 Architecture Decision Record",
        },
      ],
      conflicts_requiring_attention: [],
      completed_work: [
        { id: "comp-2", title: "Swift package manager dependency audit" },
      ],
      generated_at: new Date().toISOString(),
    },
  ];

  return {
    meetings: [meetingArch, meetingSec, meetingOps],
    speakers: [
      { id: "spk-1", meeting_id: "hist-meet-arch", name: "Elena Vance", role: "VP of Engineering", confidence: 0.99 },
      { id: "spk-2", meeting_id: "hist-meet-arch", name: "Marcus Chen", role: "Product Lead", confidence: 0.98 },
      { id: "spk-3", meeting_id: "hist-meet-sec", name: "David Miller", role: "Security Lead", confidence: 0.97 },
      { id: "spk-4", meeting_id: "hist-meet-sec", name: "Sofia Martinez", role: "Release Engineer", confidence: 0.98 },
      { id: "spk-5", meeting_id: "hist-meet-ops", name: "Jordan Lee", role: "Operations Lead", confidence: 0.96 },
      { id: "spk-6", meeting_id: "hist-meet-ops", name: "Carlos Mendes", role: "Growth Marketing", confidence: 0.95 },
    ],
    decisions: [dec1, dec2, dec3, dec4, dec5],
    action_items: actionItems,
    conflicts: [],
    reminders,
    digests,
    agent_events: [],
  };
}

export function resetDatabase(): DatabaseSchema {
  const seed = getInitialSeedData();
  writeDatabase(seed);
  return seed;
}
