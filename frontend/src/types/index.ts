export interface User {
  user_id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  name: string;
  email: string;
}

export interface Project {
  project_id: string;
  name: string;
  repository_url: string;
  language?: string;
  default_branch?: string;
  status: 'active' | 'analyzing' | 'completed' | 'failed' | 'archived';
  health_score: number;
  last_analysis?: string;
  created_at: string;
}

export interface Analysis {
  analysis_id: string;
  project_id: string;
  status: 'queued' | 'scanning' | 'parsing' | 'analyzing' | 'ai_processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  current_stage: string;
  health_score?: number;
  started_at?: string;
  completed_at?: string;
}

export interface Issue {
  issue_id: string;
  project_id: string;
  analysis_id: string;
  file_id?: string;
  file_path: string;
  category: 'security' | 'architecture' | 'code_quality' | 'performance' | 'dependency' | 'bug_risk';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description?: string;
  why_it_matters?: string;
  recommendation?: string;
  line_start?: number;
  line_end?: number;
  code_snippet?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'ignored';
  detected_by?: string;
  created_at: string;
}

export interface SecurityFinding {
  issue_id: string;
  vulnerability_type: string;
  severity: string;
  file_path: string;
  line?: number;
  description?: string;
  confidence?: number;
}

export interface Dependency {
  dependency_id: string;
  package_name: string;
  current_version?: string;
  latest_version?: string;
  package_manager: string;
  dependency_type: string;
  vulnerability_count: number;
  vulnerability_desc?: string;
}

export interface ArchitectureNode {
  id: string;
  label: string;
  type: string; // frontend, api, service, database, util
  position: { x: number; y: number };
  details?: {
    filePath?: string;
    loc?: number;
    inDegree?: number;
    outDegree?: number;
    isCircular?: boolean;
  };
}

export interface ArchitectureEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  is_circular?: boolean;
}

export interface ArchitectureGraph {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  coupling_score: number;
  cohesion_score: number;
  circular_dependencies_count: number;
  architecture_type: string;
  findings?: Array<{
    finding_type: string;
    source_module?: string;
    target_module?: string;
    coupling_score: number;
    recommendation?: string;
  }>;
}

export interface HealthScore {
  overall_score: number;
  code_quality_score: number;
  security_score: number;
  architecture_score: number;
  dependency_score: number;
  performance_score: number;
  maintainability_score: number;
  issue_count: number;
  calculated_at: string;
}

export interface ChatMessage {
  message_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ file: string; lines: string }>;
  created_at: string;
}

export interface ChatSession {
  session_id: string;
  title: string;
  created_at: string;
}

export interface FixSuggestion {
  fix_id: string;
  issue_id: string;
  file_path: string;
  description: string;
  original_code: string;
  suggested_code: string;
  patch_data?: string;
  risk_level: 'low' | 'medium' | 'high';
  status: 'suggested' | 'accepted' | 'rejected' | 'applied';
  created_at: string;
}

export interface AnalyticsSummary {
  health_score: number;
  total_files: number;
  total_lines: number;
  total_issues: number;
  critical_issues: number;
  high_issues: number;
  medium_issues: number;
  low_issues: number;
  security_issues: number;
  architecture_issues: number;
  code_quality_issues: number;
  dependencies_count: number;
}
