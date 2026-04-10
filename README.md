# 🎯 Content Hunter

A local-first tool that helps content creators grow their channels by automatically collecting trending topics from **YouTube Shorts**, **TikTok**, and **Instagram Reels**, then using a **local AI (Ollama)** to generate video ideas, titles, hooks, and full scripts — all without paying for cloud APIs.

---

## ✨ Features

- 📡 **Trend Collection** — YouTube (yt-dlp), Google Trends (pytrends), TikTok (Playwright)
- 🤖 **AI Script Generation** — Powered by Ollama running locally (Llama 3, Mistral, etc.)
- 📊 **Trend Dashboard** — Visual charts, platform filtering, score-based ranking
- ✍️ **Script Studio** — Generate hooks, full scripts, thumbnail text, and hashtags in one click
- 💾 **Script Library** — Save and revisit your best content ideas
- ⏰ **Auto-Collection** — Celery + Redis scheduler runs every 6 hours
- 🌙 **Dark Mode UI** — Built with Chakra UI v3

---

## 🏗 Architecture

```
content-hunter/
├── backend/                  # Python + FastAPI
│   ├── app/
│   │   ├── main.py           # FastAPI entry point
│   │   ├── database.py       # SQLAlchemy + SQLite
│   │   ├── models/           # ORM models (Trend, Script)
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── collectors/       # Data collectors (YouTube, TikTok, Google)
│   │   ├── ai/               # Ollama integration (analyzer + generator)
│   │   ├── api/routes/       # REST endpoints
│   │   └── scheduler.py      # Celery periodic tasks
│   └── alembic/              # DB migrations
│
└── frontend/                 # React + TypeScript + Chakra UI v3
    └── src/
        ├── pages/            # Dashboard, ScriptStudio, SavedContent
        ├── components/       # Layout, TrendCard, TrendChart, ScriptCard
        └── api/              # Axios API client
```

---

## 🛠 Prerequisites

| Tool | Version | Install |
|---|---|---|
| Python | 3.11+ | [python.org](https://python.org) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Ollama | latest | [ollama.com](https://ollama.com) |
| Redis | 7+ | Optional — only needed for auto-scheduler |

---

## 🚀 Setup

### 1. Clone the repository

```bash
git clone https://github.com/rodrigoribeirorossi/content-hunter.git
cd content-hunter
```

### 2. Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers (for TikTok scraper)
playwright install chromium

# Copy the environment file
cp .env.example .env
# Edit .env and add your YOUTUBE_API_KEY (optional for enhanced results)

# Start the API server
uvicorn app.main:app --reload
```

The API will be available at **http://localhost:8000**.  
Interactive docs: **http://localhost:8000/docs**

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at **http://localhost:5173**.

### 4. Ollama (local AI)

```bash
# Install Ollama from https://ollama.com

# Start the Ollama server
ollama serve

# Pull the default model
ollama pull llama3
```

Set `OLLAMA_BASE_URL=http://localhost:11434` and `OLLAMA_MODEL=llama3` in `backend/.env`.

---

## 🔑 Getting a YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services → Library**
4. Search for **YouTube Data API v3** and enable it
5. Go to **APIs & Services → Credentials → Create Credentials → API Key**
6. Copy the key and paste it into `backend/.env` as `YOUTUBE_API_KEY`

> **Note:** The free quota is 10,000 units/day. The collector uses yt-dlp as the primary method, so the API key is optional but improves result quality.

---

## ⏰ Auto-Scheduler (Optional)

Requires **Redis** running locally.

```bash
# Start Redis (Docker)
docker run -d -p 6379:6379 redis:7-alpine

# Start Celery worker
cd backend
celery -A app.scheduler worker --loglevel=info

# Start Celery beat (scheduler)
celery -A app.scheduler beat --loglevel=info
```

The scheduler will collect trends automatically every **6 hours**.

---

## 🐳 Docker (All-in-one)

```bash
docker compose up --build
```

Services started:
- `backend` → http://localhost:8000
- `frontend` → http://localhost:5173
- `redis` — message broker
- `worker` — Celery worker
- `beat` — Celery scheduler

### Switching to PostgreSQL

1. Uncomment the `db` service in `docker-compose.yml`
2. Change `DATABASE_URL` in the environment to:
   ```
   DATABASE_URL=postgresql://postgres:postgres@db:5432/content_hunter
   ```
3. Run `docker compose up --build`

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/trends/` | List trends (filter: `?platform=youtube`) |
| `POST` | `/api/trends/collect` | Trigger manual collection |
| `GET` | `/api/scripts/` | List scripts (filter: `?saved_only=true`) |
| `POST` | `/api/scripts/generate` | Generate AI script |
| `PATCH` | `/api/scripts/{id}/save` | Toggle save flag |

Full interactive docs: **http://localhost:8000/docs**

---

## 🗺 Roadmap

- [ ] PostgreSQL multi-user support
- [ ] Export scripts to PDF
- [ ] Instagram Reels scraper
- [ ] Schedule-based publishing suggestions
- [ ] Multi-language script generation
- [ ] Score history & trend analytics
- [ ] Browser extension for quick script generation

---

## 📄 License

MIT — use it, modify it, ship it.
