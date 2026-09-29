import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'
import {
    getSecurityScore,
    getSimulationComparison,
    getSimulationHistory,
} from './comparison.api'

const { apiRequestMock } = vi.hoisted(() => ({
    apiRequestMock: vi.fn(),
}))

vi.mock('../../shared/api/apiClient', () => ({
    apiRequest: apiRequestMock,
}))

function getRequestedUrl(): URL {
    const path = String(
        apiRequestMock.mock.calls[0]?.[0],
    )

    return new URL(
        path,
        'http://localhost',
    )
}

describe('comparison API', () => {
    beforeEach(() => {
        apiRequestMock.mockReset()
        apiRequestMock.mockResolvedValue({})
    })

    it('loads recent simulation history', async () => {
        await getSimulationHistory()

        const url = getRequestedUrl()

        expect(url.pathname).toBe(
            '/api/v1/simulations',
        )

        expect(url.searchParams.get('page'))
            .toBe('0')

        expect(url.searchParams.get('size'))
            .toBe('100')

        expect(url.searchParams.get('sort'))
            .toBe('startedAt,desc')
    })

    it('requests a baseline and protected comparison', async () => {
        await getSimulationComparison(
            'baseline-1',
            'protected-1',
        )

        const url = getRequestedUrl()

        expect(url.pathname).toBe(
            '/api/v1/simulations/compare',
        )

        expect(
            url.searchParams.get('baselineId'),
        ).toBe('baseline-1')

        expect(
            url.searchParams.get('protectedId'),
        ).toBe('protected-1')
    })

    it('requests the security score for a simulation pair', async () => {
        await getSecurityScore(
            'baseline-1',
            'protected-1',
        )

        const url = getRequestedUrl()

        expect(url.pathname).toBe(
            '/api/v1/security-score',
        )

        expect(
            url.searchParams.get('baselineId'),
        ).toBe('baseline-1')

        expect(
            url.searchParams.get('protectedId'),
        ).toBe('protected-1')
    })
})