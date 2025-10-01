export type SequenceType = 'dna' | 'rna' | 'protein'
export type Strand = 'forward' | 'reverse' | 'both'
export type FeatureType = 'gene' | 'CDS' | 'promoter' | 'terminator' | 'misc_feature' | 'origin' | 'primer_bind' | 'regulatory' | 'repeat_region'

export interface Sequence {
  id: string
  name: string
  type: SequenceType
  sequence: string
  description?: string
  circular?: boolean
  features: Feature[]
  metadata?: Record<string, string>
  createdAt: number
  updatedAt: number
}

export interface Feature {
  id: string
  name: string
  type: FeatureType
  start: number
  end: number
  strand: Strand
  color?: string
  notes?: string
  qualifiers?: Record<string, string>
}

export interface Alignment {
  id: string
  name: string
  sequences: AlignedSequence[]
  consensus?: string
  createdAt: number
}

export interface AlignedSequence {
  id: string
  name: string
  sequence: string // includes gaps
  originalSequence?: string
}

export interface Project {
  id: string
  name: string
  description?: string
  sequences: Sequence[]
  alignments: Alignment[]
  createdAt: number
  updatedAt: number
}

export interface SearchResult {
  sequenceId: string
  position: number
  length: number
  match: string
}

export interface AnalysisResult {
  id: string
  type: 'gc_content' | 'orf' | 'restriction' | 'dotplot'
  sequenceId: string
  data: unknown
  createdAt: number
}

export interface GCContentData {
  windowSize: number
  values: Array<{ position: number; gc: number }>
}

export interface ORF {
  start: number
  end: number
  strand: Strand
  frame: number
  sequence: string
  protein: string
}

export interface RestrictionSite {
  name: string
  position: number
  sequence: string
  cutPosition: number
}

export interface Bookmark {
  id: string
  name: string
  sequenceId: string
  position: number
  color?: string
}



