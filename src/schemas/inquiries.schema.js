const z = require('zod');

const idParamsSchema = z.object({ id: z.coerce.number().int().positive() });
const createSchema = z.object({
  title: z.string().trim().min(1).max(100),
  content: z.string().trim().min(1).max(5000),
});
const responseSchema = z.object({
  response: z.string().trim().min(1).max(5000),
  close: z.boolean().default(false),
});

module.exports = { idParamsSchema, createSchema, responseSchema };
