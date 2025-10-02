# GenomeLens User Guide

Welcome to GenomeLens! This guide will help you get started with viewing, annotating, and analyzing biological sequences.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Projects](#projects)
3. [Importing Sequences](#importing-sequences)
4. [Viewing Sequences](#viewing-sequences)
5. [Annotations](#annotations)
6. [Analysis Tools](#analysis-tools)
7. [Exporting Data](#exporting-data)
8. [Keyboard Shortcuts](#keyboard-shortcuts)
9. [Tips & Tricks](#tips--tricks)

## Getting Started

### First Launch

When you first open GenomeLens, you'll see the welcome screen with three options:

1. **New Project** - Start a fresh project
2. **Import File** - Load sequences from a file
3. **Open Recent** - Continue working on existing projects

### Creating Your First Project

1. Click "New Project"
2. Enter a project name (e.g., "My Research")
3. Optionally add a description
4. Click "Create Project"

You'll be taken to the main workspace.

## Projects

### Project Structure

Each project contains:

- **Sequences**: DNA, RNA, or protein sequences
- **Alignments**: Multi-sequence alignments
- **Annotations**: Features and bookmarks

### Managing Projects

Projects are automatically saved to your browser's local storage. You can:

- **Switch projects**: Return to welcome screen via File menu
- **Delete projects**: From the recent projects list
- **Export projects**: Download as JSON for backup

## Importing Sequences

### Supported Formats

GenomeLens supports:

- **FASTA** (.fasta, .fa, .fna) - Single or multi-sequence
- **GenBank** (.gb, .gbk) - With features and annotations
- **EMBL** (.embl) - European format
- **GFF3** (.gff, .gff3) - Annotations only

### Import Methods

**Method 1: Welcome Screen**
1. Click "Import File"
2. Select your file
3. Sequences are loaded into a new project

**Method 2: From Workspace**
1. Click "Import File" in the sidebar
2. Select your file
3. Sequences are added to current project

### Multi-FASTA Import

When importing multi-FASTA files, each sequence becomes a separate entry in your project.

## Viewing Sequences

### Linear Viewer

The default view for all sequences.

**Features:**
- Virtualized scrolling for large sequences
- Color-coded bases (A=green, T/U=red, G=blue, C=amber)
- Feature highlights
- Position indicators
- Text selection and copy

**Controls:**
- Scroll to navigate
- Click and drag to select
- Copy selected sequence

### Plasmid Viewer

For circular sequences (plasmids).

**Features:**
- Interactive circular map
- Feature arcs (forward strand outside, reverse inside)
- Pan and zoom
- Position markers every 1kb
- Feature labels

**Controls:**
- Mouse wheel: Zoom in/out
- Click and drag: Pan
- Hover: Feature details
- Reset button: Return to default view

### Alignment Viewer

For viewing multi-sequence alignments.

**Features:**
- Synchronized scrolling
- Ruler showing positions
- Gap visualization (-)
- Mismatch highlighting
- Consensus sequence

**Controls:**
- Horizontal scroll: View different regions
- Vertical scroll: Browse sequences

## Annotations

### Viewing Features

In the Inspector panel (right side):

1. Click the Features tab
2. See all features for the selected sequence
3. Click a feature to highlight it

### Adding Features

1. Select a sequence
2. Click "Add Feature" in Inspector
3. Set:
   - Feature name
   - Type (gene, CDS, promoter, etc.)
   - Start and end positions
   - Strand (forward/reverse)
   - Color (optional)
   - Notes (optional)

### Feature Types

Common feature types:

- **gene**: Gene region
- **CDS**: Coding sequence
- **promoter**: Promoter region
- **terminator**: Termination sequence
- **origin**: Replication origin
- **misc_feature**: Miscellaneous feature

### Importing Annotations

Import GFF3 files to add annotations to existing sequences:

1. Have a sequence loaded
2. Import GFF3 file
3. Features are matched by sequence ID
4. Review in Inspector

## Analysis Tools

### GC Content

Calculate GC percentage:

1. Select a sequence
2. Click GC Content tool
3. View windowed GC plot
4. Adjust window size

### ORF Finder

Find open reading frames:

1. Select a DNA sequence
2. Click ORF Finder
3. Set minimum length (default: 100 bp)
4. View ORFs on all frames
5. Click to see translation

### Restriction Sites

Map restriction enzyme cut sites:

1. Select a DNA sequence
2. Click Restriction Sites
3. Choose enzymes from list
4. View cut positions
5. Export site map

### Translation

Preview protein translations:

1. Select a DNA/RNA sequence
2. Click Translation tool
3. Choose reading frame (0, 1, or 2)
4. View protein sequence
5. Export translation

### Search

Find sequences or patterns:

1. Click Search icon or Ctrl+F
2. Enter search term
3. Toggle regex mode for patterns
4. Results highlighted in view
5. Navigate between matches

## Exporting Data

### Export Sequences

**Single Sequence:**
1. Select sequence in sidebar
2. Click download icon
3. Choose format (FASTA or GenBank)
4. File is downloaded

**All Sequences:**
1. File menu → Export All
2. Choose format
3. Multi-FASTA or multiple files

### Export Alignments

1. Select alignment
2. Click Export
3. Choose format (FASTA, CLUSTAL)
4. Download file

### Export Project

Backup entire project:

1. File menu → Export Project
2. Downloads JSON file
3. Import later to restore

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Search | Ctrl/Cmd + F |
| Copy selection | Ctrl/Cmd + C |
| Zoom in (plasmid) | Mouse wheel up |
| Zoom out (plasmid) | Mouse wheel down |
| New sequence | Ctrl/Cmd + N |
| Import file | Ctrl/Cmd + O |
| Toggle sidebar | Ctrl/Cmd + B |

## Tips & Tricks

### Performance

**Large Sequences:**
- Virtualization handles sequences up to several Mb
- Expect smooth scrolling even with 1M+ bp
- Use Web Workers for heavy calculations

**Many Features:**
- Toggle feature visibility
- Group similar features
- Use color coding for quick identification

### Organization

**Project Management:**
- Use descriptive project names
- Add descriptions for context
- Export projects regularly for backup

**Naming:**
- Use consistent naming for sequences
- Add descriptions from FASTA headers
- Annotate features with clear labels

### Workflows

**Sequence Analysis:**
1. Import sequence
2. Add/verify annotations
3. Run analysis tools
4. Export results

**Plasmid Design Review:**
1. Import GenBank file
2. View in plasmid viewer
3. Check features and orientation
4. Export annotated map

**Multi-Sequence Comparison:**
1. Import all sequences
2. Create alignment
3. View in alignment viewer
4. Identify conserved regions
5. Export alignment

### Browser Compatibility

**Best Performance:**
- Chrome/Edge (latest)
- Hardware acceleration enabled
- Sufficient RAM (4GB+)

**Good Performance:**
- Firefox (latest)
- Safari 14+

### Storage Management

**Browser Limits:**
- Most browsers: 50-100MB
- Check storage in settings
- Delete old projects to free space

**Recommendations:**
- Export important projects
- Keep active projects only
- Clear cache periodically

## Troubleshooting

### Sequence Won't Load

- Check file format
- Ensure file isn't corrupted
- Try smaller file first
- Check browser console for errors

### Performance Issues

- Close other tabs
- Enable hardware acceleration
- Update browser
- Try different browser

### Features Not Showing

- Check feature coordinates
- Verify strand orientation
- Toggle feature visibility
- Check color contrast

### Can't Export

- Check browser permissions
- Allow downloads
- Try different format
- Check available disk space

## Safety & Privacy

GenomeLens is designed with safety in mind:

✅ **Client-side only** - All data stays in your browser  
✅ **No tracking** - No analytics or data collection  
✅ **Offline capable** - Works without internet  
✅ **Read-only analysis** - No experimental design features  

See [PRIVACY.md](PRIVACY.md) for details.

## Getting Help

- Check this guide
- Read the README
- Open an issue on GitHub
- Review example datasets

## What's Not Included

For safety reasons, GenomeLens does **NOT** include:

❌ Automated primer design for synthesis  
❌ Cloning protocol generation  
❌ Synthesis/ordering integration  
❌ Step-by-step experimental instructions  

These features are intentionally excluded to prevent misuse.

## Advanced Topics

### Custom Annotations

Create custom annotation types by editing feature qualifiers.

### Batch Import

Import multiple files by selecting all in file dialog.

### Alignment Editing

Manually edit alignment gaps for curation.

### Custom Restriction Enzymes

Modify enzyme list in settings.

## Version Information

This guide is for GenomeLens v1.0.0.

---

**Need more help?** Visit the GitHub repository or open an issue.

**Ready to start?** Create your first project and import some sequences!




