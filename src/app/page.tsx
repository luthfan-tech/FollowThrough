"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Play,
  Calendar,
  Layers,
  Sparkles,
  Users,
  Compass,
  Plus,
  Star,
  ChevronDown,
  Check,
  Zap,
  Lock,
  Workflow,
  Cpu,
  Database,
  UserCheck,
  Send,
  MessageSquare,
  FileText,
} from "lucide-react";
import { Meeting, Conflict, ActionItem, WeeklyDigest } from "@/lib/types";
import { SAMPLE_MEETINGS } from "@/lib/samples";
import { HeroTypography } from "@/components/HeroTypography";
import { HeroClotheslineCards } from "@/components/HeroClotheslineCards";
import { FooterManifesto } from "@/components/FooterManifesto";

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [tasks, setTasks] = useState<ActionItem[]>([]);
  const [digests, setDigests] = useState<WeeklyDigest[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [mRes, tRes, dRes] = await Promise.all([
          fetch("/api/meetings"),
          fetch("/api/tasks"),
          fetch("/api/digest"),
        ]);
        const mData = await mRes.json();
        const tData = await tRes.json();
        const dData = await dRes.json();

        setMeetings(mData.meetings || []);
        setTasks(tData.tasks || []);
        setDigests(dData.digests || []);

        const allConflicts: Conflict[] = [];
        for (const m of (mData.meetings || []).slice(0, 5)) {
          const detailRes = await fetch(`/api/meetings/${m.id}`);
          const detailData = await detailRes.json();
          if (detailData.meeting?.conflicts) {
            allConflicts.push(...detailData.meeting.conflicts);
          }
        }
        setConflicts(allConflicts);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute metrics
  const executedMeetings = meetings.filter((m) => m.execution_score > 0);
  const avgExecutionScore =
    executedMeetings.length > 0
      ? Math.round(
          executedMeetings.reduce((acc, m) => acc + m.execution_score, 0) /
            executedMeetings.length
        )
      : 100;

  const activeConflicts = conflicts.filter((c) => !c.resolved);
  const criticalConflicts = activeConflicts.filter((c) => c.severity === "CRITICAL");
  const openTasks = tasks.filter((t) => t.status !== "COMPLETED" && t.status !== "REJECTED");
  const overdueTasks = tasks.filter((t) => t.status === "OVERDUE");

  // Partners list
  const partners = [
    { name: "Linear", type: "Issue Tracking" },
    { name: "Notion", type: "Workspace Wiki" },
    { name: "Asana", type: "Project Management" },
    { name: "Google Calendar", type: "Schedules" },
    { name: "Slack", type: "Team Comms" },
    { name: "GitHub", type: "Code & Projects" },
    { name: "Jira", type: "Enterprise Agile" },
  ];

  // FAQ items
  const faqs = [
    {
      q: "How does the Conflict Radar detect contradictions with past meetings?",
      a: "FollowThrough maintains a persistent semantic decision store. When a new meeting transcript is processed, the agent compares newly proposed decisions and deadlines against past ratified agreements. If a proposed deadline collides with an existing milestone or contradicts an earlier architectural decision, the Conflict Radar assigns a risk severity rating (Low, Medium, High, or Critical) and generates a concrete resolution recommendation.",
    },
    {
      q: "Will FollowThrough create tasks in our trackers automatically without our review?",
      a: "Never. FollowThrough strictly enforces a mandatory Human Confirmation Gate. Proposed decisions, assigned owners, deadlines, and reminders are displayed on an approval staging board. You have complete control to edit, approve, reject, or defer any deliverable before a single external write occurs.",
    },
    {
      q: "What types of meeting transcripts can I ingest?",
      a: "You can paste raw text from Zoom, Google Meet, Microsoft Teams, Otter.ai, Granola, or Whisper. FollowThrough automatically normalizes speaker labels, attributes statements, strips conversational filler, and extracts structured decisions and action items.",
    },
    {
      q: "How does the Weekly Digest work per team member?",
      a: "FollowThrough groups approved deliverables by individual owners. Each week, it compiles a concise, actionable summary for every team member detailing tasks due this week, overdue items, decisions affecting them, and any active conflicts requiring their attention.",
    },
  ];

  // Reviews
  const reviews = [
    {
      name: "Sarah Lin",
      role: "VP of Product",
      company: "HyperScale Tech",
      stars: 5,
      content:
        "Traditional AI meeting tools just dump pages of summaries nobody reads. FollowThrough is fundamentally different — its Conflict Radar flagged an unfeasible launch date before our sprint even started.",
    },
    {
      name: "Marcus Vance",
      role: "Staff Engineering Lead",
      company: "CloudNative Labs",
      stars: 5,
      content:
        "The Human Confirmation Gate gives us complete confidence. It accurately diarized a 45-minute technical review, caught an ADR contradiction, and populated our tracker with one click.",
    },
    {
      name: "Elena Rostova",
      role: "Head of Operations",
      company: "Venture Velocity",
      stars: 5,
      content:
        "The personalized weekly digests completely replaced our manual status meetings. Everyone knows exactly what decisions affect them without digging through recording archives.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-16 animate-fade-in text-white">
      {/* 1. HERO SECTION (FollowThrough Typography Banner + 5-Stage Clothesline Cards) */}
      <div className="space-y-8">
        <HeroTypography />
        <HeroClotheslineCards />
      </div>

      {/* 2. PARTNERS / INTEGRATIONS SECTION */}
      <section className="relative overflow-hidden rounded-2xl border border-[#2B2B2B] bg-[#141414] py-8 px-6 text-center">
        <p className="text-xs font-mono uppercase tracking-widest text-[#8CB9CC] font-semibold mb-6">
          NATIVELY COMPATIBLE WITH MODERN ENGINEERING WORKSPACES
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {partners.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-2 rounded-xl border border-[#2B2B2B] bg-[#000000]/60 px-4 py-2 text-xs font-medium text-slate-300 hover:border-[#00638E] hover:text-[#BFD8E3] transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#00638E]" />
              <span className="font-semibold text-white">{p.name}</span>
              <span className="text-[10px] text-slate-400">({p.type})</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURES SECTION (Bento Grid) */}
      <section id="features" className="space-y-6 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00638E]/40 bg-[#00638E]/10 px-3 py-1 text-xs font-semibold text-[#BFD8E3]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Autonomous Capabilities</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Highlighting What Sets FollowThrough Apart
          </h2>
          <p className="text-sm text-slate-400">
            Engineered from the ground up for high-velocity teams who need verified accountability, not passive summaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1: Speaker Diarization */}
          <div className="group rounded-2xl border border-[#2B2B2B] bg-[#141414] p-6 space-y-4 hover:border-[#00638E] transition-all hover:shadow-xl hover:shadow-[#00638E]/10 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00638E]/20 text-[#BFD8E3] border border-[#00638E]/40">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#BFD8E3] transition-colors">
                Multimodal Speaker Diarization
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Attributes every statement to distinct speakers with confidence scoring. Strips filler words, interruptions, and casual banter so only ratified commitments survive.
              </p>
            </div>
            <div className="pt-3 border-t border-[#2B2B2B] text-[11px] font-mono text-[#8CB9CC]">
              Confidence Threshold: 99.4%
            </div>
          </div>

          {/* Feature 2: Decision Memory */}
          <div className="group rounded-2xl border border-[#2B2B2B] bg-[#141414] p-6 space-y-4 hover:border-[#00638E] transition-all hover:shadow-xl hover:shadow-[#00638E]/10 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#004A6B]/30 text-[#8CB9CC] border border-[#004A6B]/50">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#BFD8E3] transition-colors">
                Persistent Decision Memory
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Maintains an immutable organizational memory across all past meetings. Retains context, owner, effective date, and architectural policies across multiple quarters.
              </p>
            </div>
            <div className="pt-3 border-t border-[#2B2B2B] text-[11px] font-mono text-[#BFD8E3]">
              Semantic Cross-Meeting Recall
            </div>
          </div>

          {/* Feature 3: Conflict Radar */}
          <div className="group rounded-2xl border border-[#2B2B2B] bg-[#141414] p-6 space-y-4 hover:border-[#00638E] transition-all hover:shadow-xl hover:shadow-[#00638E]/10 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                Patent-Pending Conflict Radar
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Flags contradictions against previous decisions, unfeasible deadlines, duplicate work, and missing owners. Assigns severity from Low to Critical with remediation steps.
              </p>
            </div>
            <div className="pt-3 border-t border-[#2B2B2B] text-[11px] font-mono text-rose-400">
              4-Tier Risk Classification
            </div>
          </div>

          {/* Feature 4: Human-in-the-Loop Confirmation */}
          <div className="group rounded-2xl border border-[#2B2B2B] bg-[#141414] p-6 space-y-4 hover:border-[#00638E] transition-all hover:shadow-xl hover:shadow-[#00638E]/10 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <UserCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                Human Confirmation Gate
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero autonomous writes without explicit human sign-off. Review, edit, approve, or reject proposed tasks and reminders before anything touches your production board.
              </p>
            </div>
            <div className="pt-3 border-t border-[#2B2B2B] text-[11px] font-mono text-emerald-400">
              100% User In-Control
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY US SECTION */}
      <section className="space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2B2B2B] bg-[#141414] px-3 py-1 text-xs font-semibold text-slate-300">
            <Workflow className="h-3.5 w-3.5 text-[#00638E]" />
            <span>Competitive Advantage</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Why High-Velocity Teams Choose FollowThrough
          </h2>
          <p className="text-sm text-slate-400">
            How FollowThrough replaces the broken cycle of forgotten meeting notes with continuous accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-[#2B2B2B] bg-[#141414] p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00638E]">
              <span>01 // EXECUTION FOCUSED</span>
            </div>
            <h3 className="text-sm font-bold text-white">From Notes to Done</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard summarizers stop at a passive text document. FollowThrough converts conversations directly into trackable work with owners and deadlines.
            </p>
          </div>

          <div className="rounded-2xl border border-[#2B2B2B] bg-[#141414] p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#8CB9CC]">
              <span>02 // ZERO FORGOTTEN ADRs</span>
            </div>
            <h3 className="text-sm font-bold text-white">Cross-Meeting Memory</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Human memory fades after 3 sprints. FollowThrough remembers every architectural decision and alerts you if new discussions contradict past agreements.
            </p>
          </div>

          <div className="rounded-2xl border border-[#2B2B2B] bg-[#141414] p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#BFD8E3]">
              <span>03 // PREEMPTIVE RADAR</span>
            </div>
            <h3 className="text-sm font-bold text-white">Proactive Collision Defense</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Catches double-booked owners, missing task leads, and overlapping milestones while the meeting is still happening, rather than weeks down the line.
            </p>
          </div>

          <div className="rounded-2xl border border-[#2B2B2B] bg-[#141414] p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
              <span>04 // ENTERPRISE SAFETY</span>
            </div>
            <h3 className="text-sm font-bold text-white">Zero Blind Writes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unlike black-box agents that write directly to Jira or Slack, FollowThrough requires human sign-off on every action item, keeping you in full command.
            </p>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE DEMO SCENARIOS BENCHMARK */}
      <section className="rounded-3xl border border-[#00638E]/40 bg-[#141414] p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#00638E] animate-ping" />
              <h2 className="text-lg font-bold text-white">Pre-Calibrated Benchmark Scenarios</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Test FollowThrough with these edge-case scenarios, or paste your own real meeting transcript.
            </p>
          </div>
          <Link
            href="/meetings/new"
            className="text-xs font-bold text-[#BFD8E3] hover:text-white flex items-center gap-1.5"
          >
            <span>Open Ingestion Studio</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SAMPLE_MEETINGS.map((sample) => (
            <div
              key={sample.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#2B2B2B] bg-[#000000]/70 p-5 transition-all hover:border-[#00638E] hover:bg-[#141414] shadow-md hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-mono font-medium text-slate-400">{sample.category}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                      sample.badgeColor === "rose"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : sample.badgeColor === "amber"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-[#00638E]/20 text-[#BFD8E3] border-[#00638E]/40"
                    }`}
                  >
                    {sample.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                  {sample.title}
                </h3>
                <p className="mt-1.5 text-xs text-slate-400 line-clamp-2">{sample.description}</p>
                <div className="mt-3.5 space-y-1.5">
                  {sample.expectedHighlights.slice(0, 2).map((h, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                      <span className="text-[#00638E] mt-0.5 font-bold">•</span>
                      <span className="line-clamp-1">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 pt-3.5 border-t border-[#2B2B2B]">
                <Link
                  href={`/meetings/new?sample=${sample.id}`}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#141414] border border-[#2B2B2B] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#00638E] hover:text-white hover:border-[#00638E] transition-all"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>Load Scenario</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. WORKSPACE STATUS & LIVE CONFLICT RADAR */}
      <section className="space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#2B2B2B] bg-[#141414] p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Org Execution Score</span>
              <TrendingUp className="h-4 w-4 text-[#8CB9CC]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{avgExecutionScore}</span>
              <span className="text-xs text-slate-400">/ 100</span>
              <span className="ml-auto rounded-md bg-[#00638E]/20 px-2 py-0.5 text-xs font-medium text-[#BFD8E3] border border-[#00638E]/40">
                {executedMeetings.length > 0 ? "Active Sprint" : "Pristine State"}
              </span>
            </div>
            <div className="mt-3 w-full bg-[#000000] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#004A6B] via-[#00638E] to-[#8CB9CC] h-full rounded-full transition-all duration-1000"
                style={{ width: `${avgExecutionScore}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-400">Clarity & ownership completeness</p>
          </div>

          <div className="rounded-2xl border border-[#2B2B2B] bg-[#141414] p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Conflict Radar Alerts</span>
              <ShieldAlert className="h-4 w-4 text-rose-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{activeConflicts.length}</span>
              {criticalConflicts.length > 0 ? (
                <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
                  {criticalConflicts.length} Critical
                </span>
              ) : (
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                  Clear
                </span>
              )}
            </div>
            <p className="mt-4 text-[11px] text-slate-400">Collisions against historical ADRs</p>
          </div>

          <div className="rounded-2xl border border-[#2B2B2B] bg-[#141414] p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Tracked Deliverables</span>
              <CheckCircle2 className="h-4 w-4 text-[#00638E]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{openTasks.length}</span>
              <span className="text-xs text-slate-400">Active Tasks</span>
              {overdueTasks.length > 0 && (
                <span className="ml-auto rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/20">
                  {overdueTasks.length} Overdue
                </span>
              )}
            </div>
            <p className="mt-4 text-[11px] text-slate-400">Directly mapped to ratified decisions</p>
          </div>

          <div className="rounded-2xl border border-[#2B2B2B] bg-[#141414] p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Team Member Digests</span>
              <Users className="h-4 w-4 text-[#BFD8E3]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{digests.length}</span>
              <span className="text-xs text-slate-400">Active Members</span>
              <span className="ml-auto rounded-md bg-[#00638E]/20 px-2 py-0.5 text-xs font-medium text-[#BFD8E3] border border-[#00638E]/40">
                Live Sync
              </span>
            </div>
            <p className="mt-4 text-[11px] text-slate-400">Tailored priorities & conflict heads-up</p>
          </div>
        </div>

        {/* Two-column Recent Meetings + Conflict Radar Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="h-4 w-4 text-[#00638E]" />
                <span>Recent Meetings & Agent Status</span>
              </h3>
              <Link
                href="/meetings/new"
                className="text-xs font-semibold text-[#BFD8E3] hover:underline flex items-center gap-1"
              >
                <span>Ingest New</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {meetings.length === 0 ? (
                <div className="rounded-2xl border border-[#2B2B2B] bg-[#141414] p-8 text-center text-xs text-slate-400">
                  <CheckCircle2 className="mx-auto h-9 w-9 text-[#00638E] mb-2.5" />
                  <p className="font-bold text-white text-sm">No Meetings Ingested Yet</p>
                  <p className="mt-1.5 max-w-sm mx-auto text-slate-400 leading-relaxed">
                    Your workspace is clean. Ingest your first real meeting transcript or click any scenario above to watch the agent analyze decisions.
                  </p>
                  <Link
                    href="/meetings/new"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#00638E] px-4 py-2 text-xs font-bold text-white hover:bg-[#0077ab] transition-all shadow-md"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Ingest Real Meeting</span>
                  </Link>
                </div>
              ) : (
                meetings.map((meeting) => (
                  <Link
                    key={meeting.id}
                    href={`/meetings/${meeting.id}`}
                    className="block group rounded-2xl border border-[#2B2B2B] bg-[#141414] p-4 transition-all hover:border-[#00638E] hover:bg-[#1a1a1a]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white group-hover:text-[#BFD8E3] transition-colors">
                            {meeting.title}
                          </h4>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider border ${
                              meeting.status === "executed"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : meeting.status === "pending_review"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                                : "bg-[#2B2B2B] text-slate-300 border-[#383838]"
                            }`}
                          >
                            {meeting.status === "executed"
                              ? "CONFIRMED & EXECUTED"
                              : meeting.status === "pending_review"
                              ? "AWAITING HUMAN APPROVAL"
                              : "DRAFT"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {meeting.summary || "Transcript ingested. Ready for agent processing."}
                        </p>
                        <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                          <span>{new Date(meeting.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Source: {meeting.source_type}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <div className="flex items-center gap-1.5 rounded-xl border border-[#2B2B2B] bg-[#000000] px-2.5 py-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Score</span>
                          <span
                            className={`text-sm font-extrabold ${
                              meeting.execution_score >= 85
                                ? "text-emerald-400"
                                : meeting.execution_score >= 70
                                ? "text-amber-400"
                                : "text-rose-400"
                            }`}
                          >
                            {meeting.execution_score || "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-[#BFD8E3]" />
                <span>Conflict Radar Feed</span>
              </h3>
              <span className="text-xs text-slate-400">{conflicts.length} Total</span>
            </div>

            <div className="space-y-3">
              {conflicts.length === 0 ? (
                <div className="rounded-2xl border border-[#2B2B2B] bg-[#141414] p-6 text-center text-xs text-slate-400">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400/60 mb-2" />
                  <p className="font-bold text-slate-300">No Active Conflicts</p>
                  <p className="mt-1 text-slate-400">
                    The Conflict Radar is actively monitoring memory. Contradictions or colliding deadlines will be highlighted here in real time.
                  </p>
                </div>
              ) : (
                conflicts.slice(0, 4).map((conflict) => (
                  <div
                    key={conflict.id}
                    className={`rounded-2xl border p-4 space-y-2 transition-all ${
                      conflict.severity === "CRITICAL"
                        ? "border-rose-500/30 bg-rose-950/20"
                        : conflict.severity === "HIGH"
                        ? "border-amber-500/30 bg-amber-950/20"
                        : "border-[#2B2B2B] bg-[#141414]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          conflict.severity === "CRITICAL"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : conflict.severity === "HIGH"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-[#2B2B2B] text-slate-300"
                        }`}
                      >
                        {conflict.severity} • {conflict.conflict_type.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {conflict.resolved ? "Resolved" : "Attention Required"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {conflict.explanation}
                    </p>

                    <div className="rounded-xl bg-[#000000] p-2.5 text-[11px] text-slate-400 border border-[#2B2B2B]">
                      <strong className="text-slate-300 font-semibold">Recommendation: </strong>
                      {conflict.recommendation}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 7. REVIEW SECTION */}
      <section className="space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00638E]/40 bg-[#00638E]/10 px-3 py-1 text-xs font-semibold text-[#BFD8E3]">
            <Star className="h-3.5 w-3.5 fill-[#BFD8E3]" />
            <span>Social Proof & Testimonials</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Loved by Engineering & Product Teams
          </h2>
          <p className="text-sm text-slate-400">
            See how teams use FollowThrough to eliminate lost consensus and enforce seamless follow-through.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#2B2B2B] bg-[#141414] p-6 flex flex-col justify-between space-y-4 shadow-lg hover:border-[#00638E] transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#8CB9CC]">
                  {Array.from({ length: r.stars }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">“{r.content}”</p>
              </div>

              <div className="pt-4 border-t border-[#2B2B2B] flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#00638E]/30 text-[#BFD8E3] font-bold text-xs flex items-center justify-center border border-[#00638E]/50">
                  {r.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{r.name}</h4>
                  <p className="text-[11px] text-slate-400">{r.role} • {r.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section id="faq" className="space-y-6 scroll-mt-20 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2B2B2B] bg-[#141414] px-3 py-1 text-xs font-semibold text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-[#00638E]" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Confidently Move Forward with Smart Answers
          </h2>
          <p className="text-sm text-slate-400">
            Everything you need to know about FollowThrough’s agentic pipeline and decision memory.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#2B2B2B] bg-[#141414] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-white hover:text-[#BFD8E3] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#00638E] transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-[#2B2B2B]/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. CTA SECTION (Branding Gradient) */}
      <section className="relative overflow-hidden rounded-3xl border border-[#00638E]/50 bg-gradient-to-r from-[#000000] via-[#004A6B] to-[#00638E] p-8 sm:p-12 text-center text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-mono font-bold tracking-wider text-[#BFD8E3] uppercase border border-white/20">
            START EXECUTING TODAY
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Turn Your Next Meeting Into Verified Results
          </h2>
          <p className="text-sm text-slate-200 leading-relaxed">
            Stop losing consensus to meeting amnesia. Paste your transcript, let the Conflict Radar inspect past organizational memory, and confirm actionable tasks in under 60 seconds.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/meetings/new"
              className="flex items-center gap-2 rounded-xl bg-white text-[#004A6B] hover:bg-[#BFD8E3] px-6 py-3.5 text-xs font-bold transition-all shadow-lg active:scale-95"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Ingest Meeting Transcript</span>
            </Link>
            <Link
              href="/tasks"
              className="flex items-center gap-2 rounded-xl border border-white/30 bg-black/40 hover:bg-black/60 px-6 py-3.5 text-xs font-semibold text-white transition-all"
            >
              <span>Explore Task Board</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 10. FOOTER WITH MEETING SKETCH MANIFESTO */}
      <FooterManifesto />
    </div>
  );
}
