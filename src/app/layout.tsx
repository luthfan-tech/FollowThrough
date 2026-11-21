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
      <body className="min-h-screen bg-[#000000] text-white antialiased selection:bg-[#00638E] selection:text-white">
        <div className="relative min-h-screen flex flex-col">
          {/* Subtle background Azure glow */}
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-b from-[#00638E]/15 via-[#004A6B]/10 to-transparent blur-3xl" />
          </div>

          <Navbar />
          <main className="relative z-10 flex-1">{children}</main>

          <footer className="relative z-10 border-t border-[#2B2B2B] bg-[#000000] py-8 text-xs text-slate-400">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative h-7 w-7 overflow-hidden rounded-lg border border-[#00638E]/50 bg-[#141414]">
                  <Image
                    src="/brand-logo.jpg"
                    alt="FollowThrough Logo"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="font-bold text-white">FollowThrough</span>
                  <span className="mx-2 text-[#2B2B2B]">•</span>
                  <span className="text-slate-400">Agentic AI Hackathon 2026</span>
                </div>
              </div>

              <p className="text-slate-300 text-center sm:text-right font-medium">
                “Meetings create decisions. FollowThrough makes sure they get executed.”
              </p>

              <div className="flex items-center gap-4 text-slate-400">
                <a
                  href="https://github.com/luthfan-tech/FollowThrough.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#BFD8E3] transition-colors"
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
