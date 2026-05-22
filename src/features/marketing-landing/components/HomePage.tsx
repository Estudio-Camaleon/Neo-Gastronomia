// src/features/marketing-landing/components/HomePage.tsx
"use client";

import { Navbar } from "@/features/marketing-landing/components/shared/Navbar";
import { Footer } from "@/features/marketing-landing/components/shared/Footer";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { Pricing } from "./Pricing";
import { Testimonials } from "./Testimonials";
import "../style/home.css";

export function HomePage() {
  return (
    <div className="neo-home font-sans selection:bg-[var(--theme-primary-soft)] selection:text-[var(--theme-text)] min-h-screen px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
      <div className="neo-home-shell relative mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1720px] flex-col rounded-[28px] border border-[var(--theme-border)] bg-[linear-gradient(180deg,rgba(250,248,242,0.9),rgba(247,244,236,0.96))] shadow-[0_24px_80px_rgba(31,107,61,0.08)] sm:rounded-[36px] lg:rounded-[44px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_top_left,rgba(141,187,122,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(31,107,61,0.08),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.12))]"
        />

        <div className="relative flex min-h-[calc(100vh-1.5rem)] flex-col">
          <Navbar />

          <main className="flex-grow">
            <Hero />
            <Features />
            <Pricing />
            <Testimonials />
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}
