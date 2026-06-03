const { z } = require("zod");

const getStudentsByIDSchema = z.object({
    id: z.
        string()
        .min(1)
});

const createStudentSchema = z.object({
    username: z
        .string()
        .min(1)
        .max(10),
    login_id: z
        .string()
        .min(1)
        .max(50),
    password: z
        .string()
        .min()
        .max(255),
    grade: z
        .coerce.number()
        .int()
        .min(1),
    class_no: z
        .coerce.number()
        .int()
        .min(1),
    school_number: z
        .coerce.number()
        .int()
        .min(1)
});

const updateStudentSchema = z.object({
    username: z
        .string()
        .min(1)
        .max(10),
    login_id: z
        .string()
        .min(1)
        .max(50),
    password: z
        .string()
        .min(1)
        .max(255),
    grade: z
        .coerce.number()
        .int()
        .min(1),
    class_no: z
        .coerce.number()
        .int()
        .min(1),
    school_number: z
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
    getStudentsByIDSchema,
    createStudentSchema,
    updateStudentSchema,
    deleteStudentSchema
}