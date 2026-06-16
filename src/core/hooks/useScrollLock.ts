"use client";

import { useEffect } from "react";

let lockCount = 0;
let originalOverflow = "";

function lock() {
  if (typeof document === "undefined") return;
  if (lockCount === 0) {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount++;
}

function unlock() {
  if (typeof document === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = originalOverflow;
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
