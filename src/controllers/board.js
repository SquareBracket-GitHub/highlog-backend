const db = require('../models/db');
const logger = require('../utils/logger');

const database = db.promise();

const postDto = (row, studentId) => ({
  id: row.id,
  title: row.title,
  content: row.content,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  commentCount: Number(row.comment_count || 0),
  isMine: Number(row.author_student_id) === Number(studentId),
});

exports.list = async (req, res) => {
  const { page, limit } = req.validated.query;
  const offset = (page - 1) * limit;
  try {
    const [[{ total }], [rows]] = await Promise.all([
      database.query('SELECT COUNT(*) AS total FROM anonymous_posts WHERE deleted_at IS NULL'),
      database.query(`
        SELECT p.id, p.author_student_id, p.title, p.content, p.created_at, p.updated_at,
               COUNT(c.id) AS comment_count
          FROM anonymous_posts p
          LEFT JOIN anonymous_comments c ON c.post_id = p.id AND c.deleted_at IS NULL
         WHERE p.deleted_at IS NULL
         GROUP BY p.id
         ORDER BY p.created_at DESC
         LIMIT ? OFFSET ?`, [limit, offset]),
    ]);
    return res.json({ result: 'SUCCESS', data: { posts: rows.map((row) => postDto(row, req.auth.studentId)), page, total: Number(total), hasMore: offset + rows.length < Number(total) } });
  } catch (error) {
    logger.error('Error listing anonymous posts.\n' + error);
    return res.status(500).json({ result: 'ERROR', error: '게시글을 불러오지 못했습니다.' });
  }
};

exports.get = async (req, res) => {
  try {
    const [posts] = await database.query(`
      SELECT p.id, p.author_student_id, p.title, p.content, p.created_at, p.updated_at,
             (SELECT COUNT(*) FROM anonymous_comments c WHERE c.post_id = p.id AND c.deleted_at IS NULL) AS comment_count
        FROM anonymous_posts p WHERE p.id = ? AND p.deleted_at IS NULL`, [req.validated.params.id]);
    if (!posts[0]) return res.status(404).json({ result: 'ERROR', code: 'POST_NOT_FOUND', error: '게시글이 없습니다.' });

    const [comments] = await database.query(`
      SELECT id, author_student_id, content, created_at FROM anonymous_comments
       WHERE post_id = ? AND deleted_at IS NULL ORDER BY created_at ASC`, [req.validated.params.id]);
    const aliases = new Map();
    let aliasNumber = 0;
    const publicComments = comments.map((comment) => {
      const isPostAuthor = Number(comment.author_student_id) === Number(posts[0].author_student_id);
      if (!isPostAuthor && !aliases.has(comment.author_student_id)) aliases.set(comment.author_student_id, `익명${++aliasNumber}`);
      return { id: comment.id, content: comment.content, createdAt: comment.created_at,
        nickname: isPostAuthor ? '글쓴이' : aliases.get(comment.author_student_id),
        isMine: Number(comment.author_student_id) === Number(req.auth.studentId) };
    });
    return res.json({ result: 'SUCCESS', data: { ...postDto(posts[0], req.auth.studentId), comments: publicComments } });
  } catch (error) {
    logger.error('Error fetching anonymous post.\n' + error);
    return res.status(500).json({ result: 'ERROR', error: '게시글을 불러오지 못했습니다.' });
  }
};

exports.create = async (req, res) => {
  const { title, content } = req.validated.body;
  try {
    const [result] = await database.query('INSERT INTO anonymous_posts (author_student_id, title, content) VALUES (?, ?, ?)', [req.auth.studentId, title, content]);
    return res.status(201).json({ result: 'SUCCESS', data: { id: result.insertId } });
  } catch (error) {
    logger.error('Error creating anonymous post.\n' + error);
    return res.status(500).json({ result: 'ERROR', error: '게시글을 등록하지 못했습니다.' });
  }
};

exports.update = async (req, res) => {
  const { title, content } = req.validated.body;
  try {
    const [result] = await database.query(`UPDATE anonymous_posts SET title = ?, content = ? WHERE id = ? AND author_student_id = ? AND deleted_at IS NULL`,
      [title, content, req.validated.params.id, req.auth.studentId]);
    if (!result.affectedRows) return res.status(404).json({ result: 'ERROR', code: 'POST_NOT_FOUND_OR_FORBIDDEN', error: '수정할 수 없는 게시글입니다.' });
    return res.json({ result: 'SUCCESS', data: { id: req.validated.params.id } });
  } catch (error) {
    logger.error('Error updating anonymous post.\n' + error);
    return res.status(500).json({ result: 'ERROR', error: '게시글을 수정하지 못했습니다.' });
  }
};

