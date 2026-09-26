from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, Project, File, Issue, Dependency, HealthScore
from backend.schemas import AnalyticsSummary
from backend.auth import get_current_user

router = APIRouter(tags=["Analytics"])

@router.get("/projects/{project_id}/analytics/summary", response_model=AnalyticsSummary)
def get_analytics_summary(
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

    files = db.query(File).filter(File.project_id == project_id).all()
    issues = db.query(Issue).filter(Issue.project_id == project_id).all()
    deps = db.query(Dependency).filter(Dependency.project_id == project_id).all()
    health = db.query(HealthScore).filter(HealthScore.project_id == project_id).order_by(HealthScore.calculated_at.desc()).first()

    total_files = len(files)
    total_lines = sum(f.line_count for f in files)
    total_issues = len(issues)

    return {
        "health_score": health.overall_score if health else (project.health_score or 0.0),
        "total_files": total_files,
        "total_lines": total_lines,
        "total_issues": total_issues,
        "critical_issues": sum(1 for i in issues if i.severity == "critical"),
        "high_issues": sum(1 for i in issues if i.severity == "high"),
        "medium_issues": sum(1 for i in issues if i.severity == "medium"),
        "low_issues": sum(1 for i in issues if i.severity == "low"),
        "security_issues": sum(1 for i in issues if i.category == "security"),
        "architecture_issues": sum(1 for i in issues if i.category == "architecture"),
        "code_quality_issues": sum(1 for i in issues if i.category == "code_quality"),
        "dependencies_count": len(deps)
    }

@router.get("/projects/{project_id}/analytics/issue-trend")
def get_issue_trend(
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

    issues = db.query(Issue).filter(Issue.project_id == project_id).all()
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    return {
        "trend": [
            {
                "date": today_str,
                "critical": sum(1 for i in issues if i.severity == "critical"),
                "high": sum(1 for i in issues if i.severity == "high"),
                "medium": sum(1 for i in issues if i.severity == "medium"),
                "low": sum(1 for i in issues if i.severity == "low")
            }
        ]
    }

@router.get("/projects/{project_id}/analytics/category-breakdown")
def get_category_breakdown(
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

    issues = db.query(Issue).filter(Issue.project_id == project_id).all()
    categories = {}
    for i in issues:
        cat = i.category
        categories[cat] = categories.get(cat, 0) + 1

    return {
        "security": categories.get("security", 0),
        "architecture": categories.get("architecture", 0),
        "code_quality": categories.get("code_quality", 0),
        "performance": categories.get("performance", 0),
        "dependency": categories.get("dependency", 0)
    }

@router.get("/projects/{project_id}/dependencies")
def get_project_dependencies(
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

    deps = db.query(Dependency).filter(Dependency.project_id == project_id).all()
    return {
        "total_records": len(deps),
        "dependencies": [
            {
                "dependency_id": d.dependency_id,
                "package_name": d.package_name,
                "current_version": d.current_version,
                "latest_version": d.latest_version,
                "package_manager": d.package_manager,
                "dependency_type": d.dependency_type,
                "vulnerability_count": d.vulnerability_count,
                "vulnerability_desc": d.vulnerability_desc
            }
            for d in deps
        ]
    }

@router.get("/projects/{project_id}/security/findings")
def get_security_findings(
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

    issues = db.query(Issue).filter(
        Issue.project_id == project_id,
        Issue.category == "security"
    ).all()

    return {
        "total_findings": len(issues),
        "critical": sum(1 for i in issues if i.severity == "critical"),
        "high": sum(1 for i in issues if i.severity == "high"),
        "medium": sum(1 for i in issues if i.severity == "medium"),
        "findings": [
            {
                "issue_id": i.issue_id,
                "vulnerability_type": i.title,
                "severity": i.severity,
                "file_path": i.file_path,
                "line": i.line_start,
                "description": i.description,
                "status": i.status,
                "confidence": 0.96
            }
            for i in issues
        ]
    }
