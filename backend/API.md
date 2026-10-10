# StudyVault API Reference

Base URL: `http://localhost:5000`

All responses use:

```json
{ "success": true, "message": "...", "data": {} }
```

Errors use:

```json
{ "success": false, "message": "...", "errors": [] }
```

## Public

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API + database health |
| GET | `/api/universities` | Active universities |
| GET | `/api/universities/:idOrSlug` | One university |
| GET | `/api/universities/:idOrSlug/courses` | Courses offered by a university |
| GET | `/api/courses` | Active master courses |
| GET | `/api/courses/:id` | One course |
| GET | `/api/university-courses/:id` | University-course details |
| GET | `/api/university-courses/:id/semesters` | Dynamic semester list |
| GET | `/api/university-courses/:id/specializations` | Optional branches/specializations |
| GET | `/api/university-courses/:id/semesters/:semester/subjects` | Semester subjects |
| GET | `/api/subjects/:id` | Subject details |
| GET | `/api/subjects/:id/materials` | Published materials; filters: `type`, `unit`, `year` |
| GET | `/api/subjects/:id/content` | Subject + grouped Syllabus/Notes/PYQ |
| GET | `/api/materials/:id` | One published material |
| GET | `/api/search?q=dbms` | Search academic content |

### Optional branch filter

```text
GET /api/university-courses/1/semesters/3/subjects?specialization_id=2
```

If no specialization is supplied, only common (`specialization_id IS NULL`) subjects are returned.

## Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Returns JWT |
| GET | `/api/auth/me` | Current admin; Bearer token required |
| POST | `/api/auth/logout` | Stateless logout acknowledgement |

Use admin token on protected calls:

```http
Authorization: Bearer YOUR_JWT
```

## Admin dashboard

`GET /api/admin/dashboard`

Returns university/course/subject/material counts and recent materials.

## Admin universities

```text
GET    /api/admin/universities
POST   /api/admin/universities
PUT    /api/admin/universities/:id
PATCH  /api/admin/universities/:id/status
DELETE /api/admin/universities/:id
```

DELETE intentionally soft-disables the university.

## Admin courses

```text
GET    /api/admin/courses
POST   /api/admin/courses
PUT    /api/admin/courses/:id
PATCH  /api/admin/courses/:id/status
DELETE /api/admin/courses/:id
```

## Admin university-course mappings

```text
GET    /api/admin/university-courses
POST   /api/admin/university-courses
PUT    /api/admin/university-courses/:id
DELETE /api/admin/university-courses/:id
```

Example body:

```json
{
  "university_id": 1,
  "course_id": 1,
  "total_semesters": 8,
  "is_active": true
}
```

## Admin specializations / branches

```text
GET    /api/admin/specializations
POST   /api/admin/specializations
PUT    /api/admin/specializations/:id
DELETE /api/admin/specializations/:id
```

Example:

```json
{
  "university_course_id": 1,
  "name": "Computer Science and Engineering",
  "short_name": "CSE",
  "is_active": true
}
```

## Admin subjects

```text
GET    /api/admin/subjects?page=1&limit=20
POST   /api/admin/subjects
PUT    /api/admin/subjects/:id
PATCH  /api/admin/subjects/:id/status
DELETE /api/admin/subjects/:id
```

List filters include `university_course_id`, `semester`, and `search`.

## Admin materials

```text
GET    /api/admin/materials?page=1&limit=20
POST   /api/admin/materials
POST   /api/admin/materials/upload
PUT    /api/admin/materials/:id
PATCH  /api/admin/materials/:id/publish
PATCH  /api/admin/materials/:id/unpublish
DELETE /api/admin/materials/:id
```

Admin list filters include `subject_id`, `type`, `published`, `search`, `semester`, `university_id`, and `course_id`.

### Material JSON body

```json
{
  "subject_id": 12,
  "title": "DBMS Unit 1 Notes",
  "description": "",
  "material_type": "NOTES",
  "unit_number": 1,
  "exam_year": null,
  "file_path": null,
  "file_url": "https://example.com/dbms-unit1.pdf",
  "is_published": false,
  "display_order": 1
}
```

### Upload

Send `multipart/form-data`:

- `file`: PDF, DOC, DOCX, PPT, or PPTX
- `metadata`: JSON string

Example metadata:

```json
{
  "subject_id": 12,
  "title": "DBMS Unit 1 Notes",
  "material_type": "NOTES",
  "unit_number": 1,
  "is_published": true
}
```
