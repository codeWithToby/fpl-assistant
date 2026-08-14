export default function TripleCaptainBadge() {
  return (
    // fpl.team pairs this exact green with dark-purple text, not white —
    // #00ff87 is too light for white text to sit on accessibly.
    <span className="inline-flex items-center gap-1.5 rounded-full bg-pitch px-3 py-1 text-xs font-bold text-brand">
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          d="M8 1.5 9.7 5l3.8.5-2.75 2.7.65 3.8L8 10.2l-3.4 1.8.65-3.8L2.5 5.5 6.3 5Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Triple Captain candidate
    </span>
  );
}
