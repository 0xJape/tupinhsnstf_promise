import { describe, expect, it } from "vitest";
import {
  computeCycleInsights,
  cycleLengthsBetween,
  expandPeriodDays,
  expandPhaseDays,
} from "./insights";

describe("cycleLengthsBetween", () => {
  it("measures gaps between starts", () => {
    const lengths = cycleLengthsBetween([
      { start_date: "2026-01-01", duration_days: 5 },
      { start_date: "2026-01-29", duration_days: 5 },
      { start_date: "2026-02-26", duration_days: 4 },
    ]);
    expect(lengths).toEqual([28, 28]);
  });
});

describe("computeCycleInsights", () => {
  it("no data", () => {
    const i = computeCycleInsights([]);
    expect(i.status).toBe("no_data");
    expect(i.phase).toBe("unknown");
  });

  it("one log uses default 28-day cycle", () => {
    const i = computeCycleInsights(
      [{ start_date: "2026-07-01", duration_days: 5 }],
      new Date(2026, 6, 10), // Jul 10
    );
    expect(i.status).toBe("need_more");
    expect(i.nextExpectedStart).toBe("2026-07-29");
    expect(i.cycleDay).toBe(10);
    expect(i.phase).toBe("follicular");
  });

  it("detects delay past expected start", () => {
    const i = computeCycleInsights(
      [
        { start_date: "2026-05-01", duration_days: 5 },
        { start_date: "2026-05-29", duration_days: 5 }, // 28-day
      ],
      new Date(2026, 5, 30), // Jun 30; next expected Jun 26
    );
    expect(i.nextExpectedStart).toBe("2026-06-26");
    expect(i.delayedDays).toBe(4);
    expect(i.status).toBe("delayed");
  });

  it("menstrual phase on bleeding days", () => {
    const i = computeCycleInsights(
      [{ start_date: "2026-07-01", duration_days: 5 }],
      new Date(2026, 6, 3),
    );
    expect(i.phase).toBe("menstrual");
  });
});

describe("expandPeriodDays", () => {
  it("expands duration", () => {
    expect(
      expandPeriodDays([{ start_date: "2026-07-01", duration_days: 3 }]),
    ).toEqual(["2026-07-01", "2026-07-02", "2026-07-03"]);
  });
});

describe("expandPhaseDays", () => {
  it("color-bands a 28-day cycle", () => {
    const bands = expandPhaseDays("2026-07-01", 5, 28);
    expect(bands.menstrual).toEqual([
      "2026-07-01",
      "2026-07-02",
      "2026-07-03",
      "2026-07-04",
      "2026-07-05",
    ]);
    expect(bands.follicular[0]).toBe("2026-07-06");
    expect(bands.ovulation).toContain("2026-07-14"); // day 14 = 28-14
    expect(bands.luteal.at(-1)).toBe("2026-07-28");
    expect(
      bands.menstrual.length +
        bands.follicular.length +
        bands.ovulation.length +
        bands.luteal.length,
    ).toBe(28);
  });
});
