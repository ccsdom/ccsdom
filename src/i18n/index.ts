import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./resource";

export const SUPPORTED_LANGS = ["fr", "en", "zh", "ar"] as const;
export type AppLang = typeof SUPPORTED_LANGS[number];
export const DEFAULT_LANG: AppLang = "fr";

// Normalise "fr-FR" -> "fr", etc.
function normalize(langRaw?: string): AppLang {
  const raw = (langRaw || "").toLowerCase();
  if (raw.startsWith("fr")) return "fr";
  if (raw.startsWith("en")) return "en";
  if (raw.startsWith("zh")) return "zh"; // zh, zh-CN, zh-TW...
  if (raw.startsWith("ar")) return "ar";
  return DEFAULT_LANG;
}

// Langue initiale: localStorage -> navigateur -> FR
const stored =
  typeof window !== "undefined" ? (localStorage.getItem("lang") as AppLang | null) : null;
const browser =
  typeof navigator !== "undefined" ? normalize(navigator.language) : DEFAULT_LANG;
const initialLang: AppLang =
  stored && SUPPORTED_LANGS.includes(stored) ? stored : browser;

// Applique <html lang> et dir RTL si arabe
function applyHtmlAttrs(lang: AppLang) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
}

i18next.use(initReactI18next).init({
  resources,
  lng: initialLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

applyHtmlAttrs(initialLang);

// Persistance + mise à jour des attributs HTML
i18next.on("languageChanged", (lng) => {
  const lang = normalize(lng);
  try {
    localStorage.setItem("lang", lang);
  } catch {}
  applyHtmlAttrs(lang);
});

// Helpers pratiques
export function setLanguage(lang: AppLang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  i18next.changeLanguage(lang);
}
export function getLanguage(): AppLang {
  const raw = i18next.language?.toLowerCase() || DEFAULT_LANG;
  return normalize(raw);
}

export default i18next;
