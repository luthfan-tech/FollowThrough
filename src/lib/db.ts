import fs from "fs";
import path from "path";
import os from "os";
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

// In Vercel and AWS Lambda serverless functions, process.cwd() is read-only (/var/task).
// Only os.tmpdir() (/tmp) is writable.
const isServerless =
  process.env.VERCEL === "1" ||
  Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
  Boolean(process.env.VERCEL_ENV);

const DB_DIR = isServerless
  ? path.join(os.tmpdir(), "followthrough_data")
  : path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "database.json");
const SEED_FILE = path.join(process.cwd(), "data", "database.json");

// In-memory database cache to guarantee immediate read/write consistency across serverless runs
let inMemoryDb: DatabaseSchema | null = null;

function ensureDirectoryExists() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn("ensureDirectoryExists notice (serverless fallback active):", err);
  }
}

export function readDatabase(): DatabaseSchema {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  // 1. Try reading from writable DB_FILE (e.g. /tmp/database.json on Vercel)
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      inMemoryDb = JSON.parse(raw) as DatabaseSchema;
      return inMemoryDb;
    } catch (err) {
      console.warn("Could not parse DB_FILE, checking seed fallback:", err);
    }
  }

  // 2. Try reading from repository seed database.json
  if (fs.existsSync(SEED_FILE)) {
    try {
      const raw = fs.readFileSync(SEED_FILE, "utf-8");
      inMemoryDb = JSON.parse(raw) as DatabaseSchema;
      // Mirror to writable DB_FILE
      try {
        ensureDirectoryExists();
        fs.writeFileSync(DB_FILE, JSON.stringify(inMemoryDb, null, 2), "utf-8");
      } catch {
        // Ignore mirror error
      }
      return inMemoryDb;
    } catch (err) {
      console.warn("Could not parse SEED_FILE:", err);
    }
  }

  // 3. Clean empty schema fallback
  const empty: DatabaseSchema = {
    meetings: [],
    speakers: [],
    decisions: [],
    action_items: [],
    conflicts: [],
    reminders: [],
    digests: [],
    agent_events: [],
  };
  inMemoryDb = empty;
  return empty;
}

export function writeDatabase(data: DatabaseSchema): void {
  // Always update in-memory representation immediately
  inMemoryDb = data;

  try {
    ensureDirectoryExists();
    const serialized = JSON.stringify(data, null, 2);
    fs.writeFileSync(DB_FILE, serialized, "utf-8");
  } catch (err) {
    console.warn("writeDatabase disk persistence notice (in-memory state preserved):", err);
  }
}

// -------------------------------------------------------------
// Database Operations
// -------------------------------------------------------------

export function getMeetings(): Meeting[] {
  const db = readDatabase();
  return (db.meetings || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getMeetingById(id: string): Meeting | null {
  const db = readDatabase();
  const meeting = db.meetings.find((m) => m.id === id);
  if (!meeting) return null;

  return {
    ...meeting,
    speakers: (db.speakers || []).filter((s) => s.meeting_id === id),
    decisions: (db.decisions || []).filter((d) => d.meeting_id === id),
    action_items: (db.action_items || []).filter((a) => a.meeting_id === id),
    conflicts: (db.conflicts || []).filter((c) => c.meeting_id === id),
    agent_events: (db.agent_events || [])
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
  db.speakers = (db.speakers || []).filter((s) => s.meeting_id !== meetingId);
  db.speakers.push(...speakers);
  writeDatabase(db);
}

// Decisions
export function getDecisions(): Decision[] {
  const db = readDatabase();
  return (db.decisions || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getApprovedDecisions(): Decision[] {
  const db = readDatabase();
  return (db.decisions || []).filter((d) => d.approved || d.status === "approved");
}

export function saveDecisions(meetingId: string, decisions: Decision[]): void {
  const db = readDatabase();
  db.decisions = (db.decisions || []).filter((d) => d.meeting_id !== meetingId);
  db.decisions.push(...decisions);
  writeDatabase(db);
}

export function updateDecision(id: string, updates: Partial<Decision>): Decision | null {
  const db = readDatabase();
  const idx = db.decisions.findIndex((d) => d.id === id);
  if (idx === -1) return null;

  const current = db.decisions[idx];
  // If decision content is edited without explicit re-approval, require fresh approval
  const contentChanged = updates.decision_text && updates.decision_text !== current.decision_text;
  let resetApproval = {};
  if (contentChanged && updates.approved === undefined) {
    resetApproval = { approved: false, status: "proposed" };
  }

  db.decisions[idx] = { ...current, ...updates, ...resetApproval };
  writeDatabase(db);
  return db.decisions[idx];
}

// Action Items / Tasks
export function getActionItems(): ActionItem[] {
  const db = readDatabase();
  return (db.action_items || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function saveActionItems(meetingId: string, items: ActionItem[]): void {
  const db = readDatabase();
  db.action_items = (db.action_items || []).filter((a) => a.meeting_id !== meetingId);
  db.action_items.push(...items);
  writeDatabase(db);
}

export function updateActionItem(id: string, updates: Partial<ActionItem>): ActionItem | null {
  const db = readDatabase();
  const idx = db.action_items.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  const current = db.action_items[idx];
  // If core deliverable attributes are edited without explicit re-approval, invalidate prior approval
  const contentChanged =
    (updates.title && updates.title !== current.title) ||
    (updates.owner && updates.owner !== current.owner) ||
    (updates.due_date !== undefined && updates.due_date !== current.due_date) ||
    (updates.description && updates.description !== current.description);

  let resetApproval = {};
  if (contentChanged && updates.approved === undefined) {
    resetApproval = { approved: false, status: "PROPOSED" };
  }

  db.action_items[idx] = { ...current, ...updates, ...resetApproval };
  writeDatabase(db);
  return db.action_items[idx];
}

// Conflicts
export function getConflicts(): Conflict[] {
  const db = readDatabase();
  return (db.conflicts || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function saveConflicts(meetingId: string, conflicts: Conflict[]): void {
  const db = readDatabase();
  db.conflicts = (db.conflicts || []).filter((c) => c.meeting_id !== meetingId);
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
  return (db.reminders || []).sort((a, b) => new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime());
}

export function saveReminders(reminders: Reminder[]): void {
  const db = readDatabase();
  if (!db.reminders) db.reminders = [];
  const existingMap = new Map(db.reminders.map((r) => [r.id, r]));
  for (const rem of reminders) {
    existingMap.set(rem.id, rem);
  }
  db.reminders = Array.from(existingMap.values());
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
  return (db.digests || []).sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime());
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
  return (db.agent_events || [])
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
// Clear & Seed Operations
// -------------------------------------------------------------

export function clearDatabase(): DatabaseSchema {
  const empty: DatabaseSchema = {
    meetings: [],
    speakers: [],
    decisions: [],
    action_items: [],
    conflicts: [],
    reminders: [],
    digests: [],
    agent_events: [],
  };
  writeDatabase(empty);
  return empty;
}

export function resetDatabase(): DatabaseSchema {
  return clearDatabase();
}
