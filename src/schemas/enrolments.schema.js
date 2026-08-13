const { z } = require("zod");

const studentIdParamsSchema = z.object({
    studentId: z
        .coerce.number()
        .int()
        .min(1)
});

const courseIdParamsSchema = z.object({
    courseId: z
        .coerce.number()
        .int()
        .min(1)
});

const enrolmentSchema = z.object({
    studentId: z
        .coerce.number()
        .int()
        .min(1),
    courseId: z
        .coerce.number()
        .int()
        .min(1)
});

module.exports = {
    studentIdParamsSchema,
    courseIdParamsSchema,
    enrolmentSchema
};
