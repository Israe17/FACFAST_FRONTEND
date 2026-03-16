"use client";

import { useSession } from "@/shared/hooks/use-session";

import { resolveAppLanguage } from "./language";

export function useAppLanguage() {
  const session = useSession();
  const activeBusinessLanguage = session.user?.active_business_language ?? null;
  const language = resolveAppLanguage({
    activeBusinessLanguage,
  });

  return {
    activeBusinessLanguage,
    isLoadingLanguage: session.isLoading && !activeBusinessLanguage,
    isUsingBusinessLanguage: Boolean(activeBusinessLanguage),
    language,
    sessionLanguage: null,
  };
}
