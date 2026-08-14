export default function StaleDataBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center lg:px-8">
      <p className="text-xs font-medium text-amber-800">
        Showing cached data — live FPL data is temporarily unavailable.
      </p>
    </div>
  );
}
