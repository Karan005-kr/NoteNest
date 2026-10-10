# StudyVault Backend Pro

Reusable backend for a university study-material portal.

**Flow:** University → Course → optional Specialization/Branch → Semester → Subject → **Syllabus / Notes / PYQ**.

The backend is data-driven. New universities, courses, semester counts, subjects and materials can be added through APIs without changing source code.

## Stack

- Node.js + Express
- MySQL (`mysql2/promise`)
- JWT Bearer authentication for admin APIs
- bcrypt password hashing
- Multer document uploads
- Zod validation
- Helmet, CORS and rate limiting
- Swagger UI

Docker is **optional**. The easiest Windows setup is XAMPP MySQL or MySQL Community Server.

## 1. Prerequisites on Windows

Install:

1. Node.js 18 or newer
2. XAMPP **or** MySQL Community Server
3. VS Code (recommended)

If using XAMPP, open XAMPP Control Panel and click **Start** beside MySQL.

## 2. Configure

Open this folder in VS Code, then PowerShell:

```powershell
Copy-Item .env.example .env
```

CMD equivalent:

```cmd
copy .env.example .env
```

Edit `.env` if your MySQL password is different. XAMPP commonly uses:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=studyvault
```

## 3. Install and set up

```powershell
npm install
npm run db:setup
npm run check
npm run dev
```

Open:

- Health: http://localhost:5000/api/health
- Swagger: http://localhost:5000/api/docs

Expected health response:

```json
{
  "success": true,
  "message": "StudyVault API is healthy.",
  "database": "connected"
}
```

## Development admin

Created by `npm run db:setup`:

- Email: `admin@studyvault.local`
- Password: `Admin@123`

**Change this password/seed configuration before deployment.**

## Public flow endpoints

```text
GET /api/universities
GET /api/universities/dcrust/courses
GET /api/university-courses/:id/semesters
GET /api/university-courses/:id/specializations
GET /api/university-courses/:id/semesters/:semester/subjects
GET /api/subjects/:id/content
```

Materials exposed publicly are **published only**.

### Search

```text
GET /api/search?q=dbms
```

### Subject material filters

```text
GET /api/subjects/:id/materials?type=NOTES&unit=1
GET /api/subjects/:id/materials?type=PYQ&year=2025
```

## Admin login

Request:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@studyvault.local",
  "password": "Admin@123"
}
```

Response contains a JWT. Send it on admin requests:

```http
Authorization: Bearer YOUR_TOKEN
```

## Important admin APIs

```text
GET    /api/admin/dashboard

GET    /api/admin/universities
POST   /api/admin/universities
PUT    /api/admin/universities/:id
PATCH  /api/admin/universities/:id/status
DELETE /api/admin/universities/:id       # soft-disable

GET    /api/admin/courses
POST   /api/admin/courses
PUT    /api/admin/courses/:id
PATCH  /api/admin/courses/:id/status
DELETE /api/admin/courses/:id            # soft-disable

GET    /api/admin/university-courses
POST   /api/admin/university-courses
PUT    /api/admin/university-courses/:id
DELETE /api/admin/university-courses/:id # soft-disable

GET    /api/admin/specializations
POST   /api/admin/specializations
PUT    /api/admin/specializations/:id
DELETE /api/admin/specializations/:id    # soft-disable

GET    /api/admin/subjects
POST   /api/admin/subjects
PUT    /api/admin/subjects/:id
PATCH  /api/admin/subjects/:id/status
DELETE /api/admin/subjects/:id           # soft-disable

GET    /api/admin/materials
POST   /api/admin/materials
POST   /api/admin/materials/upload
PUT    /api/admin/materials/:id
PATCH  /api/admin/materials/:id/publish
PATCH  /api/admin/materials/:id/unpublish
DELETE /api/admin/materials/:id
```

## Create a subject

