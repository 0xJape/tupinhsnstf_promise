"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  notification?: React.ReactNode;
};

/** Slim app top bar — brand left, theme + notifications right. */
export function TopBar({ className, notification }: Props) {
  return (
    <header
      className={cn("sticky top-0 z-30 px-3 pt-2", className)}
      style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
    >
      {notification}
         <div className="app-health-header mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/home"
          className="group flex min-w-0 items-center gap-2.5"
        >
          <BrandLogo size={32} className="shrink-0" priority />
          <span className="font-display truncate text-[13px] font-extrabold tracking-[0.12em] text-foreground">
            P.R.O.M.I.S.E.
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-0.5">
          <ThemeToggle className="text-foreground hover:bg-primary/8" />
          <Link
            href="/profile/notifications"
            className="relative flex size-10 shrink-0 items-center justify-center rounded-[16px] text-muted-foreground hover:bg-primary/8 hover:text-primary active:scale-95"
            aria-label="Notifications"
          >
            <Bell className="size-5" strokeWidth={1.75} aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
}
