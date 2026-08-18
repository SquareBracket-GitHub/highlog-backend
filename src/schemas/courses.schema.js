const z = require("zod");

const courseIdParamsSchema = z.object({
    id: z
        .string()
        .min(1)
});

const DAYS = ['월요일', '화요일', '수요일', '목요일', '금요일'];
const scheduleSchema = z.object({
    day: z.enum(DAYS),
    period: z.coerce.number().int().min(1).max(7)
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
    tag: z
        .string()
        .trim()
        .max(30)
        .nullable(),
    grade: z.coerce.number().int().min(1).max(6),
    classNo: z.coerce.number().int().min(1).max(30).nullable(),
    schedules: z.array(scheduleSchema).min(1).max(30),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    isClassWide: z.boolean()
}).superRefine((course, context) => {
    if (course.isClassWide && course.tag !== null && course.tag !== '') {
        context.addIssue({ code: 'custom', path: ['tag'], message: 'Class-wide courses cannot have a tag' });
    }
    if (!course.isClassWide && !course.tag) {
        context.addIssue({ code: 'custom', path: ['tag'], message: 'Selectable courses require a tag' });
    }
    if (course.isClassWide && course.classNo === null) {
        context.addIssue({ code: 'custom', path: ['classNo'], message: 'Class-wide courses require a class number' });
    }
    if (!course.isClassWide && course.classNo !== null) {
        context.addIssue({ code: 'custom', path: ['classNo'], message: 'Selectable courses cannot be limited to a class' });
    }
    const scheduleKeys = course.schedules.map(({ day, period }) => `${day}-${period}`);
    if (new Set(scheduleKeys).size !== scheduleKeys.length) {
        context.addIssue({ code: 'custom', path: ['schedules'], message: 'Duplicate schedules are not allowed' });
    }
});

const updateCourseSchema = createCourseSchema;
const conflictCheckSchema = createCourseSchema.safeExtend({
    excludeCourseId: z.coerce.number().int().positive().optional()
});

const deleteCourseSchema = z.object({
    id: z
        .string()
        .min(1)
});

module.exports = {
    courseIdParamsSchema,
    createCourseSchema,
    updateCourseSchema,
    conflictCheckSchema,
    deleteCourseSchema
}
