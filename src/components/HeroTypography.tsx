"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, Play, ShieldAlert, Cpu, CheckCircle2 } from "lucide-react";

export function HeroTypography() {
  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-[#2B2B2B] bg-gradient-to-b from-[#000000] via-[#08121a] to-[#141414] p-6 sm:p-10 lg:p-14 shadow-2xl shadow-[#00638E]/10">
      {/* SVG Analog Subtle Texture Filter */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]" aria-hidden="true">
        <filter id="retro-film-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#retro-film-grain)" />
      </svg>

      {/* Azure Ambient Radial Glows */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[380px] w-[700px] rounded-full bg-gradient-to-b from-[#00638E]/30 via-[#004A6B]/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-10 h-64 w-64 rounded-full bg-[#00638E]/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 right-10 h-64 w-64 rounded-full bg-[#8CB9CC]/10 blur-3xl" />

      {/* Geometric Modern Corner Marks */}
      <div className="pointer-events-none absolute top-4 left-4 text-xs font-mono text-[#BFD8E3]/30 select-none">
        + 01-A // FT-2026
      </div>
      <div className="pointer-events-none absolute top-4 right-4 text-xs font-mono text-[#00638E]/40 select-none">
        DECISION INTELLIGENCE // +
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 text-xs font-mono text-[#00638E]/40 select-none">
        + CONFLICT RADAR
      </div>
      <div className="pointer-events-none absolute bottom-4 right-4 text-xs font-mono text-[#BFD8E3]/30 select-none">
        ORGANIZATIONAL MEMORY // +
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto space-y-6">
        {/* Clean System Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#00638E]/40 bg-[#141414] px-4 py-1.5 backdrop-blur-md shadow-inner shadow-[#00638E]/20">
          <span className="flex h-2 w-2 rounded-full bg-[#00638E] animate-ping" />
          <span className="font-mono text-[11px] font-bold tracking-wider text-[#BFD8E3] uppercase">
            Autonomous Meeting-to-Execution Agent
          </span>
        </div>

        {/* Brand Logo Integration with Badge */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl border-2 border-[#00638E]/50 bg-[#141414] p-1 shadow-lg shadow-[#00638E]/20">
            <Image
              src="/brand-logo.jpg"
              alt="FollowThrough Brand Emblem"
              fill
              className="object-cover rounded-xl"
              priority
            />
          </div>
          <span className="text-xs font-mono tracking-widest text-[#BFD8E3] uppercase font-bold">
            RATIFIED DECISION INTELLIGENCE
          </span>
        </div>

        {/* CENTERPIECE: The "FollowThrough" chunky rounded retro-futuristic typography */}
        <div className="relative py-3 px-2 w-full select-none">
          {/* Decorative Calligraphic Diacritics (Nuqta diamonds) floating above text in Azure */}
          <div className="flex justify-center items-center gap-12 sm:gap-24 mb-1 text-[#00638E]">
            <span className="inline-block transform rotate-45 h-3 w-3 bg-[#00638E] shadow-lg shadow-[#00638E]/50" />
            <span className="inline-block transform rotate-45 h-2.5 w-2.5 bg-[#BFD8E3] shadow-md" />
            <span className="inline-block transform rotate-45 h-3 w-3 bg-[#004A6B] shadow-lg shadow-[#004A6B]/50" />
            <span className="inline-block transform rotate-45 h-2.5 w-2.5 bg-[#FFFFFF] shadow-md" />
            <span className="inline-block transform rotate-45 h-3 w-3 bg-[#00638E] shadow-lg shadow-[#00638E]/50" />
          </div>

          <div className="relative">
            {/* Chunky, rounded retro-futuristic funk display typography in Paper White with Azure extrusion */}
            <h1 className="font-funk text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-none uppercase funk-text-extrusion font-extrabold transition-transform duration-300 hover:scale-[1.01]">
              FollowThrough
            </h1>

            {/* Calligraphic Sub-Swash SVG underline in Dark Azure and Light Azure */}
            <div className="flex justify-center -mt-1 sm:-mt-2">
              <svg
                viewBox="0 0 600 32"
                className="w-full max-w-lg h-6 sm:h-8 text-[#00638E] drop-shadow-[0_4px_8px_rgba(0,99,142,0.4)]"
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
                  stroke="#BFD8E3"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <polygon points="10,20 14,16 18,20 14,24" fill="#FFFFFF" />
                <polygon points="590,14 594,10 598,14 594,18" fill="#FFFFFF" />
              </svg>
            </div>
          </div>
        </div>

        {/* Subheading & Core Positioning Manifesto */}
        <div className="space-y-3 max-w-3xl">
          <p className="font-funk text-lg sm:text-2xl text-[#FFFFFF] tracking-wide font-bold">
            “Meetings create decisions. FollowThrough makes sure they get executed.”
          </p>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            Don’t let verbal consensus evaporate into Slack silence or produce conflicting work.
            FollowThrough attributes speakers, extracts actionable commitments, cross-checks persistent
            organizational memory with its <strong className="text-[#BFD8E3]">Conflict Radar</strong>,
            enforces human-in-the-loop confirmation, dispatches tasks, and generates personalized digests.
          </p>
        </div>

        {/* Action Buttons in Dark Azure & Onyx Theme */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/meetings/new"
            className="group relative flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#00638E] via-[#004A6B] to-[#00638E] px-7 py-4 text-sm font-bold text-white shadow-xl shadow-[#00638E]/30 hover:shadow-2xl hover:shadow-[#00638E]/50 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Play className="h-4 w-4 fill-white" />
            <span className="tracking-wide">Ingest Meeting Transcript</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/tasks"
            className="flex items-center justify-center gap-2 rounded-2xl border border-[#2B2B2B] bg-[#141414] px-6 py-4 text-sm font-semibold text-[#BFD8E3] hover:bg-[#2B2B2B] hover:text-white transition-all"
          >
            <Cpu className="h-4 w-4 text-[#00638E]" />
            <span>Open Task Board</span>
          </Link>

          <Link
            href="/memory"
            className="flex items-center justify-center gap-2 rounded-2xl border border-[#2B2B2B] bg-[#141414]/60 px-5 py-4 text-sm font-medium text-slate-300 hover:bg-[#2B2B2B] hover:text-white transition-all"
          >
            <ShieldAlert className="h-4 w-4 text-[#8CB9CC]" />
            <span>Decision Memory</span>
          </Link>
        </div>

        {/* Specifications Bar */}
        <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl border-t border-[#2B2B2B] text-left">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-[#00638E] font-bold">Diarization</span>
            <p className="text-xs font-semibold text-[#FFFFFF]">Multi-Speaker Voice & Text</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-[#BFD8E3] font-bold">Memory Bank</span>
            <p className="text-xs font-semibold text-[#FFFFFF]">Persistent Cross-Meeting</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-[#00638E] font-bold">Safety Gate</span>
            <p className="text-xs font-semibold text-[#FFFFFF]">Human Approval Required</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-[#BFD8E3] font-bold">Execution</span>
            <p className="text-xs font-semibold text-[#FFFFFF]">Kanban + Weekly Digests</p>
          </div>
        </div>
      </div>
    </section>
  );
}
