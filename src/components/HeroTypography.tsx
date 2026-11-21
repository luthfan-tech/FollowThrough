"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, Play, ShieldAlert, Cpu } from "lucide-react";

export function HeroTypography() {
  return (
    <section className="relative w-full overflow-hidden rounded-3xl border-2 border-[#E06D53]/30 bg-gradient-to-b from-[#25070E] via-[#1A050B] to-[#090D16] p-6 sm:p-10 lg:p-14 shadow-2xl shadow-rose-950/40">
      {/* SVG Analog Film Grain Filter */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden="true">
        <filter id="retro-film-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#retro-film-grain)" />
      </svg>

      {/* Retro-Futuristic Radial Glows */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[380px] w-[650px] rounded-full bg-gradient-to-b from-[#E06D53]/25 via-[#2A8082]/15 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-10 h-64 w-64 rounded-full bg-[#E06D53]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 right-10 h-64 w-64 rounded-full bg-[#2A8082]/15 blur-3xl" />

      {/* Vintage Poster Corner Marks & Crosshairs */}
      <div className="pointer-events-none absolute top-4 left-4 text-xs font-mono text-[#E06D53]/40 select-none">
        + 01-A // FT-2026
      </div>
      <div className="pointer-events-none absolute top-4 right-4 text-xs font-mono text-[#2A8082]/40 select-none">
        DECISION ENGINE // +
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 text-xs font-mono text-[#E06D53]/40 select-none">
        + CONFLICT RADAR
      </div>
      <div className="pointer-events-none absolute bottom-4 right-4 text-xs font-mono text-[#2A8082]/40 select-none">
        SAI ABHYANKAR VIBE // +
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto space-y-6">
        {/* Top Retro Funk Vinyl Label Pill */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-[#E06D53]/40 bg-[#3B0A16]/60 px-4 py-1.5 backdrop-blur-md shadow-inner shadow-[#E06D53]/20">
          <span className="flex h-2 w-2 rounded-full bg-[#E06D53] animate-ping" />
          <span className="font-mono text-[11px] font-bold tracking-widest text-[#FAF6EC] uppercase">
            SIDE A • 45 RPM • RETRO-FUNK AGENTIC WORKFLOW
          </span>
          <span className="hidden sm:inline-block text-[#2A8082] text-xs">◆</span>
          <span className="hidden sm:inline-block font-mono text-[10px] text-[#FAF6EC]/80 tracking-wider">
            SAI ABHYANKAR “FA FA FA” AESTHETIC
          </span>
        </div>

        {/* Brand Logo Integration with Badge */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl border-2 border-[#E06D53]/40 bg-white/5 p-1 shadow-lg shadow-[#E06D53]/20">
            <Image
              src="/brand-logo.jpg"
              alt="FollowThrough Brand Emblem"
              fill
              className="object-cover rounded-xl"
              priority
            />
          </div>
          <span className="text-xs font-mono tracking-widest text-[#2A8082] uppercase font-bold">
            RATIFIED DECISION INTELLIGENCE
          </span>
        </div>

        {/* CENTERPIECE: The "FollowThrough" Sai Abhyankar "FA FA FA" Funk Typography */}
        <div className="relative py-4 px-2 w-full select-none">
          {/* Decorative Arabic Calligraphic Diacritics (Nuqta diamonds) floating above text */}
          <div className="flex justify-center items-center gap-12 sm:gap-24 mb-1 text-[#E06D53]">
            <span className="inline-block transform rotate-45 h-3 w-3 bg-[#E06D53] shadow-lg shadow-[#E06D53]/50" />
            <span className="inline-block transform rotate-45 h-2.5 w-2.5 bg-[#FAF6EC] shadow-md" />
            <span className="inline-block transform rotate-45 h-3 w-3 bg-[#2A8082] shadow-lg shadow-[#2A8082]/50" />
            <span className="inline-block transform rotate-45 h-2.5 w-2.5 bg-[#FAF6EC] shadow-md" />
            <span className="inline-block transform rotate-45 h-3 w-3 bg-[#E06D53] shadow-lg shadow-[#E06D53]/50" />
          </div>

          {/* SVG Vector Stylized Display Title with Chunky Geometry and Arabic-Style Sweeps */}
          <div className="relative">
            {/* Desktop / Tablet Large High-Impact Typography */}
            <h1 className="font-funk text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-none uppercase funk-text-extrusion font-extrabold transition-transform duration-300 hover:scale-[1.01]">
              FollowThrough
            </h1>

            {/* Arabic-style Calligraphic Sub-Swash SVG underline */}
            <div className="flex justify-center -mt-1 sm:-mt-2">
              <svg
                viewBox="0 0 600 32"
                className="w-full max-w-lg h-6 sm:h-8 text-[#E06D53] drop-shadow-[0_4px_8px_rgba(224,109,83,0.4)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Flowing Arabic/Funk Calligraphic Ribbon Swash */}
                <path
                  d="M10 20C90 28 200 4 300 18C400 30 510 10 590 14"
                  stroke="#E06D53"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M15 22C95 30 205 6 305 20C405 32 515 12 595 16"
                  stroke="#2A8082"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Terminal diamond accents */}
                <polygon points="10,20 14,16 18,20 14,24" fill="#FAF6EC" />
                <polygon points="590,14 594,10 598,14 594,18" fill="#FAF6EC" />
              </svg>
            </div>
          </div>
        </div>

        {/* Vintage Poster Subheading & Manifesto */}
        <div className="space-y-3 max-w-3xl">
          <p className="font-funk text-lg sm:text-2xl text-[#FAF6EC] tracking-wide font-bold">
            “Meetings create decisions. FollowThrough makes sure they get executed.”
          </p>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            Don’t let verbal consensus disappear into silence. FollowThrough ingests raw transcripts,
            attributes speakers, cross-references persistent memory with its{" "}
            <span className="text-[#E06D53] font-semibold">Conflict Radar</span>, requires{" "}
            <span className="text-[#FAF6EC] font-semibold underline decoration-[#2A8082] underline-offset-4">
              Human-in-the-Loop Confirmation
            </span>
            , and dispatches verifiable tasks to your team.
          </p>
        </div>

        {/* Action Buttons in Retro-Funk Aesthetic */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/meetings/new"
            className="group relative flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#E06D53] via-[#e57d65] to-[#2A8082] px-7 py-4 text-sm font-bold text-white shadow-xl shadow-[#E06D53]/30 hover:shadow-2xl hover:shadow-[#E06D53]/50 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Play className="h-4 w-4 fill-white" />
            <span className="tracking-wide">Ingest Meeting Transcript</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/tasks"
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#2A8082]/60 bg-[#090D16]/80 px-6 py-4 text-sm font-semibold text-[#FAF6EC] hover:bg-[#2A8082]/20 hover:border-[#2A8082] transition-all"
          >
            <Cpu className="h-4 w-4 text-[#2A8082]" />
            <span>Open Task Board</span>
          </Link>

          <Link
            href="/memory"
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <ShieldAlert className="h-4 w-4 text-[#E06D53]" />
            <span>Decision Memory</span>
          </Link>
        </div>

        {/* Retro Specifications Bar */}
        <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl border-t border-white/10 text-left">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-[#E06D53] font-bold">Diarization</span>
            <p className="text-xs font-semibold text-[#FAF6EC]">Multi-Speaker Voice & Text</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-[#2A8082] font-bold">Memory Bank</span>
            <p className="text-xs font-semibold text-[#FAF6EC]">Persistent Cross-Meeting</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-[#E06D53] font-bold">Safety Gate</span>
            <p className="text-xs font-semibold text-[#FAF6EC]">Human Approval Required</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-[#2A8082] font-bold">Execution</span>
            <p className="text-xs font-semibold text-[#FAF6EC]">Kanban + Weekly Digests</p>
          </div>
        </div>
      </div>
    </section>
  );
}
