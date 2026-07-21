import type { ReactNode } from "react";

/**
 * Educational illustration cards — screening journey, not diagnosis.
 * Pure SVG (no stock photos / no new deps).
 */

export type EducationSceneId =
  | "cycle"
  | "symptoms"
  | "quiz"
  | "result"
  | "clinic";

export type EducationScene = {
  id: EducationSceneId;
  title: string;
  caption: string;
};

export const EDUCATION_SCENES: EducationScene[] = [
  {
    id: "cycle",
    title: "Track cycles",
    caption: "Period start dates and patterns help screening — not a diagnosis.",
  },
  {
    id: "symptoms",
    title: "Note body changes",
    caption: "Acne, hair growth, weight, and family history are common screening factors.",
  },
  {
    id: "quiz",
    title: "Answer Yes / No",
    caption: "A short questionnaire scores educational risk factors with fixed rules.",
  },
  {
    id: "result",
    title: "See Low / Moderate / High",
    caption: "Result is screening risk only. It never means “you have PCOS.”",
  },
  {
    id: "clinic",
    title: "Talk to a clinician",
    caption: "Only a qualified professional can evaluate PCOS with history, exam, and tests.",
  },
];

function Frame({ children }: { children: ReactNode }) { // React namespace via jsx runtime
  return (
    <svg
      viewBox="0 0 160 110"
      className="h-auto w-full"
      role="img"
      aria-hidden
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EDE4FF" />
          <stop offset="100%" stopColor="#F8F5FF" />
        </linearGradient>
      </defs>
      <rect width="160" height="110" rx="18" fill="url(#sky)" />
      {children}
    </svg>
  );
}

function SceneArt({ id }: { id: EducationSceneId }) {
  switch (id) {
    case "cycle":
      return (
        <Frame>
          {/* calendar */}
          <rect x="28" y="22" width="70" height="66" rx="10" fill="#fff" stroke="#C4B5FD" strokeWidth="2" />
          <rect x="28" y="22" width="70" height="16" rx="10" fill="#C94A68" />
          <circle cx="42" cy="52" r="4" fill="#DDD6FE" />
          <circle cx="56" cy="52" r="4" fill="#DDD6FE" />
          <circle cx="70" cy="52" r="4" fill="#9F2947" />
          <circle cx="84" cy="52" r="4" fill="#DDD6FE" />
          <circle cx="42" cy="68" r="4" fill="#DDD6FE" />
          <circle cx="56" cy="68" r="4" fill="#F0ABFC" />
          <circle cx="70" cy="68" r="4" fill="#DDD6FE" />
          {/* person note */}
          <circle cx="122" cy="40" r="12" fill="#FBCFE8" />
          <path d="M104 88c4-16 32-16 36 0" fill="#C4B5FD" />
          <rect x="112" y="54" width="20" height="14" rx="3" fill="#fff" stroke="#C94A68" />
        </Frame>
      );
    case "symptoms":
      return (
        <Frame>
          <circle cx="48" cy="48" r="22" fill="#FBCFE8" />
          <circle cx="48" cy="42" r="10" fill="#F9A8D4" />
          <path d="M30 78c6-14 30-14 36 0" fill="#E9D5FF" />
          {/* checklist cards */}
          <rect x="88" y="28" width="52" height="16" rx="6" fill="#fff" stroke="#C94A68" />
          <circle cx="98" cy="36" r="4" fill="#34D399" />
          <rect x="106" y="33" width="26" height="6" rx="2" fill="#DDD6FE" />
          <rect x="88" y="50" width="52" height="16" rx="6" fill="#fff" stroke="#C94A68" />
          <circle cx="98" cy="58" r="4" fill="#FBBF24" />
          <rect x="106" y="55" width="26" height="6" rx="2" fill="#DDD6FE" />
          <rect x="88" y="72" width="52" height="16" rx="6" fill="#fff" stroke="#C94A68" />
          <circle cx="98" cy="80" r="4" fill="#F472B6" />
          <rect x="106" y="77" width="26" height="6" rx="2" fill="#DDD6FE" />
        </Frame>
      );
    case "quiz":
      return (
        <Frame>
          <rect x="24" y="20" width="112" height="70" rx="14" fill="#fff" stroke="#C4B5FD" strokeWidth="2" />
          <rect x="36" y="34" width="72" height="8" rx="3" fill="#DDD6FE" />
          <rect x="36" y="48" width="88" height="6" rx="2" fill="#EDE9FE" />
          <rect x="36" y="60" width="40" height="18" rx="9" fill="#9F2947" />
          <text x="48" y="73" fontSize="10" fill="#fff" fontFamily="system-ui,sans-serif" fontWeight="700">
            Yes
          </text>
          <rect x="84" y="60" width="40" height="18" rx="9" fill="#fff" stroke="#C94A68" />
          <text x="96" y="73" fontSize="10" fill="#9F2947" fontFamily="system-ui,sans-serif" fontWeight="700">
            No
          </text>
        </Frame>
      );
    case "result":
      return (
        <Frame>
          {/* score ring */}
          <circle cx="52" cy="55" r="28" fill="#fff" stroke="#C4B5FD" strokeWidth="6" />
          <circle
            cx="52"
            cy="55"
            r="28"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="6"
            strokeDasharray="110 176"
            strokeLinecap="round"
            transform="rotate(-90 52 55)"
          />
          <text x="40" y="52" fontSize="9" fill="#92400E" fontFamily="system-ui,sans-serif" fontWeight="700">
            Mod
          </text>
          <text x="36" y="64" fontSize="8" fill="#78716C" fontFamily="system-ui,sans-serif">
            screen
          </text>
          <rect x="92" y="30" width="48" height="14" rx="7" fill="#D1FAE5" />
          <text x="102" y="40" fontSize="8" fill="#065F46" fontFamily="system-ui,sans-serif" fontWeight="700">
            Low
          </text>
          <rect x="92" y="50" width="48" height="14" rx="7" fill="#FEF3C7" />
          <text x="96" y="60" fontSize="8" fill="#92400E" fontFamily="system-ui,sans-serif" fontWeight="700">
            Moderate
          </text>
          <rect x="92" y="70" width="48" height="14" rx="7" fill="#FFE4E6" />
          <text x="102" y="80" fontSize="8" fill="#9F1239" fontFamily="system-ui,sans-serif" fontWeight="700">
            High
          </text>
        </Frame>
      );
    case "clinic":
      return (
        <Frame>
          {/* clinic building */}
          <rect x="24" y="40" width="56" height="48" rx="6" fill="#fff" stroke="#C94A68" strokeWidth="2" />
          <rect x="40" y="58" width="16" height="30" rx="2" fill="#C4B5FD" />
          <rect x="30" y="48" width="12" height="10" rx="2" fill="#DDD6FE" />
          <rect x="62" y="48" width="12" height="10" rx="2" fill="#DDD6FE" />
          <path d="M24 40 L52 22 L80 40" fill="#C94A68" />
          <rect x="48" y="26" width="8" height="12" fill="#F472B6" />
          {/* clinician + patient abstract */}
          <circle cx="110" cy="48" r="10" fill="#FDE68A" />
          <path d="M96 88c4-16 28-16 32 0" fill="#93C5FD" />
          <circle cx="132" cy="56" r="9" fill="#FBCFE8" />
          <path d="M120 88c3-12 22-12 26 0" fill="#C4B5FD" />
        </Frame>
      );
  }
}

