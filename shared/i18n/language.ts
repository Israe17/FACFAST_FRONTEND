export const APP_LANGUAGES = ["es", "en"] as const;

export type AppLanguage = (typeof APP_LANGUAGES)[number];

type ResolveAppLanguageOptions = {
  activeBusinessLanguage?: string | null;
  businessLanguage?: string | null;
  fallbackLanguage?: AppLanguage;
  sessionLanguage?: string | null;
};

export function normalizeAppLanguage(value?: string | null): AppLanguage | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase().replace(/_/g, "-");

  if (normalized.startsWith("es")) {
    return "es";
  }

  if (normalized.startsWith("en")) {
    return "en";
  }

  return null;
}

export function resolveAppLanguage(options: ResolveAppLanguageOptions = {}): AppLanguage {
  return (
    normalizeAppLanguage(options.activeBusinessLanguage) ??
    normalizeAppLanguage(options.businessLanguage) ??
    normalizeAppLanguage(options.sessionLanguage) ??
    options.fallbackLanguage ??
    "es"
  );
}
