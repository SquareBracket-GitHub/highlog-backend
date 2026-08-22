const z = require('zod');

const studentParamsSchema = z.object({ studentId: z.coerce.number().int().positive() });
const reviewSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  note: z.string().trim().max(200).default(''),
});

module.exports = { studentParamsSchema, reviewSchema };
