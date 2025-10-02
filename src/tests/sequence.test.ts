import { describe, it, expect } from 'vitest'
import { 
  complement, 
  reverseComplement, 
  translate, 
  calculateGC,
  findORFs,
  searchSequence 
} from '@/utils/sequence'

describe('Complement', () => {
  it('should complement DNA sequence', () => {
    expect(complement('ATGC', 'dna')).toBe('TACG')
  })

  it('should complement RNA sequence', () => {
    expect(complement('AUGC', 'rna')).toBe('UACG')
  })
})

describe('Reverse Complement', () => {
  it('should reverse complement DNA', () => {
    expect(reverseComplement('ATGC', 'dna')).toBe('GCAT')
  })
})

describe('Translation', () => {
  it('should translate DNA to protein', () => {
    expect(translate('ATGGCC')).toBe('MA')
  })

  it('should handle stop codons', () => {
    expect(translate('ATGTAA')).toBe('M*')
  })

  it('should translate from different frames', () => {
    expect(translate('CATGGCC', 1)).toBe('MA')
  })
})

describe('GC Content', () => {
  it('should calculate GC percentage', () => {
    expect(calculateGC('ATGC')).toBe(50)
    expect(calculateGC('AAAA')).toBe(0)
    expect(calculateGC('GGCC')).toBe(100)
  })
})

describe('ORF Finder', () => {
  it('should find ORFs with start and stop codons', () => {
    const seq = 'ATGATGATGTAA'
    const orfs = findORFs(seq, 9)
    expect(orfs.length).toBeGreaterThan(0)
    expect(orfs[0].start).toBe(0)
  })
})

describe('Sequence Search', () => {
  it('should find exact matches', () => {
    const positions = searchSequence('ATGCATGC', 'ATG', false)
    expect(positions).toEqual([0, 4])
  })

  it('should be case insensitive by default', () => {
    const positions = searchSequence('ATGCATGC', 'atg', false)
    expect(positions).toEqual([0, 4])
  })

  it('should support regex search', () => {
    const positions = searchSequence('ATGCATGC', 'A.G', true)
    expect(positions.length).toBeGreaterThan(0)
  })
})




