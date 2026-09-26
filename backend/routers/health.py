from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, Project, HealthScore
from backend.schemas import HealthScoreOut, HealthHistoryItem
from backend.auth import get_current_user

router = APIRouter(tags=["Health Score"])

@router.get("/projects/{project_id}/health", response_model=HealthScoreOut)
def get_project_health(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.project_id == project_id,
        Project.user_id == current_user.user_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    health = db.query(HealthScore).filter(
        HealthScore.project_id == project_id
    ).order_by(HealthScore.calculated_at.desc()).first()

    if not health:
        return {
            "overall_score": project.health_score or 0.0,
            "code_quality_score": 0.0,
            "security_score": 0.0,
            "architecture_score": 0.0,
            "dependency_score": 0.0,
            "performance_score": 0.0,
            "maintainability_score": 0.0,
            "issue_count": 0,
            "calculated_at": project.created_at
        }
    return health

@router.get("/projects/{project_id}/health/history")
def get_health_history(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.project_id == project_id,
        Project.user_id == current_user.user_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    history_records = db.query(HealthScore).filter(
        HealthScore.project_id == project_id
    ).order_by(HealthScore.calculated_at.asc()).all()

    if not history_records:
        return {"history": []}

    return {
        "history": [
            {
                "analysis_id": h.analysis_id,
                "score": h.overall_score,
                "date": h.calculated_at.strftime("%Y-%m-%d")
            }
            for h in history_records
        ]
    }
