"use client";

import { useEffect } from "react";

export function PwaRuntime() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/firebase-messaging-sw.js").catch(() => {
      // No-op: app remains functional even when service worker registration fails.
    });
  }, []);

  return null;
}
