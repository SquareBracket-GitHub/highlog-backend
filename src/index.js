require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello. This is the backend of Highlog.");
});

const studentRoutes = require("./routes/students");
app.use("/students", studentRoutes);

app.listen(process.env.BACKEND_PORT, () => {
    console.log(`Server is running on port ${process.env.BACKEND_PORT}`);
});