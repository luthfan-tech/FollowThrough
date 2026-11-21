"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Database,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  User,
  ExternalLink,
  Plus,
  ShieldCheck,
  History,
  AlertTriangle,
} from "lucide-react";
import { Decision, Conflict } from "@/lib/types";

export default function DecisionMemoryPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [search, setSearch] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Manual Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newText, setNewText] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [newContext, setNewContext] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [decRes, confRes] = await Promise.all([
          fetch("/api/memory"),
          fetch("/api/tasks"), // to verify
        ]);
        const decData = await decRes.json();
        setDecisions(decData.decisions || []);

        // Also fetch active meetings to extract conflicts
        const meetRes = await fetch("/api/meetings");
        const meetData = await meetRes.json();
        const allConflicts: Conflict[] = [];
        for (const m of (meetData.meetings || []).slice(0, 5)) {
          const detRes = await fetch(`/api/meetings/${m.id}`);
          const detData = await detRes.json();
          if (detData.meeting?.conflicts) {
            allConflicts.push(...detData.meeting.conflicts);
          }
        }
        setConflicts(allConflicts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    try {
      const res = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision_text: newText.trim(),
          owner: newOwner.trim() || "Organization",
          context: newContext.trim() || "Manual Architectural Record",
          meeting_title: "Organizational ADR Direct Entry",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDecisions((prev) => [data.decision, ...prev]);
        setShowAddModal(false);
        setNewText("");
        setNewOwner("");
        setNewContext("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const owners = Array.from(new Set(decisions.map((d) => d.owner || "Organization")));

  const filteredDecisions = decisions.filter((d) => {
    const matchesSearch =
      d.decision_text.toLowerCase().includes(search.toLowerCase()) ||
      (d.context && d.context.toLowerCase().includes(search.toLowerCase())) ||
      (d.meeting_title && d.meeting_title.toLowerCase().includes(search.toLowerCase()));

    const matchesOwner = selectedOwner === "ALL" || (d.owner || "Organization") === selectedOwner;
    return matchesSearch && matchesOwner;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-400 mb-2">
            <Database className="h-3.5 w-3.5" />
            <span>Persistent Organizational Memory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Organizational Decision Memory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Every ratified decision, architectural policy, and commitment is indexed here.
            The Conflict Radar queries this repository during every new meeting to stop contradictions before they happen.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Architectural Policy (ADR)</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search decisions, policies, technologies (e.g. Supabase, iOS 15, Google Ads)..."
            className="w-full rounded-lg border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            <span>Owner:</span>
          </div>
          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Owners ({decisions.length})</option>
            {owners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Decisions Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading decision repository...</div>
        ) : filteredDecisions.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-xs text-slate-400">
            No decisions found matching your filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDecisions.map((decision) => {
              // Check if any active conflicts reference this decision
              const relatedConflicts = conflicts.filter(
                (c) => c.previous_decision_id === decision.id || (c.previous_decision_text && c.previous_decision_text === decision.decision_text)
              );

              return (
                <div
                  key={decision.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3 transition-all hover:border-slate-700 hover:bg-slate-900/80 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                        RATIFIED DECISION
                      </span>
                      {relatedConflicts.length > 0 && (
                        <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/20">
                          Challenged in Recent Meeting
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-white leading-snug">
                      {decision.decision_text}
                    </h3>
                    {decision.context && (
                      <p className="text-xs text-slate-400 leading-relaxed">{decision.context}</p>
                    )}
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-300 font-medium">
                        <User className="h-3 w-3 text-indigo-400" />
                        {decision.owner || "Organization"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        {new Date(decision.decision_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Source: {decision.meeting_title || "ADR-24"}</span>
                      <span className="font-mono">ID: {decision.id}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual ADR Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl animate-fade-in">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-indigo-400" />
              <span>Record Architectural Policy / Decision</span>
            </h2>
            <p className="text-xs text-slate-400">
              Directly persist an organizational decision into memory so the Conflict Radar can enforce it during meetings.
            </p>

            <form onSubmit={handleCreateDecision} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Decision Statement</label>
                <textarea
                  rows={3}
                  required
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="e.g. PostgreSQL + Supabase chosen as unified identity stack; any change requires architecture review."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Responsible Owner / Sponsor</label>
                <input
                  type="text"
                  required
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  placeholder="e.g. Elena Vance (VP of Engineering)"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Context / Rationale</label>
                <input
                  type="text"
                  value={newContext}
                  onChange={(e) => setNewContext(e.target.value)}
                  placeholder="e.g. Mandated in ADR-24 to maintain SOC2 security standards."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg px-3 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-all"
                >
                  Commit to Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
