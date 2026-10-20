import { describe, expect, it } from "vitest";
import { photoObservationSchema } from "./photoAssessment";

describe("photoObservationSchema", () => {
  it("accepts only constrained non-diagnostic observations", () => {
    expect(photoObservationSchema.safeParse({ acneLikeSpots: "possibly_observed", coarseFacialHair: "unclear", imageQuality: "limited", limitations: ["Low light"] }).success).toBe(true);
    expect(photoObservationSchema.safeParse({ acneLikeSpots: "severe", coarseFacialHair: "not_observed", imageQuality: "adequate", limitations: [], diagnosis: "PCOS" }).success).toBe(false);
  });
});
