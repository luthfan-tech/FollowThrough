"use client";

import React from "react";
import Link from "next/link";
import {
  Mic,
  Database,
  ShieldAlert,
  UserCheck,
  Send,
  ArrowUpRight,
} from "lucide-react";

interface ExecutionCard {
  step: string;
  badge: string;
  title: string;
  tagline: string;
  points: string[];
  metric: string;
  icon: React.ElementType;
  themeColor: "azure" | "deep-azure" | "rose" | "emerald" | "soft-azure";
  rotation: string;
  link: string;
  actionText: string;
}

const EXECUTION_CARDS: ExecutionCard[] = [
  {
    step: "PHASE 01",
    badge: "SPEAKER DIARIZATION",
    title: "Transcript Ingestion",
    tagline: "Multimodal Voice & Text Stream",
    points: [
      "Speaker identity & role attribution",
      "Cleans filler & banter automatically",
      "Direct paste or document upload",
    ],
    metric: "Pattern & Model",
    icon: Mic,
    themeColor: "azure",
    rotation: "-rotate-2 hover:rotate-0",
    link: "/meetings/new",
    actionText: "Ingest Transcript",
  },
  {
    step: "PHASE 02",
    badge: "PERSISTENT ADRs",
    title: "Decision Memory",
    tagline: "Cross-Meeting Knowledge Store",
    points: [
      "Extracts ratified agreements & policies",
      "Retains context, owner & effective date",
      "Permanent organizational memory",
    ],
    metric: "Persistent Store",
    icon: Database,
    themeColor: "deep-azure",
    rotation: "rotate-1.5 hover:rotate-0",
    link: "/memory",
    actionText: "Explore Memory",
  },
  {
    step: "PHASE 03",
    badge: "RADAR ENGINE",
    title: "Conflict Radar",
    tagline: "Contradiction & Overload Alert",
    points: [
      "Flags reversals of past decisions",
      "Catches deadline collisions & drift",
      "Assigns Low → Critical risk levels",
    ],
    metric: "Memory Conflict Scan",
    icon: ShieldAlert,
    themeColor: "rose",
    rotation: "-rotate-1 hover:rotate-0",
    link: "/meetings/new",
    actionText: "Detect Conflicts",
  },
  {
    step: "PHASE 04",
    badge: "MANDATORY GATE",
    title: "Human Confirmation",
    tagline: "Zero Blind Automations",
    points: [
      "Review every proposed task & owner",
      "Inline edit, approve, reject or defer",
      "Nothing touches trackers without OK",
    ],
    metric: "Human Gatekeeper",
    icon: UserCheck,
    themeColor: "emerald",
    rotation: "rotate-2 hover:rotate-0",
    link: "/tasks",
    actionText: "Review Approvals",
  },
  {
    step: "PHASE 05",
    badge: "AUTONOMOUS TRACKER",
    title: "Execution Dispatch",
    tagline: "Kanban & Personalized Digest",
    points: [
      "Auto-creates verified tasks with DRIs",
      "Schedules proactive deadline reminders",
      "Generates tailored weekly digests",
    ],
    metric: "Execution Tracker",
    icon: Send,
    themeColor: "soft-azure",
    rotation: "-rotate-1 hover:rotate-0",
    link: "/digest",
    actionText: "View Digests",
  },
];

