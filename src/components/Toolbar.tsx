import { useState } from 'react'
import { Search, LayoutList, Circle, AlignLeft, Ruler, Scissors, Activity } from 'lucide-react'
import Button from './ui/Button'
import Input from './ui/Input'
import { useProjectStore } from '@/stores/projectStore'

export default function Toolbar() {
  const { selectedView, setView, currentProject, selectedSequenceId } = useProjectStore()
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedSequence = currentProject?.sequences.find(s => s.id === selectedSequenceId)
  const isCircular = selectedSequence?.circular

  return (
    <div className="h-12 border-b border-gray-200 bg-white flex items-center px-4 gap-2">
      {/* View toggles */}
      <div className="flex gap-1 border-r border-gray-200 pr-4">
        <Button
          variant={selectedView === 'linear' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setView('linear')}
          disabled={!selectedSequenceId}
          title="Linear View"
        >
          <LayoutList className="w-4 h-4" />
        </Button>
        <Button
          variant={selectedView === 'plasmid' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setView('plasmid')}
          disabled={!selectedSequenceId || !isCircular}
          title="Plasmid View"
        >
          <Circle className="w-4 h-4" />
        </Button>
        <Button
          variant={selectedView === 'alignment' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setView('alignment')}
          disabled={!currentProject?.alignments.length}
          title="Alignment View"
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="flex-1 flex items-center gap-2">
        {showSearch ? (
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Input
              placeholder="Search sequence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowSearch(false)
                setSearchQuery('')
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch(true)}
            disabled={!selectedSequenceId}
          >
            <Search className="w-4 h-4 mr-1" />
            Search
          </Button>
        )}
      </div>

      {/* Tools */}
      <div className="flex gap-1 border-l border-gray-200 pl-4">
        <Button
          variant="ghost"
          size="sm"
          disabled={!selectedSequenceId}
          title="Measure"
        >
          <Ruler className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={!selectedSequenceId}
          title="Restriction Sites"
        >
          <Scissors className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={!selectedSequenceId}
          title="GC Content"
        >
          <Activity className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}



