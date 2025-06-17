import { useTranslation } from "react-i18next";

import { useEffect } from "react";
import useLanguageStore from "@/store/useLanguageStore";

export const useLanguage = () => {
  const { t, i18n } = useTranslation();
  const {
    currentLanguage,
    currentLanguageName,
    languages,
    isLoading,
    isInitialized,
    initializeLanguage,
    changeLanguage,
    getCurrentLanguageInfo,
    resetLanguage,
  } = useLanguageStore();

  // Initialize language on first use
  useEffect(() => {
    if (!isInitialized) {
      initializeLanguage();
    }
  }, [isInitialized, initializeLanguage]);

  return {
    // Translation
    t,
    i18n,

    // Language state
    currentLanguage,
    currentLanguageName,
    languages,
    isLoading,
    isInitialized,

    // Language info
    getCurrentLanguageInfo,

    // Actions
    changeLanguage,
    resetLanguage,

    // Utility
    isRTL: ["ar", "he", "fa"].includes(currentLanguage),
  };
};
