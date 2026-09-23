export type SimulationStatus =
    | 'IDLE'
    | 'RUNNING'
    | 'SUCCESS'
    | 'BLOCKED'
    | 'STOPPED'
    | 'COMPLETED'
    | 'FAILED'

export type SimulationAttemptCount = 100 | 500 | 1000

export interface StartSimulationRequest {
    username: string
    wordlist: 'LAB_DEFAULT'
    requestedAttempts: SimulationAttemptCount
    delayMs: number
}

export interface SimulationSession {
    id: string
    status: SimulationStatus
    startedAt: string
    finishedAt: string | null
    requestedAttempts: number
    totalAttempts: number
    failedAttempts: number
    successfulAttempts: number
    blockedAttempts: number
    delayMs: number
    defenseEnabled: boolean
}