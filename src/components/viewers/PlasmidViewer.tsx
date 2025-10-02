import { useRef, useEffect, useState } from 'react'
import { Sequence } from '@/types'
import { getFeatureColor } from '@/utils/sequence'

interface PlasmidViewerProps {
  sequence: Sequence
}

export default function PlasmidViewer({ sequence }: PlasmidViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)

  useEffect(() => {
    drawPlasmid()
  }, [sequence, scale, pan, hoveredFeature])

  const drawPlasmid = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2 + pan.x
    const centerY = height / 2 + pan.y

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Calculate radius based on sequence length and scale
    const baseRadius = Math.min(width, height) * 0.3 * scale
    const seqLength = sequence.sequence.length

    // Draw main circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2)
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw tick marks every 1000 bp
    ctx.strokeStyle = '#9ca3af'
    ctx.lineWidth = 1
    for (let i = 0; i < seqLength; i += 1000) {
      const angle = (i / seqLength) * Math.PI * 2 - Math.PI / 2
      const x1 = centerX + Math.cos(angle) * (baseRadius - 5)
      const y1 = centerY + Math.sin(angle) * (baseRadius - 5)
      const x2 = centerX + Math.cos(angle) * (baseRadius + 5)
      const y2 = centerY + Math.sin(angle) * (baseRadius + 5)
      
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()

      // Label major ticks
      if (i % 5000 === 0) {
        const labelX = centerX + Math.cos(angle) * (baseRadius + 20)
        const labelY = centerY + Math.sin(angle) * (baseRadius + 20)
        ctx.fillStyle = '#6b7280'
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText((i / 1000).toFixed(0) + 'kb', labelX, labelY)
      }
    }

    // Draw features as arcs
    sequence.features.forEach(feature => {
      const startAngle = (feature.start / seqLength) * Math.PI * 2 - Math.PI / 2
      const endAngle = (feature.end / seqLength) * Math.PI * 2 - Math.PI / 2
      const featureRadius = baseRadius + (feature.strand === 'forward' ? 20 : -20)
      
      ctx.beginPath()
      ctx.arc(centerX, centerY, Math.abs(featureRadius), startAngle, endAngle)
      ctx.strokeStyle = feature.color || getFeatureColor(feature.type)
      ctx.lineWidth = hoveredFeature === feature.id ? 8 : 6
      ctx.stroke()

      // Draw feature label
      const midAngle = (startAngle + endAngle) / 2
      const labelRadius = featureRadius + (feature.strand === 'forward' ? 15 : -15)
      const labelX = centerX + Math.cos(midAngle) * labelRadius
      const labelY = centerY + Math.sin(midAngle) * labelRadius

      ctx.fillStyle = '#1f2937'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(feature.name, labelX, labelY)
    })

    // Draw center label
    ctx.fillStyle = '#374151'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(sequence.name, centerX, centerY - 10)
    
    ctx.fillStyle = '#6b7280'
    ctx.font = '14px sans-serif'
    ctx.fillText(`${seqLength.toLocaleString()} bp`, centerX, centerY + 10)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale(prev => Math.max(0.5, Math.min(3, prev * delta)))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }

    // Check for feature hover
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = canvas.width / 2 + pan.x
    const centerY = canvas.height / 2 + pan.y
    const baseRadius = Math.min(canvas.width, canvas.height) * 0.3 * scale

    // Check if mouse is over a feature
    let found = false
    for (const feature of sequence.features) {
      const startAngle = (feature.start / sequence.sequence.length) * Math.PI * 2 - Math.PI / 2
      const endAngle = (feature.end / sequence.sequence.length) * Math.PI * 2 - Math.PI / 2
      const featureRadius = baseRadius + (feature.strand === 'forward' ? 20 : -20)
      
      const dx = x - centerX
      const dy = y - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)
      let angle = Math.atan2(dy, dx)
      
      if (distance >= Math.abs(featureRadius) - 5 && distance <= Math.abs(featureRadius) + 5) {
        if (angle >= startAngle && angle <= endAngle) {
          setHoveredFeature(feature.id)
          found = true
          break
        }
      }
    }

    if (!found) {
      setHoveredFeature(null)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div className="h-full bg-white relative">
      <div className="absolute top-4 right-4 z-10 bg-white p-2 rounded-md shadow-sm border border-gray-200">
        <div className="text-xs text-gray-600 mb-1">Zoom: {(scale * 100).toFixed(0)}%</div>
        <div className="flex gap-1">
          <button
            onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
            className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            −
          </button>
          <button
            onClick={() => setScale(1)}
            className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            Reset
          </button>
          <button
            onClick={() => setScale(prev => Math.min(3, prev + 0.1))}
            className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            +
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={800}
        className="w-full h-full cursor-move"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  )
}




