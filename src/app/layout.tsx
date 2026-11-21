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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-[#E06D53] selection:text-white">
        <div className="relative min-h-screen flex flex-col">
          {/* Subtle background glow */}
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-b from-[#E06D53]/10 via-[#2A8082]/10 to-transparent blur-3xl" />
          </div>

          <Navbar />
          <main className="relative z-10 flex-1">{children}</main>

          <footer className="relative z-10 border-t border-slate-800/80 bg-[#060911] py-8 text-xs text-slate-500">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative h-7 w-7 overflow-hidden rounded-lg border border-[#E06D53]/40 bg-white">
                  <Image
                    src="/brand-logo.jpg"
                    alt="FollowThrough Logo"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="font-bold text-slate-300">FollowThrough</span>
                  <span className="mx-2 text-slate-600">•</span>
                  <span className="text-slate-400">Agentic AI Hackathon 2026</span>
                </div>
              </div>

              <p className="text-slate-400 text-center sm:text-right font-medium">
                “Meetings create decisions. FollowThrough makes sure they get executed.”
              </p>

              <div className="flex items-center gap-4 text-slate-400">
                <a
                  href="https://github.com/luthfan-tech/FollowThrough.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
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
