import { create } from 'zustand'

type Project = {
  id: number
  name: string
  description: string
  status: 'active' | 'inactive'
  lastDeploy: string
}

type ProjectStore = {
  projects: Project[]
  addProject: (project: Omit<Project, 'id' | 'lastDeploy'>) => void
  removeProject: (id: number) => void
  updateProject: (id: number, updates: Partial<Project>) => void
  getActiveProjects: () => Project[]
  getProjectById: (id: number) => Project | undefined
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [
    { id: 1, name: "E-commerce Platform", description: "Full-featured online store", status: "active", lastDeploy: "2 hours ago" },
    { id: 2, name: "Admin Dashboard", description: "Analytics and management panel", status: "active", lastDeploy: "1 day ago" },
    { id: 3, name: "Mobile App API", description: "Backend API for mobile application", status: "inactive", lastDeploy: "1 week ago" },
  ],

  addProject: (project) => {
    const newProject: Project = {
      ...project,
      id: Date.now(),
      lastDeploy: "Just now",
    }
    set((state) => ({
      projects: [...state.projects, newProject]
    }))
  },

  removeProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id)
    }))
  },

  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id ? { ...project, ...updates } : project
      )
    }))
  },

  getActiveProjects: () => {
    return get().projects.filter(project => project.status === 'active')
  },

  getProjectById: (id) => {
    return get().projects.find(project => project.id === id)
  },
}))