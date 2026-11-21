export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TaskStatus = "PROPOSED" | "APPROVED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE" | "REJECTED";
export type ConflictType = 
  | "CONTRADICTION" 
  | "CHANGED_COMMITMENT" 
  | "DEADLINE_CONFLICT" 
  | "UNREALISTIC_DEADLINE" 
  | "MISSING_OWNER" 
  | "DUPLICATE_TASK";
export type ConflictSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type DecisionStatus = "proposed" | "approved" | "rejected" | "deferred";
export type MeetingStatus = "draft" | "processing" | "pending_review" | "approved" | "executed";

export interface Speaker {
  id: string;
  meeting_id: string;
  name: string;
  role?: string;
  confidence: number;
}

export interface Decision {
  id: string;
  meeting_id: string;
  decision_text: string;
  owner?: string;
  status: DecisionStatus;
  decision_date: string;
  effective_date?: string;
  context?: string;
  confidence: number;
  approved: boolean;
  meeting_title?: string;
  created_at: string;
}

export interface ActionItem {
  id: string;
  meeting_id: string;
  decision_id?: string;
  title: string;
  description?: string;
  owner?: string;
  due_date?: string;
  priority: Priority;
  status: TaskStatus;
  external_task_id?: string;
  approved: boolean;
  meeting_title?: string;
  created_at: string;
}

export interface Conflict {
  id: string;
  meeting_id: string;
  current_decision_id?: string;
  previous_decision_id?: string;
  conflict_type: ConflictType;
  severity: ConflictSeverity;
  explanation: string;
  recommendation: string;
  resolved: boolean;
  current_decision_text?: string;
  previous_decision_text?: string;
  previous_meeting_title?: string;
  previous_meeting_date?: string;
  previous_owner?: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  action_item_id: string;
  action_item_title?: string;
  owner?: string;
  remind_at: string;
  channel: "in-app" | "email" | "slack";
  status: "SCHEDULED" | "TRIGGERED" | "DISMISSED";
  created_at: string;
}

export interface WeeklyDigest {
  id: string;
  person: string;
  week_start: string;
  summary: string;
  tasks_due: { id: string; title: string; due_date: string; priority: Priority; status: TaskStatus }[];
  overdue_tasks: { id: string; title: string; due_date: string; priority: Priority }[];
  decisions_affecting_them: { id: string; decision_text: string; meeting_title: string }[];
  conflicts_requiring_attention: { id: string; explanation: string; severity: ConflictSeverity; recommendation: string }[];
  completed_work: { id: string; title: string }[];
  generated_at: string;
}

export interface AgentEvent {
  id: string;
  meeting_id: string;
  step: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCESS" | "WARNING" | "ERROR";
  message: string;
  metadata?: any;
  created_at: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  source_type: "paste" | "upload" | "sample";
  raw_transcript: string;
  summary?: string;
  execution_score: number;
  status: MeetingStatus;
  created_at: string;
  updated_at: string;
  speakers?: Speaker[];
  decisions?: Decision[];
  action_items?: ActionItem[];
  conflicts?: Conflict[];
  agent_events?: AgentEvent[];
}

export interface ExecutionScoreBreakdown {
  total: number; // 0-100
  decision_clarity: number; // 0-25
  ownership_coverage: number; // 0-25
  deadline_quality: number; // 0-25
  risk_penalty: number; // 0-25
  feedback: string[];
}
