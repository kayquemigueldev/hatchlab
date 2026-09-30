import type { AttackScenario } from './attackScenario.types'

export const ATTACK_SCENARIOS: AttackScenario[] = [
    {
        id: 'UNPROTECTED',
        sequence: '01',
        name: 'Attack without defenses',
        shortName: 'Unprotected',
        summary:
            'Observe how far repeated password guesses can progress when preventive controls are disabled.',
        expectedOutcome:
            'The simulator can continue until credentials are found or the configured attempt limit is reached.',
        learningGoal:
            'Understand the risk created by an unrestricted login endpoint.',
        tone: 'WARNING',
        defenses: [
            'Security event logging',
        ],
        defenseConfiguration: {
            rateLimitingEnabled: false,
            progressiveDelayEnabled: false,
            accountLockoutEnabled: false,
            clientThrottlingEnabled: false,
            suspiciousLoginDetectionEnabled: false,
            securityEventLoggingEnabled: true,
        },
        attackRequest: {
            username: 'admin',
            wordlist: 'LAB_DEFAULT',
            requestedAttempts: 100,
            delayMs: 500,
        },
    },
    {
        id: 'ACCOUNT_LOCKOUT',
        sequence: '02',
        name: 'Account lockout protection',
        shortName: 'Account Lockout',
        summary:
            'Watch the account become temporarily locked after repeated invalid password attempts.',
        expectedOutcome:
            'The simulation should be interrupted shortly after the configured failure threshold is reached.',
        learningGoal:
            'See how account lockout prevents continued guessing against one username.',
        tone: 'SAFE',
        defenses: [
            'Account lockout',
            'Suspicious login detection',
            'Security event logging',
        ],
        defenseConfiguration: {
            rateLimitingEnabled: false,
            progressiveDelayEnabled: false,
            accountLockoutEnabled: true,
            clientThrottlingEnabled: false,
            suspiciousLoginDetectionEnabled: true,
            securityEventLoggingEnabled: true,
        },
        attackRequest: {
            username: 'admin',
            wordlist: 'LAB_DEFAULT',
            requestedAttempts: 100,
            delayMs: 500,
        },
    },
    {
        id: 'RATE_LIMITING',
        sequence: '03',
        name: 'Rate limiting protection',
        shortName: 'Rate Limiting',
        summary:
            'Send login attempts rapidly and observe the server restrict excessive request volume.',
        expectedOutcome:
            'The attack should be slowed or blocked when too many attempts arrive inside the allowed window.',
        learningGoal:
            'Understand how limiting request frequency reduces automated attack speed.',
        tone: 'SAFE',
        defenses: [
            'Rate limiting',
            'Suspicious login detection',
            'Security event logging',
        ],
        defenseConfiguration: {
            rateLimitingEnabled: true,
            progressiveDelayEnabled: false,
            accountLockoutEnabled: false,
            clientThrottlingEnabled: false,
            suspiciousLoginDetectionEnabled: true,
            securityEventLoggingEnabled: true,
        },
        attackRequest: {
            username: 'admin',
            wordlist: 'LAB_DEFAULT',
            requestedAttempts: 100,
            delayMs: 50,
        },
    },
    {
        id: 'FULL_PROTECTION',
        sequence: '04',
        name: 'Layered defense protection',
        shortName: 'Full Protection',
        summary:
            'Enable every defensive layer and observe how multiple controls work together.',
        expectedOutcome:
            'The first applicable control should interrupt or significantly slow the attack.',
        learningGoal:
            'See how layered security provides several opportunities to detect and stop abuse.',
        tone: 'SAFE',
        defenses: [
            'Rate limiting',
            'Progressive delay',
            'Account lockout',
            'Client throttling',
            'Suspicious login detection',
            'Security event logging',
        ],
        defenseConfiguration: {
            rateLimitingEnabled: true,
            progressiveDelayEnabled: true,
            accountLockoutEnabled: true,
            clientThrottlingEnabled: true,
            suspiciousLoginDetectionEnabled: true,
            securityEventLoggingEnabled: true,
        },
        attackRequest: {
            username: 'admin',
            wordlist: 'LAB_DEFAULT',
            requestedAttempts: 100,
            delayMs: 100,
        },
    },
]

export function findAttackScenario(
    scenarioId: AttackScenario['id'],
): AttackScenario {
    const scenario = ATTACK_SCENARIOS.find(
        (candidate) =>
            candidate.id === scenarioId,
    )

    if (!scenario) {
        throw new Error(
            `Unknown attack scenario: ${scenarioId}`,
        )
    }

    return scenario
}