import { describe, it, expect } from "vitest";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)+/g, "")
    || `local-${text.slice(0, 8)}`;
}

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
