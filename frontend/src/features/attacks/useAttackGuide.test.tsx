import {
    act,
    renderHook,
} from '@testing-library/react'
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'
import type { SecurityEvent } from '../securitylogs/securityLog.types'
import type { SimulationSession } from './attack.types'
import { useAttackGuide } from './useAttackGuide'

const {
    realtimeState,
    subscribeMock,
} = vi.hoisted(() => ({
    realtimeState: {
        status: 'CONNECTED',
    },
    subscribeMock: vi.fn(),
}))

vi.mock(
    '../../shared/realtime/useRealtime',
    () => ({
        useRealtime: () => ({
            status: realtimeState.status,
            subscribe: subscribeMock,
        }),
    }),
)

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

function createEvent(
    overrides: Partial<SecurityEvent> = {},
): SecurityEvent {
    return {
        id: 'event-1',
        timestamp: '2026-09-30T22:00:01Z',
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

describe('useAttackGuide', () => {
    beforeEach(() => {
        realtimeState.status = 'CONNECTED'
        subscribeMock.mockReset()
        subscribeMock.mockReturnValue(
            vi.fn(),
        )
    })

    it('creates an initial explanation and subscribes to security events', () => {
        const { result } = renderHook(() =>
            useAttackGuide(SESSION),
        )

        expect(subscribeMock)
            .toHaveBeenCalledWith(
                '/topic/security-events',
                expect.any(Function),
            )

        expect(result.current.isLive)
            .toBe(true)

        expect(result.current.entries)
            .toHaveLength(1)

        expect(result.current.entries[0])
            .toMatchObject({
                eventType:
                    'SIMULATION_STARTED',
                stage: 'ATTACKER',
            })
    })

    it('ignores events from another simulation', () => {
        let eventHandler:
            | ((event: SecurityEvent) => void)
            | undefined

        subscribeMock.mockImplementation(
            (
                _destination: string,
                handler:
                (event: SecurityEvent) => void,
            ) => {
                eventHandler = handler

                return vi.fn()
            },
        )

        const { result } = renderHook(() =>
            useAttackGuide(SESSION),
        )

        act(() => {
            eventHandler?.(
                createEvent({
                    attackSessionId:
                        'different-session',
                }),
            )
        })

        expect(result.current.entries)
            .toHaveLength(1)
    })

    it('aggregates repeated event types into one explanation', () => {
        let eventHandler:
            | ((event: SecurityEvent) => void)
            | undefined

        subscribeMock.mockImplementation(
            (
                _destination: string,
                handler:
                (event: SecurityEvent) => void,
            ) => {
                eventHandler = handler

                return vi.fn()
            },
        )

        const { result } = renderHook(() =>
            useAttackGuide(SESSION),
        )

        act(() => {
            eventHandler?.(
                createEvent({
                    id: 'failure-1',
                }),
            )

            eventHandler?.(
                createEvent({
                    id: 'failure-2',
                    timestamp:
                        '2026-09-30T22:00:02Z',
                }),
            )
        })

        const failureEntry =
            result.current.entries.find(
                (entry) =>
                    entry.eventType ===
                    'LOGIN_FAILURE',
            )

        expect(failureEntry)
            .toMatchObject({
                count: 2,
                stage: 'LOGIN',
            })
    })

    it('does not count the same event twice', () => {
        let eventHandler:
            | ((event: SecurityEvent) => void)
            | undefined

        subscribeMock.mockImplementation(
            (
                _destination: string,
                handler:
                (event: SecurityEvent) => void,
            ) => {
                eventHandler = handler

                return vi.fn()
            },
        )

        const event = createEvent()

        const { result } = renderHook(() =>
            useAttackGuide(SESSION),
        )

        act(() => {
            eventHandler?.(event)
            eventHandler?.(event)
        })

        const failureEntry =
            result.current.entries.find(
                (entry) =>
                    entry.eventType ===
                    'LOGIN_FAILURE',
            )

        expect(failureEntry?.count)
            .toBe(1)
    })

    it('does not subscribe while realtime is disconnected', () => {
        realtimeState.status = 'DISCONNECTED'

        const { result } = renderHook(() =>
            useAttackGuide(SESSION),
        )

        expect(subscribeMock)
            .not.toHaveBeenCalled()

        expect(result.current.isLive)
            .toBe(false)

        expect(result.current.realtimeStatus)
            .toBe('DISCONNECTED')
    })

    it('unsubscribes when the guide is removed', () => {
        const unsubscribe = vi.fn()

        subscribeMock.mockReturnValue(
            unsubscribe,
        )

        const { unmount } = renderHook(() =>
            useAttackGuide(SESSION),
        )

        unmount()

        expect(unsubscribe)
            .toHaveBeenCalledOnce()
    })
})