GET, POST, PUT, DELETE /student
```json
# GET /student?idx=1
{
    result: "SUCCESS",
    data: {
        username,
        grade,
        class,
        school_numer
    }
}
```
GET /students
GET /student_enrolments?idx=x
```json
# GET /student_enrolments?idx=10000
{
    result: "SUCCESS",
    data: [
        {
            course_idx,
            course_title,
            classroom,
        },...
    ]
}
```

GET, POST, PUT, DELETE /course
GET /courses
```json
# GET /course_enrolments?idx=100
{
    data: [
        {
            course_title,
            classroom,
        },...
    ]
}
```

GET, POST, PUT, DELETE /enrolment
GET /enrolments?student_idx=x
```json
{
    data: [
        {
            course_title,
            classroom,
        },...
    ]
}
```