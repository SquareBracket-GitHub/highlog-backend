const z = require('zod');

const idParamsSchema = z.object({ id: z.coerce.number().int().positive() });
const commentIdParamsSchema = z.object({ commentId: z.coerce.number().int().positive() });
const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(30).default(20),
});
const postBodySchema = z.object({
  title: z.string().trim().min(1).max(100),
  content: z.string().trim().min(1).max(5000),
});
const commentBodySchema = z.object({ content: z.string().trim().min(1).max(500) });
const moderationBodySchema = z.object({ reason: z.string().trim().min(2).max(200) });

module.exports = { idParamsSchema, commentIdParamsSchema, listQuerySchema, postBodySchema, commentBodySchema, moderationBodySchema };
