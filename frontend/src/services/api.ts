import axios from 'axios';
import {
  AuthResponse,
  Project,
  Analysis,
  Issue,
  ArchitectureGraph,
  HealthScore,
  ChatMessage,
  ChatSession,
  FixSuggestion,
  AnalyticsSummary,
  Dependency,
  SecurityFinding
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/v1`
  : '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('repomind_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for 401 fallback
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Allow demo mode seamless continuation
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem('repomind_token', data.access_token);
    return data;
  },
  register: async (name: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  },
  verify: async () => {
    const { data } = await api.get('/auth/verify');
    return data;
  },
  logout: () => {
    localStorage.removeItem('repomind_token');
  },
};

export const githubApi = {
  connect: async () => {
    const { data } = await api.get('/github/connect');
    return data;
  },
  getAccount: async () => {
    const { data } = await api.get('/github/account');
    return data;
  },
  getRepositories: async () => {
    const { data } = await api.get('/github/repositories');
    return data.repositories;
  },
};

export const projectsApi = {
  list: async (page = 1, limit = 20) => {
    const { data } = await api.get<{ total_records: number; projects: Project[] }>(`/projects?page=${page}&limit=${limit}`);
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get<Project>(`/projects/${id}`);
    return data;
  },
  create: async (repository_url: string, name?: string, branch?: string) => {
    const { data } = await api.post<Project>('/projects', { repository_url, name, branch });
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/projects/${id}`);
    return data;
  },
  getFiles: async (projectId: string) => {
    const { data } = await api.get(`/projects/${projectId}/files`);
    return data.files;
  },
};

export const analysisApi = {
  start: async (projectId: string, branch = 'main') => {
    const { data } = await api.post<{ analysis_id: string; status: string }>(`/projects/${projectId}/analyses`, { branch });
    return data;
  },
  getStatus: async (analysisId: string) => {
    const { data } = await api.get<Analysis>(`/analyses/${analysisId}`);
    return data;
  },
  cancel: async (analysisId: string) => {
    const { data } = await api.post(`/analysis/${analysisId}/cancel`);
    return data;
  },
  getHistory: async (projectId: string) => {
    const { data } = await api.get(`/projects/${projectId}/analyses`);
    return data.analyses;
  },
  getMetrics: async (analysisId: string) => {
    const { data } = await api.get(`/analyses/${analysisId}/metrics`);
    return data;
  },
};

export const issuesApi = {
  list: async (projectId: string, filters?: { severity?: string; category?: string; status?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const { data } = await api.get<{ total_records: number; issues: Issue[] }>(`/projects/${projectId}/issues?${params.toString()}`);
    return data;
  },
  get: async (issueId: string) => {
    const { data } = await api.get<Issue>(`/issues/${issueId}`);
    return data;
  },
  updateStatus: async (issueId: string, status: string) => {
    const { data } = await api.patch(`/issues/${issueId}`, { status });
    return data;
  },
};

export const architectureApi = {
  getGraph: async (projectId: string) => {
    const { data } = await api.get<ArchitectureGraph>(`/projects/${projectId}/architecture/graph`);
    return data;
  },
  getFindings: async (projectId: string) => {
    const { data } = await api.get(`/projects/${projectId}/architecture/findings`);
    return data.findings;
  },
};

export const chatApi = {
  createSession: async (projectId: string, title?: string) => {
    const { data } = await api.post<{ session_id: string; title: string }>(`/projects/${projectId}/chat/sessions`, { title });
    return data;
  },
  getSessions: async (projectId: string) => {
    const { data } = await api.get<{ sessions: ChatSession[] }>(`/projects/${projectId}/chat/sessions`);
    return data.sessions;
  },
  getMessages: async (sessionId: string) => {
    const { data } = await api.get<{ messages: ChatMessage[] }>(`/chat/sessions/${sessionId}/messages`);
    return data.messages;
  },
  sendMessage: async (sessionId: string, message: string) => {
    const { data } = await api.post<ChatMessage>(`/chat/sessions/${sessionId}/messages`, { message });
    return data;
  },
};

export const fixesApi = {
  generate: async (issueId: string) => {
    const { data } = await api.post<FixSuggestion>(`/issues/${issueId}/fix`, { mode: 'suggest' });
    return data;
  },
  get: async (fixId: string) => {
    const { data } = await api.get<FixSuggestion>(`/fixes/${fixId}`);
    return data;
  },
  accept: async (fixId: string) => {
    const { data } = await api.post(`/fixes/${fixId}/accept`);
    return data;
  },
  reject: async (fixId: string) => {
    const { data } = await api.post(`/fixes/${fixId}/reject`);
    return data;
  },
  listByProject: async (projectId: string) => {
    const { data } = await api.get<{ fixes: FixSuggestion[] }>(`/projects/${projectId}/fixes`);
    return data.fixes;
  },
};

export const healthApi = {
  get: async (projectId: string) => {
    const { data } = await api.get<HealthScore>(`/projects/${projectId}/health`);
    return data;
  },
  getHistory: async (projectId: string) => {
    const { data } = await api.get<{ history: Array<{ analysis_id: string; score: number; date: string }> }>(`/projects/${projectId}/health/history`);
    return data.history;
  },
};

export const analyticsApi = {
  getSummary: async (projectId: string) => {
    const { data } = await api.get<AnalyticsSummary>(`/projects/${projectId}/analytics/summary`);
    return data;
  },
  getTrend: async (projectId: string) => {
    const { data } = await api.get(`/projects/${projectId}/analytics/issue-trend`);
    return data.trend;
  },
  getCategoryBreakdown: async (projectId: string) => {
    const { data } = await api.get(`/projects/${projectId}/analytics/category-breakdown`);
    return data;
  },
  getDependencies: async (projectId: string) => {
    const { data } = await api.get<{ total_records: number; dependencies: Dependency[] }>(`/projects/${projectId}/dependencies`);
    return data.dependencies;
  },
  getSecurityFindings: async (projectId: string) => {
    const { data } = await api.get<{ total_findings: number; critical: number; high: number; medium: number; findings: SecurityFinding[] }>(`/projects/${projectId}/security/findings`);
    return data;
  },
};

export const reportsApi = {
  generate: async (projectId: string, format = 'pdf') => {
    const { data } = await api.post<{ report_id: string; status: string }>(`/projects/${projectId}/reports`, { format });
    return data;
  },
  get: async (reportId: string) => {
    const { data } = await api.get(`/reports/${reportId}`);
    return data;
  },
  downloadUrl: (reportId: string, format = 'markdown') => {
    return `/api/v1/reports/${reportId}/download?format=${format}`;
  },
  list: async (projectId: string) => {
    const { data } = await api.get(`/projects/${projectId}/reports`);
    return data.reports;
  },
};

export default api;
