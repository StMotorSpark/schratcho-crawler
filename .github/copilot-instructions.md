# Copilot Instructions for Schratcho Crawler

## Critical Rules
**!IMPORTANT** - These instructions are critical for maintaining the integrity of the project.

- ‼️ Do not include, modify, or move any files or folders under the `kickstart-prompts/` directory unless explicitly requested to do so.
- ‼️ If a change to files inside `kickstart-prompts/` is required, wait for a specific instruction before editing.
- ‼️ Always run `npm run lint` and `npm run build` before committing changes to ensure code quality.
- ‼️ Never commit build artifacts (files in `dist/` directory) to the repository.

## Prompt Completion Upkeep
When implementing a prompt file from the `kickstart-prompts/` directory:

1. **After successful implementation**, update the `kickstart-prompts/completed-log.md` file:
   - Add the prompt filename to the appropriate section (e.g., `gh-agent-completed`)
   - Include a brief description of what was implemented
   - Add the completion date

2. **Moving completed prompts**: The prompt file should be moved to `kickstart-prompts/gh-agent-completed/` after implementation

3. **Log format**: Use the table format in `completed-log.md`:
   ```markdown
   | prompt-filename.md | Brief description of implementation | YYYY-MM-DD |
   ```

4. **Exception**: Only modify `kickstart-prompts/` files (including the log) when explicitly asked to implement a prompt from that folder

## Project Overview
This project is a web and mobile game that combines game mechanics around:
- **Scratch Off Tickets** - Primary game mechanic where users can scratch off tickets to win prizes.
- **Rogue Like Progression** - Players can progress unlocking new levels, tickets, and abilities.
- **Dungeon Crawler Mechanic** - Players can experience a dungeon crawler style scratch off experience to win or lose rewards.

**Current Status**: Demo phase - focusing on scratch-off ticket implementation using CSS masking.

## Technology Stack

### Web Version (Current)
- **React 19.2+** - UI framework
- **TypeScript 5.9+** - Type safety and modern JavaScript features
- **Vite 7.2+** - Build tool and dev server
- **CSS Masking** - CSS-based reveal effects for scratch-off mechanics
- **Web Audio API** - Sound effects generation
- **Vitest** - Testing framework (planned, not yet implemented)
- **Playwright** - E2E testing (planned, not yet implemented)

### Mobile Version (Planned)
- React Native
- TypeScript
- Expo
- Jest
- Detox

## Development Workflow

### Setup
```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173/)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run TypeScript type checking
npm run lint
```

### Before Committing
Always run these commands to ensure code quality:
```bash
npm run lint    # TypeScript type checking
npm run build   # Verify build succeeds
```

## Code Style and Conventions

### TypeScript Guidelines
- **Strict mode enabled**: All TypeScript strict checks are enforced
- **No unused variables**: `noUnusedLocals` and `noUnusedParameters` are enabled
- **Explicit types**: Use explicit type annotations for function parameters and return types
- **Prefer interfaces for objects**: Use `interface` for object shapes, `type` for unions/intersections
- **Use `type` imports**: Import types with `import type` when only importing types

### React Guidelines
- **Functional components only**: Use function components with hooks
- **React 19.2**: Using latest React features
- **TypeScript with React**: All components should have proper TypeScript types
- **Props interfaces**: Define props as interfaces, not inline types
- **State management**: Use `useState` for local state
- **Side effects**: Use `useEffect` for side effects with proper dependency arrays
- **Event handlers**: Prefix with `handle` (e.g., `handleClick`, `handleComplete`)

### File and Component Structure
- **Component files**: Use PascalCase for component files (e.g., `ScratchTicketCSS.tsx`)
- **Utility files**: Use camelCase for utility files (e.g., `prizes.ts`, `sounds.ts`)
- **One component per file**: Each file should export one main component
- **Co-locate styles**: CSS files should be in the same directory as their components
- **Utils directory**: Place utility functions in `src/utils/`
- **Components directory**: Place reusable components in `src/components/`

### Code Organization
```
src/
├── App.tsx                    # Main application component
├── App.css                    # Application-level styles
├── main.tsx                   # Application entry point
├── index.css                  # Global styles
├── components/                # Reusable components
│   └── ScratchTicketCSS.tsx  # Component-specific files
└── utils/                     # Utility functions
    ├── prizes.ts             # Game logic utilities
    └── sounds.ts             # Audio utilities
```

