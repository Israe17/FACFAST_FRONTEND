import { resolveAppLanguage, type AppLanguage } from "./language";
import { translations, type FrontendTranslationKey } from "./translations";

type TranslationValues = Record<string, string | number>;

function interpolate(template: string, values?: TranslationValues) {
  if (!values) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];
    return value == null ? `{${key}}` : String(value);
  });
}

export function translate(
  language: AppLanguage,
  key: FrontendTranslationKey,
  values?: TranslationValues,
) {
  const resolvedLanguage = resolveAppLanguage({ fallbackLanguage: language });
  const template = translations[resolvedLanguage][key] ?? translations.es[key] ?? key;

  return interpolate(template, values);
}

export function createTranslator(language: AppLanguage) {
  return (key: FrontendTranslationKey, values?: TranslationValues) =>
    translate(language, key, values);
}

export type { TranslationValues };
