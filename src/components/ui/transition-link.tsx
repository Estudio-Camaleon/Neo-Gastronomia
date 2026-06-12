"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useLoading } from "@/core/providers/LoadingProvider";

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
  const { show: showLoading, hide: hideLoading } = useLoading();

  const isHashLink = useMemo(() => {
    return typeof href === "string" && href.startsWith("#");
  }, [href]);

  const isSamePath = useMemo(() => {
    if (typeof href !== "string" || !href.startsWith("/")) return false;
    const targetPath = href.split("#")[0];
    return targetPath === pathname;
  }, [href, pathname]);

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

      const targetUrl = typeof href === "string" ? href : href.pathname || "/";

      setTimeout(() => {
        router.push(targetUrl);
        hideLoading();
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
      loadingMessage,
      delayMs,
      props.target,
      router,
    ],
  );

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      hideLoading();
      prevPathRef.current = pathname;
    }
  }, [pathname, hideLoading]);

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
