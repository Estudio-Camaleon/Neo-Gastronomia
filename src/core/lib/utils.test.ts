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
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("handles conditional classes", () => {
    expect(cn("base", true && "active", false && "hidden")).toBe(
      "base active",
    );
  });
});
