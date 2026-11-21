"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  ArrowRight,
  Check,
  X,
  Layers,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sliders,
  Send,
  Bell,
  Database,
} from "lucide-react";
import { Meeting, Decision, ActionItem, Conflict, AgentEvent } from "@/lib/types";

export default function MeetingRunPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRerunning, setIsRerunning] = useState(false);
  const [showTimelineDetails, setShowTimelineDetails] = useState(true);

  // Approval state toggles
  const [approvedDecisions, setApprovedDecisions] = useState<Record<string, boolean>>({});
  const [approvedActions, setApprovedActions] = useState<Record<string, boolean>>({});
  const [scheduleReminders, setScheduleReminders] = useState(true);
  const [confirmationSuccess, setConfirmationSuccess] = useState(false);

  useEffect(() => {
    loadMeetingDetails();
  }, [meetingId]);

  const loadMeetingDetails = async () => {
    // 1. Immediately hydrate from client sessionStorage if available (instant rendering on serverless)
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(`meeting_${meetingId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.id === meetingId) {
            setMeeting(parsed);
            const decMap: Record<string, boolean> = {};
            (parsed.decisions || []).forEach((d: Decision) => {
              decMap[d.id] = parsed.status === "executed" ? d.approved : true;
            });
            setApprovedDecisions(decMap);

            const actMap: Record<string, boolean> = {};
            (parsed.action_items || []).forEach((a: ActionItem) => {
              actMap[a.id] = parsed.status === "executed" ? a.approved : true;
            });
            setApprovedActions(actMap);

            if (parsed.status === "executed") {
              setConfirmationSuccess(true);
            }
            setLoading(false);
          }
        }
      } catch (cacheErr) {
        console.warn("sessionStorage hydration error:", cacheErr);
      }
    }

    // 2. Fetch fresh server-side data from /api/meetings/[id]
    try {
      const res = await fetch(`/api/meetings/${meetingId}`);
      if (res.ok) {
        const data = await res.json();
        const m: Meeting = data.meeting;
        if (m) {
          setMeeting(m);

          const decMap: Record<string, boolean> = {};
          (m.decisions || []).forEach((d) => {
            decMap[d.id] = m.status === "executed" ? d.approved : true;
          });
          setApprovedDecisions(decMap);

          const actMap: Record<string, boolean> = {};
          (m.action_items || []).forEach((a) => {
            actMap[a.id] = m.status === "executed" ? a.approved : true;
          });
          setApprovedActions(actMap);

          if (m.status === "executed") {
            setConfirmationSuccess(true);
          }

          if (typeof window !== "undefined") {
            sessionStorage.setItem(`meeting_${meetingId}`, JSON.stringify(m));
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDecision = (id: string) => {
    if (meeting?.status === "executed") return;
    setApprovedDecisions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleAction = (id: string) => {
    if (meeting?.status === "executed") return;
    setApprovedActions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConfirmAndExecute = async () => {
    if (!meeting) return;
    setIsConfirming(true);

    const approvedDecisionIds = Object.keys(approvedDecisions).filter((id) => approvedDecisions[id]);
    const rejectedDecisionIds = Object.keys(approvedDecisions).filter((id) => !approvedDecisions[id]);

    const approvedActionItemIds = Object.keys(approvedActions).filter((id) => approvedActions[id]);
    const rejectedActionItemIds = Object.keys(approvedActions).filter((id) => !approvedActions[id]);

    try {
      const res = await fetch(`/api/meetings/${meetingId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approved_decision_ids: approvedDecisionIds,
          rejected_decision_ids: rejectedDecisionIds,
          approved_action_item_ids: approvedActionItemIds,
          rejected_action_item_ids: rejectedActionItemIds,
          schedule_reminders: scheduleReminders,
        }),
      });

      if (!res.ok) throw new Error("Execution failed");
      const data = await res.json();
      setMeeting(data.meeting);
      if (typeof window !== "undefined" && data.meeting) {
        sessionStorage.setItem(`meeting_${meetingId}`, JSON.stringify(data.meeting));
      }
      setConfirmationSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Failed to confirm and execute. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleRerunAgent = async () => {
    setIsRerunning(true);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        await loadMeetingDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRerunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-[#00638E] border-t-transparent" />
          <p className="text-base text-slate-600 font-semibold">Loading meeting agent execution details...</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <AlertTriangle className="mx-auto h-14 w-14 text-amber-500" />
        <h2 className="mt-4 text-xl font-bold text-slate-900">Meeting Not Found</h2>
        <Link href="/" className="mt-4 inline-block text-sm font-bold text-[#00638E] hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const conflicts = meeting.conflicts || [];
  const decisions = meeting.decisions || [];
  const actionItems = meeting.action_items || [];
  const agentEvents = meeting.agent_events || [];
  const speakers = meeting.speakers || [];

  const approvedDecisionsCount = Object.values(approvedDecisions).filter(Boolean).length;
  const approvedActionsCount = Object.values(approvedActions).filter(Boolean).length;
  const isExecuted = meeting.status === "executed";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in pb-36">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium">
            <Link href="/" className="hover:text-slate-900">Dashboard</Link>
            <span>/</span>
            <span>Meeting Agent</span>
            <span>/</span>
            <span className="text-slate-800 font-mono text-xs font-semibold">{meeting.id}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{meeting.title}</h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold border ${
                isExecuted
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
              }`}
            >
              {isExecuted ? "EXECUTED & COMMITTED" : "AWAITING HUMAN CONFIRMATION"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 font-medium">
            <span>Date: {new Date(meeting.date).toLocaleDateString()}</span>
            <span>•</span>
            <span>{speakers.length} Identified Participants</span>
            <span>•</span>
            <span>Source: {meeting.source_type}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRerunAgent}
            disabled={isRerunning}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RotateCcw className={`h-4 w-4 ${isRerunning ? "animate-spin" : ""}`} />
            <span>Re-run Agent</span>
          </button>
        </div>
      </div>

      {/* Confirmation Success Alert */}
      {isExecuted && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700 border border-emerald-200 shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Actions Successfully Confirmed & Executed!</h3>
              <p className="text-sm text-slate-700 mt-1 font-medium leading-relaxed">
                Approved decisions have been committed to permanent organizational memory, tasks created in the tracker, and proactive reminders scheduled.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/tasks"
              className="flex items-center gap-2 rounded-xl bg-[#00638E] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#004A6B] transition-all shadow-sm"
            >
              <Layers className="h-4 w-4" />
              <span>Open Task Board</span>
            </Link>
            <Link
              href="/memory"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Database className="h-4 w-4" />
              <span>View Memory</span>
            </Link>
          </div>
        </div>
      )}

      {/* Score & Executive Summary Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Score Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">Execution Score</span>
            <Sparkles className="h-5 w-5 text-[#00638E]" />
          </div>
          <div className="my-2 text-center">
            <div className="text-5xl font-black tracking-tight text-slate-900">
              {meeting.execution_score}
              <span className="text-xl font-normal text-slate-500">/100</span>
            </div>
            <p className="mt-2 text-sm text-slate-700 font-bold">
              {meeting.execution_score >= 85
                ? "High Execution Velocity"
                : meeting.execution_score >= 70
                ? "Moderate Velocity • Risks Flagged"
                : "Severe Contradiction / Missing Ownership"}
            </p>
          </div>
          <div className="space-y-2 border-t border-slate-100 pt-3 text-xs sm:text-sm text-slate-600 font-medium">
            <div className="flex justify-between">
              <span>Decision Clarity:</span>
              <span className="font-bold text-slate-900">22 / 25</span>
            </div>
            <div className="flex justify-between">
              <span>Ownership DRI:</span>
              <span className="font-bold text-slate-900">
                {conflicts.some((c) => c.conflict_type === "MISSING_OWNER") ? "12 / 25" : "25 / 25"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Conflict Penalty:</span>
              <span className={`font-bold ${conflicts.length > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                -{conflicts.length * 6} pts
              </span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold uppercase tracking-wider text-[#00638E] flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span>Agentic Executive Synthesis</span>
            </h2>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-semibold">
              <Clock className="h-4 w-4" />
              <span>Processed in 1.4s</span>
            </div>
          </div>
          <p className="text-base text-slate-800 leading-relaxed font-normal">
            {meeting.summary || "Agent pipeline parsed decisions, participants, and action items."}
          </p>

          {/* Speakers Pill Row */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
            <span className="text-xs sm:text-sm font-bold text-slate-700">Attributed Speakers:</span>
            {speakers.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs sm:text-sm text-slate-800 font-semibold"
              >
                <User className="h-3.5 w-3.5 text-[#00638E]" />
                <span>{s.name}</span>
                <span className="text-xs text-slate-500 font-mono">({s.role || "Member"})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Activity Timeline (Collapsible) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              Agent Activity Timeline (Autonomous Trace)
            </h2>
          </div>
          <button
            onClick={() => setShowTimelineDetails(!showTimelineDetails)}
            className="text-xs sm:text-sm font-bold text-[#00638E] hover:underline flex items-center gap-1"
          >
            {showTimelineDetails ? "Collapse Stream" : "Expand Logs"}
            {showTimelineDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {showTimelineDetails && (
          <div className="space-y-3 pt-2">
            {agentEvents.map((evt, idx) => (
              <div
                key={evt.id || idx}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs sm:text-sm text-slate-800"
              >
                <div className="mt-0.5">
                  {evt.status === "SUCCESS" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : evt.status === "WARNING" ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  ) : evt.status === "IN_PROGRESS" ? (
                    <div className="h-5 w-5 rounded-full border-2 border-[#00638E] border-t-transparent animate-spin" />
                  ) : (
                    <Clock className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono uppercase text-xs font-bold text-[#00638E]">
                      STEP {idx + 1}: {evt.step.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(evt.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium leading-relaxed">{evt.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CONFLICT RADAR SECTION */}
      {conflicts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-rose-600" />
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Conflict Radar: Contradictions & Policy Clashes ({conflicts.length})
              </h2>
            </div>
            <span className="rounded-full bg-rose-50 px-3.5 py-1 text-xs sm:text-sm font-bold text-rose-700 border border-rose-200">
              Immediate Attention Needed
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {conflicts.map((conflict) => (
              <div
                key={conflict.id}
                className={`rounded-2xl border p-6 space-y-4 shadow-sm transition-all ${
                  conflict.severity === "CRITICAL"
                    ? "border-rose-200 bg-rose-50/70"
                    : conflict.severity === "HIGH"
                    ? "border-amber-200 bg-amber-50/70"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`rounded-md px-2.5 py-0.5 text-xs font-black uppercase tracking-wider ${
                        conflict.severity === "CRITICAL"
                          ? "bg-rose-600 text-white"
                          : conflict.severity === "HIGH"
                          ? "bg-amber-500 text-slate-950"
                          : "bg-slate-700 text-white"
                      }`}
                    >
                      {conflict.severity}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {conflict.conflict_type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono font-semibold">
                    Conflict ID: {conflict.id}
                  </span>
                </div>

                {/* Explanation */}
                <div className="space-y-1">
                  <p className="text-base font-bold text-slate-900 leading-relaxed">
                    {conflict.explanation}
                  </p>
                </div>

                {/* Side-by-Side Comparison if historical memory exists */}
                {conflict.previous_decision_text && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl bg-white p-5 border border-slate-200">
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                        <span>New Proposed Statement</span>
                      </div>
                      <p className="text-sm text-slate-900 font-semibold leading-relaxed">
                        “{conflict.current_decision_text}”
                      </p>
                    </div>

                    <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-5">
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                        <Database className="h-4 w-4" />
                        <span>Prior Ratified Policy in Memory</span>
                      </div>
                      <p className="text-sm text-slate-800 font-medium leading-relaxed">
                        “{conflict.previous_decision_text}”
                      </p>
                      {conflict.previous_meeting_title && (
                        <p className="text-xs text-slate-500 font-medium">
                          Source: {conflict.previous_meeting_title} ({conflict.previous_owner || 'ADR'})
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                <div className="rounded-xl bg-sky-50/90 border border-sky-100 p-4 flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-[#00638E] shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-800 leading-relaxed">
                    <strong className="text-[#004A6B] font-extrabold">Agent Recommendation: </strong>
                    <span className="font-medium">{conflict.recommendation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROPOSED DECISIONS & ACTIONS SIDE-BY-SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Ratified Decisions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="h-5 w-5 text-[#00638E]" />
              <span>Proposed Decisions for Memory ({decisions.length})</span>
            </h2>
            <span className="text-xs sm:text-sm font-semibold text-slate-600">
              {approvedDecisionsCount} of {decisions.length} Approved
            </span>
          </div>

          <div className="space-y-3">
            {decisions.map((dec) => {
              const isApproved = approvedDecisions[dec.id];
              return (
                <div
                  key={dec.id}
                  className={`rounded-xl border p-5 space-y-3 transition-all ${
                    isApproved
                      ? "border-slate-200 bg-white shadow-sm"
                      : "border-slate-200 bg-slate-50/60 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <p className="text-base font-bold text-slate-900 leading-snug">
                        {dec.decision_text}
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed font-normal">{dec.context}</p>
                    </div>
                    {!isExecuted && (
                      <button
                        type="button"
                        onClick={() => handleToggleDecision(dec.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-all shrink-0 ${
                          isApproved
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {isApproved ? "Approved" : "Rejected"}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
                    <span>Owner: {dec.owner || "Organization"}</span>
                    <span>•</span>
                    <span>Confidence: {Math.round((dec.confidence || 0.95) * 100)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Proposed Action Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#00638E]" />
              <span>Proposed Tasks for Tracker ({actionItems.length})</span>
            </h2>
            <span className="text-xs sm:text-sm font-semibold text-slate-600">
              {approvedActionsCount} of {actionItems.length} Approved
            </span>
          </div>

          <div className="space-y-3">
            {actionItems.map((act) => {
              const isApproved = approvedActions[act.id];
              return (
                <div
                  key={act.id}
                  className={`rounded-xl border p-5 space-y-3 transition-all ${
                    isApproved
                      ? "border-slate-200 bg-white shadow-sm"
                      : "border-slate-200 bg-slate-50/60 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-extrabold uppercase ${
                            act.priority === "CRITICAL"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : act.priority === "HIGH"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {act.priority}
                        </span>
                        <h4 className="text-base font-bold text-slate-900">{act.title}</h4>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed font-normal">{act.description}</p>
                    </div>

                    {!isExecuted && (
                      <button
                        type="button"
                        onClick={() => handleToggleAction(act.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-all shrink-0 ${
                          isApproved
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {isApproved ? "Approved" : "Rejected"}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
                    <span className="flex items-center gap-1 text-slate-800 font-semibold">
                      <User className="h-4 w-4 text-[#00638E]" />
                      {act.owner || "Unassigned"}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-slate-700">
                      <Calendar className="h-4 w-4 text-[#00638E]" />
                      {act.due_date ? new Date(act.due_date).toLocaleDateString() : "No deadline"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MANDATORY CONFIRMATION GATEKEEPER BAR (Sticky bottom) */}
      {!isExecuted && (
        <div className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 bg-white/98 backdrop-blur-xl py-4 px-4 sm:px-6 lg:px-8 shadow-[0_-4px_25px_rgba(0,0,0,0.1)]">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#BFD8E3]/30 text-[#00638E] border border-[#BFD8E3] shrink-0">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    Human-in-the-Loop Confirmation Gate
                  </span>
                  <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Execution Held
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  {approvedDecisionsCount} decisions & {approvedActionsCount} tasks queued for commit. Nothing created externally without confirmation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-800 font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={scheduleReminders}
                  onChange={(e) => setScheduleReminders(e.target.checked)}
                  className="rounded border-slate-300 text-[#00638E] focus:ring-[#00638E] h-4 w-4"
                />
                <Bell className="h-4 w-4 text-[#00638E]" />
                <span>Schedule Proactive Reminders</span>
              </label>

              <button
                type="button"
                onClick={handleConfirmAndExecute}
                disabled={isConfirming || (approvedDecisionsCount === 0 && approvedActionsCount === 0)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-[#00638E] to-[#004A6B] px-7 py-3 text-sm font-bold text-white shadow-md shadow-[#00638E]/20 hover:opacity-95 transition-all disabled:opacity-50 active:scale-95"
              >
                {isConfirming ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Executing Actions...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Confirm & Execute Approved Actions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
