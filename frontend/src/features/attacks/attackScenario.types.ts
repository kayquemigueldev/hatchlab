import type { DefenseConfigurationRequest } from '../defenses/defense.types'
import type { StartSimulationRequest } from './attack.types'

export type AttackScenarioId =
    | 'UNPROTECTED'
    | 'ACCOUNT_LOCKOUT'
    | 'RATE_LIMITING'
    | 'FULL_PROTECTION'

export type AttackScenarioTone =
    | 'NEUTRAL'
    | 'WARNING'
    | 'SAFE'

export interface AttackScenario {
    id: AttackScenarioId
    sequence: string
    name: string
    shortName: string
    summary: string
    expectedOutcome: string
    learningGoal: string
    tone: AttackScenarioTone
    defenses: string[]
    defenseConfiguration:
        DefenseConfigurationRequest
    attackRequest: StartSimulationRequest
}