import { describe, it, expect } from "vitest";
import { isPreviewHost } from "./registerAppWorker";

describe("app worker preview protection", () => {
  it("refuses the project's editor preview", () => {
    expect(isPreviewHost("id-preview--61e59bc7-e9d5-4b18-9715-0052a9b9ad01.lovable.app")).toBe(true);
  });
  it("keeps the published app eligible for offline use", () => {
    expect(isPreviewHost("aramisdaily.lovable.app")).toBe(false);
  });
  it("does not mistake a custom domain for an editor preview", () => {
    expect(isPreviewHost("preview-v2--shop.example.com")).toBe(false);
  });
});