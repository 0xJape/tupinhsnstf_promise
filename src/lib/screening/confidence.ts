export const CONFIDENCE_VERSION = "confidence-v1" as const;

export type ConfidenceBand = "Low" | "Moderate" | "High";

/**
 * Evidence available to contextualize a screening result.
 * This measures record completeness, never PCOS likelihood or diagnosis certainty.
 */
export type ConfidenceInput = {
  questionnaireComplete: boolean;
  hasBmi: boolean;
  periodLogCount: number;
  validCycleIntervalCount: number;
  detailedPeriodLogCount: number;
  lifestyleBaselineComplete: boolean;
};

export type AssessmentConfidence = {
  version: typeof CONFIDENCE_VERSION;
  score: number;
  band: ConfidenceBand;
  reasons: string[];
};

function nonNegative(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

/** Deterministic data-completeness score for result-page context. */
export function assessConfidence(input: ConfidenceInput): AssessmentConfidence {
  const periodLogCount = nonNegative(input.periodLogCount);
  const validCycleIntervalCount = nonNegative(input.validCycleIntervalCount);
  const detailedPeriodLogCount = nonNegative(input.detailedPeriodLogCount);

  let score = 0;
  const reasons: string[] = [];

  if (input.questionnaireComplete) {
    score += 30;
    reasons.push("Complete screening questionnaire");
  } else {
    reasons.push("Some screening answers are missing");
  }

  if (input.hasBmi) {
    score += 15;
    reasons.push("Height and weight recorded");
  } else {
    reasons.push("Add height and weight for BMI context");
  }

  if (periodLogCount >= 6) {
    score += 25;
    reasons.push("Six or more period logs recorded");
  } else if (periodLogCount >= 3) {
    score += 15;
    reasons.push(`${periodLogCount} period logs recorded`);
  } else if (periodLogCount >= 1) {
    score += 5;
    reasons.push(`${periodLogCount} period log recorded`);
  } else {
    reasons.push("Add period logs for cycle context");
  }

  if (validCycleIntervalCount >= 3) {
    score += 10;
    reasons.push("Multiple cycle intervals available");
  } else if (validCycleIntervalCount >= 1) {
    score += 5;
    reasons.push("One cycle interval available");
  }

  if (detailedPeriodLogCount >= 3) {
    score += 10;
    reasons.push("Period flow, duration, and pain details recorded");
  } else if (periodLogCount > 0) {
    reasons.push("Add flow, duration, and pain details to period logs");
  }

  if (input.lifestyleBaselineComplete) {
    score += 10;
    reasons.push("Lifestyle baseline recorded");
  } else {
    reasons.push("Complete lifestyle baseline for more context");
  }

  const normalizedScore = Math.min(100, score);
  const band: ConfidenceBand =
    normalizedScore >= 75 ? "High" : normalizedScore >= 45 ? "Moderate" : "Low";

  return {
    version: CONFIDENCE_VERSION,
    score: normalizedScore,
    band,
    reasons: reasons.slice(0, 4),
  };
}
