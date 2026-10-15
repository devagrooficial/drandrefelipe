import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { AstroCookies } from "astro";
import { ADMIN_PASSWORD, ADMIN_USER, SESSION_SECRET } from "astro:env/server";

export const SESSION_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

export function authConfigError(): string | null {
  const missing = [
    !ADMIN_USER && "ADMIN_USER",
    !ADMIN_PASSWORD && "ADMIN_PASSWORD",
    !SESSION_SECRET && "SESSION_SECRET",
  ].filter(Boolean);
  if (missing.length) return `Variáveis de ambiente ausentes: ${missing.join(", ")}.`;
  if (SESSION_SECRET!.length < 32) return "SESSION_SECRET precisa ter pelo menos 32 caracteres.";
  return null;
}

// Hashing first gives equal-length buffers, so timingSafeEqual never leaks the secret's length.
const sameSecret = (input: string, expected: string) =>
  timingSafeEqual(
    createHash("sha256").update(input).digest(),
    createHash("sha256").update(expected).digest(),
  );

export function checkCredentials(user: string, password: string): boolean {
  if (authConfigError()) return false;
  // Both comparisons always run, so timing doesn't reveal which one failed.
  const userOk = sameSecret(user, ADMIN_USER!);
  const passwordOk = sameSecret(password, ADMIN_PASSWORD!);
  return userOk && passwordOk;
}

const sign = (payload: string) =>
  createHmac("sha256", SESSION_SECRET!).update(payload).digest("base64url");

export function startSession(cookies: AstroCookies) {
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }),
  ).toString("base64url");
  cookies.set(SESSION_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "strict",
    path: "/admin",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function endSession(cookies: AstroCookies) {
  cookies.delete(SESSION_COOKIE, { path: "/admin" });
}

export function hasValidSession(cookies: AstroCookies): boolean {
  if (authConfigError()) return false;
  const value = cookies.get(SESSION_COOKIE)?.value;
  if (!value) return false;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof exp === "number" && exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

// Best effort only: serverless instances don't share memory, so this slows
// down a brute-force run on one instance rather than stopping it outright.
// The real protection is a long random ADMIN_PASSWORD.
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

export function isRateLimited(ip: string): boolean {
  const entry = attempts.get(ip);
  return !!entry && entry.resetAt > Date.now() && entry.count >= MAX_ATTEMPTS;
}

export function recordFailedLogin(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt <= now) attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  else entry.count += 1;
}

export function clearFailedLogins(ip: string) {
  attempts.delete(ip);
}
