const express = require('express');
const controller = require('../controllers/legal');
const validate = require('../middlewares/validate');
const { consentSchema } = require('../schemas/legal.schema');
const router = express.Router();
router.get('/consent-status', controller.status);
router.post('/consent', validate(consentSchema, 'body'), controller.accept);
module.exports = router;
