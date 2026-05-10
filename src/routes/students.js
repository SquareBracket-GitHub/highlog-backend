const express = require("express");
const router = express.Router();
const controller = require("../controllers/students");
const validate = require("../middlewares/validate");
const s = require("../schemas/students.schema");
const logger = require("../utils/logger");

logger.debug('validate is ' + typeof validate);
logger.debug('controller.getStudentsAll is ' + typeof controller.getStudentsAll);

// GET /students
router.get(
    '/',
    validate(),
    controller.getStudentsAll
);

// GET /students/:id
router.get(
    '/:id',
    validate(s.getStudentsByIDSchema, 'params'),
    controller.getStudentByID
);

// POST /students
router.post(
    '/',
    validate(s.createStudentSchema, 'body'),
    controller.createStudent
);

// PUT /students/:id
router.put(
    '/:id',
    validate(s.getStudentsByIDSchema, 'params'),
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