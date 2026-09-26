import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    user_id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(String(20), default="USER")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    github_accounts = relationship("GitHubAccount", back_populates="user", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")

class GitHubAccount(Base):
    __tablename__ = "github_accounts"

    github_account_id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=False)
    github_user_id = Column(String(100), nullable=False)
    username = Column(String(100), nullable=False)
    access_token = Column(Text, nullable=True)
    token_expires_at = Column(DateTime, nullable=True)
    connected_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="github_accounts")
    projects = relationship("Project", back_populates="github_account")

class Project(Base):
    __tablename__ = "projects"

    project_id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=False)
    github_account_id = Column(String(36), ForeignKey("github_accounts.github_account_id"), nullable=True)
    name = Column(String(150), nullable=False)
    repository_url = Column(Text, nullable=False)
    repository_name = Column(String(150), nullable=True)
    default_branch = Column(String(100), default="main")
    language = Column(String(50), default="TypeScript")
    visibility = Column(String(20), default="public")
    status = Column(String(30), default="active") # active, analyzing, completed, failed, archived
    health_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="projects")
    github_account = relationship("GitHubAccount", back_populates="projects")
    repository = relationship("Repository", back_populates="project", uselist=False, cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="project", cascade="all, delete-orphan")
    files = relationship("File", back_populates="project", cascade="all, delete-orphan")
    issues = relationship("Issue", back_populates="project", cascade="all, delete-orphan")
    dependencies = relationship("Dependency", back_populates="project", cascade="all, delete-orphan")
    health_scores = relationship("HealthScore", back_populates="project", cascade="all, delete-orphan")
    ai_analyses = relationship("AIAnalysis", back_populates="project", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="project", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="project", cascade="all, delete-orphan")

class Repository(Base):
    __tablename__ = "repositories"

    repository_id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.project_id"), nullable=False)
    github_repo_id = Column(String(100), nullable=True)
    full_name = Column(String(200), nullable=False)
    default_branch = Column(String(100), default="main")
    stars = Column(Integer, default=0)
    forks = Column(Integer, default=0)
    open_issues = Column(Integer, default=0)
    last_commit_sha = Column(String(100), nullable=True)
    last_synced_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="repository")

class Analysis(Base):
    __tablename__ = "analyses"

    analysis_id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.project_id"), nullable=False)
    commit_sha = Column(String(100), nullable=True)
    branch = Column(String(100), default="main")
    status = Column(String(30), default="queued") # queued, scanning, parsing, analyzing, ai_processing, completed, failed, cancelled
    progress = Column(Integer, default=0)
    current_stage = Column(String(100), default="Queued")
    health_score = Column(Float, default=0.0)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="analyses")
    files = relationship("File", back_populates="analysis", cascade="all, delete-orphan")
    issues = relationship("Issue", back_populates="analysis", cascade="all, delete-orphan")
    dependencies = relationship("Dependency", back_populates="analysis", cascade="all, delete-orphan")
    health_scores = relationship("HealthScore", back_populates="analysis", cascade="all, delete-orphan")
    ai_analyses = relationship("AIAnalysis", back_populates="analysis", cascade="all, delete-orphan")

class File(Base):
    __tablename__ = "files"

    file_id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.project_id"), nullable=False)
    analysis_id = Column(String(36), ForeignKey("analyses.analysis_id"), nullable=False)
    file_path = Column(Text, nullable=False)
    language = Column(String(50), nullable=True)
    extension = Column(String(20), nullable=True)
    line_count = Column(Integer, default=0)
    file_size = Column(Integer, default=0)
    content_hash = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="files")
    analysis = relationship("Analysis", back_populates="files")
    code_metrics = relationship("CodeMetric", back_populates="file", cascade="all, delete-orphan")
    issues = relationship("Issue", back_populates="file", cascade="all, delete-orphan")

class CodeMetric(Base):
    __tablename__ = "code_metrics"

    metric_id = Column(String(36), primary_key=True, default=generate_uuid)
    file_id = Column(String(36), ForeignKey("files.file_id"), nullable=False)
    analysis_id = Column(String(36), nullable=False)
    cyclomatic_complexity = Column(Float, default=1.0)
    maintainability_index = Column(Float, default=100.0)
    function_count = Column(Integer, default=0)
    class_count = Column(Integer, default=0)
    import_count = Column(Integer, default=0)
    duplicate_ratio = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    file = relationship("File", back_populates="code_metrics")

class Issue(Base):
    __tablename__ = "issues"

    issue_id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.project_id"), nullable=False)
    analysis_id = Column(String(36), ForeignKey("analyses.analysis_id"), nullable=False)
    file_id = Column(String(36), ForeignKey("files.file_id"), nullable=True)
    file_path = Column(Text, nullable=False)
    category = Column(String(30), nullable=False) # security, architecture, code_quality, performance, dependency, bug_risk
    severity = Column(String(20), nullable=False) # critical, high, medium, low, info
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    why_it_matters = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=True)
    line_start = Column(Integer, nullable=True)
    line_end = Column(Integer, nullable=True)
    code_snippet = Column(Text, nullable=True)
    status = Column(String(20), default="open") # open, in_progress, resolved, ignored
    detected_by = Column(String(50), default="RepoMind Engine")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="issues")
    analysis = relationship("Analysis", back_populates="issues")
    file = relationship("File", back_populates="issues")
    security_finding = relationship("SecurityFinding", back_populates="issue", uselist=False, cascade="all, delete-orphan")
    architecture_finding = relationship("ArchitectureFinding", back_populates="issue", uselist=False, cascade="all, delete-orphan")
    fix_suggestions = relationship("FixSuggestion", back_populates="issue", cascade="all, delete-orphan")

