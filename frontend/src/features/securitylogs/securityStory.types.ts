import type {
    SecurityEventSeverity,
} from './securityLog.types'

export type SecurityStoryTone =
    | 'neutral'
    | 'safe'
    | 'warning'
    | 'danger'

export interface SecurityStoryEvent {
    id: string
    timestamp: string
    title: string
    explanation: string
    tone: SecurityStoryTone
}

export interface SecurityStory {
    headline: string
    explanation: string
    totalEvents: number
    loginAttempts: number
    failedAttempts: number
    successfulAttempts: number
    defenseActions: number
    highestSeverity: SecurityEventSeverity | null
    timeline: SecurityStoryEvent[]
}