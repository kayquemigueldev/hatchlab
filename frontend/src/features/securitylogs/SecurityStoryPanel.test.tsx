import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type {
    SecurityEvent,
    SecurityEventType,
} from './securityLog.types'
import { SecurityStoryPanel } from './SecurityStoryPanel'

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
        description: 'Laboratory event.',
        attackSessionId: 'session-1',
        ...overrides,
    }
}

describe('SecurityStoryPanel', () => {
    it('presents technical events as a readable story', () => {
        render(
            <SecurityStoryPanel
                events={[
                    createEvent(
                        'LOGIN_FAILURE',
                        '2026-10-03T12:00:02Z',
                    ),
                    createEvent(
                        'SIMULATION_STARTED',
                        '2026-10-03T12:00:01Z',
                    ),
                ]}
            />,
        )

        expect(
            screen.getByRole('heading', {
                name: 'The login system rejected the password guesses',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'The controlled attack began',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                '1 password guess was checked',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText('ATTACK REJECTED'),
        ).toBeInTheDocument()
    })

    it('highlights defensive reactions', () => {
        render(
            <SecurityStoryPanel
                events={[
                    createEvent(
                        'ACCOUNT_LOCKED',
                        '2026-10-03T12:00:03Z',
                        {
                            severity: 'HIGH',
                        },
                    ),
                ]}
            />,
        )

        expect(
            screen.getByRole('heading', {
                name: 'The defenses reacted to the attack',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'The account was temporarily locked',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText('DEFENSE RESPONSE'),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Highest recorded severity: HIGH',
            ),
        ).toBeInTheDocument()
    })

    it('marks successful credentials as a risk regardless of raw severity', () => {
        render(
            <SecurityStoryPanel
                events={[
                    createEvent(
                        'LOGIN_SUCCESS',
                        '2026-10-03T12:00:03Z',
                        {
                            severity: 'LOW',
                        },
                    ),
                ]}
            />,
        )

        expect(
            screen.getByText('RISK DETECTED'),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Highest recorded severity: LOW',
            ),
        ).toBeInTheDocument()
    })
})
