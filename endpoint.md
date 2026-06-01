# API Specification
## Quick Reference
|Method|URI|Description|
|:---:|:---:|:---|
|GET|/api/students|Get all students|
|GET|/api/students/:id|Get student by student ID|
|POST|/api/students|Create student|
|PUT|/api/students/:id|Update student information|
|DELETE|/api/students/:id|Delete student|
|GET|/api/courses|Get all courses|
|GET|/api/courses|Get course by course ID|
|POST|/api/courses|Create course|
|PUT|/api/courses/:id|Update course information|
|DELETE|/api/courses/:id|Delete course|
|GET|/api/enrolments|Get all enrolments|
|GET|/api/enrolments/student/:student_id|Get enrolments by student ID|
|GET|/api/enrolments/course/:course_id|Get enrolments by course ID|
|POST|/api/enrolments|Create enrolment|
|PUT|/api/enrolments/student/:student_id/course/:course_id|Update enrolments information|
|DELETE|/api/enrolments/student/:student_id|Delete enrolments by student ID|
|DELETE|/api/enrolments/course/:course_id|Delete enrolments by course ID|
|DELETE|/api/enrolments/student/:student_id/course/:course_id|Delete enrolment|
- - -
## /api/students

### `GET` /students
**RES** JSON
```json
{
    result: "SUCCESS",
    data: [
        {
            id,
            username,
            grade,
            class_no,
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
        id,
        username,
        grade,
        class_no,
        school_number
    }
}
```

### `POST` /students
**REQ** BODY
```json
{
    username,
    login_id,
    password,
    grade,
    class_no,
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
        login_id,
        grade,
        class_no,
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
    login_id,
    password,
    grade,
    class_no,
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
        login_id,
        grade,
        class_no,
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

- - -
## /api/courses

### `GET` /courses
**RES** JSON
```json
{
    result: "SUCCESS",
    data: [
        {
            id,
            title,
            classroom,
            days
        }
    ]
}
```

### `GET` /courses/:id
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
        id,
        title,
        classroom,
        days
    }
}
```

### `POST` /courses
**REQ** BODY
```json
{
    title,
    classroom,
    days
}
```

`day` example:
```json
[
    { "day": "월요일", "period": 3 },
    { "day": "화요일", "period": 3 }
]
```

**RES** JSON
```json
{
    result: "SUCCESS",
    data: {
        id,
        title,
        classroom,
        days
    }
}
```

### `PUT` /courses/:id
**REQ** PARAMS
```json
{
    id
}
```
**REQ** BODY
```json
{
    title,
    classroom,
    days
}
```
**RES** JSON
```json
{
    result: "SUCCESS",
    data: {
        id,
        title,
        classroom,
        days
    }
}
```

### `DELETE` /courses/:id
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

- - -
## /api/enrolments

### `GET` /enrolments
**RES** JSON
```json
{
    result: "SUCCESS",
    data: [
        {
            student_id,
            course_id
        }
    ]
}
```

### `GET` /enrolments/student/:student_id
**REQ** PARAMS
```json
{
    student_id
}
```
**RES** JSON
```json
{
    result: "SUCCESS",
    data: [
        {
            student_id,
            course_id
        }
    ]
}
```

### `GET` /enrolments/course/:course_id
**REQ** PARAMS
```json
{
    course_id
}
```
**RES** JSON
```json
{
    result: "SUCCESS",
    data: [
        {
            student_id,
            course_id
        }
    ]
}
```

### `POST` /enrolments
**REQ** BODY
```json
{
    student_id,
    course_id
}
```
**RES** JSON
```json
{
    result: "SUCCESS",
    data: {
        student_id,
        course_id
    }
}
```

### `PUT` /enrolments/student/:student_id/course/:course_id
**REQ** PARAMS
```json
{
    student_id,
    course_id
}
```
**REQ** BODY
```json
{
    student_id,
    course_id
}
```
**RES** JSON
```json
{
    result: "SUCCESS",
    data: {
        n_student_id,
        n_course_id
    }
}
```

### `DELETE` /enrolments/student/:student_id
**REQ** PARAMS
```json
{
    student_id
}
```
**RES** JSON
```json
{
    result: "SUCCESS",
    data: {
        student_id
    }
}
```

### `DELETE` /enrolments/course/:course_id
**REQ** PARAMS
```json
{
    course_id
}
```
**RES** JSON
```json
{
    result: "SUCCESS",
    data: {
        course_id
    }
}
```

### `DELETE` /enrolments/student/:student_id/course/:course_id
**REQ** PARAMS
```json
{
    student_id,
    course_id
}
```
**RES** JSON
```json
{
    result: "SUCCESS",
    data: {
        student_id,
        course_id
    }
}
```

- - -
## Data Model Notes

- `students`
  - `id` INT AUTO_INCREMENT PRIMARY KEY
  - `username` VARCHAR(10)
  - `grade` INT
  - `class_no` INT
  - `school_number` INT
  - note: POST / PUT 요청에서는 `class_no` 필드를 사용합니다.

- `courses`
  - `id` INT AUTO_INCREMENT PRIMARY KEY
  - `title` VARCHAR(80)
  - `classroom` VARCHAR(50)
  - `days` JSON

- `enrolments`
  - `student_id` INT
  - `course_id` INT
  - UNIQUE (`student_id`, `course_id`)
