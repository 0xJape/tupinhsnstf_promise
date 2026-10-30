import { describe, expect, it } from "vitest";
import { prepareJourneyChart } from "./journey-chart";

describe("prepareJourneyChart", () => {
  it("filters unselected symptoms and sorts sparse records by date", () => {
    const records = [
      { symptom: "Fatigue", occurred_on: "2026-10-10", severity: 4 },
      { symptom: "Acne", occurred_on: "2026-09-01", severity: 2 },
      { symptom: "Fatigue", occurred_on: "2026-08-01", severity: 1 },
      { symptom: "Other", occurred_on: "2026-07-01", severity: 5 },
    ];
    expect(prepareJourneyChart(records, ["Fatigue", "Acne"]).map(({ symptom, occurred_on }) => [symptom, occurred_on])).toEqual([
      ["Fatigue", "2026-08-01"], ["Acne", "2026-09-01"], ["Fatigue", "2026-10-10"],
    ]);
  });
});