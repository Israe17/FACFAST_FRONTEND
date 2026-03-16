"use client";

import type { UseFormReturn } from "react-hook-form";

import { ActionButton } from "@/shared/components/action-button";

import type { PlatformBusinessOnboardingInput } from "../types";
import { BusinessOnboardingBranchSection } from "./business-onboarding-branch-section";
import { BusinessOnboardingGeneralSection } from "./business-onboarding-general-section";
import { BusinessOnboardingOwnerSection } from "./business-onboarding-owner-section";
import { BusinessOnboardingTerminalSection } from "./business-onboarding-terminal-section";

type CreateBusinessOnboardingFormProps = {
  form: UseFormReturn<PlatformBusinessOnboardingInput>;
  isPending?: boolean;
  onSubmit: (values: PlatformBusinessOnboardingInput) => Promise<void> | void;
};

function CreateBusinessOnboardingForm({
  form,
  isPending,
  onSubmit,
}: CreateBusinessOnboardingFormProps) {
  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <BusinessOnboardingGeneralSection form={form} />
      <BusinessOnboardingOwnerSection form={form} />
      <BusinessOnboardingBranchSection form={form} />
      <BusinessOnboardingTerminalSection form={form} />

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText="Creating" type="submit">
          Create business
        </ActionButton>
      </div>
    </form>
  );
}

export { CreateBusinessOnboardingForm };

