"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
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
      className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-[var(--auth-border)] rounded-lg text-[var(--auth-text)] bg-white text-xs font-medium hover:bg-[#f7f4ec] transition-all cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
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