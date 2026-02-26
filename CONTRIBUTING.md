# Contributing to ghub-manager

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ghub-manager.git
   cd ghub-manager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development build:**
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
  ├── index.ts          # Main entry point and re-exports
  ├── client.ts         # Client creation and error handling
  ├── types.ts          # All TypeScript types and error classes
  ├── utils.ts          # Shared utilities (pagination, batch, retry)
  ├── repos/            # Repository management functions
  ├── branches/         # Branch management functions
  ├── issues/           # Issue management functions
  ├── pulls/            # Pull request management functions
  ├── releases/         # Release management functions
  ├── orgs/             # Organization management functions
  └── __tests__/        # Test files
```

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Type Checking

```bash
npm run typecheck
```

### Linting and Formatting

```bash
npm run lint
npm run lint:fix
npm run format
```

### Building

```bash
npm run build
```

## Code Style

- We use TypeScript strict mode
- All public functions must have JSDoc comments with `@example` blocks
- All parameters should use typed options objects (not positional params)
- Prefer `async/await` over raw Promises
- Wrap all Octokit calls with `withErrorHandling()`

## Adding a New Feature

1. Add types to `src/types.ts`
2. Create the implementation in the appropriate module
3. Export from the module's `index.ts`
4. Re-export from `src/index.ts` if needed
5. Add tests in `src/__tests__/`
6. Update the README with usage examples

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test additions or changes
- `chore:` - Build/tooling changes
- `refactor:` - Code refactoring

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with tests
3. Ensure all checks pass (`npm test && npm run typecheck && npm run lint`)
4. Submit a PR with a clear description of changes
5. Wait for review and address feedback

## Reporting Issues

When reporting issues, please include:
- Node.js version
- ghub-manager version
- Steps to reproduce
- Expected vs actual behavior
- Relevant error messages or logs
