import { NextResponse } from "next/server";

export function ok<T>(data: T, meta: Record<string, unknown> = {}) {
  return NextResponse.json({ success: true, data, meta });
}

export function fail(
  status: number,
  code: string,
  message: string,
  details: unknown[] = [],
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status },
  );
}

export function requireUserId(headerValue: string | null) {
  if (!headerValue) {
    return fail(401, "UNAUTHORIZED", "Missing x-user-id header");
  }
  return null;
}
