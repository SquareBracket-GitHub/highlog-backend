const express = require("express");
const router = express.Router();
const studentController = require("../controllers/students");
const validate = require("../middlewares/validate");
const s = require("../schemas/students.schema");

// GET /students
router.get(
    '/',
    validate(),
    studentController.getStudentsAll
);

// GET /students/:id
router.get(
    '/:id',
    validate(s.getStudentsByIDSchema, 'params'),
    studentController.getStudentByID
);

// POST /students
router.post(
    '/',
    validate(s.createStudentSchema, 'body'),
    studentController.createStudent
);

// PUT /students/:id
router.put(
    '/:id',
    validate(s.getStudentsByIDSchema, 'params'),
    validate(s.updateStudentSchema, 'body'),
    studentController.updateStudent
);

// DELETE /students/:id
router.delete(
    '/:id',
    validate(s.deleteStudentSchema, 'params'),
    studentController.deleteStudent);

module.exports = router;