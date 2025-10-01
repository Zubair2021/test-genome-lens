import { useRef, useState, useEffect } from 'react'
import { FixedSizeList as List } from 'react-window'
import { Sequence } from '@/types'
import { getFeatureColor } from '@/utils/sequence'

interface LinearViewerProps {
  sequence: Sequence
}

const BASES_PER_LINE = 60
const LINE_HEIGHT = 24

export default function LinearViewer({ sequence }: LinearViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null)

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const totalLines = Math.ceil(sequence.sequence.length / BASES_PER_LINE)

  const handleTextSelection = () => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    const range = sel.getRangeAt(0)
    const container = containerRef.current
    if (!container?.contains(range.commonAncestorContainer)) return

    const text = sel.toString().replace(/\s/g, '')
    if (text.length > 0) {
      // Find position in sequence
      const start = sequence.sequence.indexOf(text)
      if (start !== -1) {
        setSelection({ start, end: start + text.length })
      }
    }
  }

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const start = index * BASES_PER_LINE
    const end = Math.min(start + BASES_PER_LINE, sequence.sequence.length)
    const bases = sequence.sequence.substring(start, end)
    
    // Get features that overlap this line
    const lineFeatures = sequence.features.filter(
      f => f.start < end && f.end >= start
    )

    return (
      <div style={style} className="flex font-mono text-sm">
        {/* Line number */}
        <div className="w-20 text-right pr-4 text-gray-500 select-none">
          {(start + 1).toLocaleString()}
        </div>

        {/* Sequence */}
        <div className="flex-1 relative">
          {/* Feature highlights */}
          <div className="absolute inset-0 pointer-events-none">
            {lineFeatures.map(feature => {
              const featureStart = Math.max(0, feature.start - start)
              const featureEnd = Math.min(BASES_PER_LINE, feature.end - start + 1)
              const left = (featureStart / BASES_PER_LINE) * 100
              const width = ((featureEnd - featureStart) / BASES_PER_LINE) * 100
              
              return (
                <div
                  key={feature.id}
                  className="absolute h-full opacity-20"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundColor: feature.color || getFeatureColor(feature.type),
                  }}
                  title={feature.name}
                />
              )
            })}
          </div>

          {/* Bases */}
          <div className="relative sequence-mono">
            {bases.split('').map((base, i) => {
              const pos = start + i
              const isSelected = selection && pos >= selection.start && pos < selection.end
              
              return (
                <span
                  key={i}
                  className={`${isSelected ? 'bg-blue-200' : ''}`}
                  style={{
                    color: getBaseColor(base),
                  }}
                >
                  {base}
                </span>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-full bg-white" onMouseUp={handleTextSelection}>
      {/* Header with ruler */}
      <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-2 z-10">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Length: <span className="font-semibold">{sequence.sequence.length.toLocaleString()}</span> bp
          </div>
          {selection && (
            <div className="text-sm text-gray-600">
              Selected: <span className="font-semibold">{selection.start + 1}</span> to{' '}
              <span className="font-semibold">{selection.end}</span>
              {' '}({selection.end - selection.start} bp)
            </div>
          )}
        </div>
      </div>

      {/* Virtualized sequence list */}
      <div className="px-4 py-2">
        {dimensions.height > 0 && (
          <List
            height={dimensions.height - 60}
            itemCount={totalLines}
            itemSize={LINE_HEIGHT}
            width={dimensions.width - 32}
          >
            {Row}
          </List>
        )}
      </div>
    </div>
  )
}

function getBaseColor(base: string): string {
  switch (base.toUpperCase()) {
    case 'A':
      return '#10b981' // green
    case 'T':
    case 'U':
      return '#ef4444' // red
    case 'G':
      return '#3b82f6' // blue
    case 'C':
      return '#f59e0b' // amber
    default:
      return '#6b7280' // gray
  }
}



