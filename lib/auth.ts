import bcrypt from "bcrypt";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import { getRuntimeDataDir } from "@/lib/runtimeDataDir";
import type { Locale } from "@/lib/i18n";

export type SaaSUserRole = "user" | "admin" | "super_admin";

export type SaaSUser = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: SaaSUserRole;
  language?: Locale;
  subscription?: SaaSUserSubscription;
  onboarding?: SaaSUserOnboarding;
  createdAt: string;
  updatedAt: string;
};

export type PublicSaaSUser = Omit<SaaSUser, "passwordHash">;

export type SaaSUserSubscription = {
  packageId: string;
  packageName: string;
  packageType: string;
  priceText: string;
  requestedAt: string;
};

export type SaaSUserOnboarding = {
  companyName: string;
  logoUrl: string;
  businessCategory: string;
  phone: string;
  publicEmail: string;
  address: string;
  websiteName: string;
  preferredDomain: string;
  businessDescription: string;
  facebookUrl: string;
  instagramUrl: string;
  styleNotes: string;
  additionalNotes: string;
  updatedAt: string;
};

type SessionPayload = {
  userId: string;
  exp: number;
};

type CookieReader = {
  get(name: string): { value?: string } | undefined;
};

const USERS_FILE = () => path.join(getRuntimeDataDir(), "users.json");
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

function normalizeText(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").slice(0, maxLength)
    : "";
}

function normalizeLongText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeUrl(value: unknown) {
  const text = normalizeText(value, 240);
  if (!text) return "";
  if (/^https?:\/\//i.test(text)) return text;
  return `https://${text}`;
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
    (user.language === undefined || user.language === "en" || user.language === "hy") &&
    (user.subscription === undefined || isUserSubscription(user.subscription)) &&
    (user.onboarding === undefined || isUserOnboarding(user.onboarding)) &&
    typeof user.createdAt === "string" &&
    typeof user.updatedAt === "string"
  );
}

function isUserSubscription(value: unknown): value is SaaSUserSubscription {
  if (!value || typeof value !== "object") return false;
  const subscription = value as Partial<SaaSUserSubscription>;
  return (
    typeof subscription.packageId === "string" &&
    typeof subscription.packageName === "string" &&
    typeof subscription.packageType === "string" &&
    typeof subscription.priceText === "string" &&
    typeof subscription.requestedAt === "string"
  );
}

function isUserOnboarding(value: unknown): value is SaaSUserOnboarding {
  if (!value || typeof value !== "object") return false;
  const onboarding = value as Partial<SaaSUserOnboarding>;
  return (
    typeof onboarding.companyName === "string" &&
    typeof onboarding.logoUrl === "string" &&
    typeof onboarding.businessCategory === "string" &&
    typeof onboarding.phone === "string" &&
    typeof onboarding.publicEmail === "string" &&
    typeof onboarding.address === "string" &&
    typeof onboarding.websiteName === "string" &&
    typeof onboarding.preferredDomain === "string" &&
    typeof onboarding.businessDescription === "string" &&
    typeof onboarding.facebookUrl === "string" &&
    typeof onboarding.instagramUrl === "string" &&
    typeof onboarding.styleNotes === "string" &&
    typeof onboarding.additionalNotes === "string" &&
    typeof onboarding.updatedAt === "string"
  );
}

export function toPublicUser(user: SaaSUser): PublicSaaSUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    language: user.language,
    subscription: user.subscription,
    onboarding: user.onboarding,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function isSaaSAdmin(user: PublicSaaSUser | null | undefined) {
  return user?.role === "admin" || user?.role === "super_admin";
}

export function isSaaSSuperAdmin(user: PublicSaaSUser | null | undefined) {
  return user?.role === "super_admin";
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

export function validateOnboardingInput(
  input: Record<string, unknown>,
  existingLogoUrl = "",
) {
  const companyName = normalizeText(input.companyName, 120);
  const businessCategory = normalizeText(input.businessCategory, 100);
  const phone = normalizeText(input.phone, 60);
  const publicEmail = normalizeEmail(input.publicEmail);
  const address = normalizeText(input.address, 180);
  const websiteName = normalizeText(input.websiteName, 100);
  const preferredDomain = normalizeText(input.preferredDomain, 120);
  const businessDescription = normalizeLongText(input.businessDescription, 800);
  const facebookUrl = normalizeUrl(input.facebookUrl);
  const instagramUrl = normalizeUrl(input.instagramUrl);
  const styleNotes = normalizeLongText(input.styleNotes, 600);
  const additionalNotes = normalizeLongText(input.additionalNotes, 800);

  if (!companyName) return { error: "Company / Business name is required." };
  if (!businessCategory) return { error: "Business category is required." };
  if (!phone) return { error: "Phone is required." };
  if (!EMAIL_PATTERN.test(publicEmail)) {
    return { error: "Enter a valid public business email." };
  }
  if (!websiteName) return { error: "Website name is required." };
  if (!businessDescription) {
    return { error: "Short business description is required." };
  }

  return {
    companyName,
    logoUrl: existingLogoUrl,
    businessCategory,
    phone,
    publicEmail,
    address,
    websiteName,
    preferredDomain,
    businessDescription,
    facebookUrl,
    instagramUrl,
    styleNotes,
    additionalNotes,
    updatedAt: new Date().toISOString(),
  };
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
    const raw = await readFile(USERS_FILE(), "utf8");
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
  const usersFile = USERS_FILE();
  await mkdir(path.dirname(usersFile), { recursive: true });
  await writeFile(usersFile, `${JSON.stringify(users, null, 2)}\n`, "utf8");
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
  subscription?: SaaSUserSubscription;
  onboarding?: SaaSUserOnboarding;
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
    subscription: input.subscription,
    onboarding: input.onboarding,
    createdAt: now,
    updatedAt: now,
  };

  await writeUsers([...users, user]);
  return { user };
}

export async function updateUserOnboarding(
  userId: string,
  onboarding: SaaSUserOnboarding,
) {
  const users = await readUsers();
  const existing = users.find((user) => user.id === userId);
  if (!existing) return { error: "User not found." };

  const updatedUser: SaaSUser = {
    ...existing,
    onboarding,
    updatedAt: new Date().toISOString(),
  };

  await writeUsers(users.map((user) => (user.id === userId ? updatedUser : user)));
  return { user: updatedUser };
}

export async function updateUserLanguage(userId: string, language: Locale) {
  const users = await readUsers();
  const existing = users.find((user) => user.id === userId);
  if (!existing) return { error: "User not found." };

  const updatedUser: SaaSUser = {
    ...existing,
    language,
    updatedAt: new Date().toISOString(),
  };
  await writeUsers(users.map((user) => (user.id === userId ? updatedUser : user)));
  return { user: updatedUser };
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
