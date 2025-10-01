import { useEffect, useState } from 'react'
import { Sequence } from '@/types'
import { calculateGCWindowed } from '@/utils/sequence'

interface GCContentViewerProps {
  sequence: Sequence
}

export default function GCContentViewer({ sequence }: GCContentViewerProps) {
  const [windowSize, setWindowSize] = useState(100)
  const [step, setStep] = useState(10)
  const [data, setData] = useState<Array<{ position: number; gc: number }>>([])

  useEffect(() => {
    if (sequence.sequence) {
      const result = calculateGCWindowed(sequence.sequence, windowSize, step)
      setData(result)
    }
  }, [sequence, windowSize, step])

  const maxGC = Math.max(...data.map(d => d.gc), 100)
  const minGC = Math.min(...data.map(d => d.gc), 0)

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold mb-4">GC Content Analysis</h3>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Window Size (bp)</label>
            <input
              type="number"
              value={windowSize}
              onChange={(e) => setWindowSize(Number(e.target.value))}
              className="w-24 px-2 py-1 border border-gray-300 rounded"
              min="10"
              max="10000"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Step Size (bp)</label>
            <input
              type="number"
              value={step}
              onChange={(e) => setStep(Number(e.target.value))}
              className="w-24 px-2 py-1 border border-gray-300 rounded"
              min="1"
              max="1000"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <svg width="100%" height="400" className="border border-gray-200">
          {/* Y-axis labels */}
          <g>
            <text x="30" y="20" fontSize="12" fill="#666">GC%</text>
            <text x="30" y="50" fontSize="10" fill="#666">{maxGC.toFixed(0)}</text>
            <text x="30" y="225" fontSize="10" fill="#666">{((maxGC + minGC) / 2).toFixed(0)}</text>
            <text x="30" y="390" fontSize="10" fill="#666">{minGC.toFixed(0)}</text>
          </g>

          {/* Grid lines */}
          <line x1="60" y1="40" x2="95%" y2="40" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="60" y1="220" x2="95%" y2="220" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="60" y1="380" x2="95%" y2="380" stroke="#e5e7eb" strokeWidth="1" />

          {/* Plot area */}
          <g transform="translate(60, 40)">
            {data.length > 0 && (
              <polyline
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="2"
                points={data.map((d, i) => {
                  const x = (i / data.length) * 800
                  const y = 340 - ((d.gc - minGC) / (maxGC - minGC)) * 340
                  return `${x},${y}`
                }).join(' ')}
              />
            )}
          </g>

          {/* X-axis */}
          <text x="50%" y="395" fontSize="12" fill="#666" textAnchor="middle">
            Position (bp)
          </text>
        </svg>

        {/* Statistics */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Average GC%</p>
            <p className="text-xl font-semibold">
              {(data.reduce((sum, d) => sum + d.gc, 0) / data.length || 0).toFixed(2)}%
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Max GC%</p>
            <p className="text-xl font-semibold">{maxGC.toFixed(2)}%</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Min GC%</p>
            <p className="text-xl font-semibold">{minGC.toFixed(2)}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

