type RGB = {
  r: number;
  g: number;
  b: number;
};

function normalizeHexColor(hex: string): string {
  const trimmed = hex.trim().replace(/^#/, "");

  if (/^[0-9a-fA-F]{3}$/.test(trimmed)) {
    return trimmed
      .split("")
      .map((char) => char + char)
      .join("")
      .toLowerCase();
  }

  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  return "1f6b3d";
}

function hexToRgb(hex: string): RGB {
  const normalized = normalizeHexColor(hex);

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  return [r, g, b]
    .map((value) =>
      Math.max(0, Math.min(255, Math.round(value)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
}

function mixHexColor(
  base: string,
  target: string,
  targetWeight: number,
): string {
  const baseRgb = hexToRgb(base);
  const targetRgb = hexToRgb(target);
  const baseWeight = 1 - targetWeight;

  return rgbToHex({
    r: baseRgb.r * baseWeight + targetRgb.r * targetWeight,
    g: baseRgb.g * baseWeight + targetRgb.g * targetWeight,
    b: baseRgb.b * baseWeight + targetRgb.b * targetWeight,
  });
}

export function getContrastYIQ(hexColor: string): string {
  const { r, g, b } = hexToRgb(hexColor);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  return yiq >= 148 ? "#111111" : "#ffffff";
}

function linearize(channel: number): number {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

export function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWcagAA(
  foreground: string,
  background: string,
  largeText = false,
): boolean {
  return contrastRatio(foreground, background) >= (largeText ? 3 : 4.5);
}

export function buildBrandPalette(inputHex: string) {
  const base = `#${normalizeHexColor(inputHex)}`;
  const soft = `#${mixHexColor(base, "#ffffff", 0.82)}`;
  const softAlt = `#${mixHexColor(base, "#ffffff", 0.9)}`;
  const deep = `#${mixHexColor(base, "#0f172a", 0.28)}`;
  const darker = `#${mixHexColor(base, "#000000", 0.38)}`;
  const surface = `#${mixHexColor(base, "#ffffff", 0.94)}`;
  const surfaceStrong = `#${mixHexColor(base, "#ffffff", 0.985)}`;
  const border = `#${mixHexColor(base, "#cbd5e1", 0.7)}`;
  const text = `#${mixHexColor(base, "#0f172a", 0.12)}`;
  const textMuted = `#${mixHexColor(base, "#0f172a", 0.36)}`;

  // Validate color contrast for accessibility (WCAG AA)
  const textOnSurfaceOk = meetsWcagAA(text, surface);
  const textMutedOnSurfaceOk = meetsWcagAA(textMuted, surface);
  const textOnBaseOk = meetsWcagAA(text, base);
  const baseOnSurfaceOk = meetsWcagAA(base, surface);
  if (!textOnSurfaceOk && process.env.NODE_ENV === "development") {
    console.debug(`[buildBrandPalette] text (#${normalizeHexColor(text)}) on surface (#${normalizeHexColor(surface)}) = ${contrastRatio(text, surface).toFixed(2)}:1 — below WCAG AA (4.5:1)`);
  }
  if (!textMutedOnSurfaceOk && process.env.NODE_ENV === "development") {
    console.debug(`[buildBrandPalette] textMuted (#${normalizeHexColor(textMuted)}) on surface (#${normalizeHexColor(surface)}) = ${contrastRatio(textMuted, surface).toFixed(2)}:1 — low contrast`);
  }
  if (!textOnBaseOk && process.env.NODE_ENV === "development") {
    console.debug(`[buildBrandPalette] text (#${normalizeHexColor(text)}) on base (#${normalizeHexColor(base)}) = ${contrastRatio(text, base).toFixed(2)}:1 — below WCAG AA (4.5:1)`);
  }
  if (!baseOnSurfaceOk && process.env.NODE_ENV === "development") {
    console.debug(`[buildBrandPalette] base (#${normalizeHexColor(base)}) on surface (#${normalizeHexColor(surface)}) = ${contrastRatio(base, surface).toFixed(2)}:1 — borderline (needs 3:1)`);
  }

  return {
    base,
    "50": `#${mixHexColor(base, "#ffffff", 0.95)}`,
    "100": `#${mixHexColor(base, "#ffffff", 0.88)}`,
    "200": `#${mixHexColor(base, "#ffffff", 0.76)}`,
    "300": `#${mixHexColor(base, "#ffffff", 0.6)}`,
    "400": `#${mixHexColor(base, "#ffffff", 0.35)}`,
    "500": base,
    "600": `#${mixHexColor(base, "#000000", 0.15)}`,
    "700": deep,
    "800": `#${mixHexColor(base, "#000000", 0.3)}`,
    "900": darker,
    "950": `#${mixHexColor(base, "#000000", 0.52)}`,
    soft,
    softAlt,
    deep,
    darker,
    surface,
    surfaceStrong,
    border,
    text,
    textMuted,
    textOnBase: getContrastYIQ(base),
    textOnDeep: getContrastYIQ(deep),
  };
}
