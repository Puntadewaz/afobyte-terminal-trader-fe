"use client";

import { useEffect } from "react";
import { isSupported, onMessage } from "firebase/messaging";
import { toast } from "sonner";
import { getFirebaseMessaging, hasFirebaseConfig } from "@/lib/firebase-client";

export function FcmForegroundListener() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasFirebaseConfig()) return;

    let unsubscribe: (() => void) | null = null;

    const setup = async () => {
      const supported = await isSupported();
      if (!supported) return;
      if (Notification.permission !== "granted") return;

      unsubscribe = onMessage(getFirebaseMessaging(), (payload) => {
        const title = payload.notification?.title ?? "Trading Alert";
        const body = payload.notification?.body ?? "Ada alert baru.";
        toast(title, { description: body });
      });
    };

    setup().catch(() => {
      // No-op: notification foreground listener is optional.
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return null;
}
