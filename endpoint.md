# API Specification

> 2026-08-11 기준 모든 업무 API의 base path는 `/api`이며 Bearer token이 필요합니다.
> 회원가입은 `POST /api/auth/register`, 로그인은 `POST /api/auth/login`입니다.
> 과목의 선택 그룹 필드는 `category`가 아니라 `tag`입니다.
> `GET /api/class-timetables/me`는 로그인 학생의 학년/반 시간표 틀을 반환합니다.
> `POST /api/enrolments`는 같은 tag의 기존 수강을 새 과목으로 교체합니다.

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
|GET|/enrolments/student/:student_id|Get enrolments by student ID|
|GET|/enrolments/course/:course_id|Get enrolments by course ID|
|POST|/enrolments|Create enrolment|
|PUT|/enrolments/student/:student_id/course/:course_id|Update enrolments information|
|DELETE|/enrolments/student/:student_id|Delete enrolments by student ID|
|DELETE|/enrolments/course/:course_id|Delete enrolments by course ID|
|DELETE|/enrolments/student/:student_id/course/:course_id|Delete enrolment|
|GET|/class-timetables/me|Get the authenticated student's class timetable template|
- - -
## /students

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
## /courses

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
## /enrolments

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
