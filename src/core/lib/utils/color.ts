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
    .map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0"))
    .join("");
}

function mixHexColor(base: string, target: string, targetWeight: number): string {
  const baseRgb = hexToRgb(base);
  const targetRgb = hexToRgb(target);
  const baseWeight = 1 - targetWeight;

  return rgbToHex({
    r: baseRgb.r * baseWeight + targetRgb.r * targetWeight,
    g: baseRgb.g * baseWeight + targetRgb.g * targetWeight,
    b: baseRgb.b * baseWeight + targetRgb.b * targetWeight,
  });
}

function getContrastYIQ(hexColor: string): string {
  const { r, g, b } = hexToRgb(hexColor);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  return yiq >= 148 ? "#111111" : "#ffffff";
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

  return {
    base,
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