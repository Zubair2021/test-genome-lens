import { useState } from 'react'
import { FileUp, Plus, FolderOpen } from 'lucide-react'
import Button from './ui/Button'
import Input from './ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { useProjectStore } from '@/stores/projectStore'
import { parseFASTA, parseGenBank } from '@/utils/parsers'
import { Sequence } from '@/types'

interface WelcomeScreenProps {
  onStart: () => void
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [showNewProject, setShowNewProject] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const { createProject, addSequence, loadProjectList, projects, loadProjectById } = useProjectStore()

  useState(() => {
    loadProjectList()
  })

  const handleCreateProject = () => {
    if (projectName.trim()) {
      createProject(projectName, projectDescription || undefined)
      onStart()
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const content = await file.text()
    let sequences: Sequence[] = []

    if (file.name.endsWith('.fasta') || file.name.endsWith('.fa') || file.name.endsWith('.fna')) {
      const result = parseFASTA(content)
      sequences = result.sequences
    } else if (file.name.endsWith('.gb') || file.name.endsWith('.gbk')) {
      const result = parseGenBank(content)
      sequences = result.sequences
    }

    if (sequences.length > 0) {
      const name = file.name.replace(/\.[^/.]+$/, '')
      createProject(name, `Imported from ${file.name}`)
      sequences.forEach(seq => addSequence(seq))
      onStart()
    }
  }

  const handleLoadProject = async (projectId: string) => {
    await loadProjectById(projectId)
    onStart()
  }

  if (showNewProject) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Sequence Project"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <Input
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Project description..."
              />
            </div>
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleCreateProject} className="flex-1">
                Create Project
              </Button>
              <Button variant="ghost" onClick={() => setShowNewProject(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl w-full p-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            Genome<span className="text-primary-600">Lens</span>
          </h1>
          <p className="text-xl text-gray-600">
            Fast, elegant sequence viewing and analysis
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowNewProject(true)}>
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">New Project</h3>
              <p className="text-sm text-gray-600">
                Start a new sequence analysis project
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6 text-center">
              <label className="cursor-pointer">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Import File</h3>
                <p className="text-sm text-gray-600">
                  Load FASTA, GenBank, or other formats
                </p>
                <input
                  type="file"
                  className="hidden"
                  accept=".fasta,.fa,.fna,.gb,.gbk"
                  onChange={handleFileUpload}
                />
              </label>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow opacity-50">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Open Recent</h3>
              <p className="text-sm text-gray-600">
                Continue working on existing projects
              </p>
            </CardContent>
          </Card>
        </div>

        {projects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {projects.slice(0, 5).map(project => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md cursor-pointer"
                    onClick={() => handleLoadProject(project.id)}
                  >
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Open
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}




