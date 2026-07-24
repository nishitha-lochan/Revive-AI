import { create } from 'zustand';
import { ProjectData } from '@/lib/api';

interface ReviveState {
  projects: ProjectData[];
  currentProject: ProjectData | null;
  isAnalyzing: boolean;
  analysisStep: number;
  analysisStatusText: string;
  openaiKey: string;
  githubToken: string;
  
  setProjects: (projects: ProjectData[]) => void;
  setCurrentProject: (project: ProjectData | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisStep: (step: number, text: string) => void;
  setApiKeys: (openaiKey: string, githubToken: string) => void;
}

export const useReviveStore = create<ReviveState>((set) => ({
  projects: [],
  currentProject: null,
  isAnalyzing: false,
  analysisStep: 0,
  analysisStatusText: 'Initializing Analysis...',
  openaiKey: '',
  githubToken: '',

  setProjects: (projects) => set({ projects }),
  setCurrentProject: (currentProject) => set({ currentProject }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setAnalysisStep: (analysisStep, analysisStatusText) => set({ analysisStep, analysisStatusText }),
  setApiKeys: (openaiKey, githubToken) => set({ openaiKey, githubToken }),
}));
