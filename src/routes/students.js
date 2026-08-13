const express = require("express");
const router = express.Router();
const controller = require("../controllers/students");
const validate = require("../middlewares/validate");
const s = require("../schemas/students.schema");
const logger = require("../utils/logger");

logger.debug('validate is ' + typeof validate);
logger.debug('controller.listStudents is ' + typeof controller.listStudents);

// GET /students
router.get(
    '/',
    validate(),
    controller.listStudents
);

// GET /students/:id
router.get(
    '/:id',
    validate(s.studentIdParamsSchema, 'params'),
    controller.getStudentById
);

// PUT /students/:id
router.put(
    '/:id',
    validate(s.studentIdParamsSchema, 'params'),
    validate(s.updateStudentSchema, 'body'),
    controller.updateStudent
);

// DELETE /students/:id
router.delete(
    '/:id',
    validate(s.deleteStudentSchema, 'params'),
    controller.deleteStudent
);

module.exports = router;
