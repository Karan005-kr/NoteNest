# NoteNest Frontend — Style 4

A redesigned plain HTML + CSS + Vanilla JavaScript frontend for the existing StudyVault/NoteNest backend.

## Design
- Clean creative / modern layout (Style 4)
- NoteNest blue + green + purple + orange palette
- Times New Roman typography
- Floating Syllabus / Notes / PYQ cards
- Responsive desktop + mobile layout
- Existing backend API integration preserved
- Existing Browse, Search and Admin functionality preserved

## Backend connection

Open:

`js/config.js`

Default:

```js
window.STUDYVAULT_CONFIG = {
  API_BASE_URL: 'http://localhost:5000/api',
  BACKEND_BASE_URL: 'http://localhost:5000'
};
```

Keep your backend running on port 5000.

## Run locally

1. Start XAMPP MySQL.
2. Start backend:
   `npm run dev`
3. Open this frontend with VS Code Live Server.
4. Typical frontend URL:
   `http://127.0.0.1:5500`

## Admin
This frontend still uses the backend's existing admin credentials.
If your backend seed has not changed:

Email: `admin@studyvault.local`

Password: `Admin@123`

Change the password before public deployment.
