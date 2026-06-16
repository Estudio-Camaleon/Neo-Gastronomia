"use client";

import { useEffect } from "react";
import { createClient as createBrowserSupabase } from "@/core/lib/supabase/client";
import { useRouter } from "next/navigation";

export function useSlugSubscription(negocioId: string, currentSlug: string) {
  const router = useRouter();

  useEffect(() => {
    try {
      const supabase = createBrowserSupabase();
      const channel = supabase
        .channel(`negocios_slug_watch_${negocioId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "negocios",
            filter: `id=eq.${negocioId}`,
          },
          (payload: unknown) => {
            const p = payload as { new?: { slug?: string } } | undefined;
            const newSlug = p?.new?.slug;
            if (!newSlug) return;
            if (newSlug === currentSlug) return;

            const currentPath = window.location.pathname;
            const oldPrefix = `/${currentSlug}`;
            if (currentPath.startsWith(oldPrefix)) {
              const newPath = currentPath.replace(oldPrefix, `/${newSlug}`);
              const search = window.location.search || "";
              router.replace(`${newPath}${search}`);
            }
          },
        )
        .subscribe();

      return () => {
        try {
          supabase.removeChannel(channel);
        } catch {
          // ignore cleanup errors
        }
      };
    } catch {
      // noop
    }
  }, [negocioId, currentSlug, router]);
}
