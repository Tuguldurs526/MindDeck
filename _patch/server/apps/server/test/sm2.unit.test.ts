import { describe, it, expect } from "vitest";
import { nextSM2 } from "../src/utils/sm2.js";

describe("SM-2 helper", () => {
  it("handles first successful reviews", () => {
    const s1 = nextSM2({ repetition: 0, interval: 0, efactor: 2.5 }, "good");
    expect(s1.repetition).toBe(1);
    expect(s1.interval).toBe(1);
    const s2 = nextSM2(s1, "good");
    expect(s2.repetition).toBe(2);
    expect(s2.interval).toBe(6);
  });
  it("resets on lapse", () => {
    const s = nextSM2({ repetition: 3, interval: 10, efactor: 2.5 }, "again");
    expect(s.repetition).toBe(0);
    expect(s.interval).toBe(1);
  });
});
