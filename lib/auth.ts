export const AUTH_COOKIE_NAME = "afobyte_private_session";

export function getExpectedPassword(): string {
  return process.env.NEXT_PRIVATE_PASSWORD ?? "next private password";
}

export function isAuthenticatedCookie(value: string | undefined): boolean {
  return value === "1";
}
