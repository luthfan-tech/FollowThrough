"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Upload,
  Play,
  Sparkles,
  Users,
  AlertCircle,
} from "lucide-react";

function NewMeetingContent() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [transcript, setTranscript] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedSpeakers, setDetectedSpeakers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setTranscript(text);
      parseSpeakersFromText(text);
    };
    reader.readAsText(file);
  };

  const parseSpeakersFromText = (text: string) => {
    const lines = text.split("\n");
    const names = new Set<string>();
    for (const line of lines) {
      const match = line.match(/^([A-Z][a-zA-Z\s.-]+?)(?:\s*\([^)]*\))?\s*:\s*(.+)$/);
      if (match && match[1]) {
        const candidate = match[1].trim();
        if (candidate.length > 1 && candidate.length < 35 && !candidate.toLowerCase().includes("http")) {
          names.add(candidate);
        }
      }
    }
    setDetectedSpeakers(Array.from(names));
  };

  const handleTranscriptChange = (text: string) => {
    setTranscript(text);
    parseSpeakersFromText(text);
  };

  const handleRunAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) {
      setError("Please paste or upload a meeting transcript.");
      return;
    }
    if (!title.trim()) {
      setError("Please provide a meeting title.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Create meeting record and execute agent pipeline in a single unified step
      const createRes = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date,
          source_type: "PASTED_TEXT",
          raw_transcript: transcript,
          run_pipeline: true,
        }),
      });

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to process meeting");
      }

      const { meeting } = await createRes.json();

      // If pipeline hasn't run yet for any reason, trigger run endpoint as fallback
      let finalMeeting = meeting;
      if (!meeting.decisions || meeting.decisions.length === 0) {
        const runRes = await fetch(`/api/meetings/${meeting.id}/run`, {
          method: "POST",
        });
        if (runRes.ok) {
          const runData = await runRes.json();
          finalMeeting = runData.meeting || meeting;
        }
      }

      // Cache meeting in client sessionStorage for immediate rendering across serverless redirects
      if (typeof window !== "undefined" && finalMeeting) {
        sessionStorage.setItem(`meeting_${finalMeeting.id}`, JSON.stringify(finalMeeting));
      }

      // Navigate to Review Screen
      router.push(`/meetings/${finalMeeting.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during execution.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in text-slate-900 bg-white">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#00638E]/10 border border-[#00638E]/20 px-3 py-1 text-xs font-semibold text-[#00638E] mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Real Transcript Ingestion</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Ingest Meeting Transcript
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Paste your actual meeting transcript or upload a .txt/.md file. FollowThrough attributes speakers, extracts decisions, inspects historical memory for conflicts, and stages tasks for your review.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleRunAgent} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Meeting Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Core Architecture Review or Sprint 42 Planning"
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#00638E] focus:outline-none focus:ring-1 focus:ring-[#00638E] shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Meeting Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-[#00638E] focus:outline-none focus:ring-1 focus:ring-[#00638E] shadow-sm"
            />
          </div>
        </div>

        {/* Transcript Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-[#00638E]" />
              <span>Meeting Transcript</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer text-xs font-semibold text-[#00638E] hover:underline flex items-center gap-1">
                <Upload className="h-3.5 w-3.5" />
                <span>Upload .txt or .md</span>
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={14}
              value={transcript}
              onChange={(e) => handleTranscriptChange(e.target.value)}
              placeholder={"Paste meeting transcript with speaker names, for example:\n\nAlex: We agreed to finalize the API architecture by next Wednesday.\nPriya: Wait, our database migration is scheduled for Thursday, so that deadline creates a conflict.\nMarcus: Let's confirm: Priya will lead the database schema by Tuesday, and Alex will review the endpoints by Thursday."}
              required
              className="w-full font-mono text-xs leading-relaxed rounded-xl border border-slate-300 bg-slate-50/60 p-4 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#00638E] focus:outline-none focus:ring-1 focus:ring-[#00638E] shadow-sm"
            />
          </div>
        </div>

        {/* Live Detected Speakers */}
        {detectedSpeakers.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-[#00638E]" />
                <span>Detected Participants ({detectedSpeakers.length})</span>
              </span>
              <span className="text-[11px] text-[#00638E] font-medium">Speaker attribution active</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {detectedSpeakers.map((spk, idx) => (
                <span
                  key={idx}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 font-medium shadow-sm"
                >
                  {spk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#00638E] hover:bg-[#004A6B] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#00638E]/25 transition-all disabled:opacity-50 active:scale-95 w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Launching Agent Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                <span>Run FollowThrough Agent Pipeline</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewMeetingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading New Meeting Ingestion Studio...</div>}>
      <NewMeetingContent />
    </Suspense>
  );
}
