const db = require("../models/db");
const logger = require("../utils/logger");
const { hashPassword, verifyPassword } = require("../utils/password");
const { createToken } = require("../utils/token");

const publicStudent = ({ id, username, login_id, grade, class_no, school_number, can_manage_courses, is_admin }) => ({
    id,
    username,
    loginId: login_id,
    grade,
    classNo: class_no,
    schoolNumber: school_number,
    canManageCourses: Boolean(can_manage_courses),
    isAdmin: Boolean(is_admin)
});

exports.login = async (req, res) => {
    const { loginId, password } = req.validated.body;

    const query = `
        SELECT id, username, login_id, password, grade, class_no, school_number, can_manage_courses, is_admin
        FROM students
        WHERE login_id = ?
        LIMIT 1
    `;

    db.query(query, [loginId], async (err, results) => {
        if (err) {
            logger.error("Error logging in.\n" + err);
            return res.status(500).json({ result: "ERROR", error: "Login failed" });
        }

        try {
            const student = results[0];
            const valid = student ? await verifyPassword(password, student.password) : false;
            if (!valid) {
                return res.status(401).json({ result: "ERROR", error: "Invalid credentials" });
            }

            // 기존 평문 비밀번호는 로그인 성공 시 즉시 scrypt 해시로 교체한다.
            if (!student.password.startsWith("scrypt$")) {
                const upgraded = await hashPassword(password);
                db.query("UPDATE students SET password = ? WHERE id = ?", [upgraded, student.id], (updateErr) => {
                    if (updateErr) logger.error("Password hash upgrade failed.\n" + updateErr);
                });
            }

            return res.json({
                result: "SUCCESS",
                data: { student: publicStudent(student), token: createToken(student.id) }
            });
        } catch (authError) {
            logger.error("Error verifying credentials.\n" + authError);
            return res.status(500).json({ result: "ERROR", error: "Login failed" });
        }
    });
};
