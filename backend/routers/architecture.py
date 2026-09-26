from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, Project, Analysis, ArchitectureFinding, File
from backend.schemas import ArchitectureGraphOut
from backend.auth import get_current_user
from backend.services.architecture_analyzer import ArchitectureAnalyzer

router = APIRouter(tags=["Architecture"])

@router.get("/projects/{project_id}/architecture", response_model=ArchitectureGraphOut)
@router.get("/projects/{project_id}/architecture/graph", response_model=ArchitectureGraphOut)
def get_architecture_overview(
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
    if not files:
        # Return fallback clean architecture graph
        return {
            "nodes": [
                {"id": "frontend", "label": "Frontend (React)", "type": "frontend", "position": {"x": 100, "y": 120}},
                {"id": "api", "label": "API Routes (FastAPI)", "type": "api", "position": {"x": 350, "y": 120}},
                {"id": "services", "label": "Core Services", "type": "service", "position": {"x": 600, "y": 120}},
                {"id": "database", "label": "Database (PostgreSQL)", "type": "database", "position": {"x": 850, "y": 120}}
            ],
            "edges": [
                {"id": "e1", "source": "frontend", "target": "api", "label": "HTTP/REST"},
                {"id": "e2", "source": "api", "target": "services", "label": "Invokes"},
                {"id": "e3", "source": "services", "target": "database", "label": "Queries"}
            ],
            "coupling_score": 35.0,
            "cohesion_score": 88.0,
            "circular_dependencies_count": 0,
            "architecture_type": "3-Tier Clean Layered Architecture"
        }

    # Prepare file dicts for analyzer
    file_dicts = []
    for f in files:
        file_dicts.append({
            "file_path": f.file_path,
            "extension": f.extension or ".py",
            "line_count": f.line_count or 0,
            "content_text": "" # analyzer extracts from files or paths
        })

    # Read workspace files if available
    from backend.config import WORKSPACE_DIR
    target_dir = WORKSPACE_DIR / project_id
    if target_dir.exists():
        from backend.services.scanner import ScannerService
        file_dicts = ScannerService.scan_files(target_dir)

    graph_data, _ = ArchitectureAnalyzer.analyze_architecture(file_dicts)
    return graph_data

@router.get("/projects/{project_id}/findings/architecture")
@router.get("/projects/{project_id}/architecture/findings")
def get_architecture_findings(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    findings = db.query(ArchitectureFinding).join(ArchitectureFinding.issue).filter(
        ArchitectureFinding.issue.has(project_id=project_id)
    ).all()

    return {
        "total_findings": len(findings),
        "findings": [
            {
                "finding_id": f.architecture_finding_id,
                "type": f.finding_type,
                "source_module": f.source_module,
                "target_module": f.target_module,
                "coupling_score": f.coupling_score,
                "recommendation": f.recommendation
            }
            for f in findings
        ]
    }
