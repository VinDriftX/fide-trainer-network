import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "@/i18n/en.json";
import my from "@/i18n/my.json";
import zh from "@/i18n/zh.json";

export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "my", label: "Burmese", native: "မြန်မာ" },
  { code: "zh", label: "Chinese", native: "中文" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];
export const STORAGE_KEY = "ftn.lang";

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        my: { translation: my },
        zh: { translation: zh },
      },
      fallbackLng: "en",
      supportedLngs: ["en", "my", "zh"],
      interpolation: { escapeValue: false },
      detection: {
        order: ["localStorage", "navigator"],
        lookupLocalStorage: STORAGE_KEY,
        caches: ["localStorage"],
      },
      react: { useSuspense: false },
    });
}

export function setLanguage(code: LanguageCode) {
  i18n.changeLanguage(code);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, code);
    document.documentElement.lang = code;
  }
}

export default i18n;
