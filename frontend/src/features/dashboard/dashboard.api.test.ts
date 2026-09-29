import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'
import type { PageResponse } from '../../shared/api/page.types'
import type { SimulationSession } from '../attacks/attack.types'
import type { DefenseConfiguration } from '../defenses/defense.types'
import type { SecurityEvent } from '../securitylogs/securityLog.types'
import { getDashboardOverview } from './dashboard.api'

const {
    apiRequestMock,
    getSecurityEventsMock,
    getDefenseConfigurationMock,
} = vi.hoisted(() => ({
    apiRequestMock: vi.fn(),
    getSecurityEventsMock: vi.fn(),
    getDefenseConfigurationMock: vi.fn(),
}))

vi.mock('../../shared/api/apiClient', () => ({
    apiRequest: apiRequestMock,
}))

vi.mock('../securitylogs/securityLog.api', () => ({
    getSecurityEvents:
    getSecurityEventsMock,
}))

vi.mock('../defenses/defense.api', () => ({
    getDefenseConfiguration:
    getDefenseConfigurationMock,
}))

function createPage<Content>(
    totalElements: number,
    content: Content[] = [],
): PageResponse<Content> {
    return {
        content,
        page: 0,
        size: 5,
        totalElements,
        totalPages:
            totalElements === 0
                ? 0
                : Math.ceil(totalElements / 5),
        first: true,
        last: totalElements <= 5,
    }
}

const SESSION: SimulationSession = {
    id: 'simulation-1',
    status: 'SUCCESS',
    startedAt: '2026-09-29T20:00:00Z',
    finishedAt: '2026-09-29T20:01:00Z',
    requestedAttempts: 100,
    totalAttempts: 75,
    failedAttempts: 74,
    successfulAttempts: 1,
    blockedAttempts: 0,
    delayMs: 50,
    defenseEnabled: false,
}

const SECURITY_EVENT: SecurityEvent = {
    id: 'event-1',
    timestamp: '2026-09-29T20:00:00Z',
    eventType: 'LOGIN_FAILURE',
    severity: 'LOW',
    source: 'ATTACK_SIMULATION',
    username: 'admin',
    description:
        'Authentication failed due to invalid credentials.',
    attackSessionId: 'simulation-1',
}

const DEFENSE_CONFIGURATION:
    DefenseConfiguration = {
    id: 'defense-config',
    rateLimitingEnabled: true,
    progressiveDelayEnabled: false,
    accountLockoutEnabled: true,
    clientThrottlingEnabled: false,
    suspiciousLoginDetectionEnabled: false,
    securityEventLoggingEnabled: true,
    updatedAt: '2026-09-29T20:00:00Z',
}

describe('getDashboardOverview', () => {
    beforeEach(() => {
        apiRequestMock.mockReset()
        getSecurityEventsMock.mockReset()
        getDefenseConfigurationMock.mockReset()
    })

    it('aggregates sessions, events, and active defenses', async () => {
        apiRequestMock
            .mockResolvedValueOnce(
                createPage(12, [SESSION]),
            )
            .mockResolvedValueOnce(
                createPage(1),
            )
            .mockResolvedValueOnce(
                createPage(4),
            )
            .mockResolvedValueOnce(
                createPage(3),
            )

        getSecurityEventsMock.mockResolvedValue(
            createPage(200, [
                SECURITY_EVENT,
            ]),
        )

        getDefenseConfigurationMock
            .mockResolvedValue(
                DEFENSE_CONFIGURATION,
            )

        await expect(
            getDashboardOverview(),
        ).resolves.toEqual({
            totalSimulations: 12,
            runningSimulations: 1,
            blockedSimulations: 4,
            successfulSimulations: 3,
            totalSecurityEvents: 200,
            activeDefenses: 3,
            recentSimulations: [SESSION],
            recentSecurityEvents: [
                SECURITY_EVENT,
            ],
        })

        expect(apiRequestMock)
            .toHaveBeenCalledTimes(4)

        expect(
            apiRequestMock.mock.calls[0]?.[0],
        ).toContain(
            '/api/v1/simulations?',
        )

        expect(
            apiRequestMock.mock.calls[1]?.[0],
        ).toContain('status=RUNNING')

        expect(
            apiRequestMock.mock.calls[2]?.[0],
        ).toContain('status=BLOCKED')

        expect(
            apiRequestMock.mock.calls[3]?.[0],
        ).toContain('status=SUCCESS')

        expect(getSecurityEventsMock)
            .toHaveBeenCalledWith({
                eventType: '',
                severity: '',
                search: '',
                page: 0,
                size: 5,
            })

        expect(getDefenseConfigurationMock)
            .toHaveBeenCalledOnce()
    })

    it('propagates failures from dashboard dependencies', async () => {
        apiRequestMock.mockRejectedValueOnce(
            new Error(
                'Simulation history unavailable.',
            ),
        )

        getSecurityEventsMock.mockResolvedValue(
            createPage<SecurityEvent>(0),
        )

        getDefenseConfigurationMock
            .mockResolvedValue(
                DEFENSE_CONFIGURATION,
            )

        await expect(
            getDashboardOverview(),
        ).rejects.toThrow(
            'Simulation history unavailable.',
        )
    })
})