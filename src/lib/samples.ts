export interface SampleMeeting {
  id: string;
  title: string;
  category: string;
  badge: string;
  badgeColor: string;
  description: string;
  expectedHighlights: string[];
  raw_transcript: string;
}

export const SAMPLE_MEETINGS: SampleMeeting[] = [
  {
    id: "sample-product-launch",
    title: "Q3 Mobile App Launch Sync & Readiness",
    category: "Product & Architecture",
    badge: "Direct Contradiction Demo",
    badgeColor: "rose",
    description: "Contains severe contradictions against historical architectural and scheduling decisions in organizational memory.",
    expectedHighlights: [
      "CRITICAL: Violates ADR-24 (attempting to swap Supabase for Auth0 without arch review)",
      "CRITICAL: Violates customer promise by dropping iOS 15 backward compatibility",
      "HIGH: Unilaterally shifts launch date from October 15th to November 25th",
      "Executes 3 proposed action items upon confirmation",
    ],
    raw_transcript: `[00:01] Marcus Chen: Thanks everyone for jumping on the Q3 Mobile App Launch Sync. We are less than four weeks out from our planned October 15 launch, and I want an honest readiness assessment.
[00:45] Dev Priya: Marcus, I need to raise a major blocker. Our Swift concurrency migration is throwing unexpected crashes on older devices running iOS 15. Supporting iOS 15 is requiring crazy workarounds.
[01:15] Elena Vance: How many active enterprise users are still on iOS 15?
[01:28] Dev Priya: About 28%. But it's slowing the mobile team to a crawl. I strongly propose we drop iOS 15 support entirely and make iOS 17 the minimum requirement.
[02:02] Marcus Chen: Okay, let's make that call right now: We will drop iOS 15 backward compatibility and set iOS 17+ as our minimum requirement for the Mobile v2.0 release.
[02:30] Elena Vance: Wait, what about the October 15th public release milestone?
[02:44] Dev Priya: We won't make October 15th with the remaining QA cycles. I propose we push the global public release date back to November 25th.
[03:10] Marcus Chen: Approved. Let's officially reschedule the Mobile v2.0 release date to November 25th.
[03:35] Dev Priya: One more thing regarding backend auth. We've been having some token refresh snags with Supabase. I was thinking of swapping our auth layer to Auth0 over the weekend.
[04:05] Marcus Chen: Good initiative. Let's do it: Dev Priya will migrate the mobile client authentication to Auth0 by this Monday.
[04:30] Elena Vance: Make sure you update the API contracts.
[04:45] Marcus Chen: Action items: Dev Priya to rewrite the auth client for Auth0 by Monday. Elena to review the new API contracts by Wednesday. And I will notify enterprise account managers about the new November 25 release date.`,
  },
  {
    id: "sample-sprint-planning",
    title: "Core Platform Sprint 42 Planning",
    category: "Engineering Sprint",
    badge: "Unrealistic Deadlines & Missing Owners",
    badgeColor: "amber",
    description: "Demonstrates detection of unassigned critical tasks, unrealistic turnaround times (<24h), and team overload.",
    expectedHighlights: [
      "HIGH: Missing owner on payment microservice Redis rewrite",
      "HIGH: Unrealistic deadline (Sam Torres tasked to refactor entire GraphQL schema overnight)",
      "MEDIUM: Unrealistic deadline (Rachel Green tasked to redesign billing UI by tomorrow morning)",
      "Agent flags ownership and timeline risks before any Jira/Linear tasks are created",
    ],
    raw_transcript: `[00:00] Elena Vance: Welcome to Sprint 42 planning. Looking at our Datadog APM, our payment microservice P99 latency spiked to 3.8 seconds yesterday during peak traffic.
[00:35] Elena Vance: We cannot enter next month with this latency. Someone on the team needs to completely rewrite the SQL caching layer and migrate the cache store to Redis.
[01:10] Sam Torres: That's a massive overhaul. Who is taking that?
[01:25] Elena Vance: Someone just grab it from the backlog today. Also, Sam, our frontend clients need the updated GraphQL schema for checkout. Can you refactor the entire GraphQL schema by tomorrow 8:00 AM?
[02:00] Sam Torres: Tomorrow 8:00 AM? That's less than 18 hours from now for 40 endpoints, but I guess I'll pull an all-nighter if you insist.
[02:40] Rachel Green: What about the billing dashboard UI overhaul? We have customer complaints about the invoice breakdown.
[03:05] Elena Vance: Rachel, let's overhaul the entire billing dashboard UI and deploy it to staging by tomorrow morning as well.
[03:30] Rachel Green: That's practically impossible without mockups from design, but I'll try to hack something together.
[04:00] Elena Vance: Great. To recap: Somebody will migrate payments caching to Redis. Sam will finish the full GraphQL refactor by tomorrow 8 AM. Rachel will deploy the redesigned billing dashboard by tomorrow 9 AM. Let's get to work.`,
  },
  {
    id: "sample-operations-sync",
    title: "Weekly Growth & Operations Review",
    category: "Operations & Growth",
    badge: "Duplicate Tasks & Conflicting Commitments",
    badgeColor: "cyan",
    description: "Highlights duplicate action items, violations of active spending freezes, and overlapping deadlines for assignees.",
    expectedHighlights: [
      "HIGH: Violates active marketing decision (spend freeze until month-end)",
      "MEDIUM: Duplicate task detected (Attribution tracking pixel already assigned to Carlos)",
      "MEDIUM: Deadline conflict (Carlos Mendes assigned multiple urgent deliverables on the same Friday)",
      "Proactive reminder suggestions generated automatically",
    ],
    raw_transcript: `[00:05] Marcus Chen: Let's do a quick operations sync. Carlos, how is the acquisition pipeline looking?
[00:30] Carlos Mendes: Cost per acquisition on Google Search is creeping up. I want to immediately adjust our Google Ads bidding budget and inject an extra $15,000 into high-intent keywords.
[01:05] Jordan Lee: Wait, Carlos. Didn't we have a clear agreement last week to freeze all Google Ads spend adjustments until month-end so data science can calibrate baseline attribution?
[01:35] Carlos Mendes: I know, but we need lead volume now. Let's make an executive exception and adjust the ad budget starting tomorrow.
[02:05] Marcus Chen: Okay, approved: Carlos is authorized to adjust Google Ads campaign budgets this week.
[02:30] Jordan Lee: Also, Carlos, we need someone to set up the attribution tracking pixels for the new checkout funnel.
[03:00] Carlos Mendes: I will handle the checkout attribution tracking pixel setup by this Friday.
[03:20] Marcus Chen: And Carlos, remember you also have the quarterly investor deck slides and the enterprise partner onboarding flow due this exact same Friday afternoon.
[03:45] Carlos Mendes: Yes, I will deliver the attribution pixel, the partner onboarding, and the investor deck all by Friday 5 PM.
[04:10] Marcus Chen: Great. Jordan, please prepare the vendor audit spreadsheet by next Tuesday. Let's adjourn.`,
  },
];
