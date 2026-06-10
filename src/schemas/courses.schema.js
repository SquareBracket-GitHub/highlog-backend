const z = require("zod");

const getCourseByIDSchema = z.object({
    id: z
        .string()
        .min(1)
});

const createCourseSchema = z.object({
    title: z
        .string()
        .min(1)
        .max(80),
    classroom: z
        .string()
        .min(1)
        .max(50),
    days: z.array(z.object({
        day: z
            .string()
            .min(3)
            .max(3),
        period: z
            .coerce.number()
            .int()
            .min(1)
    })),
    category: z
        .string()
        .min(0)
        .max(20)
});

const updateCourseSchema = z.object({
    title: z
        .string()
        .min(1)
        .max(80),
    classroom: z
        .string()
        .min(1)
        .max(50),
    days: z.array(z.object({
        day: z
            .string()
            .min(3)
            .max(3),
        period: z
            .coerce.number()
            .int()
            .min(1)
    }))
});

const deleteCourseSchema = z.object({
    id: z
        .string()
        .min(1)
});

module.exports = {
    getCourseByIDSchema,
    createCourseSchema,
    updateCourseSchema,
    deleteCourseSchema
}