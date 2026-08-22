const path = require('path');
require('dotenv').config({ path: [path.resolve(__dirname, '../../.env'), path.resolve(__dirname, '../.env')] });

const express = require('express');
const cors = require('cors');
const logger = require("./utils/logger");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello. This is the backend of Highlog.");
});

const authenticate = require("./middlewares/authenticate");
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const studentsRoutes = require("./routes/students");
app.use("/api/students", authenticate, studentsRoutes);

const coursesRoutes = require("./routes/courses");
app.use('/api/courses', authenticate, coursesRoutes);

const enrolmentsRoutes = require("./routes/enrolments");
app.use('/api/enrolments', authenticate, enrolmentsRoutes);

const classTimetablesRoutes = require("./routes/classTimetables");
app.use('/api/class-timetables', authenticate, classTimetablesRoutes);

const personalTimetablesRoutes = require("./routes/personalTimetables");
app.use('/api/personal-timetables', authenticate, personalTimetablesRoutes);

const mealsRoutes = require('./routes/meals');
app.use('/api/meals', authenticate, mealsRoutes);

const port = process.env.BACKEND_PORT || 3000;
app.listen(port, () => {
    logger.info(`Server is running on port ${port}!`)
});
