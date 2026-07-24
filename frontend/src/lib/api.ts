const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface ProjectData {
  id: number;
  repo_url: string;
  repo_name: string;
  owner: string;
  framework: string;
  primary_language: string;
  stars: number;
  forks: number;
  issues_count: number;
  recovery_score: number;
  status: string;
  summary?: string;
  updated_at?: string;
  tech_stack?: string[];
  health_metrics?: Record<string, number>;
  architecture?: {
    nodes: Array<{ id: string; label: string; type: string; category: string; details: string }>;
    links: Array<{ source: string; target: string; label: string }>;
  };
  tasks?: Array<{
    id: number;
    week: number;
    title: string;
    description: string;
    priority: string;
    estimated_hours: number;
    difficulty: string;
    target_files: string[];
    dependencies: string[];
    is_completed: boolean;
  }>;
  docs?: Record<string, { id: number; title: string; content: string }>;
  chats?: Array<{ id: number; sender: string; message: string; references: any[]; timestamp: string }>;
}

export async function analyzeRepository(repoUrl: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo_url: repoUrl }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to analyze repository" }));
    throw new Error(err.detail || "Analysis failed");
  }
  return res.json();
}

export async function fetchProjects(): Promise<ProjectData[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects`);
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    console.error("API error fetching projects:", err);
    return [];
  }
}

export async function fetchProjectDetails(id: number): Promise<ProjectData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects/${id}`);
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("API error fetching project details:", err);
    return null;
  }
}

export async function sendRepoChat(projectId: number, prompt: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project_id: projectId, prompt }),
  });
  if (!res.ok) throw new Error("Chat request failed");
  return res.json();
}

export async function toggleTaskStatus(taskId: number): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/toggle`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to toggle task");
  return res.json();
}

export async function fetchHistory(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/history`);
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    return [];
  }
}

export async function fetchUserProfile(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/user`);
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    return null;
  }
}

export async function updateUserSettings(settings: Record<string, any>): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/user/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  return res.json();
}
