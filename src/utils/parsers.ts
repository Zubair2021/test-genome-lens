import { Sequence, Feature, SequenceType, FeatureType, Strand } from '@/types'

export interface ParseResult {
  sequences: Sequence[]
  error?: string
}

// FASTA Parser
export function parseFASTA(content: string): ParseResult {
  const sequences: Sequence[] = []
  const lines = content.split('\n')
  let currentSeq: Partial<Sequence> | null = null
  let sequenceData = ''

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (trimmed.startsWith('>')) {
      // Save previous sequence
      if (currentSeq && sequenceData) {
        sequences.push({
          ...currentSeq,
          sequence: sequenceData,
        } as Sequence)
      }

      // Start new sequence
      const header = trimmed.substring(1).trim()
      const parts = header.split(/\s+/)
      currentSeq = {
        id: crypto.randomUUID(),
        name: parts[0] || 'Unnamed',
        description: parts.slice(1).join(' ') || undefined,
        type: guessSequenceType(sequenceData),
        features: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      sequenceData = ''
    } else {
      sequenceData += trimmed.toUpperCase()
    }
  }

  // Save last sequence
  if (currentSeq && sequenceData) {
    currentSeq.type = guessSequenceType(sequenceData)
    sequences.push({
      ...currentSeq,
      sequence: sequenceData,
    } as Sequence)
  }

  return { sequences }
}

