import { apiRequest } from '../../shared/api/apiClient'
import type { PageResponse } from '../../shared/api/page.types'
import type {
    SimulationSession,
    SimulationStatus,
} from '../attacks/attack.types'
import { getDefenseConfiguration } from '../defenses/defense.api'
import { getSecurityEvents } from '../securitylogs/securityLog.api'
import type { DashboardOverview } from './dashboard.types'

function getSimulations(
    status?: SimulationStatus,
    size = 5,
): Promise<PageResponse<SimulationSession>> {
    const parameters = new URLSearchParams({
        page: '0',
        size: size.toString(),
        sort: 'startedAt,desc',
    })

    if (status) {
        parameters.set('status', status)
    }

    return apiRequest<PageResponse<SimulationSession>>(
        `/api/v1/simulations?${parameters.toString()}`,
    )
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
    const [
        simulations,
        runningSimulations,
        blockedSimulations,
        successfulSimulations,
        securityEvents,
        defenseConfiguration,
    ] = await Promise.all([
        getSimulations(),
        getSimulations('RUNNING', 1),
        getSimulations('BLOCKED', 1),
        getSimulations('SUCCESS', 1),
        getSecurityEvents({
            eventType: '',
            severity: '',
            search: '',
            page: 0,
            size: 5,
        }),
        getDefenseConfiguration(),
    ])

    const activeDefenses = [
        defenseConfiguration.rateLimitingEnabled,
        defenseConfiguration.progressiveDelayEnabled,
        defenseConfiguration.accountLockoutEnabled,
        defenseConfiguration.clientThrottlingEnabled,
        defenseConfiguration.suspiciousLoginDetectionEnabled,
        defenseConfiguration.securityEventLoggingEnabled,
    ].filter(Boolean).length

    return {
        totalSimulations: simulations.totalElements,
        runningSimulations:
        runningSimulations.totalElements,
        blockedSimulations:
        blockedSimulations.totalElements,
        successfulSimulations:
        successfulSimulations.totalElements,
        totalSecurityEvents:
        securityEvents.totalElements,
        activeDefenses,
        recentSimulations: simulations.content,
        recentSecurityEvents: securityEvents.content,
    }
}