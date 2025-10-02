import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface JumpToDialogProps {
  sequenceLength: number
  onJump: (position: number) => void
  onCancel: () => void
}

export default function JumpToDialog({ sequenceLength, onJump, onCancel }: JumpToDialogProps) {
  const [position, setPosition] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const pos = Number(position)
    if (isNaN(pos) || pos < 1 || pos > sequenceLength) {
      alert(`Position must be between 1 and ${sequenceLength}`)
      return
    }
    
    onJump(pos - 1) // Convert to 0-indexed
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Jump to Position</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position (1-{sequenceLength.toLocaleString()})
              </label>
              <Input
                type="number"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Enter position..."
                min={1}
                max={sequenceLength}
                autoFocus
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" variant="primary" className="flex-1">
                Jump
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

