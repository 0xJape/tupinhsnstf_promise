import { BrandLogo } from "@/components/shared/BrandLogo";
import { LandingBackground } from "@/components/marketing/LandingBackground";

type Props = {
  children: React.ReactNode;
};

export function PublicShell({ children }: Props) {
  return (
    <div className="relative min-h-full overflow-hidden">
      <LandingBackground />
      <div className="cinematic-app-shell app-column page-enter relative z-10 mx-auto flex min-h-full w-full max-w-lg flex-col px-5 py-8 sm:px-6">
        <div className="cinematic-app-header mb-8 flex items-center gap-2.5 px-4 py-3">
          <BrandLogo size={32} className="shrink-0" />
          <span className="font-display text-[13px] font-extrabold tracking-[0.12em] text-white">
            P.R.O.M.I.S.E.
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
