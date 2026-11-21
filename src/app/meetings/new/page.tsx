"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Upload,
  Play,
  Sparkles,
  Users,
  AlertCircle,
} from "lucide-react";
import { SAMPLE_MEETINGS, SampleMeeting } from "@/lib/samples";

function NewMeetingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sampleParam = searchParams.get("sample");

  const [title, setTitle] = useState("Q3 Mobile App Launch Sync & Readiness");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [transcript, setTranscript] = useState("");
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedSpeakers, setDetectedSpeakers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize with sample if param provided, or default to sample 1
  useEffect(() => {
    const targetSampleId = sampleParam || "sample-product-launch";
    const sample = SAMPLE_MEETINGS.find((s) => s.id === targetSampleId) || SAMPLE_MEETINGS[0];
    applySample(sample);
  }, [sampleParam]);

  const applySample = (sample: SampleMeeting) => {
    setSelectedSample(sample.id);
    setTitle(sample.title);
    setTranscript(sample.raw_transcript);
    parseSpeakersFromText(sample.raw_transcript);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTitle(file.name.replace(/\.[^/.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setTranscript(text);
      parseSpeakersFromText(text);
      setSelectedSample(null);
    };
    reader.readAsText(file);
  };

  const parseSpeakersFromText = (text: string) => {
    const lines = text.split("\n");
    const names = new Set<string>();
    for (const line of lines) {
      const match = line.match(/^(?:\[\d{1,2}:\d{2}\])?\s*([A-Za-z0-9\s.]+?)(?:\s*\([^)]+\))?:\s*(.+)$/);
      if (match && match[1]) {
        const n = match[1].trim();
        if (n.length > 1 && n.length < 30) {
          names.add(n);
        }
      }
    }
    setDetectedSpeakers(Array.from(names));
  };

  const handleTranscriptChange = (val: string) => {
    setTranscript(val);
    parseSpeakersFromText(val);
  };

  const handleRunAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !transcript.trim()) {
      setError("Please provide a meeting title and transcript text.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Create meeting record
      const createRes = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          date: new Date(date).toISOString(),
          raw_transcript: transcript.trim(),
          source_type: selectedSample ? "sample" : "paste",
        }),
      });

      if (!createRes.ok) {
        throw new Error("Failed to create meeting");
      }

      const { meeting } = await createRes.json();

      // 2. Immediately trigger Agent Pipeline
      const runRes = await fetch(`/api/meetings/${meeting.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!runRes.ok) {
        throw new Error("Failed to execute agent pipeline");
      }

      // 3. Navigate to Meeting Agent Execution & Review Screen
      router.push(`/meetings/${meeting.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during execution.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-400 mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Ingestion & Conflict Radar Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Ingest Meeting Transcript
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Paste a raw meeting transcript, drag-and-drop a file, or select an official hackathon demo scenario to run the autonomous agent pipeline.
        </p>
      </div>

      {/* 3 Pre-engineered Sample Selector */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Load Pre-Configured Demo Scenarios (One-Click Test)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_MEETINGS.map((sample) => {
            const isSelected = selectedSample === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => applySample(sample)}
                className={`text-left rounded-xl border p-4 transition-all ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-500/10"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-medium text-slate-400">{sample.category}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      sample.badgeColor === "rose"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : sample.badgeColor === "amber"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    }`}
                  >
                    {sample.badge}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-200 line-clamp-1">{sample.title}</div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{sample.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleRunAgent} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/30 p-4 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Meeting Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Mobile App Launch Sync"
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Meeting Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Transcript Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-indigo-400" />
              <span>Meeting Transcript Text</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
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
              rows={12}
              value={transcript}
              onChange={(e) => handleTranscriptChange(e.target.value)}
              placeholder="Paste formatted transcript or raw notes with speaker prefixes (e.g. 'Elena Vance: We are launching...')"
              required
              className="w-full font-mono text-xs leading-relaxed rounded-xl border border-slate-800 bg-slate-950/90 p-4 text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Live Detected Speakers */}
        {detectedSpeakers.length > 0 && (
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-indigo-400" />
                <span>Detected Participants ({detectedSpeakers.length})</span>
              </span>
              <span className="text-[11px] text-slate-400">Speaker attribution active</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {detectedSpeakers.map((spk, idx) => (
                <span
                  key={idx}
                  className="rounded-lg border border-slate-700 bg-slate-800/70 px-2.5 py-1 text-xs text-slate-300 font-medium"
                >
                  {spk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all disabled:opacity-50 active:scale-95"
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
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading New Meeting Ingestion Studio...</div>}>
      <NewMeetingContent />
    </Suspense>
  );
}
