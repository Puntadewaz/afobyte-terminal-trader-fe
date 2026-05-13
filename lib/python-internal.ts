const DEFAULT_PYTHON_BASE = "http://127.0.0.1:8000";

function pythonBase(): string {
  return process.env.PYTHON_ANALYTICS_ENDPOINT?.trim() || DEFAULT_PYTHON_BASE;
}

function internalSecret(): string | null {
  return (
    process.env.INTERNAL_SECRET?.trim() ||
    process.env.X_INTERNAL_SECRET?.trim() ||
    process.env.NEXT_INTERNAL_SECRET?.trim() ||
    null
  );
}

export async function callPython<T>(path: string, body: unknown): Promise<T> {
  const secret = internalSecret();
  if (!secret) {
    throw new Error("CONFIG_ERROR: INTERNAL_SECRET is not configured");
  }

  const response = await fetch(`${pythonBase().replace(/\/$/, "")}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-internal-secret": secret,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = (await response.json()) as T;

  if (!response.ok) {
    throw new Error(`UPSTREAM_ERROR: ${JSON.stringify(payload)}`);
  }

  return payload;
}
