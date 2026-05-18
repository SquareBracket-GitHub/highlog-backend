const express = require("express");
const router = express.Router();
const controller = require("../controllers/enrolments");
const s = require("../schemas/enrolments.schema");
const validate = require("../middlewares/validate");

// GET /enrolments
router.get(
    '/',
    validate(),
    controller.getEnrolmentsAll
);

// GET /enrolments/student/:student_id
router.get(
    '/student/:student_id',
    validate(s.studentIDSchema, "params"),
    controller.getEnrolmentsByStudent
);

// GET /enrolments/course/:course_id
router.get(
    '/course/:course_id',
    validate(s.courseIDSchema, "params"),
    controller.getEnrolmentsByCourse
);

// POST /enrolments
router.post(
    '/',
    validate(s.enrolmentSchema, "body"),
    controller.createEnrolment
);

// PUT /enrolments/student/:student_id/course/:course_id
router.put(
    '/student/:student_id/course/:course_id',
    validate(s.enrolmentSchema, "params"),
    validate(s.enrolmentSchema, "body"),
    controller.updateEnrolment
);

// DELETE /enrolments/student/:student_id
router.delete(
    '/student/:student_id',
    validate(s.studentIDSchema, "params"),
    controller.deleteEnrolmentByStudent
);

// DELETE /enrolments/course/:course_id
router.delete(
    '/course/:course_id',
    validate(s.courseIDSchema, "params"),
    controller.deleteEnrolmentByCourse
);

// DELETE /enrolments/student/:student_id/course/:course_id
router.delete(
    '/student/:student_id/course/:course_id',
    validate(s.enrolmentSchema, "params"),
    controller.deleteEnrolment
);

module.exports = router;