### Naming Conventions
- **Components**: PascalCase (e.g., `ScratchTicketCSS`)
- **Functions**: camelCase (e.g., `getRandomPrize`)
- **Constants**: UPPER_SNAKE_CASE for true constants (e.g., `MAX_ATTEMPTS`)
- **Interfaces/Types**: PascalCase with descriptive names (e.g., `Prize`, `ScratchArea`)
- **CSS classes**: kebab-case (e.g., `scratch-ticket`, `new-ticket-button`)

### CSS/Styling
- **CSS Modules or plain CSS**: Currently using plain CSS with scoped class names
- **BEM-like naming**: Use descriptive class names (e.g., `.ticket-wrapper`, `.completion-badge`)
- **Hardware acceleration**: Use CSS transforms and masking for performance
- **Responsive design**: Ensure components work on desktop, tablet, and mobile

### Comments and Documentation
- **TSDoc comments**: Use JSDoc/TSDoc for public APIs and complex functions
- **Inline comments**: Use sparingly, only for complex logic
- **README updates**: Update README.md when adding significant features
- **Type exports**: Export types that are used across multiple files

## Project-Specific Patterns

### Scratch-Off Mechanics
- Use CSS masking for performant reveal effects
- Implement multiple independent scratch areas
- Calculate reveal percentage by checking pixels
- Use canvas for mask management

### Sound Effects
- Use Web Audio API for dynamic sound generation
- Throttle scratch sounds to avoid overwhelming
- Fail gracefully if Web Audio API is unavailable
- Keep sounds short and non-intrusive

### Performance Targets
- **60fps** during user interactions
- **Efficient pixel checking**: Check every 10th pixel for reveal calculation
- **Prevent default**: Use `preventDefault()` on touch events to avoid scroll interference
- **Throttle events**: Limit sound effects and expensive calculations

## Security Considerations
- **No sensitive data**: This is a client-side game, no backend secrets
- **No user input validation issues**: Minimal user input beyond interaction
- **Content Security Policy**: Consider CSP headers when deploying
- **Dependency security**: Run `npm audit` regularly and fix vulnerabilities

## Testing Guidelines (Planned)
Currently, there is no test infrastructure. When adding tests:
- Use Vitest for unit and integration tests
- Use Playwright for E2E tests
- Place test files alongside source files with `.test.tsx` or `.spec.tsx` extension
- Aim for meaningful test coverage of game logic and user interactions
- Mock Web Audio API and canvas in tests

## Common Tasks

### Adding a New Component
1. Create file in `src/components/` with PascalCase name
2. Define props interface at the top of the file
3. Implement functional component with proper TypeScript types
4. Export component as default export
5. Add corresponding CSS file if needed
6. Update README.md if it's a significant feature

### Adding a New Utility
1. Create file in `src/utils/` with camelCase name
2. Export functions and types explicitly
3. Add JSDoc comments for public functions
4. Ensure pure functions when possible
5. Export types that are reused

### Modifying Game Logic
1. Update types in relevant utility files first
2. Update components to use new types
3. Test in development mode (`npm run dev`)
4. Verify build succeeds (`npm run build`)
5. Update README.md with new features

## Dependencies
- **Minimize dependencies**: Only add dependencies when absolutely necessary
- **Prefer native APIs**: Use Web APIs (Canvas, Audio, etc.) over libraries when possible
- **No jQuery or Lodash**: Use modern JavaScript/TypeScript instead
- **React ecosystem**: Prefer React-compatible libraries

## Prohibited Actions
- ❌ Do not disable TypeScript strict checks
- ❌ Do not use `any` type unless absolutely necessary
- ❌ Do not commit `node_modules/` or `dist/` directories
- ❌ Do not modify files in `kickstart-prompts/` without explicit permission
- ❌ Do not add ESLint or Prettier configs without discussion (using TypeScript compiler for now)
- ❌ Do not introduce breaking changes to existing APIs without discussion

## Future Considerations
- **Mobile version**: React Native implementation is planned
- **Backend integration**: May add backend for persistence and multiplayer
- **Testing**: Vitest and Playwright will be added
- **State management**: May add Redux or Zustand for complex state
- **Routing**: May add React Router for multi-page experience

## Questions or Clarifications?
If you're unsure about any aspect of the project:
1. Check the README.md for high-level documentation
2. Review existing code for patterns and conventions
3. Look at recent commits for context
4. Ask for clarification in pull request comments