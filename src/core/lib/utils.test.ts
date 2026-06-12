import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles tailwind conflicts (last wins)", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
  });

  it("filters falsy values", () => {
    expect(cn("foo", undefined, "baz")).toBe("foo baz");
    expect(cn("foo", null, "baz")).toBe("foo baz");
    expect(cn("foo", "", "baz")).toBe("foo baz");
    expect(cn("foo", 0, "baz")).toBe("foo baz");
  });

  it("handles conditional classes", () => {
    expect(cn("base", "active")).toBe("base active");
    expect(cn("base")).toBe("base");
  });
});
