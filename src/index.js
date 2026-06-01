require('dotenv').config();

const express = require('express');
const cors = require('cors');
const logger = require("./utils/logger");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
    res.send("Hello. This is the backend of Highlog.");
});

const studentsRoutes = require("./routes/students");
app.use("/api/students", studentsRoutes);

const coursesRoutes = require("./routes/courses");
app.use('/api/courses', coursesRoutes);

const enrolmentsRoutes = require("./routes/enrolments");
app.use('/api/enrolments', enrolmentsRoutes);

app.listen(process.env.BACKEND_PORT, () => {
    logger.info(`Server is running on port ${process.env.BACKEND_PORT}!`)
});