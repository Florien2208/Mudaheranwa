import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../i18n";

const LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "rw", name: "Kinyarwanda", nativeName: "Kinyarwanda" },
  { code: "fr", name: "Français", nativeName: "Français" },
];

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

interface LanguageStore {
  // State
  currentLanguage: string;
  currentLanguageName: string;
  languages: Language[];
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initializeLanguage: () => Promise<void>;
  changeLanguage: (languageCode: string) => Promise<boolean>;
  getCurrentLanguageInfo: () => Language;
  resetLanguage: () => Promise<void>;
}

const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      // State
      currentLanguage: "en",
      currentLanguageName: "English",
      languages: LANGUAGES,
      isLoading: false,
      isInitialized: false,

      // Actions
      initializeLanguage: async () => {
        try {
          set({ isLoading: true });

          // Get saved language from AsyncStorage
          const savedLanguage = await AsyncStorage.getItem("user-language");
          const languageCode = savedLanguage || "en";

          // Find language info
          const language = LANGUAGES.find((lang) => lang.code === languageCode);
          const languageName = language ? language.name : "English";

          // Initialize i18n
          await i18n.changeLanguage(languageCode);

          set({
            currentLanguage: languageCode,
            currentLanguageName: languageName,
            isInitialized: true,
            isLoading: false,
          });

          console.log("Language initialized:", languageCode);
        } catch (error) {
          console.error("Failed to initialize language:", error);
          set({
            currentLanguage: "en",
            currentLanguageName: "English",
            isInitialized: true,
            isLoading: false,
          });
        }
      },

      changeLanguage: async (languageCode: string) => {
        try {
          set({ isLoading: true });

          // Find language info
          const language = LANGUAGES.find((lang) => lang.code === languageCode);
          if (!language) {
            throw new Error(`Language ${languageCode} not found`);
          }

          // Change i18n language
          await i18n.changeLanguage(languageCode);

          // Save to AsyncStorage
          await AsyncStorage.setItem("user-language", languageCode);

          // Update store
          set({
            currentLanguage: languageCode,
            currentLanguageName: language.name,
            isLoading: false,
          });

          console.log("Language changed to:", languageCode);
          return true;
        } catch (error) {
          console.error("Failed to change language:", error);
          set({ isLoading: false });
          return false;
        }
      },

      getCurrentLanguageInfo: () => {
        const { currentLanguage } = get();
        return (
          LANGUAGES.find((lang) => lang.code === currentLanguage) ||
          LANGUAGES[0]
        );
      },

      // Reset language to default
      resetLanguage: async () => {
        try {
          await get().changeLanguage("en");
          await AsyncStorage.removeItem("user-language");
        } catch (error) {
          console.error("Failed to reset language:", error);
        }
      },
    }),
    {
      name: "language-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentLanguage: state.currentLanguage,
        currentLanguageName: state.currentLanguageName,
      }),
    }
  )
);

export default useLanguageStore;
