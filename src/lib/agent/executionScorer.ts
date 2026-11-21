import { Decision, ActionItem, Conflict, ExecutionScoreBreakdown } from "../types";

export function calculateExecutionScore(
  decisions: Decision[],
  actionItems: ActionItem[],
  conflicts: Conflict[]
): ExecutionScoreBreakdown {
  const feedback: string[] = [];

  // 1. Decision Clarity (0 - 25 points)
  let decisionClarity = 25;
  if (decisions.length === 0) {
    decisionClarity = 5;
    feedback.push("No explicit decisions ratified during this discussion.");
  } else {
    const avgConfidence = decisions.reduce((acc, d) => acc + (d.confidence || 0.9), 0) / decisions.length;
    decisionClarity = Math.round(25 * avgConfidence);
    if (avgConfidence < 0.85) {
      feedback.push("Decisions contain ambiguous language or tentative consensus.");
    }
  }

  // 2. Ownership Coverage (0 - 25 points)
  let ownershipCoverage = 25;
  if (actionItems.length === 0) {
    ownershipCoverage = 15;
    feedback.push("No actionable follow-up items mapped.");
  } else {
    const assignedCount = actionItems.filter(
      (a) => a.owner && a.owner.trim().length > 0 && a.owner.toLowerCase() !== "unassigned" && a.owner.toLowerCase() !== "team"
    ).length;
    const ratio = assignedCount / actionItems.length;
    ownershipCoverage = Math.round(25 * ratio);

    if (ratio < 1.0) {
      const missingCount = actionItems.length - assignedCount;
      feedback.push(`${missingCount} action item(s) lack an individual responsible owner (DRI).`);
    }
  }

  // 3. Deadline Quality (0 - 25 points)
  let deadlineQuality = 25;
  if (actionItems.length === 0) {
    deadlineQuality = 15;
  } else {
    const datedCount = actionItems.filter((a) => !!a.due_date).length;
    const datedRatio = datedCount / actionItems.length;

    // Check for unrealistic rush deadlines (< 24h)
    const now = Date.now();
    const rushCount = actionItems.filter((a) => {
      if (!a.due_date) return false;
      const diffHours = (new Date(a.due_date).getTime() - now) / (1000 * 60 * 60);
      return diffHours > 0 && diffHours < 24;
    }).length;

    deadlineQuality = Math.max(5, Math.round(25 * datedRatio) - (rushCount * 6));

    if (datedRatio < 1.0) {
      feedback.push(`${actionItems.length - datedCount} action item(s) have open-ended or missing due dates.`);
    }
    if (rushCount > 0) {
      feedback.push(`${rushCount} task(s) scheduled with extreme turnaround pressure (<24h).`);
    }
  }

  // 4. Conflict & Risk Penalty (0 - 25 points)
  let riskPenalty = 25;
  const criticalCount = conflicts.filter((c) => c.severity === "CRITICAL").length;
  const highCount = conflicts.filter((c) => c.severity === "HIGH").length;
  const mediumCount = conflicts.filter((c) => c.severity === "MEDIUM").length;

  const totalDeductions = (criticalCount * 12) + (highCount * 6) + (mediumCount * 3);
  riskPenalty = Math.max(0, 25 - totalDeductions);

  if (criticalCount > 0) {
    feedback.push(`Conflict Radar triggered ${criticalCount} CRITICAL organizational contradiction(s)!`);
  }
  if (highCount > 0) {
    feedback.push(`${highCount} high-severity risk(s) or capacity collisions detected.`);
  }

  const total = Math.max(10, Math.min(100, decisionClarity + ownershipCoverage + deadlineQuality + riskPenalty));

  return {
    total,
    decision_clarity: decisionClarity,
    ownership_coverage: ownershipCoverage,
    deadline_quality: deadlineQuality,
    risk_penalty: riskPenalty,
    feedback: feedback.length > 0 ? feedback : ["High-clarity meeting with solid ownership and minimal organizational conflict."],
  };
}
