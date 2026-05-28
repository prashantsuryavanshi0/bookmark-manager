# Mini Bookmark Manager

A full-stack bookmark manager built with Next.js frontend and Express.js + MongoDB backend.

## Features

- Responsive bookmark grid dashboard
- Bookmark add form with validation
- Favorite toggle per bookmark
- Delete bookmarks
- Client-side filtering by favorite status and tags
- Prevents duplicate bookmark URLs in the backend

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start MongoDB locally or provide `MONGODB_URI`.

3. Run both servers:

```bash
npm run dev
```

Frontend will run on `http://localhost:3000` and backend on `http://localhost:5000`.

## Environment

- Key: `MONGODB_URI`
- Example value (replace `YOUR_PASSWORD` and URL-encode if needed):

```
mongodb+srv://prashantsuryavanahi51781_db_user:YOUR_PASSWORD@cluster0.vtuci6q.mongodb.net/bookmarks?retryWrites=true&w=majority&appName=Cluster0
```

- Local workflow:

```powershell
Copy-Item .env.example .env
notepad .env
# replace <DB_PASSWORD> with your password (URL-encode special characters)
```

- For Vercel: add `MONGODB_URI` under Project → Settings → Environment Variables and redeploy.

## Notes

- API base URL is configured in `frontend/pages/index.js` via `NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:5000`.
- The backend enforces unique URLs and validates URL format.
