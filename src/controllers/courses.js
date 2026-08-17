const db = require('../models/db');
const logger = require('../utils/logger');

const COURSE_COLUMNS = `
    id, title, tag, classroom, days, grade, class_no, day, period, color, is_class_wide
`;

const toCourseDto = ({
    id, title, tag, classroom, days, grade, class_no, day, period, color, is_class_wide
}) => ({
    id, title, tag, classroom,
    days: typeof days === 'string' ? JSON.parse(days) : days,
    grade, classNo: class_no, day, period, color,
    isClassWide: Boolean(is_class_wide)
});

const query = (sql, params = []) => new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => err ? reject(err) : resolve(result));
});
const beginTransaction = () => new Promise((resolve, reject) => {
    db.beginTransaction((err) => err ? reject(err) : resolve());
});
const commit = () => new Promise((resolve, reject) => {
    db.commit((err) => err ? reject(err) : resolve());
});
const rollback = () => new Promise((resolve) => db.rollback(resolve));

exports.listCourses = async (_req, res) => {
    try {
        const results = await query(`SELECT ${COURSE_COLUMNS} FROM courses`);
        return res.json({ result: 'SUCCESS', data: results.map(toCourseDto) });
    } catch (err) {
        logger.error('Error fetching courses.\n' + err);
        return res.status(500).json({ result: 'ERROR', error: 'Error fetching courses' });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const results = await query(
            `SELECT ${COURSE_COLUMNS} FROM courses WHERE id = ?`,
            [req.validated.params.id]
        );
        return res.json({ result: 'SUCCESS', data: results[0] ? toCourseDto(results[0]) : null });
    } catch (err) {
        logger.error('Error fetching course.\n' + err);
        return res.status(500).json({ result: 'ERROR', error: 'Error fetching course' });
    }
};

exports.createCourse = async (req, res) => {
    const { title, tag, classroom, grade, classNo, schedules, color, isClassWide } = req.validated.body;
    const normalizedTag = isClassWide ? null : tag;
    let transactionStarted = false;

    try {
        await beginTransaction();
        transactionStarted = true;

        const tuplePlaceholders = schedules.map(() => '(?, ?)').join(', ');
        const scheduleParams = schedules.flatMap(({ day, period }) => [day, period]);
        const classScope = isClassWide
            ? '(class_no = ? OR class_no IS NULL)'
            : '1 = 1';
        const classParams = isClassWide ? [classNo] : [];
        const existingSlots = await query(
            `SELECT id, day, period, tag, course_id, class_no
             FROM class_timetable_slots
             WHERE grade = ? AND ${classScope}
               AND (day, period) IN (${tuplePlaceholders})
             FOR UPDATE`,
            [grade, ...classParams, ...scheduleParams]
        );

        for (const slot of existingSlots) {
            const canShareSelectableSlot = !isClassWide
                && slot.course_id === null
                && slot.class_no === null
                && slot.tag === normalizedTag;
            if (!canShareSelectableSlot) {
                const conflict = new Error(`${slot.day} ${slot.period}교시는 이미 사용 중입니다.`);
                conflict.status = 409;
                throw conflict;
            }
        }

        const firstSchedule = schedules[0];
        const courseResult = await query(
            `INSERT INTO courses
                (title, tag, classroom, days, grade, class_no, day, period, color, is_class_wide)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title, normalizedTag, classroom, JSON.stringify(schedules), grade, classNo,
                firstSchedule.day, firstSchedule.period, color, isClassWide
            ]
        );
        const courseId = courseResult.insertId;

        const existingKeys = new Set(existingSlots.map(({ day, period }) => `${day}-${period}`));
        for (const schedule of schedules) {
            if (existingKeys.has(`${schedule.day}-${schedule.period}`)) continue;
            await query(
                `INSERT INTO class_timetable_slots
                    (grade, class_no, day, period, label, tag, course_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    grade, classNo, schedule.day, schedule.period, title,
                    normalizedTag, isClassWide ? courseId : null
                ]
            );
        }

        if (isClassWide) {
            await query(
                `INSERT IGNORE INTO enrolments (student_id, course_id, source)
                 SELECT id, ?, 'fixed' FROM students WHERE grade = ? AND class_no = ?`,
                [courseId, grade, classNo]
            );
        }

        await commit();
        transactionStarted = false;
        return res.status(201).json({
            result: 'SUCCESS',
            data: {
                id: courseId, title, tag: normalizedTag, classroom, days: schedules,
                grade, classNo, day: firstSchedule.day, period: firstSchedule.period,
                color, isClassWide
            }
        });
    } catch (err) {
        if (transactionStarted) await rollback();
        logger.error('Error creating course.\n' + err);
        const duplicateSlot = err.code === 'ER_DUP_ENTRY';
        return res.status(err.status || (duplicateSlot ? 409 : 500)).json({
            result: 'ERROR',
            error: err.message || 'Error creating course'
        });
    }
};

exports.updateCourse = (_req, res) => res.status(501).json({
    result: 'ERROR', error: 'Course update is not supported yet'
});

exports.deleteCourse = async (req, res) => {
    const { id } = req.validated.params;
    try {
        await query('DELETE FROM courses WHERE id = ?', [id]);
        return res.json({ result: 'SUCCESS', data: { id: Number(id) } });
    } catch (err) {
        logger.error('Error deleting course.\n' + err);
        return res.status(500).json({ result: 'ERROR', error: 'Error deleting course' });
    }
};
