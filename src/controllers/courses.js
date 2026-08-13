const db = require("../models/db");
const logger = require("../utils/logger");

exports.listCourses = (req, res) => {
    const query = "SELECT * FROM courses";

    db.query(query, (err, results) => {
        if (err) {
            logger.error('Error fetching courses.\n' + err);
            return res.status(500).send("Error fetching courses");
        }

        res.json({
            result: "SUCCESS",
            data: results
        });
    });
}

exports.getCourseById = (req, res) => {
    const query = "SELECT * FROM courses WHERE id=?";
    const { id } = req.validated.params;

    db.query(query, [id], (err, results) => {
        if (err) {
            logger.error('Error fetching course.\n' + err);
            return res.status(500).send("Error fetching course");
        }

        res.json({
            result: "SUCCESS",
            data: results[0]
        });
    });
}

exports.createCourse = (req, res) => {
    const query = "INSERT INTO courses (title, tag, classroom, days) VALUES (?, ?, ?, ?)";
    const { title, tag, classroom, days } = req.validated.body;

    db.query(query, [title, tag, classroom, JSON.stringify(days)], (err, results) => {
        if (err) {
            logger.error('Error creating course.\n' + err);
            return res.status(500).send("Error creating course")
        }

        res.json({
            result: "SUCCESS",
            data: { id: results.insertId, title, tag, classroom, days }
        });
    });
}

exports.updateCourse = (req, res) => {
    const query = "UPDATE courses SET title = ?, tag = ?, classroom = ?, days = ? WHERE id=?";
    const { id } = req.validated.params;
    const { title, tag, classroom, days } = req.validated.body;

    db.query(query, [title, tag, classroom, JSON.stringify(days), id], (err, results) => {
        if (err) {
            logger.error('Error updating course.\n' + err);
            return res.status(500).send('Error updating course');
        }

        res.json({
            result: "SUCCESS",
            data: { id, title, tag, classroom, days }
        });
    });
}

exports.deleteCourse = (req, res) => {
    const query = "DELETE FROM courses WHERE id=?";
    const { id } = req.validated.params;

    db.query(query, [id], (err, results) => {
        if (err) {
            logger.error('Error deleting course.\n' + err);
            return res.status(500).send('Error deleting course.');
        }

        res.json({
            result: "SUCCESS",
            data: { id }
        });
    });
}
