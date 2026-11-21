"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Filter,
  Plus,
  Calendar,
  User,
  ExternalLink,
  Kanban,
  List,
  Sparkles,
  Share2,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { ActionItem, TaskStatus, Priority } from "@/lib/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<ActionItem[]>([]);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [selectedOwner, setSelectedOwner] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Sync / Export Modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPlatform, setExportPlatform] = useState<"linear" | "notion" | "webhook">("linear");
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: TaskStatus) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateSync = () => {
    setSyncStatus("connecting");
    setTimeout(() => {
      setSyncStatus("success");
      setTimeout(() => {
        setShowExportModal(false);
        setSyncStatus(null);
      }, 1500);
    }, 1200);
  };

  const owners = Array.from(new Set(tasks.map((t) => t.owner || "Unassigned")));

  const filteredTasks = tasks.filter((t) => {
    const matchesOwner = selectedOwner === "ALL" || (t.owner || "Unassigned") === selectedOwner;
    const matchesPriority = selectedPriority === "ALL" || t.priority === selectedPriority;
    return matchesOwner && matchesPriority;
  });

  const columns: { status: TaskStatus; label: string; color: string }[] = [
    { status: "PROPOSED", label: "Proposed", color: "slate" },
    { status: "APPROVED", label: "Approved", color: "indigo" },
    { status: "IN_PROGRESS", label: "In Progress", color: "cyan" },
    { status: "COMPLETED", label: "Completed", color: "emerald" },
    { status: "OVERDUE", label: "Overdue", color: "rose" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-400 mb-2">
            <CheckSquare className="h-3.5 w-3.5" />
            <span>Execution Tracker & Integrations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Confirmed Task Board
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Every task originates from a ratified meeting decision with explicit human-in-the-loop approval.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Export to Linear / Notion</span>
          </button>

          {/* View toggle */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-xs text-slate-400">
            <button
              onClick={() => setViewMode("kanban")}
              className={`rounded-md px-2.5 py-1.5 font-medium transition-colors ${
                viewMode === "kanban" ? "bg-indigo-600 text-white" : "hover:text-slate-200"
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-md px-2.5 py-1.5 font-medium transition-colors ${
                viewMode === "list" ? "bg-indigo-600 text-white" : "hover:text-slate-200"
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter Assignee:</span>
          </div>
          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Assignees</option>
            {owners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-xs text-slate-400 pl-2 border-l border-slate-800">
            <span>Priority:</span>
          </div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-200">{filteredTasks.length}</span> tasks
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {columns.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                className="flex flex-col rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 min-w-[220px] space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        col.status === "COMPLETED"
                          ? "bg-emerald-400"
                          : col.status === "OVERDUE"
                          ? "bg-rose-400"
                          : col.status === "IN_PROGRESS"
                          ? "bg-cyan-400"
                          : col.status === "APPROVED"
                          ? "bg-indigo-400"
                          : "bg-slate-500"
                      }`}
                    />
                    <span className="text-xs font-bold text-slate-200">{col.label}</span>
                  </div>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-1">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-2.5 transition-all hover:border-slate-700 hover:bg-slate-900 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[10px] text-indigo-400 font-bold">
                          {task.external_task_id || "FLW-100"}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                            task.priority === "CRITICAL"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : task.priority === "HIGH"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white leading-snug">{task.title}</h4>
                      {task.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[10px] text-slate-400">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-slate-300 font-medium">
                            <User className="h-3 w-3 text-indigo-400" />
                            {task.owner || "Unassigned"}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="h-3 w-3 text-purple-400" />
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No date"}
                          </span>
                        </div>

                        {/* Quick Status Mover */}
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-slate-400">Move:</span>
                          <select
                            value={task.status}
                            onChange={(e) => handleUpdateStatus(task.id, e.target.value as TaskStatus)}
                            className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 focus:outline-none"
                          >
                            <option value="PROPOSED">Proposed</option>
                            <option value="APPROVED">Approved</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="OVERDUE">Overdue</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Task ID</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-4 font-mono text-indigo-400 font-bold">
                    {task.external_task_id || "FLW-100"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{task.title}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{task.description}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-200">{task.owner || "Unassigned"}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No deadline"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                        task.priority === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : task.priority === "HIGH"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateStatus(task.id, e.target.value as TaskStatus)}
                      className="rounded bg-slate-950 border border-slate-800 px-2 py-1 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="PROPOSED">Proposed</option>
                      <option value="APPROVED">Approved</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="OVERDUE">Overdue</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Export / Integrations Simulation Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl animate-fade-in">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Share2 className="h-4 w-4 text-indigo-400" />
              <span>External Task Tracker Integration</span>
            </h2>
            <p className="text-xs text-slate-400">
              FollowThrough automatically transforms confirmed decisions into external trackers.
              Select your team's destination below:
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { id: "linear", label: "Linear", color: "indigo" },
                { id: "notion", label: "Notion", color: "purple" },
                { id: "webhook", label: "Webhook", color: "emerald" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setExportPlatform(p.id as any)}
                  className={`rounded-xl border p-3 text-center transition-all ${
                    exportPlatform === p.id
                      ? "border-indigo-500 bg-indigo-950/40 text-white"
                      : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="text-xs font-bold block">{p.label}</span>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1 text-xs text-slate-300 font-mono">
              <div className="text-[10px] text-slate-400 uppercase font-sans font-semibold">Payload Preview</div>
              <div>Destination: {exportPlatform.toUpperCase()} Sync Hub</div>
              <div>Records: {filteredTasks.length} Approved Tasks</div>
              <div>Security: OAuth2 Bearer Enforced</div>
            </div>

            {syncStatus && (
              <div className="rounded-xl bg-indigo-950/40 border border-indigo-500/30 p-3 text-center text-xs text-indigo-300 font-medium">
                {syncStatus === "connecting" ? "Synchronizing tasks..." : "✓ Synced successfully!"}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="rounded-lg px-3 py-2 text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSimulateSync}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-all"
              >
                Dispatch Tasks Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
