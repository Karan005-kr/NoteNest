# NoteNest

NoteNest is a full-stack university study material portal where students can easily access academic resources such as syllabus, unit-wise notes, and previous year question papers.

The platform is designed to reduce dependency on scattered WhatsApp groups, teachers, or random Drive links by keeping university study material organized in one place.

---

## Features

- University selection
- Course selection
- Optional branch / specialization selection
- Semester-wise navigation
- Subject-wise study material
- Syllabus access
- Unit-wise notes
- Previous year question papers
- Search functionality
- Admin login
- Admin dashboard
- Add and manage universities
- Add and manage courses
- Add and manage subjects
- Upload study material
- Publish / unpublish material
- External document URL support
- Local file upload support
- Responsive frontend

---

## Study Material Types

NoteNest currently supports:

- Syllabus
- Notes
- Previous Year Question Papers (PYQ)

---

## Tech Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript

### Backend

- Node.js
- Express.js
- REST API

### Database

- MySQL / MariaDB

### Authentication

- JWT Authentication
- bcrypt password hashing

### Other Technologies

- Multer for file uploads
- CORS
- Helmet
- Express Rate Limit
- Zod validation
- Swagger API Documentation

---

## Project Structure

```text
NoteNest/
│
├── backend/
│   ├── database/
│   ├── examples/
│   ├── scripts/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── docs/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   │
│   ├── uploads/
│   │   └── materials/
│   │
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── css/
    ├── js/
    ├── assets/
    └── index.html
