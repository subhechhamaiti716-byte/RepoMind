import time
from datetime import datetime
from typing import Dict, List, Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query, status
from sqlalchemy.orm import Session
from backend.config import settings, WORKSPACE_DIR, SAMPLE_REPOS_DIR
from backend.database import get_db, SessionLocal
from backend.models import (
    User, Project, Analysis, File, CodeMetric, Issue, SecurityFinding,
    ArchitectureFinding, Dependency, HealthScore, AIAnalysis, FixSuggestion, AuditLog
)
from backend.schemas import AnalysisCreate, AnalysisStatusOut, CodeMetricsSummary
from backend.auth import get_current_user
from backend.services.scanner import ScannerService
from backend.services.analyzer import CodeAnalyzer
from backend.services.security_scanner import SecurityScanner
from backend.services.dependency_scanner import DependencyScanner
from backend.services.architecture_analyzer import ArchitectureAnalyzer
from backend.services.ai_service import AIService

router = APIRouter(tags=["Analysis Engine"])

def run_analysis_pipeline_sync(analysis_id: str, project_id: str, repo_url: str):
    db: Session = SessionLocal()
    try:
        analysis = db.query(Analysis).filter(Analysis.analysis_id == analysis_id).first()
        project = db.query(Project).filter(Project.project_id == project_id).first()
        if not analysis or not project:
            return

        # Stage 1: Workspace setup & scanning
        analysis.status = "scanning"
        analysis.progress = 15
        analysis.current_stage = "Scanning repository files"
        db.commit()

        target_dir = ScannerService.prepare_workspace(project_id, repo_url, WORKSPACE_DIR, SAMPLE_REPOS_DIR)
        scanned_files = ScannerService.scan_files(target_dir)
        primary_lang = ScannerService.detect_primary_language(scanned_files)
        project.language = primary_lang
        db.commit()

        # Save files to database
        db.query(File).filter(File.project_id == project_id).delete()
        file_entities = {}
        for f in scanned_files:
            file_obj = File(
                project_id=project_id,
                analysis_id=analysis_id,
                file_path=f["file_path"],
                language=f["language"],
                extension=f["extension"],
                line_count=f["line_count"],
                file_size=f["file_size"],
                content_hash=f["content_hash"]
            )
            db.add(file_obj)
            db.flush()
            file_entities[f["file_path"]] = file_obj

        # Stage 2: Code Quality Analysis (AST)
        analysis.status = "analyzing"
        analysis.progress = 35
        analysis.current_stage = "Static code & AST complexity analysis"
        db.commit()

        total_lines = sum(f["line_count"] for f in scanned_files)
        total_functions = 0
        total_classes = 0
        total_complexity = 0
        total_mi = 0
        quality_issues = []

        for f in scanned_files:
            metrics, issues = CodeAnalyzer.analyze_file(f)
            total_functions += metrics["function_count"]
            total_classes += metrics["class_count"]
            total_complexity += metrics["cyclomatic_complexity"]
            total_mi += metrics["maintainability_index"]
            quality_issues.extend(issues)

            if f["file_path"] in file_entities:
                file_rec = file_entities[f["file_path"]]
                metric_rec = CodeMetric(
                    file_id=file_rec.file_id,
                    analysis_id=analysis_id,
                    cyclomatic_complexity=metrics["cyclomatic_complexity"],
                    maintainability_index=metrics["maintainability_index"],
                    function_count=metrics["function_count"],
                    class_count=metrics["class_count"],
                    import_count=metrics["import_count"]
                )
                db.add(metric_rec)

        # Stage 3: Security Scan
        analysis.progress = 55
        analysis.current_stage = "Scanning for secrets & vulnerabilities"
        db.commit()

        security_issues = []
        for f in scanned_files:
            sec_finds = SecurityScanner.scan_file(f)
            security_issues.extend(sec_finds)

        # Stage 4: Dependency Analysis
        analysis.progress = 70
        analysis.current_stage = "Auditing dependencies and supply chain"
        db.commit()

        deps, dep_issues = DependencyScanner.scan_dependencies(scanned_files)
        db.query(Dependency).filter(Dependency.project_id == project_id).delete()
        for d in deps:
            dep_rec = Dependency(
                project_id=project_id,
                analysis_id=analysis_id,
                package_name=d["package_name"],
                current_version=d["current_version"],
                package_manager=d["package_manager"],
                dependency_type=d["dependency_type"],
                latest_version=d["latest_version"],
                vulnerability_count=d["vulnerability_count"],
                vulnerability_desc=d["vulnerability_desc"]
            )
            db.add(dep_rec)

        # Stage 5: Architecture Analysis
        analysis.progress = 85
        analysis.current_stage = "Constructing dependency graph & cycle detection"
        db.commit()

        arch_data, arch_issues = ArchitectureAnalyzer.analyze_architecture(scanned_files)

        # Combine all detected issues
        all_raw_issues = quality_issues + security_issues + dep_issues + arch_issues
        db.query(Issue).filter(Issue.project_id == project_id).delete()

        created_issues = []
        for raw in all_raw_issues:
            file_id = None
            if raw.get("file_path") and raw["file_path"] in file_entities:
                file_id = file_entities[raw["file_path"]].file_id

            issue_obj = Issue(
                project_id=project_id,
                analysis_id=analysis_id,
                file_id=file_id,
                file_path=raw.get("file_path", "root"),
                category=raw.get("category", "code_quality"),
                severity=raw.get("severity", "medium"),
                title=raw.get("title", "Issue"),
                description=raw.get("description", ""),
                why_it_matters=raw.get("why_it_matters", ""),
                recommendation=raw.get("recommendation", ""),
                line_start=raw.get("line_start", 1),
                line_end=raw.get("line_end", 1),
                code_snippet=raw.get("code_snippet", ""),
                status="open",
                detected_by=raw.get("detected_by", "RepoMind Engine")
            )
            db.add(issue_obj)
            db.flush()
            created_issues.append(issue_obj)

            # Link SecurityFinding if present
            if "security_meta" in raw:
                sm = raw["security_meta"]
                sec_finding = SecurityFinding(
                    issue_id=issue_obj.issue_id,
                    vulnerability_type=sm.get("vulnerability_type", "vulnerability"),
                    cwe_id=sm.get("cwe_id"),
                    confidence=sm.get("confidence", 0.95),
                    remediation=sm.get("remediation")
                )
                db.add(sec_finding)

            # Link ArchitectureFinding if present
            if "arch_meta" in raw:
                am = raw["arch_meta"]
                arch_finding = ArchitectureFinding(
                    issue_id=issue_obj.issue_id,
                    finding_type=am.get("finding_type", "architecture"),
                    source_module=am.get("source_module"),
                    target_module=am.get("target_module"),
                    coupling_score=am.get("coupling_score", 50.0),
                    recommendation=am.get("recommendation")
                )
                db.add(arch_finding)

            # Generate proactive AI fix suggestion
            fix_payload = AIService.generate_fix(raw)
            fix_obj = FixSuggestion(
                issue_id=issue_obj.issue_id,
                file_id=file_id,
                file_path=raw.get("file_path", "root"),
                description=fix_payload["description"],
                original_code=fix_payload["original_code"],
                suggested_code=fix_payload["suggested_code"],
                patch_data=fix_payload.get("patch_data"),
                risk_level=fix_payload.get("risk_level", "low"),
                status="suggested"
            )
            db.add(fix_obj)

        # Stage 6: AI Diagnosis & Health Scoring
        analysis.progress = 95
        analysis.current_stage = "Synthesizing AI diagnosis & health score"
        db.commit()

        ai_summary = AIService.generate_analysis_summary(project.name, all_raw_issues, arch_data)
        ai_analysis_rec = AIAnalysis(
            project_id=project_id,
            analysis_id=analysis_id,
            provider=ai_summary.get("provider", "RepoMind AI"),
            model_name="gemini-1.5-pro",
            analysis_type="full",
            summary=ai_summary.get("summary", ""),
            recommendations=ai_summary.get("recommendations", [])
        )
        db.add(ai_analysis_rec)

        # Calculate balanced scores
        crit_count = sum(1 for i in all_raw_issues if i.get("severity") == "critical")
        high_count = sum(1 for i in all_raw_issues if i.get("severity") == "high")
        med_count = sum(1 for i in all_raw_issues if i.get("severity") == "medium")
        low_count = sum(1 for i in all_raw_issues if i.get("severity") == "low")

        sec_score = max(20.0, 100.0 - (crit_count * 25.0) - (high_count * 10.0))
        arch_score = max(30.0, arch_data.get("cohesion_score", 80.0))
        cq_score = max(40.0, 100.0 - (med_count * 4.0) - (low_count * 2.0))
        dep_score = max(35.0, 100.0 - (sum(d.get("vulnerability_count", 0) for d in deps) * 20.0))
        maint_score = round(total_mi / max(len(scanned_files), 1), 1)
        perf_score = 85.0

        overall_score = round((sec_score * 0.3) + (arch_score * 0.25) + (cq_score * 0.2) + (dep_score * 0.15) + (maint_score * 0.1), 1)

        health_rec = HealthScore(
            project_id=project_id,
            analysis_id=analysis_id,
            overall_score=overall_score,
            code_quality_score=round(cq_score, 1),
            security_score=round(sec_score, 1),
            architecture_score=round(arch_score, 1),
            dependency_score=round(dep_score, 1),
            performance_score=perf_score,
            maintainability_score=maint_score,
            issue_count=len(all_raw_issues)
        )
        db.add(health_rec)

        # Update Project & Analysis final state
        project.health_score = overall_score
        project.status = "completed"

        analysis.status = "completed"
        analysis.progress = 100
        analysis.current_stage = "Analysis completed"
        analysis.health_score = overall_score
        analysis.completed_at = datetime.utcnow()

        db.commit()

    except Exception as e:
        db.rollback()
        analysis = db.query(Analysis).filter(Analysis.analysis_id == analysis_id).first()
        if analysis:
            analysis.status = "failed"
            analysis.error_message = str(e)
            db.commit()
    finally:
        db.close()

