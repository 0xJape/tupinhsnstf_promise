import { BrandLogo } from "@/components/shared/BrandLogo";

type Props = {
  children: React.ReactNode;
};

export function PublicShell({ children }: Props) {
  return (
    <div className="app-column page-enter mx-auto flex min-h-full w-full max-w-lg flex-col px-5 py-8 sm:px-6">
      <div className="clay-nav mb-8 flex items-center gap-2.5 px-4 py-3">
        <BrandLogo size={32} className="shrink-0" />
        <span className="font-display text-[13px] font-extrabold tracking-[0.12em] text-foreground">
          P.R.O.M.I.S.E.
        </span>
      </div>
      {children}
    </div>
  );
}
