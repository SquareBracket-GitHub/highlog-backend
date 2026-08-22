const z = require("zod");

const DAYS = ["월", "화", "수", "목", "금"];

const slotParamsSchema = z.object({
  day: z.enum(DAYS),
  period: z.coerce.number().int().min(1).max(7),
});

const saveEntrySchema = z.object({
  day: z.enum(DAYS),
  period: z.coerce.number().int().min(1).max(7),
  subjectName: z.string().trim().min(1).max(80),
  className: z.string().trim().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

module.exports = { slotParamsSchema, saveEntrySchema };
