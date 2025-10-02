import { useState } from 'react'
import { FileUp, Plus, Download, Dna, AlignLeft } from 'lucide-react'
import Button from './ui/Button'
import { useProjectStore } from '@/stores/projectStore'
import { parseFASTA, parseGenBank, parseEMBL, parseCSVAnnotations, exportToFASTA, exportToGenBank, exportToGFF3 } from '@/utils/parsers'
import { parseCLUSTAL, parseFASTAAlignment, parseStockholm, parseMAF } from '@/utils/alignmentParsers'
import { Sequence } from '@/types'
import CreateAlignmentDialog from './dialogs/CreateAlignmentDialog'

export default function Sidebar() {
  const { currentProject, selectedSequenceId, selectSequence, addSequence, setView, addAlignment, addFeature } = useProjectStore()
  const [activeTab, setActiveTab] = useState<'sequences' | 'alignments'>('sequences')
  const [showCreateAlignment, setShowCreateAlignment] = useState(false)

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const content = await file.text()
    let sequences: Sequence[] = []

    if (file.name.endsWith('.fasta') || file.name.endsWith('.fa') || file.name.endsWith('.fna')) {
      const result = parseFASTA(content)
      sequences = result.sequences
    } else if (file.name.endsWith('.gb') || file.name.endsWith('.gbk')) {
      const result = parseGenBank(content)
      sequences = result.sequences
    } else if (file.name.endsWith('.embl') || file.name.endsWith('.dat')) {
      const result = parseEMBL(content)
      sequences = result.sequences
    } else if (file.name.endsWith('.csv')) {
      // CSV is for annotations, need to select target sequence
      if (selectedSequenceId) {
        const features = parseCSVAnnotations(content, selectedSequenceId)
        features.forEach(feature => addFeature(selectedSequenceId, feature))
      } else {
        alert('Please select a sequence first to import annotations')
      }
      e.target.value = ''
      return
    }

    sequences.forEach(seq => addSequence(seq))
    e.target.value = ''
  }

  const handleExport = (sequence: Sequence, format: 'fasta' | 'genbank' | 'gff3') => {
    let content: string
    let extension: string

    switch (format) {
      case 'fasta':
        content = exportToFASTA([sequence])
        extension = 'fasta'
        break
      case 'genbank':
        content = exportToGenBank(sequence)
        extension = 'gb'
        break
      case 'gff3':
        content = exportToGFF3(sequence)
        extension = 'gff3'
        break
    }
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${sequence.name}.${extension}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleNewSequence = () => {
    const newSeq: Sequence = {
      id: crypto.randomUUID(),
      name: 'New Sequence',
      type: 'dna',
      sequence: '',
      features: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    addSequence(newSeq)
  }

  const handleImportAlignment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const content = await file.text()
    let alignment = null

    // Try different alignment formats
    if (file.name.endsWith('.aln') || file.name.endsWith('.clustal')) {
      alignment = parseCLUSTAL(content)
    } else if (file.name.endsWith('.sto') || file.name.endsWith('.stockholm')) {
      alignment = parseStockholm(content)
    } else if (file.name.endsWith('.maf')) {
      alignment = parseMAF(content)
    } else if (file.name.endsWith('.fasta') || file.name.endsWith('.fa')) {
      alignment = parseFASTAAlignment(content)
    }

    if (alignment) {
      alignment.name = file.name.replace(/\.[^/.]+$/, '')
      addAlignment(alignment)
      setView('alignment')
    }

    e.target.value = ''
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Project Assets</h3>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'sequences' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('sequences')}
            className="flex-1"
          >
            <Dna className="w-4 h-4 mr-1" />
            Sequences
          </Button>
          <Button
            variant={activeTab === 'alignments' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('alignments')}
            className="flex-1"
          >
            <AlignLeft className="w-4 h-4 mr-1" />
            Alignments
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'sequences' ? (
          <div className="space-y-2">
            {currentProject?.sequences.map(seq => (
              <div
                key={seq.id}
                className={`p-3 rounded-md cursor-pointer transition-colors ${
                  seq.id === selectedSequenceId
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
                onClick={() => {
                  selectSequence(seq.id)
                  setView('linear')
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{seq.name}</p>
                    <p className="text-xs text-gray-500">
                      {seq.sequence.length.toLocaleString()} {seq.type === 'protein' ? 'aa' : 'bp'}
                    </p>
                    {seq.features.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {seq.features.length} feature{seq.features.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleExport(seq, 'fasta')
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Export as FASTA"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {currentProject?.sequences.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">
                No sequences yet
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {currentProject?.alignments.map(aln => (
              <div
                key={aln.id}
                className="p-3 rounded-md hover:bg-gray-50 cursor-pointer border border-gray-200"
                onClick={() => setView('alignment')}
              >
                <p className="font-medium text-sm">{aln.name}</p>
                <p className="text-xs text-gray-500">
                  {aln.sequences.length} sequences × {aln.sequences[0]?.sequence.length || 0} bp
                </p>
              </div>
            ))}
            {currentProject?.alignments.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">
                No alignments yet
              </p>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 space-y-2">
        {activeTab === 'sequences' && (
          <>
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={handleNewSequence}
            >
              <Plus className="w-4 h-4 mr-1" />
              New Sequence
            </Button>
            <label className="block">
              <span className="flex h-8 w-full items-center justify-center rounded-md bg-gray-100 text-gray-900 hover:bg-gray-200 px-3 text-sm font-medium transition-colors cursor-pointer">
                <FileUp className="w-4 h-4 mr-1" />
                Import File
              </span>
              <input
                type="file"
                className="hidden"
                accept=".fasta,.fa,.fna,.gb,.gbk,.embl,.dat,.csv"
                onChange={handleImport}
              />
            </label>
          </>
        )}
        {activeTab === 'alignments' && (
          <label className="block">
            <span className="flex h-8 w-full items-center justify-center rounded-md bg-primary-600 text-white hover:bg-primary-700 px-3 text-sm font-medium transition-colors cursor-pointer">
              <FileUp className="w-4 h-4 mr-1" />
              Import Alignment
            </span>
            <input
              type="file"
              className="hidden"
              accept=".aln,.clustal,.sto,.stockholm,.maf,.fasta,.fa"
              onChange={handleImportAlignment}
            />
          </label>
        )}
        {activeTab === 'alignments' && (
          <Button variant="secondary" size="sm" className="w-full" onClick={() => setShowCreateAlignment(true)}>
            Create Alignment
          </Button>
        )}
      </div>
      {showCreateAlignment && (
        <CreateAlignmentDialog onClose={() => setShowCreateAlignment(false)} />
      )}
    </div>
  )
}



