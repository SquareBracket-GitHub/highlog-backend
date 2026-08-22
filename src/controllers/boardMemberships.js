const db = require('../models/db');
const logger = require('../utils/logger');

const database = db.promise();

exports.status = async (req, res) => {
  try {
    const [rows] = await database.query('SELECT status, requested_at, reviewed_at, review_note FROM board_memberships WHERE student_id = ?', [req.auth.studentId]);
    const row = rows[0];
    return res.json({ result: 'SUCCESS', data: row ? { status: row.status, requestedAt: row.requested_at, reviewedAt: row.reviewed_at, reviewNote: row.review_note } : { status: 'not_requested', requestedAt: null, reviewedAt: null, reviewNote: null } });
  } catch (error) {
    logger.error('Error reading board membership.\n' + error);
    return res.status(500).json({ result: 'ERROR', error: '게시판 신청 상태를 확인하지 못했습니다.' });
  }
};

exports.request = async (req, res) => {
  try {
    const [rows] = await database.query('SELECT status FROM board_memberships WHERE student_id = ?', [req.auth.studentId]);
    const current = rows[0]?.status;
    if (current === 'approved' || current === 'pending') return res.json({ result: 'SUCCESS', data: { status: current } });
    if (current === 'suspended') return res.status(403).json({ result: 'ERROR', code: 'BOARD_SUSPENDED', error: '게시판 이용이 정지된 계정입니다.' });
    if (current === 'rejected') {
      await database.query(`UPDATE board_memberships SET status = 'pending', requested_at = CURRENT_TIMESTAMP, reviewed_at = NULL, reviewed_by_admin_id = NULL, review_note = NULL WHERE student_id = ?`, [req.auth.studentId]);
    } else {
      await database.query(`INSERT INTO board_memberships (student_id, status) VALUES (?, 'pending')`, [req.auth.studentId]);
    }
    return res.status(201).json({ result: 'SUCCESS', data: { status: 'pending' } });
  } catch (error) {
    logger.error('Error requesting board membership.\n' + error);
    return res.status(500).json({ result: 'ERROR', error: '게시판 이용 신청을 등록하지 못했습니다.' });
  }
};

exports.pending = async (req, res) => {
  try {
    const [rows] = await database.query(`SELECT m.student_id, m.requested_at, s.username, s.grade, s.class_no, s.school_number
      FROM board_memberships m JOIN students s ON s.id = m.student_id
      WHERE m.status = 'pending' ORDER BY m.requested_at ASC`);
    return res.json({ result: 'SUCCESS', data: rows.map((row) => ({ studentId: row.student_id, username: row.username, grade: row.grade, classNo: row.class_no, schoolNumber: row.school_number, requestedAt: row.requested_at })) });
  } catch (error) {
    logger.error('Error listing board membership requests.\n' + error);
    return res.status(500).json({ result: 'ERROR', error: '승인 요청을 불러오지 못했습니다.' });
  }
};

exports.review = async (req, res) => {
  const connection = database;
  const { decision, note } = req.validated.body;
  const studentId = req.validated.params.studentId;
  try {
    await connection.beginTransaction();
    const [result] = await connection.query(`UPDATE board_memberships SET status = ?, reviewed_at = CURRENT_TIMESTAMP, reviewed_by_admin_id = ?, review_note = ? WHERE student_id = ? AND status = 'pending'`, [decision, req.auth.studentId, note || null, studentId]);
    if (!result.affectedRows) { await connection.rollback(); return res.status(409).json({ result: 'ERROR', code: 'REQUEST_NOT_PENDING', error: '이미 처리됐거나 존재하지 않는 요청입니다.' }); }
    await connection.query(`INSERT INTO board_admin_audit_logs (admin_student_id, action, target_type, target_id, reason) VALUES (?, ?, 'student', ?, ?)`,
      [req.auth.studentId, decision === 'approved' ? 'APPROVE_MEMBER' : 'REJECT_MEMBER', studentId, note || null]);
    await connection.commit();
    return res.json({ result: 'SUCCESS', data: { studentId, status: decision } });
  } catch (error) {
    await connection.rollback();
    logger.error('Error reviewing board membership.\n' + error);
    return res.status(500).json({ result: 'ERROR', error: '승인 요청을 처리하지 못했습니다.' });
  }
};
