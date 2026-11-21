"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Compass,
  Database,
  CheckSquare,
  Sparkles,
  RotateCcw,
  Plus,
  Trash2,
  Calendar,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [isResetting, setIsResetting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const navLinks = [
    { href: "/", label: "Dashboard", icon: Compass },
    { href: "/meetings/new", label: "New Meeting", icon: Plus },
    { href: "/memory", label: "Decision Memory", icon: Database },
    { href: "/tasks", label: "Task Tracker", icon: CheckSquare },
    { href: "/digest", label: "Weekly Digest", icon: Calendar },
  ];

  const handleClearData = async () => {
    if (!confirm("Clear all meeting transcripts, decisions, and tasks for a fresh workspace?")) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      });
      if (res.ok) {
        setStatusMsg("Workspace Cleared!");
        setTimeout(() => {
          setStatusMsg(null);
          window.location.reload();
        }, 800);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleLoadDemo = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });
      if (res.ok) {
        setStatusMsg("Demo Loaded!");
        setTimeout(() => {
          setStatusMsg(null);
          window.location.reload();
        }, 800);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#090d16]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand with User Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-[#E06D53]/40 bg-white shadow-md shadow-[#E06D53]/20 transition-transform group-hover:scale-105">
              <Image
                src="/brand-logo.jpg"
                alt="FollowThrough Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-white group-hover:text-[#E06D53] transition-colors">
                  FollowThrough
                </span>
                <span className="rounded-full bg-[#E06D53]/15 px-2 py-0.5 text-[9px] font-bold text-[#E06D53] border border-[#E06D53]/30 uppercase tracking-wider">
                  AI AGENT
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Meeting-to-Execution Agent</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-800">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#E06D53]/15 text-[#FAF6EC] border border-[#E06D53]/40"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5">
          {/* Agent Status Pill */}
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/30 px-3 py-1 text-xs text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-[11px]">Conflict Radar Online</span>
          </div>

          {/* Clear Workspace Button */}
          <button
            onClick={handleClearData}
            disabled={isResetting}
            title="Clear all workspace data for real tasks"
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-500/30 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">{statusMsg || "Clear Workspace"}</span>
          </button>

          {/* Load Demo Data Button */}
          <button
            onClick={handleLoadDemo}
            disabled={isResetting}
            title="Load demo scenario for testing"
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Load Demo</span>
          </button>

          {/* New Meeting CTA */}
          <Link
            href="/meetings/new"
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#E06D53] to-[#2A8082] px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-[#E06D53]/20 hover:opacity-95 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Ingest Meeting</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
