const STEPS = [
  {
    title: "Build your 15",
    description:
      "Search for your real squad, or generate a random one instantly to see it in action.",
  },
  {
    title: "Get your calls",
    description:
      "Captain pick, starting XI, and defensive picks — each with one plain-language reason, not a ranked table you have to interpret.",
  },
  {
    title: "Trust it or check it",
    description:
      "Every recommendation shows its reasoning, so you can apply your own judgment on anything the model can't see.",
  },
];

export default function HowItWorks() {
  return (
    <section className="px-4 py-16 md:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wide text-brand-light dark:text-pitch">
            How it works
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            From squad to decision in three steps
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
