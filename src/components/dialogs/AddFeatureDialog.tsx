import { useState } from 'react'
import { Feature, FeatureType, Strand } from '@/types'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { getFeatureColor } from '@/utils/sequence'

interface AddFeatureDialogProps {
  sequenceLength: number
  onAdd: (feature: Omit<Feature, 'id'>) => void
  onCancel: () => void
  existingFeature?: Feature
}

export default function AddFeatureDialog({ sequenceLength, onAdd, onCancel, existingFeature }: AddFeatureDialogProps) {
  const [name, setName] = useState(existingFeature?.name || '')
  const [type, setType] = useState<FeatureType>(existingFeature?.type || 'misc_feature')
  const [start, setStart] = useState(existingFeature ? existingFeature.start + 1 : 1)
  const [end, setEnd] = useState(existingFeature ? existingFeature.end + 1 : 100)
  const [strand, setStrand] = useState<Strand>(existingFeature?.strand || 'forward')
  const [color, setColor] = useState(existingFeature?.color || getFeatureColor(type))
  const [notes, setNotes] = useState(existingFeature?.notes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      alert('Feature name is required')
      return
    }
    
    if (start < 1 || start > sequenceLength || end < 1 || end > sequenceLength) {
      alert(`Positions must be between 1 and ${sequenceLength}`)
      return
    }
    
    if (start > end) {
      alert('Start position must be less than or equal to end position')
      return
    }

    onAdd({
      name: name.trim(),
      type,
      start: start - 1, // Convert to 0-indexed
      end: end - 1,
      strand,
      color,
      notes: notes.trim() || undefined,
    })
  }

  const featureTypes: FeatureType[] = [
    'gene',
    'CDS',
    'promoter',
    'terminator',
    'misc_feature',
    'origin',
    'primer_bind',
    'regulatory',
    'repeat_region'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {existingFeature ? 'Edit Feature' : 'Add Feature'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feature Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., promoter_1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => {
                  const newType = e.target.value as FeatureType
                  setType(newType)
                  setColor(getFeatureColor(newType))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {featureTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Position *
                </label>
                <Input
                  type="number"
                  value={start}
                  onChange={(e) => setStart(Number(e.target.value))}
                  min={1}
                  max={sequenceLength}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Position *
                </label>
                <Input
                  type="number"
                  value={end}
                  onChange={(e) => setEnd(Number(e.target.value))}
                  min={1}
                  max={sequenceLength}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Strand
              </label>
              <select
                value={strand}
                onChange={(e) => setStrand(e.target.value as Strand)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="forward">Forward (+)</option>
                <option value="reverse">Reverse (-)</option>
                <option value="both">Both</option>
              </select>
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
                  placeholder="#4ade80"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Additional information..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" variant="primary" className="flex-1">
                {existingFeature ? 'Update' : 'Add'} Feature
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

