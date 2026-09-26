from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, Project, Issue, AuditLog
from backend.schemas import IssueOut, IssueStatusUpdate
from backend.auth import get_current_user

router = APIRouter(tags=["Issues"])

@router.get("/projects/{project_id}/issues")
def get_project_issues(
    project_id: str,
    severity: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.project_id == project_id,
        Project.user_id == current_user.user_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = db.query(Issue).filter(Issue.project_id == project_id)

    if severity and severity.lower() != "all":
        query = query.filter(Issue.severity == severity.lower())
    if category and category.lower() != "all":
        query = query.filter(Issue.category == category.lower())
    if status and status.lower() != "all":
        query = query.filter(Issue.status == status.lower())

    total_records = query.count()
    issues = query.order_by(Issue.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    return {
        "total_records": total_records,
        "total_pages": max(1, (total_records + limit - 1) // limit),
        "current_page": page,
        "limit": limit,
        "issues": issues
    }

@router.get("/issues/{issue_id}", response_model=IssueOut)
def get_single_issue(
    issue_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    issue = db.query(Issue).filter(Issue.issue_id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue

@router.patch("/issues/{issue_id}")
def update_issue_status(
    issue_id: str,
    payload: IssueStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    issue = db.query(Issue).filter(Issue.issue_id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    issue.status = payload.status
    db.commit()

    # Log audit
    audit = AuditLog(
        user_id=current_user.user_id,
        action=f"ISSUE_STATUS_UPDATED_{payload.status.upper()}",
        entity_type="Issue",
        entity_id=issue.issue_id,
        details={"status": payload.status}
    )
    db.add(audit)
    db.commit()

    return {
        "message": "Issue status updated successfully",
        "issue_id": issue.issue_id,
        "status": issue.status
    }
