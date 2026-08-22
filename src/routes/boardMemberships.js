const express = require('express');
const controller = require('../controllers/boardMemberships');
const validate = require('../middlewares/validate');
const requireAdmin = require('../middlewares/requireAdmin');
const requireBoardConsent = require('../middlewares/requireBoardConsent');
const s = require('../schemas/boardMemberships.schema');

const router = express.Router();
router.get('/status', controller.status);
router.post('/request', requireBoardConsent, controller.request);
router.get('/admin/requests', requireAdmin, controller.pending);
router.put('/admin/requests/:studentId', requireAdmin, validate(s.studentParamsSchema, 'params'), validate(s.reviewSchema, 'body'), controller.review);
module.exports = router;
