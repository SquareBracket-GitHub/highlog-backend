const db = require("../models/db");
const logger = require("../utils/logger");

exports.getCoursesAll = (req, res) => {
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

exports.getCourseByID = (req, res) => {
    const query = "SELECT * FROM courses WHERE idx=?";
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
    const query = "INSERT INTO courses (title, classroom, day) VALUES (?, ?, ?)";
    const { title, classroom, day } = req.validated.body;

    db.query(query, [title, classroom, JSON.stringify(day)], (err, results) => {
        if (err) {
            logger.error('Error creating course.\n' + err);
            return res.status(500).send("Error creating course")
        }

        res.json({
            result: "SUCCESS",
            data: { id: results.insertId, title, classroom, day }
        });
    });
}

exports.updateCourse = (req, res) => {
    const query = "UPDATE courses SET (title, classroom, day) VALUES (?, ?, ?) WHERE idx=?";
    const { id } = req.validated.params;
    const { title, classroom, day } = req.validated.body;

    db.query(query, [title, classroom, JSON.stringify(day), id], (err, results) => {
        if (err) {
            logger.error('Error updating course.\n' + err);
            return res.status(500).send('Error updating course');
        }

        res.json({
            result: "SUCCESS",
            data: { id, title, classroom, day }
        });
    });
}

exports.deleteCourse = (req, res) => {
    const query = "DELETE FROM courses WHERE idx=?";
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