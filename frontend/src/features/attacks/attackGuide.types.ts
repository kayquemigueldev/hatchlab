import type { SecurityEventType } from '../securitylogs/securityLog.types'

export type AttackGuideStage =
    | 'ATTACKER'
    | 'LOGIN'
    | 'DEFENSE'
    | 'RESULT'

export type AttackGuideTone =
    | 'NEUTRAL'
    | 'INFO'
    | 'SAFE'
    | 'WARNING'
    | 'DANGER'

export interface AttackGuideEntry {
    id: string
    sessionId: string
    eventType: SecurityEventType
    timestamp: string
    stage: AttackGuideStage
    tone: AttackGuideTone
    title: string
    explanation: string
    whyItMatters: string
    defense: string | null
    count: number
}