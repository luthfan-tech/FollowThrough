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
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw) as DatabaseSchema;
  } catch (err) {
    console.error("Error reading database file, returning clean state", err);
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
}

// Serialized write queue to prevent multi-request race conditions
let writeLock: Promise<void> = Promise.resolve();

export function writeDatabase(data: DatabaseSchema): void {
  ensureDirectoryExists();
  // Unique temp file per atomic transaction prevents collision across concurrent threads
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const tempFile = `${DB_FILE}.${uniqueId}.tmp`;

  try {
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    if (fs.existsSync(tempFile)) {
      try {
        fs.unlinkSync(tempFile);
      } catch {
        // Ignore cleanup error
      }
    }
    throw err;
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
  db.decisions[idx] = { ...db.decisions[idx], ...updates };
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
  db.action_items[idx] = { ...db.action_items[idx], ...updates };
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
