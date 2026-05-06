require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

app.get("/", (req, res) => {
    res.send("Hello. This is the backend of Highlog.");
});

// app.get("/students", (req, res) => {
//     db.query("SELECT * FROM students", (err, results) => {
//         if (err) {
//             console.error(err);
//             res.status(500).send("Error fetching students");
//         } else {
//             res.json(results);
//         }
//     });
// });

app.get("/students/:id", (req, res) => {
    const id = req.params.id;
    const query = "SELECT * FROM students WHERE id = ?";

    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).send("Error fetching student");

        res.json({
            result: "SUCCESS",
            data: results[0]
        });
    });
});

app.get("/students", (req, res) => {
    const query = "SELECT * FROM students";

    db.query(query, (err, results) => {
        if (err) return res.status(500).send("Error fetching students");

        res.json({
            result: "SUCCESS",
            data: results
        });
    });
});

app.post("/students", (req, res) => {
    const { username, grade, class:cls } = req.body;
    const query = "INSERT INTO students (username, grade, class) VALUES (?, ?, ?)";
    
    db.query(query, [username, grade, cls], (err, results) => {
        if (err) return res.status(500).send("Error adding student");

        res.json({
            result: "SUCCESS",
            data: { id: results.insertId, username, grade, class: cls }
        });
    });
});

app.put("/students/:id", (req, res) => {
    const id = req.params.id;
    const { username, grade, class:cls } = req.body;
    const query = "UPDATE students SET username = ?, grade = ?, class = ? WHERE id = ?";
    
    db.query(query, [username, grade, cls, id], (err) => {
        if (err) return res.status(500).send("Error updating student");

        res.json({
            result: "SUCCESS",
            data: { id, username, grade, class: cls }
        });
    });
});

app.delete("/students/:id", (req, res) => {
    const id = req.params.id;
    const query = "DELETE FROM students WHERE id = ?";
    
    db.query(query, [id], (err) => {
        if (err) return res.status(500).send("Error deleting student");

        res.json({
            result: "SUCCESS",
            data: { id }
        });
    });
});

app.listen(process.env.BACKEND_PORT, () => {
    console.log(`Server is running on port ${process.env.BACKEND_PORT}`);
});