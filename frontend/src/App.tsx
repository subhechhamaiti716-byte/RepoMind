import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { Layout } from './components/Layout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { AddProjectPage } from './pages/AddProjectPage';
import { AnalysisProgressPage } from './pages/AnalysisProgressPage';
import { HealthDashboardPage } from './pages/HealthDashboardPage';
import { IssuesPage } from './pages/IssuesPage';
import { IssueDetailPage } from './pages/IssueDetailPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { AIChatPage } from './pages/AIChatPage';
import { FixCenterPage } from './pages/FixCenterPage';
import { ReportsPage } from './pages/ReportsPage';
import { SecurityPage } from './pages/SecurityPage';
import { DependenciesPage } from './pages/DependenciesPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProjectProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />

            {/* Authenticated Application Layout */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/add-project" element={<AddProjectPage />} />
              <Route path="/analysis-progress" element={<AnalysisProgressPage />} />
              <Route path="/health" element={<HealthDashboardPage />} />
              <Route path="/issues" element={<IssuesPage />} />
              <Route path="/issues/:issueId" element={<IssueDetailPage />} />
              <Route path="/architecture" element={<ArchitecturePage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/dependencies" element={<DependenciesPage />} />
              <Route path="/chat" element={<AIChatPage />} />
              <Route path="/fix-center" element={<FixCenterPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ProjectProvider>
    </AuthProvider>
  );
};

export default App;
