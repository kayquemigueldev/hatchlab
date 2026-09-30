import type { SecurityEvent } from '../securitylogs/securityLog.types'
import type { SimulationSession } from './attack.types'
import type {
    AttackGuideEntry,
    AttackGuideStage,
    AttackGuideTone,
} from './attackGuide.types'

interface GuideContent {
    stage: AttackGuideStage
    tone: AttackGuideTone
    title: string
    explanation: string
    whyItMatters: string
    defense: string | null
}

const GUIDE_CONTENT: Record<
    SecurityEvent['eventType'],
    GuideContent
> = {
    SIMULATION_STARTED: {
        stage: 'ATTACKER',
        tone: 'INFO',
        title: 'Controlled attack started',
        explanation:
            'HATCHLAB began testing password candidates against the local laboratory account.',
        whyItMatters:
            'This safely reproduces the behavior of an automated credential-guessing attack.',
        defense: null,
    },
    LOGIN_ATTEMPT: {
        stage: 'LOGIN',
        tone: 'NEUTRAL',
        title: 'A password guess reached the login endpoint',
        explanation:
            'The application received a controlled sign-in request from the simulator.',
        whyItMatters:
            'Every attempt must pass through authentication and all enabled defensive checks.',
        defense: null,
    },
    LOGIN_FAILURE: {
        stage: 'LOGIN',
        tone: 'WARNING',
        title: 'The credentials were rejected',
        explanation:
            'The supplied password did not match the laboratory account.',
        whyItMatters:
            'Repeated failures are the signal that several defensive controls use to identify an attack.',
        defense: null,
    },
    LOGIN_SUCCESS: {
        stage: 'RESULT',
        tone: 'DANGER',
        title: 'The simulated attacker found valid credentials',
        explanation:
            'One password candidate successfully authenticated the laboratory account.',
        whyItMatters:
            'A successful attempt means the enabled defenses did not stop the simulation before credentials were discovered.',
        defense: null,
    },
    RATE_LIMIT_TRIGGERED: {
        stage: 'DEFENSE',
        tone: 'SAFE',
        title: 'Rate limiting restricted the attack',
        explanation:
            'Too many authentication requests arrived inside the configured time window.',
        whyItMatters:
            'Rate limiting reduces how many passwords an attacker can test in a short period.',
        defense: 'Rate Limiting',
    },
    CLIENT_THROTTLED: {
        stage: 'DEFENSE',
        tone: 'SAFE',
        title: 'The attacking client was throttled',
        explanation:
            'HATCHLAB identified repeated requests from the same laboratory client.',
        whyItMatters:
            'Client throttling prevents one source from continuously flooding the login endpoint.',
        defense: 'Client Throttling',
    },
    ACCOUNT_LOCKED: {
        stage: 'DEFENSE',
        tone: 'SAFE',
        title: 'The account was temporarily locked',
        explanation:
            'The configured failure threshold was reached for the target account.',
        whyItMatters:
            'Account lockout stops additional password guesses even when the attacker continues sending requests.',
        defense: 'Account Lockout',
    },
    SUSPICIOUS_ACTIVITY: {
        stage: 'DEFENSE',
        tone: 'WARNING',
        title: 'Suspicious login behavior was detected',
        explanation:
            'The pattern of repeated authentication failures was classified as abnormal activity.',
        whyItMatters:
            'Detection creates visibility so defenders can investigate an attack while it is happening.',
        defense: 'Suspicious Login Detection',
    },
    AUTHENTICATION_BLOCKED: {
        stage: 'RESULT',
        tone: 'SAFE',
        title: 'The authentication attempt was blocked',
        explanation:
            'An enabled defense prevented the request from completing normally.',
        whyItMatters:
            'The attack was interrupted before more password candidates could be tested.',
        defense: 'Active Defensive Control',
    },
    SIMULATION_STOPPED: {
        stage: 'RESULT',
        tone: 'WARNING',
        title: 'The simulation was stopped',
        explanation:
            'Execution ended before all requested attempts were processed.',
        whyItMatters:
            'Only the attempts completed before the stop are included in the result.',
        defense: null,
    },
    SIMULATION_COMPLETED: {
        stage: 'RESULT',
        tone: 'INFO',
        title: 'The simulation finished',
        explanation:
            'HATCHLAB completed the controlled attack and recorded its outcome.',
        whyItMatters:
            'The final numbers show how far the attack progressed and whether a defense intervened.',
        defense: null,
    },
}

export function mapSecurityEventToGuideEntry(
    event: SecurityEvent,
): AttackGuideEntry {
    return {
        id: event.id,
        sessionId: event.attackSessionId ?? 'unknown',
        eventType: event.eventType,
        timestamp: event.timestamp,
        count: 1,
        ...GUIDE_CONTENT[event.eventType],
    }
}

export function createSessionStartGuideEntry(
    session: SimulationSession,
): AttackGuideEntry {
    return {
        id: `session-start-${session.id}`,
        sessionId: session.id,
        eventType: 'SIMULATION_STARTED',
        timestamp: session.startedAt,
        count: 1,
        ...GUIDE_CONTENT.SIMULATION_STARTED,
    }
}