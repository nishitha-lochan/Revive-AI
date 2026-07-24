import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import init_db
from api.routes import router

app = FastAPI(
    title="Revive AI Backend API",
    description="Multi-Agent AI Codebase Analysis & Recovery SaaS API",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "Revive AI Backend Engine",
        "tagline": "Bringing Dead Repositories Back To Life",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "fastapi-revive-ai"}

app.include_router(router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
