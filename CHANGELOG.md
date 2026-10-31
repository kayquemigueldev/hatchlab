# Changelog

All notable changes to HATCHLAB are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-10-31

HATCHLAB 1.0 is the first complete release of the controlled authentication security laboratory.

### Added

- Local authentication laboratory backed by Spring Boot and PostgreSQL.
- Persistent laboratory users, authentication attempts, attack sessions, defensive configuration, and security events.
- Controlled authentication endpoint restricted to the local laboratory account.
- Internal deterministic wordlist containing the configured laboratory password.
- Asynchronous attack simulations with configurable attempt counts and delays.
- Simulation progress tracking, manual interruption, history, and lifecycle events.
- Rate limiting, progressive delay, account lockout, client throttling, suspicious-login detection, and configurable security-event logging.
- Baseline and protected simulation comparison.
- Evidence-based security score with risk classification and score breakdown.
- Realtime simulation and security-event updates through STOMP WebSocket channels.
- Controlled laboratory reset with an exact confirmation phrase.
- React and TypeScript interface with operational dashboard, Attack Lab, Defense Lab, Comparison, Security Logs, and How It Works pages.
- Guided attack visualization with live plain-language explanations.
- Guided demonstration scenarios for unprotected attacks, account lockout, rate limiting, and layered defenses.
- Plain-language defensive-control descriptions and security-event stories.
- Downloadable Markdown experiment reports.
- Deterministic demonstration preparation and complete browser-driven demonstration coverage.
- Recorded project demonstration linked from the README.
- Docker images for the frontend and backend with Docker Compose orchestration.
- PostgreSQL and backend health checks.
- Continuous Integration for backend tests, frontend validation, Docker Compose validation, and end-to-end browser tests.
- Backend unit and integration test suite.
- Frontend unit and component test suite.
- Playwright navigation, keyboard, accessibility, and complete demonstration tests.

### Accessibility

- Skip-to-content keyboard navigation.
- Visible keyboard focus throughout the interface.
- Identifiable and programmatically focusable main content.
- Accessible names and state information for interactive controls.
- Live-region announcements for loading, error, reset, and simulation states.
- Reduced-motion support.
- Strengthened text, state, and control contrast.
- Automated WCAG analysis with axe.
- Complete keyboard-only guided-scenario workflow coverage.

### Security

- Laboratory services bound exclusively to localhost.
- Simulations restricted to HATCHLAB’s internal account and bundled wordlist.
- No external targets, imported credentials, bypass features, or evasion mechanisms.
- Non-root backend container user.
- Frontend security response headers.
- Environment files and local credentials excluded from version control.
- Configurable credentials synchronized between application initialization and simulation data.
- Dependency vulnerability review with zero known npm audit findings at release validation.
- Global API error handling without exposing internal implementation details.

### Fixed

- Disabled Spring Security’s generated default user.
- Synchronized configured laboratory credentials across the stack.
- Aligned security-story risk assessment with the recorded simulation outcome.
- Corrected dashboard action alignment.
- Improved frontend state handling and realtime refresh behavior.

### Documentation

- Complete installation, configuration, development, testing, API, WebSocket, architecture, and safety documentation.
- Interface screenshots and recorded demonstration.
- Reproducible step-by-step baseline and protected experiment.
- Expanded roadmap and release-readiness checklist.
- Portfolio-oriented project summary.
- Continuous Integration status badge.

[Unreleased]: https://github.com/kayquemigueldev/hatchlab/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/kayquemigueldev/hatchlab/releases/tag/v1.0.0
