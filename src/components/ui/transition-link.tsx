"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useLoading } from "@/core/providers/LoadingProvider";

type TransitionLinkProps = LinkProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
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

  return (
    <Link
      href={href}
      className={className}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }

        if (props.target === "_blank" || isHashLink) {
          return;
        }

        if (typeof href === "string" && isSamePath) {
          return;
        }

        event.preventDefault();
        showLoading(loadingMessage);

        window.setTimeout(() => {
          router.push(typeof href === "string" ? href : String(href));
          hideLoading();
        }, delayMs);
      }}
      {...props}
    >
      {children}
    </Link>
  );
}