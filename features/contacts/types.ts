import type { z } from "zod/v4";

import { contactTypeValues, identificationTypeValues } from "./constants";
import {
  contactSchema,
  createContactSchema,
  updateContactSchema,
} from "./schemas";

export type Contact = z.infer<typeof contactSchema>;

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ContactType = (typeof contactTypeValues)[number];
export type IdentificationType = (typeof identificationTypeValues)[number];
