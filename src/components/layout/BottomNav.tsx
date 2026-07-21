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
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="glass-nav mx-auto flex max-w-lg items-stretch justify-between gap-0.5 rounded-[28px] p-1.5">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[20px] px-1 text-[10px] font-bold active:scale-[0.97]",
                active
                  ? "bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-[8px_8px_16px_color-mix(in_oklab,var(--primary)_35%,transparent),inset_2px_2px_6px_rgba(255,255,255,0.25)]"
                  : "text-muted-foreground hover:bg-accent hover:text-primary",
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
