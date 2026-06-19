"use client";

import { useEffect } from "react";

let lockCount = 0;
let originalBodyOverflow = "";
let originalHtmlOverflow = "";
let originalPaddingRight = "";

function getScrollbarWidth(): number {
  if (typeof document === "undefined") return 0;
  return window.innerWidth - document.documentElement.clientWidth;
}

function lock() {
  if (typeof document === "undefined") return;
  if (lockCount === 0) {
    const scrollbarWidth = getScrollbarWidth();
    originalBodyOverflow = document.body.style.overflow;
    originalHtmlOverflow = document.documentElement.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  lockCount++;
}

function unlock() {
  if (typeof document === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = originalBodyOverflow;
    document.documentElement.style.overflow = originalHtmlOverflow;
    document.body.style.paddingRight = originalPaddingRight;
  }
}

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (locked) {
      lock();
    } else {
      unlock();
    }
    return () => {
      if (locked) {
        unlock();
      }
    };
  }, [locked]);
}
