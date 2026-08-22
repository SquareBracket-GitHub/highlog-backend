const db = require("../models/db");
const logger = require("../utils/logger");
const { hashPassword } = require("../utils/password");
const { createToken } = require("../utils/token");
const { REGISTRATION_TERMS_VERSION } = require('../constants/legal');

const PUBLIC_COLUMNS = "id, username, login_id, grade, class_no, school_number, can_manage_courses, is_admin";

const toStudentDto = ({ id, username, login_id, grade, class_no, school_number, can_manage_courses, is_admin }) => ({
    id,
    username,
    loginId: login_id,
    grade,
    classNo: class_no,
    schoolNumber: school_number,
    canManageCourses: Boolean(can_manage_courses),
    isAdmin: Boolean(is_admin)
});

exports.listStudents = (req, res) => {
    const query = `SELECT ${PUBLIC_COLUMNS} FROM students`;

    db.query(query, (err, results) => {
        if (err) {
            logger.error('Error fetching students.\n' + err);
            return res.status(500).send("Error fetching students");
        }

        res.json({
            result: "SUCCESS",
            data: results.map(toStudentDto)
        });
    });
}

exports.getStudentById = (req, res) => {
    const id = req.validated.params.id;
    const query = `
        SELECT target.${PUBLIC_COLUMNS.split(', ').join(', target.')}
        FROM students AS target
        JOIN students AS requester ON requester.id = ?
        WHERE target.id = ? AND (target.id = requester.id OR requester.is_admin = TRUE)
    `;

    db.query(query, [req.auth.studentId, id], (err, results) => {
        if (err) {
            logger.error('Error fetching student.\n' + err);
            return res.status(500).send("Error fetching student");
        }

        res.json({
            result: "SUCCESS",
            data: results[0] ? toStudentDto(results[0]) : null
        });
    });
}

