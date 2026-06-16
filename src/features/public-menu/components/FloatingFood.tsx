"use client";

import { useMemo } from "react";
import {
  Pizza,
  Beef,
  Coffee,
  CupSoda,
  Sandwich,
  IceCream,
  ShoppingBag,
  UtensilsCrossed,
  Ticket,
  type LucideIcon,
} from "lucide-react";

interface PlacedIcon {
  key: string;
  id: string; // unique id per instance (key + index)
  Icon: LucideIcon;
  size: number;
  top: number;
  left: number;
  rotation: number;
  delay: number;
  duration: number;
  opacity: number;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Pizza,
  Beef,
  Coffee,
  CupSoda,
  Sandwich,
  IceCream,
  ShoppingBag,
  UtensilsCrossed,
  Ticket,
};

const DEFAULT_SHAPES = [
  "Pizza",
  "Beef",
  "Coffee",
  "CupSoda",
  "Sandwich",
  "IceCream",
  "UtensilsCrossed",
];

// Density presets — controls instances per shape + size range + opacity
const DENSITY_MAP: Record<
  string,
  { minInstances: number; maxInstances: number; minSize: number; maxSize: number; minOpacity: number; maxOpacity: number }
> = {
  low: { minInstances: 2, maxInstances: 3, minSize: 18, maxSize: 56, minOpacity: 0.06, maxOpacity: 0.14 },
  medium: { minInstances: 3, maxInstances: 5, minSize: 24, maxSize: 76, minOpacity: 0.08, maxOpacity: 0.20 },
  high: { minInstances: 5, maxInstances: 8, minSize: 20, maxSize: 88, minOpacity: 0.10, maxOpacity: 0.28 },
};

// ── Safe zones (% of viewport) ──────────────────────────────────
// Shapes only appear in these areas (edges, corners, margins)
interface Zone {
  x: number;
  y: number;
  w: number;
  h: number;
  weight: number;
}

const SAFE_ZONES: Zone[] = [
  // Top-left corner
  { x: 0, y: 0, w: 25, h: 22, weight: 3 },
  // Top-right corner
  { x: 75, y: 0, w: 25, h: 22, weight: 3 },
  // Bottom-left corner
  { x: 0, y: 78, w: 28, h: 22, weight: 3 },
  // Bottom-right corner
  { x: 72, y: 78, w: 28, h: 22, weight: 3 },
  // Top edge strip
  { x: 25, y: 0, w: 50, h: 12, weight: 2 },
  // Bottom edge strip
  { x: 25, y: 88, w: 50, h: 12, weight: 2 },
  // Left edge middle
  { x: 0, y: 22, w: 14, h: 56, weight: 2 },
  // Right edge middle
  { x: 86, y: 22, w: 14, h: 56, weight: 2 },
  // Mid-left content gap
  { x: 0, y: 40, w: 20, h: 30, weight: 1 },
  // Mid-right content gap
  { x: 80, y: 40, w: 20, h: 30, weight: 1 },
];

// ── Exclusion zones (% of viewport) ────────────────────────────
// Shapes never center inside these areas
const EXCLUSION_ZONES = [
  // Brand card area
  { x: 14, y: 4, w: 72, h: 32 },
  // Menu grid core area
  { x: 10, y: 32, w: 80, h: 55 },
];

// ── Seeded PRNG (mulberry32) ───────────────────────────────────
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Zone picker (weighted random) ──────────────────────────────
function pickInZone(rng: () => number, zone: Zone) {
  return {
    x: zone.x + rng() * zone.w,
    y: zone.y + rng() * zone.h,
  };
}

function pickWeightedZone(rng: () => number): Zone {
  const totalWeight = SAFE_ZONES.reduce((s, z) => s + z.weight, 0);
  let r = rng() * totalWeight;
  for (const zone of SAFE_ZONES) {
    r -= zone.weight;
    if (r <= 0) return zone;
  }
  return SAFE_ZONES[0];
}

// ── Exclusion check ────────────────────────────────────────────
function isInExclusion(x: number, y: number, r: number): boolean {
  for (const zone of EXCLUSION_ZONES) {
    // Check if the circle overlaps the rectangle
    const cx = Math.max(zone.x, Math.min(x, zone.x + zone.w));
    const cy = Math.max(zone.y, Math.min(y, zone.y + zone.h));
    const dx = x - cx;
    const dy = y - cy;
    if (dx * dx + dy * dy < r * r) return true;
  }
  return false;
}

