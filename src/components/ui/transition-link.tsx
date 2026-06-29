"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useLoading } from "@/core/providers/LoadingProvider";

const MAX_LOADING_MS = 8_000; // safety net: nunca dejar overlay trabado

type TransitionLinkProps = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    delayMs?: number;
    loadingMessage?: string;
  };

export function TransitionLink({
  href,
  onClick,
  children,
  delayMs = 150,
  loadingMessage,
  className,
  ...props
}: TransitionLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { show: showLoading, hide: hideLoading } = useLoading();

  const isHashLink = useMemo(() => {
    return typeof href === "string" && href.startsWith("#");
  }, [href]);

  const isSamePath = useMemo(() => {
    if (typeof href !== "string" || !href.startsWith("/")) return false;
    const targetPath = href.split("#")[0];
    return targetPath === pathname;
  }, [href, pathname]);

  const clearMaxTimer = useCallback(() => {
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
  }, []);

  const handleTransition = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      onClick?.(e);

      if (
        e.defaultPrevented ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      if (props.target === "_blank" || isHashLink || isSamePath) {
        return;
      }

      e.preventDefault();
      prevPathRef.current = pathname;
      showLoading(loadingMessage);
      clearMaxTimer();
      maxTimerRef.current = setTimeout(() => {
        hideLoading();
      }, MAX_LOADING_MS);

      const targetUrl = typeof href === "string" ? href : href.pathname || "/";

      setTimeout(() => {
        router.push(targetUrl);
        // NO ocultar overlay aquí — el useEffect por pathname lo hace
        // cuando la nueva ruta realmente comienza a renderizar
      }, delayMs);
    },
    [
      href,
      onClick,
      isHashLink,
      isSamePath,
      pathname,
      showLoading,
      hideLoading,
      clearMaxTimer,
      loadingMessage,
      delayMs,
      props.target,
      router,
    ],
  );

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      clearMaxTimer();
      hideLoading();
      prevPathRef.current = pathname;
    }
  }, [pathname, hideLoading, clearMaxTimer]);

  return (
    <Link
      href={href}
      className={className}
      onClick={handleTransition}
      {...props}
    >
      {children}
    </Link>
  );
}
