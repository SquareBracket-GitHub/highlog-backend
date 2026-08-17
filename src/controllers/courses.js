const db = require('../models/db');
const logger = require('../utils/logger');

const COURSE_COLUMNS = `
    id, title, tag, classroom, days, grade, class_no, day, period, color, is_class_wide
`;

const toCourseDto = ({
    id, title, tag, classroom, days, grade, class_no, day, period, color, is_class_wide
}) => ({
    id,
    title,
    tag,
    classroom,
    days: typeof days === 'string' ? JSON.parse(days) : days,
    grade,
    classNo: class_no,
    day,
    period,
    color,
    isClassWide: Boolean(is_class_wide)
});

exports.listCourses = (req, res) => {
    db.query(`SELECT ${COURSE_COLUMNS} FROM courses`, (err, results) => {
        if (err) {
            logger.error('Error fetching courses.\n' + err);
            return res.status(500).json({ result: 'ERROR', error: 'Error fetching courses' });
        }
        return res.json({ result: 'SUCCESS', data: results.map(toCourseDto) });
    });
};

exports.getCourseById = (req, res) => {
    db.query(
        `SELECT ${COURSE_COLUMNS} FROM courses WHERE id = ?`,
        [req.validated.params.id],
        (err, results) => {
            if (err) {
                logger.error('Error fetching course.\n' + err);
                return res.status(500).json({ result: 'ERROR', error: 'Error fetching course' });
            }
            return res.json({ result: 'SUCCESS', data: results[0] ? toCourseDto(results[0]) : null });
        }
    );
};

function rollbackWithError(res, err, status = 500, message = 'Error creating course') {
    db.rollback(() => {
        logger.error(message + '.\n' + err);
        res.status(status).json({ result: 'ERROR', error: message });
    });
}

exports.createCourse = (req, res) => {
    const { title, tag, classroom, grade, classNo, day, period, color, isClassWide } = req.validated.body;
    const normalizedTag = isClassWide ? null : tag;
    const days = [{ day, period }];

    db.beginTransaction((transactionErr) => {
        if (transactionErr) return rollbackWithError(res, transactionErr);

        const findSlot = `
            SELECT id, tag, course_id
            FROM class_timetable_slots
            WHERE grade = ? AND class_no = ? AND day = ? AND period = ?
            LIMIT 1
        `;
        db.query(findSlot, [grade, classNo, day, period], (slotErr, slots) => {
            if (slotErr) return rollbackWithError(res, slotErr);

            const existingSlot = slots[0];
            const canShareSelectableSlot = !isClassWide
                && existingSlot
                && existingSlot.course_id === null
                && existingSlot.tag === normalizedTag;
            if (existingSlot && !canShareSelectableSlot) {
                return rollbackWithError(res, 'Timetable slot already occupied', 409, '해당 요일과 교시는 이미 사용 중입니다');
            }

            const insertCourse = `
                INSERT INTO courses
                    (title, tag, classroom, days, grade, class_no, day, period, color, is_class_wide)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            db.query(
                insertCourse,
                [title, normalizedTag, classroom, JSON.stringify(days), grade, classNo, day, period, color, isClassWide],
                (courseErr, courseResult) => {
                    if (courseErr) return rollbackWithError(res, courseErr);
                    const courseId = courseResult.insertId;

                    const finish = () => db.commit((commitErr) => {
                        if (commitErr) return rollbackWithError(res, commitErr);
                        return res.status(201).json({
                            result: 'SUCCESS',
                            data: {
                                id: courseId, title, tag: normalizedTag, classroom, days,
                                grade, classNo, day, period, color, isClassWide
                            }
                        });
                    });

                    const enrolClass = () => {
                        if (!isClassWide) return finish();
                        const enrolQuery = `
                            INSERT IGNORE INTO enrolments (student_id, course_id, source)
                            SELECT id, ?, 'fixed' FROM students WHERE grade = ? AND class_no = ?
                        `;
                        db.query(enrolQuery, [courseId, grade, classNo], (enrolErr) => {
                            if (enrolErr) return rollbackWithError(res, enrolErr);
                            finish();
                        });
                    };

                    if (canShareSelectableSlot) return enrolClass();
                    const insertSlot = `
                        INSERT INTO class_timetable_slots
                            (grade, class_no, day, period, label, tag, course_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `;
                    db.query(
                        insertSlot,
                        [grade, classNo, day, period, title, normalizedTag, isClassWide ? courseId : null],
                        (insertSlotErr) => {
                            if (insertSlotErr) return rollbackWithError(res, insertSlotErr);
                            enrolClass();
                        }
                    );
                }
            );
        });
    });
};

exports.updateCourse = (_req, res) => res.status(501).json({
    result: 'ERROR', error: 'Course update is not supported yet'
});

exports.deleteCourse = (req, res) => {
    const { id } = req.validated.params;
    db.query('DELETE FROM courses WHERE id = ?', [id], (err) => {
        if (err) {
            logger.error('Error deleting course.\n' + err);
            return res.status(500).json({ result: 'ERROR', error: 'Error deleting course' });
        }
        return res.json({ result: 'SUCCESS', data: { id: Number(id) } });
    });
};
