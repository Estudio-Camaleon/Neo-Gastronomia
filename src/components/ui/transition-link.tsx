"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useMemo } from "react";
import { useLoading } from "@/core/providers/LoadingProvider";

// Omitimos las propiedades HTML que ya existen en LinkProps para evitar el choque de tipos.
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
  const { show: showLoading, hide: hideLoading } = useLoading();

  const isHashLink = useMemo(() => {
    return typeof href === "string" && href.startsWith("#");
  }, [href]);

  const isSamePath = useMemo(() => {
    if (typeof href !== "string" || !href.startsWith("/")) return false;
    const targetPath = href.split("#")[0];
    return targetPath === pathname;
  }, [href, pathname]);

  const handleTransition = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    onClick?.(e);

    // Si el usuario abre en otra pestaña o usa atajos, no intervenimos
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
    showLoading(loadingMessage);

    // href en Next.js puede ser un UrlObject. Extraemos el string seguro.
    const targetUrl = typeof href === "string" ? href : href.pathname || "/";

    window.setTimeout(() => {
      router.push(targetUrl);
      hideLoading();
    }, delayMs);
  };

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
