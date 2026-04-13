# CodeQuest — Gamified Adaptive Learning Framework for Programming Education

A web-based platform that teaches programming fundamentals through adaptive learning paths, intelligent error detection, gamified reinforcement, and schema mastery tracking.

## Architecture

| Layer | Tech | Port |
|-------|------|------|
| Frontend | Vanilla JS + Vite | `3000` |
| Backend | Flask (Python) | `5000` |
| Database | Cloud Firestore | — |
| Auth | Firebase Authentication | — |
| Games | Phaser 3 | — |
| Charts | Chart.js | — |

The frontend dev server proxies all `/api/*` requests to the Flask backend.

## Project Structure

```
research_project/
├── backend/
│   ├── .env                        # Environment variables (git-ignored)
│   ├── .env.example                # Template for .env
│   ├── app.py                      # Flask app factory & entry point
│   ├── config.py                   # Centralised config from env vars
│   ├── requirements.txt            # Python dependencies
│   ├── firebase/
│   │   ├── __init__.py
│   │   └── firebase_service.py     # Firebase Admin SDK init + Firestore client
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── error_handler.py        # JSON error responses & @require_json decorator
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py              # Firestore document schemas
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── adaptive_routes.py      # /api/adaptive/*
│   │   ├── auth_routes.py          # /api/auth/*
│   │   ├── error_routes.py         # /api/errors/*
│   │   ├── gamification_routes.py  # /api/gamification/*
│   │   └── mastery_routes.py       # /api/mastery/*
│   ├── services/
│   │   ├── __init__.py
│   │   ├── adaptive_service.py     # Adaptive learning path logic
│   │   ├── error_service.py        # Error pattern detection logic
│   │   ├── gamification_service.py # Game catalog, scoring & XP
│   │   └── mastery_service.py      # Schema mastery tracking
│   └── utils/
│       ├── __init__.py
│       └── helpers.py              # Shared helpers (timestamps, classification)
│
└── frontend/
    ├── index.html                  # SPA shell with nav
    ├── package.json                # npm dependencies & scripts
    ├── vite.config.js              # Vite dev server + proxy config
    └── src/
        ├── main.js                 # App entry — router & auth listener
        ├── style.css               # Global styles (dark theme)
        ├── api/
        │   └── api.js              # Centralised fetch wrapper for all endpoints
        ├── components/
        │   ├── game-card.js        # Reusable game card
        │   ├── progress-bar.js     # Reusable progress bar
        │   └── stat-card.js        # Reusable stat card
        ├── config/
        │   └── firebase.js         # Firebase web SDK init
        ├── pages/
        │   ├── dashboard.js        # Stats overview & recommendations
        │   ├── error-analysis.js   # Code submission & error detection
        │   ├── games.js            # Game catalog grid
        │   ├── learning-path.js    # Ordered topic path with progress
        │   ├── login.js            # Email/password sign-in
        │   ├── mastery.js          # Schema mastery cards
        │   └── register.js         # Account creation
        └── utils/
            ├── auth.js             # Auth state manager & helpers
            └── dom.js              # DOM utility functions
```

## Four Core Components

| # | Component | Backend Route | Service | Frontend Page |
|---|-----------|---------------|---------|---------------|
| 1 | Adaptive Learning Path Generator | `/api/adaptive/*` | `adaptive_service.py` | `learning-path.js` |
| 2 | Intelligent Error Pattern Detector | `/api/errors/*` | `error_service.py` | `error-analysis.js` |
| 3 | Gamified Reinforcement Module | `/api/gamification/*` | `gamification_service.py` | `games.js` |
| 4 | Schema Mastery Tracker | `/api/mastery/*` | `mastery_service.py` | `mastery.js` |

## Prerequisites

- Python 3.10+
- Node.js 18+
- A Firebase project with Firestore and Authentication enabled

## Getting Started

### 1. Clone & Enter

```bash
git clone <repo-url>
cd research_project
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env if needed (defaults work for local dev)
```

### 3. Firebase Credentials

1. Go to **Firebase Console > Project Settings > Service Accounts**
2. Click **Generate New Private Key**
3. Save the file as `backend/firebase/serviceAccountKey.json`

> The app runs in **offline mode** without this file — API calls return placeholder data.

### 4. Start the Backend

```bash
cd backend
venv\Scripts\activate
python app.py
```

The server starts at `http://localhost:5000`. Verify with:

```
GET http://localhost:5000/api/health
```

### 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The dev server starts at `http://localhost:3000` and proxies `/api/*` to the backend.

### 6. Open the App

Visit **http://localhost:3000** in your browser.

## API Endpoints

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server status & Firebase connection |

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create user profile after Firebase Auth signup |
| GET | `/profile/<user_id>` | Get user profile |
| POST | `/verify-token` | Verify Firebase ID token server-side |

### Adaptive Learning (`/api/adaptive`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/next-activity/<user_id>` | Get next recommended activity |
| POST | `/update-progress` | Update learner progress |
| GET | `/learning-path/<user_id>` | Get full learning path |

### Error Detection (`/api/errors`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Analyse code for error patterns |
| GET | `/history/<user_id>` | Get error analysis history |
| GET | `/summary/<user_id>` | Get aggregated error summary |

### Gamification (`/api/gamification`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/games` | List available games |
| POST | `/submit-score` | Submit game score & earn XP |
| GET | `/leaderboard` | Get leaderboard |
| GET | `/profile/<user_id>` | Get gamification profile |

### Mastery (`/api/mastery`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/status/<user_id>` | Get overall mastery status |
| POST | `/update` | Update mastery after activity |
| POST | `/diagnostic` | Submit diagnostic MCQ results |
| GET | `/history/<user_id>/<schema>` | Get mastery trend data |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `FLASK_PORT` | `5000` | Backend server port |
| `FLASK_DEBUG` | `True` | Enable Flask debug mode |
| `FIREBASE_CREDENTIALS_PATH` | `firebase/serviceAccountKey.json` | Path to service account key |
| `CORS_ORIGINS` | `*` | Allowed CORS origins |

## Tech Stack

**Backend**
- Flask 3.0.0
- Flask-CORS 4.0.0
- Firebase Admin SDK 6.2.0
- python-dotenv 1.0.0

**Frontend**
- Vite 5.4
- Firebase Web SDK 10.12
- Phaser 3.60 (game engine)
- Chart.js 4.4 (data visualisation)
