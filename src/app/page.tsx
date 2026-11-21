"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Compass,
  Database,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Play,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  ChevronDown,
  Layers,
  Users,
  UserCheck,
} from "lucide-react";
import { Meeting, Conflict, ActionItem, WeeklyDigest } from "@/lib/types";
import { HeroTypography } from "@/components/HeroTypography";
import { HeroClotheslineCards } from "@/components/HeroClotheslineCards";
import { FooterManifesto } from "@/components/FooterManifesto";
import { BuyMeACoffee } from "@/components/BuyMeACoffee";

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

  // Technical FAQ items
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-16 animate-fade-in text-slate-900 bg-white">
      {/* 1. HERO SECTION (FollowThrough Typography Banner + 5-Stage Clothesline Cards) */}
      <div className="space-y-8">
        <HeroTypography />
        <HeroClotheslineCards />
      </div>

      {/* 2. FEATURES SECTION (Bento Grid) */}
      <section id="features" className="space-y-6 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00638E]/30 bg-[#00638E]/10 px-3 py-1 text-xs sm:text-sm font-bold text-[#00638E]">
            <Sparkles className="h-4 w-4" />
            <span>Core Capabilities</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How FollowThrough Operates
          </h2>
          <p className="text-base sm:text-lg text-slate-700 font-medium">
            Engineered from the ground up to turn raw conversation into verified, trackable work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1: Speaker Diarization */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 space-y-4 hover:border-[#00638E] transition-all hover:shadow-lg flex flex-col justify-between shadow-sm">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00638E]/10 text-[#00638E] border border-[#00638E]/20">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#00638E] transition-colors">
                Speaker Diarization
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                Attributes every statement to distinct speakers with confidence scoring. Strips filler words and casual banter so only ratified commitments survive.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs font-mono text-[#00638E] font-bold">
              Automated Attribution
            </div>
          </div>

          {/* Feature 2: Decision Memory */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 space-y-4 hover:border-[#00638E] transition-all hover:shadow-lg flex flex-col justify-between shadow-sm">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#004A6B]/10 text-[#004A6B] border border-[#004A6B]/20">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#00638E] transition-colors">
                Persistent Decision Memory
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                Maintains an organizational memory across past meetings. Retains context, owner, effective date, and architectural policies across sprints.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs font-mono text-[#004A6B] font-bold">
              Cross-Meeting Retrieval
            </div>
          </div>

          {/* Feature 3: Conflict Radar */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 space-y-4 hover:border-rose-400 transition-all hover:shadow-lg flex flex-col justify-between shadow-sm">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                Conflict Radar
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                Flags contradictions against previous decisions, unfeasible deadlines, duplicate work, and missing owners. Assigns severity from Low to Critical.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs font-mono text-rose-600 font-bold">
              Severity Classification
            </div>
          </div>

          {/* Feature 4: Human-in-the-Loop Confirmation */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 space-y-4 hover:border-emerald-400 transition-all hover:shadow-lg flex flex-col justify-between shadow-sm">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <UserCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Human Confirmation Gate
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                Zero autonomous writes without human sign-off. Review, edit, approve, or reject proposed tasks and reminders before anything is created.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs font-mono text-emerald-600 font-bold">
              Human-in-the-Loop
            </div>
          </div>
        </div>
      </section>

      {/* 3. WORKSPACE STATUS & LIVE CONFLICT RADAR */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Live Workspace Status
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
              Active metrics across all ingested meetings and tracked tasks.
            </p>
          </div>
          <Link
            href="/meetings/new"
            className="flex items-center gap-2 rounded-xl bg-[#00638E] hover:bg-[#004A6B] px-5 py-2.5 text-sm font-bold text-white transition-all shadow-md shadow-[#00638E]/20 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Ingest Meeting</span>
          </Link>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">Org Execution Score</span>
              <TrendingUp className="h-5 w-5 text-[#00638E]" />
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-4xl font-extrabold text-slate-900">{avgExecutionScore}</span>
              <span className="text-sm text-slate-500 font-medium">/ 100</span>
              <span className="ml-auto rounded-md bg-[#00638E]/10 px-2.5 py-0.5 text-xs font-bold text-[#00638E] border border-[#00638E]/20">
                {executedMeetings.length > 0 ? "Active Sprint" : "Clean State"}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#004A6B] to-[#00638E] h-full rounded-full transition-all duration-1000"
                style={{ width: `${avgExecutionScore}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 font-medium pt-1">Clarity & ownership completeness</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">Conflict Radar Alerts</span>
              <ShieldAlert className="h-5 w-5 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-4xl font-extrabold text-slate-900">{activeConflicts.length}</span>
              {criticalConflicts.length > 0 ? (
                <span className="rounded-md bg-rose-50 px-2.5 py-0.5 text-xs font-extrabold text-rose-700 border border-rose-200">
                  {criticalConflicts.length} Critical
                </span>
              ) : (
                <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 border border-emerald-200">
                  Clear
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 font-medium pt-3">Collisions against historical ADRs</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">Tracked Deliverables</span>
              <CheckCircle2 className="h-5 w-5 text-[#00638E]" />
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-4xl font-extrabold text-slate-900">{openTasks.length}</span>
              <span className="text-xs text-slate-600 font-semibold">Active Tasks</span>
              {overdueTasks.length > 0 && (
                <span className="ml-auto rounded-md bg-amber-50 px-2.5 py-0.5 text-xs font-extrabold text-amber-700 border border-amber-200">
                  {overdueTasks.length} Overdue
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 font-medium pt-3">Directly mapped to ratified decisions</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">Team Member Digests</span>
              <Users className="h-5 w-5 text-[#00638E]" />
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-4xl font-extrabold text-slate-900">{digests.length}</span>
              <span className="text-xs text-slate-600 font-semibold">Active Members</span>
              <span className="ml-auto rounded-md bg-[#00638E]/10 px-2.5 py-0.5 text-xs font-bold text-[#00638E] border border-[#00638E]/20">
                Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium pt-3">Tailored priorities & conflict heads-up</p>
          </div>
        </div>

        {/* Two-column Recent Meetings + Conflict Radar Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Compass className="h-5 w-5 text-[#00638E]" />
                <span>Recent Meetings & Agent Status</span>
              </h3>
              <Link
                href="/meetings/new"
                className="text-sm font-bold text-[#00638E] hover:underline flex items-center gap-1"
              >
                <span>Ingest New</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {meetings.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-8 text-center text-slate-600 shadow-sm space-y-3">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-[#00638E]" />
                  <p className="font-extrabold text-slate-900 text-base">No Meetings Ingested Yet</p>
                  <p className="max-w-md mx-auto text-sm text-slate-700 leading-relaxed font-medium">
                    Your workspace is clean. Ingest your first real meeting transcript to extract decisions, check historical conflicts, and track tasks.
                  </p>
                  <Link
                    href="/meetings/new"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#00638E] hover:bg-[#004A6B] px-5 py-2.5 text-sm font-bold text-white transition-all shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ingest Real Meeting</span>
                  </Link>
                </div>
              ) : (
                meetings.map((meeting) => (
                  <Link
                    key={meeting.id}
                    href={`/meetings/${meeting.id}`}
                    className="block group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-[#00638E] hover:shadow-md shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900 group-hover:text-[#00638E] transition-colors">
                            {meeting.title}
                          </h4>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider border ${
                              meeting.status === "executed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : meeting.status === "pending_review"
                                ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {meeting.status === "executed"
                              ? "CONFIRMED & EXECUTED"
                              : meeting.status === "pending_review"
                              ? "AWAITING HUMAN APPROVAL"
                              : "DRAFT"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed font-normal line-clamp-2">
                          {meeting.summary || "Transcript ingested. Ready for agent processing."}
                        </p>
                        <div className="flex items-center gap-3 pt-1 text-xs text-slate-600 font-medium">
                          <span>{new Date(meeting.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Source: {meeting.source_type}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5">
                          <span className="text-xs uppercase font-extrabold text-slate-600">Score</span>
                          <span
                            className={`text-base font-extrabold ${
                              meeting.execution_score >= 85
                                ? "text-emerald-600"
                                : meeting.execution_score >= 70
                                ? "text-amber-600"
                                : "text-rose-600"
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
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-[#00638E]" />
                <span>Conflict Radar Feed</span>
              </h3>
              <span className="text-xs sm:text-sm font-semibold text-slate-600">{conflicts.length} Total</span>
            </div>

            <div className="space-y-3">
              {conflicts.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 text-center text-slate-600 shadow-sm space-y-2">
                  <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-600" />
                  <p className="font-extrabold text-slate-900 text-base">No Active Conflicts</p>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    The Conflict Radar is actively monitoring memory. Contradictions or colliding deadlines will be highlighted here in real time.
                  </p>
                </div>
              ) : (
                conflicts.slice(0, 4).map((conflict) => (
                  <div
                    key={conflict.id}
                    className={`rounded-2xl border p-4 space-y-2.5 transition-all shadow-sm ${
                      conflict.severity === "CRITICAL"
                        ? "border-rose-200 bg-rose-50/60"
                        : conflict.severity === "HIGH"
                        ? "border-amber-200 bg-amber-50/60"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider ${
                          conflict.severity === "CRITICAL"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : conflict.severity === "HIGH"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {conflict.severity} • {conflict.conflict_type.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-slate-600 font-semibold">
                        {conflict.resolved ? "Resolved" : "Attention Required"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-900 leading-relaxed font-semibold">
                      {conflict.explanation}
                    </p>

                    <div className="rounded-xl bg-slate-50 p-3 text-xs sm:text-sm text-slate-700 border border-slate-200">
                      <strong className="text-slate-900 font-bold">Recommendation: </strong>
                      {conflict.recommendation}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. TECHNICAL FAQ SECTION */}
      <section id="faq" className="space-y-6 scroll-mt-24 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs sm:text-sm font-bold text-slate-800">
            <Sparkles className="h-4 w-4 text-[#00638E]" />
            <span>Technical Reference</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-slate-700 font-medium">
            How FollowThrough’s agentic pipeline, conflict radar, and decision memory operate.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left text-base sm:text-lg font-bold text-slate-900 hover:text-[#00638E] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#00638E] transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-sm sm:text-base text-slate-700 leading-relaxed border-t border-slate-100 pt-4 font-normal">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. DIRECT CTA SECTION (Dark Azure Gradient Banner) */}
      <section className="relative overflow-hidden rounded-3xl border border-[#00638E]/30 bg-gradient-to-r from-[#004A6B] via-[#00638E] to-[#0077AB] p-8 sm:p-14 text-center text-white shadow-xl">
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <span className="inline-block rounded-full bg-white/20 px-3.5 py-1 text-xs sm:text-sm font-mono font-bold tracking-wider text-white uppercase border border-white/25">
            EXECUTION PIPELINE
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Turn Your Next Meeting Into Verified Tasks
          </h2>
          <p className="text-base sm:text-lg text-slate-100 leading-relaxed font-medium">
            Paste your transcript, inspect detected conflicts against organizational memory, and confirm actionable deliverables.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/meetings/new"
              className="flex items-center gap-2 rounded-xl bg-white text-[#004A6B] hover:bg-slate-100 px-7 py-4 text-sm sm:text-base font-bold transition-all shadow-md active:scale-95"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Ingest Meeting Transcript</span>
            </Link>
            <Link
              href="/tasks"
              className="flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 hover:bg-white/20 px-7 py-4 text-sm sm:text-base font-semibold text-white transition-all shadow-sm"
            >
              <span>Explore Task Board</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. SUPPORT THE CREATOR - BUY ME A COFFEE */}
      <BuyMeACoffee />

      {/* 7. FOOTER WITH MEETING SKETCH MANIFESTO */}
      <FooterManifesto />
    </div>
  );
}
