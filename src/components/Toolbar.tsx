import { useState } from 'react'
import { Search, LayoutList, Circle, AlignLeft, Crosshair, Bookmark } from 'lucide-react'
import Button from './ui/Button'
import Input from './ui/Input'
import { useProjectStore } from '@/stores/projectStore'
import JumpToDialog from './dialogs/JumpToDialog'
import AddBookmarkDialog from './dialogs/AddBookmarkDialog'

export default function Toolbar() {
  const { selectedView, setView, currentProject, selectedSequenceId, addBookmark, bookmarks } = useProjectStore()
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showJumpTo, setShowJumpTo] = useState(false)
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false)
  const [showBookmarksList, setShowBookmarksList] = useState(false)

  const selectedSequence = currentProject?.sequences.find(s => s.id === selectedSequenceId)
  const isCircular = selectedSequence?.circular
  const sequenceBookmarks = bookmarks.filter(b => b.sequenceId === selectedSequenceId)

  const handleJump = (_position: number) => {
    // This will be handled by the viewer components
    // For now, just close the dialog
    setShowJumpTo(false)
    // TODO: Emit event or use a callback to scroll to position
  }

  const handleAddBookmark = (bookmark: { name: string; sequenceId: string; position: number; color?: string }) => {
    addBookmark({
      ...bookmark,
      id: crypto.randomUUID(),
    })
    setShowBookmarkDialog(false)
  }

  return (
    <>
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

        {/* Navigation tools */}
        <div className="flex gap-1 border-l border-gray-200 pl-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowJumpTo(true)}
            disabled={!selectedSequenceId}
            title="Jump to Position"
          >
            <Crosshair className="w-4 h-4" />
          </Button>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBookmarksList(!showBookmarksList)}
              disabled={!selectedSequenceId}
              title="Bookmarks"
            >
              <Bookmark className="w-4 h-4" />
              {sequenceBookmarks.length > 0 && (
                <span className="ml-1 text-xs">({sequenceBookmarks.length})</span>
              )}
            </Button>
            
            {showBookmarksList && selectedSequenceId && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <h4 className="font-medium text-sm">Bookmarks</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowBookmarkDialog(true)
                      setShowBookmarksList(false)
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {sequenceBookmarks.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No bookmarks yet</p>
                  ) : (
                    <div className="p-2 space-y-1">
                      {sequenceBookmarks.map(bookmark => (
                        <div
                          key={bookmark.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => {
                            // TODO: Jump to bookmark position
                            setShowBookmarksList(false)
                          }}
                        >
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: bookmark.color || '#3b82f6' }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{bookmark.name}</p>
                            <p className="text-xs text-gray-500">Position: {bookmark.position + 1}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showJumpTo && selectedSequence && (
        <JumpToDialog
          sequenceLength={selectedSequence.sequence.length}
          onJump={handleJump}
          onCancel={() => setShowJumpTo(false)}
        />
      )}

      {showBookmarkDialog && selectedSequence && (
        <AddBookmarkDialog
          sequenceId={selectedSequence.id}
          sequenceLength={selectedSequence.sequence.length}
          onAdd={handleAddBookmark}
          onCancel={() => setShowBookmarkDialog(false)}
        />
      )}
    </>
  )
}
