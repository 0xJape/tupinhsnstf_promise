import { describe, expect, it } from "vitest";
import { assessConfidence, CONFIDENCE_VERSION } from "./confidence";

describe("confidence-v1", () => {
  it("reports low confidence for screening-only data", () => {
    const result = assessConfidence({
      questionnaireComplete: true,
      hasBmi: false,
      periodLogCount: 0,
      validCycleIntervalCount: 0,
      detailedPeriodLogCount: 0,
      lifestyleBaselineComplete: false,
    });

    expect(result).toMatchObject({
      version: CONFIDENCE_VERSION,
      score: 30,
      band: "Low",
    });
    expect(result.reasons).toContain("Add period logs for cycle context");
  });

  it("reports moderate confidence for partial history", () => {
    const result = assessConfidence({
      questionnaireComplete: true,
      hasBmi: true,
      periodLogCount: 3,
      validCycleIntervalCount: 1,
      detailedPeriodLogCount: 1,
      lifestyleBaselineComplete: false,
    });

    expect(result.score).toBe(65);
    expect(result.band).toBe("Moderate");
  });

  it("reports high confidence for complete longitudinal context", () => {
    const result = assessConfidence({
      questionnaireComplete: true,
      hasBmi: true,
      periodLogCount: 6,
      validCycleIntervalCount: 5,
      detailedPeriodLogCount: 6,
      lifestyleBaselineComplete: true,
    });

    expect(result.score).toBe(100);
    expect(result.band).toBe("High");
  });

  it("does not permit invalid counts to increase confidence", () => {
    const result = assessConfidence({
      questionnaireComplete: false,
      hasBmi: false,
      periodLogCount: Number.NaN,
      validCycleIntervalCount: -1,
      detailedPeriodLogCount: Infinity,
      lifestyleBaselineComplete: false,
    });

    expect(result.score).toBe(0);
    expect(result.band).toBe("Low");
  });
});
