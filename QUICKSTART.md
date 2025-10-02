# GenomeLens - Quick Start Guide

Get started with GenomeLens in 5 minutes!

## Installation

```bash
cd sequence_analyzer
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Try It Out

### 1. Create a Project

- Click "New Project"
- Name it "Test Project"
- Click "Create Project"

### 2. Import a Sample Sequence

- Click "Import File" in the sidebar
- Navigate to `samples/ecoli_plasmid.gb`
- The plasmid will load with features

### 3. Explore the Views

**Linear View:**
- See the sequence with color-coded bases
- Scroll through the sequence
- Features are highlighted

**Plasmid View:**
- Click the circular icon in toolbar
- Pan by dragging
- Zoom with mouse wheel
- Hover over features for details

**Inspector:**
- View sequence info on the right
- Click Features tab
- See all annotations

### 4. Try Analysis Tools

**GC Content:**
- With a sequence selected
- Click the Activity icon (GC Content)
- View the GC% plot

**Search:**
- Click Search icon
- Type "ATG"
- Results are highlighted

## Build for Production

```bash
npm run build
```

The built files will be in `dist/` directory.

## Deploy to GitHub Pages

1. Push your code to GitHub
2. Enable GitHub Pages in repository settings
3. Set source to "GitHub Actions"
4. Push to main branch - automatic deployment!

Or manually:

```bash
npm run deploy
```

## What to Try Next

1. **Import your own sequences** - FASTA or GenBank files
2. **Add annotations** - Create custom features
3. **Export data** - Save as FASTA or GenBank
4. **Create alignments** - Compare multiple sequences
5. **Use ORF finder** - Find coding regions

## Common Tasks

### Import a FASTA file

1. Click "Import File"
2. Select your .fasta file
3. Sequence loads automatically

### Add a feature

1. Select a sequence
2. Open Inspector (right panel)
3. Click Features tab
4. Click "Add Feature"
5. Enter details and save

### Export a sequence

1. Select sequence in sidebar
2. Click download icon
3. Choose FASTA or GenBank format

### Search for a pattern

1. Click Search (or Ctrl/Cmd + F)
2. Enter sequence (e.g., "GAATTC")
3. Toggle regex for patterns
4. Navigate results

## Sample Data

Try these samples in the `samples/` folder:

- `ecoli_plasmid.gb` - E. coli plasmid with features
- `lambda_phage.fasta` - Viral genome fragment
- `sample_protein.fasta` - Protein sequence

## Keyboard Shortcuts

- `Ctrl/Cmd + F` - Search
- `Ctrl/Cmd + C` - Copy selection
- `Ctrl/Cmd + N` - New sequence
- `Ctrl/Cmd + O` - Import file
- `Ctrl/Cmd + B` - Toggle sidebar

## Need Help?

- Read [USER_GUIDE.md](USER_GUIDE.md) for detailed instructions
- Check [README.md](README.md) for technical details
- Review [BENCHMARKS.md](BENCHMARKS.md) for performance info
- Open an issue on GitHub for support

## Tips

✨ **Use virtualization** - Large sequences scroll smoothly  
✨ **Work offline** - All data stays in your browser  
✨ **Export regularly** - Back up your projects  
✨ **Try keyboard shortcuts** - Faster navigation  
✨ **Use regex search** - Find complex patterns  

## What's Next?

Now that you're up and running:

1. Import your research sequences
2. Annotate features
3. Run analysis tools
4. Export results
5. Share with colleagues

## Deployment Options

### GitHub Pages (Recommended)

1. Push code to GitHub
2. Enable Pages in settings
3. Automatic deployment on push

### Netlify

1. Connect your repository
2. Build command: `npm run build`
3. Publish directory: `dist`

### Vercel

1. Import project
2. Framework: Vite
3. Auto-detected settings

### Self-Hosted

1. Build: `npm run build`
2. Serve `dist/` folder
3. Any static file server works

---

**Ready to go!** Start analyzing sequences with GenomeLens 🧬




