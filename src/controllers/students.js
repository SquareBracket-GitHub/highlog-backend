const db = require("../models/db");
const logger = require("../utils/logger");

exports.getStudentsAll = (req, res) => {
    const query = "SELECT * FROM students";

    db.query(query, (err, results) => {
        if (err) {
            logger.error('Error fetching students.\n' + err);
            return res.status(500).send("Error fetching students");
        }

        res.json({
            result: "SUCCESS",
            data: results
        });
    });
}

exports.getStudentByID = (req, res) => {
    const id = req.validated.params.id;
    const query = "SELECT * FROM students WHERE id = ?";

    db.query(query, [id], (err, results) => {
        if (err) {
            logger.error('Error fetching student.\n' + err);
            return res.status(500).send("Error fetching student");
        }

        res.json({
            result: "SUCCESS",
            data: results[0]
        });
    });
}

exports.createStudent = (req, res) => {
    const { username, login_id, password, grade, class_no, school_number } = req.validated.body;
    const query = "INSERT INTO students (username, login_id, password, grade, class_no, school_number) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(query, [username, login_id, password, grade, class_no, school_number], (err, results) => {
        if (err) {
            logger.error('Error creating sutdent.\n' + err)
            return res.status(500).send("Error creating student");
        }

        res.json({
            result: "SUCCESS",
            data: { id: results.insertId, username, login_id, grade, class_no, school_number }
        });
    });
}

exports.updateStudent = (req, res) => {
    const id = req.validated.params.id;
    const { username, login_id, password, grade, class_no, school_number } = req.validated.body;

    const updates = [
        'username = ?',
        'grade = ?',
        'class_no = ?',
        'school_number = ?'
    ];
    const values = [username, grade, class_no, school_number];

    if (login_id !== undefined) {
        updates.push('login_id = ?');
        values.push(login_id);
    }

    if (password !== undefined) {
        updates.push('password = ?');
        values.push(password);
    }

    const query = `UPDATE students SET ${updates.join(', ')} WHERE id = ?`;
    values.push(id);
    
    db.query(query, values, (err) => {
        if (err) {
            logger.error('Error updating student.\n' + err);
            return res.status(500).send("Error updating student");
        }

        res.json({
            result: "SUCCESS",
            data: { id, username, login_id, grade, class_no, school_number }
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
            data: { id }
        });
    });
}