exports.removeMine = async (req, res) => {
  try {
    const [result] = await database.query('UPDATE anonymous_posts SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND author_student_id = ? AND deleted_at IS NULL', [req.validated.params.id, req.auth.studentId]);
    if (!result.affectedRows) return res.status(404).json({ result: 'ERROR', code: 'POST_NOT_FOUND_OR_FORBIDDEN', error: '삭제할 수 없는 게시글입니다.' });
    return res.json({ result: 'SUCCESS', data: { id: req.validated.params.id } });
  } catch (error) {
    logger.error('Error deleting anonymous post.\n' + error);
    return res.status(500).json({ result: 'ERROR', error: '게시글을 삭제하지 못했습니다.' });
  }
};

exports.createComment = async (req, res) => {
  try {
    const [posts] = await database.query('SELECT id FROM anonymous_posts WHERE id = ? AND deleted_at IS NULL', [req.validated.params.id]);
    if (!posts[0]) return res.status(404).json({ result: 'ERROR', code: 'POST_NOT_FOUND', error: '게시글이 없습니다.' });
    const [result] = await database.query('INSERT INTO anonymous_comments (post_id, author_student_id, content) VALUES (?, ?, ?)', [req.validated.params.id, req.auth.studentId, req.validated.body.content]);
    return res.status(201).json({ result: 'SUCCESS', data: { id: result.insertId } });
  } catch (error) {
    logger.error('Error creating anonymous comment.\n' + error);
    return res.status(500).json({ result: 'ERROR', error: '댓글을 등록하지 못했습니다.' });
  }
};

exports.removeCommentMine = async (req, res) => {
  try {
    const [result] = await database.query('UPDATE anonymous_comments SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND author_student_id = ? AND deleted_at IS NULL', [req.validated.params.commentId, req.auth.studentId]);
    if (!result.affectedRows) return res.status(404).json({ result: 'ERROR', code: 'COMMENT_NOT_FOUND_OR_FORBIDDEN', error: '삭제할 수 없는 댓글입니다.' });
    return res.json({ result: 'SUCCESS', data: { id: req.validated.params.commentId } });
  } catch (error) {
    logger.error('Error deleting anonymous comment.\n' + error);
    return res.status(500).json({ result: 'ERROR', error: '댓글을 삭제하지 못했습니다.' });
  }
};

exports.getAuthorForAdmin = async (req, res) => {
  try {
    const [rows] = await database.query(`SELECT p.id, s.id AS student_id, s.username, s.login_id, s.grade, s.class_no, s.school_number
      FROM anonymous_posts p JOIN students s ON s.id = p.author_student_id WHERE p.id = ?`, [req.validated.params.id]);
    if (!rows[0]) return res.status(404).json({ result: 'ERROR', code: 'POST_NOT_FOUND', error: '게시글이 없습니다.' });
    await database.query(`INSERT INTO board_admin_audit_logs (admin_student_id, action, target_type, target_id, reason)
      VALUES (?, 'VIEW_POST_AUTHOR', 'post', ?, ?)`, [req.auth.studentId, req.validated.params.id, req.validated.body.reason]);
    const row = rows[0];
    return res.json({ result: 'SUCCESS', data: { postId: row.id, student: { id: row.student_id, username: row.username, loginId: row.login_id, grade: row.grade, classNo: row.class_no, schoolNumber: row.school_number } } });
  } catch (error) {
    logger.error('Error revealing anonymous post author.\n' + error);
    return res.status(500).json({ result: 'ERROR', error: '작성자 정보를 확인하지 못했습니다.' });
  }
};

exports.removeForAdmin = async (req, res) => {
  const connection = database;
  try {
    await connection.beginTransaction();
    const [result] = await connection.query(`UPDATE anonymous_posts SET deleted_at = CURRENT_TIMESTAMP, deleted_by_admin_id = ?, deletion_reason = ? WHERE id = ? AND deleted_at IS NULL`,
      [req.auth.studentId, req.validated.body.reason, req.validated.params.id]);
    if (!result.affectedRows) { await connection.rollback(); return res.status(404).json({ result: 'ERROR', code: 'POST_NOT_FOUND', error: '게시글이 없습니다.' }); }
    await connection.query(`INSERT INTO board_admin_audit_logs (admin_student_id, action, target_type, target_id, reason) VALUES (?, 'DELETE_POST', 'post', ?, ?)`,
      [req.auth.studentId, req.validated.params.id, req.validated.body.reason]);
    await connection.commit();
    return res.json({ result: 'SUCCESS', data: { id: req.validated.params.id } });
  } catch (error) {
    await connection.rollback();
    logger.error('Error moderating anonymous post.\n' + error);
    return res.status(500).json({ result: 'ERROR', error: '게시글을 관리하지 못했습니다.' });
  }
};
