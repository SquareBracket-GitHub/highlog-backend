const express = require('express');
const controller = require('../controllers/board');
const validate = require('../middlewares/validate');
const requireAdmin = require('../middlewares/requireAdmin');
const requireBoardConsent = require('../middlewares/requireBoardConsent');
const requireBoardMembership = require('../middlewares/requireBoardMembership');
const s = require('../schemas/board.schema');

const router = express.Router();
router.get('/', validate(s.listQuerySchema, 'query'), controller.list);
router.post('/', requireBoardConsent, requireBoardMembership, validate(s.postBodySchema, 'body'), controller.create);
router.post('/admin/posts/:id/author', requireAdmin, validate(s.idParamsSchema, 'params'), validate(s.moderationBodySchema, 'body'), controller.getAuthorForAdmin);
router.delete('/admin/posts/:id', requireAdmin, validate(s.idParamsSchema, 'params'), validate(s.moderationBodySchema, 'body'), controller.removeForAdmin);
router.delete('/comments/:commentId', validate(s.commentIdParamsSchema, 'params'), controller.removeCommentMine);
router.get('/:id', validate(s.idParamsSchema, 'params'), controller.get);
router.put('/:id', requireBoardConsent, requireBoardMembership, validate(s.idParamsSchema, 'params'), validate(s.postBodySchema, 'body'), controller.update);
router.delete('/:id', validate(s.idParamsSchema, 'params'), controller.removeMine);
router.post('/:id/comments', requireBoardConsent, requireBoardMembership, validate(s.idParamsSchema, 'params'), validate(s.commentBodySchema, 'body'), controller.createComment);

module.exports = router;
