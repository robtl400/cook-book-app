# Changelog

All notable changes to this project will be documented in this file.

## [0.0.1.0] - 2026-03-24

### Added
- Mobile hamburger navigation menu with accessible focus management (keyboard trap, Escape to close, focus returns to trigger)
- Search button (magnifying glass icon) in navbar for mouse/touch users
- Typography system: Playfair Display for headings, Inter for body text via Google Fonts
- CSS design tokens for auth page light surfaces (`--color-text-on-light`, `--color-border-light`)
- `LandingPage` and `UserProfilePage` component tests
- `FeedPage` and `ExplorePage` component tests covering error/empty states
- Empty state improvements for Explore, Feed, and Search Results pages with contextual CTAs
- `Spinner` component reused across PostDetailPage, RecipeFormPage, UserProfilePage

### Changed
- Navbar desktop links now horizontal (single row) with active-state accent color
- Login and Register forms use CSS variable tokens instead of hardcoded Tailwind gray classes
- PostDetailPage and RecipeFormPage use shared `Spinner` component instead of inline spinners
- SearchResultsPage empty state includes emoji, heading, and contextual "Browse Explore" link
- `navLinkClass` helper reduces repetition in NavBar link styling
- FeedPage error state includes a "Try again" retry button

### Fixed
- Desktop nav links were stacked vertically — now horizontal for better scannability
- Auth forms had hardcoded `gray-*` colors that didn't respect the app's CSS variable theming
