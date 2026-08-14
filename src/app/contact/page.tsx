import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — FPL Assistant",
  description: "Get in touch with FPL Assistant.",
};

export default function ContactPage() {
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
          Email us directly and we&apos;ll get back to you.
        </p>
        <a
          href="mailto:otuokeretoby@gmail.com"
          className="mt-8 inline-block rounded-[10px] bg-brand-light px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand"
        >
          otuokeretoby@gmail.com
        </a>
      </div>
    </main>
  );
}
