import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'
import type { LabResetResponse } from './labReset.types'
import { resetLaboratory } from './labReset.api'

const { apiRequestMock } = vi.hoisted(() => ({
    apiRequestMock: vi.fn(),
}))

vi.mock('../../shared/api/apiClient', () => ({
    apiRequest: apiRequestMock,
}))

const RESET_RESPONSE: LabResetResponse = {
    resetAt: '2026-09-29T20:00:00Z',
    deletedAuthenticationAttempts: 5,
    deletedSecurityEvents: 8,
    deletedAttackSessions: 2,
    laboratoryUsersReset: 1,

    defenseConfiguration: {
        id: 'defense-config',
        rateLimitingEnabled: false,
        progressiveDelayEnabled: false,
        accountLockoutEnabled: false,
        clientThrottlingEnabled: false,
        suspiciousLoginDetectionEnabled: false,
        securityEventLoggingEnabled: true,
        updatedAt: '2026-09-29T20:00:00Z',
    },
}

describe('resetLaboratory', () => {
    beforeEach(() => {
        apiRequestMock.mockReset()
    })

    it('sends the required reset confirmation', async () => {
        apiRequestMock.mockResolvedValue(
            RESET_RESPONSE,
        )

        await expect(
            resetLaboratory(),
        ).resolves.toEqual(RESET_RESPONSE)

        expect(apiRequestMock).toHaveBeenCalledWith(
            '/api/v1/lab/reset',
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/json',
                },
                body: JSON.stringify({
                    confirmation:
                        'RESET_HATCHLAB',
                }),
            },
        )
    })
})