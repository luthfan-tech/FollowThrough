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
          fetch("/api/tasks"),
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 border border-sky-200 px-3.5 py-1 text-xs sm:text-sm font-bold text-[#00638E] mb-2">
            <Database className="h-4 w-4" />
            <span>Persistent Organizational Memory</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Organizational Decision Memory
          </h1>
          <p className="text-base sm:text-lg text-slate-700 font-medium mt-1 max-w-4xl">
            Every ratified decision, architectural policy, and commitment is indexed here.
            The Conflict Radar queries this repository during every new meeting to stop contradictions before they happen.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#00638E] px-5 py-3 text-sm font-bold text-white hover:bg-[#004A6B] transition-all shadow-sm w-full sm:w-auto shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Architectural Policy (ADR)</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search decisions, policies, technologies (e.g. Supabase, iOS 15, Google Ads)..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50/70 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#00638E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00638E]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Filter className="h-4 w-4 text-[#00638E]" />
            <span>Owner:</span>
          </div>
          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#00638E] focus:outline-none"
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
          <div className="py-16 text-center text-sm font-semibold text-slate-600">Loading decision repository...</div>
        ) : filteredDecisions.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-12 text-center text-sm text-slate-600 font-medium">
            No decisions found matching your filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredDecisions.map((decision) => {
              // Check if any active conflicts reference this decision
              const relatedConflicts = conflicts.filter(
                (c) => c.previous_decision_id === decision.id || (c.previous_decision_text && c.previous_decision_text === decision.decision_text)
              );

              return (
                <div
                  key={decision.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-3.5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 border border-emerald-200">
                        RATIFIED DECISION
                      </span>
                      {relatedConflicts.length > 0 && (
                        <span className="rounded-md bg-rose-50 px-2.5 py-0.5 text-xs font-extrabold text-rose-700 border border-rose-200">
                          Challenged in Recent Meeting
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {decision.decision_text}
                    </h3>
                    {decision.context && (
                      <p className="text-sm text-slate-700 leading-relaxed font-normal">{decision.context}</p>
                    )}
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-600 font-medium">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-800 font-bold">
                        <User className="h-4 w-4 text-[#00638E]" />
                        {decision.owner || "Organization"}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 font-semibold">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {new Date(decision.decision_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                      <span>Source: {decision.meeting_title || "ADR-24"}</span>
                      <span>ID: {decision.id}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="h-5 w-5 text-[#00638E]" />
              <span>Record Architectural Policy / Decision</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Directly persist an organizational decision into memory so the Conflict Radar can enforce it during meetings.
            </p>

            <form onSubmit={handleCreateDecision} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800">Decision Statement</label>
                <textarea
                  rows={3}
                  required
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="e.g. PostgreSQL + Supabase chosen as unified identity stack; any change requires architecture review."
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#00638E] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800">Responsible Owner / Sponsor</label>
                <input
                  type="text"
                  required
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  placeholder="e.g. Elena Vance (VP of Engineering)"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#00638E] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800">Context / Rationale</label>
                <input
                  type="text"
                  value={newContext}
                  onChange={(e) => setNewContext(e.target.value)}
                  placeholder="e.g. Mandated in ADR-24 to maintain SOC2 security standards."
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#00638E] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#00638E] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#004A6B] transition-all shadow-sm"
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
