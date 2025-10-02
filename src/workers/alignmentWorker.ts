// alignmentWorker.ts - Web Worker for building alignments in background

export interface WorkerAlignRequest {
  type: 'align'
  payload: {
    sequences: Array<{ id: string; name: string; sequence: string }>
    mode: 'dna' | 'protein'
    gapOpen?: number
    gapExtend?: number
  }
}

function needlemanWunsch(a: string, b: string, match = 1, mismatch = -1, gap = -2) {
  const n = a.length
  const m = b.length
  const score: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  const trace: ('D'|'U'|'L')[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill('D'))

  for (let i = 1; i <= n; i++) { score[i][0] = i * gap; trace[i][0] = 'U' }
  for (let j = 1; j <= m; j++) { score[0][j] = j * gap; trace[0][j] = 'L' }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const diag = score[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? match : mismatch)
      const up = score[i - 1][j] + gap
      const left = score[i][j - 1] + gap
      const best = Math.max(diag, up, left)
      score[i][j] = best
      trace[i][j] = best === diag ? 'D' : best === up ? 'U' : 'L'
    }
  }

  let i = n, j = m
  let alignedA = '', alignedB = ''
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && trace[i][j] === 'D') { alignedA = a[i - 1] + alignedA; alignedB = b[j - 1] + alignedB; i--; j-- }
    else if (i > 0 && trace[i][j] === 'U') { alignedA = a[i - 1] + alignedA; alignedB = '-' + alignedB; i-- }
    else { alignedA = '-' + alignedA; alignedB = b[j - 1] + alignedB; j-- }
  }
  return { a: alignedA, b: alignedB, score: score[n][m] }
}

function mergeAlignmentWithSequence(currentAlignment: string[], newSequence: string) {
  const length = currentAlignment[0].length
  let consensus = ''
  for (let i = 0; i < length; i++) {
    const counts: Record<string, number> = {}
    for (const s of currentAlignment) { const c = s[i]; if (c === '-') continue; counts[c] = (counts[c] || 0) + 1 }
    let maxBase = '-', maxCount = 0
    for (const [c, cnt] of Object.entries(counts)) { if (cnt > maxCount) { maxCount = cnt; maxBase = c } }
    consensus += maxBase === '-' ? 'N' : maxBase
  }

  const { a: consAligned, b: seqAligned } = needlemanWunsch(consensus, newSequence)

  let idx = 0
  for (let i = 0; i < consAligned.length; i++) {
    if (consAligned[i] === '-') {
      for (let s = 0; s < currentAlignment.length; s++) {
        currentAlignment[s] = currentAlignment[s].slice(0, idx) + '-' + currentAlignment[s].slice(idx)
      }
      idx++
    } else { idx++ }
  }
  const updatedAlignment: string[] = []
  updatedAlignment.push(...currentAlignment)
  updatedAlignment.push(seqAligned)
  return updatedAlignment
}

function progressiveAlign(_names: string[], sequences: string[]) {
  let aligned: string[]
  if (sequences.length === 1) { aligned = [sequences[0]] }
  else { const { a, b } = needlemanWunsch(sequences[0], sequences[1]); aligned = [a, b] }
  for (let i = 2; i < sequences.length; i++) {
    aligned = mergeAlignmentWithSequence(aligned, sequences[i])
    ;(postMessage as any)({ type: 'progress', value: Math.round(((i + 1) / sequences.length) * 100) })
  }
  return aligned
}

self.onmessage = (e: MessageEvent<WorkerAlignRequest>) => {
  const msg = e.data
  if (msg.type !== 'align') return
  try {
    const { sequences, mode: _mode } = msg.payload
    const names = sequences.map(s => s.name)
    const seqs = sequences.map(s => s.sequence.replace(/\s/g, '').toUpperCase())
    const alignedSeqs = progressiveAlign(names, seqs)
    const result = {
      id: crypto.randomUUID(),
      name: `Alignment (${new Date().toLocaleTimeString()})`,
      sequences: alignedSeqs.map((s, i) => ({ id: crypto.randomUUID(), name: names[i] || `Seq${i+1}`, sequence: s })),
      createdAt: Date.now(),
    }
    ;(postMessage as any)({ type: 'result', alignment: result })
  } catch (err: any) {
    ;(postMessage as any)({ type: 'error', message: err?.message || String(err) })
  }
}
