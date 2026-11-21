"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Compass,
  Database,
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  Layers,
  HelpCircle,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [isResetting, setIsResetting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const navLinks = [
    { href: "/", label: "Dashboard", icon: Compass },
    { href: "/#features", label: "Features", icon: Layers },
    { href: "/memory", label: "Decision Memory", icon: Database },
    { href: "/tasks", label: "Task Tracker", icon: CheckSquare },
    { href: "/digest", label: "Weekly Digest", icon: Calendar },
    { href: "/#faq", label: "FAQs", icon: HelpCircle },
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
      } else {
        const data = await res.json();
        alert(data.error || "Failed to clear workspace");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/98 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand with User Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm transition-transform group-hover:scale-105">
              <Image
                src="/brand-logo.jpg"
                alt="FollowThrough Logo"
                fill
                className="object-cover rounded-lg"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-[#00638E] transition-colors">
                  FollowThrough
                </span>
                <span className="rounded-full bg-[#00638E]/10 px-2 py-0.5 text-[9px] font-bold text-[#00638E] border border-[#00638E]/20 uppercase tracking-wider">
                  AI AGENT
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Meeting-to-Execution Agent</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#00638E]/10 text-[#00638E] font-semibold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
          {/* Clear Workspace Button */}
          <button
            onClick={handleClearData}
            disabled={isResetting}
            title="Clear all workspace data for a fresh start"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">{statusMsg || "Clear Workspace"}</span>
          </button>

          {/* New Meeting CTA Button */}
          <Link
            href="/meetings/new"
            className="flex items-center gap-1.5 rounded-lg bg-[#00638E] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#004A6B] transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Ingest Meeting</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
