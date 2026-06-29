import bcrypt from "bcrypt";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";

export type SaaSUserRole = "user" | "admin" | "super_admin";

export type SaaSUser = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: SaaSUserRole;
  createdAt: string;
  updatedAt: string;
};

export type PublicSaaSUser = Omit<SaaSUser, "passwordHash">;

type SessionPayload = {
  userId: string;
  exp: number;
};

type CookieReader = {
  get(name: string): { value?: string } | undefined;
};

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SESSION_COOKIE_NAME = "saas_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const authCookieName = SESSION_COOKIE_NAME;
export const authCookieMaxAge = SESSION_MAX_AGE_SECONDS;

function getAuthSecret() {
  const secret =
    process.env.SAAS_AUTH_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET;

  if (secret && secret.length >= 32) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Set SAAS_AUTH_SECRET, AUTH_SECRET, or NEXTAUTH_SECRET to at least 32 characters.",
    );
  }

  return "development-only-saas-auth-secret-change-before-production";
}

function normalizeEmail(email: unknown) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function normalizeName(name: unknown) {
  return typeof name === "string" ? name.trim().replace(/\s+/g, " ") : "";
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return crypto
    .createHmac("sha256", getAuthSecret())
    .update(value)
    .digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function isSaaSUser(value: unknown): value is SaaSUser {
  if (!value || typeof value !== "object") return false;
  const user = value as Partial<SaaSUser>;
  return (
    typeof user.id === "string" &&
    typeof user.email === "string" &&
    typeof user.passwordHash === "string" &&
    typeof user.name === "string" &&
    (user.role === "user" ||
      user.role === "admin" ||
      user.role === "super_admin") &&
    typeof user.createdAt === "string" &&
    typeof user.updatedAt === "string"
  );
}

export function toPublicUser(user: SaaSUser): PublicSaaSUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export function isSaaSAdmin(user: PublicSaaSUser | null | undefined) {
  return user?.role === "admin" || user?.role === "super_admin";
}

export function validateRegistrationInput(input: {
  email?: unknown;
  password?: unknown;
  name?: unknown;
}) {
  const email = normalizeEmail(input.email);
  const name = normalizeName(input.name);
  const password = typeof input.password === "string" ? input.password : "";

  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Enter a valid email address." };
  }

  if (!name || name.length > 80) {
    return { error: "Name is required and must be 80 characters or fewer." };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: "Password must be at least 8 characters." };
  }

  return { email, name, password };
}

export function validateLoginInput(input: {
  email?: unknown;
  password?: unknown;
}) {
  const email = normalizeEmail(input.email);
  const password = typeof input.password === "string" ? input.password : "";

  if (!EMAIL_PATTERN.test(email) || !password) {
    return { error: "Enter a valid email and password." };
  }

  return { email, password };
}

export async function readUsers(): Promise<SaaSUser[]> {
  try {
    const raw = await readFile(USERS_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isSaaSUser) : [];
  } catch {
    return [];
  }
}

export async function readPublicUsers(): Promise<PublicSaaSUser[]> {
  const users = await readUsers();
  return users.map(toPublicUser);
}

async function writeUsers(users: SaaSUser[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(USERS_FILE, `${JSON.stringify(users, null, 2)}\n`, "utf8");
}

export async function findUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const users = await readUsers();
  return users.find((user) => user.email === normalizedEmail) ?? null;
}

export async function findUserById(id: string) {
  const users = await readUsers();
  return users.find((user) => user.id === id) ?? null;
}

export async function createUser(input: {
  email: string;
  password: string;
  name: string;
}) {
  const users = await readUsers();
  const email = normalizeEmail(input.email);

  if (users.some((user) => user.email === email)) {
    return { error: "An account with this email already exists." };
  }

  const now = new Date().toISOString();
  const user: SaaSUser = {
    id: crypto.randomUUID(),
    email,
    passwordHash: await bcrypt.hash(input.password, 12),
    name: normalizeName(input.name),
    role: "user",
    createdAt: now,
    updatedAt: now,
  };

  await writeUsers([...users, user]);
  return { user };
}

export async function verifyUserPassword(user: SaaSUser, password: string) {
  return bcrypt.compare(password, user.passwordHash);
}

export function createSessionToken(userId: string) {
  const payload: SessionPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifySessionToken(token?: string | null) {
  if (!token) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature || !safeEqual(sign(encodedPayload), signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;
    if (
      !payload ||
      typeof payload.userId !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(cookieStore: CookieReader) {
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const payload = verifySessionToken(token);
  if (!payload) return null;

  const user = await findUserById(payload.userId);
  return user ? toPublicUser(user) : null;
}
