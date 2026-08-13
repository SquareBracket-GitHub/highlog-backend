const db = require("../models/db");
const logger = require("../utils/logger");
const { hashPassword } = require("../utils/password");
const { createToken } = require("../utils/token");

const PUBLIC_COLUMNS = "id, username, login_id, grade, class_no, school_number";

const toStudentDto = ({ id, username, login_id, grade, class_no, school_number }) => ({
    id,
    username,
    loginId: login_id,
    grade,
    classNo: class_no,
    schoolNumber: school_number
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
    const query = `SELECT ${PUBLIC_COLUMNS} FROM students WHERE id = ?`;

    db.query(query, [id], (err, results) => {
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
    const passwordHash = await hashPassword(password);
    const query = "INSERT INTO students (username, login_id, password, grade, class_no, school_number) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(query, [username, loginId, passwordHash, grade, classNo, schoolNumber], (err, results) => {
        if (err) {
            logger.error('Error creating student.\n' + err)
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ result: "ERROR", error: "Login ID already exists" });
            }
            return res.status(500).json({ result: "ERROR", error: "Error creating student" });
        }

        const student = { id: results.insertId, username, loginId, grade, classNo, schoolNumber };
        res.status(201).json({
            result: "SUCCESS",
            data: { student, token: createToken(student.id) }
        });
    });
}

exports.updateStudent = (req, res) => {
    const id = req.validated.params.id;
    const { username, grade, classNo, schoolNumber } = req.validated.body;
    const query = "UPDATE students SET username = ?, grade = ?, class_no = ?, school_number = ? WHERE id = ?";
    
    db.query(query, [username, grade, classNo, schoolNumber, id], (err) => {
        if (err) {
            logger.error('Error updating student.\n' + err);
            return res.status(500).send("Error updating student");
        }

        res.json({
            result: "SUCCESS",
            data: { id: Number(id), username, grade, classNo, schoolNumber }
        });
    });
}

exports.deleteStudent = (req, res) => {
    const id = req.validated.params.id;
    const query = "DELETE FROM students WHERE id = ?";
    
    db.query(query, [id], (err) => {
        if (err) {
            logger.error('Error deleting student.\n' + err);
            return res.status(500).send("Error deleting student");
        }

        res.json({
            result: "SUCCESS",
            data: { id: Number(id) }
        });
    });
}
