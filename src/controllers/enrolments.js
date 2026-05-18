const db = require("../models/db");
const logger = require("../utils/logger");

exports.getEnrolmentsAll = (req, res) => {
    const query = "SELECT * FROM enrolments";

    db.query(query, (err, results) => {
        if (err) {
            logger.error('Error fetching enrolments.\n' + err);
            return res.status(500).send("Error fetching enrolments");
        }

        res.json({
            result: "SUCCESS",
            data: results
        });
    });
}

exports.getEnrolmentsByStudent = (req, res) => {
    const { student_id } = req.validated.params;
    const query = "SELECT * FROM enrolments WHERE student_id=?";

    db.query(query, [student_id], (err, results) => {
        if (err) {
            logger.error('Error fetching enrolment.\n' + err);
            return res.status(500).send("Error fetching enrolment");
        }

        res.json({
            result: "SUCCESS",
            data: results
        });
    });
}

exports.getEnrolmentsByCourse = (req, res) => {
    const { course_id } = req.validated.params;
    const query = "SELECT * FROM enrolments WHERE course_id=?";

    db.query(query, [course_id], (err, results) => {
        if (err) {
            logger.error('Error fetching enrolment.\n' + err);
            return res.status(500).send("Error fetching enrolment");
        }

        res.json({
            result: "SUCCESS",
            data: results
        });
    });
}

exports.createEnrolment = (req, res) => {
    const { student_id, course_id } = req.validated.body;
    const query = "INSERT INTO enrolments (student_id, course_id) VALUES (?, ?)";

    db.query(query, [student_id, course_id], (err, results) => {
        if (err) {
            logger.error('Error creating enrolment.\n' + err);
            return res.status(500).send("Error creating enrolment");
        }

        res.json({
            result: "SUCCESS",
            data: { student_id, course_id }
        });
    });
}

exports.updateEnrolment = (req, res) => {
    const { student_id, course_id } = req.validated.params;
    const { student_id: n_student_id, course_id: n_course_id } = req.validated.body;
    const query = "UPDATE enrolments SET student_id = ?, course_id = ? WHERE student_id=? AND course_id=?";

    db.query(query, [n_student_id, n_course_id, student_id, course_id], (err, results) => {
        if (err) {
            logger.error('Error creating enrolment.\n' + err);
            return res.status(500).send("Error creating enrolment");
        }

        res.json({
            result: "SUCCESS",
            data: { n_student_id, n_course_id }
        });
    });
}

/* exports.updateEnrolmentByStudent = (req, res) => {
    const { student_id } = req.validated.params;
    const { course_id } = req.validated.body;
    const query = "UPDATE enrolment SET course_id = ? WHERE student_id=?";

    db.query(query, [course_id, student_id], (err, results) => {
        if (err) {
            logger.error('Error updating enrolment.\n' + err);
            return res.status(500).send("Error updating enrolment");
        }

        res.json({
            result: "SUCCESS",
            data: { student_id, course_id }
        });
    });
}

exports.updateEnrolmentByCourse = (req, res) => {
    const { course_id } = req.validated.params;
    const { student_id } = req.validated.body;
    const query = "UPDATE enrolment SET student_id = ? WHERE course_id=?";

    db.query(query, [student_id, course_id], (err, results) => {
        if (err) {
            logger.error('Error updating enrolment.\n' + err);
            return res.status(500).send("Error updating enrolment");
        }

        res.json({
            result: "SUCCESS",
            data: { student_id, course_id }
        });
    });
} **/

exports.deleteEnrolmentByStudent = (req, res) => {
    const { student_id } = req.validated.params;
    const query = "DELETE FROM enrolments WHERE student_id=?";

    db.query(query, [student_id], (err, results) => {
        if (err) {
            logger.error('Error deleting enrolment.\n' + err);
            return res.status(500).send("Error deleting enrolment");
        }

        res.json({
            result: "SUCCESS",
            data: { student_id }
        });
    });
}

exports.deleteEnrolmentByCourse = (req, res) => {
    const { course_id } = req.validated.params;
    const query = "DELETE FROM enrolments WHERE course_id=?";

    db.query(query, [course_id], (err, results) => {
        if (err) {
            logger.error('Error deleting enrolment.\n' + err);
            return res.status(500).send("Error deleting enrolment");
        }

        res.json({
            result: "SUCCESS",
            data: { course_id }
        });
    });
}

exports.deleteEnrolment = (req, res) => {
    const { student_id, course_id } = req.validated.params;
    const query = "DELETE FROM enrolments WHERE student_id=? AND course_id=?";

    db.query(query, [student_id, course_id], (err, result) => {
        if (err) {
            logger.error('Error deleting enrolment.\n' + err);
            return res.status(500).send("Error deleting enrolment");
        }

        res.json({
            result: "SUCCESS",
            data: { student_id, course_id }
        });
    });
}