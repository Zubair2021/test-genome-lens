# Contributing to GenomeLens

Thank you for your interest in contributing to GenomeLens! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, constructive, and professional in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature`
5. Make your changes
6. Run tests: `npm test`
7. Commit your changes
8. Push and create a pull request

## Development Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/      # React components
│   ├── ui/         # Reusable UI components
│   └── viewers/    # Sequence viewers
├── stores/         # State management
├── types/          # TypeScript types
├── utils/          # Utility functions
│   ├── parsers.ts  # File format parsers
│   ├── sequence.ts # Sequence operations
│   └── db.ts       # IndexedDB wrapper
└── tests/          # Test files
```

## Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing code style
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### Components

- Use functional components with hooks
- Extract reusable logic to custom hooks
- Keep components focused on a single responsibility
- Use TypeScript interfaces for props

### State Management

- Use Zustand for global state
- Keep state minimal and normalized
- Use local state for UI-only state

### Performance

- Use virtualization for large lists
- Lazy load heavy modules
- Use Web Workers for CPU-intensive tasks
- Profile before optimizing

### Testing

- Write tests for new features
- Test edge cases and error conditions
- Aim for high coverage on utilities
- Include E2E tests for critical flows

### Safety First

**Important**: GenomeLens must NOT include features that:

- Automate primer design for synthesis
- Generate step-by-step cloning protocols
- Integrate with synthesis/ordering services
- Produce actionable wet-lab instructions

Any PR that includes such features will be rejected.

### Allowed Features

✅ Sequence viewing and visualization  
✅ Read-only analysis and statistics  
✅ Annotation editing  
✅ File import/export  
✅ Search and navigation  
✅ Performance improvements  
✅ UI/UX enhancements  

## Pull Request Process

1. **Describe your changes**: Clearly explain what and why
2. **Link issues**: Reference related issues
3. **Add tests**: Include tests for new features
4. **Update docs**: Update README if needed
5. **Check CI**: Ensure all checks pass
6. **Request review**: Tag maintainers for review

### PR Title Format

```
<type>: <description>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting, no code change
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance tasks
```

Examples:
- `feat: Add GC content windowed plot`
- `fix: Handle empty sequences in linear viewer`
- `docs: Update installation instructions`

## Bug Reports

When reporting bugs, include:

1. **Description**: Clear description of the issue
2. **Steps to reproduce**: Detailed steps
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Environment**: Browser, OS, version
6. **Screenshots**: If applicable

## Feature Requests

When requesting features, include:

1. **Use case**: Why is this needed?
2. **Proposed solution**: How should it work?
3. **Alternatives**: Other approaches considered
4. **Safety check**: Confirm it doesn't violate safety guidelines

## Documentation

Help improve docs:

- Fix typos and grammar
- Add examples and tutorials
- Improve API documentation
- Create video tutorials
- Translate to other languages

## Performance

When optimizing:

- Profile first, optimize second
- Include benchmarks in PR
- Test with large datasets
- Consider memory usage
- Don't sacrifice readability without reason

## Security

If you discover a security issue:

1. **Don't open a public issue**
2. Email maintainers privately
3. Include full details
4. Allow time for a fix before disclosure

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

- Open a discussion on GitHub
- Check existing issues and PRs
- Read the documentation

## Recognition

Contributors will be:

- Listed in the repository
- Mentioned in release notes
- Credited in the app (optional)

Thank you for contributing to GenomeLens! 🧬



