PlaceMate — MERN Placement Management
====================================

Requirements
------------
- Node.js 18+
- MongoDB running locally or in the cloud

Setup
-----
1) Backend env

Copy `server/.env.example` to `server/.env` and fill values:

- MONGO_URI: your Mongo connection string
- PORT: default 5000
- JWT_SECRET, JWT_EXPIRES_IN
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (use Mailtrap or similar for testing)
- AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET (optional; if omitted, file uploads use local `/uploads`)
- FRONTEND_URL: `http://localhost:5173`

2) Install dependencies

```
npm install
npm --prefix server install
npm --prefix client install
```

3) Seed database

```
npm run seed
```

Seeds:
- Staff admin: email `admin@example.com`, password `admin123`
- 5 students, 3 companies, and one registration scheduled for tomorrow

4) Run in development

```
npm run dev
```

Client on http://localhost:5173, Server on http://localhost:5000 (proxied `/api` during dev).

Google OAuth
------------
1. Go to Google Cloud Console → Create OAuth 2.0 Client ID (Web Application).
2. Authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
3. Put client id/secret into `server/.env`.
4. Click "Sign in with Google" on `/login` (server issues JWT cookie and redirects to `/dashboard`).

SMTP for Emails
---------------
Use Mailtrap or any SMTP provider. Fill SMTP variables in `server/.env`.
Emails sent:
- on registration open (immediate)
- day before drive (cron at 02:00 server time)
- when student is finalized as placed

S3 or Local Uploads
-------------------
- If `AWS_ACCESS_KEY_ID` and `S3_BUCKET` exist, resumes upload to S3.
- Otherwise, resumes are stored locally under `server/uploads` and served at `/uploads`.

Security Notes
--------------
- JWT is set in an httpOnly cookie `token`. The SPA sends requests with `credentials: 'include'`.
- Consider adding CSRF protection (double-submit token) in production.
- File uploads restricted to PDFs up to 5MB.

Scripts
-------
- `npm run dev` – run server and client concurrently
- `npm run seed` – seed database
- `npm start` – production server



