from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, Issue, FixSuggestion, AuditLog
from backend.schemas import FixSuggestionCreate, FixSuggestionOut
from backend.auth import get_current_user
from backend.services.ai_service import AIService

router = APIRouter(tags=["AI Fix Suggestions"])

@router.post("/issues/{issue_id}/fix", response_model=FixSuggestionOut)
@router.post("/ai/fix", response_model=FixSuggestionOut)
def generate_fix_for_issue(
    issue_id: str,
    payload: FixSuggestionCreate = FixSuggestionCreate(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    issue = db.query(Issue).filter(Issue.issue_id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    existing_fix = db.query(FixSuggestion).filter(FixSuggestion.issue_id == issue_id).first()
    if existing_fix:
        return existing_fix

    fix_payload = AIService.generate_fix({
        "title": issue.title,
        "category": issue.category,
        "file_path": issue.file_path,
        "code_snippet": issue.code_snippet,
        "severity": issue.severity
    })

    fix = FixSuggestion(
        issue_id=issue.issue_id,
        file_id=issue.file_id,
        file_path=issue.file_path,
        description=fix_payload["description"],
        original_code=fix_payload["original_code"],
        suggested_code=fix_payload["suggested_code"],
        patch_data=fix_payload.get("patch_data"),
        risk_level=fix_payload.get("risk_level", "low"),
        status="suggested"
    )
    db.add(fix)
    db.commit()
    db.refresh(fix)

    return fix

@router.get("/fixes/{fix_id}", response_model=FixSuggestionOut)
def get_fix_details(
    fix_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fix = db.query(FixSuggestion).filter(FixSuggestion.fix_id == fix_id).first()
    if not fix:
        raise HTTPException(status_code=404, detail="Fix not found")
    return fix

@router.post("/fixes/{fix_id}/accept")
def accept_fix(
    fix_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fix = db.query(FixSuggestion).filter(FixSuggestion.fix_id == fix_id).first()
    if not fix:
        raise HTTPException(status_code=404, detail="Fix not found")

    fix.status = "accepted"
    fix.reviewed_at = datetime.utcnow()

    # Mark parent issue as resolved
    new_health = None
    issue = db.query(Issue).filter(Issue.issue_id == fix.issue_id).first()
    if issue:
        issue.status = "resolved"

        # Apply code patch to disk if workspace file exists
        from backend.config import WORKSPACE_DIR
        try:
            target_file = WORKSPACE_DIR / issue.project_id / fix.file_path
            if target_file.exists() and fix.suggested_code:
                content = target_file.read_text(encoding="utf-8", errors="ignore")
                if fix.original_code and fix.original_code in content:
                    content = content.replace(fix.original_code, fix.suggested_code)
                    target_file.write_text(content, encoding="utf-8")
        except Exception:
            pass

        # Recalculate health score for the project
        from backend.models import Project, HealthScore
        project = db.query(Project).filter(Project.project_id == issue.project_id).first()
        if project:
            all_issues = db.query(Issue).filter(Issue.project_id == project.project_id).all()
            open_issues = [i for i in all_issues if i.status == "open"]
            crit_count = sum(1 for i in open_issues if i.severity == "critical")
            high_count = sum(1 for i in open_issues if i.severity == "high")
            med_count = sum(1 for i in open_issues if i.severity == "medium")
            low_count = sum(1 for i in open_issues if i.severity == "low")

            sec_score = max(20.0, 100.0 - (crit_count * 25.0) - (high_count * 10.0))
            cq_score = max(40.0, 100.0 - (med_count * 4.0) - (low_count * 2.0))
            resolved_count = sum(1 for i in all_issues if i.status == "resolved")
            resolution_bonus = (resolved_count / max(len(all_issues), 1)) * 20.0

            calculated = round(min(100.0, max(project.health_score or 70.0, (sec_score * 0.4) + (cq_score * 0.4) + resolution_bonus + 10.0)), 1)
            project.health_score = calculated
            new_health = calculated

            health_rec = db.query(HealthScore).filter(HealthScore.project_id == project.project_id).order_by(HealthScore.calculated_at.desc()).first()
            if health_rec:
                health_rec.overall_score = calculated
                health_rec.issue_count = len(open_issues)

    audit = AuditLog(
        user_id=current_user.user_id,
        action="FIX_ACCEPTED",
        entity_type="FixSuggestion",
        entity_id=fix.fix_id,
        details={"file_path": fix.file_path, "issue_id": fix.issue_id}
    )
    db.add(audit)
    db.commit()

    return {
        "message": "Fix accepted and applied successfully. Issue marked as resolved.",
        "fix_id": fix.fix_id,
        "status": "accepted",
        "new_health_score": new_health
    }

@router.post("/fixes/{fix_id}/reject")
def reject_fix(
    fix_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fix = db.query(FixSuggestion).filter(FixSuggestion.fix_id == fix_id).first()
    if not fix:
        raise HTTPException(status_code=404, detail="Fix not found")

    fix.status = "rejected"
    fix.reviewed_at = datetime.utcnow()
    db.commit()

    return {
        "message": "Fix marked as rejected",
        "fix_id": fix.fix_id,
        "status": "rejected"
    }

@router.get("/projects/{project_id}/fixes")
def get_project_fixes(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fixes = db.query(FixSuggestion).join(Issue, FixSuggestion.issue_id == Issue.issue_id).filter(
        Issue.project_id == project_id
    ).all()
    return {"fixes": fixes}
