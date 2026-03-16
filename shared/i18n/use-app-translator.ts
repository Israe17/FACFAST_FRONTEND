"use client";

import { createTranslator } from "./translator";
import { useAppLanguage } from "./use-app-language";

export function useAppTranslator() {
  const languageState = useAppLanguage();
  const t = createTranslator(languageState.language);

  return {
    ...languageState,
    t,
  };
}
