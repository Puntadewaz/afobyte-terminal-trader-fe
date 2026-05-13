interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown[];
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  meta?: Record<string, unknown>;
  error?: ApiErrorPayload;
}

function withBaseUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!base) return path;
  return `${base.replace(/\/$/, "")}${path}`;
}

export function getUserIdHeader(): Record<string, string> {
  const userId =
    process.env.NEXT_PUBLIC_API_USER_ID?.trim() ?? "00000000-0000-0000-0000-000000000001";
  return { "x-user-id": userId };
}

export async function http<T>(
  path: string,
  init?: RequestInit,
  options?: { withUserId?: boolean },
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init?.headers as Record<string, string> | undefined) ?? {}),
  };

  if (options?.withUserId) {
    Object.assign(headers, getUserIdHeader());
  }

  const response = await fetch(withBaseUrl(path), {
    ...init,
    headers,
    cache: "no-store",
  });

  const json = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !json.success) {
    const message = json.error?.message ?? `Request failed with ${response.status}`;
    const code = json.error?.code ? ` (${json.error.code})` : "";
    throw new Error(`${message}${code}`);
  }

  return json.data as T;
}
