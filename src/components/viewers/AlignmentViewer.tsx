import { useRef, useEffect, useState } from 'react'
import { FixedSizeList as List } from 'react-window'
import { Download } from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import { calculateConsensus, calculateAlignmentStats, exportToCLUSTAL, exportToFASTAAlignment } from '@/utils/alignmentParsers'
import Button from '../ui/Button'

const CHAR_WIDTH = 10
const ROW_HEIGHT = 24

export default function AlignmentViewer() {
  const { currentProject } = useProjectStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [scrollLeft, setScrollLeft] = useState(0)
  const [showConsensus, setShowConsensus] = useState(true)

  const alignment = currentProject?.alignments[0] // Show first alignment for now

  const consensus = alignment ? calculateConsensus(alignment) : ''
  const stats = alignment ? calculateAlignmentStats(alignment) : null

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
          <p className="text-sm">Import an alignment file (CLUSTAL, FASTA, Stockholm, MAF)</p>
        </div>
      </div>
    )
  }

  const maxLength = Math.max(...alignment.sequences.map(s => s.sequence.length))
  const visibleChars = Math.floor(dimensions.width / CHAR_WIDTH) - 20 // Reserve space for labels

  const handleExport = (format: 'clustal' | 'fasta') => {
    const content = format === 'clustal' 
      ? exportToCLUSTAL(alignment)
      : exportToFASTAAlignment(alignment)
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${alignment.name}.${format === 'clustal' ? 'aln' : 'fasta'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const seq = alignment.sequences[index]
    const startPos = Math.floor(scrollLeft / CHAR_WIDTH)
    const visibleSeq = seq.sequence.substring(startPos, startPos + visibleChars)
    const cons = consensus.substring(startPos, startPos + visibleChars)

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
            const consChar = cons[i]
            const isConserved = char === consChar && !isGap
            const isMismatch = !isConserved && !isGap && consChar !== '-'

            return (
              <span
                key={i}
                className={`${
                  isGap ? 'text-gray-300' : 
                  isConserved ? 'bg-green-50' :
                  isMismatch ? 'bg-yellow-50' : ''
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
      {/* Header with stats */}
      <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{alignment.name}</h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConsensus(!showConsensus)}
            >
              {showConsensus ? 'Hide' : 'Show'} Consensus
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport('fasta')}
            >
              <Download className="w-4 h-4 mr-1" />
              FASTA
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport('clustal')}
            >
              <Download className="w-4 h-4 mr-1" />
              CLUSTAL
            </Button>
          </div>
        </div>

        {stats && (
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-gray-600">Sequences:</span>{' '}
              <span className="font-semibold">{stats.sequences}</span>
            </div>
            <div>
              <span className="text-gray-600">Length:</span>{' '}
              <span className="font-semibold">{stats.length.toLocaleString()} bp</span>
            </div>
            <div>
              <span className="text-gray-600">Identity:</span>{' '}
              <span className="font-semibold">{stats.identity.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-gray-600">Gaps:</span>{' '}
              <span className="font-semibold">{stats.gaps.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-gray-600">Conserved:</span>{' '}
              <span className="font-semibold">{stats.conservedPositions}</span>
            </div>
          </div>
        )}
      </div>

      {/* Ruler */}
      <div className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
        <div className="flex font-mono text-xs text-gray-500">
          <div className="w-40" />
          <div className="flex-1 px-2 py-1 overflow-hidden">
            <div style={{ marginLeft: -scrollLeft }}>
              {Array.from({ length: Math.ceil(maxLength / 10) }).map((_, i) => (
                <span key={i} className="inline-block" style={{ width: CHAR_WIDTH * 10 }}>
                  {((i * 10) + 1).toString().padStart(4)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Consensus row */}
      {showConsensus && (
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex font-mono text-sm py-1">
            <div className="w-40 text-right pr-4 text-gray-700 font-medium">
              Consensus
            </div>
            <div className="flex-1 sequence-mono">
              {consensus.substring(Math.floor(scrollLeft / CHAR_WIDTH), Math.floor(scrollLeft / CHAR_WIDTH) + visibleChars).split('').map((char, i) => (
                <span
                  key={i}
                  className={char === '-' ? 'text-gray-300' : 'font-bold'}
                  style={{ color: char === '-' ? undefined : getBaseColor(char) }}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sequences */}
      <div className="flex-1 overflow-auto" onScroll={handleScroll}>
        {dimensions.height > 0 && (
          <List
            height={dimensions.height - (showConsensus ? 120 : 100)}
            itemCount={alignment.sequences.length}
            itemSize={ROW_HEIGHT}
            width={dimensions.width}
          >
            {Row}
          </List>
        )}
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 text-xs flex items-center gap-4">
        <span className="text-gray-600">Legend:</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-50 border border-green-200" />
          <span>Conserved</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-yellow-50 border border-yellow-200" />
          <span>Mismatch</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-300 font-mono">-</span>
          <span>Gap</span>
        </div>
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
