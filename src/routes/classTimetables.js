const express = require("express");
const controller = require("../controllers/classTimetables");

const router = express.Router();

router.get("/me", controller.getMine);

module.exports = router;
