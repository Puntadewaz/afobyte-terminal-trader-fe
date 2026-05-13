import { http } from "@/services/api/http";

interface RegisterFcmPayload {
  token: string;
  platform?: string;
}

export async function registerFcmToken(payload: RegisterFcmPayload) {
  return http<{ ok?: boolean; detail?: string }>(
    "/api/v1/alerts/fcm/register",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    { withUserId: true },
  );
}

export async function unregisterFcmToken(payload: RegisterFcmPayload) {
  return http<{ ok?: boolean; detail?: string }>(
    "/api/v1/alerts/fcm/unregister",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    { withUserId: true },
  );
}
