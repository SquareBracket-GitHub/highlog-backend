const db = require("../models/db");
const logger = require("../utils/logger");

exports.getMine = (req, res) => {
    const query = `
        SELECT slots.id, slots.grade, slots.class_no, slots.day,
               slots.period, slots.label, slots.tag, slots.course_id
        FROM students
        JOIN class_timetable_slots AS slots
          ON slots.grade = students.grade
         AND slots.class_no = students.class_no
        WHERE students.id = ?
        ORDER BY FIELD(slots.day, '월요일', '화요일', '수요일', '목요일', '금요일'),
                 slots.period
    `;

    db.query(query, [req.auth.studentId], (err, results) => {
        if (err) {
            logger.error("Error fetching class timetable.\n" + err);
            return res.status(500).json({ result: "ERROR", error: "Error fetching class timetable" });
        }

        const slots = results.map(({ id, grade, class_no, day, period, label, tag, course_id }) => ({
            id,
            grade,
            classNo: class_no,
            day,
            period,
            label,
            tag,
            courseId: course_id
        }));

        return res.json({ result: "SUCCESS", data: slots });
    });
};
