const db = require('../models/db');
const logger = require('../utils/logger');
const { REGISTRATION_TERMS_VERSION, REQUIRED_CONSENT_TYPES } = require('../constants/legal');

exports.status = (req, res) => {
  db.query(`SELECT COUNT(DISTINCT consent_type) AS consent_count FROM terms_consents
    WHERE student_id = ? AND terms_version = ? AND consent_type IN (?, ?, ?, ?)`,
    [req.auth.studentId, REGISTRATION_TERMS_VERSION, ...REQUIRED_CONSENT_TYPES], (err, rows) => {
      if (err) { logger.error('Error reading consent status.\n' + err); return res.status(500).json({ result: 'ERROR', error: '동의 상태를 확인하지 못했습니다.' }); }
      return res.json({ result: 'SUCCESS', data: { agreed: Number(rows[0]?.consent_count) === REQUIRED_CONSENT_TYPES.length, version: REGISTRATION_TERMS_VERSION } });
    });
};

exports.accept = (req, res) => {
  const values = REQUIRED_CONSENT_TYPES.map(() => '(?, ?, ?)').join(', ');
  const params = REQUIRED_CONSENT_TYPES.flatMap((type) => [req.auth.studentId, type, REGISTRATION_TERMS_VERSION]);
  db.query(`INSERT IGNORE INTO terms_consents (student_id, consent_type, terms_version) VALUES ${values}`, params, (err) => {
    if (err) { logger.error('Error recording board consent.\n' + err); return res.status(500).json({ result: 'ERROR', error: '동의를 저장하지 못했습니다.' }); }
    return res.json({ result: 'SUCCESS', data: { agreed: true, version: REGISTRATION_TERMS_VERSION } });
  });
};
