import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface AddBookmarkDialogProps {
  sequenceId: string
  sequenceLength: number
  defaultPosition?: number
  onAdd: (bookmark: { name: string; sequenceId: string; position: number; color?: string }) => void
  onCancel: () => void
}

export default function AddBookmarkDialog({ 
  sequenceId, 
  sequenceLength, 
  defaultPosition, 
  onAdd, 
  onCancel 
}: AddBookmarkDialogProps) {
  const [name, setName] = useState('')
  const [position, setPosition] = useState(defaultPosition ? defaultPosition + 1 : 1)
  const [color, setColor] = useState('#3b82f6')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      alert('Bookmark name is required')
      return
    }
    
    if (position < 1 || position > sequenceLength) {
      alert(`Position must be between 1 and ${sequenceLength}`)
      return
    }

    onAdd({
      name: name.trim(),
      sequenceId,
      position: position - 1, // Convert to 0-indexed
      color,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add Bookmark</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bookmark Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Start codon"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position *
              </label>
              <Input
                type="number"
                value={position}
                onChange={(e) => setPosition(Number(e.target.value))}
                min={1}
                max={sequenceLength}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-20"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" variant="primary" className="flex-1">
                Add Bookmark
              </Button>
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