class SecurityFinding(Base):
    __tablename__ = "security_findings"

    security_finding_id = Column(String(36), primary_key=True, default=generate_uuid)
    issue_id = Column(String(36), ForeignKey("issues.issue_id"), nullable=False)
    vulnerability_type = Column(String(100), nullable=False)
    cwe_id = Column(String(20), nullable=True)
    confidence = Column(Float, default=1.0)
    remediation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    issue = relationship("Issue", back_populates="security_finding")

class ArchitectureFinding(Base):
    __tablename__ = "architecture_findings"

    architecture_finding_id = Column(String(36), primary_key=True, default=generate_uuid)
    issue_id = Column(String(36), ForeignKey("issues.issue_id"), nullable=False)
    finding_type = Column(String(100), nullable=False) # circular_dependency, high_coupling, layer_violation
    source_module = Column(Text, nullable=True)
    target_module = Column(Text, nullable=True)
    coupling_score = Column(Float, default=0.0)
    recommendation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    issue = relationship("Issue", back_populates="architecture_finding")

class Dependency(Base):
    __tablename__ = "dependencies"

    dependency_id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.project_id"), nullable=False)
    analysis_id = Column(String(36), ForeignKey("analyses.analysis_id"), nullable=False)
    package_name = Column(String(200), nullable=False)
    current_version = Column(String(50), nullable=True)
    package_manager = Column(String(50), default="npm")
    dependency_type = Column(String(30), default="production")
    latest_version = Column(String(50), nullable=True)
    vulnerability_count = Column(Integer, default=0)
    vulnerability_desc = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="dependencies")
    analysis = relationship("Analysis", back_populates="dependencies")

class HealthScore(Base):
    __tablename__ = "health_scores"

    health_id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.project_id"), nullable=False)
    analysis_id = Column(String(36), ForeignKey("analyses.analysis_id"), nullable=False)
    overall_score = Column(Float, nullable=False)
    code_quality_score = Column(Float, default=100.0)
    security_score = Column(Float, default=100.0)
    architecture_score = Column(Float, default=100.0)
    dependency_score = Column(Float, default=100.0)
    performance_score = Column(Float, default=100.0)
    maintainability_score = Column(Float, default=100.0)
    issue_count = Column(Integer, default=0)
    calculated_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="health_scores")
    analysis = relationship("Analysis", back_populates="health_scores")

class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    ai_analysis_id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.project_id"), nullable=False)
    analysis_id = Column(String(36), ForeignKey("analyses.analysis_id"), nullable=False)
    provider = Column(String(50), default="Gemini/Rule-Engine")
    model_name = Column(String(100), default="gemini-1.5-pro")
    analysis_type = Column(String(50), default="full")
    prompt_version = Column(String(30), default="v1")
    summary = Column(Text, nullable=True)
    recommendations = Column(JSON, nullable=True)
    token_usage = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="ai_analyses")
    analysis = relationship("Analysis", back_populates="ai_analyses")

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    session_id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=False)
    project_id = Column(String(36), ForeignKey("projects.project_id"), nullable=False)
    title = Column(String(200), default="Codebase Discussion")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="chat_sessions")
    project = relationship("Project", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    message_id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("chat_sessions.session_id"), nullable=False)
    role = Column(String(20), nullable=False) # user, assistant
    content = Column(Text, nullable=False)
    sources = Column(JSON, nullable=True)
    model_name = Column(String(100), default="gemini-1.5-pro")
    token_usage = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")

class FixSuggestion(Base):
    __tablename__ = "fix_suggestions"

    fix_id = Column(String(36), primary_key=True, default=generate_uuid)
    issue_id = Column(String(36), ForeignKey("issues.issue_id"), nullable=False)
    file_id = Column(String(36), nullable=True)
    file_path = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    original_code = Column(Text, nullable=False)
    suggested_code = Column(Text, nullable=False)
    patch_data = Column(Text, nullable=True)
    risk_level = Column(String(20), default="low") # low, medium, high
    status = Column(String(20), default="suggested") # suggested, accepted, rejected, applied
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)

    issue = relationship("Issue", back_populates="fix_suggestions")

class Report(Base):
    __tablename__ = "reports"

    report_id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.project_id"), nullable=False)
    analysis_id = Column(String(36), nullable=True)
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=False)
    report_type = Column(String(30), default="full")
    format = Column(String(20), default="pdf")
    content = Column(JSON, nullable=True)
    file_path = Column(Text, nullable=True)
    status = Column(String(20), default="ready")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reports")
    project = relationship("Project", back_populates="reports")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    audit_id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=False)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(String(36), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
