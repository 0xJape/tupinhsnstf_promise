import { describe, expect, it } from "vitest";
import { fitDistance } from "./anatomy-scene";

describe("anatomy camera framing", () => {
  it("fits bounding sphere on narrow phones and scales with model size", () => {
    expect(fitDistance(2, 0.5)).toBeGreaterThan(fitDistance(2, 1));
    expect(fitDistance(4, 1)).toBe(fitDistance(2, 1) * 2);
    for (const aspect of [0.5, 1, 2]) {
      const angle = Math.min(Math.PI / 8, Math.atan(Math.tan(Math.PI / 8) * aspect));
      expect(fitDistance(2, aspect) * Math.sin(angle)).toBeGreaterThan(2);
    }
  });
  it("rejects empty or invalid bounds", () => {
    for (const radius of [0, -1, NaN, Infinity]) expect(() => fitDistance(radius, 1)).toThrow();
    expect(() => fitDistance(1, 0)).toThrow();
  });
});