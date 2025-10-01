import { create } from 'zustand'
import { Project, Sequence, Feature, Alignment, Bookmark } from '@/types'
import { saveProject, loadProject, listProjects, deleteProject as deleteProjectDB } from '@/utils/db'

interface ProjectState {
  currentProject: Project | null
  projects: Array<{ id: string; name: string; updatedAt: number }>
  selectedSequenceId: string | null
  selectedView: 'linear' | 'plasmid' | 'alignment'
  bookmarks: Bookmark[]
  
  // Actions
  createProject: (name: string, description?: string) => void
  loadProjectById: (id: string) => Promise<void>
  saveCurrentProject: () => Promise<void>
  deleteProject: (id: string) => Promise<void>
  updateProject: (updates: Partial<Project>) => void
  
  addSequence: (sequence: Sequence) => void
  updateSequence: (id: string, updates: Partial<Sequence>) => void
  deleteSequence: (id: string) => void
  selectSequence: (id: string | null) => void
  
  addFeature: (sequenceId: string, feature: Feature) => void
  updateFeature: (sequenceId: string, featureId: string, updates: Partial<Feature>) => void
  deleteFeature: (sequenceId: string, featureId: string) => void
  
  addAlignment: (alignment: Alignment) => void
  deleteAlignment: (id: string) => void
  
  setView: (view: 'linear' | 'plasmid' | 'alignment') => void
  
  addBookmark: (bookmark: Bookmark) => void
  deleteBookmark: (id: string) => void
  
  loadProjectList: () => Promise<void>
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  projects: [],
  selectedSequenceId: null,
  selectedView: 'linear',
  bookmarks: [],

  createProject: (name: string, description?: string) => {
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      description,
      sequences: [],
      alignments: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    set({ currentProject: project })
    get().saveCurrentProject()
  },

  loadProjectById: async (id: string) => {
    const project = await loadProject(id)
    if (project) {
      set({ 
        currentProject: project,
        selectedSequenceId: project.sequences[0]?.id || null,
      })
    }
  },

  saveCurrentProject: async () => {
    const { currentProject } = get()
    if (currentProject) {
      currentProject.updatedAt = Date.now()
      await saveProject(currentProject)
      await get().loadProjectList()
    }
  },

  deleteProject: async (id: string) => {
    await deleteProjectDB(id)
    const { currentProject } = get()
    if (currentProject?.id === id) {
      set({ currentProject: null, selectedSequenceId: null })
    }
    await get().loadProjectList()
  },

  updateProject: (updates: Partial<Project>) => {
    const { currentProject } = get()
    if (currentProject) {
      set({ currentProject: { ...currentProject, ...updates, updatedAt: Date.now() } })
      get().saveCurrentProject()
    }
  },

  addSequence: (sequence: Sequence) => {
    const { currentProject } = get()
    if (currentProject) {
      const updated = {
        ...currentProject,
        sequences: [...currentProject.sequences, sequence],
      }
      set({ currentProject: updated, selectedSequenceId: sequence.id })
      get().saveCurrentProject()
    }
  },

  updateSequence: (id: string, updates: Partial<Sequence>) => {
    const { currentProject } = get()
    if (currentProject) {
      const updated = {
        ...currentProject,
        sequences: currentProject.sequences.map(seq =>
          seq.id === id ? { ...seq, ...updates, updatedAt: Date.now() } : seq
        ),
      }
      set({ currentProject: updated })
      get().saveCurrentProject()
    }
  },

  deleteSequence: (id: string) => {
    const { currentProject, selectedSequenceId } = get()
    if (currentProject) {
      const updated = {
        ...currentProject,
        sequences: currentProject.sequences.filter(seq => seq.id !== id),
      }
      set({ 
        currentProject: updated,
        selectedSequenceId: selectedSequenceId === id ? null : selectedSequenceId,
      })
      get().saveCurrentProject()
    }
  },

  selectSequence: (id: string | null) => {
    set({ selectedSequenceId: id })
  },

  addFeature: (sequenceId: string, feature: Feature) => {
    const { currentProject } = get()
    if (currentProject) {
      const updated = {
        ...currentProject,
        sequences: currentProject.sequences.map(seq =>
          seq.id === sequenceId 
            ? { ...seq, features: [...seq.features, feature], updatedAt: Date.now() }
            : seq
        ),
      }
      set({ currentProject: updated })
      get().saveCurrentProject()
    }
  },

  updateFeature: (sequenceId: string, featureId: string, updates: Partial<Feature>) => {
    const { currentProject } = get()
    if (currentProject) {
      const updated = {
        ...currentProject,
        sequences: currentProject.sequences.map(seq =>
          seq.id === sequenceId
            ? {
                ...seq,
                features: seq.features.map(f => f.id === featureId ? { ...f, ...updates } : f),
                updatedAt: Date.now(),
              }
            : seq
        ),
      }
      set({ currentProject: updated })
      get().saveCurrentProject()
    }
  },

  deleteFeature: (sequenceId: string, featureId: string) => {
    const { currentProject } = get()
    if (currentProject) {
      const updated = {
        ...currentProject,
        sequences: currentProject.sequences.map(seq =>
          seq.id === sequenceId
            ? { ...seq, features: seq.features.filter(f => f.id !== featureId), updatedAt: Date.now() }
            : seq
        ),
      }
      set({ currentProject: updated })
      get().saveCurrentProject()
    }
  },

  addAlignment: (alignment: Alignment) => {
    const { currentProject } = get()
    if (currentProject) {
      const updated = {
        ...currentProject,
        alignments: [...currentProject.alignments, alignment],
      }
      set({ currentProject: updated })
      get().saveCurrentProject()
    }
  },

  deleteAlignment: (id: string) => {
    const { currentProject } = get()
    if (currentProject) {
      const updated = {
        ...currentProject,
        alignments: currentProject.alignments.filter(a => a.id !== id),
      }
      set({ currentProject: updated })
      get().saveCurrentProject()
    }
  },

  setView: (view: 'linear' | 'plasmid' | 'alignment') => {
    set({ selectedView: view })
  },

  addBookmark: (bookmark: Bookmark) => {
    const { bookmarks } = get()
    set({ bookmarks: [...bookmarks, bookmark] })
  },

  deleteBookmark: (id: string) => {
    const { bookmarks } = get()
    set({ bookmarks: bookmarks.filter(b => b.id !== id) })
  },

  loadProjectList: async () => {
    const projects = await listProjects()
    set({ projects })
  },
}))



