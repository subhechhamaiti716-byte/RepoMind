from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# ----------------- Auth Schemas -----------------
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    expires_in: int = 3600
    user_id: str
    name: str
    email: str

class UserProfile(BaseModel):
    user_id: str
    name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- GitHub Schemas -----------------
class GitHubAccountOut(BaseModel):
    github_account_id: str
    github_user_id: str
    username: str
    connected_at: datetime

    class Config:
        from_attributes = True

# ----------------- Project Schemas -----------------
class ProjectCreate(BaseModel):
    name: Optional[str] = None
    repository_url: str
    branch: Optional[str] = "main"

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    default_branch: Optional[str] = None

class ProjectOut(BaseModel):
    project_id: str
    name: str
    repository_url: str
    language: Optional[str] = "TypeScript"
    default_branch: Optional[str] = "main"
    status: str
    health_score: float
    last_analysis: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Analysis Schemas -----------------
class AnalysisCreate(BaseModel):
    branch: Optional[str] = "main"
    analysis_types: Optional[List[str]] = ["code_quality", "security", "architecture", "dependencies"]

class AnalysisStatusOut(BaseModel):
    analysis_id: str
    project_id: str
    status: str
    progress: int
    current_stage: str
    health_score: Optional[float] = 0.0
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ----------------- File & Metric Schemas -----------------
class FileOut(BaseModel):
    file_id: str
    file_path: str
    language: Optional[str]
    line_count: int
    file_size: int

    class Config:
        from_attributes = True

class CodeMetricsSummary(BaseModel):
    total_files: int
    total_lines: int
    functions: int
    classes: int
    average_complexity: float
    maintainability_index: float
    duplicate_ratio: float

# ----------------- Issue Schemas -----------------
class IssueOut(BaseModel):
    issue_id: str
    project_id: str
    analysis_id: str
    file_id: Optional[str] = None
    file_path: str
    category: str
    severity: str
    title: str
    description: Optional[str] = None
    why_it_matters: Optional[str] = None
    recommendation: Optional[str] = None
    line_start: Optional[int] = None
    line_end: Optional[int] = None
    code_snippet: Optional[str] = None
    status: str
    detected_by: Optional[str] = "RepoMind Engine"
    created_at: datetime

    class Config:
        from_attributes = True

class IssueStatusUpdate(BaseModel):
    status: str

# ----------------- Security Findings -----------------
class SecurityFindingOut(BaseModel):
    security_finding_id: str
    issue_id: str
    vulnerability_type: str
    cwe_id: Optional[str] = None
    confidence: float
    remediation: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- Architecture Schemas -----------------
class GraphNode(BaseModel):
    id: str
    label: str
    type: str # frontend, api, service, database, util
    details: Optional[Dict[str, Any]] = None

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    is_circular: Optional[bool] = False

class ArchitectureGraphOut(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    coupling_score: float
    cohesion_score: float
    circular_dependencies_count: int
    architecture_type: str

class ArchitectureFindingOut(BaseModel):
    architecture_finding_id: str
    issue_id: str
    finding_type: str
    source_module: Optional[str]
    target_module: Optional[str]
    coupling_score: float
    recommendation: Optional[str]

    class Config:
        from_attributes = True

# ----------------- Dependency Schemas -----------------
class DependencyOut(BaseModel):
    dependency_id: str
    package_name: str
    current_version: Optional[str]
    package_manager: str
    dependency_type: str
    latest_version: Optional[str]
    vulnerability_count: int
    vulnerability_desc: Optional[str]

    class Config:
        from_attributes = True

# ----------------- Health Score Schemas -----------------
class HealthScoreOut(BaseModel):
    overall_score: float
    code_quality_score: float
    security_score: float
    architecture_score: float
    dependency_score: float
    performance_score: float
    maintainability_score: float
    issue_count: int
    calculated_at: datetime

    class Config:
        from_attributes = True

class HealthHistoryItem(BaseModel):
    analysis_id: str
    date: str
    score: float

# ----------------- AI Chat Schemas -----------------
class ChatSessionCreate(BaseModel):
    title: Optional[str] = "Codebase Discussion"

class ChatSessionOut(BaseModel):
    session_id: str
    title: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatMessageCreate(BaseModel):
    message: str

class ChatMessageOut(BaseModel):
    message_id: str
    role: str
    content: str
    sources: Optional[List[Dict[str, Any]]] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Fix Suggestion Schemas -----------------
class FixSuggestionCreate(BaseModel):
    mode: Optional[str] = "suggest"

class FixSuggestionOut(BaseModel):
    fix_id: str
    issue_id: str
    file_path: str
    description: str
    original_code: str
    suggested_code: str
    patch_data: Optional[str] = None
    risk_level: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Reports Schemas -----------------
class ReportCreate(BaseModel):
    analysis_id: Optional[str] = None
    report_type: Optional[str] = "full"
    format: Optional[str] = "pdf"

class ReportOut(BaseModel):
    report_id: str
    project_id: str
    report_type: str
    format: str
    status: str
    content: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Analytics Schemas -----------------
class AnalyticsSummary(BaseModel):
    health_score: float
    total_files: int
    total_lines: int
    total_issues: int
    critical_issues: int
    high_issues: int
    medium_issues: int
    low_issues: int
    security_issues: int
    architecture_issues: int
    code_quality_issues: int
    dependencies_count: int
