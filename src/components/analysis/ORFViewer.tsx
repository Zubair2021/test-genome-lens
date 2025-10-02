import { useState, useEffect } from 'react'
import { Sequence } from '@/types'
import { findORFs, ORF } from '@/utils/sequence'

interface ORFViewerProps {
  sequence: Sequence
}

export default function ORFViewer({ sequence }: ORFViewerProps) {
  const [minLength, setMinLength] = useState(100)
  const [orfs, setOrfs] = useState<ORF[]>([])
  const [selectedORF, setSelectedORF] = useState<ORF | null>(null)

  useEffect(() => {
    if (sequence.sequence && sequence.type !== 'protein') {
      const found = findORFs(sequence.sequence, minLength)
      setOrfs(found)
    }
  }, [sequence, minLength])

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Open Reading Frames</h3>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Minimum Length (bp)</label>
          <input
            type="number"
            value={minLength}
            onChange={(e) => setMinLength(Number(e.target.value))}
            className="w-32 px-2 py-1 border border-gray-300 rounded"
            min="30"
            max="10000"
            step="30"
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">Found {orfs.length} ORFs</p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* ORF List */}
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
          <div className="p-4 space-y-2">
            {orfs.map((orf, idx) => (
              <div
                key={idx}
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  selectedORF === orf
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedORF(orf)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">
                    ORF {idx + 1}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    orf.strand === 'forward' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {orf.strand === 'forward' ? '+' : '-'} Frame {orf.frame}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  {orf.start + 1}..{orf.end} ({orf.end - orf.start} bp)
                </p>
                <p className="text-xs text-gray-600">
                  {orf.protein.length} aa
                </p>
              </div>
            ))}
            {orfs.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No ORFs found with minimum length {minLength} bp
              </p>
            )}
          </div>
        </div>

        {/* ORF Details */}
        <div className="w-1/2 overflow-y-auto">
          {selectedORF ? (
            <div className="p-4">
              <h4 className="font-semibold mb-3">ORF Details</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Position</label>
                  <p className="font-mono text-sm">
                    {selectedORF.start + 1}..{selectedORF.end}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Length</label>
                  <p className="text-sm">
                    {selectedORF.end - selectedORF.start} bp ({selectedORF.protein.length} aa)
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Strand</label>
                  <p className="text-sm">{selectedORF.strand} (Frame {selectedORF.frame})</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">DNA Sequence</label>
                  <div className="bg-gray-50 p-2 rounded font-mono text-xs break-all">
                    {selectedORF.sequence}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Protein Translation</label>
                  <div className="bg-gray-50 p-2 rounded font-mono text-xs break-all">
                    {selectedORF.protein}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Select an ORF to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