// GenBank Parser (simplified)
export function parseGenBank(content: string): ParseResult {
  const sequences: Sequence[] = []
  const entries = content.split('//').filter(e => e.trim())

  for (const entry of entries) {
    const lines = entry.split('\n')
    let locus = ''
    let definition = ''
    let sequenceData = ''
    const features: Feature[] = []
    let inFeatures = false
    let inOrigin = false
    let currentFeature: Partial<Feature> | null = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      if (line.startsWith('LOCUS')) {
        locus = line.split(/\s+/)[1] || 'Unnamed'
      } else if (line.startsWith('DEFINITION')) {
        definition = line.substring(12).trim()
      } else if (line.startsWith('FEATURES')) {
        inFeatures = true
      } else if (line.startsWith('ORIGIN')) {
        inOrigin = true
        inFeatures = false
        // Save last feature
        if (currentFeature && currentFeature.start !== undefined && currentFeature.end !== undefined) {
          features.push(currentFeature as Feature)
        }
      } else if (inFeatures && line.match(/^\s{5}\S/)) {
        // Save previous feature
        if (currentFeature && currentFeature.start !== undefined && currentFeature.end !== undefined) {
          features.push(currentFeature as Feature)
        }
        
        // Parse feature line
        const match = line.match(/^\s{5}(\S+)\s+(.+)/)
        if (match) {
          const [, type, location] = match
          const coords = parseLocation(location)
          currentFeature = {
            id: crypto.randomUUID(),
            name: type,
            type: (type as FeatureType) || 'misc_feature',
            start: coords.start,
            end: coords.end,
            strand: coords.strand,
            qualifiers: {},
          }
        }
      } else if (inFeatures && currentFeature && line.match(/^\s{21}\//)) {
        // Parse qualifier
        const match = line.match(/^\s{21}\/(\w+)="?([^"]*)"?/)
        if (match) {
          const [, key, value] = match
          if (key === 'label' || key === 'gene') {
            currentFeature.name = value
          }
          if (!currentFeature.qualifiers) currentFeature.qualifiers = {}
          currentFeature.qualifiers[key] = value
        }
      } else if (inOrigin) {
        // Parse sequence data
        const seqMatch = line.match(/[a-zA-Z]+/)
        if (seqMatch) {
          sequenceData += seqMatch[0].toUpperCase()
        }
      }
    }

    if (locus && sequenceData) {
      sequences.push({
        id: crypto.randomUUID(),
        name: locus,
        description: definition,
        type: guessSequenceType(sequenceData),
        sequence: sequenceData.replace(/\s/g, ''),
        features,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }
  }

  return { sequences }
}

function parseLocation(location: string): { start: number; end: number; strand: Strand } {
  // Simplified location parser
  const complementMatch = location.match(/complement\((.+)\)/)
  const isComplement = !!complementMatch
  const loc = complementMatch ? complementMatch[1] : location

  const rangeMatch = loc.match(/(\d+)\.\.(\d+)/)
  if (rangeMatch) {
    return {
      start: parseInt(rangeMatch[1]) - 1, // Convert to 0-indexed
      end: parseInt(rangeMatch[2]) - 1,
      strand: isComplement ? 'reverse' : 'forward',
    }
  }

  const singleMatch = loc.match(/^(\d+)$/)
  if (singleMatch) {
    const pos = parseInt(singleMatch[1]) - 1
    return { start: pos, end: pos, strand: isComplement ? 'reverse' : 'forward' }
  }

  return { start: 0, end: 0, strand: 'forward' }
}

// GFF3 Parser
export function parseGFF3(content: string, sequenceId?: string): Feature[] {
  const features: Feature[] = []
  const lines = content.split('\n')

  for (const line of lines) {
    if (line.startsWith('#') || !line.trim()) continue

    const parts = line.split('\t')
    if (parts.length < 9) continue

    const [seqid, , type, start, end, , strand, , attributes] = parts
    
    if (sequenceId && seqid !== sequenceId) continue

    const attrs: Record<string, string> = {}
    attributes.split(';').forEach(attr => {
      const [key, value] = attr.split('=')
      if (key && value) attrs[key] = value
    })

    features.push({
      id: crypto.randomUUID(),
      name: attrs.Name || attrs.ID || type,
      type: (type as FeatureType) || 'misc_feature',
      start: parseInt(start) - 1, // Convert to 0-indexed
      end: parseInt(end) - 1,
      strand: strand === '-' ? 'reverse' : 'forward',
      qualifiers: attrs,
    })
  }

  return features
}

// Guess sequence type based on content
export function guessSequenceType(sequence: string): SequenceType {
  const clean = sequence.toUpperCase().replace(/\s/g, '')
  const uniqueChars = new Set(clean.split(''))
  
  // Check for protein
  const proteinChars = ['E', 'F', 'I', 'L', 'P', 'Q']
  if (proteinChars.some(c => uniqueChars.has(c))) {
    return 'protein'
  }
  
  // Check for RNA
  if (uniqueChars.has('U') && !uniqueChars.has('T')) {
    return 'rna'
  }
  
  return 'dna'
}

// Export to FASTA
export function exportToFASTA(sequences: Sequence[]): string {
  return sequences.map(seq => {
    const header = seq.description 
      ? `>${seq.name} ${seq.description}`
      : `>${seq.name}`
    const seqLines = seq.sequence.match(/.{1,80}/g) || []
    return [header, ...seqLines].join('\n')
  }).join('\n\n')
}

// EMBL Parser
export function parseEMBL(content: string): ParseResult {
  const sequences: Sequence[] = []
  const entries = content.split('//').filter(e => e.trim())

  for (const entry of entries) {
    const lines = entry.split('\n')
    let id = ''
    let description = ''
    let sequenceData = ''
    const features: Feature[] = []

    for (const line of lines) {
      if (line.startsWith('ID')) {
        id = line.split(/\s+/)[1] || 'Unnamed'
      } else if (line.startsWith('DE')) {
        description += line.substring(5).trim() + ' '
      } else if (line.startsWith('FT')) {
        const featureLine = line.substring(5)
        const match = featureLine.match(/^(\S+)\s+(\d+)\.\.(\d+)/)
        if (match) {
          const [, type, start, end] = match
          features.push({
            id: crypto.randomUUID(),
            name: type,
            type: (type as FeatureType) || 'misc_feature',
            start: parseInt(start) - 1,
            end: parseInt(end) - 1,
            strand: 'forward',
          })
        }
      } else if (line.startsWith('SQ') || line.startsWith('  ')) {
        const seqMatch = line.match(/[a-zA-Z]+/g)
        if (seqMatch) {
          sequenceData += seqMatch.join('').toUpperCase()
        }
      }
    }

    if (id && sequenceData) {
      sequences.push({
        id: crypto.randomUUID(),
        name: id,
        description: description.trim() || undefined,
        type: guessSequenceType(sequenceData),
        sequence: sequenceData.replace(/\s/g, ''),
        features,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }
  }

  return { sequences }
}

// Parse CSV annotations
export function parseCSVAnnotations(content: string, _sequenceId: string): Feature[] {
  const features: Feature[] = []
  const lines = content.split('\n')
  
  // Skip header if present
  const startLine = lines[0]?.includes('name') || lines[0]?.includes('Name') ? 1 : 0
  
  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    // Parse: name,type,start,end,strand,color,notes
    const parts = line.split(',').map(p => p.trim())
    if (parts.length < 4) continue
    
    const [name, type, startStr, endStr, strand, color, notes] = parts
    
    features.push({
      id: crypto.randomUUID(),
      name: name || 'Unnamed',
      type: (type as FeatureType) || 'misc_feature',
      start: parseInt(startStr) - 1, // Convert to 0-indexed
      end: parseInt(endStr) - 1,
      strand: (strand as Strand) || 'forward',
      color: color || undefined,
      notes: notes || undefined,
    })
  }
  
  return features
}

// Export to GenBank (simplified)
export function exportToGenBank(sequence: Sequence): string {
  const lines: string[] = []
  
  // LOCUS line
  const seqType = sequence.type === 'protein' ? 'aa' : 'bp'
  lines.push(`LOCUS       ${sequence.name.padEnd(16)} ${sequence.sequence.length} ${seqType}`)
  
  // DEFINITION
  if (sequence.description) {
    lines.push(`DEFINITION  ${sequence.description}`)
  }
  
  // FEATURES
  if (sequence.features.length > 0) {
    lines.push('FEATURES             Location/Qualifiers')
    for (const feature of sequence.features) {
      const location = feature.strand === 'reverse'
        ? `complement(${feature.start + 1}..${feature.end + 1})`
        : `${feature.start + 1}..${feature.end + 1}`
      lines.push(`     ${feature.type.padEnd(16)} ${location}`)
      lines.push(`                     /label="${feature.name}"`)
      if (feature.notes) {
        lines.push(`                     /note="${feature.notes}"`)
      }
    }
  }
  
  // ORIGIN
  lines.push('ORIGIN')
  const seq = sequence.sequence.toLowerCase()
  for (let i = 0; i < seq.length; i += 60) {
    const chunk = seq.substring(i, i + 60)
    const parts = chunk.match(/.{1,10}/g) || []
    const num = (i + 1).toString().padStart(9)
    lines.push(`${num} ${parts.join(' ')}`)
  }
  
  lines.push('//')
  return lines.join('\n')
}

// Export to GFF3
export function exportToGFF3(sequence: Sequence): string {
  const lines: string[] = []
  
  lines.push('##gff-version 3')
  lines.push(`##sequence-region ${sequence.name} 1 ${sequence.sequence.length}`)
  
  for (const feature of sequence.features) {
    const attrs = `ID=${feature.id};Name=${feature.name}`
    const strandSymbol = feature.strand === 'reverse' ? '-' : '+'
    
    lines.push([
      sequence.name,
      'GenomeLens',
      feature.type,
      feature.start + 1, // Convert to 1-indexed
      feature.end + 1,
      '.',
      strandSymbol,
      '.',
      attrs
    ].join('\t'))
  }
  
  return lines.join('\n')
}