export function HeroClotheslineCards() {
  const getThemeStyles = (themeColor: ExecutionCard["themeColor"]) => {
    switch (themeColor) {
      case "azure":
        return {
          border: "border-slate-200 group-hover:border-[#00638E]",
          badgeBg: "bg-sky-50 text-[#00638E] border-sky-200",
          iconBg: "bg-sky-50 text-[#00638E]",
          pinColor: "#00638E",
          glow: "group-hover:shadow-[#00638E]/15",
          accentText: "text-[#00638E]",
        };
      case "deep-azure":
        return {
          border: "border-slate-200 group-hover:border-[#004A6B]",
          badgeBg: "bg-blue-50 text-[#004A6B] border-blue-200",
          iconBg: "bg-blue-50 text-[#004A6B]",
          pinColor: "#004A6B",
          glow: "group-hover:shadow-[#004A6B]/15",
          accentText: "text-[#004A6B]",
        };
      case "rose":
        return {
          border: "border-slate-200 group-hover:border-rose-400",
          badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
          iconBg: "bg-rose-50 text-rose-600",
          pinColor: "#E11D48",
          glow: "group-hover:shadow-rose-500/15",
          accentText: "text-rose-600",
        };
      case "emerald":
        return {
          border: "border-slate-200 group-hover:border-emerald-400",
          badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          iconBg: "bg-emerald-50 text-emerald-600",
          pinColor: "#059669",
          glow: "group-hover:shadow-emerald-500/15",
          accentText: "text-emerald-600",
        };
      case "soft-azure":
      default:
        return {
          border: "border-slate-200 group-hover:border-[#00638E]",
          badgeBg: "bg-sky-50 text-[#00638E] border-sky-200",
          iconBg: "bg-sky-50 text-[#00638E]",
          pinColor: "#00638E",
          glow: "group-hover:shadow-[#00638E]/15",
          accentText: "text-[#00638E]",
        };
    }
  };

  return (
    <section className="relative w-full pt-4 pb-8 overflow-hidden">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 px-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#00638E]" />
            <span className="font-mono text-xs sm:text-sm uppercase tracking-widest text-[#00638E] font-extrabold">
              AGENT ARCHITECTURE & WORKFLOW
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            The 5-Stage FollowThrough Execution Line
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Interactive Execution Stream</span>
        </div>
      </div>

      {/* The Curved Clothesline Suspension Cable (SVG) */}
      <div className="relative w-full overflow-visible">
        {/* Wire SVG */}
        <div className="hidden lg:block absolute top-[28px] left-0 w-full pointer-events-none z-10">
          <svg viewBox="0 0 1200 40" className="w-full h-10 overflow-visible" fill="none">
            {/* Main catenary wire in Dark Azure and Soft Azure */}
            <path
              d="M0 8 Q300 28, 600 24 T1200 8"
              stroke="#00638E"
              strokeWidth="2"
              strokeOpacity="0.4"
            />
            <path
              d="M0 9 Q300 29, 600 25 T1200 9"
              stroke="#8CB9CC"
              strokeWidth="1.5"
              strokeOpacity="0.6"
            />
            {/* Hanging Cable Nodes */}
            <circle cx="120" cy="14" r="3.5" fill="#004A6B" />
            <circle cx="360" cy="24" r="3.5" fill="#004A6B" />
            <circle cx="600" cy="24" r="3.5" fill="#004A6B" />
            <circle cx="840" cy="21" r="3.5" fill="#004A6B" />
            <circle cx="1080" cy="11" r="3.5" fill="#004A6B" />
          </svg>
        </div>

        {/* The 5 Clothesline Suspended Cards in Clean White */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 pt-4 relative z-20">
          {EXECUTION_CARDS.map((card) => {
            const styles = getThemeStyles(card.themeColor);
            const Icon = card.icon;

            return (
              <div
                key={card.step}
                className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 transform ${card.rotation} hover:scale-105 hover:z-30 hover:shadow-xl ${styles.border} ${styles.glow}`}
              >
                {/* Metallic Pin Clip */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20">
                  <div
                    className="h-4 w-3.5 rounded-sm shadow-sm border border-slate-300"
                    style={{ backgroundColor: styles.pinColor }}
                  />
                  <div className="h-2 w-1.5 bg-slate-400 -mt-1 rounded-full" />
                </div>

                {/* Card Header & Badges */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-extrabold tracking-wider text-slate-600">
                      {card.step}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase border ${styles.badgeBg}`}
                    >
                      {card.badge}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${styles.iconBg}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-[#00638E] transition-colors leading-tight">
                        {card.title}
                      </h3>
                      <p className="text-xs text-slate-600 font-semibold">{card.tagline}</p>
                    </div>
                  </div>

                  {/* Feature Checklist Points */}
                  <ul className="mt-2 space-y-2 border-t border-slate-100 pt-3 text-xs sm:text-[13px] text-slate-700 font-medium">
                    {card.points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className={`${styles.accentText} mt-0.5 text-sm font-bold`}>✓</span>
                        <span className="leading-snug">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Footer with Metric & Link */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">Guarantee</span>
                    <span className={`font-mono font-bold ${styles.accentText}`}>
                      {card.metric}
                    </span>
                  </div>

                  <Link
                    href={card.link}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs sm:text-sm font-bold text-slate-800 hover:bg-[#00638E] hover:text-white hover:border-[#00638E] transition-all shadow-sm"
                  >
                    <span>{card.actionText}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
