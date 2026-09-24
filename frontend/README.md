# MedAssist Frontend

The MedAssist frontend is a React application built with Vite. It provides the user interface for clinic administration, reception, doctors, laboratory staff, and patients, including dashboards, appointments, records, prescriptions, documents, invoices, notifications, reports, and AI-assisted workflows.

## Requirements

- Node.js 20 or newer
- npm
- A running MedAssist backend API

## Setup

From this directory:

```bash
npm install
```

Create a local `.env` file with the backend API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

The deployed frontend uses:

```env
VITE_API_URL=https://medassist-wl58.onrender.com/api
```

Vite exposes variables prefixed with `VITE_` to browser code. Do not put private keys or backend secrets in this file.

## Scripts

```bash
npm run dev       # Start the Vite development server
npm run build     # Create a production build in dist/
npm run preview   # Preview the production build locally
npm run lint      # Run Oxlint
```

The development server normally runs at `http://localhost:5173`.

## Application Areas

- Public landing, login, and registration pages
- Role-based admin, doctor, receptionist, laboratory, and patient views
- Appointment scheduling and follow-up management
- Patient records, timelines, prescriptions, laboratory orders, and results
- Document uploads and patient document access
- Invoices, reports, audit logs, search, and notifications
- AI tools for supported clinical workflows

## Project Structure

```text
src/
	api/          Axios clients for backend resources
	assets/       Images and static frontend assets
	components/   Shared layout, UI, charts, search, timeline, and AI components
	context/      Authentication and toast providers
	pages/        Public and role-specific application pages
	App.jsx       Application routes and top-level composition
	main.jsx      React entry point
	index.css     Global styles
	App.css       Application styles
public/         Public static assets
```

## API Configuration

The API client reads `VITE_API_URL` and attaches the stored JWT token as a bearer token. If the variable is not set, the source fallback points to the deployed Render API:

```text
https://medassist-wl58.onrender.com/api
```

For local development, set `VITE_API_URL=http://localhost:5000/api` in `.env`.

## Deployment

The frontend is deployed on Vercel at:

```text
https://medassist-lilac.vercel.app
```

Recommended Vercel settings:

- Framework preset: `Vite`
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://medassist-wl58.onrender.com/api`

After changing an environment variable in Vercel, create a new deployment so the value is embedded into the production build.

## Development Notes

- Keep environment files local; they are ignored by Git.
- Use the backend README for API setup and database configuration.
- Run `npm run build` before deploying to catch Vite compilation errors.
- The production bundle currently emits a size warning because the main JavaScript chunk is larger than 500 kB; this does not prevent a successful build.
