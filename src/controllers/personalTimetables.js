const db = require("../models/db");
const logger = require("../utils/logger");

const mapEntry = ({ id, day, period, subject_name, class_name, color }) => ({
  id,
  day,
  period,
  subjectName: subject_name,
  className: class_name,
  color,
});

exports.getMine = (req, res) => {
  db.query(
    `SELECT id, day, period, subject_name, class_name, color
       FROM personal_timetable_entries
      WHERE student_id = ?
      ORDER BY FIELD(day, '월', '화', '수', '목', '금'), period`,
    [req.auth.studentId],
    (err, results) => {
      if (err) {
        logger.error("Error fetching personal timetable.\n" + err);
        return res.status(500).json({ result: "ERROR", error: "개인 시간표를 불러오지 못했습니다." });
      }
      return res.json({ result: "SUCCESS", data: results.map(mapEntry) });
    }
  );
};

exports.save = (req, res) => {
  const { day, period, subjectName, className, color } = req.validated.body;
  const query = `
    INSERT INTO personal_timetable_entries
      (student_id, day, period, subject_name, class_name, color)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      subject_name = VALUES(subject_name),
      class_name = VALUES(class_name),
      color = VALUES(color),
      updated_at = CURRENT_TIMESTAMP`;

  db.query(query, [req.auth.studentId, day, period, subjectName, className, color], (err) => {
    if (err) {
      logger.error("Error saving personal timetable entry.\n" + err);
      return res.status(500).json({ result: "ERROR", error: "시간표를 저장하지 못했습니다." });
    }
    db.query(
      `SELECT id, day, period, subject_name, class_name, color
         FROM personal_timetable_entries
        WHERE student_id = ? AND day = ? AND period = ?`,
      [req.auth.studentId, day, period],
      (selectError, results) => {
        if (selectError || !results[0]) {
          logger.error("Error reading saved timetable entry.\n" + selectError);
          return res.status(500).json({ result: "ERROR", error: "저장된 시간표를 확인하지 못했습니다." });
        }
        return res.json({ result: "SUCCESS", data: mapEntry(results[0]) });
      }
    );
  });
};

exports.remove = (req, res) => {
  const { day, period } = req.validated.params;
  db.query(
    "DELETE FROM personal_timetable_entries WHERE student_id = ? AND day = ? AND period = ?",
    [req.auth.studentId, day, period],
    (err) => {
      if (err) {
        logger.error("Error deleting personal timetable entry.\n" + err);
        return res.status(500).json({ result: "ERROR", error: "시간표 항목을 삭제하지 못했습니다." });
      }
      return res.json({ result: "SUCCESS", data: { day, period } });
    }
  );
};
