import { SequenceType } from '@/types'

// Complement and reverse complement
export function complement(sequence: string, type: SequenceType): string {
  const map: Record<string, string> = type === 'rna'
    ? { 'A': 'U', 'U': 'A', 'G': 'C', 'C': 'G', 'N': 'N' }
    : { 'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G', 'N': 'N' }
  
  return sequence
    .toUpperCase()
    .split('')
    .map(base => map[base] || 'N')
    .join('')
}

export function reverseComplement(sequence: string, type: SequenceType): string {
  return complement(sequence, type).split('').reverse().join('')
}

// Translation table
const CODON_TABLE: Record<string, string> = {
  'TTT': 'F', 'TTC': 'F', 'TTA': 'L', 'TTG': 'L',
  'TCT': 'S', 'TCC': 'S', 'TCA': 'S', 'TCG': 'S',
  'TAT': 'Y', 'TAC': 'Y', 'TAA': '*', 'TAG': '*',
  'TGT': 'C', 'TGC': 'C', 'TGA': '*', 'TGG': 'W',
  'CTT': 'L', 'CTC': 'L', 'CTA': 'L', 'CTG': 'L',
  'CCT': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
  'CAT': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
  'CGT': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
  'ATT': 'I', 'ATC': 'I', 'ATA': 'I', 'ATG': 'M',
  'ACT': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
  'AAT': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
  'AGT': 'S', 'AGC': 'S', 'AGA': 'R', 'AGG': 'R',
  'GTT': 'V', 'GTC': 'V', 'GTA': 'V', 'GTG': 'V',
  'GCT': 'A', 'GCC': 'A', 'GCA': 'A', 'GCG': 'A',
  'GAT': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
  'GGT': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G',
}

export function translate(sequence: string, frame: number = 0): string {
  const seq = sequence.toUpperCase().substring(frame)
  let protein = ''
  
  for (let i = 0; i < seq.length - 2; i += 3) {
    const codon = seq.substring(i, i + 3)
    protein += CODON_TABLE[codon] || 'X'
  }
  
  return protein
}

// Find ORFs
export interface ORF {
  start: number
  end: number
  strand: 'forward' | 'reverse'
  frame: number
  sequence: string
  protein: string
}

export function findORFs(sequence: string, minLength: number = 100): ORF[] {
  const orfs: ORF[] = []
  const seq = sequence.toUpperCase()
  
  // Forward strand
  for (let frame = 0; frame < 3; frame++) {
    let start = -1
    for (let i = frame; i < seq.length - 2; i += 3) {
      const codon = seq.substring(i, i + 3)
      
      if (codon === 'ATG' && start === -1) {
        start = i
      } else if ((codon === 'TAA' || codon === 'TAG' || codon === 'TGA') && start !== -1) {
        const orfSeq = seq.substring(start, i + 3)
        if (orfSeq.length >= minLength) {
          orfs.push({
            start,
            end: i + 3,
            strand: 'forward',
            frame,
            sequence: orfSeq,
            protein: translate(orfSeq),
          })
        }
        start = -1
      }
    }
  }
  
  // Reverse strand
  const revSeq = reverseComplement(seq, 'dna')
  for (let frame = 0; frame < 3; frame++) {
    let start = -1
    for (let i = frame; i < revSeq.length - 2; i += 3) {
      const codon = revSeq.substring(i, i + 3)
      
      if (codon === 'ATG' && start === -1) {
        start = i
      } else if ((codon === 'TAA' || codon === 'TAG' || codon === 'TGA') && start !== -1) {
        const orfSeq = revSeq.substring(start, i + 3)
        if (orfSeq.length >= minLength) {
          // Convert coordinates back to forward strand
          orfs.push({
            start: seq.length - (i + 3),
            end: seq.length - start,
            strand: 'reverse',
            frame,
            sequence: orfSeq,
            protein: translate(orfSeq),
          })
        }
        start = -1
      }
    }
  }
  
  return orfs.sort((a, b) => a.start - b.start)
}

