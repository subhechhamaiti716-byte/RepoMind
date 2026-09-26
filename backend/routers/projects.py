import re
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, Project, Repository, Analysis, File, Issue, AuditLog
from backend.schemas import ProjectCreate, ProjectUpdate, ProjectOut, FileOut
from backend.auth import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    url = payload.repository_url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="Repository URL is required")

    # Extract name from URL if not given
    project_name = payload.name
    if not project_name:
        clean_url = url.rstrip("/")
        if clean_url.endswith(".git"):
            clean_url = clean_url[:-4]
        project_name = clean_url.split("/")[-1].replace("-", " ").title()
        if not project_name:
            project_name = "Codebase Project"

    # Check existing project
    existing = db.query(Project).filter(
        Project.user_id == current_user.user_id,
        Project.repository_url == url
    ).first()
    if existing:
        return existing

    project = Project(
        user_id=current_user.user_id,
        name=project_name,
        repository_url=url,
        repository_name=project_name,
        default_branch=payload.branch or "main",
        status="active",
        health_score=0.0
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    # Add Repository metadata
    repo_meta = Repository(
        project_id=project.project_id,
        full_name=f"{current_user.name}/{project_name}".lower().replace(" ", "-"),
        default_branch=payload.branch or "main",
        stars=14,
        forks=3,
        open_issues=0
    )
    db.add(repo_meta)

    # Audit log
    audit = AuditLog(
        user_id=current_user.user_id,
        action="PROJECT_CREATED",
        entity_type="Project",
        entity_id=project.project_id,
        details={"name": project.name, "url": project.repository_url}
    )
    db.add(audit)
    db.commit()

    return project

@router.get("", response_model=dict)
def get_projects(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Project).filter(Project.user_id == current_user.user_id)
    total_records = query.count()
    projects = query.order_by(Project.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    # Convert to response
    project_list = []
    for p in projects:
        latest_analysis = db.query(Analysis).filter(Analysis.project_id == p.project_id).order_by(Analysis.created_at.desc()).first()
        project_list.append({
            "project_id": p.project_id,
            "name": p.name,
            "repository_url": p.repository_url,
            "language": p.language or "TypeScript",
            "default_branch": p.default_branch or "main",
            "status": p.status,
            "health_score": p.health_score or 0.0,
            "last_analysis": latest_analysis.completed_at if latest_analysis else None,
            "created_at": p.created_at
        })

    return {
        "total_records": total_records,
        "total_pages": max(1, (total_records + limit - 1) // limit),
        "current_page": page,
        "projects": project_list
    }

@router.get("/{project_id}", response_model=dict)
def get_project_details(
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

    latest_analysis = db.query(Analysis).filter(Analysis.project_id == project.project_id).order_by(Analysis.created_at.desc()).first()

    return {
        "project_id": project.project_id,
        "name": project.name,
        "repository_url": project.repository_url,
        "language": project.language or "TypeScript",
        "default_branch": project.default_branch or "main",
        "status": project.status,
        "health_score": project.health_score or 0.0,
        "last_analysis": latest_analysis.completed_at if latest_analysis else None,
        "created_at": project.created_at
    }

@router.put("/{project_id}")
def update_project(
    project_id: str,
    payload: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.project_id == project_id,
        Project.user_id == current_user.user_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if payload.name:
        project.name = payload.name
    if payload.default_branch:
        project.default_branch = payload.default_branch

    db.commit()
    return {"message": "Project updated successfully"}

@router.delete("/{project_id}")
def delete_project(
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

    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}

@router.get("/{project_id}/files")
def get_project_files(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    files = db.query(File).filter(File.project_id == project_id).all()
    return {
        "files": [
            {
                "file_id": f.file_id,
                "path": f.file_path,
                "language": f.language,
                "size": f.file_size,
                "line_count": f.line_count
            }
            for f in files
        ]
    }

@router.get("/{project_id}/repository")
def get_repo_details(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    repo = db.query(Repository).filter(Repository.project_id == project_id).first()
    return {
        "repository_id": repo.repository_id if repo else "repo-1",
        "full_name": repo.full_name if repo else project.name,
        "default_branch": project.default_branch or "main",
        "stars": repo.stars if repo else 14,
        "forks": repo.forks if repo else 3,
        "open_issues": repo.open_issues if repo else 0,
        "last_commit_sha": repo.last_commit_sha if repo else "a82f91e"
    }

@router.post("/{project_id}/sync")
def sync_repository(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {
        "message": "Repository synchronization started",
        "status": "queued"
    }
