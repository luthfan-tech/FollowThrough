"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12 animate-fade-in">
      {/* 1. Custom Retro-Funk "FA FA FA" Hero Typography Banner */}
      <HeroTypography />

      {/* 2. Clothesline Execution Cards (Altered from Astro design to avoid copyright) */}
      <HeroClotheslineCards />

      {/* 3. KPI Metrics Dashboard Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Org Execution Score */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Org Execution Score</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{avgExecutionScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
            <span className="ml-auto rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
              {executedMeetings.length > 0 ? "Healthy Pace" : "Clean State"}
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 via-[#2A8082] to-[#E06D53] h-full rounded-full transition-all duration-1000"
              style={{ width: `${avgExecutionScore}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Clarity, ownership completeness & deadline rigor
          </p>
        </div>

        {/* KPI 2: Active Conflicts Detected */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Conflict Radar Alerts</span>
            <ShieldAlert className="h-4 w-4 text-[#E06D53]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{activeConflicts.length}</span>
            {criticalConflicts.length > 0 ? (
              <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
                {criticalConflicts.length} Critical
              </span>
            ) : (
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                All Clear
              </span>
            )}
          </div>
          <p className="mt-4 text-[11px] text-slate-400">
            Contradictions against historical ADR memory
          </p>
        </div>

        {/* KPI 3: Open Deliverables */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Tracked Deliverables</span>
            <CheckCircle2 className="h-4 w-4 text-[#2A8082]" />
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
          <p className="mt-4 text-[11px] text-slate-400">
            Directly mapped to ratified meeting decisions
          </p>
        </div>

        {/* KPI 4: Weekly Digests */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Team Member Digests</span>
            <Users className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{digests.length}</span>
            <span className="text-xs text-slate-400">Active Members</span>
            <span className="ml-auto rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-400 border border-purple-500/20">
              Live Sync
            </span>
          </div>
          <p className="mt-4 text-[11px] text-slate-400">
            Personalized weekly priorities & conflict alerts
          </p>
        </div>
      </div>

      {/* 4. Demo Quick Launcher Showcase */}
      <div className="rounded-3xl border border-[#2A8082]/30 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#E06D53] animate-ping" />
              <h2 className="text-lg font-bold text-white">Pre-Calibrated Benchmark Scenarios</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Test FollowThrough with these edge-case scenarios, or paste your own real meeting transcript.
            </p>
          </div>
          <Link
            href="/meetings/new"
            className="text-xs font-bold text-[#E06D53] hover:text-[#e57d65] flex items-center gap-1.5"
          >
            <span>Open Ingestion Studio</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SAMPLE_MEETINGS.map((sample) => (
            <div
              key={sample.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-5 transition-all hover:border-[#E06D53]/50 hover:bg-slate-900/90 shadow-md hover:shadow-xl"
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
                        : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
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
                      <span className="text-[#E06D53] mt-0.5 font-bold">•</span>
                      <span className="line-clamp-1">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 pt-3.5 border-t border-slate-800/80">
                <Link
                  href={`/meetings/new?sample=${sample.id}`}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800/80 border border-slate-700/80 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#E06D53] hover:text-white hover:border-[#E06D53] transition-all"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>Load Scenario</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Main Content: Recent Meetings + Conflict Radar Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Meetings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="h-4 w-4 text-[#2A8082]" />
              <span>Recent Meetings & Agent Processing</span>
            </h2>
            <Link
              href="/meetings/new"
              className="text-xs font-semibold text-[#2A8082] hover:underline flex items-center gap-1"
            >
              <span>Ingest New</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {meetings.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="mx-auto h-9 w-9 text-[#2A8082]/60 mb-2.5" />
                <p className="font-bold text-slate-200 text-sm">No Meetings Ingested Yet</p>
                <p className="mt-1.5 max-w-sm mx-auto text-slate-400 leading-relaxed">
                  Your organizational memory is pristine. Ingest a transcript or load one of the benchmark scenarios above to watch the agent in action.
                </p>
                <Link
                  href="/meetings/new"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E06D53] to-[#2A8082] px-4 py-2 text-xs font-bold text-white hover:opacity-95 transition-all shadow-md"
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
                  className="block group rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition-all hover:border-slate-700 hover:bg-slate-900/90"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-200 group-hover:text-[#E06D53] transition-colors">
                          {meeting.title}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider border ${
                            meeting.status === "executed"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : meeting.status === "pending_review"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                              : "bg-slate-800 text-slate-300 border-slate-700"
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
                      <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/80 px-2.5 py-1">
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

        {/* Right Column: Conflict Radar Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-[#E06D53]" />
              <span>Conflict Radar Feed</span>
            </h2>
            <span className="text-xs text-slate-400">{conflicts.length} Total</span>
          </div>

          <div className="space-y-3">
            {conflicts.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center text-xs text-slate-400">
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
                      : "border-slate-800 bg-slate-900/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        conflict.severity === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : conflict.severity === "HIGH"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-slate-800 text-slate-300"
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

                  <div className="rounded-xl bg-slate-950/60 p-2.5 text-[11px] text-slate-400 border border-slate-800/80">
                    <strong className="text-slate-300 font-semibold">Recommendation: </strong>
                    {conflict.recommendation}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 6. Footer Section: The Meeting Sketch & Manifesto */}
      <FooterManifesto />
    </div>
  );
}
