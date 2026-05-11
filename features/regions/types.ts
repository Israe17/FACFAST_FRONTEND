import { z } from "zod";

export const countrySchema = z.object({
  id: z.number().int(),
  code: z.string(),
  name: z.string(),
});

export const provinceSchema = z.object({
  id: z.number().int(),
  country_id: z.number().int(),
  code: z.string(),
  name: z.string(),
});

export const cantonSchema = z.object({
  id: z.number().int(),
  province_id: z.number().int(),
  code: z.string(),
  name: z.string(),
});

export const districtSchema = z.object({
  id: z.number().int(),
  canton_id: z.number().int(),
  code: z.string(),
  name: z.string(),
});

export type Country = z.infer<typeof countrySchema>;
export type Province = z.infer<typeof provinceSchema>;
export type Canton = z.infer<typeof cantonSchema>;
export type District = z.infer<typeof districtSchema>;
