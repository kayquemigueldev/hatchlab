export type SecurityEventType =
    | 'LOGIN_ATTEMPT'
    | 'LOGIN_FAILURE'
    | 'LOGIN_SUCCESS'
    | 'RATE_LIMIT_TRIGGERED'
    | 'CLIENT_THROTTLED'
    | 'ACCOUNT_LOCKED'
    | 'SUSPICIOUS_ACTIVITY'
    | 'AUTHENTICATION_BLOCKED'
    | 'SIMULATION_STARTED'
    | 'SIMULATION_STOPPED'
    | 'SIMULATION_COMPLETED'

export type SecurityEventSeverity =
    | 'INFO'
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'CRITICAL'

export type AuthenticationSource =
    | 'LOCAL_AUTH_LAB'
    | 'ATTACK_SIMULATION'

export interface SecurityEvent {
    id: string
    timestamp: string
    eventType: SecurityEventType
    severity: SecurityEventSeverity
    source: AuthenticationSource
    username: string | null
    description: string
    attackSessionId: string | null
}

export interface SecurityEventFilters {
    eventType: SecurityEventType | ''
    severity: SecurityEventSeverity | ''
    search: string
    page: number
    size: number
}