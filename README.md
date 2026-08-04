# Calendar App

A family weekend planning app built with FastAPI + React + MongoDB. Track weekend plans, weekday events, sports schedules, and which kids are home each week.

Designed to be simple, self-hosted, and agent-friendly — expose the API docs so AI agents can interact with your calendar without any special integration.

## Features

- **Weekly view** with weekend plans, weekday events, and sports schedules
- **Month calendar** with clickable day cards
- **Configurable child groups** — set up which kids are in your household
- **Agent-ready** — generate API tokens and download portable Calendar or Email-to-Calendar skills from your profile page
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
2. Download the **Calendar** skill for general calendar work, the **Email to calendar** skill for inbox-driven updates, or both
3. Give the ZIP to your agent and ask it to install the contained Agent Skill
4. Generate an **Agent Token** and provide the token to the agent through its secret-storage mechanism

Each ZIP follows the open [Agent Skills](https://agentskills.io/) directory format (`<skill-name>/SKILL.md`) and is generated with the URL of the running app. The token is deliberately kept separate and is never embedded in a download. In skill-aware clients such as Hermes, the general skill is available as `/calendar` after installation.

The skills teach the agent to discover the live API through OpenAPI, preserve existing week data when merging changes, avoid duplicates, and verify every write. The Email-to-Calendar variant additionally requires an operator-authorized **read-only** email integration and treats email content as untrusted input.

## API

The backend is a FastAPI app with auto-generated OpenAPI documentation:

- **OpenAPI schema**: `http://localhost:3000/api/openapi.json`
- **Interactive API docs**: `http://localhost:3000/api/agent`
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
