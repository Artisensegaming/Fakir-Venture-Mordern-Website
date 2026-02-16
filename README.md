# Fakir Ventures Modern Website

## Overview
This project is a responsive single-page website for Fakir Ventures with:
- A frontend SPA (`index.html`, `styles.css`, `script.js`)
- Server-side authentication using `Passport.js` local strategy
- User persistence in Firebase Firestore
- Dedicated pages for login, registration, and account management

## Features
- Hash-based SPA routing for site sections (`#home`, `#about`, etc.)
- Portfolio/company filtering by industry
- Responsive UI and animation effects
- Session-based authentication with Passport:
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `PATCH /auth/account`
- `PATCH /auth/password`
- Auth UI pages:
- `public/html/login.html`
- `public/html/register.html`
- `public/html/account-management.html`
- Hero section account icon linking to login

## Tech Stack
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js, Express
- Auth: Passport.js (`passport-local`) + `express-session`
- Password hashing: `bcryptjs`
- Database: Firebase Firestore (`firebase-admin`)

## Project Structure
```text
.
├── config/
│   ├── firebase.js
│   └── passport.js
├── middleware/
│   └── ensureAuthenticated.js
├── models/
│   └── User.js
├── public/
│   ├── css/
│   │   └── auth.css
│   ├── html/
│   │   ├── account-management.html
│   │   ├── login.html
│   │   └── register.html
│   └── js/
│       └── auth-pages.js
├── routes/
│   └── auth.js
├── index.html
├── styles.css
├── script.js
├── server.js
├── .env.example
└── package.json
```

## Firebase Setup
1. Create a Firebase project.
2. Enable Firestore in that project.
3. Create a service account key from Firebase Console:
   - Project Settings -> Service Accounts -> Generate new private key
4. Copy `.env.example` to `.env`.
5. Configure one of the following:
   - `FIREBASE_SERVICE_ACCOUNT_PATH` (recommended for local development), or
   - `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string)
6. Set `SESSION_SECRET` to a strong random value.

## Installation
```bash
npm install
```

## Run
```bash
npm start
```

Server starts on `http://localhost:3000` by default.

Use auth pages from the backend origin (not only a static file server):
- `http://localhost:3000/public/html/register.html`
- `http://localhost:3000/public/html/login.html`

If you open pages from another localhost port (for example VS Code Live Server on `5500`), frontend auth calls are automatically routed to `http://localhost:3000`.

## Notes
- Authentication uses server-side sessions (`fakir.sid` cookie).
- User records are stored in Firestore collection: `users`.
- Passwords are hashed with bcrypt before storage.
