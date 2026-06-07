"use client";

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
} from "lucide-react";

const foodIcons = [
  { Icon: Pizza, size: 64, top: "8%", left: "5%", delay: "0s" },
  { Icon: Beef, size: 72, top: "18%", right: "6%", delay: "1.2s" },
  { Icon: Coffee, size: 56, top: "40%", left: "3%", delay: "0.6s" },
  { Icon: CupSoda, size: 68, top: "52%", right: "4%", delay: "2s" },
  { Icon: Sandwich, size: 60, top: "68%", left: "6%", delay: "0.9s" },
  { Icon: IceCream, size: 52, top: "78%", right: "8%", delay: "1.5s" },
  { Icon: ShoppingBag, size: 58, top: "28%", left: "40%", delay: "0.3s" },
  { Icon: UtensilsCrossed, size: 70, top: "62%", left: "38%", delay: "1.8s" },
  { Icon: Ticket, size: 50, top: "12%", right: "20%", delay: "2.4s" },
];

export function FloatingFood() {
  return (
    <>
      <style>{`
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33%      { transform: translateY(-14px) rotate(2deg); }
          66%      { transform: translateY(-6px) rotate(-1deg); }
        }
        .icon-float {
          animation: iconFloat 8s ease-in-out infinite;
        }
      `}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
      >
        {foodIcons.map(({ Icon, size, top, left, right, delay }, idx) => (
          <div
            key={idx}
            className="icon-float absolute text-[var(--color-custom-500)]/15"
            style={{
              top,
              left,
              right,
              width: size,
              height: size,
              animationDelay: delay,
            }}
          >
            <Icon size={size} strokeWidth={1.2} />
          </div>
        ))}
      </div>
    </>
  );
}
