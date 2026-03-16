import type { z } from "zod/v4";

import {
  platformBusinessBranchSchema,
  platformBusinessDetailSchema,
  platformBusinessOnboardingSchema,
  platformBusinessSchema,
} from "./schemas";

export type PlatformBusiness = z.infer<typeof platformBusinessSchema>;
export type PlatformBusinessDetail = z.infer<typeof platformBusinessDetailSchema>;
export type PlatformBusinessBranch = z.infer<typeof platformBusinessBranchSchema>;
export type PlatformBusinessOnboardingInput = z.infer<typeof platformBusinessOnboardingSchema>;

