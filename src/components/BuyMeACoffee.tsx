"use client";

import React from "react";
import Image from "next/image";
import { Coffee, ExternalLink, Heart, Sparkles } from "lucide-react";

export function BuyMeACoffee() {
  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-50/60 via-white to-[#F4F9FC] p-6 sm:p-8 lg:p-10 shadow-sm">
      {/* Decorative ambient glow */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-amber-200/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-[#00638E]/10 blur-2xl" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
        {/* Left / Info Side */}
        <div className="space-y-3.5 text-center md:text-left max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100/80 px-3.5 py-1 text-xs font-extrabold text-amber-900 shadow-xs">
            <Coffee className="h-4 w-4 text-amber-700" />
            <span>Support the Creator</span>
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Enjoying FollowThrough? Buy Me a Coffee!
          </h3>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
            FollowThrough was crafted for the Agentic AI Hackathon to eliminate forgotten commitments and turn meeting conversations into verified execution. If this project helps you or inspires your workflow, supporting with a coffee helps fuel continuous updates and improvements!
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <a
              href="https://buymeacoffee.com/luthfanmakl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-xl bg-[#FFDD00] hover:bg-[#FACC15] px-6 py-3 text-sm font-extrabold text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 border border-amber-400"
            >
              <Coffee className="h-4 w-4 fill-slate-950 text-slate-950" />
              <span>Buy Me a Coffee</span>
              <ExternalLink className="h-4 w-4 text-slate-800" />
            </a>

            <span className="text-xs font-mono font-semibold text-slate-600 bg-white/80 border border-slate-200 px-3 py-2.5 rounded-xl shadow-xs">
              buymeacoffee.com/luthfanmakl
            </span>
          </div>
        </div>

        {/* Right / QR Code Side */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative group p-3 bg-white rounded-2xl border-2 border-amber-300 shadow-md shadow-amber-500/10 transition-transform hover:scale-105">
            <div className="relative h-36 w-36 sm:h-40 sm:w-40 overflow-hidden rounded-xl bg-white">
              <Image
                src="/buymeacoffee-qr.jpg"
                alt="Buy Me a Coffee QR Code - luthfanmakl"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="mt-2 text-center">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600">
                Scan with Camera
              </span>
            </div>
          </div>
          <span className="mt-2 text-xs font-semibold text-[#00638E] flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Instant Mobile Support</span>
          </span>
        </div>
      </div>
    </section>
  );
}