export function EducationSceneCard({
  scene,
  active,
  onSelect,
}: {
  scene: EducationScene;
  active?: boolean;
  onSelect?: (id: EducationSceneId) => void;
}) {
  const className =
    "surface-panel w-[148px] shrink-0 snap-start rounded-3xl p-2 text-left transition hover:-translate-y-0.5 hover:bg-accent " +
    (active ? "ring-2 ring-[#9F2947]/50" : "");

  const body = (
    <>
      <SceneArt id={scene.id} />
      <p className="mt-2 px-1 text-xs font-bold text-foreground">{scene.title}</p>
      <p className="mt-0.5 px-1 pb-1 text-[10px] leading-snug text-muted-foreground">
        {scene.caption}
      </p>
    </>
  );

  if (!onSelect) {
    return <div className={className}>{body}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(scene.id)}
      className={className}
    >
      {body}
    </button>
  );
}

export function EducationSceneStrip({
  onSelect,
  activeId,
}: {
  onSelect?: (id: EducationSceneId) => void;
  activeId?: EducationSceneId;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
          How screening works
        </p>
        <p className="text-[10px] font-medium text-muted-foreground">
          Not a diagnosis
        </p>
      </div>
      <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 snap-x snap-mandatory">
        {EDUCATION_SCENES.map((scene) => (
          <EducationSceneCard
            key={scene.id}
            scene={scene}
            active={activeId === scene.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

/** Plain-language explainers tied to each scene (for chat insert). */
export function sceneExplainPrompt(id: EducationSceneId): string {
  switch (id) {
    case "cycle":
      return "Explain how tracking period start dates helps PCOS risk screening, without diagnosing.";
    case "symptoms":
      return "Explain common body changes used in educational PCOS screening (skin, hair, weight, family history) — not a diagnosis.";
    case "quiz":
      return "Explain how the Yes/No screening questionnaire works and that rules compute the score, not the AI.";
    case "result":
      return "What do Low, Moderate, and High screening results mean? Remind me this is not a PCOS diagnosis.";
    case "clinic":
      return "How should I prepare to talk with a clinician about possible PCOS evaluation?";
  }
}