import { useState } from 'react'
import { Info, Tag, BarChart } from 'lucide-react'
import Button from './ui/Button'
import { useProjectStore } from '@/stores/projectStore'
import { calculateGC } from '@/utils/sequence'
import GCContentViewer from './analysis/GCContentViewer'
import ORFViewer from './analysis/ORFViewer'
import RestrictionViewer from './analysis/RestrictionViewer'

export default function Inspector() {
  const { currentProject, selectedSequenceId } = useProjectStore()
  const [activeTab, setActiveTab] = useState<'info' | 'features' | 'analysis'>('info')
  const [analysisView, setAnalysisView] = useState<'gc' | 'orf' | 'restriction'>('gc')

  const selectedSequence = currentProject?.sequences.find(s => s.id === selectedSequenceId)

  if (!selectedSequence) {
    return (
      <div className="h-full flex items-center justify-center p-4 text-center text-gray-500">
        <p className="text-sm">No sequence selected</p>
      </div>
    )
  }

  const gcContent = selectedSequence.sequence ? calculateGC(selectedSequence.sequence) : 0

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
            {selectedSequence.description && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
                <p className="text-sm mt-1">{selectedSequence.description}</p>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">GC Content</label>
              <p className="text-sm mt-1">{gcContent.toFixed(2)}%</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Features</label>
              <p className="text-sm mt-1">{selectedSequence.features.length}</p>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="space-y-2">
            {selectedSequence.features.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No features</p>
            ) : (
              selectedSequence.features.map(feature => (
                <div
                  key={feature.id}
                  className="p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-sm">{feature.name}</p>
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: feature.color || '#9ca3af' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 capitalize">{feature.type}</p>
                  <p className="text-xs text-gray-500">
                    {feature.start + 1}..{feature.end + 1} ({feature.strand})
                  </p>
                  {feature.notes && (
                    <p className="text-xs text-gray-600 mt-1">{feature.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'analysis' && selectedSequence && (
          <div className="space-y-4">
            <div className="flex gap-1 border-b border-gray-200 pb-2">
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
              >
                ORFs
              </Button>
              <Button
                variant={analysisView === 'restriction' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setAnalysisView('restriction')}
              >
                Restriction
              </Button>
            </div>

            {analysisView === 'gc' && <GCContentViewer sequence={selectedSequence} />}
            {analysisView === 'orf' && <ORFViewer sequence={selectedSequence} />}
            {analysisView === 'restriction' && <RestrictionViewer sequence={selectedSequence} />}
          </div>
        )}
      </div>
    </div>
  )
}



