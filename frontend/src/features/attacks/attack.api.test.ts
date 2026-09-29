import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'
import type {
    SimulationSession,
    StartSimulationRequest,
} from './attack.types'
import {
    getSimulation,
    startSimulation,
    stopSimulation,
} from './attack.api'

const { apiRequestMock } = vi.hoisted(() => ({
    apiRequestMock: vi.fn(),
}))

vi.mock('../../shared/api/apiClient', () => ({
    apiRequest: apiRequestMock,
}))

const REQUEST: StartSimulationRequest = {
    username: 'admin',
    wordlist: 'LAB_DEFAULT',
    requestedAttempts: 100,
    delayMs: 500,
}

const SESSION: SimulationSession = {
    id: 'simulation-1',
    status: 'RUNNING',
    startedAt: '2026-09-29T20:00:00Z',
    finishedAt: null,
    requestedAttempts: 100,
    totalAttempts: 0,
    failedAttempts: 0,
    successfulAttempts: 0,
    blockedAttempts: 0,
    delayMs: 500,
    defenseEnabled: false,
}

describe('attack API', () => {
    beforeEach(() => {
        apiRequestMock.mockReset()
        apiRequestMock.mockResolvedValue(
            SESSION,
        )
    })

    it('starts a controlled simulation', async () => {
        await expect(
            startSimulation(REQUEST),
        ).resolves.toEqual(SESSION)

        expect(apiRequestMock).toHaveBeenCalledWith(
            '/api/v1/simulations',
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/json',
                },
                body: JSON.stringify(REQUEST),
            },
        )
    })

    it('loads a simulation by identifier', async () => {
        await getSimulation('simulation-1')

        expect(apiRequestMock).toHaveBeenCalledWith(
            '/api/v1/simulations/simulation-1',
        )
    })

    it('stops a running simulation', async () => {
        await stopSimulation('simulation-1')

        expect(apiRequestMock).toHaveBeenCalledWith(
            '/api/v1/simulations/simulation-1/stop',
            {
                method: 'POST',
            },
        )
    })
})