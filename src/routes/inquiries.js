const express = require('express');
const controller = require('../controllers/inquiries');
const validate = require('../middlewares/validate');
const requireAdmin = require('../middlewares/requireAdmin');
const s = require('../schemas/inquiries.schema');

const router = express.Router();
router.get('/mine', controller.mine);
router.post('/', validate(s.createSchema, 'body'), controller.create);
router.get('/admin', requireAdmin, controller.allForAdmin);
router.put('/admin/:id/response', requireAdmin, validate(s.idParamsSchema, 'params'), validate(s.responseSchema, 'body'), controller.respond);
module.exports = router;
