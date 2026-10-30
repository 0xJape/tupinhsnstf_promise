export type SymptomChartRecord = {
  symptom: string;
  occurred_on: string;
  severity: number;
};

export type ChartPoint = SymptomChartRecord & { timestamp: number };

export function prepareJourneyChart(records: SymptomChartRecord[], selectedSymptoms: string[]) {
  const selected = new Set(selectedSymptoms.slice(0, 2));
  return records
    .filter((record) => selected.has(record.symptom) && /^\d{4}-\d{2}-\d{2}$/.test(record.occurred_on) && Number.isFinite(record.severity))
    .map((record) => ({ ...record, timestamp: Date.parse(`${record.occurred_on}T00:00:00Z`) }))
    .filter((record) => Number.isFinite(record.timestamp))
    .sort((a, b) => a.timestamp - b.timestamp || a.symptom.localeCompare(b.symptom));
}
