const db = require("../models/db");
const logger = require("../utils/logger");

function ownsStudent(req, studentId) {
    return Number(req.auth.studentId) === Number(studentId);
}

function forbidden(res) {
    return res.status(403).json({ result: "ERROR", error: "Cannot modify another student's enrolments" });
}

const toEnrolmentDto = ({ student_id, course_id, tag, source }) => ({
    studentId: student_id,
    courseId: course_id,
    source,
    ...(tag === undefined ? {} : { tag })
});

exports.listEnrolments = (req, res) => {
    const query = "SELECT * FROM enrolments";

    db.query(query, (err, results) => {
        if (err) {
            logger.error('Error fetching enrolments.\n' + err);
            return res.status(500).send("Error fetching enrolments");
        }

        res.json({
            result: "SUCCESS",
            data: results.map(toEnrolmentDto)
        });
    });
}

exports.getEnrolmentsByStudent = (req, res) => {
    const { studentId } = req.validated.params;
    if (!ownsStudent(req, studentId)) return forbidden(res);
    const query = "SELECT * FROM enrolments WHERE student_id=?";

    db.query(query, [studentId], (err, results) => {
        if (err) {
            logger.error('Error fetching enrolment.\n' + err);
            return res.status(500).send("Error fetching enrolment");
        }

        res.json({
            result: "SUCCESS",
            data: results.map(toEnrolmentDto)
        });
    });
}

exports.getEnrolmentsByCourse = (req, res) => {
    const { courseId } = req.validated.params;
    const query = "SELECT * FROM enrolments WHERE course_id=?";

    db.query(query, [courseId], (err, results) => {
        if (err) {
            logger.error('Error fetching enrolment.\n' + err);
            return res.status(500).send("Error fetching enrolment");
        }

        res.json({
            result: "SUCCESS",
            data: results.map(toEnrolmentDto)
        });
    });
}

exports.createEnrolment = (req, res) => {
    const { studentId, courseId } = req.validated.body;
    if (!ownsStudent(req, studentId)) return forbidden(res);

    db.beginTransaction((transactionErr) => {
        if (transactionErr) {
            logger.error('Error starting enrolment transaction.\n' + transactionErr);
            return res.status(500).json({ result: "ERROR", error: "Error creating enrolment" });
        }

        db.query("SELECT tag FROM courses WHERE id = ? FOR UPDATE", [courseId], (courseErr, courses) => {
            if (courseErr || courses.length === 0) {
                return db.rollback(() => {
                    if (courseErr) logger.error('Error fetching course tag.\n' + courseErr);
                    res.status(courseErr ? 500 : 404).json({
                        result: "ERROR",
                        error: courseErr ? "Error creating enrolment" : "Course not found"
                    });
                });
            }

            const tag = courses[0].tag;
            const deleteSameTag = `
                DELETE enrolments
                FROM enrolments
                JOIN courses ON courses.id = enrolments.course_id
                WHERE enrolments.student_id = ?
                  AND courses.tag = ?
                  AND enrolments.source = 'selected'
            `;

            db.query(deleteSameTag, [studentId, tag], (deleteErr) => {
                if (deleteErr) {
                    return db.rollback(() => {
                        logger.error('Error replacing same-tag enrolment.\n' + deleteErr);
                        res.status(500).json({ result: "ERROR", error: "Error creating enrolment" });
                    });
                }

                db.query(
                    "INSERT INTO enrolments (student_id, course_id, source) VALUES (?, ?, 'selected')",
                    [studentId, courseId],
                    (insertErr) => {
                        if (insertErr) {
                            return db.rollback(() => {
                                logger.error('Error creating enrolment.\n' + insertErr);
                                res.status(500).json({ result: "ERROR", error: "Error creating enrolment" });
                            });
                        }

                        db.commit((commitErr) => {
                            if (commitErr) {
                                return db.rollback(() => {
                                    logger.error('Error committing enrolment.\n' + commitErr);
                                    res.status(500).json({ result: "ERROR", error: "Error creating enrolment" });
                                });
                            }

                            res.status(201).json({ result: "SUCCESS", data: { studentId, courseId, tag } });
                        });
                    }
                );
            });
        });
    });
}

exports.updateEnrolment = (req, res) => {
    const { studentId, courseId } = req.validated.params;
    const { studentId: newStudentId, courseId: newCourseId } = req.validated.body;
    if (!ownsStudent(req, studentId) || !ownsStudent(req, newStudentId)) return forbidden(res);
    const query = `
        UPDATE enrolments
        SET student_id = ?, course_id = ?
        WHERE student_id = ? AND course_id = ? AND source = 'selected'
    `;

    db.query(query, [newStudentId, newCourseId, studentId, courseId], (err) => {
        if (err) {
            logger.error('Error creating enrolment.\n' + err);
            return res.status(500).send("Error creating enrolment");
        }

        res.json({
            result: "SUCCESS",
            data: { studentId: newStudentId, courseId: newCourseId }
        });
    });
}

exports.deleteEnrolmentByStudent = (req, res) => {
    const { studentId } = req.validated.params;
    if (!ownsStudent(req, studentId)) return forbidden(res);
    const query = "DELETE FROM enrolments WHERE student_id=? AND source='selected'";

    db.query(query, [studentId], (err) => {
        if (err) {
            logger.error('Error deleting enrolment.\n' + err);
            return res.status(500).send("Error deleting enrolment");
        }

        res.json({
            result: "SUCCESS",
            data: { studentId }
        });
    });
}

exports.deleteEnrolmentByCourse = (req, res) => {
    const { courseId } = req.validated.params;
    const query = "DELETE FROM enrolments WHERE course_id=? AND source='selected'";

    db.query(query, [courseId], (err) => {
        if (err) {
            logger.error('Error deleting enrolment.\n' + err);
            return res.status(500).send("Error deleting enrolment");
        }

        res.json({
            result: "SUCCESS",
            data: { courseId }
        });
    });
}

exports.deleteEnrolment = (req, res) => {
    const { studentId, courseId } = req.validated.params;
    if (!ownsStudent(req, studentId)) return forbidden(res);
    const query = "DELETE FROM enrolments WHERE student_id=? AND course_id=? AND source='selected'";

    db.query(query, [studentId, courseId], (err) => {
        if (err) {
            logger.error('Error deleting enrolment.\n' + err);
            return res.status(500).send("Error deleting enrolment");
        }

        res.json({
            result: "SUCCESS",
            data: { studentId, courseId }
        });
    });
}
