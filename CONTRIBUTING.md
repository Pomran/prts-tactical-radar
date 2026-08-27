# Contributing to PRTS Tactical Radar

Thank you for your interest in contributing to PRTS Tactical Radar! This document provides guidelines and information for contributors.

## Welcome

We welcome contributions from the community, whether it's:
- Bug fixes and improvements
- New features
- Documentation
- Translations
- Testing and feedback
- Ideas and suggestions

## Non-Commercial Project

**Important**: This is a **non-commercial** project licensed under the [PRTS Non-Commercial License](LICENSE). This means:

1. **All contributions must be for non-commercial purposes**
2. **Derivative works must remain non-commercial**
3. **Commercial use is prohibited** without explicit permission

Please ensure your contributions align with these principles.

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Git
- Cloudflare account (free tier works) for testing deployments

### Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/pomran/prts-tactical-radar.git
   cd prts-tactical-radar
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up your development environment:
   ```bash
   # Copy configuration templates
   cp .dev.vars.example .dev.vars
   cp wrangler.example.jsonc wrangler.jsonc
   
   # Edit .dev.vars with your Gaode API key
   # Edit wrangler.jsonc with your Cloudflare settings
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Strategy

- `main` - Stable release branch
- `develop` - Main development branch
- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Documentation: `docs/description`

### Making Changes

1. Create a feature branch from `develop`:
   ```bash
   git checkout -b feature/your-feature develop
   ```

2. Make your changes
3. Test thoroughly (see testing guidelines below)
4. Commit with clear, descriptive messages
5. Push to your fork and create a pull request

### Code Style

- Follow existing code patterns and conventions
- Use TypeScript for type safety
- Write meaningful comments (in Chinese or English)
- Keep functions focused and small
- Use meaningful variable and function names

### Testing

Before submitting a pull request:

1. **Lint your code**:
   ```bash
   npm run lint
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Test locally**:
   ```bash
   npm run dev:cf
   ```
   Verify all features work as expected.

4. **Test the Worker**:
   ```bash
   npx wrangler dev
   ```
   Ensure API endpoints function correctly.

### Documentation

- Update README.md if adding new features
- Add JSDoc comments for public APIs
- Update any relevant documentation in the `docs/` folder

## Types of Contributions

### Bug Fixes

- Clearly describe the bug in your issue/PR
- Include steps to reproduce if possible
- Test your fix thoroughly

### New Features

- Discuss major features in an issue first
- Ensure the feature aligns with the project's non-commercial nature
- Add appropriate documentation

### Documentation

- Fix typos and grammar
- Improve clarity
- Add examples
- Translate content (see translations section)

### Translations

We welcome translations! Please:

1. Check existing translations first
2. Maintain consistency with existing terminology
3. Test translations in context

## Arknights-Specific Contributions

When contributing Arknights-related content:

1. **Respect IP**: All Arknights trademarks, characters, and artwork belong to Hypergraph/Yostar
2. **Fan content only**: This is a fan project, not official
3. **Non-commercial**: All contributions must be non-commercial
4. **Appropriate content**: Keep content appropriate for the Arknights community

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Changes are tested locally
- [ ] Documentation is updated if needed
- [ ] Commit messages are clear and descriptive
- [ ] No sensitive information (API keys, etc.) is included

### PR Description

Please include:

1. **Summary**: Brief description of changes
2. **Motivation**: Why this change is needed
3. **Testing**: How you tested the changes
4. **Screenshots**: If applicable, for UI changes
5. **Related issues**: Link to any related issues

### Review Process

1. All PRs require at least one review
2. Maintainers may request changes
3. Once approved, PRs will be merged into `develop`
4. Regular releases will merge `develop` into `main`

## Reporting Issues

### Bug Reports

Include:

1. **Environment**: Browser, OS, Node version
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Console errors** (if any)
6. **Screenshots** (if applicable)

### Feature Requests

Include:

1. **Use case**: Why this feature would be useful
2. **Proposed solution**: How you envision it working
3. **Alternatives**: Other approaches you considered
4. **Non-commercial impact**: How it maintains non-commercial nature

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers learn
- Keep discussions on-topic
- Respect the non-commercial nature of the project

### Communication

- Use GitHub Issues for bug reports and feature requests
- Use Pull Requests for code contributions
- Be patient with response times
- Ask questions if unsure about anything

## License

By contributing to PRTS Tactical Radar, you agree that your contributions will be licensed under the [PRTS Non-Commercial License](LICENSE).

This means:

1. Your contributions will be non-commercial
2. Derivative works must remain non-commercial
3. You retain copyright to your contributions
4. You grant permission for your contributions to be used under the project license

## Thank You

Thank you for considering contributing to PRTS Tactical Radar! Your help is greatly appreciated in making this project better for the Arknights community.

---

*Remember: This is a non-commercial fan project. All contributions should align with this principle.*
