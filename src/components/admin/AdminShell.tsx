import Link from "next/link";
import { ClipboardList, HeartHandshake, LayoutDashboard, LogOut, MessageSquareText, UsersRound } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import type { AdminRole } from "@/lib/admin";

async function logout() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
}

const navigation = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/participants", label: "Participants", icon: UsersRound },
  { href: "/admin/referrals", label: "Referrals", icon: HeartHandshake },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquareText },
];

export function AdminShell({ children, role }: { children: React.ReactNode; role: AdminRole }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="border-b border-border bg-sidebar/90 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0">
        <div className="flex h-16 items-center justify-between gap-3 px-4 lg:h-20 lg:px-6">
          <Link href="/admin" className="flex min-w-0 items-center gap-3">
            <BrandLogo size={38} priority />
            <div className="min-w-0"><p className="truncate font-display text-sm font-extrabold tracking-[0.12em]">P.R.O.M.I.S.E.</p><p className="text-xs text-muted-foreground">Operations</p></div>
          </Link>
          <ThemeToggle />
        </div>
        <nav className="flex gap-2 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-4 lg:py-4" aria-label="Admin navigation">
          {navigation.filter(({ href }) => role === "research_admin" || href === "/admin/referrals").map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="flex min-h-11 shrink-0 items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"><Icon className="size-4" aria-hidden />{label}</Link>)}
        </nav>
        <div className="px-4 pb-4 lg:absolute lg:inset-x-0 lg:bottom-0">
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-sidebar-border bg-background/55 p-3">
            <div><Badge variant="secondary">{role.replace("_", " ")}</Badge><p className="mt-1 text-[11px] text-muted-foreground">Authorized operations</p></div>
            <form action={logout}><button type="submit" className="flex size-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Sign out"><LogOut className="size-4" aria-hidden /></button></form>
          </div>
        </div>
      </aside>
      <main className="min-w-0"><div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-9">{children}<footer className="flex gap-2 border-t border-border pt-5 text-xs text-muted-foreground"><ClipboardList className="size-4" aria-hidden />Educational research operations · not clinical diagnosis or triage</footer></div></main>
    </div>
  );
}
