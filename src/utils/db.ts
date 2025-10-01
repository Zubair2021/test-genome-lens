import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Project } from '@/types'

interface GenomeLensDB extends DBSchema {
  projects: {
    key: string
    value: Project
    indexes: { 'by-updated': number }
  }
}

let dbInstance: IDBPDatabase<GenomeLensDB> | null = null

async function getDB() {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<GenomeLensDB>('genomelens-db', 1, {
    upgrade(db) {
      const projectStore = db.createObjectStore('projects', { keyPath: 'id' })
      projectStore.createIndex('by-updated', 'updatedAt')
    },
  })

  return dbInstance
}

export async function saveProject(project: Project): Promise<void> {
  const db = await getDB()
  await db.put('projects', project)
}

export async function loadProject(id: string): Promise<Project | undefined> {
  const db = await getDB()
  return db.get('projects', id)
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('projects', id)
}

export async function listProjects(): Promise<Array<{ id: string; name: string; updatedAt: number }>> {
  const db = await getDB()
  const projects = await db.getAllFromIndex('projects', 'by-updated')
  return projects
    .map(p => ({ id: p.id, name: p.name, updatedAt: p.updatedAt }))
    .sort((a, b) => b.updatedAt - a.updatedAt)
}



