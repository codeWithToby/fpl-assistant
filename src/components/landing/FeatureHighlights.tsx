import type { ReactNode } from "react";

interface Feature {
  title: string;
  description: string;
  icon: ReactNode;
}

const FEATURES: Feature[] = [
  {
    title: "Captain Call",
    description:
      "One recommended captain, backed by expected goal involvement, fixture difficulty, and current form — plus a Triple Captain flag when the pick clears a genuinely high bar.",
    icon: <path d="M4 1.5v13M4 2.5h7l-2 2.5 2 2.5H4" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    title: "Optimal XI",
    description:
      "Your best valid formation from your 15-man squad, with rotation-risk players flagged instead of silently benched.",
    icon: (
      <>
        <rect x="2" y="2" width="4.5" height="4.5" rx="1" />
        <rect x="9.5" y="2" width="4.5" height="4.5" rx="1" />
        <rect x="2" y="9.5" width="4.5" height="4.5" rx="1" />
        <rect x="9.5" y="9.5" width="4.5" height="4.5" rx="1" />
      </>
    ),
  },
  {
    title: "Defensive Watch",
    description:
      "Clean sheet probability for every defender and keeper in your squad, factored straight into who starts.",
    icon: (
      <path
        d="M8 1.5 13 3.5V7c0 4-2.2 6.3-5 7.5C5.2 13.3 3 11 3 7V3.5L8 1.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export default function FeatureHighlights() {
  return (
    <section className="border-t border-zinc-200 bg-zinc-50 px-4 py-16 md:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wide text-brand-light">
            What your assistant does today
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Built to answer one question at a time
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-[10px] bg-background p-6 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)]"
            >
              <svg
                className="h-6 w-6 text-brand-light"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                {f.icon}
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">{f.description}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-zinc-500">More of your weekly decisions are on the way.</p>
      </div>
    </section>
  );
}
