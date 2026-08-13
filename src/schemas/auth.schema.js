const { z } = require("zod");

const loginSchema = z.object({
    loginId: z.string().trim().min(1).max(50),
    password: z.string().min(1).max(128)
});

module.exports = { loginSchema };
