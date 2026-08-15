import type { Metadata } from "next";
import FeedbackForm from "@/components/FeedbackForm";

export const metadata: Metadata = {
  title: "Feedback — Armband",
  description: "Tell Armband what's working, what's broken, or what you want next.",
};

export default function FeedbackPage() {
  return (
    <main className="flex-1 px-4 py-16 md:py-24 lg:px-8">
      <div className="mx-auto max-w-xl text-center">
        <span className="text-xs font-bold uppercase tracking-wide text-brand-light dark:text-pitch">
          Get in touch
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Questions, bugs, or feedback — we&apos;d like to hear it.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 md:text-base">
          Drop a note below — no account needed, it goes straight to us.
        </p>

        <div className="mt-8 text-left">
          <FeedbackForm />
        </div>
      </div>
    </main>
  );
}
