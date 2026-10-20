import { BottomNav } from "@/components/layout/BottomNav";
import { TopBar } from "@/components/layout/TopBar";
import { LandingBackground } from "@/components/marketing/LandingBackground";
import Link from "next/link";
import { CalendarDays, ClipboardList, Home, MessageCircle, User } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";

type Props = {
  children: React.ReactNode;
  notification?: React.ReactNode;
  /** Hide bottom nav (e.g. focused quiz). */
  hideNav?: boolean;
  /** Hide top bar (rare focused flows). */
  hideTop?: boolean;
};

export function AppShell({ children, notification, hideNav, hideTop }: Props) {
  return (
    <div className="relative min-h-full overflow-hidden">
      <LandingBackground />
      <div className="cinematic-app-shell app-column relative z-10 mx-auto flex min-h-full w-full max-w-[1440px] flex-col">
        {!hideTop ? <aside className="app-desktop-sidebar fixed inset-y-0 left-0 z-40 hidden w-[17rem] border-r border-border bg-sidebar/90 lg:flex lg:flex-col">
          <Link href="/home" className="flex h-20 items-center gap-3 border-b border-border px-6">
            <BrandLogo size={38} priority />
            <span className="font-display text-sm font-extrabold tracking-[.12em]">P.R.O.M.I.S.E.</span>
          </Link>
          <nav className="space-y-2 p-4" aria-label="Main navigation">
            {[["/home", "Dashboard", Home], ["/cycle", "Cycle", CalendarDays], ["/screen", "Screening", ClipboardList], ["/assistant", "Assistant", MessageCircle], ["/profile", "Profile", User]].map(([href, label, Icon]) => <Link key={href as string} href={href as string} className="app-sidebar-link flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"><Icon className="size-4" aria-hidden />{label as string}</Link>)}
          </nav>
        </aside> : null}
        <div className="min-w-0 lg:pl-[17rem]">
        {!hideTop ? <TopBar notification={notification} /> : null}
        <main
          className={
            hideNav
              ? "page-enter mx-auto w-full max-w-7xl flex-1 space-y-6 px-5 py-6 sm:px-8 lg:px-8"
              : "page-enter mx-auto w-full max-w-7xl flex-1 space-y-6 px-5 pb-28 pt-6 sm:px-8 lg:px-8"
          }
        >
          {children}
        </main>
        {!hideNav ? <BottomNav /> : null}
        </div>
      </div>
    </div>
  );
}

