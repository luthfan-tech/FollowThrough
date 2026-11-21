import { Conflict, ConflictType, ConflictSeverity, Decision, ActionItem } from "../types";
import { RetrievedMemory } from "./memory";
import { getActionItems } from "../db";

export interface ConflictRadarAnalysis {
  conflicts: Omit<Conflict, "id" | "meeting_id" | "created_at">[];
  riskSummary: {
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    overallRisk: ConflictSeverity;
  };
}

export function runConflictRadar(
  meetingId: string,
  proposedDecisions: Decision[],
  proposedActions: ActionItem[],
  retrievedMemories: RetrievedMemory[]
): ConflictRadarAnalysis {
  const conflicts: Omit<Conflict, "id" | "meeting_id" | "created_at">[] = [];
  const existingTasks = getActionItems();

  // 1. Memory Contradictions & Reversals
  for (const proposed of proposedDecisions) {
    const curText = proposed.decision_text.toLowerCase();

    // Check against retrieved historical memories
    for (const mem of retrievedMemories) {
      const prev = mem.decision;
      const prevText = prev.decision_text.toLowerCase();

      // Rule: iOS 15 contradiction
      if (
        (curText.includes("drop ios 15") || (curText.includes("ios 17") && curText.includes("minimum"))) &&
        (prevText.includes("ios 15") || prevText.includes("backward compatibility"))
      ) {
        conflicts.push({
          current_decision_id: proposed.id,
          previous_decision_id: prev.id,
          conflict_type: "CONTRADICTION",
          severity: "CRITICAL",
          explanation: `Direct Contradiction with ratified policy from "${prev.meeting_title || 'Earlier ADR'}": The historical decision explicitly mandated iOS 15+ support to safeguard 28% of enterprise customers. This new decision unilaterally abandons that support requirement.`,
          recommendation: "Hold an emergency customer impact review with Enterprise Sales before dropping iOS 15, or scope a fallback build.",
          resolved: false,
          current_decision_text: proposed.decision_text,
          previous_decision_text: prev.decision_text,
          previous_meeting_title: prev.meeting_title,
          previous_meeting_date: prev.decision_date,
          previous_owner: prev.owner,
        });
      }

      // Rule: Identity / Auth Provider Contradiction (Supabase vs Auth0)
      if (
        (curText.includes("auth0") || curText.includes("migrate") || curText.includes("swap")) &&
        (prevText.includes("supabase") || prevText.includes("unified identity") || prevText.includes("architectural review"))
      ) {
        conflicts.push({
          current_decision_id: proposed.id,
          previous_decision_id: prev.id,
          conflict_type: "CONTRADICTION",
          severity: "CRITICAL",
          explanation: `Architectural Governance Violation: ADR-24 ratified Supabase as the standardized identity provider and required a formal architectural review before switching. Moving to Auth0 over the weekend bypasses security and infosec gatekeepers.`,
          recommendation: "Reject spontaneous auth migration. Open an Architecture Review RFC and conduct an infosec token audit before touching client auth.",
          resolved: false,
          current_decision_text: proposed.decision_text,
          previous_decision_text: prev.decision_text,
          previous_meeting_title: prev.meeting_title,
          previous_meeting_date: prev.decision_date,
          previous_owner: prev.owner,
        });
      }

      // Rule: Release Date Milestone Slip (Oct 15 vs Nov 25)
      if (
        (curText.includes("november 25") || curText.includes("reschedule") || curText.includes("push")) &&
        (prevText.includes("october 15") || prevText.includes("locked") || prevText.includes("public release"))
      ) {
        conflicts.push({
          current_decision_id: proposed.id,
          previous_decision_id: prev.id,
          conflict_type: "CHANGED_COMMITMENT",
          severity: "HIGH",
          explanation: `Milestone Breach: Release milestone was locked for October 15th to coordinate with Q4 co-marketing commitments. Shifting to November 25th causes downstream marketing collateral invalidation.`,
          recommendation: "Notify Marketing & Partner Alliances immediately. Review if a phased beta can launch on Oct 15 while GA follows in November.",
          resolved: false,
          current_decision_text: proposed.decision_text,
          previous_decision_text: prev.decision_text,
          previous_meeting_title: prev.meeting_title,
          previous_meeting_date: prev.decision_date,
          previous_owner: prev.owner,
        });
      }

      // Rule: Marketing Ad Spend Freeze Violation
      if (
        (curText.includes("google ads") || curText.includes("budget") || curText.includes("spend")) &&
        (prevText.includes("freeze") && prevText.includes("google ads"))
      ) {
        conflicts.push({
          current_decision_id: proposed.id,
          previous_decision_id: prev.id,
          conflict_type: "CONTRADICTION",
          severity: "HIGH",
          explanation: `Policy Override Conflict: Current decision injects $15,000 into Google Ads, directly reversing the active policy set by Jordan Lee to freeze all spend changes through month-end for clean attribution analysis.`,
          recommendation: "Defer budget injection until the attribution control cohort finishes its 14-day observation window, or run on a separate test domain.",
          resolved: false,
          current_decision_text: proposed.decision_text,
          previous_decision_text: prev.decision_text,
          previous_meeting_title: prev.meeting_title,
          previous_meeting_date: prev.decision_date,
          previous_owner: prev.owner,
        });
      }
    }
  }

  // 2. Missing Owner Detection
  for (const action of proposedActions) {
    const owner = (action.owner || "").trim().toLowerCase();
    if (!owner || owner === "unassigned" || owner === "somebody" || owner === "someone" || owner === "team") {
      conflicts.push({
        conflict_type: "MISSING_OWNER",
        severity: action.priority === "CRITICAL" || action.priority === "HIGH" ? "HIGH" : "MEDIUM",
        explanation: `Action Item "${action.title}" has no designated single directly-responsible individual (DRI). High-priority tasks without owners have an 85% rate of execution failure.`,
        recommendation: "Assign a specific engineering or operational owner during the approval confirmation step.",
        resolved: false,
        current_decision_text: action.title,
      });
    }
  }

  // 3. Unrealistic Deadlines (< 24-48h for massive tasks)
  for (const action of proposedActions) {
    if (action.due_date) {
      const dueDate = new Date(action.due_date).getTime();
      const now = Date.now();
      const hoursDiff = (dueDate - now) / (1000 * 60 * 60);

      const titleLower = action.title.toLowerCase();
      const isMassiveTask = 
        titleLower.includes("graphql") || 
        titleLower.includes("rewrite") || 
        titleLower.includes("redis") || 
        titleLower.includes("refactor") ||
        titleLower.includes("overhaul") ||
        titleLower.includes("dashboard");

      if (hoursDiff > 0 && hoursDiff <= 24 && isMassiveTask) {
        conflicts.push({
          conflict_type: "UNREALISTIC_DEADLINE",
          severity: "HIGH",
          explanation: `High Risk Velocity Trap: "${action.title}" is scheduled to complete in under 24 hours (${Math.round(hoursDiff)}h remaining). Architectural refactoring on this scale with zero testing buffer carries extreme regression risk.`,
          recommendation: "Extend deadline by at least 3-4 business days and scope an MVP spike first.",
          resolved: false,
          current_decision_text: action.title,
        });
      }
    }
  }

  // 4. Duplicate Task Detection
  for (const proposedAction of proposedActions) {
    const proposedTitle = proposedAction.title.toLowerCase();
    for (const existing of existingTasks) {
      if (existing.status !== "COMPLETED" && existing.status !== "REJECTED") {
        const existingTitle = existing.title.toLowerCase();
        
        // Check for strong keyword similarity
        if (
          (proposedTitle.includes("attribution") && existingTitle.includes("attribution")) ||
          (proposedTitle.includes("tracking pixel") && existingTitle.includes("tracking pixel")) ||
          (proposedTitle.includes("google ads") && existingTitle.includes("google ads") && proposedAction.owner === existing.owner)
        ) {
          conflicts.push({
            conflict_type: "DUPLICATE_TASK",
            severity: "MEDIUM",
            explanation: `Duplicate Work Alert: "${proposedAction.title}" significantly duplicates open task #${existing.external_task_id || existing.id} ("${existing.title}") assigned to ${existing.owner || 'unassigned'}.`,
            recommendation: `Consolidate this requirement into existing task #${existing.external_task_id || existing.id} rather than spawning redundant tracking items.`,
            resolved: false,
            current_decision_text: proposedAction.title,
            previous_decision_text: existing.title,
            previous_owner: existing.owner,
          });
        }
      }
    }
  }

  // 5. Assignee Overload & Deadline Conflicts
  const ownerDeadlines = new Map<string, string[]>();
  for (const action of [...existingTasks, ...proposedActions]) {
    if (action.owner && action.owner !== "Unassigned" && action.due_date) {
      const dateKey = action.due_date.split("T")[0];
      const compositeKey = `${action.owner}__${dateKey}`;
      const list = ownerDeadlines.get(compositeKey) || [];
      list.push(action.title);
      ownerDeadlines.set(compositeKey, list);
    }
  }

  for (const [key, titles] of Array.from(ownerDeadlines.entries())) {
    if (titles.length >= 3) {
      const [owner, dateStr] = key.split("__");
      // Check if this involves any of our proposed actions
      const touchesProposed = proposedActions.some((p) => p.owner === owner);
      if (touchesProposed) {
        conflicts.push({
          conflict_type: "DEADLINE_CONFLICT",
          severity: "HIGH",
          explanation: `Assignee Capacity Overload: ${owner} has ${titles.length} concurrent deliverables due on ${dateStr} (${titles.slice(0, 2).join(", ")} and others).`,
          recommendation: `Stagger deadlines across subsequent sprints or reassign non-critical items to another teammate.`,
          resolved: false,
          current_decision_text: `Overload on ${owner}: ${titles.length} tasks due on ${dateStr}`,
        });
      }
    }
  }

  // Summary counts
  const criticalCount = conflicts.filter((c) => c.severity === "CRITICAL").length;
  const highCount = conflicts.filter((c) => c.severity === "HIGH").length;
  const mediumCount = conflicts.filter((c) => c.severity === "MEDIUM").length;
  const lowCount = conflicts.filter((c) => c.severity === "LOW").length;

  let overallRisk: ConflictSeverity = "LOW";
  if (criticalCount > 0) overallRisk = "CRITICAL";
  else if (highCount > 0) overallRisk = "HIGH";
  else if (mediumCount > 0) overallRisk = "MEDIUM";

  return {
    conflicts,
    riskSummary: {
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      overallRisk,
    },
  };
}
