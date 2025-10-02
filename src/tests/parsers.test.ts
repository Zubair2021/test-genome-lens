import { describe, it, expect } from 'vitest'
import { parseFASTA, parseGenBank, guessSequenceType } from '@/utils/parsers'

describe('FASTA Parser', () => {
  it('should parse single sequence FASTA', () => {
    const fasta = `>seq1 Test sequence
ATGCATGC
ATGCATGC`
    
    const result = parseFASTA(fasta)
    expect(result.sequences).toHaveLength(1)
    expect(result.sequences[0].name).toBe('seq1')
    expect(result.sequences[0].sequence).toBe('ATGCATGCATGCATGC')
    expect(result.sequences[0].description).toBe('Test sequence')
  })

  it('should parse multi-sequence FASTA', () => {
    const fasta = `>seq1
ATGC
>seq2
GCTA`
    
    const result = parseFASTA(fasta)
    expect(result.sequences).toHaveLength(2)
    expect(result.sequences[0].name).toBe('seq1')
    expect(result.sequences[1].name).toBe('seq2')
  })

  it('should handle empty lines', () => {
    const fasta = `>seq1

ATGC

ATGC
`
    
    const result = parseFASTA(fasta)
    expect(result.sequences).toHaveLength(1)
    expect(result.sequences[0].sequence).toBe('ATGCATGC')
  })
})

describe('Sequence Type Guesser', () => {
  it('should identify DNA sequences', () => {
    expect(guessSequenceType('ATGCATGC')).toBe('dna')
  })

  it('should identify RNA sequences', () => {
    expect(guessSequenceType('AUGCAUGC')).toBe('rna')
  })

  it('should identify protein sequences', () => {
    expect(guessSequenceType('MYPFIRTARMFG')).toBe('protein')
  })
})

describe('GenBank Parser', () => {
  it('should parse basic GenBank format', () => {
    const genbank = `LOCUS       test        10 bp
DEFINITION  Test sequence
ORIGIN
        1 atgcatgcat
//`
    
    const result = parseGenBank(genbank)
    expect(result.sequences).toHaveLength(1)
    expect(result.sequences[0].name).toBe('test')
    expect(result.sequences[0].sequence).toContain('ATGCATGCAT')
  })
})




