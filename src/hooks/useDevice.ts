"use client";

import { useState, useEffect } from "react";

export function useDevice() {
  const [isMobile, setIsMobile] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isMobileUA = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua);
    const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const isSmallScreen = window.innerWidth <= 768;

    setIsMobile(isMobileUA || hasCoarsePointer || isSmallScreen);
    setIsReady(true);
  }, []);

  return { isMobile, isDesktop: isReady ? !isMobile : false, isReady };
}

