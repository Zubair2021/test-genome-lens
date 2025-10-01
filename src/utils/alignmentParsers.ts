import { Alignment, AlignedSequence } from '@/types'

// Parse CLUSTAL format
export function parseCLUSTAL(content: string): Alignment | null {
  const lines = content.split('\n').filter(l => l.trim())
  
  if (!lines[0].includes('CLUSTAL')) {
    return null
  }

  const sequences: Map<string, string> = new Map()
  let consensus = ''

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Skip empty lines and consensus lines
    if (!line || line.match(/^[*:. ]+$/)) {
      if (line.match(/^[*:. ]+$/)) {
        consensus += line
      }
      continue
    }

    // Parse sequence line: name sequence
    const match = line.match(/^(\S+)\s+([A-Za-z\-]+)/)
    if (match) {
      const [, name, seq] = match
      const existing = sequences.get(name) || ''
      sequences.set(name, existing + seq)
    }
  }

  const alignedSequences: AlignedSequence[] = Array.from(sequences.entries()).map(([name, seq]) => ({
    id: crypto.randomUUID(),
    name,
    sequence: seq,
  }))

  return {
    id: crypto.randomUUID(),
    name: 'CLUSTAL Alignment',
    sequences: alignedSequences,
    consensus: consensus || undefined,
    createdAt: Date.now(),
  }
}

// Parse FASTA alignment (simple aligned FASTA)
export function parseFASTAAlignment(content: string): Alignment | null {
  const lines = content.split('\n')
  const sequences: AlignedSequence[] = []
  let currentSeq: AlignedSequence | null = null
  let sequenceData = ''

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (trimmed.startsWith('>')) {
      // Save previous sequence
      if (currentSeq && sequenceData) {
        currentSeq.sequence = sequenceData
        sequences.push(currentSeq)
      }

      // Start new sequence
      const name = trimmed.substring(1).trim()
      currentSeq = {
        id: crypto.randomUUID(),
        name,
        sequence: '',
      }
      sequenceData = ''
    } else {
      sequenceData += trimmed
    }
  }

  // Save last sequence
  if (currentSeq && sequenceData) {
    currentSeq.sequence = sequenceData
    sequences.push(currentSeq)
  }

  if (sequences.length < 2) {
    return null // Need at least 2 sequences for alignment
  }

  return {
    id: crypto.randomUUID(),
    name: 'FASTA Alignment',
    sequences,
    createdAt: Date.now(),
  }
}

// Parse Stockholm format
export function parseStockholm(content: string): Alignment | null {
  const lines = content.split('\n')
  
  if (!lines[0].includes('# STOCKHOLM')) {
    return null
  }

  const sequences: Map<string, string> = new Map()

  for (const line of lines) {
    const trimmed = line.trim()
    
    // Skip comments and markup
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) {
      continue
    }

    // Parse sequence line
    const match = trimmed.match(/^(\S+)\s+([A-Za-z\-\.]+)/)
    if (match) {
      const [, name, seq] = match
      const existing = sequences.get(name) || ''
      sequences.set(name, existing + seq.replace(/\./g, '-')) // Convert . to -
    }
  }

  const alignedSequences: AlignedSequence[] = Array.from(sequences.entries()).map(([name, seq]) => ({
    id: crypto.randomUUID(),
    name,
    sequence: seq,
  }))

  return {
    id: crypto.randomUUID(),
    name: 'Stockholm Alignment',
    sequences: alignedSequences,
    createdAt: Date.now(),
  }
}

// Parse MAF format
export function parseMAF(content: string): Alignment | null {
  const lines = content.split('\n')
  const sequences: AlignedSequence[] = []

  let inAlignment = false
  for (const line of lines) {
    const trimmed = line.trim()
    
    if (trimmed.startsWith('a ')) {
      inAlignment = true
      continue
    }
    
    if (trimmed.startsWith('s ') && inAlignment) {
      const parts = trimmed.split(/\s+/)
      if (parts.length >= 7) {
        const name = parts[1]
        const seq = parts[6]
        sequences.push({
          id: crypto.randomUUID(),
          name,
          sequence: seq,
        })
      }
    }
    
    if (trimmed === '') {
      inAlignment = false
    }
  }

  if (sequences.length < 2) {
    return null
  }

  return {
    id: crypto.randomUUID(),
    name: 'MAF Alignment',
    sequences,
    createdAt: Date.now(),
  }
}

// Export alignment to CLUSTAL format
export function exportToCLUSTAL(alignment: Alignment): string {
  const lines: string[] = ['CLUSTAL multiple sequence alignment', '']
  
  const maxNameLength = Math.max(...alignment.sequences.map(s => s.name.length))
  const seqLength = alignment.sequences[0]?.sequence.length || 0
  const blockSize = 60

  for (let start = 0; start < seqLength; start += blockSize) {
    for (const seq of alignment.sequences) {
      const block = seq.sequence.substring(start, start + blockSize)
      const paddedName = seq.name.padEnd(maxNameLength + 2)
      lines.push(`${paddedName}${block}`)
    }
    
    // Add consensus line (simplified)
    const consensus = ' '.repeat(maxNameLength + 2) + '*'.repeat(Math.min(blockSize, seqLength - start))
    lines.push(consensus)
    lines.push('')
  }

  return lines.join('\n')
}

// Export alignment to FASTA format
export function exportToFASTAAlignment(alignment: Alignment): string {
  return alignment.sequences.map(seq => 
    `>${seq.name}\n${seq.sequence.match(/.{1,80}/g)?.join('\n') || seq.sequence}`
  ).join('\n\n')
}

// Calculate consensus sequence
export function calculateConsensus(alignment: Alignment): string {
  if (alignment.sequences.length === 0) return ''
  
  const length = alignment.sequences[0].sequence.length
  let consensus = ''
  
  for (let i = 0; i < length; i++) {
    const bases: Record<string, number> = {}
    let gapCount = 0
    
    for (const seq of alignment.sequences) {
      const base = seq.sequence[i]
      if (base === '-') {
        gapCount++
      } else {
        bases[base] = (bases[base] || 0) + 1
      }
    }
    
    // Find most common base
    let maxCount = 0
    let maxBase = '-'
    for (const [base, count] of Object.entries(bases)) {
      if (count > maxCount) {
        maxCount = count
        maxBase = base
      }
    }
    
    // Use gap if more than half are gaps
    consensus += gapCount > alignment.sequences.length / 2 ? '-' : maxBase
  }
  
  return consensus
}

// Calculate alignment statistics
export interface AlignmentStats {
  length: number
  sequences: number
  identity: number
  gaps: number
  conservedPositions: number
}

export function calculateAlignmentStats(alignment: Alignment): AlignmentStats {
  const length = alignment.sequences[0]?.sequence.length || 0
  const sequences = alignment.sequences.length
  
  let identicalPositions = 0
  let gapPositions = 0
  let conservedPositions = 0
  
  for (let i = 0; i < length; i++) {
    const bases = alignment.sequences.map(s => s.sequence[i])
    const uniqueBases = new Set(bases.filter(b => b !== '-'))
    
    if (uniqueBases.size === 1 && bases.filter(b => b !== '-').length === sequences) {
      identicalPositions++
    }
    
    if (bases.includes('-')) {
      gapPositions++
    }
    
    if (uniqueBases.size <= 3) { // Conservative substitution
      conservedPositions++
    }
  }
  
  return {
    length,
    sequences,
    identity: (identicalPositions / length) * 100,
    gaps: (gapPositions / (length * sequences)) * 100,
    conservedPositions,
  }
}

