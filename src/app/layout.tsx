import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "FollowThrough | Meeting-to-Execution Agent",
  description: "Meetings create decisions. FollowThrough makes sure they get executed. An autonomous, human-in-the-loop Agentic AI execution engine.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <div className="relative min-h-screen flex flex-col">
          {/* Subtle background glow */}
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl" />
          </div>

          <Navbar />
          <main className="relative z-10 flex-1">{children}</main>

          <footer className="relative z-10 border-t border-slate-800/60 bg-[#070a12] py-6 text-center text-xs text-slate-500">
            <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>
                <span className="font-semibold text-slate-400">FollowThrough</span> — Built for the Agentic AI Hackathon
              </p>
              <p className="text-slate-400">
                “Meetings create decisions. FollowThrough makes sure they get executed.”
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
