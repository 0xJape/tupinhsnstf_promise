import { assert, describe, it } from "vitest";
import { MAKE_EVENT_TYPES, TEMPLATE_KEYS } from "./types";

describe("make types", () => {
  it("every event has a template key", () => {
    for (const t of MAKE_EVENT_TYPES) {
      assert.ok(TEMPLATE_KEYS[t], t);
      assert.match(TEMPLATE_KEYS[t], /_v\d+$/);
    }
  });

  it("includes care_referral for opt-in desk routing", () => {
    assert.ok(MAKE_EVENT_TYPES.includes("care_referral"));
    assert.equal(TEMPLATE_KEYS.care_referral, "care_referral_v1");
  });
});
