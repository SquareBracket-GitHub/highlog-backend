const db = require('../models/db');
const logger = require('../utils/logger');

const COURSE_COLUMNS = `id, title, tag, classroom, days, grade, class_no, day, period,
 color, is_class_wide, created_by_student_id`;
const query = (sql, params = []) => new Promise((resolve, reject) => db.query(sql, params, (e, r) => e ? reject(e) : resolve(r)));
const tx = (method) => new Promise((resolve, reject) => db[method]((e) => e ? reject(e) : resolve()));
const parseDays = (days) => typeof days === 'string' ? JSON.parse(days) : days;
const scheduleKey = (items) => [...items].map(({ day, period }) => `${day}-${Number(period)}`).sort().join('|');
const toDto = (row) => ({
    id: row.id, title: row.title, tag: row.tag, classroom: row.classroom,
    days: parseDays(row.days), grade: row.grade, classNo: row.class_no,
    day: row.day, period: row.period, color: row.color,
    isClassWide: Boolean(row.is_class_wide), createdByStudentId: row.created_by_student_id
});

async function assertTagConsistency(data, excludeId = 0) {
    if (data.isClassWide) return;
    const rows = await query(
        `SELECT id, grade, days FROM courses WHERE tag = ? AND id <> ? FOR UPDATE`,
        [data.tag, excludeId]
    );
    const mismatch = rows.find((row) => row.grade !== data.grade || scheduleKey(parseDays(row.days)) !== scheduleKey(data.schedules));
    if (mismatch) {
        const error = new Error('같은 태그의 선택과목은 학년과 수업 일정이 같아야 합니다.');
        error.status = 409;
        throw error;
    }
}

async function findConflicts(data, excludeId = 0) {
    const { grade, classNo, schedules, isClassWide, tag } = data;
    const tuples = schedules.map(() => '(?, ?)').join(', ');
    const params = schedules.flatMap(({ day, period }) => [day, period]);
    const scope = isClassWide ? '(class_no = ? OR class_no IS NULL)' : '1 = 1';
    const scopeParams = isClassWide ? [classNo] : [];
    const rows = await query(
        `SELECT id, day, period, tag, course_id, class_no
         FROM class_timetable_slots
         WHERE grade = ? AND ${scope} AND (day, period) IN (${tuples})
           AND (course_id IS NULL OR course_id <> ?)
         FOR UPDATE`,
        [grade, ...scopeParams, ...params, excludeId]
    );
    return rows.filter((slot) => !(
        !isClassWide && slot.course_id === null && slot.class_no === null && slot.tag === tag
    ));
}

async function removeCourseRelations(course) {
    await query('DELETE FROM enrolments WHERE course_id = ?', [course.id]);
    if (course.is_class_wide) {
        await query('DELETE FROM class_timetable_slots WHERE course_id = ?', [course.id]);
        return;
    }
    const alternatives = await query(
        'SELECT COUNT(*) AS count FROM courses WHERE id <> ? AND grade = ? AND tag = ?',
        [course.id, course.grade, course.tag]
    );
    if (!alternatives[0].count) {
        await query(
            'DELETE FROM class_timetable_slots WHERE grade = ? AND class_no IS NULL AND tag = ? AND course_id IS NULL',
            [course.grade, course.tag]
        );
    }
}

