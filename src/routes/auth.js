const express = require("express");
const controller = require("../controllers/auth");
const validate = require("../middlewares/validate");
const { loginSchema } = require("../schemas/auth.schema");
const studentsController = require("../controllers/students");
const { createStudentSchema } = require("../schemas/students.schema");

const router = express.Router();

router.post("/login", validate(loginSchema, "body"), controller.login);
router.post("/register", validate(createStudentSchema, "body"), studentsController.createStudent);

module.exports = router;
