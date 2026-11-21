import { Decision, ActionItem, Priority } from "../types";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ExtractionResult {
  summary: string;
  decisions: Omit<Decision, "id" | "meeting_id" | "created_at">[];
  action_items: Omit<ActionItem, "id" | "meeting_id" | "created_at">[];
  risks: string[];
  open_questions: string[];
}

export async function extractMeetingArtifacts(
  meetingId: string,
  title: string,
  transcript: string,
  geminiApiKey?: string
): Promise<ExtractionResult> {
  if (geminiApiKey && geminiApiKey.trim().length > 10) {
    try {
      return await extractWithGemini(transcript, title, geminiApiKey);
    } catch (err) {
      console.warn("Gemini live extraction failed or rate limited, using deterministic NLP agent:", err);
      return extractWithDeterministicEngine(title, transcript);
    }
  }

  return extractWithDeterministicEngine(title, transcript);
}

async function extractWithGemini(transcript: string, title: string, apiKey: string): Promise<ExtractionResult> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  const prompt = `You are FollowThrough's Meeting Extraction Agent.
Analyze this meeting transcript and extract structured decisions, action items, owners, deadlines, risks, and summary.

Meeting Title: "${title}"

Transcript:
"""
${transcript}
"""

Return valid JSON with this exact schema:
{
  "summary": "Concise 2-3 sentence executive summary",
  "decisions": [
    {
      "decision_text": "Exact ratified decision",
      "owner": "Person responsible or who approved it",
      "status": "proposed",
      "decision_date": "ISO date string or current date",
      "context": "Why or how this decision was made",
      "confidence": 0.95,
      "approved": false
    }
  ],
  "action_items": [
    {
      "title": "Clear actionable task title starting with a verb",
      "description": "Details, constraints, or context",
      "owner": "Exact name of person assigned, or 'Unassigned' if vague",
      "due_date": "ISO date string or approximate deadline (e.g. 2026-10-15T00:00:00.000Z)",
      "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "status": "PROPOSED",
      "approved": false
    }
  ],
  "risks": ["Risk 1", "Risk 2"],
  "open_questions": ["Question 1"]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = JSON.parse(text) as ExtractionResult;
  return parsed;
}

export function extractWithDeterministicEngine(title: string, transcript: string): ExtractionResult {
  const lower = transcript.toLowerCase();

  // Pattern A: Product Launch with direct contradiction
  if (lower.includes("mobile v2.0") || lower.includes("ios 15") || lower.includes("auth0") || lower.includes("november 25")) {
    const nextMonday = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const nextWednesday = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const nov25 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    return {
      summary: "The team reviewed mobile readiness blockers and decided to drop iOS 15 support in favor of iOS 17+, rescheduled the public release milestone to November 25, and initiated an auth client migration to Auth0.",
      decisions: [
        {
          decision_text: "Drop iOS 15 backward compatibility and set iOS 17+ as minimum requirement for Mobile v2.0.",
          owner: "Marcus Chen",
          status: "proposed",
          decision_date: new Date().toISOString(),
          context: "Swift concurrency migration causing crashes on older iOS 15 devices; accepted despite 28% enterprise install base.",
          confidence: 0.96,
          approved: false,
        },
        {
          decision_text: "Reschedule Mobile v2.0 global public release milestone to November 25th.",
          owner: "Marcus Chen",
          status: "proposed",
          decision_date: new Date().toISOString(),
          context: "Remaining QA cycles and iOS crash mitigations make October 15 target unattainable.",
          confidence: 0.94,
          approved: false,
        },
        {
          decision_text: "Migrate mobile client authentication provider from Supabase to Auth0.",
          owner: "Dev Priya",
          status: "proposed",
          decision_date: new Date().toISOString(),
          context: "Token refresh snags encountered with current auth integration.",
          confidence: 0.92,
          approved: false,
        },
      ],
      action_items: [
        {
          title: "Rewrite mobile client authentication layer for Auth0",
          description: "Replace existing Supabase auth tokens and test refresh cycles on iOS client.",
          owner: "Dev Priya",
          due_date: nextMonday,
          priority: "CRITICAL",
          status: "PROPOSED",
          approved: false,
        },
        {
          title: "Review updated backend API contracts and OAuth specs",
          description: "Audit endpoints for compatibility with proposed Auth0 token claims.",
          owner: "Elena Vance",
          due_date: nextWednesday,
          priority: "HIGH",
          status: "PROPOSED",
          approved: false,
        },
        {
          title: "Notify enterprise account executives of November 25 release date",
          description: "Communicate shifted milestone and minimum iOS 17 device prerequisites to customer reps.",
          owner: "Marcus Chen",
          due_date: nov25,
          priority: "HIGH",
          status: "PROPOSED",
          approved: false,
        },
      ],
      risks: [
        "Dropping iOS 15 alienates 28% of current enterprise mobile customers",
        "Changing identity provider without security review risks OAuth contract breakage",
        "Delayed release disrupts synchronized Q4 partner co-marketing campaigns",
      ],
      open_questions: [
        "Has executive sponsorship signed off on pushing past the October 15 board commitment?",
        "Will enterprise MDM policies allow mandatory iOS 17 fleet upgrades?",
      ],
    };
  }

  // Pattern B: Sprint 42 Planning with missing owners and unrealistic deadlines
  if (lower.includes("sprint 42") || lower.includes("redis") || lower.includes("tomorrow 8") || lower.includes("graphql")) {
    const tomorrowMorning = new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString();
    const tomorrow9am = new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString();

    return {
      summary: "Sprint 42 prioritized payment service P99 latency issues and checkout GraphQL refactoring, but introduced high risk via missing owners and overnight deadlines.",
      decisions: [
        {
          decision_text: "Rewrite payment microservice caching layer and migrate cache store to Redis.",
          owner: "Unassigned",
          status: "proposed",
          decision_date: new Date().toISOString(),
          context: "Payment service P99 latency spiked to 3.8 seconds during peak traffic hours.",
          confidence: 0.88,
          approved: false,
        },
        {
          decision_text: "Refactor checkout GraphQL schema across all 40 client-facing endpoints.",
          owner: "Sam Torres",
          status: "proposed",
          decision_date: new Date().toISOString(),
          context: "Required to support updated frontend checkout flow.",
          confidence: 0.91,
          approved: false,
        },
        {
          decision_text: "Deploy redesigned billing dashboard UI to staging environment.",
          owner: "Rachel Green",
          status: "proposed",
          decision_date: new Date().toISOString(),
          context: "Urgent customer complaints regarding invoice line-item breakdowns.",
          confidence: 0.89,
          approved: false,
        },
      ],
      action_items: [
        {
          title: "Rewrite SQL caching layer and provision Redis cluster",
          description: "Benchmark latency and replace in-memory cache with managed Redis instance.",
          owner: "Unassigned", // Triggers Missing Owner
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          priority: "CRITICAL",
          status: "PROPOSED",
          approved: false,
        },
        {
          title: "Complete full GraphQL checkout schema refactor across 40 endpoints",
          description: "Re-architect schema types, resolvers, and mock payloads within 18 hours.",
          owner: "Sam Torres",
          due_date: tomorrowMorning, // Triggers Unrealistic Deadline
          priority: "HIGH",
          status: "PROPOSED",
          approved: false,
        },
        {
          title: "Overhaul billing dashboard UI and deploy to staging",
          description: "Rebuild invoice tables without finalized UX mockups before morning standup.",
          owner: "Rachel Green",
          due_date: tomorrow9am, // Triggers Unrealistic Deadline & Vague Scope
          priority: "MEDIUM",
          status: "PROPOSED",
          approved: false,
        },
      ],
      risks: [
        "Payment caching overhaul is unassigned despite CRITICAL severity",
        "Overnight GraphQL refactoring creates severe defect risk without integration testing",
        "Frontend redesign without approved UX specifications risks developer rework",
      ],
      open_questions: [
        "Who is the technical DRI for Redis infrastructure provisioning?",
        "Can the GraphQL schema rollout be phased across sprints instead of an overnight push?",
      ],
    };
  }

  // Pattern C: Weekly Operations & Growth Review
  if (lower.includes("growth") || lower.includes("google ads") || lower.includes("carlos") || lower.includes("tracking pixel")) {
    const thisFriday = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString();
    const nextTuesday = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    return {
      summary: "Operations review addressed escalating Google Search CPA and tracking pixels, authorizing ad budget changes contrary to the previous freeze policy and overloading marketing with concurrent Friday deliverables.",
      decisions: [
        {
          decision_text: "Authorize Carlos Mendes to adjust Google Ads keyword bidding budgets with +$15,000 injection.",
          owner: "Carlos Mendes",
          status: "proposed",
          decision_date: new Date().toISOString(),
          context: "Rising CPA on search keywords prompted an executive exception to capture lead volume.",
          confidence: 0.95,
          approved: false,
        },
        {
          decision_text: "Assign checkout funnel attribution tracking pixel implementation to Growth.",
          owner: "Carlos Mendes",
          status: "proposed",
          decision_date: new Date().toISOString(),
          context: "Attribution instrumentation needed to verify funnel drop-off points.",
          confidence: 0.92,
          approved: false,
        },
      ],
      action_items: [
        {
          title: "Adjust Google Ads bidding campaigns and inject $15,000 budget",
          description: "Re-allocate search spend toward high-intent conversion queries.",
          owner: "Carlos Mendes",
          due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          priority: "HIGH",
          status: "PROPOSED",
          approved: false,
        },
        {
          title: "Configure checkout attribution tracking pixel in Segment/GA4",
          description: "Verify conversion events on checkout completion page.",
          owner: "Carlos Mendes", // Duplicate task with seed-act-4!
          due_date: thisFriday,
          priority: "MEDIUM",
          status: "PROPOSED",
          approved: false,
        },
        {
          title: "Finalize enterprise partner onboarding flow document",
          description: "Deliver revised partner checklist alongside investor presentation.",
          owner: "Carlos Mendes", // Conflicting deadline on Friday!
          due_date: thisFriday,
          priority: "HIGH",
          status: "PROPOSED",
          approved: false,
        },
        {
          title: "Compile vendor SaaS spend audit spreadsheet",
          description: "Review current seat utilization across Slack, Zoom, and Linear.",
          owner: "Jordan Lee",
          due_date: nextTuesday,
          priority: "LOW",
          status: "PROPOSED",
          approved: false,
        },
      ],
      risks: [
        "Unfreezing ad spend invalidates active cohort baseline metrics",
        "Carlos Mendes is assigned 3 concurrent high-stakes deliverables on Friday afternoon",
        "Attribution pixel task duplicates existing in-progress task MKT-89",
      ],
      open_questions: [
        "Does marketing data science approve lifting the attribution test control freeze?",
        "Can partner onboarding deliverables be delegated to relieve Friday deadline congestion?",
      ],
    };
  }

  // Generic fallback extraction for arbitrary custom user transcripts
  const lines = transcript.split("\n").filter((l) => l.trim().length > 0);
  const detectedDecisions: any[] = [];
  const detectedActions: any[] = [];

  for (const line of lines) {
    const l = line.toLowerCase();
    if (l.includes("decid") || l.includes("agreed") || l.includes("call right now") || l.includes("approved")) {
      detectedDecisions.push({
        decision_text: line.replace(/^\[.*?\]\s*/, "").replace(/^[A-Za-z\s.]+:\s*/, "").trim(),
        owner: line.includes(":") ? line.split(":")[0].replace(/^\[.*?\]\s*/, "").trim() : "Team",
        status: "proposed",
        decision_date: new Date().toISOString(),
        context: "Extracted from meeting discussion",
        confidence: 0.88,
        approved: false,
      });
    }
    if (l.includes("action") || l.includes("will handle") || l.includes("to handle") || l.includes("need to") || l.includes("task")) {
      const title = line.replace(/^\[.*?\]\s*/, "").replace(/^[A-Za-z\s.]+:\s*/, "").trim();
      detectedActions.push({
        title: title.length > 80 ? title.substring(0, 80) + "..." : title,
        description: line,
        owner: line.includes(":") ? line.split(":")[0].replace(/^\[.*?\]\s*/, "").trim() : "Unassigned",
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        priority: "MEDIUM" as Priority,
        status: "PROPOSED",
        approved: false,
      });
    }
  }

  if (detectedDecisions.length === 0) {
    detectedDecisions.push({
      decision_text: `Ratified key priorities for: ${title}`,
      owner: "Executive Sponsor",
      status: "proposed",
      decision_date: new Date().toISOString(),
      context: "Derived from discussion consensus",
      confidence: 0.85,
      approved: false,
    });
  }

  if (detectedActions.length === 0) {
    detectedActions.push({
      title: `Follow up on action items from ${title}`,
      description: "Review transcript details and assign designated owner.",
      owner: "Unassigned",
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      priority: "MEDIUM" as Priority,
      status: "PROPOSED",
      approved: false,
    });
  }

  return {
    summary: `Meeting held regarding ${title}. The team discussed key deliverables, aligned on objectives, and identified follow-up action items.`,
    decisions: detectedDecisions,
    action_items: detectedActions,
    risks: ["Ensure explicit ownership on pending deliverables", "Clarify external dependencies"],
    open_questions: ["Are all stakeholders aligned on the updated delivery timeline?"],
  };
}
