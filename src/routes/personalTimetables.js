const express = require("express");
const controller = require("../controllers/personalTimetables");
const validate = require("../middlewares/validate");
const { saveEntrySchema, slotParamsSchema } = require("../schemas/personalTimetables.schema");

const router = express.Router();

router.get("/me", controller.getMine);
router.put("/me", validate(saveEntrySchema, "body"), controller.save);
router.delete("/me/:day/:period", validate(slotParamsSchema, "params"), controller.remove);

module.exports = router;