// ── Layout generation ──────────────────────────────────────────
function generateLayout(
  shapeKeys: string[],
  density: "low" | "medium" | "high" = "medium",
): PlacedIcon[] {
  const seed = shapeKeys.reduce((acc, k) => acc + k.charCodeAt(0), 42);
  const rng = mulberry32(seed);
  const placed: PlacedIcon[] = [];
  const occupied: Array<{ x: number; y: number; r: number }> = [];

  const cfg = DENSITY_MAP[density] ?? DENSITY_MAP["medium"];

  // Each shape appears cfg.minInstances–cfg.maxInstances times
  const instances: string[] = [];
  for (const key of shapeKeys) {
    const count =
      cfg.minInstances + Math.floor(rng() * (cfg.maxInstances - cfg.minInstances + 1));
    for (let i = 0; i < count; i++) {
      instances.push(key);
    }
  }

  // Shuffle instances for variety
  for (let i = instances.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [instances[i], instances[j]] = [instances[j], instances[i]];
  }

  const minSize = cfg.minSize;
  const maxSize = cfg.maxSize;

  let instanceIndex = 0;
  for (const key of instances) {
    const Icon = ICON_MAP[key];
    if (!Icon) continue;

    const size = Math.round(minSize + rng() * (maxSize - minSize));
    const radius = size * 0.35; // collision radius (as percentage of viewport)

    let top = 0;
    let left = 0;
    let placedOk = false;

    // Try to place in safe zones avoiding exclusion + other shapes
    for (let attempt = 0; attempt < 50; attempt++) {
      const zone = pickWeightedZone(rng);
      const pos = pickInZone(rng, zone);
      left = pos.x;
      top = pos.y;

      // Check exclusion zones
      if (isInExclusion(left, top, radius)) continue;

      // Check collisions with already placed shapes
      let collides = false;
      for (const o of occupied) {
        const dx = left - o.x;
        const dy = top - o.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < radius + o.r) {
          collides = true;
          break;
        }
      }
      if (!collides) {
        placedOk = true;
        break;
      }
    }

    // Fallback: place at viewport edge
    if (!placedOk) {
      const edge = Math.floor(rng() * 4);
      switch (edge) {
        case 0: top = 0; left = rng() * 100; break; // top
        case 1: top = 100; left = rng() * 100; break; // bottom
        case 2: top = rng() * 100; left = 0; break; // left
        case 3: top = rng() * 100; left = 100; break; // right
      }
    }

    occupied.push({ x: left, y: top, r: radius });

    placed.push({
      key,
      id: `${key}_${instanceIndex++}`,
      Icon,
      size,
      top,
      left,
      rotation: Math.round((-12 + rng() * 24) * 10) / 10,
      delay: Math.round(rng() * 5000),
      duration: 7000 + Math.round(rng() * 8000),
      opacity: Math.round(
        (cfg.minOpacity + rng() * (cfg.maxOpacity - cfg.minOpacity)) * 100,
      ) / 100,
    });
  }

  return placed;
}

// ── Component ──────────────────────────────────────────────────
export function FloatingFood({
  shapes,
  density,
}: {
  shapes?: string[];
  density?: "low" | "medium" | "high";
}) {
  const activeShapes =
    shapes && shapes.length > 0 ? shapes : DEFAULT_SHAPES;
  const activeDensity = density ?? "medium";

  const placedIcons = useMemo(
    () => generateLayout(activeShapes, activeDensity),
    [activeShapes, activeDensity],
  );

  return (
    <>
      <style>{`
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25%      { transform: translateY(-10px) translateX(4px); }
          50%      { transform: translateY(-4px) translateX(-3px); }
          75%      { transform: translateY(-12px) translateX(2px); }
        }
        .icon-float {
          animation: iconFloat var(--float-duration, 8s) ease-in-out infinite;
        }
      `}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
      >
        {placedIcons.map((icon) => (
          <div
            key={icon.id}
            className="icon-float absolute"
            style={{
              top: `${icon.top}%`,
              left: `${icon.left}%`,
              width: icon.size,
              height: icon.size,
              rotate: `${icon.rotation}deg`,
              animationDelay: `${icon.delay}ms`,
              "--float-duration": `${icon.duration}ms`,
              opacity: icon.opacity,
              color: "var(--color-custom-500)",
            } as React.CSSProperties}
          >
            <icon.Icon size={icon.size} strokeWidth={1.2} />
          </div>
        ))}
      </div>
    </>
  );
}
