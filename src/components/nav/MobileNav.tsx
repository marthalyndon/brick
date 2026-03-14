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

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-core-background border-t border-core-gray-200 flex justify-around py-2">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 ${
              active ? "text-core-accent" : "text-core-gray-400"
            }`}
          >
            <Icon className="size-6" />
            <span className="text-[11px] font-medium leading-none">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
