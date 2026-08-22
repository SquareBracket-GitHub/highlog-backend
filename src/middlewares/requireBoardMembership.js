const db = require('../models/db');
const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  db.query('SELECT status FROM board_memberships WHERE student_id = ? LIMIT 1', [req.auth.studentId], (err, rows) => {
    if (err) {
      logger.error('Error checking board membership.\n' + err);
      return res.status(500).json({ result: 'ERROR', error: 'Could not verify board membership' });
    }
    if (rows[0]?.status !== 'approved') {
      return res.status(403).json({ result: 'ERROR', code: 'BOARD_APPROVAL_REQUIRED', error: '게시판 이용 승인이 필요합니다.' });
    }
    next();
  });
};
