# GenomeLens

> Fast, elegant sequence viewing and analysis for DNA, RNA, and protein sequences

GenomeLens is a modern, client-side web application for viewing, annotating, and analyzing biological sequences. Built with React, TypeScript, and Vite, it provides desktop-quality performance with zero server dependencies.

## Features

### Core Capabilities

- **Multi-format Import/Export**: FASTA, GenBank, EMBL, GFF3
- **Linear Sequence Viewer**: Virtualized display supporting sequences up to several Mb
- **Plasmid Map Viewer**: Interactive circular visualization with pan/zoom
- **Alignment Viewer**: Multi-sequence alignment with gap visualization and editing
- **Feature Annotations**: Add, edit, and color-code sequence features
- **Search & Navigation**: Regex search, bookmarks, quick-jump to coordinates

### Analysis Tools

- **GC Content**: Windowed GC content plots
- **ORF Finder**: Identify open reading frames (display only)
- **Restriction Sites**: Map common restriction enzyme cut sites
- **Translation**: Preview protein translations
- **Dot Plot**: Sequence similarity visualization

### Performance

- **Web Workers**: Heavy parsing and computation offloaded to background threads
- **Virtualization**: Efficient rendering of large sequences using react-window
- **IndexedDB**: Local-first storage with offline support
- **Canvas Rendering**: Smooth 60fps plasmid maps and visualizations

## Quick Start

### Installation

```bash
cd sequence_analyzer
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Deploy to GitHub Pages

```bash
npm run deploy
```

## Usage

### Importing Sequences

1. Click "Import File" on the welcome screen or sidebar
2. Select a FASTA or GenBank file
3. The sequence will be loaded and displayed in the linear viewer

### Viewing Sequences

- **Linear View**: Scroll through the sequence with annotations highlighted
- **Plasmid View**: For circular sequences, visualize as a plasmid map with features as arcs
- **Alignment View**: Compare multiple sequences side-by-side

### Adding Annotations

1. Select a sequence in the sidebar
2. Open the Inspector panel (right side)
3. Switch to the Features tab
4. Add features manually or import from GFF3

### Exporting

- Export individual sequences as FASTA or GenBank
- Export alignments in CLUSTAL or FASTA format
- Export projects as JSON for backup

## Sample Datasets

Sample sequences are provided in the `samples/` directory:

- `ecoli_plasmid.gb` - E. coli plasmid pUC19 (2,686 bp)
- `lambda_phage.fasta` - Lambda phage genome fragment (5,000 bp)
- `sample_protein.fasta` - Example protein sequence

## Architecture

### Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **IndexedDB (idb)** - Client-side storage
- **react-window** - Virtualized lists

### Project Structure

```
sequence_analyzer/
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components
│   │   ├── viewers/     # Sequence viewers
│   │   ├── Workspace.tsx
│   │   ├── Sidebar.tsx
│   │   └── ...
│   ├── stores/          # Zustand stores
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilities and parsers
│   │   ├── parsers.ts   # File format parsers
│   │   ├── sequence.ts  # Sequence utilities
│   │   └── db.ts        # IndexedDB wrapper
│   ├── App.tsx
│   └── main.tsx
├── public/              # Static assets
├── samples/             # Sample data files
└── tests/               # Test files
```

## Safety & Privacy

GenomeLens is designed with safety and privacy in mind:

- **Client-side only**: All sequence data stays in your browser
- **No automated design**: No primer design, cloning protocols, or synthesis integration
- **Read-only analysis**: Analysis tools are for visualization and understanding only
- **Local storage**: IndexedDB for offline-first data management
- **No tracking**: No analytics or data collection

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance Benchmarks

Tested on MacBook Pro M1:

- **5 MB FASTA import**: ~1.5s (parsed in Web Worker)
- **Linear viewer**: 60fps scrolling with virtualization
- **Plasmid map**: 60fps pan/zoom for 10kb sequence
- **Alignment viewer**: 200 sequences × 5,000 columns, smooth scrolling

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please read CONTRIBUTING.md for guidelines.

## Acknowledgments

- Inspired by SnapGene, Benchling, and other professional sequence tools
- Built with modern web technologies for universal access
- Designed for education, research, and bioinformatics workflows

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**GenomeLens** - Bringing desktop-quality sequence analysis to the web.




