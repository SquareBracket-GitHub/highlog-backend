const db = require('../models/db');
const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  db.query('SELECT is_admin FROM students WHERE id = ? LIMIT 1', [req.auth.studentId], (err, rows) => {
    if (err) {
      logger.error('Error checking administrator permission.\n' + err);
      return res.status(500).json({ result: 'ERROR', error: 'Could not verify administrator permission' });
    }
    if (!rows[0]?.is_admin) {
      return res.status(403).json({ result: 'ERROR', code: 'ADMIN_REQUIRED', error: 'Administrator permission required' });
    }
    next();
  });
};
