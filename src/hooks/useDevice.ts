"use client";

import { useState, useEffect } from "react";

export function useDevice() {
  const [isMobile, setIsMobile] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isMobileUA = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua);
    const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

    // ponytail: desktop with touch screen defaults to desktop if fine pointer exists; add hybrid mode if needed later.
    setIsMobile(isMobileUA || hasCoarsePointer);
    setIsReady(true);
  }, []);

  return { isMobile, isDesktop: isReady ? !isMobile : false, isReady };
}
