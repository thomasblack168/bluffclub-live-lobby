import { z } from "zod";

export const tableSchema = z.object({
  locationId: z.string().min(1),
  title: z.string().min(1),
  blindsLabel: z.string().min(1),
  maxSeats: z.coerce.number().int().min(1).max(20),
  footerText: z.string().optional().default(""),
  logoKey: z
    .union([z.string(), z.null(), z.undefined()])
    .optional()
    .transform((v) => {
      if (v == null) return null;
      const s = String(v).trim();
      return s.length ? s : null;
    }),
  sortOrder: z.coerce.number().int().optional().default(0),
});

export type TableFormValues = z.infer<typeof tableSchema>;

export function formatZodFormError(parsed: z.SafeParseError<unknown>): string {
  const field = parsed.error.flatten().fieldErrors as Record<string, string[] | undefined>;
  const first = Object.entries(field).find(([, v]) => Array.isArray(v) && v.length > 0);
  if (first && first[1]?.length) return `${first[0]}: ${first[1][0]}`;
  return "Invalid form data";
}
