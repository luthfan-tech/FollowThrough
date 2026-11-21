"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  User,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  Send,
  Database,
  Layers,
} from "lucide-react";
import { WeeklyDigest } from "@/lib/types";

export default function WeeklyDigestPage() {
  const [digests, setDigests] = useState<WeeklyDigest[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    loadDigests();
  }, []);

  const loadDigests = async () => {
    try {
      const res = await fetch("/api/digest");
      const data = await res.json();
      const list: WeeklyDigest[] = data.digests || [];
      setDigests(list);
      if (list.length > 0 && !selectedPerson) {
        setSelectedPerson(list[0].person);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch("/api/digest", { method: "POST" });
      const data = await res.json();
      setDigests(data.digests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const currentDigest = digests.find(
    (d) => d.person.toLowerCase() === selectedPerson.toLowerCase()
  ) || digests[0];

  const handleCopyMarkdown = () => {
    if (!currentDigest) return;

    let md = `# 📋 Weekly Execution Digest: ${currentDigest.person}\n\n`;
    md += `*Week of ${new Date(currentDigest.week_start).toLocaleDateString()}*\n\n`;
    md += `> **Summary**: ${currentDigest.summary}\n\n`;

    if (currentDigest.overdue_tasks.length > 0) {
      md += `### ⚠️ Overdue Deliverables\n`;
      currentDigest.overdue_tasks.forEach((t) => {
        md += `- [ ] **${t.title}** (Due: ${new Date(t.due_date).toLocaleDateString()} | Priority: ${t.priority})\n`;
      });
      md += `\n`;
    }

    if (currentDigest.conflicts_requiring_attention.length > 0) {
      md += `### 🚨 Conflicts Requiring Attention\n`;
      currentDigest.conflicts_requiring_attention.forEach((c) => {
        md += `- **[${c.severity}]** ${c.explanation}\n  *Recommendation:* ${c.recommendation}\n`;
      });
      md += `\n`;
    }

    md += `### 📅 Deliverables Due This Week (${currentDigest.tasks_due.length})\n`;
    if (currentDigest.tasks_due.length === 0) {
      md += `_No deliverables due this week._\n\n`;
    } else {
      currentDigest.tasks_due.forEach((t) => {
        md += `- [ ] **${t.title}** (Due: ${new Date(t.due_date).toLocaleDateString()} | Priority: ${t.priority})\n`;
      });
      md += `\n`;
    }

    if (currentDigest.decisions_affecting_them.length > 0) {
      md += `### 🏛️ Ratified Decisions Affecting You\n`;
      currentDigest.decisions_affecting_them.forEach((d) => {
        md += `- **${d.decision_text}** *(Source: ${d.meeting_title})*\n`;
      });
      md += `\n`;
    }

    md += `*Generated automatically by FollowThrough Agent*`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-400 mb-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>Per-Person Execution Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Weekly Execution Digest
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Synthesizes pending tasks, overdue blockers, newly ratified decisions, and Conflict Radar warnings tailored to each team member.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>Regenerate Digests</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? "Copied Markdown!" : "Copy for Slack / Email"}</span>
          </button>
        </div>
      </div>

      {/* Person Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {digests.map((d) => {
          const isSelected = selectedPerson.toLowerCase() === d.person.toLowerCase();
          const hasOverdue = d.overdue_tasks.length > 0;
          const hasConflicts = d.conflicts_requiring_attention.length > 0;

          return (
            <button
              key={d.id}
              onClick={() => setSelectedPerson(d.person)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                  : "bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>{d.person}</span>
              {(hasOverdue || hasConflicts) && (
                <span
                  className={`h-2 w-2 rounded-full ${
                    hasConflicts ? "bg-rose-400 animate-ping" : "bg-amber-400"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Current Digest Display */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading personalized digests...</div>
      ) : !currentDigest ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-xs text-slate-400">
          No digests available. Ingest a meeting to generate team digests.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 lg:p-8 space-y-6 backdrop-blur-sm">
          {/* Digest Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-[11px] font-mono text-purple-400 font-bold uppercase tracking-wider">
                PERSONALIZED BRIEFING
              </span>
              <h2 className="text-xl font-bold text-white mt-1">{currentDigest.person}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Week of {new Date(currentDigest.week_start).toLocaleDateString()}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2 text-xs text-slate-300 max-w-md">
              <strong className="text-indigo-300 font-semibold">Pulse: </strong>
              {currentDigest.summary}
            </div>
          </div>

          {/* Overdue Alerts if any */}
          {currentDigest.overdue_tasks.length > 0 && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4" />
                <span>Overdue Action Items ({currentDigest.overdue_tasks.length})</span>
              </div>
              <div className="space-y-1.5">
                {currentDigest.overdue_tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-slate-950/80 p-2.5 text-xs text-slate-200 border border-rose-500/20"
                  >
                    <span className="font-semibold text-rose-200">{task.title}</span>
                    <span className="text-[11px] text-rose-400 font-mono">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conflicts Requiring Attention if any */}
          {currentDigest.conflicts_requiring_attention.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <ShieldAlert className="h-4 w-4" />
                <span>Active Conflicts Involving Your Domain</span>
              </div>
              <div className="space-y-2">
                {currentDigest.conflicts_requiring_attention.map((conf) => (
                  <div
                    key={conf.id}
                    className="rounded-lg bg-slate-950/80 p-3 text-xs text-slate-200 border border-amber-500/20 space-y-1"
                  >
                    <p className="font-semibold text-amber-200">{conf.explanation}</p>
                    <p className="text-[11px] text-slate-400">
                      <strong className="text-slate-300">Action: </strong>
                      {conf.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Two-Column Grid: Tasks Due & Decisions Affecting You */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deliverables Due This Week */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                <span>Deliverables Due This Week ({currentDigest.tasks_due.length})</span>
              </h3>

              {currentDigest.tasks_due.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-xs text-slate-400">
                  No pending deliverables due this week.
                </div>
              ) : (
                <div className="space-y-2">
                  {currentDigest.tasks_due.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-1.5 transition-all hover:border-slate-700"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white">{task.title}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                            task.priority === "CRITICAL"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        <span className="text-indigo-400 font-semibold">{task.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ratified Decisions Affecting You */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-purple-400" />
                <span>Ratified Decisions Involving You ({currentDigest.decisions_affecting_them.length})</span>
              </h3>

              {currentDigest.decisions_affecting_them.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-xs text-slate-400">
                  No direct decision dependencies recorded.
                </div>
              ) : (
                <div className="space-y-2">
                  {currentDigest.decisions_affecting_them.map((dec) => (
                    <div
                      key={dec.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-1 transition-all hover:border-slate-700"
                    >
                      <p className="text-xs font-semibold text-slate-200 leading-snug">
                        {dec.decision_text}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Source: {dec.meeting_title}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
