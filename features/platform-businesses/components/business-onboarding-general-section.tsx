"use client";

import type { UseFormReturn } from "react-hook-form";

import { BusinessSectionFields } from "@/features/businesses/components/business-section-fields";

import type { PlatformBusinessOnboardingInput } from "../types";

type BusinessOnboardingGeneralSectionProps = {
  form: UseFormReturn<PlatformBusinessOnboardingInput>;
};

function BusinessOnboardingGeneralSection({
  form,
}: BusinessOnboardingGeneralSectionProps) {
  return <BusinessSectionFields form={form} includeCode={false} prefix="business" />;
}

export { BusinessOnboardingGeneralSection };

