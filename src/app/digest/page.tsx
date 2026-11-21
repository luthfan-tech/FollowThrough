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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 border border-sky-200 px-3.5 py-1 text-xs sm:text-sm font-bold text-[#00638E] mb-2">
            <Calendar className="h-4 w-4" />
            <span>Per-Person Execution Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Weekly Execution Digest
          </h1>
          <p className="text-base sm:text-lg text-slate-700 font-medium mt-1 max-w-4xl">
            Synthesizes pending tasks, overdue blockers, newly ratified decisions, and Conflict Radar warnings tailored to each team member.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors shadow-sm flex-1 sm:flex-initial"
          >
            <RotateCcw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>Regenerate Digests</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#00638E] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#004A6B] transition-all shadow-sm flex-1 sm:flex-initial"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? "Copied!" : "Copy for Slack"}</span>
          </button>
        </div>
      </div>

      {/* Person Selection Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-3 border-b border-slate-200">
        {digests.map((d) => {
          const isSelected = selectedPerson.toLowerCase() === d.person.toLowerCase();
          const hasOverdue = d.overdue_tasks.length > 0;
          const hasConflicts = d.conflicts_requiring_attention.length > 0;

          return (
            <button
              key={d.id}
              onClick={() => setSelectedPerson(d.person)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-[#00638E] text-white shadow-sm"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
              }`}
            >
              <User className="h-4 w-4" />
              <span>{d.person}</span>
              {(hasOverdue || hasConflicts) && (
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    hasConflicts ? "bg-rose-500 animate-ping" : "bg-amber-500"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Current Digest Display */}
      {loading ? (
        <div className="py-16 text-center text-sm font-semibold text-slate-600">Loading personalized digests...</div>
      ) : !currentDigest ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-12 text-center text-sm text-slate-600 font-medium">
          No digests available. Ingest a meeting to generate team digests.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Digest Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <span className="text-xs font-mono text-[#00638E] font-extrabold uppercase tracking-wider">
                PERSONALIZED BRIEFING
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">{currentDigest.person}</h2>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                Week of {new Date(currentDigest.week_start).toLocaleDateString()}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-800 max-w-lg leading-relaxed">
              <strong className="text-[#004A6B] font-extrabold">Pulse: </strong>
              <span>{currentDigest.summary}</span>
            </div>
          </div>

          {/* Overdue Alerts if any */}
          {currentDigest.overdue_tasks.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-sm font-extrabold text-rose-700 uppercase tracking-wider">
                <AlertTriangle className="h-5 w-5" />
                <span>Overdue Action Items ({currentDigest.overdue_tasks.length})</span>
              </div>
              <div className="space-y-2">
                {currentDigest.overdue_tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-white p-3 text-sm text-slate-900 border border-rose-200 shadow-xs"
                  >
                    <span className="font-bold text-rose-800">{task.title}</span>
                    <span className="text-xs text-rose-600 font-mono font-bold">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conflicts Requiring Attention if any */}
          {currentDigest.conflicts_requiring_attention.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-sm font-extrabold text-amber-800 uppercase tracking-wider">
                <ShieldAlert className="h-5 w-5" />
                <span>Active Conflicts Involving Your Domain</span>
              </div>
              <div className="space-y-2.5">
                {currentDigest.conflicts_requiring_attention.map((conf) => (
                  <div
                    key={conf.id}
                    className="rounded-lg bg-white p-3.5 text-sm text-slate-900 border border-amber-200 space-y-1.5 shadow-xs"
                  >
                    <p className="font-bold text-amber-900">{conf.explanation}</p>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                      <strong className="text-slate-900 font-bold">Action: </strong>
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
            <div className="space-y-3.5">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#00638E]" />
                <span>Deliverables Due This Week ({currentDigest.tasks_due.length})</span>
              </h3>

              {currentDigest.tasks_due.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 font-medium">
                  No pending deliverables due this week.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {currentDigest.tasks_due.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 transition-all hover:border-slate-300 hover:bg-white shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900">{task.title}</span>
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-extrabold uppercase ${
                            task.priority === "CRITICAL"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-sky-100 text-[#00638E] border border-sky-200"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600 font-mono font-medium">
                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        <span className="text-[#00638E] font-bold">{task.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ratified Decisions Affecting You */}
            <div className="space-y-3.5">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Database className="h-4 w-4 text-[#00638E]" />
                <span>Ratified Decisions Involving You ({currentDigest.decisions_affecting_them.length})</span>
              </h3>

              {currentDigest.decisions_affecting_them.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 font-medium">
                  No direct decision dependencies recorded.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {currentDigest.decisions_affecting_them.map((dec) => (
                    <div
                      key={dec.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1.5 transition-all hover:border-slate-300 hover:bg-white shadow-xs"
                    >
                      <p className="text-sm font-bold text-slate-900 leading-snug">
                        {dec.decision_text}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
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
