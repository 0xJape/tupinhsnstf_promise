import { describe, expect, it } from "vitest";
import { guidanceForPhase } from "./guidance";

describe("guidanceForPhase", () => {
  it("provides guidance for every known phase only", () => {
    expect(guidanceForPhase("menstrual")?.tips).toHaveLength(3);
    expect(guidanceForPhase("follicular")?.tips).toHaveLength(3);
    expect(guidanceForPhase("ovulation")?.tips).toHaveLength(3);
    expect(guidanceForPhase("luteal")?.tips).toHaveLength(3);
    expect(guidanceForPhase("unknown")).toBeNull();
  });
});
