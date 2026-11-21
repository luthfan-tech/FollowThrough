"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Play,
  Calendar,
  Layers,
  Sparkles,
  Users,
  Compass,
  Plus,
  ChevronDown,
  Database,
  UserCheck,
} from "lucide-react";
import { Meeting, Conflict, ActionItem, WeeklyDigest } from "@/lib/types";
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-16 animate-fade-in text-white">
      {/* 1. HERO SECTION (FollowThrough Typography Banner + 5-Stage Clothesline Cards) */}
      <div className="space-y-8">
        <HeroTypography />
        <HeroClotheslineCards />
      </div>

      {/* 2. FEATURES SECTION (Bento Grid) */}
      <section id="features" className="space-y-6 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00638E]/40 bg-[#00638E]/10 px-3 py-1 text-xs font-semibold text-[#BFD8E3]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Core Capabilities</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How FollowThrough Operates
          </h2>
          <p className="text-sm text-slate-400">
            Engineered from the ground up to turn raw conversation into verified, trackable work.
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
                Speaker Diarization
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Attributes every statement to distinct speakers with confidence scoring. Strips filler words and casual banter so only ratified commitments survive.
              </p>
            </div>
            <div className="pt-3 border-t border-[#2B2B2B] text-[11px] font-mono text-[#8CB9CC]">
              Automated Attribution
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
                Maintains an organizational memory across past meetings. Retains context, owner, effective date, and architectural policies across sprints.
              </p>
            </div>
            <div className="pt-3 border-t border-[#2B2B2B] text-[11px] font-mono text-[#BFD8E3]">
              Cross-Meeting Retrieval
            </div>
          </div>

          {/* Feature 3: Conflict Radar */}
          <div className="group rounded-2xl border border-[#2B2B2B] bg-[#141414] p-6 space-y-4 hover:border-[#00638E] transition-all hover:shadow-xl hover:shadow-[#00638E]/10 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                Conflict Radar
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Flags contradictions against previous decisions, unfeasible deadlines, duplicate work, and missing owners. Assigns severity from Low to Critical.
              </p>
            </div>
            <div className="pt-3 border-t border-[#2B2B2B] text-[11px] font-mono text-rose-400">
              Severity Classification
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
                Zero autonomous writes without human sign-off. Review, edit, approve, or reject proposed tasks and reminders before anything is created.
              </p>
            </div>
            <div className="pt-3 border-t border-[#2B2B2B] text-[11px] font-mono text-emerald-400">
              Human-in-the-Loop
            </div>
          </div>
        </div>
      </section>

      {/* 3. WORKSPACE STATUS & LIVE CONFLICT RADAR */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Live Workspace Status
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Active metrics across all ingested meetings and tracked tasks.
            </p>
          </div>
          <Link
            href="/meetings/new"
            className="flex items-center gap-1.5 rounded-xl bg-[#00638E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0077ab] transition-all shadow-md shadow-[#00638E]/20"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Ingest Meeting</span>
          </Link>
        </div>

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
                {executedMeetings.length > 0 ? "Active Sprint" : "Clean State"}
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
                    Your workspace is clean. Ingest your first real meeting transcript to extract decisions, check historical conflicts, and track tasks.
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

      {/* 4. TECHNICAL FAQ SECTION */}
      <section id="faq" className="space-y-6 scroll-mt-20 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2B2B2B] bg-[#141414] px-3 py-1 text-xs font-semibold text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-[#00638E]" />
            <span>Technical Reference</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-400">
            How FollowThrough’s agentic pipeline, conflict radar, and decision memory operate.
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

      {/* 5. DIRECT CTA SECTION (Dark Azure Gradient) */}
      <section className="relative overflow-hidden rounded-3xl border border-[#00638E]/50 bg-gradient-to-r from-[#000000] via-[#004A6B] to-[#00638E] p-8 sm:p-12 text-center text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-mono font-bold tracking-wider text-[#BFD8E3] uppercase border border-white/20">
            EXECUTION PIPELINE
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Turn Your Next Meeting Into Verified Tasks
          </h2>
          <p className="text-sm text-slate-200 leading-relaxed">
            Paste your transcript, inspect detected conflicts against organizational memory, and confirm actionable deliverables.
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

      {/* 6. FOOTER WITH MEETING SKETCH MANIFESTO */}
      <FooterManifesto />
    </div>
  );
}