// GC content calculation
export function calculateGC(sequence: string): number {
  const seq = sequence.toUpperCase()
  const gc = (seq.match(/[GC]/g) || []).length
  return (gc / seq.length) * 100
}

export function calculateGCWindowed(sequence: string, windowSize: number, step: number = 10): Array<{ position: number; gc: number }> {
  const results: Array<{ position: number; gc: number }> = []
  const seq = sequence.toUpperCase()
  
  for (let i = 0; i < seq.length - windowSize; i += step) {
    const window = seq.substring(i, i + windowSize)
    const gc = calculateGC(window)
    results.push({ position: i, gc })
  }
  
  return results
}

// Search utilities
export function searchSequence(sequence: string, query: string, isRegex: boolean = false, caseSensitive: boolean = false): number[] {
  const positions: number[] = []
  const seq = caseSensitive ? sequence : sequence.toUpperCase()
  const searchQuery = caseSensitive ? query : query.toUpperCase()
  
  if (isRegex) {
    try {
      const flags = caseSensitive ? 'g' : 'gi'
      const regex = new RegExp(searchQuery, flags)
      let match
      while ((match = regex.exec(seq)) !== null) {
        positions.push(match.index)
      }
    } catch {
      // Invalid regex
      return []
    }
  } else {
    let index = seq.indexOf(searchQuery)
    while (index !== -1) {
      positions.push(index)
      index = seq.indexOf(searchQuery, index + 1)
    }
  }
  
  return positions
}

// Restriction enzymes (curated list)
export interface RestrictionEnzyme {
  name: string
  site: string
  cutPosition: number
}

export const COMMON_ENZYMES: RestrictionEnzyme[] = [
  { name: 'EcoRI', site: 'GAATTC', cutPosition: 1 },
  { name: 'BamHI', site: 'GGATCC', cutPosition: 1 },
  { name: 'HindIII', site: 'AAGCTT', cutPosition: 1 },
  { name: 'PstI', site: 'CTGCAG', cutPosition: 5 },
  { name: 'SmaI', site: 'CCCGGG', cutPosition: 3 },
  { name: 'KpnI', site: 'GGTACC', cutPosition: 5 },
  { name: 'SacI', site: 'GAGCTC', cutPosition: 5 },
  { name: 'SalI', site: 'GTCGAC', cutPosition: 1 },
  { name: 'XbaI', site: 'TCTAGA', cutPosition: 1 },
  { name: 'NotI', site: 'GCGGCCGC', cutPosition: 2 },
  { name: 'XhoI', site: 'CTCGAG', cutPosition: 1 },
  { name: 'NdeI', site: 'CATATG', cutPosition: 2 },
  { name: 'NcoI', site: 'CCATGG', cutPosition: 1 },
  { name: 'BglII', site: 'AGATCT', cutPosition: 1 },
  { name: 'SpeI', site: 'ACTAGT', cutPosition: 1 },
]

export function findRestrictionSites(sequence: string, enzymes: RestrictionEnzyme[] = COMMON_ENZYMES): Array<{ enzyme: string; position: number }> {
  const sites: Array<{ enzyme: string; position: number }> = []
  const seq = sequence.toUpperCase()
  
  for (const enzyme of enzymes) {
    const positions = searchSequence(seq, enzyme.site, false, false)
    for (const pos of positions) {
      sites.push({ enzyme: enzyme.name, position: pos })
    }
  }
  
  return sites.sort((a, b) => a.position - b.position)
}

// Color utilities for features
export const FEATURE_COLORS: Record<string, string> = {
  gene: '#4ade80',
  CDS: '#60a5fa',
  promoter: '#f472b6',
  terminator: '#f87171',
  misc_feature: '#a78bfa',
  origin: '#fbbf24',
  primer_bind: '#34d399',
  regulatory: '#fb923c',
  repeat_region: '#a3a3a3',
}

export function getFeatureColor(type: string): string {
  return FEATURE_COLORS[type] || '#9ca3af'
}



