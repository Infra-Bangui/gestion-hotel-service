/** Idle session timeout (ms). Override via NEXT_PUBLIC_SESSION_TIMEOUT_MS. */
export const SESSION_TIMEOUT_MS = Number(
  process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MS || 30 * 60 * 1000,
);

/** Max failed login attempts before temporary lockout. */
export const MAX_LOGIN_ATTEMPTS = Number(
  process.env.NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS || 5,
);

/** Lockout duration after too many failed logins (ms). */
export const LOGIN_LOCKOUT_MS = Number(
  process.env.NEXT_PUBLIC_LOGIN_LOCKOUT_MS || 60 * 1000,
);

/** Show demo credentials panel (never enable in public production). */
export const SHOW_DEMO_ACCOUNTS =
  process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === "true" ||
  process.env.NODE_ENV !== "production";

export type AuthUser = {
  id: string;
  login: string;
  role: string;
  nom: string;
  hotelId?: string | null;
  dept?: string;
  commissariat?: string;
  creePar?: string;
};

/** Strip password before keeping a user in session state. */
export function sanitizeUser<T extends { pass?: string }>(
  user: T,
): Omit<T, "pass"> {
  const { pass: _pass, ...safe } = user;
  return safe;
}
