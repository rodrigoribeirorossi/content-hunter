import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.api.routes import trends, scripts

load_dotenv()

app = FastAPI(
    title="Content Hunter API",
    description="Analyze trending topics and generate AI-powered video scripts.",
    version="1.0.0",
)

# CORS — allow requests from the local frontend dev server
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(trends.router, prefix="/api/trends", tags=["trends"])
app.include_router(scripts.router, prefix="/api/scripts", tags=["scripts"])


@app.on_event("startup")
async def startup_event():
    """Initialize the database on first run."""
    init_db()


@app.get("/health", tags=["health"])
async def health_check():
    """Simple health-check endpoint."""
    return {"status": "ok", "service": "content-hunter"}
