const express = require("express");
const router = express.Router();
const controller = require("../controllers/courses");
const s = require("../schemas/courses.schema");
const validate = require("../middlewares/validate");

// GET /courses
router.get(
    '/',
    validate(),
    controller.listCourses
);

// GET /courses/:id
router.get(
    '/:id',
    validate(s.courseIdParamsSchema, "params"),
    controller.getCourseById
);

// POST /courses
router.post(
    '/',
    validate(s.createCourseSchema, "body"),
    controller.createCourse
);

// PUT /courses
router.put(
    '/:id',
    validate(s.courseIdParamsSchema, "params"),
    validate(s.createCourseSchema, "body"),
    controller.updateCourse
);

// DELETE /courses/:id
router.delete(
    '/:id',
    validate(s.deleteCourseSchema, "params"),
    controller.deleteCourse
);

module.exports = router;
