import type { SimulationStatus } from '../attacks/attack.types'

export type SecurityRiskLevel =
    | 'CRITICAL'
    | 'HIGH'
    | 'MEDIUM'
    | 'LOW'
    | 'MINIMAL'

export interface SimulationMetrics {
    sessionId: string
    status: SimulationStatus
    defenseEnabled: boolean
    requestedAttempts: number
    totalAttempts: number
    failedAttempts: number
    successfulAttempts: number
    blockedAttempts: number
    durationMs: number
    attemptsPerSecond: number
    failureRatePercentage: number
    successRatePercentage: number
    blockedRatePercentage: number
}

export interface SimulationDefenseImpact {
    attemptsPrevented: number
    blockedAttemptsIncrease: number
    blockedRateIncreasePercentagePoints: number
    successfulAttemptsReduction: number
    successRateReductionPercentagePoints: number
    durationReductionMs: number
}

export interface SimulationComparison {
    baseline: SimulationMetrics
    protectedScenario: SimulationMetrics
    defenseImpact: SimulationDefenseImpact
}

export interface SecurityScoreBreakdown {
    attackPreventionPoints: number
    attemptReductionPoints: number
    blockingPoints: number
    defensiveOutcomePoints: number
}

export interface SecurityScore {
    baselineSessionId: string
    protectedSessionId: string
    score: number
    riskLevel: SecurityRiskLevel
    breakdown: SecurityScoreBreakdown
}