import {
  Meeting,
  Decision,
  ActionItem,
  Conflict,
  Reminder,
  AgentEvent,
} from "../types";
import {
  getMeetingById,
  saveMeeting,
  saveSpeakers,
  saveDecisions,
  saveActionItems,
  saveConflicts,
  saveReminders,
  addAgentEvent,
  getDecisions,
  getActionItems,
} from "../db";
import { detectSpeakers } from "./speakerAttribution";
import { extractMeetingArtifacts } from "./extractor";
import { retrieveRelevantMemories } from "./memory";
import { runConflictRadar } from "./conflictRadar";
import { calculateExecutionScore } from "./executionScorer";
import { generateAllDigests } from "./digestGenerator";

export interface AgentRunProgress {
  step: string;
  label: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCESS" | "WARNING" | "ERROR";
  detail: string;
}

export async function runAgentPipeline(meetingId: string, geminiApiKey?: string): Promise<Meeting> {
  const meeting = getMeetingById(meetingId);
  if (!meeting) throw new Error(`Meeting not found: ${meetingId}`);

  // Step 1: Ingest & Normalize Transcript
  addAgentEvent({
    meeting_id: meetingId,
    step: "ingest",
    status: "IN_PROGRESS",
    message: "Ingesting and normalizing raw meeting transcript...",
  });

  const normalizedTranscript = meeting.raw_transcript.trim();

  addAgentEvent({
    meeting_id: meetingId,
    step: "ingest",
    status: "SUCCESS",
    message: `Transcript cleaned and tokenized (${normalizedTranscript.length} characters, ${normalizedTranscript.split("\n").length} turns).`,
  });

  // Step 2: Speaker Attribution & Persona Identification
  addAgentEvent({
    meeting_id: meetingId,
    step: "speakers",
    status: "IN_PROGRESS",
    message: "Attributing statements and inferring organizational roles...",
  });

  const speakers = detectSpeakers(meetingId, normalizedTranscript);
  saveSpeakers(meetingId, speakers);

  addAgentEvent({
    meeting_id: meetingId,
    step: "speakers",
    status: "SUCCESS",
    message: `Identified ${speakers.length} participants: ${speakers.map((s) => `${s.name} (${s.role})`).join(", ")}.`,
    metadata: speakers,
  });

  // Step 3: Structured Extraction (Decisions, Actions, Risks)
  addAgentEvent({
    meeting_id: meetingId,
    step: "extract",
    status: "IN_PROGRESS",
    message: "Extracting ratified decisions, action items, assignees, deadlines, and project risks...",
  });

  const extracted = await extractMeetingArtifacts(
    meetingId,
    meeting.title,
    normalizedTranscript,
    geminiApiKey
  );

  const decisions: Decision[] = extracted.decisions.map((d, idx) => ({
    ...d,
    id: `dec-${meetingId}-${idx + 1}`,
    meeting_id: meetingId,
    meeting_title: meeting.title,
    created_at: new Date().toISOString(),
  }));

  const actionItems: ActionItem[] = extracted.action_items.map((a, idx) => ({
    ...a,
    id: `act-${meetingId}-${idx + 1}`,
    meeting_id: meetingId,
    decision_id: decisions[0]?.id,
    meeting_title: meeting.title,
    external_task_id: `FLW-${Math.floor(1000 + Math.random() * 9000)}`,
    created_at: new Date().toISOString(),
  }));

  saveDecisions(meetingId, decisions);
  saveActionItems(meetingId, actionItems);

  addAgentEvent({
    meeting_id: meetingId,
    step: "extract",
    status: "SUCCESS",
    message: `Extracted ${decisions.length} decision candidates and ${actionItems.length} proposed action items.`,
    metadata: { decisionsCount: decisions.length, actionsCount: actionItems.length },
  });

  // Step 4: Retrieve Relevant Organizational Decision Memory
  addAgentEvent({
    meeting_id: meetingId,
    step: "memory_query",
    status: "IN_PROGRESS",
    message: "Querying persistent organizational memory across historical meetings and ADRs...",
  });

  const retrievedMemories = retrieveRelevantMemories(decisions, normalizedTranscript);

  addAgentEvent({
    meeting_id: meetingId,
    step: "memory_query",
    status: "SUCCESS",
    message: `Retrieved ${retrievedMemories.length} relevant historical policy/milestone decisions from persistent memory.`,
    metadata: retrievedMemories.map((m) => ({
      id: m.decision.id,
      relevance: m.relevanceScore,
      text: m.decision.decision_text,
    })),
  });

  // Step 5: Run Conflict Radar (Contradictions, Changed Commitments, Capacity, Overlaps)
  addAgentEvent({
    meeting_id: meetingId,
    step: "conflict_detection",
    status: "IN_PROGRESS",
    message: "Running Conflict Radar against organizational memory and resource constraints...",
  });

  const radarAnalysis = runConflictRadar(meetingId, decisions, actionItems, retrievedMemories);

  const conflicts: Conflict[] = radarAnalysis.conflicts.map((c, idx) => ({
    ...c,
    id: `cnf-${meetingId}-${idx + 1}`,
    meeting_id: meetingId,
    created_at: new Date().toISOString(),
  }));

  saveConflicts(meetingId, conflicts);

  const severityAlert = radarAnalysis.riskSummary.criticalCount > 0 ? "CRITICAL" : radarAnalysis.riskSummary.highCount > 0 ? "WARNING" : "SUCCESS";
  addAgentEvent({
    meeting_id: meetingId,
    step: "conflict_detection",
    status: severityAlert === "CRITICAL" ? "WARNING" : "SUCCESS",
    message: `Conflict Radar identified ${conflicts.length} risk items (${radarAnalysis.riskSummary.criticalCount} Critical, ${radarAnalysis.riskSummary.highCount} High).`,
    metadata: radarAnalysis.riskSummary,
  });

  // Step 6: Compute Execution Score
  addAgentEvent({
    meeting_id: meetingId,
    step: "score",
    status: "IN_PROGRESS",
    message: "Computing multidimensional Execution Score (Clarity, Ownership, Timelines, Conflict Risk)...",
  });

  const scoreBreakdown = calculateExecutionScore(decisions, actionItems, conflicts);

  addAgentEvent({
    meeting_id: meetingId,
    step: "score",
    status: "SUCCESS",
    message: `Assigned Execution Score: ${scoreBreakdown.total}/100. Factors: Clarity ${scoreBreakdown.decision_clarity}/25, Ownership ${scoreBreakdown.ownership_coverage}/25, Deadlines ${scoreBreakdown.deadline_quality}/25, Risk Factor ${scoreBreakdown.risk_penalty}/25.`,
    metadata: scoreBreakdown,
  });

  // Step 7: Await Human Approval (Mandatory Gatekeeper)
  addAgentEvent({
    meeting_id: meetingId,
    step: "ready_for_review",
    status: "PENDING",
    message: "Actions prepared and staged. Awaiting mandatory human confirmation before creating tasks or committing to memory.",
  });

  const updatedMeeting: Meeting = {
    ...meeting,
    summary: extracted.summary,
    execution_score: scoreBreakdown.total,
    status: "pending_review",
    updated_at: new Date().toISOString(),
  };

  saveMeeting(updatedMeeting);
  return getMeetingById(meetingId)!;
}

