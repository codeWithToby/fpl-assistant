// Small mock formation used purely to illustrate the real pitch layout —
// dots stand in for player cards since names aren't legible at this scale.
// Shared by the landing page's Feature Highlights and the How It Works page.
export default function PitchPreviewMini() {
  return (
    <div
      className="relative h-24 overflow-hidden rounded-[8px] p-2"
      style={{
        background:
          "repeating-linear-gradient(180deg, var(--grass) 0px, var(--grass) 10px, var(--grass-dark) 10px, var(--grass-dark) 20px)",
      }}
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
      <span className="absolute right-2 top-2 rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-bold text-white">
        4-3-3
      </span>
      <div className="relative flex h-full flex-col justify-between py-1">
        <div className="flex justify-center gap-2.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full bg-white shadow-sm" />
          ))}
        </div>
        <div className="flex justify-evenly gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full bg-white shadow-sm" />
          ))}
        </div>
        <div className="flex justify-center gap-2.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full bg-white shadow-sm" />
          ))}
        </div>
      </div>
    </div>
  );
}
