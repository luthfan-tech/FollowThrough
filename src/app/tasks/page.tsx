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

  // Add Task Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [newDue, setNewDue] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("MEDIUM");

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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          owner: newOwner.trim() || "Unassigned",
          due_date: newDue ? new Date(newDue).toISOString() : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          priority: newPriority,
          status: "APPROVED",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => [data.task, ...prev]);
        setShowAddModal(false);
        setNewTitle("");
        setNewOwner("");
        setNewDue("");
      }
    } catch (err) {
      console.error(err);
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

  // Strictly enforce that rejected or unapproved tasks never enter execution export
  const exportableTasks = tasks.filter((t) => t.approved && t.status !== "REJECTED");

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 border border-sky-200 px-3.5 py-1 text-xs sm:text-sm font-bold text-[#00638E] mb-2">
            <CheckSquare className="h-4 w-4" />
            <span>Execution Tracker & Integrations</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Confirmed Task Board
          </h1>
          <p className="text-base sm:text-lg text-slate-700 font-medium mt-1">
            Every task originates from a ratified meeting decision with explicit human-in-the-loop approval.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#00638E] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#004A6B] transition-all shadow-sm flex-1 sm:flex-initial"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 transition-all shadow-sm flex-1 sm:flex-initial"
          >
            <Share2 className="h-4 w-4 text-[#00638E]" />
            <span>Export to Linear / Notion</span>
          </button>

          {/* View toggle */}
          <div className="flex rounded-xl border border-slate-300 bg-slate-100 p-0.5 text-xs text-slate-700">
            <button
              onClick={() => setViewMode("kanban")}
              className={`rounded-lg p-2 font-bold transition-colors ${
                viewMode === "kanban" ? "bg-[#00638E] text-white shadow-sm" : "hover:text-slate-900"
              }`}
              title="Kanban View"
            >
              <Kanban className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg p-2 font-bold transition-colors ${
                viewMode === "list" ? "bg-[#00638E] text-white shadow-sm" : "hover:text-slate-900"
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Filter className="h-4 w-4 text-[#00638E]" />
            <span>Filter Assignee:</span>
          </div>
          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-800 focus:border-[#00638E] focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Assignees</option>
            {owners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-sm font-bold text-slate-700 pl-0 sm:pl-3 border-l-0 sm:border-l border-slate-200">
            <span>Priority:</span>
          </div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-800 focus:border-[#00638E] focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div className="text-sm text-slate-600 font-medium">
          Showing <span className="font-extrabold text-slate-900">{filteredTasks.length}</span> tasks
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
                className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 min-w-[240px] space-y-3"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        col.status === "COMPLETED"
                          ? "bg-emerald-500"
                          : col.status === "OVERDUE"
                          ? "bg-rose-500"
                          : col.status === "IN_PROGRESS"
                          ? "bg-sky-500"
                          : col.status === "APPROVED"
                          ? "bg-[#00638E]"
                          : "bg-slate-400"
                      }`}
                    />
                    <span className="text-sm font-bold text-slate-900">{col.label}</span>
                  </div>
                  <span className="rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700 shadow-xs">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-1">
                  {columnTasks.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-500 font-medium">
                      Empty column
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <div
                        key={task.id}
                        className="group rounded-xl border border-slate-200 bg-white p-4 space-y-3 transition-all hover:border-slate-300 hover:shadow-md shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-xs text-[#00638E] font-extrabold">
                            {task.external_task_id || "FLW-100"}
                          </span>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                              task.priority === "CRITICAL"
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : task.priority === "HIGH"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 leading-snug">{task.title}</h4>
                        {task.description && (
                          <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed font-normal">
                            {task.description}
                          </p>
                        )}

                        <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600 font-medium">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-slate-800 font-bold">
                              <User className="h-3.5 w-3.5 text-[#00638E]" />
                              {task.owner || "Unassigned"}
                            </span>
                            <span className="flex items-center gap-1 font-mono text-slate-600">
                              <Calendar className="h-3.5 w-3.5 text-[#00638E]" />
                              {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No date"}
                            </span>
                          </div>

                          {/* Quick Status Mover */}
                          <div className="pt-1 flex items-center justify-between">
                            <span className="text-slate-500 font-semibold">Move:</span>
                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateStatus(task.id, e.target.value as TaskStatus)}
                              className="rounded bg-slate-50 border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none"
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
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500 font-medium">
              No tasks found. Create a task or ingest a meeting to see deliverables here.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-800">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Task ID</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Assignee</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[#00638E] font-extrabold text-xs">
                      {task.external_task_id || "FLW-100"}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{task.title}</div>
                      <div className="text-xs text-slate-600 line-clamp-1">{task.description}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{task.owner || "Unassigned"}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 font-medium">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No deadline"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`rounded px-2.5 py-0.5 text-xs font-extrabold uppercase ${
                          task.priority === "CRITICAL"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : task.priority === "HIGH"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value as TaskStatus)}
                        className="rounded bg-slate-50 border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none"
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
          )}
        </div>
      )}

      {/* Manual Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-[#00638E]" />
              <span>Create New Task</span>
            </h2>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Audit API authentication scopes"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#00638E] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800">Assignee (Owner)</label>
                <input
                  type="text"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  placeholder="e.g. Elena Vance"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#00638E] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-800">Due Date</label>
                  <input
                    type="date"
                    value={newDue}
                    onChange={(e) => setNewDue(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#00638E] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-800">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#00638E] focus:bg-white focus:outline-none"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
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
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sync / Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="h-5 w-5 text-[#00638E]" />
              <span>Export Tasks to Issue Tracker</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              Synchronize confirmed action items directly with your team’s project management systems.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800">Target Integration</label>
              <div className="grid grid-cols-3 gap-2">
                {(["linear", "notion", "webhook"] as const).map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => setExportPlatform(platform)}
                    className={`rounded-xl border p-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all ${
                      exportPlatform === platform
                        ? "border-[#00638E] bg-sky-50 text-[#00638E] shadow-sm"
                        : "border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs sm:text-sm text-slate-700 space-y-1.5">
              <div className="flex items-center justify-between text-slate-900">
                <span className="font-bold">Verified Approved Payloads:</span>
                <span className="font-mono text-xs text-[#00638E] font-extrabold">{exportableTasks.length} tasks</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Guaranteed: Only human-approved tasks ({exportableTasks.length}) are included. Any unapproved or rejected action items are strictly excluded from execution payloads.
              </p>
              <div className="pt-1 text-[11px] text-slate-500 font-mono">
                Format: Webhook / REST JSON Schema [Active Sandbox Mode]
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSimulateSync}
                disabled={syncStatus !== null || exportableTasks.length === 0}
                className="flex items-center gap-2 rounded-lg bg-[#00638E] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#004A6B] transition-all shadow-sm disabled:opacity-50"
              >
                {syncStatus === "connecting" ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : syncStatus === "success" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    <span>Payload Dispatched!</span>
                  </>
                ) : (
                  <span>Export Approved Payloads</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
