// Pairwise identity calculation
export function calculatePairwiseIdentity(seq1: string, seq2: string): number {
  const length = Math.min(seq1.length, seq2.length)
  if (length === 0) return 0
  
  let matches = 0
  for (let i = 0; i < length; i++) {
    if (seq1[i] === seq2[i]) {
      matches++
    }
  }
  
  return (matches / length) * 100
}

// Dot plot data generation
export interface DotPlotPoint {
  x: number
  y: number
  score: number
}

export function generateDotPlot(
  seq1: string,
  seq2: string,
  windowSize: number = 10,
  threshold: number = 70
): DotPlotPoint[] {
  const points: DotPlotPoint[] = []
  
  const maxX = seq1.length - windowSize + 1
  const maxY = seq2.length - windowSize + 1
  
  for (let x = 0; x < maxX; x += 1) {
    for (let y = 0; y < maxY; y += 1) {
      const window1 = seq1.substring(x, x + windowSize)
      const window2 = seq2.substring(y, y + windowSize)
      
      let matches = 0
      for (let i = 0; i < windowSize; i++) {
        if (window1[i] === window2[i]) {
          matches++
        }
      }
      
      const score = (matches / windowSize) * 100
      
      if (score >= threshold) {
        points.push({ x, y, score })
      }
    }
  }
  
  return points
}

// Simple local alignment scoring (for visualization)
export interface AlignmentScore {
  score: number
  identity: number
  gaps: number
}

export function calculateAlignmentScore(seq1: string, seq2: string): AlignmentScore {
  const length = Math.max(seq1.length, seq2.length)
  let matches = 0
  let gaps = 0
  let score = 0
  
  for (let i = 0; i < length; i++) {
    const c1 = seq1[i] || '-'
    const c2 = seq2[i] || '-'
    
    if (c1 === '-' || c2 === '-') {
      gaps++
      score -= 2 // Gap penalty
    } else if (c1 === c2) {
      matches++
      score += 1 // Match
    } else {
      score -= 1 // Mismatch
    }
  }
  
  return {
    score,
    identity: (matches / length) * 100,
    gaps
  }
}

