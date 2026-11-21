"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Sparkles, CheckCircle2, ShieldAlert, ArrowRight, Github } from "lucide-react";

export function FooterManifesto() {
  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-[#2B2B2B] bg-gradient-to-b from-[#141414] via-[#0a0f16] to-[#000000] p-6 sm:p-10 lg:p-12 shadow-2xl">
      {/* Ambient background Azure glows */}
      <div className="pointer-events-none absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-[#00638E]/20 blur-3xl" />
      <div className="pointer-events-none absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-[#004A6B]/25 blur-3xl" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: The Meeting Sketch Illustration */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative group w-full max-w-md overflow-hidden rounded-2xl border border-[#00638E]/40 bg-[#141414] p-2 shadow-2xl shadow-[#00638E]/10 backdrop-blur-md">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-white">
              <Image
                src="/meeting-sketch.jpg"
                alt="Team Meeting to Execution Journey"
                fill
                className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="mt-2.5 flex items-center justify-between px-2 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-[#00638E] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00638E]" />
                FROM CONVERSATION
              </span>
              <span className="text-slate-400">→</span>
              <span className="flex items-center gap-1.5 text-[#BFD8E3] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-[#BFD8E3]" />
                TO VERIFIABLE OUTPUT
              </span>
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-400 italic">
            Ideas → Consensus → Memory Check → Human Approval → Tracked Delivery
          </p>
        </div>

        {/* Right: The Product Manifesto & CTAs */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00638E]/40 bg-[#00638E]/15 px-3 py-1 text-xs font-semibold text-[#BFD8E3]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The FollowThrough Promise</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            “Meetings create decisions.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BFD8E3] via-[#00638E] to-[#8CB9CC]">
              FollowThrough makes sure they get executed.
            </span>”
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Every team has experienced the silent failure mode of modern knowledge work: brilliant minds spend hours debating and reaching alignment, only for action items to be forgotten, contradicting policies established 3 weeks ago to go unnoticed, and deadlines to quietly lapse.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="rounded-xl border border-[#2B2B2B] bg-[#141414] p-3 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <ShieldAlert className="h-4 w-4 text-[#BFD8E3]" />
                <span>Conflict Radar</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Never contradict past architectural decisions or double-book team commitments.
              </p>
            </div>

            <div className="rounded-xl border border-[#2B2B2B] bg-[#141414] p-3 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <CheckCircle2 className="h-4 w-4 text-[#00638E]" />
                <span>Zero Autonomous Blind Writes</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Full human-in-the-loop review. You inspect and approve before tasks hit any tracker.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/meetings/new"
              className="flex items-center gap-2 rounded-xl bg-[#00638E] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-[#00638E]/25 hover:bg-[#0077ab] transition-all"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>Ingest Real Meeting Now</span>
            </Link>

            <Link
              href="/tasks"
              className="flex items-center gap-2 rounded-xl border border-[#2B2B2B] bg-[#141414] px-4 py-3 text-xs font-semibold text-slate-200 hover:bg-[#2B2B2B] hover:text-white transition-all"
            >
              <span>View Task Tracker</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <a
              href="https://github.com/luthfan-tech/FollowThrough.git"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-[#2B2B2B] bg-[#141414] px-4 py-3 text-xs font-medium text-slate-400 hover:text-white transition-all ml-auto"
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
