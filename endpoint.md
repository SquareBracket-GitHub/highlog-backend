# API Specification
## Quick Reference
|Method|URI|Description|
|:---:|:---:|:---|
|GET|/students|Get all students|
|GET|/students/:id|Get student by student ID|
|POST|/students|Create student|
|PUT|/students/:id|Update student information|
|DELETE|/students/:id|Delete student|
|GET|/courses|Get all courses|
|GET|/courses|Get course by course ID|
|POST|/courses|Create course|
|PUT|/courses/:id|Update course information|
|DELETE|/courses/:id|Delete course|
|GET|/enrolments|Get all enrolments|
|GET|/enrolments/:student_id|Get enrolments by student ID|
|GET|/enrolments/:course_id|Get enrolments by course ID|
|POST|/enrolments|Create enrolment|
|PUT|/enrolments/:student_id/:course_id|Update enrolments information|
|DELETE|/enrolments/:student_id|Delete enrolments by student ID|
|DELETE|/enrolments/:course_id|Delete enrolments by course ID|
|DELETE|/enrolments/:student_id/:course_id|Delete enrolment|
- - -
## /students

### `GET` /students
**RES** JSON
```json
{
    result: "SUCCESS",
    data: [
        {
            idx,
            username,
            grade,
            class,
            school_number
        }
    ]
}
```

### `GET` /students/:id
**REQ** PARAMS
```json
{
    id
}
```
**RES** JSON
```json
{
    result: "SUCCESS",
    data: {
        idx,
        username,
        grade,
        class,
        school_number
    }
}
```

### `POST` /students
**REQ** BODY
```json
{
    username,
    grade,
    class,
    school_number
}
```
**RES** JSON
```json
{
    result: "SUCCESS",
    data: {
        insertedId,
        username,
        grade,
        class,
        school_number
    }
}
```

### `PUT` /students/:id
**REQ** PARAMS
```json
{
    id
}
```
**REQ** BODY
```json
{
    username,
    grade,
    class,
    school_number
}
```
**RES** JSON
```json
{
    result: "SUCCESS",
    data: {
        id,
        username,
        grade,
        class,
        school_number
    }
}
```

### `DELETE` /students/:id
**REQ** PARAMS
```json
{
    id
}
```
**RES** JSON
```json
{
    result: "SUCCESS",
    data: {
        id
    }
}
```