import type {
    SecurityEvent,
    SecurityEventSeverity,
    SecurityEventType,
} from './securityLog.types'
import type {
    SecurityStory,
    SecurityStoryEvent,
    SecurityStoryTone,
} from './securityStory.types'

interface EventExplanation {
    title: string
    explanation: string
    tone: SecurityStoryTone
}

const EVENT_EXPLANATIONS: Record<
    SecurityEventType,
    EventExplanation
> = {
    LOGIN_ATTEMPT: {
        title: 'A password guess was submitted',
        explanation:
            'The simulator asked the local authentication system to verify a username and password.',
        tone: 'neutral',
    },
    LOGIN_FAILURE: {
        title: 'The credentials were rejected',
        explanation:
            'The supplied password was incorrect, so access was not granted.',
        tone: 'neutral',
    },
    LOGIN_SUCCESS: {
        title: 'Valid credentials were discovered',
        explanation:
            'One password guess matched the laboratory account. Without protection, the simulated attacker reached the account.',
        tone: 'danger',
    },
    RATE_LIMIT_TRIGGERED: {
        title: 'Rate limiting reacted',
        explanation:
            'Too many requests arrived in a short period, so the system restricted additional attempts.',
        tone: 'safe',
    },
    CLIENT_THROTTLED: {
        title: 'The attacking client was throttled',
        explanation:
            'The source producing repeated failed logins was slowed or temporarily blocked.',
        tone: 'safe',
    },
    ACCOUNT_LOCKED: {
        title: 'The account was temporarily locked',
        explanation:
            'Repeated incorrect passwords reached the lockout threshold, preventing more guesses against the account.',
        tone: 'safe',
    },
    SUSPICIOUS_ACTIVITY: {
        title: 'Suspicious behavior was detected',
        explanation:
            'The pattern of repeated login failures looked abnormal and generated a security warning.',
        tone: 'warning',
    },
    AUTHENTICATION_BLOCKED: {
        title: 'A defense blocked authentication',
        explanation:
            'The request was stopped before the login process could continue normally.',
        tone: 'safe',
    },
    SIMULATION_STARTED: {
        title: 'The controlled attack began',
        explanation:
            'HATCHLAB started testing password candidates against its local laboratory account.',
        tone: 'neutral',
    },
    SIMULATION_STOPPED: {
        title: 'The simulation was stopped',
        explanation:
            'The controlled attack ended before processing every configured password candidate.',
        tone: 'warning',
    },
    SIMULATION_COMPLETED: {
        title: 'The simulation finished',
        explanation:
            'HATCHLAB completed the controlled attack and preserved the resulting security evidence.',
        tone: 'safe',
    },
}

const DEFENSE_EVENT_TYPES =
    new Set<SecurityEventType>([
        'RATE_LIMIT_TRIGGERED',
        'CLIENT_THROTTLED',
        'ACCOUNT_LOCKED',
        'SUSPICIOUS_ACTIVITY',
        'AUTHENTICATION_BLOCKED',
    ])

const SEVERITY_PRIORITY: Record<
    SecurityEventSeverity,
    number
> = {
    INFO: 0,
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4,
}

export function explainSecurityEvent(
    event: SecurityEvent,
): SecurityStoryEvent {
    const explanation =
        EVENT_EXPLANATIONS[event.eventType]

    return {
        id: event.id,
        timestamp: event.timestamp,
        ...explanation,
    }
}

function findHighestSeverity(
    events: SecurityEvent[],
): SecurityEventSeverity | null {
    return events.reduce<SecurityEventSeverity | null>(
        (highest, event) => {
            if (
                !highest ||
                SEVERITY_PRIORITY[event.severity] >
                SEVERITY_PRIORITY[highest]
            ) {
                return event.severity
            }

            return highest
        },
        null,
    )
}

function findCredentialTimestamp(
    events: SecurityEvent[],
): string {
    return events
        .filter(
            (event) =>
                event.eventType === 'LOGIN_ATTEMPT' ||
                event.eventType === 'LOGIN_FAILURE' ||
                event.eventType === 'LOGIN_SUCCESS',
        )
        .map((event) => event.timestamp)
        .sort()[0] ?? ''
}

export function buildSecurityStory(
    events: SecurityEvent[],
): SecurityStory {
    const loginAttempts = events.filter(
        (event) =>
            event.eventType === 'LOGIN_ATTEMPT',
    ).length

    const failedAttempts = events.filter(
        (event) =>
            event.eventType === 'LOGIN_FAILURE',
    ).length

    const successfulAttempts = events.filter(
        (event) =>
            event.eventType === 'LOGIN_SUCCESS',
    ).length

    const defenseActions = events.filter((event) =>
        DEFENSE_EVENT_TYPES.has(event.eventType),
    ).length

    let headline = 'No security activity recorded'
    let explanation =
        'Run a guided simulation to generate an understandable security story.'

    if (successfulAttempts > 0) {
        headline =
            'The simulated attacker found valid credentials'
        explanation =
            'At least one password guess succeeded. Review which defenses were disabled or did not react before the successful login.'
    } else if (defenseActions > 0) {
        headline = 'The defenses reacted to the attack'
        explanation =
            'One or more controls detected, slowed, or blocked the controlled password attack.'
    } else if (failedAttempts > 0) {
        headline =
            'The login system rejected the password guesses'
        explanation =
            'The tested passwords were incorrect, but no defensive intervention appears in these events.'
    } else if (events.length > 0) {
        headline = 'Security activity was recorded'
        explanation =
            'The laboratory recorded system activity that can be inspected in the timeline.'
    }

    const notableEvents = events
        .filter(
            (event) =>
                event.eventType !== 'LOGIN_ATTEMPT' &&
                event.eventType !== 'LOGIN_FAILURE',
        )
        .map(explainSecurityEvent)

    const credentialChecks = Math.max(
        loginAttempts,
        failedAttempts + successfulAttempts,
    )

    const credentialSummary: SecurityStoryEvent[] =
        credentialChecks > 0
            ? [
                {
                    id: 'credential-activity',
                    timestamp:
                        findCredentialTimestamp(events),
                    title: `${credentialChecks} ${
                        credentialChecks === 1
                            ? 'password guess was'
                            : 'password guesses were'
                    } checked`,
                    explanation: `${failedAttempts} rejected and ${successfulAttempts} accepted.`,
                    tone:
                        successfulAttempts > 0
                            ? 'danger'
                            : 'neutral',
                },
            ]
            : []

    const timeline = [
        ...notableEvents,
        ...credentialSummary,
    ].sort(
        (left, right) =>
            new Date(left.timestamp).getTime() -
            new Date(right.timestamp).getTime(),
    )

    return {
        headline,
        explanation,
        totalEvents: events.length,
        loginAttempts,
        failedAttempts,
        successfulAttempts,
        defenseActions,
        highestSeverity:
            findHighestSeverity(events),
        timeline,
    }
}