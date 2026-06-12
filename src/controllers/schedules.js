const db = require("../models/db");
const logger = require("../utils/logger");

exports.getSchedulesAll = (req, res) => {
    const query = "SELECT * FROM schedules";

    db.query(query, (err, results) => {
        if (err) {
            logger.error('Error fetching schedules.\n' + err);
            return res.status(500).send("Error fetching schedules");
        }

        res.json({
            result: "SUCCESS",
            data: results
        });
    });
}

exports.getScheduleByID = (req, res) => {
    const { id } = req.validated.params;
    const query = "SELECT * FROM schedules WHERE id=?";

    db.query(query, [id], (err, results) => {
        if (err) {
            logger.error('Error fetching schedule.\n' + err);
            return res.status(500).send("Error fetching schedule");
        }

        res.json({
            result: "SUCCESS",
            data: results
        });
    });
}

exports.getScheduleByCourse = (req, res) => {
    const { course_id } = req.validated.params;
    const query = "SELECT * FROM schedules WHERE course_id=?";

    db.query(query, [course_id], (err, results) => {
        if (err) {
            logger.error('Error fetching schedule.\n' + err);
            return res.status(500).send("Error fetching schedule");
        }

        res.json({
            result: "SUCCESS",
            data: results
        });
    });
}

exports.createSchedule = (req, res) => {
    const { course_id, title, schedule_content, day_info } = req.validated.body;
    const query = "INSERT INTO schedules (course_id, title, schedule_content, day_info) VALUES (?, ?, ?, ?)";

    db.query(query, [course_id, title, schedule_content, day_info], (err, results) => {
        if (err) {
            logger.error('Error creating schedule.\n' + err);
            return res.status(500).send("Error creating schedule");
        }

        res.json({
            result: "SUCCESS",
            data: { student_id, course_id }
        });
    });
}

exports.updateSchedule = (req, res) => {
    const { course_id } = req.validated.params;
    const { student_id: n_student_id, course_id: n_course_id } = req.validated.body;
    const query = "UPDATE schedules SET student_id = ?, course_id = ? WHERE student_id=? AND course_id=?";

    db.query(query, [n_student_id, n_course_id, student_id, course_id], (err, results) => {
        if (err) {
            logger.error('Error creating schedule.\n' + err);
            return res.status(500).send("Error creating schedule");
        }

        res.json({
            result: "SUCCESS",
            data: { n_student_id, n_course_id }
        });
    });
}

/* exports.updateScheduleByStudent = (req, res) => {
    const { student_id } = req.validated.params;
    const { course_id } = req.validated.body;
    const query = "UPDATE schedule SET course_id = ? WHERE student_id=?";

    db.query(query, [course_id, student_id], (err, results) => {
        if (err) {
            logger.error('Error updating schedule.\n' + err);
            return res.status(500).send("Error updating schedule");
        }

        res.json({
            result: "SUCCESS",
            data: { student_id, course_id }
        });
    });
}

exports.updateScheduleByCourse = (req, res) => {
    const { course_id } = req.validated.params;
    const { student_id } = req.validated.body;
    const query = "UPDATE schedule SET student_id = ? WHERE course_id=?";

    db.query(query, [student_id, course_id], (err, results) => {
        if (err) {
            logger.error('Error updating schedule.\n' + err);
            return res.status(500).send("Error updating schedule");
        }

        res.json({
            result: "SUCCESS",
            data: { student_id, course_id }
        });
    });
} **/

exports.deleteScheduleByStudent = (req, res) => {
    const { student_id } = req.validated.params;
    const query = "DELETE FROM schedules WHERE student_id=?";

    db.query(query, [student_id], (err, results) => {
        if (err) {
            logger.error('Error deleting schedule.\n' + err);
            return res.status(500).send("Error deleting schedule");
        }

        res.json({
            result: "SUCCESS",
            data: { student_id }
        });
    });
}

exports.deleteScheduleByCourse = (req, res) => {
    const { course_id } = req.validated.params;
    const query = "DELETE FROM schedules WHERE course_id=?";

    db.query(query, [course_id], (err, results) => {
        if (err) {
            logger.error('Error deleting schedule.\n' + err);
            return res.status(500).send("Error deleting schedule");
        }

        res.json({
            result: "SUCCESS",
            data: { course_id }
        });
    });
}

exports.deleteSchedule = (req, res) => {
    const { student_id, course_id } = req.validated.params;
    const query = "DELETE FROM schedules WHERE student_id=? AND course_id=?";

    db.query(query, [student_id, course_id], (err, result) => {
        if (err) {
            logger.error('Error deleting schedule.\n' + err);
            return res.status(500).send("Error deleting schedule");
        }

        res.json({
            result: "SUCCESS",
            data: { student_id, course_id }
        });
    });
}