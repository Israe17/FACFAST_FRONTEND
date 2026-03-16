import type { z } from "zod/v4";

import {
  businessSchema,
  onboardingSchema,
  updateCurrentBusinessSchema,
} from "./schemas";

export type Business = z.infer<typeof businessSchema>;
export type UpdateCurrentBusinessInput = z.infer<typeof updateCurrentBusinessSchema>;
export type BusinessOnboardingInput = z.infer<typeof onboardingSchema>;

