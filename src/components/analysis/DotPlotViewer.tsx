import { useState, useEffect, useRef } from 'react'
import { Sequence } from '@/types'
import { generateDotPlot, DotPlotPoint } from '@/utils/analysis'
import Button from '../ui/Button'

interface DotPlotViewerProps {
  sequence1: Sequence
  sequence2: Sequence
}

export default function DotPlotViewer({ sequence1, sequence2 }: DotPlotViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [windowSize, setWindowSize] = useState(10)
  const [threshold, setThreshold] = useState(70)
  const [points, setPoints] = useState<DotPlotPoint[]>([])
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    calculateDotPlot()
  }, [sequence1, sequence2, windowSize, threshold])

  const calculateDotPlot = async () => {
    setIsCalculating(true)
    
    // Run in setTimeout to not block UI
    setTimeout(() => {
      const result = generateDotPlot(
        sequence1.sequence,
        sequence2.sequence,
        windowSize,
        threshold
      )
      setPoints(result)
      setIsCalculating(false)
      drawDotPlot(result)
    }, 10)
  }

  const drawDotPlot = (plotPoints: DotPlotPoint[]) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    // Draw grid
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width
      const y = (i / 10) * height
      
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Draw points
    const scaleX = width / Math.max(sequence1.sequence.length, 1)
    const scaleY = height / Math.max(sequence2.sequence.length, 1)

    for (const point of plotPoints) {
      const x = point.x * scaleX
      const y = point.y * scaleY
      
      // Color based on score
      const intensity = Math.floor((point.score / 100) * 255)
      ctx.fillStyle = `rgb(${255 - intensity}, ${255 - intensity}, 255)`
      
      ctx.fillRect(x, y, Math.max(1, scaleX), Math.max(1, scaleY))
    }

    // Draw axes labels
    ctx.fillStyle = '#000000'
    ctx.font = '12px sans-serif'
    ctx.fillText(sequence1.name, width / 2 - 50, height - 5)
    
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText(sequence2.name, -50, 0)
    ctx.restore()
  }

  return (
    <div className="h-full flex flex-col bg-white p-4">
      <h3 className="text-lg font-semibold mb-4">Dot Plot Analysis</h3>
      
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Window Size</label>
          <input
            type="number"
            value={windowSize}
            onChange={(e) => setWindowSize(Number(e.target.value))}
            className="w-24 px-2 py-1 border border-gray-300 rounded"
            min="3"
            max="50"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Threshold (%)</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-24 px-2 py-1 border border-gray-300 rounded"
            min="0"
            max="100"
          />
        </div>
        <div className="flex items-end">
          <Button
            variant="primary"
            size="sm"
            onClick={calculateDotPlot}
            disabled={isCalculating}
          >
            {isCalculating ? 'Calculating...' : 'Recalculate'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className="border border-gray-300"
        />
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Comparing: {sequence1.name} ({sequence1.sequence.length} bp) vs {sequence2.name} ({sequence2.sequence.length} bp)</p>
        <p>Points plotted: {points.length.toLocaleString()}</p>
      </div>
    </div>
  )
}

