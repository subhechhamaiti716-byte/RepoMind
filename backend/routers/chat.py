from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, Project, ChatSession, ChatMessage, File, Issue
from backend.schemas import ChatSessionCreate, ChatSessionOut, ChatMessageCreate, ChatMessageOut
from backend.auth import get_current_user
from backend.services.ai_service import AIService
from backend.services.architecture_analyzer import ArchitectureAnalyzer
from backend.config import WORKSPACE_DIR
from backend.services.scanner import ScannerService

router = APIRouter(tags=["AI Codebase Chat"])

@router.post("/projects/{project_id}/chat", response_model=dict)
@router.post("/projects/{project_id}/chat/sessions", response_model=dict)
def create_chat_session(
    project_id: str,
    payload: ChatSessionCreate = ChatSessionCreate(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.project_id == project_id,
        Project.user_id == current_user.user_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    session = ChatSession(
        user_id=current_user.user_id,
        project_id=project_id,
        title=payload.title or "Codebase Discussion"
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Add initial welcoming assistant message
    welcome_msg = ChatMessage(
        session_id=session.session_id,
        role="assistant",
        content=(
            f"Hello! I am your **RepoMind AI Doctor & Architecture Assistant** for `{project.name}`.\n\n"
            "Ask me anything about this repository, such as:\n"
            "- *How is authentication implemented in this project?*\n"
            "- *Where are the security vulnerabilities and how do I fix them?*\n"
            "- *Why is there architectural coupling between services?*\n"
            "- *Can you provide a refactoring roadmap for our codebase?*"
        ),
        sources=[{"file": "Architecture Overview", "lines": "1-100"}]
    )
    db.add(welcome_msg)
    db.commit()

    return {
        "session_id": session.session_id,
        "title": session.title,
        "created_at": session.created_at
    }

@router.get("/projects/{project_id}/chat/sessions")
def get_chat_sessions(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(ChatSession).filter(
        ChatSession.project_id == project_id,
        ChatSession.user_id == current_user.user_id
    ).order_by(ChatSession.created_at.desc()).all()

    return {
        "sessions": [
            {
                "session_id": s.session_id,
                "title": s.title,
                "created_at": s.created_at
            }
            for s in sessions
        ]
    }

@router.get("/chat/sessions/{session_id}/messages")
@router.get("/projects/{project_id}/chat/{session_id}/messages")
def get_chat_messages(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc()).all()
    return {
        "messages": [
            {
                "message_id": m.message_id,
                "role": m.role,
                "content": m.content,
                "sources": m.sources,
                "created_at": m.created_at
            }
            for m in messages
        ]
    }

@router.post("/chat/sessions/{session_id}/messages", response_model=ChatMessageOut)
@router.post("/projects/{project_id}/chat/{session_id}/messages", response_model=ChatMessageOut)
def send_chat_message(
    session_id: str,
    payload: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    # Save user message
    user_msg = ChatMessage(
        session_id=session_id,
        role="user",
        content=payload.message
    )
    db.add(user_msg)
    db.commit()

    # Retrieve context from project files and issues
    target_dir = WORKSPACE_DIR / session.project_id
    files = []
    if target_dir.exists():
        files = ScannerService.scan_files(target_dir)

    issues = [
        {
            "title": i.title,
            "category": i.category,
            "severity": i.severity,
            "file_path": i.file_path,
            "line_start": i.line_start
        }
        for i in db.query(Issue).filter(Issue.project_id == session.project_id).all()
    ]

    arch_data, _ = ArchitectureAnalyzer.analyze_architecture(files)

    # Generate AI response with RAG
    ai_resp = AIService.chat_with_codebase(
        question=payload.message,
        files=files,
        issues=issues,
        arch_info=arch_data
    )

    assistant_msg = ChatMessage(
        session_id=session_id,
        role="assistant",
        content=ai_resp["content"],
        sources=ai_resp.get("sources"),
        model_name=ai_resp.get("model", "gemini-1.5-pro")
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return assistant_msg
