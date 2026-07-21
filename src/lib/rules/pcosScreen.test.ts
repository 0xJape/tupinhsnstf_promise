import { describe, expect, it } from "vitest";
import {
  categoryFromDomains,
  gynecologicAgeYears,
  RULE_VERSION,
  scoreAssessment,
} from "./pcosScreen";
import type { ScreeningAnswers } from "@/types/screening";

function base(partial: Partial<ScreeningAnswers> = {}): ScreeningAnswers {
  return {
    menarcheAgeYears: 12,
    cycleIrregular: false,
    gap90: false,
    skippedMonths: false,
    hirsutism: false,
    acnePersistent: false,
    scalpThinning: false,
    elevatedTestosterone: false,
    weightHard: false,
    rapidWeightGain: false,
    acanthosis: false,
    skinTags: false,
    metabolicHistory: false,
    familyPcos: false,
    familyDiabetes: false,
    lowActivity: false,
    shortSleep: false,
    unhealthyDiet: false,
    hormonalMeds: false,
    ultrasoundPcom: false,
    amhTested: false,
    moodConcern: false,
    ...partial,
  };
}

describe("pcos-screen-v2", () => {
  it("exports rule version", () => {
    expect(RULE_VERSION).toBe("pcos-screen-v2");
  });

  it("T1: both majors -> High", () => {
    const r = scoreAssessment({
      answers: base({
        cycleIrregular: true,
        gap90: true,
        skippedMonths: true,
        hirsutism: true,
        acnePersistent: true,
      }),
      ageYears: 17,
      bmi: 22,
    });
    expect(r.domains.menstrual).toBeGreaterThanOrEqual(20);
    expect(r.domains.hyperandrogenism).toBeGreaterThanOrEqual(20);
    expect(r.category).toBe("High");
    expect(r.referralRecommended).toBe(true);
    expect(r.totalScore).toBeLessThanOrEqual(100);
  });

  it("T2: menstrual only major -> Moderate (at risk)", () => {
    const r = scoreAssessment({
      answers: base({
        cycleIrregular: true,
        gap90: true,
        skippedMonths: true,
      }),
      ageYears: 17,
      bmi: 21,
    });
    expect(r.domains.menstrual).toBeGreaterThanOrEqual(20);
    expect(r.domains.hyperandrogenism).toBeLessThan(15);
    expect(r.category).toBe("Moderate");
  });

  it("T3: HA only major -> Moderate", () => {
    const r = scoreAssessment({
      answers: base({
        elevatedTestosterone: true,
        hirsutism: true,
      }),
      ageYears: 16,
      bmi: 21,
    });
    expect(r.domains.hyperandrogenism).toBeGreaterThanOrEqual(20);
    expect(r.domains.menstrual).toBeLessThan(15);
    expect(r.category).toBe("Moderate");
  });

  it("T4: quiet answers -> Low", () => {
    const r = scoreAssessment({
      answers: base(),
      ageYears: 16,
      bmi: 20,
    });
    expect(r.category).toBe("Low");
    expect(r.totalScore).toBe(0);
    expect(r.referralRecommended).toBe(false);
  });

  it("T5: ultrasound/AMH/mood/hormonalMeds add 0 points", () => {
    const quiet = scoreAssessment({
      answers: base(),
      ageYears: 16,
      bmi: 20,
    });
    const flagged = scoreAssessment({
      answers: base({
        ultrasoundPcom: true,
        amhTested: true,
        moodConcern: true,
        hormonalMeds: true,
      }),
      ageYears: 16,
      bmi: 20,
    });
    expect(flagged.totalScore).toBe(quiet.totalScore);
    expect(flagged.excludedImagingNote).toBe(true);
    expect(flagged.mentalHealthFlag).toBe(true);
    expect(flagged.hormonalMeds).toBe(true);
  });

  it("T6: early post-menarche irregular cycles weigh less", () => {
    const early = scoreAssessment({
      answers: base({ menarcheAgeYears: 15, cycleIrregular: true }),
      ageYears: 15.5,
      bmi: 21,
    });
    const late = scoreAssessment({
      answers: base({ menarcheAgeYears: 12, cycleIrregular: true }),
      ageYears: 17,
      bmi: 21,
    });
    expect(early.domains.menstrual).toBeLessThan(late.domains.menstrual);
    expect(early.domains.menstrual).toBe(5);
    expect(late.domains.menstrual).toBe(22);
  });

  it("T7: BMI Asia-Pacific >=23 and >=30 flags", () => {
    const r = scoreAssessment({
      answers: base(),
      ageYears: 16,
      bmi: 31,
    });
    expect(r.domains.bmi).toBe(7);
    expect(r.contributingFactors.some((f) => f.id === "bmi23")).toBe(true);
    expect(r.contributingFactors.some((f) => f.id === "bmi30")).toBe(true);
  });

  it("T8: gynecologic age helper", () => {
    expect(gynecologicAgeYears(17, 12)).toBe(5);
    expect(gynecologicAgeYears(undefined, 12)).toBeNull();
  });

  it("categoryFromDomains: both majors High", () => {
    expect(
      categoryFromDomains(
        {
          menstrual: 25,
          hyperandrogenism: 22,
          family: 0,
          insulin: 0,
          bmi: 0,
          lifestyle: 0,
        },
        47,
      ),
    ).toBe("High");
  });
});