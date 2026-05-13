"use client";

import { useMemo, useState } from "react";
import { deleteToken, getToken, isSupported } from "firebase/messaging";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hasFirebaseConfig, getFirebaseMessaging } from "@/lib/firebase-client";
import { registerFcmToken, unregisterFcmToken } from "@/services/api/fcm";

const FCM_TOKEN_CACHE_KEY = "afobyte_fcm_token";

function getReadableError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Failed to enable push notification";
}

export function FcmAlertSubscription() {
  const [status, setStatus] = useState<"idle" | "enabling" | "enabled" | "disabling" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const isConfigured = useMemo(
    () => hasFirebaseConfig() && Boolean(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY),
    [],
  );

  async function enableNotification() {
    if (!isConfigured) {
      setStatus("error");
      setMessage("Firebase config belum lengkap. Isi NEXT_PUBLIC_FIREBASE_* dan VAPID key.");
      return;
    }

    setStatus("enabling");
    setMessage(null);

    try {
      const supported = await isSupported();
      if (!supported || typeof window === "undefined" || !("serviceWorker" in navigator)) {
        throw new Error("Browser ini tidak mendukung FCM web push.");
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Izin notifikasi ditolak oleh browser.");
      }

      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      const token = await getToken(getFirebaseMessaging(), {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (!token) {
        throw new Error("Token FCM kosong. Coba refresh halaman lalu aktifkan ulang.");
      }

      await registerFcmToken({
        token,
        platform: "web",
      });

      localStorage.setItem(FCM_TOKEN_CACHE_KEY, token);

      setStatus("enabled");
      setMessage("Push alert aktif. Device token berhasil diregistrasi.");
    } catch (error) {
      setStatus("error");
      setMessage(getReadableError(error));
    }
  }

  async function disableNotification() {
    if (!isConfigured) {
      setStatus("error");
      setMessage("Firebase config belum lengkap. Tidak dapat mematikan push alert.");
      return;
    }

    setStatus("disabling");
    setMessage(null);

    try {
      const supported = await isSupported();
      if (!supported || typeof window === "undefined" || !("serviceWorker" in navigator)) {
        throw new Error("Browser ini tidak mendukung FCM web push.");
      }

      const registration =
        (await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js")) ??
        (await navigator.serviceWorker.register("/firebase-messaging-sw.js"));
      const messaging = getFirebaseMessaging();

      const cachedToken = localStorage.getItem(FCM_TOKEN_CACHE_KEY);
      const token =
        cachedToken ||
        (await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        }));

      if (token) {
        await unregisterFcmToken({ token, platform: "web" });
      }

      await deleteToken(messaging);
      localStorage.removeItem(FCM_TOKEN_CACHE_KEY);

      setStatus("idle");
      setMessage("Push alert berhasil dinonaktifkan untuk device ini.");
    } catch (error) {
      setStatus("error");
      setMessage(getReadableError(error));
    }
  }

  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-zinc-100">FCM Push Alert</p>
        {status === "enabled" ? <Badge variant="bullish">enabled</Badge> : null}
      </div>

      <p className="mt-1 text-xs text-zinc-400">
        Aktifkan notifikasi agar alert penting bisa muncul langsung di browser/device.
      </p>

      <div className="mt-3 flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={enableNotification}
          disabled={status === "enabling" || status === "disabling"}
        >
          {status === "enabling" ? "Enabling..." : "Enable Push Notification"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={disableNotification}
          disabled={status === "enabling" || status === "disabling"}
        >
          {status === "disabling" ? "Disabling..." : "Disable Push"}
        </Button>
      </div>

      {message ? (
        <p className={`mt-2 text-xs ${status === "error" ? "text-red-400" : "text-emerald-400"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
