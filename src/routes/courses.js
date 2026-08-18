const express = require("express");
const router = express.Router();
const controller = require("../controllers/courses");
const s = require("../schemas/courses.schema");
const validate = require("../middlewares/validate");
const requireCourseManager = require('../middlewares/requireCourseManager');

// GET /courses
router.get(
    '/',
    validate(),
    controller.listCourses
);

router.get('/mine', requireCourseManager, controller.listMine);
router.post('/conflicts', requireCourseManager, validate(s.conflictCheckSchema, 'body'), controller.checkConflicts);

// GET /courses/:id
router.get(
    '/:id',
    validate(s.courseIdParamsSchema, "params"),
    controller.getCourseById
);

router.get('/:id/impact', requireCourseManager, validate(s.courseIdParamsSchema, 'params'), controller.getImpact);

// POST /courses
router.post(
    '/',
    requireCourseManager,
    validate(s.createCourseSchema, "body"),
    controller.createCourse
);

// PUT /courses
router.put(
    '/:id',
    requireCourseManager,
    validate(s.courseIdParamsSchema, "params"),
    validate(s.updateCourseSchema, "body"),
    controller.updateCourse
);

// DELETE /courses/:id
router.delete(
    '/:id',
    requireCourseManager,
    validate(s.deleteCourseSchema, "params"),
    controller.deleteCourse
);

module.exports = router;
