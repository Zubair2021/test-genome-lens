import { useState, useEffect } from 'react'
import { Sequence } from '@/types'
import { findRestrictionSites, COMMON_ENZYMES } from '@/utils/sequence'

interface RestrictionViewerProps {
  sequence: Sequence
}

export default function RestrictionViewer({ sequence }: RestrictionViewerProps) {
  const [selectedEnzymes, setSelectedEnzymes] = useState<string[]>(
    COMMON_ENZYMES.map(e => e.name)
  )
  const [sites, setSites] = useState<Array<{ enzyme: string; position: number }>>([])

  useEffect(() => {
    if (sequence.sequence && sequence.type !== 'protein') {
      const enzymes = COMMON_ENZYMES.filter(e => selectedEnzymes.includes(e.name))
      const found = findRestrictionSites(sequence.sequence, enzymes)
      setSites(found)
    }
  }, [sequence, selectedEnzymes])

  const toggleEnzyme = (name: string) => {
    setSelectedEnzymes(prev =>
      prev.includes(name)
        ? prev.filter(e => e !== name)
        : [...prev, name]
    )
  }

  const groupedSites = sites.reduce((acc, site) => {
    if (!acc[site.enzyme]) acc[site.enzyme] = []
    acc[site.enzyme].push(site.position)
    return acc
  }, {} as Record<string, number[]>)

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold mb-2">Restriction Sites</h3>
        <p className="text-sm text-gray-600">Found {sites.length} sites</p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Enzyme Selection */}
        <div className="w-64 border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Enzymes</h4>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedEnzymes(COMMON_ENZYMES.map(e => e.name))}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  All
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={() => setSelectedEnzymes([])}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  None
                </button>
              </div>
            </div>
            <div className="space-y-1">
              {COMMON_ENZYMES.map(enzyme => {
                const count = groupedSites[enzyme.name]?.length || 0
                return (
                  <label
                    key={enzyme.name}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedEnzymes.includes(enzyme.name)}
                        onChange={() => toggleEnzyme(enzyme.name)}
                        className="rounded"
                      />
                      <span className="text-sm font-mono">{enzyme.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {count > 0 && `${count}×`}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sites List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {Object.keys(groupedSites).length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No restriction sites found for selected enzymes
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedSites).map(([enzyme, positions]) => {
                  const enzymeInfo = COMMON_ENZYMES.find(e => e.name === enzyme)
                  return (
                    <div key={enzyme} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold font-mono">{enzyme}</h5>
                        <span className="text-sm text-gray-600">
                          {positions.length} site{positions.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {enzymeInfo && (
                        <p className="text-sm text-gray-600 mb-3 font-mono">
                          Recognition: {enzymeInfo.site}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {positions.map((pos, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-primary-50 text-primary-700 text-sm rounded font-mono"
                          >
                            {pos + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

