# MedAssist Backend

The MedAssist backend is an Express and MongoDB API for clinic operations and patient care. It provides authentication, role-based access, patient records, appointments, prescriptions, laboratories, invoices, notifications, documents, reports, audit logs, search, and AI-assisted workflows.

## Requirements

- Node.js 20 or newer
- npm
- MongoDB running locally or a MongoDB Atlas connection
- An OpenAI API key for AI features

## Setup

From this directory:

```bash
npm install
```

Create a `.env` file from `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/medassist
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=your-openai-model
```

Never commit `.env` or expose API keys in the frontend. The repository ignores environment files.

## Scripts

```bash
npm start       # Start the API server
npm run dev     # Start with Nodemon during development
npm run seed    # Seed the configured database with initial users and data
```

The server listens on port `5000` by default, or the port configured by `PORT`.

## API

All application endpoints are prefixed with `/api`:

| Area | Route prefix |
| --- | --- |
| Authentication | `/api/auth` |
| Administration | `/api/admin` |
| Patients | `/api/patient` |
| Reception | `/api/receptionist` |
| Appointments | `/api/appointment` |
| Medical records | `/api/medical-records` |
| Prescriptions | `/api/prescriptions` |
| Laboratories | `/api/labs` |
| Invoices | `/api/invoices` |
| Follow-ups | `/api/follow-ups` |
| Notifications | `/api/notifications` |
| Patient timeline | `/api/patient-timeline` |
| Audit logs | `/api/audit-logs` |
| Search | `/api/search` |
| AI services | `/api/ai` and `/api/patient-ai` |
| Documents | `/api/documents` |
| Dashboard | `/api/dashboard` |
| Reports | `/api/reports` |

The root health response is available at `GET /`.

Most protected endpoints require a bearer token:

```http
Authorization: Bearer <jwt-token>
```

Example requests are available in `request.http`.

## Project Structure

```text
config/        Database configuration
controllers/   Request handlers and business orchestration
middleware/    Authentication, roles, validation, security, and uploads
models/        Mongoose data models
routes/        Express route definitions
services/      Shared AI, audit, and notification services
uploads/       Runtime document uploads (not committed)
server.js      Application entry point
seedUsers.js   Seed script
```

## Deployment

The production API is deployed on Render at:

```text
https://medassist-wl58.onrender.com
```

Configure these variables in the Render service settings:

- `PORT` (Render supplies this automatically when applicable)
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL=https://medassist-lilac.vercel.app`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

Use `npm start` as the start command. Do not place secrets in source control or client-side environment variables.

## Security Notes

- Use a unique, long random `JWT_SECRET` in every deployed environment.
- Keep MongoDB credentials and the OpenAI key in the hosting provider's secret environment settings.
- Restrict `CLIENT_URL` to the deployed frontend origin.
- Uploaded documents are runtime data and should use persistent storage in production when required.
