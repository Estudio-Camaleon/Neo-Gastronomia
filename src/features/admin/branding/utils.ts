/**
 * Parse floating_shapes from legacy (string[]) or new format ({ shapes, density }).
 * Returns a normalized object with shapes array and density.
 */
export function parseFloatingShapes(
  input: string[] | { shapes: string[]; density: string } | undefined,
): { shapes: string[]; density: "low" | "medium" | "high" } {
  if (Array.isArray(input)) {
    return { shapes: input, density: "medium" };
  }

  if (typeof input === "object" && input !== null) {
    const shapes = input.shapes ?? [];
    const rawDensity = input.density;
    const density =
      rawDensity === "low" || rawDensity === "medium" || rawDensity === "high"
        ? rawDensity
        : "medium";
    return { shapes, density };
  }

  return { shapes: [], density: "medium" };
}
