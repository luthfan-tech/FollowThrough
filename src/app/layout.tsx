import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "FollowThrough | Meeting-to-Execution Agent",
  description:
    "Meetings create decisions. FollowThrough makes sure they get executed. An autonomous, human-in-the-loop Agentic AI execution engine.",
  icons: {
    icon: "/brand-logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased selection:bg-[#00638E] selection:text-white font-sans">
        <div className="relative min-h-screen flex flex-col bg-white">
          {/* Subtle background Azure ambient tint */}
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-b from-[#00638E]/5 via-[#BFD8E3]/15 to-transparent blur-3xl" />
          </div>

          <Navbar />
          <main className="relative z-10 flex-1 pt-16">{children}</main>

          <footer className="relative z-10 border-t border-slate-200 bg-slate-50 py-8 text-sm text-slate-700">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shrink-0">
                  <Image
                    src="/brand-logo.jpg"
                    alt="FollowThrough Logo"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-base">FollowThrough</span>
                  <span className="mx-2 text-slate-400">•</span>
                  <span className="text-slate-600 font-medium">Agentic AI Hackathon 2026</span>
                </div>
              </div>

              <p className="text-slate-700 text-center sm:text-right font-semibold text-sm">
                “Meetings create decisions. FollowThrough makes sure they get executed.”
              </p>

              <div className="flex items-center gap-4 text-slate-600">
                <a
                  href="https://buymeacoffee.com/luthfanmakl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-800 font-bold hover:underline transition-colors text-sm inline-flex items-center gap-1.5"
                >
                  <span>☕</span>
                  <span>Buy Me a Coffee</span>
                </a>
                <span className="text-slate-300">•</span>
                <a
                  href="https://github.com/luthfan-tech/FollowThrough.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00638E] font-bold hover:underline transition-colors text-sm"
                >
                  GitHub Repository
                </a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
