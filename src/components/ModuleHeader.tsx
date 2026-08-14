import Link from "next/link";
import StaleDataBanner from "./StaleDataBanner";

interface Props {
  eyebrow: string;
  title: string;
  description?: string;
  isStale?: boolean;
}

// The lighter header used by every module page except Home — the gradient
// masthead is reserved as Home's one deliberate visual "moment", not
// scattered across every screen.
export default function ModuleHeader({ eyebrow, title, description, isStale = false }: Props) {
  return (
    <>
      <header className="border-b border-zinc-200 bg-background px-4 pb-6 pt-6 md:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="text-xs font-semibold text-zinc-500 transition-colors hover:text-brand-light"
          >
            ← Home
          </Link>
          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-brand-light">
            {eyebrow}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 max-w-md text-sm leading-relaxed text-zinc-500">{description}</p>
          )}
        </div>
      </header>

      {isStale && <StaleDataBanner />}
    </>
  );
}
