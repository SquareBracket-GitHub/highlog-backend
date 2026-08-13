const express = require("express");
const router = express.Router();
const controller = require("../controllers/enrolments");
const s = require("../schemas/enrolments.schema");
const validate = require("../middlewares/validate");

// GET /enrolments
router.get(
    '/',
    validate(),
    controller.listEnrolments
);

// GET /enrolments/student/:studentId
router.get(
    '/student/:studentId',
    validate(s.studentIdParamsSchema, "params"),
    controller.getEnrolmentsByStudent
);

// GET /enrolments/course/:courseId
router.get(
    '/course/:courseId',
    validate(s.courseIdParamsSchema, "params"),
    controller.getEnrolmentsByCourse
);

// POST /enrolments
router.post(
    '/',
    validate(s.enrolmentSchema, "body"),
    controller.createEnrolment
);

// PUT /enrolments/student/:studentId/course/:courseId
router.put(
    '/student/:studentId/course/:courseId',
    validate(s.enrolmentSchema, "params"),
    validate(s.enrolmentSchema, "body"),
    controller.updateEnrolment
);

// DELETE /enrolments/student/:studentId
router.delete(
    '/student/:studentId',
    validate(s.studentIdParamsSchema, "params"),
    controller.deleteEnrolmentByStudent
);

// DELETE /enrolments/course/:courseId
router.delete(
    '/course/:courseId',
    validate(s.courseIdParamsSchema, "params"),
    controller.deleteEnrolmentByCourse
);

// DELETE /enrolments/student/:studentId/course/:courseId
router.delete(
    '/student/:studentId/course/:courseId',
    validate(s.enrolmentSchema, "params"),
    controller.deleteEnrolment
);

module.exports = router;
