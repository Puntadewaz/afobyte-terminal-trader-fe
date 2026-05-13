import { fail } from "@/lib/api-envelope";

function getUpstreamBase(): string | null {
  return (
    process.env.UPSTREAM_NEXT_API_BASE_URL?.trim() ||
    process.env.BACKEND_API_BASE_URL?.trim() ||
    null
  );
}

export function requireUpstreamBase() {
  const base = getUpstreamBase();
  if (!base) {
    return {
      error: fail(
        500,
        "CONFIG_ERROR",
        "UPSTREAM_NEXT_API_BASE_URL (or BACKEND_API_BASE_URL) is not configured",
      ),
    };
  }

  return { base: base.replace(/\/$/, "") };
}

export async function proxyUpstream(
  base: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${base}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      ...((init?.headers as Record<string, string> | undefined) ?? {}),
    },
  });
}
