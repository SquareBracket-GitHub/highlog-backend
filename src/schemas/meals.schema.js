const z = require('zod');

const mealsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

module.exports = { mealsQuerySchema };
