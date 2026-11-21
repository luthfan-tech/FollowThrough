"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Sparkles, CheckCircle2, ShieldAlert, ArrowRight, Github } from "lucide-react";

export function FooterManifesto() {
  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 sm:p-10 lg:p-12 shadow-sm">
      {/* Ambient background Azure tints */}
      <div className="pointer-events-none absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-[#00638E]/5 blur-3xl" />
      <div className="pointer-events-none absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-[#BFD8E3]/20 blur-3xl" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: The Meeting Sketch Illustration */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative group w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-md">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-white">
              <Image
                src="/meeting-sketch.jpg"
                alt="Team Meeting to Execution Journey"
                fill
                className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="mt-2.5 flex items-center justify-between px-2 text-[11px] font-mono text-slate-500">
              <span className="flex items-center gap-1.5 text-[#00638E] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00638E]" />
                FROM CONVERSATION
              </span>
              <span className="text-slate-400">→</span>
              <span className="flex items-center gap-1.5 text-[#004A6B] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-[#004A6B]" />
                TO VERIFIABLE OUTPUT
              </span>
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-500 italic">
            Ideas → Consensus → Memory Check → Human Approval → Tracked Delivery
          </p>
        </div>

        {/* Right: The Product Manifesto & CTAs */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00638E]/30 bg-[#00638E]/10 px-3 py-1 text-xs font-semibold text-[#00638E]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The FollowThrough Promise</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            “Meetings create decisions.{" "}
            <span className="text-[#00638E]">
              FollowThrough makes sure they get executed.
            </span>”
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed">
            Every team has experienced the silent failure mode of modern knowledge work: brilliant minds spend hours debating and reaching alignment, only for action items to be forgotten, contradicting policies established 3 weeks ago to go unnoticed, and deadlines to quietly lapse.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <ShieldAlert className="h-4 w-4 text-[#00638E]" />
                <span>Conflict Radar</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Never contradict past architectural decisions or double-book team commitments.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Zero Autonomous Blind Writes</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Full human-in-the-loop review. You inspect and approve before tasks hit any tracker.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/meetings/new"
              className="flex items-center gap-2 rounded-xl bg-[#00638E] hover:bg-[#004A6B] px-5 py-3 text-xs font-bold text-white shadow-md shadow-[#00638E]/20 transition-all"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>Ingest Real Meeting Now</span>
            </Link>

            <Link
              href="/tasks"
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-700 hover:border-[#00638E] hover:text-[#00638E] transition-all shadow-sm"
            >
              <span>View Task Tracker</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <a
              href="https://github.com/luthfan-tech/FollowThrough.git"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-medium text-slate-600 hover:text-slate-900 hover:border-slate-400 transition-all ml-auto shadow-sm"
            >
              <Github className="h-3.5 w-3.5" />
              <span>GitHub Repo</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
