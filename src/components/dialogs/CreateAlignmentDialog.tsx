import { useEffect, useMemo, useRef, useState } from 'react'
import Button from '../ui/Button'
import { useProjectStore } from '@/stores/projectStore'

interface CreateAlignmentDialogProps {
  onClose: () => void
}

export default function CreateAlignmentDialog({ onClose }: CreateAlignmentDialogProps) {
  const { currentProject, addAlignment } = useProjectStore()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [mode, setMode] = useState<'dna' | 'protein'>('dna')
  const [isRunning, setIsRunning] = useState(false)
  const workerRef = useRef<Worker | null>(null)
  const [progress, setProgress] = useState(0)
  const sequences = currentProject?.sequences || []

  const selectable = useMemo(() => {
    return sequences.map(s => ({ id: s.id, name: s.name, type: s.type, sequence: s.sequence }))
  }, [sequences])

  const toggle = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const runAlignment = async () => {
    if (selectedIds.length < 2) {
      alert('Select at least 2 sequences to align')
      return
    }
    setIsRunning(true)

    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('../../workers/alignmentWorker.ts', import.meta.url), { type: 'module' })
      workerRef.current.onmessage = (e: MessageEvent<any>) => {
        const msg = e.data
        if (msg.type === 'progress') {
          setProgress(msg.value)
        } else if (msg.type === 'result') {
          addAlignment(msg.alignment)
          setIsRunning(false)
          onClose()
        } else if (msg.type === 'error') {
          alert('Alignment error: ' + msg.message)
          setIsRunning(false)
        }
      }
    }

    const items = selectable.filter(s => selectedIds.includes(s.id)).map(s => ({ id: s.id, name: s.name, sequence: s.sequence }))
    workerRef.current.postMessage({ type: 'align', payload: { sequences: items, mode } })
  }

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Create Alignment</h3>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-2 border rounded p-3 max-h-72 overflow-auto">
              <p className="text-sm font-medium mb-2">Select sequences ({selectedIds.length} selected)</p>
              <div className="space-y-1">
                {selectable.map(seq => (
                  <label key={seq.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(seq.id)}
                      onChange={() => toggle(seq.id)}
                    />
                    <span className="flex-1 text-sm truncate">{seq.name}</span>
                    <span className="text-xs text-gray-500">{seq.type}</span>
                  </label>
                ))}
                {selectable.length === 0 && (
                  <p className="text-sm text-gray-500">No sequences available</p>
                )}
              </div>
            </div>

            <div className="border rounded p-3">
              <p className="text-sm font-medium mb-2">Options</p>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Mode</label>
                <select value={mode} onChange={(e) => setMode(e.target.value as any)} className="w-full border rounded px-2 py-1">
                  <option value="dna">DNA/RNA</option>
                  <option value="protein">Protein</option>
                </select>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Simple progressive MSA run in background worker. For large datasets, this may take time.</p>
              </div>
            </div>
          </div>

          {isRunning && (
            <div className="mb-4">
              <div className="h-2 bg-gray-100 rounded">
                <div className="h-2 bg-primary-600 rounded" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-gray-600 mt-1">Aligning... {progress}%</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="primary" onClick={runAlignment} disabled={isRunning || selectedIds.length < 2}>
              Create Alignment
            </Button>
            <Button variant="ghost" onClick={onClose} disabled={isRunning}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
