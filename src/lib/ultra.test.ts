import { describe, it, expect } from "vitest";
import { normalizeHandle, isValidHandle, handleToAddress } from "./ultra";

describe("ultra handles", () => {
  it("always produces an @ultra.co address", () => {
    expect(handleToAddress("Learner")).toBe("learner@ultra.co");
    expect(handleToAddress("learner@gmail.com")).toBe("learner@ultra.co");
  });
  it("strips unsupported characters", () => {
    expect(normalizeHandle(" Jo hn! ")).toBe("john");
  });
  it("rejects too-short handles", () => {
    expect(isValidHandle("ab")).toBe(false);
    expect(isValidHandle("abc")).toBe(true);
  });
});
