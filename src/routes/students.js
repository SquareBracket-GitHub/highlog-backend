const express = require("express");
const router = express.Router();
const studentController = require("../controllers/students");

// GET /students
router.get('/', studentController.getStudentsAll);

// GET /students/:id
router.get('/:id', studentController.getStudentByID);

// POST /students
router.post('/', studentController.createStudent);

// PUT /students/:id
router.put('/:id', studentController.updateStudent);

// DELETE /students/:id
router.delete('/:id', studentController.deleteStudent);

module.exports = router;