import type { SignupAddressKey, SignupFormValues } from "@/features/signup/config";
import {
  resolveAddressKeyFromForm,
  resolveLegalStatus,
} from "@/features/signup/config";

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const safe = (value: string) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^\w.-]+/g, "_");

export const normalizeSiret = (value: unknown) =>
  String(value ?? "").replace(/\D/g, "");

export const normalizeEmailLower = (value: unknown) =>
  String(value ?? "").trim().toLowerCase();

export function stripFiles(obj: Record<string, any>) {
  const jsonSafe: Record<string, any> = {};
  Object.entries(obj || {}).forEach(([key, value]) => {
    if (
      value instanceof File ||
      value instanceof Blob ||
      (typeof FileList !== "undefined" && value instanceof FileList)
    ) {
      return;
    }
    jsonSafe[key] = value;
  });
  return jsonSafe;
}

export function cleanObject(obj: any): any {
  if (Array.isArray(obj)) return obj.map(cleanObject);

  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        value === undefined ? null : cleanObject(value),
      ])
    );
  }

  return obj === undefined ? null : obj;
}

export function getAddressKeyFromSignupValues(
  values: SignupFormValues,
  fallback: SignupAddressKey = "orly"
): SignupAddressKey {
  return resolveAddressKeyFromForm(values, fallback);
}

export function getResolvedLegalStatus(values: SignupFormValues): string {
  return resolveLegalStatus(
    String(values.legalStatus ?? ""),
    String(values.otherLegalStatus ?? "")
  );
}