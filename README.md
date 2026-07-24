# Revive AI 🚀

> **Bring Dead Projects Back To Life**

Revive AI is a full-stack AI SaaS that analyzes abandoned GitHub repositories, calculates a recovery score, generates a 4-week roadmap, explains architecture, and enables codebase chat — powered by a LangGraph multi-agent pipeline.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, TailwindCSS, Framer Motion, Zustand |
| Backend | FastAPI, Python 3.8+, SQLAlchemy |
| AI Pipeline | LangGraph multi-agent workflow, OpenAI GPT-4o (optional) |
| Database | SQLite (local, zero-config) / PostgreSQL (production) |
| Deployment | Vercel (frontend) / Railway or Render (backend) |

---

## ⚡ Quick Start (Local)

### 🚀 1-Click Startup (Windows)
Double-click `run.bat` or execute in command prompt:
```cmd
run.bat
```
This automatically launches both the **FastAPI Backend (Port 8000)** and **Next.js Frontend (Port 3000)** in separate terminal windows.

---

### Manual Setup


```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server (auto-creates SQLite DB, no config needed)
python main.py
```

Backend will be live at: **http://localhost:8000**  
Swagger API docs: **http://localhost:8000/docs**

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will be live at: **http://localhost:3000**

---

## 🔑 Environment Variables (Optional)

Create a `.env` file in `backend/`:

```env
# Optional: Enable live GPT-4o LLM reasoning
OPENAI_API_KEY=sk-...

# Optional: Access private repos / bypass GitHub rate limits
GITHUB_TOKEN=ghp_...

# Optional: Use PostgreSQL instead of SQLite
DATABASE_URL=postgresql://user:pass@localhost:5432/revive_db
```

> **Zero-Config Mode**: Without any API keys, Revive AI uses intelligent heuristic agents and local code analysis to deliver full repository analysis, roadmaps, architecture graphs, and documentation generation.

---

## 🤖 AI Pipeline

```
User pastes GitHub URL
        ↓
Manager Agent (LangGraph Orchestrator)
        ↓
  ┌─────────────────────────────────────────┐
  │  Reader Agent      → Parse file tree    │
  │  Code Health Agent → Calculate scores   │
  │  Architecture Agent→ Build DAG graph    │
  │  Roadmap Agent     → 4-week task plan   │
  │  Doc Agent         → Generate docs      │
  └─────────────────────────────────────────┘
        ↓
Saved to SQLite/PostgreSQL
        ↓
Recovery Workspace displayed in dashboard
```

---

## 📁 Folder Structure

```
Revive AI/
├── frontend/               # Next.js 15 App
│   └── src/
│       ├── app/            # Pages: /, /dashboard, /projects/[id], /history, /settings
│       ├── components/     # AuroraBackground, Navbar, Sidebar, RecoveryScoreGauge, etc.
│       ├── lib/            # api.ts (HTTP client)
│       └── store/          # Zustand global state
│
├── backend/                # FastAPI App
│   ├── main.py             # Entry point
│   ├── api/routes.py       # All REST endpoints
│   ├── agents/             # LangGraph multi-agents
│   │   ├── manager.py      # Orchestrator
│   │   ├── reader_agent.py
│   │   ├── code_health_agent.py
│   │   ├── architecture_agent.py
│   │   ├── roadmap_agent.py
│   │   └── doc_agent.py
│   ├── database/           # SQLAlchemy models & DB setup
│   ├── services/           # repo_service.py, ai_service.py, vector_service.py
│   └── tests/              # pytest test suite (5/5 passing)
│
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml
└── README.md
```

---

## 🐳 Docker (Full Stack)

```bash
# Copy and fill env vars
cp backend/.env.example backend/.env

# Build and run all services
docker-compose up --build
```

---

## 🌐 Deployment

### Frontend → Vercel
1. Import repo on Vercel
2. Set Root Directory: `frontend`
3. Add env var: `NEXT_PUBLIC_API_URL=https://your-backend.railway.app`

### Backend → Railway
1. Connect repo on Railway
2. Set Root Directory: `backend`
3. Add `DATABASE_URL` and optionally `OPENAI_API_KEY`

---

## ✅ Test Suite

```bash
cd backend
python -m pytest tests/   # 5/5 passing
```