```json
{
  "university_course_id": 1,
  "specialization_id": null,
  "semester_number": 1,
  "name": "Engineering Mathematics-I",
  "subject_code": "MATH101",
  "description": "",
  "display_order": 1,
  "is_active": true
}
```

The API checks that the semester does not exceed the configured `total_semesters`.

## Create material using a URL/path

```json
{
  "subject_id": 1,
  "title": "Unit 1 Notes",
  "description": "",
  "material_type": "NOTES",
  "unit_number": 1,
  "exam_year": null,
  "file_path": null,
  "file_url": "https://example.com/unit1.pdf",
  "is_published": true,
  "display_order": 1
}
```

Allowed `material_type` values are only:

- `SYLLABUS`
- `NOTES`
- `PYQ`

For `PYQ`, `exam_year` is required.

## Upload a document

Endpoint:

```text
POST /api/admin/materials/upload
```

Use `multipart/form-data` with:

- `file`: PDF/DOC/DOCX/PPT/PPTX
- `metadata`: JSON string

Example metadata:

```json
{
  "subject_id": 1,
  "title": "Unit 1 Notes",
  "material_type": "NOTES",
  "unit_number": 1,
  "is_published": true
}
```

Uploaded files are stored under `uploads/materials/`. The implementation is isolated in `src/services/storage/` so it can later be replaced by S3/Supabase/etc.

## Frontend connection

The backend works with plain HTML/CSS/JavaScript `fetch()`.

See:

```text
examples/frontend-api.js
```

Basic university dropdown example:

```js
const result = await fetch('http://localhost:5000/api/universities').then(r => r.json());
for (const university of result.data) {
  // add university to your <select>
}
```

Then use the selected university id or slug:

```js
fetch(`http://localhost:5000/api/universities/${universitySlug}/courses`)
```

Continue with `university_course_id` returned by that API.

## Optional branch/specialization layer

The schema already supports an optional specialization layer:

```text
DCRUST → B.Tech → CSE → Semester 3 → DBMS
```

while courses without branches still work:

```text
DCRUST → BBA → Semester 3 → Marketing
```

A subject with `specialization_id = NULL` is treated as a common/non-specialized subject.

## Database setup behavior

`npm run db:setup` is designed to be safe to run repeatedly:

- creates database if missing
- creates tables if missing
- upserts seed universities/courses
- preserves normal user-created academic data
- ensures development admin exists

It does **not** drop the database.

### Reset (development only)

⚠️ This deletes the entire StudyVault database:

```powershell
npm run db:reset
```

It is blocked when `NODE_ENV=production`.

## Common errors

### `ECONNREFUSED 127.0.0.1:3306`

MySQL is not running. Start MySQL in XAMPP/MySQL service.

### `Access denied for user 'root'`

Your `.env` MySQL username/password is wrong. Update `DB_USER` / `DB_PASSWORD`.

### `Unknown database 'studyvault'`

Run:

```powershell
npm run db:setup
```

### `EADDRINUSE: address already in use :::5000`

Port 5000 is being used by another program. Change:

```env
PORT=5001
```

### CORS error in browser

Add your frontend URL to `.env`:

```env
FRONTEND_ORIGIN=http://127.0.0.1:5500,http://localhost:5500
```

Restart backend after changing `.env`.

## Seeded data

The setup includes:

- 12 sample universities
- B.Tech, BBA, BCA, B.Com, MBA, MCA
- DCRUST mappings for those courses
- B.Tech Semester 1–8
- 5 editable sample subjects per semester
- 3 **unpublished placeholder paths** for one DBMS subject

No actual PDF/DOC/PPT files are bundled.

## Production checklist

Before real deployment:

1. Set a strong `JWT_SECRET`.
2. Change seed admin credentials.
3. Use a dedicated MySQL user instead of root.
4. Set exact `FRONTEND_ORIGIN` values.
5. Put the API behind HTTPS.
6. Replace local file storage with durable object storage if needed.
7. Back up MySQL regularly.
8. Consider refresh-token/revocation support if you need persistent admin sessions.
