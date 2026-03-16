import type { z } from "zod/v4";

import {
  branchSchema,
  createBranchSchema,
  createTerminalSchema,
  terminalSchema,
  updateBranchSchema,
  updateTerminalSchema,
} from "./schemas";

export type Branch = z.infer<typeof branchSchema>;
export type Terminal = z.infer<typeof terminalSchema>;

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
export type CreateTerminalInput = z.infer<typeof createTerminalSchema>;
export type UpdateTerminalInput = z.infer<typeof updateTerminalSchema>;
