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

interface FoodIconDef {
  key: string;
  Icon: LucideIcon;
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

const DEFAULT_SHAPES = ["Pizza", "Beef", "Coffee", "CupSoda", "Sandwich", "IceCream", "UtensilsCrossed"];

// Simple seeded pseudo-random (mulberry32)
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface PlacedIcon {
  key: string;
  Icon: LucideIcon;
  size: number;
  top: number;
  left: number;
  delay: number;
  duration: number;
  wobble: number;
}

// Generate a deterministic but organic-looking layout
function generateLayout(shapeKeys: string[]): PlacedIcon[] {
  const seed = shapeKeys.reduce((acc, k) => acc + k.charCodeAt(0), 42);
  const rng = mulberry32(seed);
  const count = shapeKeys.length;
  const minSize = 40;
  const maxSize = 84;

  // Generate non-overlapping positions using a simple grid-aware approach
  const placed: PlacedIcon[] = [];
  const occupied: Array<{ x: number; y: number; r: number }> = [];
  const maxAttempts = 60;

  for (const key of shapeKeys) {
    const Icon = ICON_MAP[key];
    if (!Icon) continue;

    const size = Math.round(minSize + rng() * (maxSize - minSize));
    const radius = size / 2 + 8; // collision radius with padding

    let top = 0;
    let left = 0;
    let placedOk = false;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Keep away from edges (10% inner margin)
      top = 5 + rng() * 80;
      left = 5 + rng() * 80;

      // Check collision with previously placed icons
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

    // If can't place without collision, force it in last resort position
    if (!placedOk) {
      top = 5 + rng() * 80;
      left = 5 + rng() * 80;
    }

    occupied.push({ x: left, y: top, r: radius });

    placed.push({
      key,
      Icon,
      size,
      top,
      left,
      delay: Math.round(rng() * 3000),
      duration: 6000 + Math.round(rng() * 4000),
      wobble: -6 + Math.round(rng() * 12),
    });
  }

  return placed;
}

export function FloatingFood({ shapes }: { shapes?: string[] }) {
  const activeShapes = shapes && shapes.length > 0 ? shapes : DEFAULT_SHAPES;

  const placedIcons = useMemo(() => generateLayout(activeShapes), [activeShapes]);

  return (
    <>
      <style>{`
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33%      { transform: translateY(-14px) rotate(2deg); }
          66%      { transform: translateY(-6px) rotate(-1deg); }
        }
        .icon-float {
          animation: iconFloat var(--float-duration, 8s) ease-in-out infinite;
        }
      `}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
      >
        {placedIcons.map((icon) => (
          <div
            key={icon.key}
            className="icon-float absolute text-[var(--color-custom-500)]/15"
            style={{
              top: `${icon.top}%`,
              left: `${icon.left}%`,
              width: icon.size,
              height: icon.size,
              animationDelay: `${icon.delay}ms`,
              "--float-duration": `${icon.duration}ms`,
            } as React.CSSProperties}
          >
            <icon.Icon size={icon.size} strokeWidth={1.2} />
          </div>
        ))}
      </div>
    </>
  );
}
