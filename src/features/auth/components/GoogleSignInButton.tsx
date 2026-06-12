"use client";

import { useState } from "react";
import Image from "next/image";
// removed Loader2 - using FoodMini
import { FoodMini } from "@/components/ui/food-loading";
import { signInWithGoogleAction } from "../actions";

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithGoogleAction();
    } catch {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-[var(--auth-border)] rounded-xl text-[var(--auth-text)] bg-white/80 backdrop-blur-sm text-xs font-medium hover:bg-white hover:border-[var(--auth-border-strong)] transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <FoodMini size={14} />
      ) : (
        <div className="relative h-4 w-4">
          <Image
            src="/icons/google.webp"
            alt="Google OAuth"
            fill
            sizes="16px"
            className="object-contain opacity-90"
          />
        </div>
      )}
      <span>{loading ? "Conectando..." : "Ingresar con Cuenta Google"}</span>
    </button>
  );
}
