"use client";

import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Tracks whether the viewport is at or below the mobile breakpoint.
 * Returns `undefined` on first render (before we know the viewport size,
 * since this runs client-side only) — check for this if you need to avoid
 * a flash of the wrong layout during hydration.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    mql.addEventListener("change", onChange);
    onChange(); // set the initial value

    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}