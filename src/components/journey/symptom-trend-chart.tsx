"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { prepareJourneyChart, type SymptomChartRecord } from "@/lib/journey-chart";

type Props = {
  records: SymptomChartRecord[];
  periodStartDates: string[];
  selectedSymptoms: string[];
};

const COLORS = ["#7c3aed", "#0891b2"];
const PAD = { top: 28, right: 18, bottom: 44, left: 40 };

export function SymptomTrendChart({ records, periodStartDates, selectedSymptoms }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useMemo(() => prepareJourneyChart(records, selectedSymptoms), [records, selectedSymptoms]);
  const periods = useMemo(() => periodStartDates.map((date) => ({ date, timestamp: Date.parse(`${date}T00:00:00Z`) })).filter((period) => Number.isFinite(period.timestamp)), [periodStartDates]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [size, setSize] = useState({ width: 720, height: 340 });
  const minTime = Math.min(...points.map((point) => point.timestamp));
  const maxTime = Math.max(...points.map((point) => point.timestamp));
  const span = Math.max(maxTime - minTime, 86_400_000);
  const x = (timestamp: number) => PAD.left + ((timestamp - minTime) / span) * (size.width - PAD.left - PAD.right);
  const y = (severity: number) => PAD.top + ((5 - severity) / 4) * (size.height - PAD.top - PAD.bottom);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: Math.max(320, Math.round(entry.contentRect.width)), height: 340 }));
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !points.length) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = size.width * ratio;
    canvas.height = size.height * ratio;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.scale(ratio, ratio);
    context.clearRect(0, 0, size.width, size.height);
    context.font = "12px system-ui";
    context.textAlign = "right";
    context.textBaseline = "middle";
    for (let severity = 1; severity <= 5; severity++) {
      const rowY = y(severity);
      context.strokeStyle = "rgba(100, 116, 139, .2)";
      context.beginPath(); context.moveTo(PAD.left, rowY); context.lineTo(size.width - PAD.right, rowY); context.stroke();
      context.fillStyle = "#64748b"; context.fillText(String(severity), PAD.left - 10, rowY);
    }
    context.textAlign = "center";
    for (let tick = 0; tick < 4; tick++) {
      const timestamp = minTime + (span * tick) / 3;
      context.fillStyle = "#64748b";
      context.fillText(formatShortDate(timestamp), x(timestamp), size.height - 18);
    }
    periods.forEach((period) => {
      if (period.timestamp < minTime || period.timestamp > maxTime) return;
      const periodX = x(period.timestamp);
      context.strokeStyle = "rgba(225, 29, 72, .55)"; context.setLineDash([4, 4]);
      context.beginPath(); context.moveTo(periodX, PAD.top); context.lineTo(periodX, size.height - PAD.bottom); context.stroke();
      context.setLineDash([]);
    });
    selectedSymptoms.forEach((symptom, seriesIndex) => {
      const series = points.filter((point) => point.symptom === symptom);
      context.strokeStyle = COLORS[seriesIndex]; context.fillStyle = COLORS[seriesIndex]; context.lineWidth = 2.5;
      context.beginPath();
      series.forEach((point, index) => index ? context.lineTo(x(point.timestamp), y(point.severity)) : context.moveTo(x(point.timestamp), y(point.severity)));
      context.stroke();
      series.forEach((point) => { context.beginPath(); context.arc(x(point.timestamp), y(point.severity), 4, 0, Math.PI * 2); context.fill(); });
    });
    if (hovered !== null && points[hovered]) {
      const point = points[hovered];
      context.strokeStyle = "rgba(15, 23, 42, .35)";
      context.beginPath(); context.moveTo(x(point.timestamp), PAD.top); context.lineTo(x(point.timestamp), size.height - PAD.bottom); context.stroke();
    }
  }, [points, periods, selectedSymptoms, size, hovered, minTime, maxTime, span]);

  function selectNearest(clientX: number, clientY: number) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pointerX = clientX - rect.left;
    const pointerY = clientY - rect.top;
    let nearest = 0;
    const distance = (point: (typeof points)[number]) => Math.hypot(x(point.timestamp) - pointerX, y(point.severity) - pointerY);
    points.forEach((point, index) => { if (distance(point) < distance(points[nearest])) nearest = index; });
    setHovered(nearest);
  }

  if (!points.length) return <p className="mt-3 text-sm text-muted-foreground">Select one or two symptoms with recorded severity to show chart.</p>;
  const activePoint = hovered === null ? null : points[hovered];
  return <div className="mt-4">
    <div className="flex flex-wrap gap-4 text-sm" aria-label="Chart legend">
      {selectedSymptoms.map((symptom, index) => <span key={symptom} className="flex items-center gap-2"><span className="size-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />{symptom}</span>)}
      {periods.length ? <span className="flex items-center gap-2"><span className="h-4 border-l-2 border-dashed border-rose-600" />Recorded period start</span> : null}
    </div>
    <div className="relative mt-3 overflow-hidden rounded-2xl border border-border bg-background">
      <canvas ref={canvasRef} className="block h-[340px] w-full touch-none" role="img" aria-label={`Severity chart from 1 to 5 for ${selectedSymptoms.join(" and ")}. Interactive details are also available in the table below.`}
        onPointerMove={(event) => selectNearest(event.clientX, event.clientY)} onPointerDown={(event) => selectNearest(event.clientX, event.clientY)} onPointerLeave={() => setHovered(null)} />
      {activePoint ? <div className="pointer-events-none absolute left-3 top-3 rounded-xl border border-border bg-background/95 px-3 py-2 text-xs shadow-sm" role="status"><strong>{activePoint.symptom}</strong><br />{formatLongDate(activePoint.timestamp)} · Severity {activePoint.severity}/5</div> : null}
    </div>
    <p className="mt-3 text-xs text-muted-foreground">Lines connect self-reported entries; gaps mean no entry was recorded. Period markers provide timing context only and do not imply causation.</p>
    <details className="mt-3"><summary className="cursor-pointer text-sm font-medium">Text summary and data table</summary>
      <p className="mt-2 text-sm text-muted-foreground">{selectedSymptoms.map((symptom) => { const series = points.filter((point) => point.symptom === symptom); return `${symptom}: ${series.length} ${series.length === 1 ? "entry" : "entries"}, severity ${Math.min(...series.map((point) => point.severity))}–${Math.max(...series.map((point) => point.severity))} of 5.`; }).join(" ")}</p>
      <div className="mt-2 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-border"><th className="p-2">Date</th><th className="p-2">Symptom</th><th className="p-2">Severity</th></tr></thead><tbody>{points.map((point, index) => <tr key={`${point.symptom}-${point.occurred_on}-${index}`} className="border-b border-border/60"><td className="p-2">{formatLongDate(point.timestamp)}</td><td className="p-2">{point.symptom}</td><td className="p-2">{point.severity}/5</td></tr>)}</tbody></table></div>
    </details>
  </div>;
}

function formatShortDate(timestamp: number) { return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", timeZone: "UTC" }).format(timestamp); }
function formatLongDate(timestamp: number) { return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(timestamp); }