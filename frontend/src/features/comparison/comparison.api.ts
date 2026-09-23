import { apiRequest } from '../../shared/api/apiClient'
import type { PageResponse } from '../../shared/api/page.types'
import type { SimulationSession } from '../attacks/attack.types'
import type {
    SecurityScore,
    SimulationComparison,
} from './comparison.types'

export function getSimulationHistory(): Promise<
    PageResponse<SimulationSession>
> {
    const parameters = new URLSearchParams({
        page: '0',
        size: '100',
        sort: 'startedAt,desc',
    })

    return apiRequest<PageResponse<SimulationSession>>(
        `/api/v1/simulations?${parameters.toString()}`,
    )
}

export function getSimulationComparison(
    baselineId: string,
    protectedId: string,
): Promise<SimulationComparison> {
    const parameters = new URLSearchParams({
        baselineId,
        protectedId,
    })

    return apiRequest<SimulationComparison>(
        `/api/v1/simulations/compare?${parameters.toString()}`,
    )
}

export function getSecurityScore(
    baselineId: string,
    protectedId: string,
): Promise<SecurityScore> {
    const parameters = new URLSearchParams({
        baselineId,
        protectedId,
    })

    return apiRequest<SecurityScore>(
        `/api/v1/security-score?${parameters.toString()}`,
    )
}