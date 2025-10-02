import { useState } from 'react'
import { Info, Tag, BarChart, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import Button from './ui/Button'
import { useProjectStore } from '@/stores/projectStore'
import { calculateGC } from '@/utils/sequence'
import GCContentViewer from './analysis/GCContentViewer'
import ORFViewer from './analysis/ORFViewer'
import RestrictionViewer from './analysis/RestrictionViewer'
import AddFeatureDialog from './dialogs/AddFeatureDialog'
import { Feature } from '@/types'

export default function Inspector() {
  const { currentProject, selectedSequenceId, addFeature, updateFeature, deleteFeature } = useProjectStore()
  const [activeTab, setActiveTab] = useState<'info' | 'features' | 'analysis'>('info')
  const [analysisView, setAnalysisView] = useState<'gc' | 'orf' | 'restriction'>('gc')
  const [showDialog, setShowDialog] = useState(false)
  const [editingFeature, setEditingFeature] = useState<Feature | undefined>()
  const [hiddenFeatures, setHiddenFeatures] = useState<Set<string>>(new Set())

  const selectedSequence = currentProject?.sequences.find(s => s.id === selectedSequenceId)

  if (!selectedSequence) {
    return (
      <div className="h-full flex items-center justify-center p-4 text-center text-gray-500">
        <p className="text-sm">No sequence selected</p>
      </div>
    )
  }

  const gcContent = selectedSequence.sequence ? calculateGC(selectedSequence.sequence) : 0

  const handleAddFeature = (feature: Omit<Feature, 'id'>) => {
    if (editingFeature) {
      updateFeature(selectedSequence.id, editingFeature.id, feature)
    } else {
      addFeature(selectedSequence.id, {
        ...feature,
        id: crypto.randomUUID(),
      })
    }
    setShowDialog(false)
    setEditingFeature(undefined)
  }

  const handleEditFeature = (feature: Feature) => {
    setEditingFeature(feature)
    setShowDialog(true)
  }

  const handleDeleteFeature = (featureId: string) => {
    if (confirm('Are you sure you want to delete this feature?')) {
      deleteFeature(selectedSequence.id, featureId)
    }
  }

  const toggleFeatureVisibility = (featureId: string) => {
    setHiddenFeatures(prev => {
      const next = new Set(prev)
      if (next.has(featureId)) {
        next.delete(featureId)
      } else {
        next.add(featureId)
      }
      return next
    })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Inspector</h3>
        <div className="flex gap-1">
          <Button
            variant={activeTab === 'info' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('info')}
          >
            <Info className="w-4 h-4" />
          </Button>
          <Button
            variant={activeTab === 'features' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('features')}
          >
            <Tag className="w-4 h-4" />
          </Button>
          <Button
            variant={activeTab === 'analysis' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('analysis')}
          >
            <BarChart className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Name</label>
              <p className="text-sm mt-1">{selectedSequence.name}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Type</label>
              <p className="text-sm mt-1 capitalize">{selectedSequence.type}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Length</label>
              <p className="text-sm mt-1">
                {selectedSequence.sequence.length.toLocaleString()}{' '}
                {selectedSequence.type === 'protein' ? 'aa' : 'bp'}
              </p>
            </div>
            {selectedSequence.circular && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Topology</label>
                <p className="text-sm mt-1">Circular</p>
              </div>
            )}
            {selectedSequence.description && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
                <p className="text-sm mt-1">{selectedSequence.description}</p>
              </div>
            )}
            {selectedSequence.type !== 'protein' && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">GC Content</label>
                <p className="text-sm mt-1">{gcContent.toFixed(2)}%</p>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Features</label>
              <p className="text-sm mt-1">{selectedSequence.features.length}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Created</label>
              <p className="text-sm mt-1">{new Date(selectedSequence.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Features ({selectedSequence.features.length})</h4>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingFeature(undefined)
                  setShowDialog(true)
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {selectedSequence.features.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No features yet. Click "Add" to create one.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedSequence.features.map(feature => (
                  <div
                    key={feature.id}
                    className={`p-3 border rounded-md transition-opacity ${
                      hiddenFeatures.has(feature.id) ? 'opacity-50 bg-gray-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{feature.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{feature.type}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-200"
                          style={{ backgroundColor: feature.color || '#9ca3af' }}
                        />
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2">
                      {feature.start + 1}..{feature.end + 1} ({feature.strand})
                    </p>
                    
                    {feature.notes && (
                      <p className="text-xs text-gray-600 mb-2 italic">{feature.notes}</p>
                    )}
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleFeatureVisibility(feature.id)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600"
                        title={hiddenFeatures.has(feature.id) ? 'Show' : 'Hide'}
                      >
                        {hiddenFeatures.has(feature.id) ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditFeature(feature)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600"
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteFeature(feature.id)}
                        className="p-1 hover:bg-gray-100 rounded text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analysis' && selectedSequence && (
          <div className="space-y-4 -mx-4 -my-4">
            <div className="flex gap-1 border-b border-gray-200 pb-2 px-4 pt-4">
              <Button
                variant={analysisView === 'gc' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setAnalysisView('gc')}
              >
                GC Content
              </Button>
              <Button
                variant={analysisView === 'orf' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setAnalysisView('orf')}
                disabled={selectedSequence.type === 'protein'}
              >
                ORFs
              </Button>
              <Button
                variant={analysisView === 'restriction' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setAnalysisView('restriction')}
                disabled={selectedSequence.type === 'protein'}
              >
                Enzymes
              </Button>
            </div>

            <div className="h-[600px]">
              {analysisView === 'gc' && <GCContentViewer sequence={selectedSequence} />}
              {analysisView === 'orf' && selectedSequence.type !== 'protein' && (
                <ORFViewer sequence={selectedSequence} />
              )}
              {analysisView === 'restriction' && selectedSequence.type !== 'protein' && (
                <RestrictionViewer sequence={selectedSequence} />
              )}
            </div>
          </div>
        )}
      </div>

      {showDialog && (
        <AddFeatureDialog
          sequenceLength={selectedSequence.sequence.length}
          onAdd={handleAddFeature}
          onCancel={() => {
            setShowDialog(false)
            setEditingFeature(undefined)
          }}
          existingFeature={editingFeature}
        />
      )}
    </div>
  )
}
