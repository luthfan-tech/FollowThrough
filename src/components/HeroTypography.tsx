"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play, ShieldAlert, Cpu } from "lucide-react";

export function HeroTypography() {
  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-[#BFD8E3] bg-gradient-to-b from-[#F4F9FC] via-white to-[#F8FAFC] p-6 sm:p-10 lg:p-14 shadow-xl shadow-[#00638E]/5">
      {/* Subtle Dot Grid Background Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-60" />

      {/* Azure Ambient Radial Glows */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[380px] w-[700px] rounded-full bg-gradient-to-b from-[#00638E]/10 via-[#BFD8E3]/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-10 h-64 w-64 rounded-full bg-[#00638E]/5 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 right-10 h-64 w-64 rounded-full bg-[#8CB9CC]/10 blur-3xl" />

      {/* Geometric Modern Corner Marks */}
      <div className="hidden sm:block pointer-events-none absolute top-4 left-4 text-xs font-mono text-[#00638E] select-none font-bold">
        + 01-A // FT-2026
      </div>
      <div className="hidden sm:block pointer-events-none absolute top-4 right-4 text-xs font-mono text-[#00638E] select-none font-bold">
        DECISION INTELLIGENCE // +
      </div>
      <div className="hidden sm:block pointer-events-none absolute bottom-4 left-4 text-xs font-mono text-[#00638E] select-none font-bold">
        + CONFLICT RADAR
      </div>
      <div className="hidden sm:block pointer-events-none absolute bottom-4 right-4 text-xs font-mono text-[#004A6B] select-none font-bold">
        ORGANIZATIONAL MEMORY // +
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto space-y-6">
        {/* System Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#BFD8E3] bg-white px-4 py-1.5 shadow-sm">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#00638E] animate-ping" />
          <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-[#00638E] uppercase">
            Autonomous Meeting-to-Execution Agent
          </span>
        </div>

        {/* Brand Logo Integration with Badge */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl border-2 border-[#00638E]/40 bg-white p-1 shadow-md shadow-[#00638E]/10">
            <Image
              src="/brand-logo.jpg"
              alt="FollowThrough Brand Emblem"
              fill
              className="object-cover rounded-xl"
              priority
            />
          </div>
          <span className="text-xs sm:text-sm font-mono tracking-widest text-[#004A6B] uppercase font-extrabold">
            RATIFIED DECISION INTELLIGENCE
          </span>
        </div>

        {/* CENTERPIECE: The "FollowThrough" chunky rounded retro-futuristic typography */}
        <div className="relative py-3 px-2 w-full select-none">
          {/* Decorative Calligraphic Diacritics (Nuqta diamonds) floating above text */}
          <div className="flex justify-center items-center gap-4 sm:gap-16 md:gap-24 mb-1 text-[#00638E]">
            <span className="inline-block transform rotate-45 h-3 w-3 bg-[#00638E] shadow-sm" />
            <span className="inline-block transform rotate-45 h-2.5 w-2.5 bg-[#8CB9CC] shadow-sm" />
            <span className="inline-block transform rotate-45 h-3 w-3 bg-[#004A6B] shadow-sm" />
            <span className="inline-block transform rotate-45 h-2.5 w-2.5 bg-[#8CB9CC] shadow-sm" />
            <span className="inline-block transform rotate-45 h-3 w-3 bg-[#00638E] shadow-sm" />
          </div>

          <div className="relative">
            {/* Chunky, rounded retro-futuristic funk display typography in Dark Azure with layered extrusion */}
            <h1 className="font-funk text-3xl min-[380px]:text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-none uppercase funk-text-extrusion font-extrabold transition-transform duration-300 hover:scale-[1.01] break-normal">
              FollowThrough
            </h1>

            {/* Calligraphic Sub-Swash SVG underline in Dark Azure and Soft Azure */}
            <div className="flex justify-center -mt-1 sm:-mt-2">
              <svg
                viewBox="0 0 600 32"
                className="w-full max-w-lg h-6 sm:h-8 text-[#00638E] drop-shadow-[0_4px_8px_rgba(0,99,142,0.2)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 20C90 28 200 4 300 18C400 30 510 10 590 14"
                  stroke="#00638E"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M15 22C95 30 205 6 305 20C405 32 515 12 595 16"
                  stroke="#8CB9CC"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <polygon points="10,20 14,16 18,20 14,24" fill="#004A6B" />
                <polygon points="590,14 594,10 598,14 594,18" fill="#004A6B" />
              </svg>
            </div>
          </div>
        </div>

        {/* Subheading & Core Positioning Manifesto */}
        <div className="space-y-4 max-w-3xl">
          <p className="font-funk text-xl sm:text-2xl text-slate-900 tracking-wide font-extrabold leading-snug">
            “Meetings create decisions. FollowThrough makes sure they get executed.”
          </p>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-sans font-medium">
            Don’t let verbal consensus evaporate into Slack silence or produce conflicting work.
            FollowThrough attributes speakers, extracts actionable commitments, cross-checks persistent
            organizational memory with its <strong className="text-[#00638E] font-bold">Conflict Radar</strong>,
            enforces human-in-the-loop confirmation, dispatches tasks, and generates personalized digests.
          </p>
        </div>

        {/* Action Buttons in Clean Light / Dark Azure Theme */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 pt-4 w-full sm:w-auto">
          <Link
            href="/meetings/new"
            className="group relative flex items-center justify-center gap-2.5 rounded-2xl bg-[#00638E] hover:bg-[#004A6B] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#00638E]/25 transition-all hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
          >
            <Play className="h-5 w-5 fill-white" />
            <span className="tracking-wide">Ingest Meeting Transcript</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/tasks"
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-4 text-base font-bold text-slate-800 hover:border-[#00638E] hover:text-[#00638E] transition-all shadow-sm w-full sm:w-auto"
          >
            <Cpu className="h-5 w-5 text-[#00638E]" />
            <span>Open Task Board</span>
          </Link>

          <Link
            href="/memory"
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-bold text-slate-800 hover:border-[#00638E] hover:text-[#00638E] transition-all shadow-sm w-full sm:w-auto"
          >
            <ShieldAlert className="h-5 w-5 text-[#00638E]" />
            <span>Decision Memory</span>
          </Link>
        </div>

        {/* Specifications Bar */}
        <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl border-t border-slate-200 text-left">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-[#00638E] font-extrabold">Diarization</span>
            <p className="text-sm font-bold text-slate-900">Multi-Speaker Attribution</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-[#004A6B] font-extrabold">Memory Bank</span>
            <p className="text-sm font-bold text-slate-900">Persistent Cross-Meeting</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-[#00638E] font-extrabold">Safety Gate</span>
            <p className="text-sm font-bold text-slate-900">Human Approval Required</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-[#004A6B] font-extrabold">Execution</span>
            <p className="text-sm font-bold text-slate-900">Kanban + Weekly Digests</p>
          </div>
        </div>
      </div>
    </section>
  );
}