async function createRelations(courseId, data, existingSlots = []) {
    const existingKeys = new Set(existingSlots.map(({ day, period }) => `${day}-${period}`));
    for (const schedule of data.schedules) {
        if (existingKeys.has(`${schedule.day}-${schedule.period}`)) continue;
        await query(
            `INSERT INTO class_timetable_slots (grade, class_no, day, period, label, tag, course_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [data.grade, data.classNo, schedule.day, schedule.period, data.title,
                data.isClassWide ? null : data.tag, data.isClassWide ? courseId : null]
        );
    }
    if (data.isClassWide) {
        await query(
            `INSERT IGNORE INTO enrolments (student_id, course_id, source)
             SELECT id, ?, 'fixed' FROM students WHERE grade = ? AND class_no = ?`,
            [courseId, data.grade, data.classNo]
        );
    }
}

async function ownedCourse(id, studentId) {
    const rows = await query(`SELECT ${COURSE_COLUMNS} FROM courses WHERE id = ? FOR UPDATE`, [id]);
    if (!rows[0]) { const e = new Error('과목을 찾을 수 없습니다.'); e.status = 404; throw e; }
    if (Number(rows[0].created_by_student_id) !== Number(studentId)) {
        const e = new Error('본인이 추가한 과목만 관리할 수 있습니다.'); e.status = 403; throw e;
    }
    return rows[0];
}

const sendError = async (res, err, started) => {
    if (started) await tx('rollback');
    logger.error('Course operation failed.\n' + err);
    return res.status(err.status || (err.code === 'ER_DUP_ENTRY' ? 409 : 500))
        .json({ result: 'ERROR', error: err.message || 'Course operation failed' });
};

exports.listCourses = async (_req, res) => {
    try { const rows = await query(`SELECT ${COURSE_COLUMNS} FROM courses`); return res.json({ result: 'SUCCESS', data: rows.map(toDto) }); }
    catch (e) { return sendError(res, e, false); }
};
exports.listMine = async (req, res) => {
    try {
        const rows = await query(`SELECT ${COURSE_COLUMNS} FROM courses WHERE created_by_student_id = ? ORDER BY id DESC`, [req.auth.studentId]);
        return res.json({ result: 'SUCCESS', data: rows.map(toDto) });
    } catch (e) { return sendError(res, e, false); }
};
exports.getCourseById = async (req, res) => {
    try { const rows = await query(`SELECT ${COURSE_COLUMNS} FROM courses WHERE id = ?`, [req.validated.params.id]); return res.json({ result: 'SUCCESS', data: rows[0] ? toDto(rows[0]) : null }); }
    catch (e) { return sendError(res, e, false); }
};
exports.getImpact = async (req, res) => {
    try {
        const course = await ownedCourse(req.validated.params.id, req.auth.studentId);
        const alternatives = course.is_class_wide ? [{ count: 0 }] : await query(
            'SELECT COUNT(*) AS count FROM courses WHERE id <> ? AND grade = ? AND tag = ?',
            [course.id, course.grade, course.tag]
        );
        const slotSql = course.is_class_wide
            ? 'SELECT COUNT(*) AS count FROM class_timetable_slots WHERE course_id = ?'
            : alternatives[0].count
                ? 'SELECT 0 AS count'
                : 'SELECT COUNT(*) AS count FROM class_timetable_slots WHERE grade = ? AND class_no IS NULL AND tag = ?';
        const slotParams = course.is_class_wide ? [course.id] : alternatives[0].count ? [] : [course.grade, course.tag];
        const [enrolments, slots] = await Promise.all([
            query('SELECT COUNT(*) AS count FROM enrolments WHERE course_id = ?', [req.validated.params.id]),
            query(slotSql, slotParams)
        ]);
        return res.json({ result: 'SUCCESS', data: { enrolledStudents: enrolments[0].count, timetableSlots: slots[0].count } });
    } catch (e) { return sendError(res, e, false); }
};
exports.checkConflicts = async (req, res) => {
    try {
        const conflicts = await findConflicts(req.validated.body, req.validated.body.excludeCourseId || 0);
        await assertTagConsistency(req.validated.body, req.validated.body.excludeCourseId || 0);
        return res.json({ result: 'SUCCESS', data: { conflicts: conflicts.map(({ day, period }) => ({ day, period })) } });
    } catch (e) {
        if (e.status === 409) return res.json({ result: 'SUCCESS', data: { conflicts: [], tagError: e.message } });
        return sendError(res, e, false);
    }
};
exports.createCourse = async (req, res) => {
    const data = req.validated.body; let started = false;
    try {
        await tx('beginTransaction'); started = true;
        await assertTagConsistency(data);
        const conflicts = await findConflicts(data);
        if (conflicts.length) { const e = new Error(`${conflicts[0].day} ${conflicts[0].period}교시는 이미 사용 중입니다.`); e.status = 409; throw e; }
        const first = data.schedules[0];
        const result = await query(
            `INSERT INTO courses (title, tag, classroom, days, grade, class_no, day, period, color, is_class_wide, created_by_student_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [data.title, data.isClassWide ? null : data.tag, data.classroom, JSON.stringify(data.schedules), data.grade,
                data.classNo, first.day, first.period, data.color, data.isClassWide, req.auth.studentId]
        );
        const shareable = data.isClassWide ? [] : await query(
            `SELECT day, period FROM class_timetable_slots WHERE grade=? AND class_no IS NULL AND tag=? AND course_id IS NULL`,
            [data.grade, data.tag]
        );
        await createRelations(result.insertId, data, shareable);
        await tx('commit'); started = false;
        const rows = await query(`SELECT ${COURSE_COLUMNS} FROM courses WHERE id = ?`, [result.insertId]);
        return res.status(201).json({ result: 'SUCCESS', data: toDto(rows[0]) });
    } catch (e) { return sendError(res, e, started); }
};
exports.updateCourse = async (req, res) => {
    const data = req.validated.body; let started = false;
    try {
        await tx('beginTransaction'); started = true;
        const old = await ownedCourse(req.validated.params.id, req.auth.studentId);
        await removeCourseRelations(old);
        await assertTagConsistency(data, old.id);
        const conflicts = await findConflicts(data, old.id);
        if (conflicts.length) { const e = new Error(`${conflicts[0].day} ${conflicts[0].period}교시는 이미 사용 중입니다.`); e.status = 409; throw e; }
        const first = data.schedules[0];
        await query(
            `UPDATE courses SET title=?, tag=?, classroom=?, days=?, grade=?, class_no=?, day=?, period=?, color=?, is_class_wide=? WHERE id=?`,
            [data.title, data.isClassWide ? null : data.tag, data.classroom, JSON.stringify(data.schedules), data.grade,
                data.classNo, first.day, first.period, data.color, data.isClassWide, old.id]
        );
        const shareable = await query(
            `SELECT day, period FROM class_timetable_slots WHERE grade=? AND class_no IS NULL AND tag=? AND course_id IS NULL`,
            [data.grade, data.tag]
        );
        await createRelations(old.id, data, shareable);
        await tx('commit'); started = false;
        const rows = await query(`SELECT ${COURSE_COLUMNS} FROM courses WHERE id = ?`, [old.id]);
        return res.json({ result: 'SUCCESS', data: toDto(rows[0]) });
    } catch (e) { return sendError(res, e, started); }
};
exports.deleteCourse = async (req, res) => {
    let started = false;
    try {
        await tx('beginTransaction'); started = true;
        const course = await ownedCourse(req.validated.params.id, req.auth.studentId);
        await removeCourseRelations(course);
        await query('DELETE FROM courses WHERE id = ?', [course.id]);
        await tx('commit'); started = false;
        return res.json({ result: 'SUCCESS', data: { id: course.id } });
    } catch (e) { return sendError(res, e, started); }
};
