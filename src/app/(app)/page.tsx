export default function HomePage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Today</h1>
      {/* Next workout card — placeholder */}
      <div className="rounded-xl border border-zinc-200 p-4 mb-4">
        <p className="text-sm text-zinc-500">Next workout</p>
        <p className="text-zinc-400 mt-2 text-sm">No active plan. Create one in Plan →</p>
      </div>
      {/* Week overview — placeholder */}
      <h2 className="text-lg font-medium mb-2">This Week</h2>
      <div className="grid grid-cols-7 gap-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-xs text-zinc-400">{d}</span>
            <div className="w-8 h-8 rounded-full bg-zinc-100 mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
