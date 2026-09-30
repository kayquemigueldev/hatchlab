import {
    describe,
    expect,
    it,
} from 'vitest'
import type { SecurityEvent } from '../securitylogs/securityLog.types'
import {
    createSessionStartGuideEntry,
    mapSecurityEventToGuideEntry,
} from './attackGuide.mapper'
import type { SimulationSession } from './attack.types'

function createEvent(
    overrides: Partial<SecurityEvent> = {},
): SecurityEvent {
    return {
        id: 'event-1',
        timestamp: '2026-09-30T22:00:00Z',
        eventType: 'LOGIN_FAILURE',
        severity: 'LOW',
        source: 'ATTACK_SIMULATION',
        username: 'admin',
        description:
            'Authentication failed due to invalid credentials.',
        attackSessionId: 'session-1',
        ...overrides,
    }
}

const SESSION: SimulationSession = {
    id: 'session-1',
    status: 'RUNNING',
    startedAt: '2026-09-30T22:00:00Z',
    finishedAt: null,
    requestedAttempts: 100,
    totalAttempts: 0,
    failedAttempts: 0,
    successfulAttempts: 0,
    blockedAttempts: 0,
    delayMs: 500,
    defenseEnabled: true,
}

describe('attack guide mapper', () => {
    it('explains a failed login in plain language', () => {
        const entry =
            mapSecurityEventToGuideEntry(
                createEvent(),
            )

        expect(entry).toMatchObject({
            sessionId: 'session-1',
            eventType: 'LOGIN_FAILURE',
            stage: 'LOGIN',
            tone: 'WARNING',
            title:
                'The credentials were rejected',
            defense: null,
            count: 1,
        })

        expect(entry.whyItMatters)
            .toContain('defensive controls')
    })

    it('identifies the defense responsible for account lockout', () => {
        const entry =
            mapSecurityEventToGuideEntry(
                createEvent({
                    eventType:
                        'ACCOUNT_LOCKED',
                    severity: 'HIGH',
                }),
            )

        expect(entry).toMatchObject({
            stage: 'DEFENSE',
            tone: 'SAFE',
            defense: 'Account Lockout',
        })

        expect(entry.title)
            .toContain('temporarily locked')
    })

    it('marks a successful credential guess as dangerous', () => {
        const entry =
            mapSecurityEventToGuideEntry(
                createEvent({
                    eventType:
                        'LOGIN_SUCCESS',
                    severity: 'CRITICAL',
                }),
            )

        expect(entry).toMatchObject({
            stage: 'RESULT',
            tone: 'DANGER',
            defense: null,
        })
    })

    it('creates a synthetic start explanation for a session', () => {
        const entry =
            createSessionStartGuideEntry(
                SESSION,
            )

        expect(entry).toMatchObject({
            id: 'session-start-session-1',
            sessionId: 'session-1',
            eventType: 'SIMULATION_STARTED',
            stage: 'ATTACKER',
            count: 1,
        })
    })
})