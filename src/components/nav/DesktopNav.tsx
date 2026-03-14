"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Clock, BarChart2 } from "lucide-react";

const NAV_ITEMS = [
  { href: "/",        label: "Home",    Icon: Home         },
  { href: "/plan",    label: "Plan",    Icon: CalendarDays },
  { href: "/history", label: "History", Icon: Clock        },
  { href: "/stats",   label: "Stats",   Icon: BarChart2    },
];

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex flex-col w-[200px] min-h-screen bg-core-background border-r border-core-gray-200 px-4 py-6 gap-1 shrink-0">
      {/* App icon / logo area */}
      <div className="mb-6 px-2">
        <span className="text-[20px] font-bold text-core-accent tracking-tight">brick</span>
      </div>

      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-[var(--radius-m)]
              text-[14px] font-medium transition-colors
              ${active
                ? "bg-core-accent-light text-core-accent"
                : "text-core-gray-400 hover:bg-core-gray-100 hover:text-core-primary"
              }
            `.trim()}
          >
            <Icon className="size-5 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
