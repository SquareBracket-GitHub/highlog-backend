const { z } = require("zod");

const studentIDSchema = z.object({
    student_id: z
        .string()
        .min(1)
});

const courseIDSchema = z.object({
    course_id: z
        .string()
        .min(1)
});

const enrolmentSchema = z.object({
    student_id: z
        .string()
        .min(1),
    course_id: z
        .string()
        .min(1)
});

module.exports = {
    studentIDSchema,
    courseIDSchema,
    enrolmentSchema
};