exports.createStudent = async (req, res) => {
    const { username, loginId, password, grade, classNo, schoolNumber } = req.validated.body;
    const duplicateQuery = `
        SELECT login_id, grade, class_no, school_number
        FROM students
        WHERE login_id = ? OR (grade = ? AND class_no = ? AND school_number = ?)
    `;

    db.query(duplicateQuery, [loginId, grade, classNo, schoolNumber], async (duplicateErr, duplicateRows) => {
        if (duplicateErr) {
            logger.error('Error checking duplicate student.\n' + duplicateErr);
            return res.status(500).json({ result: "ERROR", error: "Error creating student" });
        }

        const duplicateLoginId = duplicateRows.some((student) => student.login_id === loginId);
        const duplicateStudentNumber = duplicateRows.some((student) =>
            student.grade === grade
            && student.class_no === classNo
            && student.school_number === schoolNumber
        );
        if (duplicateLoginId) {
            return res.status(409).json({
                result: "ERROR",
                code: "DUPLICATE_LOGIN_ID",
                error: "Login ID already exists"
            });
        }
        if (duplicateStudentNumber) {
            return res.status(409).json({
                result: "ERROR",
                code: "DUPLICATE_STUDENT_NUMBER",
                error: "Grade, class and school number already exist"
            });
        }

        let passwordHash;
        try {
            passwordHash = await hashPassword(password);
        } catch (err) {
            logger.error('Error hashing student password.\n' + err);
            return res.status(500).json({ result: "ERROR", error: "Error creating student" });
        }

        db.beginTransaction((transactionErr) => {
        if (transactionErr) {
            logger.error('Error starting student transaction.\n' + transactionErr);
            return res.status(500).json({ result: "ERROR", error: "Error creating student" });
        }

        const insertStudent = `
            INSERT INTO students
                (username, login_id, password, grade, class_no, school_number)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
            insertStudent,
            [username, loginId, passwordHash, grade, classNo, schoolNumber],
            (studentErr, results) => {
                if (studentErr) {
                    return db.rollback(() => {
                        logger.error('Error creating student.\n' + studentErr);
                        if (studentErr.code === "ER_DUP_ENTRY") {
                            const duplicateKey = studentErr.message.includes('uq_student_school_number')
                                ? 'DUPLICATE_STUDENT_NUMBER'
                                : 'DUPLICATE_LOGIN_ID';
                            return res.status(409).json({
                                result: "ERROR",
                                code: duplicateKey,
                                error: duplicateKey === 'DUPLICATE_LOGIN_ID'
                                    ? "Login ID already exists"
                                    : "Grade, class and school number already exist"
                            });
                        }
                        return res.status(500).json({ result: "ERROR", error: "Error creating student" });
                    });
                }

                const studentId = results.insertId;
                const enrolFixedCourses = `
                    INSERT IGNORE INTO enrolments (student_id, course_id, source)
                    SELECT ?, slots.course_id, 'fixed'
                    FROM class_timetable_slots AS slots
                    WHERE slots.grade = ?
                      AND slots.class_no = ?
                      AND slots.course_id IS NOT NULL
                    GROUP BY slots.course_id
                `;

                db.query(enrolFixedCourses, [studentId, grade, classNo], (enrolmentErr) => {
                    if (enrolmentErr) {
                        return db.rollback(() => {
                            logger.error('Error creating fixed enrolments.\n' + enrolmentErr);
                            res.status(500).json({ result: "ERROR", error: "Error creating student" });
                        });
                    }

                    const insertConsents = `
                        INSERT INTO terms_consents (student_id, consent_type, terms_version)
                        VALUES (?, 'service_terms', ?), (?, 'privacy_policy', ?),
                               (?, 'anonymous_board_notice', ?), (?, 'age_or_guardian', ?)
                    `;
                    const consentParams = [
                        studentId, REGISTRATION_TERMS_VERSION,
                        studentId, REGISTRATION_TERMS_VERSION,
                        studentId, REGISTRATION_TERMS_VERSION,
                        studentId, REGISTRATION_TERMS_VERSION
                    ];
                    db.query(insertConsents, consentParams, (consentErr) => {
                    if (consentErr) {
                        return db.rollback(() => {
                            logger.error('Error recording registration consents.\n' + consentErr);
                            res.status(500).json({ result: "ERROR", error: "Error creating student" });
                        });
                    }

                    db.commit((commitErr) => {
                        if (commitErr) {
                            return db.rollback(() => {
                                logger.error('Error committing student transaction.\n' + commitErr);
                                res.status(500).json({ result: "ERROR", error: "Error creating student" });
                            });
                        }

                        const student = {
                            id: studentId, username, loginId, grade, classNo, schoolNumber,
                            canManageCourses: false,
                            isAdmin: false
                        };
                        res.status(201).json({
                            result: "SUCCESS",
                            data: { student, token: createToken(student.id) }
                        });
                    });
                    });
                });
            }
        );
        });
    });
}

exports.updateStudent = (req, res) => {
    const id = req.validated.params.id;
    if (Number(req.auth.studentId) !== Number(id)) {
        return res.status(403).json({ result: "ERROR", error: "Cannot update another student" });
    }
    const { username, grade, classNo, schoolNumber } = req.validated.body;
    const query = "UPDATE students SET username = ?, grade = ?, class_no = ?, school_number = ? WHERE id = ?";
    
    db.query(query, [username, grade, classNo, schoolNumber, id], (err) => {
        if (err) {
            logger.error('Error updating student.\n' + err);
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    result: "ERROR",
                    code: "DUPLICATE_STUDENT_NUMBER",
                    error: "Grade, class and school number already exist"
                });
            }
            return res.status(500).send("Error updating student");
        }

        db.query(`SELECT ${PUBLIC_COLUMNS} FROM students WHERE id = ?`, [id], (selectErr, rows) => {
            if (selectErr) {
                logger.error('Error fetching updated student.\n' + selectErr);
                return res.status(500).json({ result: "ERROR", error: "Error updating student" });
            }

            res.json({
                result: "SUCCESS",
                data: toStudentDto(rows[0])
            });
        });
    });
}

exports.deleteStudent = (req, res) => {
    const id = req.validated.params.id;
    const query = `DELETE target FROM students AS target
        JOIN students AS requester ON requester.id = ?
        WHERE target.id = ? AND (target.id = requester.id OR requester.is_admin = TRUE)`;
    
    db.query(query, [req.auth.studentId, id], (err, result) => {
        if (err) {
            logger.error('Error deleting student.\n' + err);
            return res.status(500).send("Error deleting student");
        }

        if (!result.affectedRows) {
            return res.status(404).json({ result: "ERROR", error: "Student not found or forbidden" });
        }
        res.json({
            result: "SUCCESS",
            data: { id: Number(id) }
        });
    });
}
