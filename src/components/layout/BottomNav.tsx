"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarDays,
  ClipboardList,
  MessageCircle,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/cycle", label: "Cycle", icon: CalendarDays },
  { href: "/screen", label: "Screen", icon: ClipboardList },
  { href: "/assistant", label: "Chat", icon: MessageCircle },
  { href: "/profile", label: "You", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 lg:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="cinematic-bottom-nav mx-auto flex max-w-lg items-stretch justify-between gap-0.5 rounded-[28px] p-1.5">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
                data-tour-tab={href}
              className={cn(
                "flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[20px] px-1 text-[10px] font-bold active:scale-[0.97]",
                active
                  ? "bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-[0_8px_16px_rgba(109,16,52,0.38)]"
                  : "text-rose-100/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon
                className="size-5"
                aria-hidden
                strokeWidth={active ? 2.25 : 1.75}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
