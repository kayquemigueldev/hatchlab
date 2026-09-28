import type { SimulationSession } from '../attacks/attack.types'
import type { SecurityEvent } from '../securitylogs/securityLog.types'

export interface DashboardOverview {
    totalSimulations: number
    runningSimulations: number
    blockedSimulations: number
    successfulSimulations: number
    totalSecurityEvents: number
    activeDefenses: number
    recentSimulations: SimulationSession[]
    recentSecurityEvents: SecurityEvent[]
}