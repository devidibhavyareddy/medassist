# MedAssist

MedAssist is an AI-enabled clinic operations and patient care portal. It combines a React/Vite frontend with an Express/MongoDB backend to support clinic administration, reception, doctors, laboratory staff, and patients in one role-aware application.

## Project Overview

The platform provides:

- Secure authentication with JWT-based sessions and role-based access
- Admin management for users, doctors, departments, services, reports, and audit logs
- Reception workflows for patients, appointments, and invoices
- Doctor workflows for consultations, medical records, prescriptions, labs, follow-ups, and AI assistance
- Laboratory workflows for orders and results
- Patient access to appointments, records, prescriptions, documents, invoices, and timelines
- Document uploads and retrieval
- Notifications, global search, dashboards, reports, and audit history
- AI-assisted features backed by the OpenAI API

## Architecture

```text
                        +-----------------------------+
                        |        Vercel Frontend      |
                        |   React + Vite application  |
                        +--------------+--------------+
                                       |
                         HTTPS /api requests with JWT
                                       |
                                       v
                        +--------------+--------------+
                        |        Render Backend       |
                        | Express API + security      |
                        +------+---------------+-------+
                               |               |
                               v               v
                     +---------+-----+   +-----+---------+
                     | MongoDB       |   | OpenAI API    |
                     | application   |   | AI features   |
                     | data          |   |               |
                     +---------------+   +---------------+
```

The frontend calls the backend through `VITE_API_URL`. The backend uses `CLIENT_URL` to restrict browser access through CORS. Authentication tokens are sent as bearer tokens on protected API requests.

## Repository Structure

```text
MedAssist/
├── backend/
│   ├── config/          Database configuration
│   ├── controllers/     Request handlers and business logic
│   ├── middleware/      Auth, roles, validation, security, and uploads
│   ├── models/          Mongoose data models
│   ├── routes/          Express API route definitions
│   ├── services/        AI, audit, and notification services
│   ├── uploads/         Runtime document uploads
│   ├── .env.example     Backend environment template
│   ├── package.json     Backend scripts and dependencies
│   ├── server.js        API entry point
│   └── README.md        Backend-specific documentation
├── frontend/
│   ├── public/          Public static assets
│   ├── src/
│   │   ├── api/         Axios API clients
│   │   ├── assets/      Images and frontend assets
│   │   ├── components/  Shared UI, layout, charts, search, and AI
│   │   ├── context/     Authentication and toast providers
│   │   └── pages/       Public and role-specific screens
│   ├── .env             Local Vite environment settings
│   ├── package.json     Frontend scripts and dependencies
│   └── README.md        Frontend-specific documentation
├── .gitignore           Repository-wide ignore rules
└── README.md            Overall project documentation
```

## Requirements

- Node.js 20 or newer
- npm
- MongoDB locally or through MongoDB Atlas
- An OpenAI API key for AI features

## Local Development

### 1. Start the backend

```bash
cd backend
npm install
```

Create `backend/.env` from `backend/.env.example` and configure the database, JWT secret, frontend origin, and OpenAI settings.

```bash
npm run dev
```

The API runs at `http://localhost:5000` by default.

### 2. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env` with the local backend URL:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the Vite development server:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173` by default.

### 3. Optional database seed

To seed the configured database with initial users and data:

```bash
cd backend
npm run seed
```

Review `seedUsers.js` before using the seed command in a shared or production database.

## Production Deployments

| Component | Hosting | URL |
| --- | --- | --- |
| Frontend | Vercel | [medassist-lilac.vercel.app](https://medassist-lilac.vercel.app) |
| Backend API | Render | [medassist-wl58.onrender.com](https://medassist-wl58.onrender.com) |

### Frontend environment

Configure this Vercel environment variable:

```env
VITE_API_URL=https://medassist-wl58.onrender.com/api
```

Use `frontend` as the Vercel root directory, `npm run build` as the build command, and `dist` as the output directory.

### Backend environment

Configure these Render environment variables:

```env
PORT=5000
MONGO_URI=<mongodb-connection-string>
JWT_SECRET=<long-random-secret>
CLIENT_URL=https://medassist-lilac.vercel.app
OPENAI_API_KEY=<openai-api-key>
OPENAI_MODEL=<openai-model>
```

Use `npm start` as the Render start command.

## API Areas

The backend exposes these API groups under `/api`:

- `/api/auth`
- `/api/admin`
- `/api/patient`
- `/api/receptionist`
- `/api/appointment`
- `/api/medical-records`
- `/api/prescriptions`
- `/api/labs`
- `/api/invoices`
- `/api/follow-ups`
- `/api/notifications`
- `/api/patient-timeline`
- `/api/audit-logs`
- `/api/search`
- `/api/ai`
- `/api/patient-ai`
- `/api/documents`
- `/api/dashboard`
- `/api/reports`

See `backend/request.http` for example requests and the [backend README](backend/README.md) for the complete API area reference.

## Useful Commands

Backend:

```bash
cd backend
npm run dev
npm start
npm run seed
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
npm run preview
npm run lint
```

## Security and Configuration

- Never commit `.env` files, API keys, database credentials, or JWT secrets.
- Use a unique, long `JWT_SECRET` for each deployed environment.
- Keep OpenAI and MongoDB credentials in Render or another secret manager.
- Only expose `VITE_` variables that are safe for browser code.
- Keep `CLIENT_URL` set to the exact frontend origin without a trailing slash.
- Configure persistent storage if uploaded documents must survive backend redeployments.

## Detailed Documentation

- [Backend setup and API documentation](backend/README.md)
- [Frontend setup and deployment documentation](frontend/README.md)
