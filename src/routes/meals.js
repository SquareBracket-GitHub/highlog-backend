const express = require('express');
const controller = require('../controllers/meals');
const validate = require('../middlewares/validate');
const { mealsQuerySchema } = require('../schemas/meals.schema');

const router = express.Router();
router.get('/', validate(mealsQuerySchema, 'query'), controller.getByDate);
module.exports = router;
