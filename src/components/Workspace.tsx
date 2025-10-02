import { useState } from 'react'
import { Menu, ChevronRight, ChevronLeft } from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import Sidebar from './Sidebar'
import LinearViewer from './viewers/LinearViewer'
import PlasmidViewer from './viewers/PlasmidViewer'
import AlignmentViewer from './viewers/AlignmentViewer'
import Inspector from './Inspector'
import Toolbar from './Toolbar'

export default function Workspace() {
  const [showSidebar, setShowSidebar] = useState(true)
  const [showInspector, setShowInspector] = useState(true)
  const { selectedView, currentProject, selectedSequenceId } = useProjectStore()

  const selectedSequence = currentProject?.sequences.find(s => s.id === selectedSequenceId)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`border-r border-gray-200 bg-white transition-all duration-300 ${
          showSidebar ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 border-b border-gray-200 bg-white flex items-center px-4">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-gray-100 rounded-md mr-2"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentProject?.name || 'GenomeLens'}
            </h2>
          </div>
          <button
            onClick={() => setShowInspector(!showInspector)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            {showInspector ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Toolbar */}
        <Toolbar />

        {/* Viewer area */}
        <div className="flex-1 overflow-hidden">
          {!selectedSequence ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">No sequence selected</p>
                <p className="text-sm">Import or create a sequence to get started</p>
              </div>
            </div>
          ) : selectedView === 'linear' ? (
            <LinearViewer sequence={selectedSequence} />
          ) : selectedView === 'plasmid' ? (
            <PlasmidViewer sequence={selectedSequence} />
          ) : (
            <AlignmentViewer />
          )}
        </div>
      </div>

      {/* Inspector panel */}
      <div
        className={`border-l border-gray-200 bg-white transition-all duration-300 ${
          showInspector ? 'w-80' : 'w-0'
        } overflow-hidden`}
      >
        <Inspector />
      </div>
    </div>
  )
}




