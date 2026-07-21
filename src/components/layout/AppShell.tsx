import { BottomNav } from "@/components/layout/BottomNav";
import { TopBar } from "@/components/layout/TopBar";

type Props = {
  children: React.ReactNode;
  /** Hide bottom nav (e.g. focused quiz). */
  hideNav?: boolean;
  /** Hide top bar (rare focused flows). */
  hideTop?: boolean;
};

export function AppShell({ children, hideNav, hideTop }: Props) {
  return (
    <div className="app-column relative mx-auto flex min-h-full w-full max-w-lg flex-col">
      {!hideTop ? <TopBar /> : null}
      <main
        className={
          hideNav
            ? "page-enter flex-1 space-y-6 px-5 py-6"
            : "page-enter flex-1 space-y-6 px-5 pb-28 pt-6"
        }
      >
        {children}
      </main>
      {!hideNav ? <BottomNav /> : null}
    </div>
  );
}

