import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom navigation — mobile first */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 flex justify-around py-3 z-50">
        <Link href="/" className="flex flex-col items-center gap-1 text-xs text-zinc-500">
          <span className="text-xl">🏠</span>
          <span>Home</span>
        </Link>
        <Link href="/plan" className="flex flex-col items-center gap-1 text-xs text-zinc-500">
          <span className="text-xl">📅</span>
          <span>Plan</span>
        </Link>
        <Link href="/stats" className="flex flex-col items-center gap-1 text-xs text-zinc-500">
          <span className="text-xl">📊</span>
          <span>Stats</span>
        </Link>
      </nav>
    </div>
  );
}
