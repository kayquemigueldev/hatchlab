# HATCHLAB

> Authentication Security Laboratory
HATCHLAB is a controlled local laboratory for studying authentication attacks, defensive mechanisms, security event detection, and real-time observability.

## Project status

---   Under development ---

## Core concept

**ATTACK → DETECTION → DEFENSE → OBSERVABILITY**

## Safety

HATCHLAB is designed exclusively for authorized testing inside its own local authentication environment.
It does not support:
- Arbitrary external targets
- CAPTCHA bypass
- MFA bypass
- Rate-limit evasion
- Leaked credentials
- Third-party services

## Planned stack

### Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- PostgreSQL
- WebSocket
- Maven

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts

### Infrastructure

- Docker
- Docker Compose
- GitHub Actions