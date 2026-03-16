import type { z } from "zod/v4";

import { authUserSchema, loginSchema } from "./schemas";

export type LoginInput = z.infer<typeof loginSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type BranchId = AuthUser["branch_ids"][number];
export type SessionMode = AuthUser["mode"];
