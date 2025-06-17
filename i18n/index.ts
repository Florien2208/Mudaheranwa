// /i18n/index.ts
import { default as i18next } from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import translations
import en from "../locale/en.json";
import rw from "../locale/rw.json";
import fr from "../locale/fr.json";

interface LanguageDetector {
  type: "languageDetector";
  async: boolean;
  detect: (callback: (lang: string) => void) => Promise<void>;
  init: () => void;
  cacheUserLanguage: (language: string) => Promise<void>;
}

const LANGUAGE_DETECTOR: LanguageDetector = {
  type: "languageDetector",
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem("user-language");
      if (savedLanguage) {
        callback(savedLanguage);
      } else {
        callback("en");
      }
    } catch (error) {
      callback("en");
        console.error("Failed to detect language:", error);
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem("user-language", language);
    } catch (error) {
      console.error("Failed to cache language:", error);
    }
  },
};

i18next
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      rw: { translation: rw },
      fr: { translation: fr },
    },
    fallbackLng: "en",
    debug: __DEV__,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18next;
