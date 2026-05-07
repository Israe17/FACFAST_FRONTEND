import type { z } from "zod/v4";

import { contactTypeValues, identificationTypeValues } from "./constants";
import {
  contactBranchAssignmentSchema,
  contactBranchContextSchema,
  contactSchema,
  createContactBranchAssignmentSchema,
  createContactSchema,
  haciendaActivitySchema,
  haciendaExonerationSchema,
  haciendaTaxpayerSchema,
  updateContactBranchAssignmentSchema,
  updateContactSchema,
} from "./schemas";

export type Contact = z.infer<typeof contactSchema>;
export type ContactBranchAssignment = z.infer<typeof contactBranchAssignmentSchema>;
export type ContactBranchContext = z.infer<typeof contactBranchContextSchema>;

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type CreateContactBranchAssignmentInput = z.infer<
  typeof createContactBranchAssignmentSchema
>;
export type UpdateContactBranchAssignmentInput = z.infer<
  typeof updateContactBranchAssignmentSchema
>;
export type ContactType = (typeof contactTypeValues)[number];
export type IdentificationType = (typeof identificationTypeValues)[number];

export type HaciendaActivity = z.infer<typeof haciendaActivitySchema>;
export type HaciendaTaxpayer = z.infer<typeof haciendaTaxpayerSchema>;
export type HaciendaExoneration = z.infer<typeof haciendaExonerationSchema>;
