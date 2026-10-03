import { describe, expect, it } from 'vitest'
import type {
    SecurityEvent,
    SecurityEventType,
} from './securityLog.types'
import {
    buildSecurityStory,
    explainSecurityEvent,
} from './securityStory.mapper'

function createEvent(
    eventType: SecurityEventType,
    timestamp: string,
    overrides: Partial<SecurityEvent> = {},
): SecurityEvent {
    return {
        id: `${eventType}-${timestamp}`,
        timestamp,
        eventType,
        severity: 'INFO',
        source: 'ATTACK_SIMULATION',
        username: 'admin',
        description: 'Recorded laboratory event.',
        attackSessionId: 'session-1',
        ...overrides,
    }
}

describe('securityStory mapper', () => {
    it('returns guidance when no events exist', () => {
        const story = buildSecurityStory([])

        expect(story.headline).toBe(
            'No security activity recorded',
        )
        expect(story.timeline).toEqual([])
        expect(story.highestSeverity).toBeNull()
    })

    it('summarizes repeated credential activity', () => {
        const story = buildSecurityStory([
            createEvent(
                'LOGIN_FAILURE',
                '2026-10-03T12:00:03Z',
            ),
            createEvent(
                'LOGIN_ATTEMPT',
                '2026-10-03T12:00:02Z',
            ),
            createEvent(
                'SIMULATION_STARTED',
                '2026-10-03T12:00:01Z',
            ),
        ])

        expect(story.loginAttempts).toBe(1)
        expect(story.failedAttempts).toBe(1)
        expect(story.headline).toBe(
            'The login system rejected the password guesses',
        )
        expect(
            story.timeline.map((item) => item.title),
        ).toEqual([
            'The controlled attack began',
            '1 password guess was checked',
        ])
    })

    it('prioritizes successful credentials as the risk', () => {
        const story = buildSecurityStory([
            createEvent(
                'LOGIN_SUCCESS',
                '2026-10-03T12:00:03Z',
                {
                    severity: 'CRITICAL',
                },
            ),
            createEvent(
                'ACCOUNT_LOCKED',
                '2026-10-03T12:00:02Z',
                {
                    severity: 'HIGH',
                },
            ),
        ])

        expect(story.headline).toBe(
            'The simulated attacker found valid credentials',
        )
        expect(story.successfulAttempts).toBe(1)
        expect(story.defenseActions).toBe(1)
        expect(story.highestSeverity).toBe(
            'CRITICAL',
        )
    })

    it('translates technical events into plain language', () => {
        const explanation = explainSecurityEvent(
            createEvent(
                'AUTHENTICATION_BLOCKED',
                '2026-10-03T12:00:01Z',
            ),
        )

        expect(explanation).toMatchObject({
            title: 'A defense blocked authentication',
            tone: 'safe',
        })

        expect(explanation.explanation).toContain(
            'stopped before the login process',
        )
    })
})