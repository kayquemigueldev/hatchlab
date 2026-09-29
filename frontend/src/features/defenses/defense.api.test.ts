import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'
import type {
    DefenseConfiguration,
    DefenseConfigurationRequest,
} from './defense.types'
import {
    getDefenseConfiguration,
    updateDefenseConfiguration,
} from './defense.api'

const { apiRequestMock } = vi.hoisted(() => ({
    apiRequestMock: vi.fn(),
}))

vi.mock('../../shared/api/apiClient', () => ({
    apiRequest: apiRequestMock,
}))

const REQUEST: DefenseConfigurationRequest = {
    rateLimitingEnabled: true,
    progressiveDelayEnabled: true,
    accountLockoutEnabled: false,
    clientThrottlingEnabled: false,
    suspiciousLoginDetectionEnabled: true,
    securityEventLoggingEnabled: true,
}

const CONFIGURATION: DefenseConfiguration = {
    id: 'defense-config',
    ...REQUEST,
    updatedAt: '2026-09-29T20:00:00Z',
}

describe('defense API', () => {
    beforeEach(() => {
        apiRequestMock.mockReset()
        apiRequestMock.mockResolvedValue(
            CONFIGURATION,
        )
    })

    it('loads the current defense configuration', async () => {
        await expect(
            getDefenseConfiguration(),
        ).resolves.toEqual(CONFIGURATION)

        expect(apiRequestMock).toHaveBeenCalledWith(
            '/api/v1/defense-config',
        )
    })

    it('updates the defense configuration', async () => {
        await expect(
            updateDefenseConfiguration(REQUEST),
        ).resolves.toEqual(CONFIGURATION)

        expect(apiRequestMock).toHaveBeenCalledWith(
            '/api/v1/defense-config',
            {
                method: 'PUT',
                headers: {
                    'Content-Type':
                        'application/json',
                },
                body: JSON.stringify(REQUEST),
            },
        )
    })
})