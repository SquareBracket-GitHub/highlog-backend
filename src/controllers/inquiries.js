const db = require('../models/db');
const logger = require('../utils/logger');
const database = db.promise();

const inquiryDto = (row, includeStudent = false) => ({
  id: row.id,
  title: row.title,
  content: row.content,
  status: row.status,
  adminResponse: row.admin_response,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  respondedAt: row.responded_at,
  ...(includeStudent ? { student: { id: row.student_id, username: row.username, grade: row.grade, classNo: row.class_no, schoolNumber: row.school_number } } : {}),
});

exports.mine = async (req, res) => {
  try {
    const [rows] = await database.query(`SELECT id, title, content, status, admin_response, created_at, updated_at, responded_at
      FROM inquiries WHERE student_id = ? ORDER BY created_at DESC`, [req.auth.studentId]);
    return res.json({ result: 'SUCCESS', data: rows.map((row) => inquiryDto(row)) });
  } catch (error) {
    logger.error('Error listing inquiries.\n' + error);
    return res.status(500).json({ result: 'ERROR', error: '문의를 불러오지 못했습니다.' });
  }
};

exports.create = async (req, res) => {
  try {
    const [result] = await database.query('INSERT INTO inquiries (student_id, title, content) VALUES (?, ?, ?)', [req.auth.studentId, req.validated.body.title, req.validated.body.content]);
    return res.status(201).json({ result: 'SUCCESS', data: { id: result.insertId } });
  } catch (error) {
    logger.error('Error creating inquiry.\n' + error);
    return res.status(500).json({ result: 'ERROR', error: '문의를 등록하지 못했습니다.' });
  }
};

exports.allForAdmin = async (req, res) => {
  try {
    const [rows] = await database.query(`SELECT i.id, i.student_id, i.title, i.content, i.status, i.admin_response, i.created_at, i.updated_at, i.responded_at,
      s.username, s.grade, s.class_no, s.school_number FROM inquiries i JOIN students s ON s.id = i.student_id
      ORDER BY FIELD(i.status, 'open', 'answered', 'closed'), i.created_at ASC`);
    return res.json({ result: 'SUCCESS', data: rows.map((row) => inquiryDto(row, true)) });
  } catch (error) {
    logger.error('Error listing administrator inquiries.\n' + error);
    return res.status(500).json({ result: 'ERROR', error: '문의 목록을 불러오지 못했습니다.' });
  }
};

exports.respond = async (req, res) => {
  try {
    const status = req.validated.body.close ? 'closed' : 'answered';
    const [result] = await database.query(`UPDATE inquiries SET admin_response = ?, status = ?, responded_by_admin_id = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [req.validated.body.response, status, req.auth.studentId, req.validated.params.id]);
    if (!result.affectedRows) return res.status(404).json({ result: 'ERROR', code: 'INQUIRY_NOT_FOUND', error: '문의가 없습니다.' });
    return res.json({ result: 'SUCCESS', data: { id: req.validated.params.id, status } });
  } catch (error) {
    logger.error('Error responding to inquiry.\n' + error);
    return res.status(500).json({ result: 'ERROR', error: '답변을 저장하지 못했습니다.' });
  }
};