@router.post("/projects/{project_id}/analyses", response_model=dict, status_code=status.HTTP_202_ACCEPTED)
@router.post("/projects/{project_id}/analysis", response_model=dict, status_code=status.HTTP_202_ACCEPTED)
def start_analysis(
    project_id: str,
    payload: AnalysisCreate = AnalysisCreate(),
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.project_id == project_id,
        Project.user_id == current_user.user_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Create Analysis record
    analysis = Analysis(
        project_id=project_id,
        branch=payload.branch or project.default_branch or "main",
        status="queued",
        progress=5,
        current_stage="Initiating analysis pipeline",
        started_at=datetime.utcnow()
    )
    db.add(analysis)
    project.status = "analyzing"
    db.commit()
    db.refresh(analysis)

    # Trigger background pipeline execution
    if background_tasks is not None:
        background_tasks.add_task(
            run_analysis_pipeline_sync,
            analysis.analysis_id,
            project.project_id,
            project.repository_url
        )
    else:
        run_analysis_pipeline_sync(
            analysis.analysis_id,
            project.project_id,
            project.repository_url
        )

    return {
        "analysis_id": analysis.analysis_id,
        "status": "queued",
        "message": "Repository analysis started"
    }

@router.get("/analyses/{analysis_id}", response_model=AnalysisStatusOut)
@router.get("/analysis/{analysis_id}/status", response_model=AnalysisStatusOut)
def get_analysis_status(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(Analysis).filter(Analysis.analysis_id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis

@router.post("/analysis/{analysis_id}/cancel")
def cancel_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(Analysis).filter(Analysis.analysis_id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    analysis.status = "cancelled"
    db.commit()
    return {"message": "Analysis cancelled successfully"}

@router.get("/projects/{project_id}/analyses")
def get_analysis_history(
    project_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Analysis).filter(Analysis.project_id == project_id)
    total = query.count()
    analyses = query.order_by(Analysis.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    return {
        "total_records": total,
        "total_pages": max(1, (total + limit - 1) // limit),
        "current_page": page,
        "analyses": [
            {
                "analysis_id": a.analysis_id,
                "commit_sha": a.commit_sha or "a82f91e",
                "status": a.status,
                "health_score": a.health_score or 0.0,
                "created_at": a.created_at
            }
            for a in analyses
        ]
    }

@router.get("/analyses/{analysis_id}/metrics", response_model=CodeMetricsSummary)
def get_metrics_summary(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    files = db.query(File).filter(File.analysis_id == analysis_id).all()
    metrics = db.query(CodeMetric).filter(CodeMetric.analysis_id == analysis_id).all()

    total_files = len(files)
    total_lines = sum(f.line_count for f in files)
    functions = sum(m.function_count for m in metrics)
    classes = sum(m.class_count for m in metrics)
    avg_complexity = round(sum(m.cyclomatic_complexity for m in metrics) / max(len(metrics), 1), 1) if metrics else 1.0
    maintainability = round(sum(m.maintainability_index for m in metrics) / max(len(metrics), 1), 1) if metrics else 85.0

    return {
        "total_files": total_files,
        "total_lines": total_lines,
        "functions": functions,
        "classes": classes,
        "average_complexity": avg_complexity,
        "maintainability_index": maintainability,
        "duplicate_ratio": 2.4
    }
