// Shared decorative pitch markings — touchline circle, halfway line, and a
// penalty box / six-yard box / goal mouth at each end. Used by both the
// build-phase pitch (BuildPitch) and the completed Optimal XI pitch
// (PitchFormation) so the two read as the same surface. Purely
// atmospheric, but it's what makes either read as a pitch.

// Tailwind's compiler needs full literal class strings, not interpolated
// ones — so top/bottom each get their own explicit set of classes rather
// than building "top-0"/"border-t-0" from a variable.
function GoalBox({ edge }: { edge: "top" | "bottom" }) {
  if (edge === "top") {
    return (
      <>
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 border-2 border-t-0 border-white/25"
          style={{ width: "42%", height: "13%" }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 border-2 border-t-0 border-white/25"
          style={{ width: "20%", height: "5.5%" }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-1 -translate-x-1/2 rounded-full bg-white/40"
          style={{ width: "12%" }}
        />
      </>
    );
  }
  return (
    <>
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 border-2 border-b-0 border-white/25"
        style={{ width: "42%", height: "13%" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 border-2 border-b-0 border-white/25"
        style={{ width: "20%", height: "5.5%" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-1 -translate-x-1/2 rounded-full bg-white/40"
        style={{ width: "12%" }}
      />
    </>
  );
}

export default function PitchMarkings() {
  return (
    <>
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/25 sm:h-28 sm:w-28" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40" />
      <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/25" />
      <GoalBox edge="top" />
      <GoalBox edge="bottom" />
    </>
  );
}
