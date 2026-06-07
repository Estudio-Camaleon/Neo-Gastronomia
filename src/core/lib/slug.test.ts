import { describe, it, expect } from "vitest";
import { generateSlug } from "./slug";

describe("generateSlug", () => {
  it("converts basic text", () => {
    expect(generateSlug("Mi Local")).toBe("mi-local");
  });

  it("removes accents", () => {
    expect(generateSlug("José Martínez")).toBe("jose-martinez");
  });

  it("handles special characters", () => {
    expect(generateSlug("Café & Bar!!")).toBe("cafe-bar");
  });

  it("collapses multiple dashes", () => {
    expect(generateSlug("foo   bar---baz")).toBe("foo-bar-baz");
  });

  it("falls back for empty input", () => {
    const result = generateSlug("");
    expect(result).toMatch(/^local-/);
  });
});
