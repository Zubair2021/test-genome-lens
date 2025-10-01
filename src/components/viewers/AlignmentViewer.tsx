import { useRef, useEffect, useState } from 'react'
import { FixedSizeList as List } from 'react-window'
import { useProjectStore } from '@/stores/projectStore'

const CHAR_WIDTH = 10
const ROW_HEIGHT = 24

export default function AlignmentViewer() {
  const { currentProject } = useProjectStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [scrollLeft, setScrollLeft] = useState(0)

  const alignment = currentProject?.alignments[0] // Show first alignment for now

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

  if (!alignment) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">No alignment available</p>
          <p className="text-sm">Create or import an alignment to view it here</p>
        </div>
      </div>
    )
  }

  const maxLength = Math.max(...alignment.sequences.map(s => s.sequence.length))
  const visibleChars = Math.floor(dimensions.width / CHAR_WIDTH) - 20 // Reserve space for labels

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const seq = alignment.sequences[index]
    const startPos = Math.floor(scrollLeft / CHAR_WIDTH)
    const visibleSeq = seq.sequence.substring(startPos, startPos + visibleChars)

    return (
      <div style={style} className="flex font-mono text-sm">
        {/* Sequence name */}
        <div className="w-40 text-right pr-4 text-gray-700 font-medium truncate">
          {seq.name}
        </div>

        {/* Sequence */}
        <div className="flex-1 sequence-mono">
          {visibleSeq.split('').map((char, i) => {
            const isGap = char === '-'
            const isMismatch = alignment.consensus && 
              char !== alignment.consensus[startPos + i] && 
              !isGap

            return (
              <span
                key={i}
                className={`${
                  isGap ? 'text-gray-300' : isMismatch ? 'bg-yellow-100' : ''
                }`}
                style={{ color: isGap ? undefined : getBaseColor(char) }}
              >
                {char}
              </span>
            )
          })}
        </div>
      </div>
    )
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollLeft(e.currentTarget.scrollLeft)
  }

  return (
    <div ref={containerRef} className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-2 bg-gray-50">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">{alignment.sequences.length}</span> sequences
          </div>
          <div className="text-sm text-gray-600">
            Length: <span className="font-semibold">{maxLength.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Ruler */}
      <div className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
        <div className="flex font-mono text-xs text-gray-500">
          <div className="w-40" />
          <div className="flex-1 px-2 py-1 overflow-hidden">
            <div style={{ marginLeft: -scrollLeft }}>
              {Array.from({ length: Math.ceil(maxLength / 10) }).map((_, i) => (
                <span key={i} className="inline-block" style={{ width: CHAR_WIDTH * 10 }}>
                  {(i * 10).toString().padStart(4)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sequences */}
      <div className="flex-1 overflow-auto" onScroll={handleScroll}>
        {dimensions.height > 0 && (
          <List
            height={dimensions.height - 80}
            itemCount={alignment.sequences.length}
            itemSize={ROW_HEIGHT}
            width={dimensions.width}
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
      return '#10b981'
    case 'T':
    case 'U':
      return '#ef4444'
    case 'G':
      return '#3b82f6'
    case 'C':
      return '#f59e0b'
    default:
      return '#6b7280'
  }
}



