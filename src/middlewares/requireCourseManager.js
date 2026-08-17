const db = require('../models/db');
const logger = require('../utils/logger');

function requireCourseManager(req, res, next) {
    db.query(
        'SELECT can_manage_courses FROM students WHERE id = ? LIMIT 1',
        [req.auth.studentId],
        (err, rows) => {
            if (err) {
                logger.error('Error checking course manager permission.\n' + err);
                return res.status(500).json({ result: 'ERROR', error: 'Permission check failed' });
            }
            if (!rows[0]?.can_manage_courses) {
                return res.status(403).json({ result: 'ERROR', error: 'Course manager permission required' });
            }
            next();
        }
    );
}

module.exports = requireCourseManager;
