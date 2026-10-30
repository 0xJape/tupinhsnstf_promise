type Props = { values?: Partial<Record<"Sleep" | "Energy" | "Mood" | "Pain" | "Movement", number>> };

const axes = ["Sleep", "Energy", "Mood", "Pain", "Movement"] as const;
const points = (values: Record<string, number>) => axes.map((_, i) => {
  const angle = -Math.PI / 2 + (i * Math.PI * 2) / axes.length;
  const radius = 38 * (values[axes[i]] / 10);
  return `${50 + Math.cos(angle) * radius},${50 + Math.sin(angle) * radius}`;
}).join(" ");

export function WellnessWeb({ values = {} }: Props) {
  const complete = axes.filter((axis) => values[axis] != null).length;
  const normalized = Object.fromEntries(axes.map((axis) => [axis, values[axis] ?? 0])) as Record<string, number>;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="size-32 shrink-0" role="img" aria-label={`Wellness web with ${complete} of ${axes.length} measures recorded`}>
        {[10, 6.7, 3.3].map((radius) => <polygon key={radius} points={axes.map((_, i) => { const angle = -Math.PI / 2 + (i * Math.PI * 2) / axes.length; return `${50 + Math.cos(angle) * radius},${50 + Math.sin(angle) * radius}`; }).join(" ")} fill="none" stroke="currentColor" strokeOpacity=".14" strokeWidth=".7" />)}
        {axes.map((axis, i) => { const angle = -Math.PI / 2 + (i * Math.PI * 2) / axes.length; return <line key={axis} x1="50" y1="50" x2={50 + Math.cos(angle) * 38} y2={50 + Math.sin(angle) * 38} stroke="currentColor" strokeOpacity=".12" />; })}
        {complete > 0 && <polygon points={points(normalized)} fill="var(--primary)" fillOpacity=".18" stroke="var(--primary)" strokeWidth="1.5" />}
      </svg>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {axes.map((axis) => <div key={axis} className="flex items-center gap-1.5 text-muted-foreground"><span className="size-1.5 rounded-full bg-primary/60" />{axis}<strong className="text-foreground">{values[axis] ?? "—"}</strong></div>)}
        <p className="col-span-2 pt-1 text-[11px] text-muted-foreground">Daily reflection, not a medical score.</p>
      </div>
    </div>
  );
}
