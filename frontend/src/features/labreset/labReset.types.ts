import type { DefenseConfiguration } from '../defenses/defense.types'

export interface LabResetResponse {
    resetAt: string
    deletedAuthenticationAttempts: number
    deletedSecurityEvents: number
    deletedAttackSessions: number
    laboratoryUsersReset: number
    defenseConfiguration: DefenseConfiguration
}