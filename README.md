# Calendar App

A family weekend planning app built with FastAPI + React + MongoDB. Track weekend plans, weekday events, sports schedules, and which kids are home each week.

Designed to be simple, self-hosted, and agent-friendly — expose the API docs so AI agents can interact with your calendar without any special integration.

## Features

- **Weekly view** with weekend plans, weekday events, and sports schedules
- **Month calendar** with clickable day cards
- **Configurable child groups** — set up which kids are in your household
- **Agent-ready** — generate API tokens from your profile page and point any AI agent at the OpenAPI docs
- **Mobile-friendly** responsive design
- **Docker-based** deployment with MongoDB

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- A MongoDB instance (local or remote)

### 1. Clone and configure

```bash
git clone https://github.com/damont/calendarapp.git
cd calendarapp
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Point to your MongoDB instance
MONGODB_URL=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=calendarapp

# Set a password for your family account
APP_PASSWORD=your-family-password-here

# Generate a random secret (e.g.: openssl rand -hex 32)
JWT_SECRET=your-random-secret-here
```

### 2. Build and run

```bash
docker compose up -d --build
```

The app will be available at `http://localhost:3000`.

### 3. Create an account

Open the app and register. That's it — start adding your weekly plans.

## Agent Integration

Want an AI agent to manage your calendar?

1. Log in and click your username → **Profile**
2. Generate an **Agent Token**
3. Point your agent at `http://your-host:3000/api/schema` for the full OpenAPI docs

The agent can then create/update weeks, add sports schedules, manage events — all through the REST API.

## API

The backend is a FastAPI app with auto-generated OpenAPI documentation:

- **API Docs**: `http://localhost:3000/api/schema`
- **Auth**: JWT Bearer tokens (login or use agent tokens)

### Key endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/weeks/{date}` | Get a week by its Monday date |
| `PUT` | `/api/weeks/{date}` | Update a week's plans, events, sports |
| `GET` | `/api/weeks?start_date=...&end_date=...` | Get weeks in a date range |
| `GET` | `/api/settings/children` | Get configured child groups |
| `PUT` | `/api/settings/children` | Update child groups |

## Project Structure

```
calendarapp/
├── api/                    # FastAPI backend
│   ├── routes/             # API endpoints
│   ├── schemas/            # Pydantic models (DTOs + ORM)
│   ├── services/           # Business logic
│   └── utils/              # Auth, date helpers
├── frontend-react/         # React + TypeScript + Tailwind
├── docker-compose.yml
├── Dockerfile              # Multi-stage (API + frontend)
├── .env.example
└── pyproject.toml
```

## Tech Stack

- **Backend**: Python, FastAPI, Beanie (MongoDB ODM), Pydantic
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Database**: MongoDB
- **Deploy**: Docker Compose, Nginx

## Development

### Run without Docker

**Backend:**
```bash
pip install uv
uv sync
uvicorn api.main:app --reload --port 8005
```

**Frontend:**
```bash
cd frontend-react
npm install
npm run dev
```

## License

See [LICENSE](LICENSE) for details.
