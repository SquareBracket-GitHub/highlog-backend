const db = require('../models/db');
const logger = require('../utils/logger');
const { REGISTRATION_TERMS_VERSION, REQUIRED_CONSENT_TYPES } = require('../constants/legal');

module.exports = (req, res, next) => {
  db.query(`SELECT COUNT(DISTINCT consent_type) AS consent_count FROM terms_consents
    WHERE student_id = ? AND terms_version = ? AND consent_type IN (?, ?, ?, ?)`,
    [req.auth.studentId, REGISTRATION_TERMS_VERSION, ...REQUIRED_CONSENT_TYPES], (err, rows) => {
      if (err) {
        logger.error('Error checking board consent.\n' + err);
        return res.status(500).json({ result: 'ERROR', error: 'Could not verify board consent' });
      }
      if (Number(rows[0]?.consent_count) !== REQUIRED_CONSENT_TYPES.length) {
        return res.status(428).json({ result: 'ERROR', code: 'BOARD_CONSENT_REQUIRED', error: '게시판 이용 동의가 필요합니다.' });
      }
      next();
    });
};
