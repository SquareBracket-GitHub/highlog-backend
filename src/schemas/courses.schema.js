const z = require("zod");

const courseIdParamsSchema = z.object({
    id: z
        .string()
        .min(1)
});

const DAYS = ['월요일', '화요일', '수요일', '목요일', '금요일'];

const createCourseSchema = z.object({
    title: z
        .string()
        .min(1)
        .max(80),
    classroom: z
        .string()
        .min(1)
        .max(50),
    tag: z
        .string()
        .trim()
        .max(30)
        .nullable(),
    grade: z.coerce.number().int().min(1).max(6),
    classNo: z.coerce.number().int().min(1).max(30),
    day: z.enum(DAYS),
    period: z.coerce.number().int().min(1).max(12),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    isClassWide: z.boolean()
}).superRefine((course, context) => {
    if (course.isClassWide && course.tag !== null && course.tag !== '') {
        context.addIssue({ code: 'custom', path: ['tag'], message: 'Class-wide courses cannot have a tag' });
    }
    if (!course.isClassWide && !course.tag) {
        context.addIssue({ code: 'custom', path: ['tag'], message: 'Selectable courses require a tag' });
    }
});

const updateCourseSchema = createCourseSchema;

const deleteCourseSchema = z.object({
    id: z
        .string()
        .min(1)
});

module.exports = {
    courseIdParamsSchema,
    createCourseSchema,
    updateCourseSchema,
    deleteCourseSchema
}
