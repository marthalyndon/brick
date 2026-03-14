import type { ReactNode } from "react";
import { MobileNav } from "@/components/nav/MobileNav";
import { DesktopNav } from "@/components/nav/DesktopNav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-core-gray-100">
      <DesktopNav />
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        {children}
      </main>
      <div className="md:hidden">
        <MobileNav />
      </div>
    </div>
  );
}
