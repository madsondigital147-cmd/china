"use client";

import { useEffect } from "react";

/**
 * Register the PWA service worker (spec §58). Only in production so the dev
 * server never serves stale caches during development.
 */
export function PwaRegistry() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // silently ignore — PWA is progressive enhancement
    });
  }, []);

  return null;
}