export interface HumanConfirmationPayload {
  meetingId: string;
  approvedDecisionIds: string[];
  rejectedDecisionIds: string[];
  approvedActionItemIds: string[];
  rejectedActionItemIds: string[];
  scheduleReminders: boolean;
}

export async function executeHumanConfirmedActions(payload: HumanConfirmationPayload): Promise<Meeting> {
  const {
    meetingId,
    approvedDecisionIds,
    rejectedDecisionIds,
    approvedActionItemIds,
    rejectedActionItemIds,
    scheduleReminders,
  } = payload;

  const meeting = getMeetingById(meetingId);
  if (!meeting) throw new Error(`Meeting not found: ${meetingId}`);

  // 1. Update Decisions in memory
  const allDecisions = getDecisions();
  for (const dec of allDecisions) {
    if (dec.meeting_id === meetingId) {
      if (approvedDecisionIds.includes(dec.id)) {
        dec.approved = true;
        dec.status = "approved";
      } else if (rejectedDecisionIds.includes(dec.id)) {
        dec.approved = false;
        dec.status = "rejected";
      }
    }
  }
  saveDecisions(meetingId, allDecisions.filter((d) => d.meeting_id === meetingId));

  // 2. Update Action Items in task tracker
  const allActions = getActionItems();
  const createdReminders: Reminder[] = [];

  for (const act of allActions) {
    if (act.meeting_id === meetingId) {
      if (approvedActionItemIds.includes(act.id)) {
        act.approved = true;
        act.status = "APPROVED";

        // Proactive deadline reminder
        if (scheduleReminders && act.due_date) {
          const dueTime = new Date(act.due_date).getTime();
          const remindTime = Math.max(Date.now() + 60 * 60 * 1000, dueTime - 24 * 60 * 60 * 1000);
          createdReminders.push({
            id: `rem-${act.id}`,
            action_item_id: act.id,
            action_item_title: act.title,
            owner: act.owner,
            remind_at: new Date(remindTime).toISOString(),
            channel: "in-app",
            status: "SCHEDULED",
            created_at: new Date().toISOString(),
          });
        }
      } else if (rejectedActionItemIds.includes(act.id)) {
        act.approved = false;
        act.status = "REJECTED";
      }
    }
  }
  saveActionItems(meetingId, allActions.filter((a) => a.meeting_id === meetingId));

  if (createdReminders.length > 0) {
    saveReminders(createdReminders);
  }

  // 3. Mark meeting as executed
  const executedMeeting: Meeting = {
    ...meeting,
    status: "executed",
    updated_at: new Date().toISOString(),
  };
  saveMeeting(executedMeeting);

  // 4. Record Agent Event
  addAgentEvent({
    meeting_id: meetingId,
    step: "executed",
    status: "SUCCESS",
    message: `Human Confirmation Received: Committed ${approvedDecisionIds.length} decisions into organizational memory, dispatched ${approvedActionItemIds.length} tasks to tracker, and scheduled ${createdReminders.length} proactive reminders.`,
    metadata: {
      approvedDecisions: approvedDecisionIds.length,
      approvedTasks: approvedActionItemIds.length,
      remindersScheduled: createdReminders.length,
    },
  });

  // 5. Update Weekly Digests
  generateAllDigests();

  return getMeetingById(meetingId)!;
}
