# Testing

100% test coverage is the key to great vibe coding. Tests let you move fast, trust your instincts, and ship with confidence — without them, vibe coding is just yolo coding. With tests, it's a superpower.

## Framework

**Vitest v4** + **React Testing Library** + **@testing-library/jest-dom**

## How to run

```bash
cd client
npm test          # run all tests once
npm run test:watch  # watch mode
npm run test:ui     # visual UI
```

## Test layers

- **Unit tests** — pure logic (e.g. `src/utils/`). Live in `src/test/` or co-located as `*.test.js`.
- **Component tests** — React components with React Testing Library. Test behavior, not implementation.
- **Integration tests** — mock `fetch` to test component + API wiring end to end.

## Conventions

- Files: `*.test.js` alongside the code or in `src/test/`
- Assertions: use `@testing-library/jest-dom` matchers (`toBeInTheDocument`, `toHaveTextContent`, etc.)
- Mocking: use `vi.fn()` and `vi.stubGlobal('fetch', ...)` for API calls
- Never assert implementation details — test what the user sees
