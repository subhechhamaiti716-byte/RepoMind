import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project } from '../types';
import { projectsApi } from '../services/api';
import { useAuth } from './AuthContext';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  setCurrentProject: (project: Project | null) => void;
  refreshProjects: () => Promise<void>;
  selectProjectById: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProjects = async () => {
    if (!user) {
      setProjects([]);
      setCurrentProject(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await projectsApi.list(1, 50);
      const list = res.projects || [];
      setProjects(list);
      if (list.length > 0) {
        if (!currentProject || !list.some(p => p.project_id === currentProject.project_id)) {
          setCurrentProject(list[0]);
        } else {
          const updated = list.find(p => p.project_id === currentProject.project_id);
          if (updated) setCurrentProject(updated);
        }
      } else {
        // Zero projects for this user - explicitly clear currentProject!
        setCurrentProject(null);
      }
    } catch (err) {
      console.error('Failed to load projects', err);
      setProjects([]);
      setCurrentProject(null);
    } finally {
      setIsLoading(false);
    }
  };

  const selectProjectById = async (id: string) => {
    try {
      const proj = await projectsApi.get(id);
      setCurrentProject(proj);
    } catch (err) {
      console.error('Failed to get project', err);
    }
  };

  useEffect(() => {
    if (user) {
      refreshProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
      setIsLoading(false);
    }
  }, [user?.user_id]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        isLoading,
        setCurrentProject,
        refreshProjects,
        selectProjectById,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
