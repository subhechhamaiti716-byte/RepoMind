import os
import asyncio
from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config import settings, BASE_DIR
from backend.database import engine, Base
from backend.models import User, Analysis

# Import routers
from backend.routers import (
    auth, users, github, projects, analysis,
    issues, architecture, chat, fixes, health,
    analytics, reports
)

# Initialize Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RepoMind API",
    description="AI-Powered Codebase Analysis and Architecture Assistant API",
    version="1.0.0"
)

# Enable CORS for all local development ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers under /api/v1 and root for maximum flexibility
api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_prefix)
app.include_router(users.router, prefix=api_prefix)
app.include_router(github.router, prefix=api_prefix)
app.include_router(projects.router, prefix=api_prefix)
app.include_router(analysis.router, prefix=api_prefix)
app.include_router(issues.router, prefix=api_prefix)
app.include_router(architecture.router, prefix=api_prefix)
app.include_router(chat.router, prefix=api_prefix)
app.include_router(fixes.router, prefix=api_prefix)
app.include_router(health.router, prefix=api_prefix)
app.include_router(analytics.router, prefix=api_prefix)
app.include_router(reports.router, prefix=api_prefix)

# Also mount under root / for direct paths if requested
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(github.router)
app.include_router(projects.router)
app.include_router(analysis.router)
app.include_router(issues.router)
app.include_router(architecture.router)
app.include_router(chat.router)
app.include_router(fixes.router)
app.include_router(health.router)
app.include_router(analytics.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {
        "app": "RepoMind API",
        "version": "1.0.0",
        "status": "online",
        "documentation": "/docs",
        "student": "Subhechha Maiti (Roll: 251810700219)"
    }

# ----------------- Real-time WebSocket Service -----------------
@app.websocket("/ws/analysis/{analysis_id}")
@app.websocket("/ws/projects/{project_id}/analysis")
async def websocket_analysis_progress(websocket: WebSocket, analysis_id: str = None, project_id: str = None):
    await websocket.accept()
    try:
        while True:
            db = SessionLocal()
            try:
                target_analysis = None
                if analysis_id:
                    target_analysis = db.query(Analysis).filter(Analysis.analysis_id == analysis_id).first()
                elif project_id:
                    target_analysis = db.query(Analysis).filter(Analysis.project_id == project_id).order_by(Analysis.created_at.desc()).first()

                if target_analysis:
                    await websocket.send_json({
                        "event": "ANALYSIS_PROGRESS",
                        "analysis_id": target_analysis.analysis_id,
                        "status": target_analysis.status,
                        "progress": target_analysis.progress,
                        "current_stage": target_analysis.current_stage,
                        "health_score": target_analysis.health_score or 0.0
                    })
                    if target_analysis.status in ("completed", "failed", "cancelled"):
                        break
            finally:
                db.close()
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        pass
    except Exception:
        pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
