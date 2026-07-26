export type SaaSUserRole = "user" | "admin" | "super_admin";

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

export type PublicSaaSUser = {
  id: string;
  email: string;
  name: string;
  role: SaaSUserRole;
  language?: "hy" | "en" | "ru";
  subscription?: SaaSUserSubscription;
  onboarding?: SaaSUserOnboarding;
  createdAt: string;
  updatedAt: string;
};

export function isSaaSAdmin(user: PublicSaaSUser | null | undefined) {
  return user?.role === "admin" || user?.role === "super_admin";
}

export function isSaaSSuperAdmin(user: PublicSaaSUser | null | undefined) {
  return user?.role === "super_admin";
}
