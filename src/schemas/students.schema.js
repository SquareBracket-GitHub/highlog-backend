const { z } = require("zod");

const studentIdParamsSchema = z.object({
    id: z.
        string()
        .min(1)
});

const createStudentSchema = z.object({
    username: z
        .string()
        .min(1)
        .max(10),
    loginId: z
        .string()
        .trim()
        .min(3)
        .max(50),
    password: z
        .string()
        .min(8)
        .max(128),
    grade: z
        .coerce.number()
        .int()
        .min(1),
    classNo: z
        .coerce.number()
        .int()
        .min(1),
    schoolNumber: z
        .coerce.number()
        .int()
        .min(1),
    agreements: z.object({
        serviceTerms: z.literal(true),
        privacyPolicy: z.literal(true),
        anonymousBoardNotice: z.literal(true),
        ageOrGuardianConfirmed: z.literal(true)
    })
});

const updateStudentSchema = z.object({
    username: z
        .string()
        .min(1)
        .max(10),
    grade: z
        .coerce.number()
        .int()
        .min(1),
    classNo: z
        .coerce.number()
        .int()
        .min(1),
    schoolNumber: z
        .coerce.number()
        .int()
        .min(1)
});

const deleteStudentSchema = z.object({
    id: z.
        string()
        .min(1)
});



module.exports = {
    studentIdParamsSchema,
    createStudentSchema,
    updateStudentSchema,
    deleteStudentSchema
}
