import {
    useCallback,
    useMemo,
    useState,
} from 'react'
import { updateDefenseConfiguration } from '../defenses/defense.api'
import type { StartSimulationRequest } from './attack.types'
import type { AttackScenarioId } from './attackScenario.types'
import {
    ATTACK_SCENARIOS,
    findAttackScenario,
} from './attackScenarios'

interface UseAttackScenarioOptions {
    applyAttackRequest:
        (request: StartSimulationRequest) => void
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }

    return 'Unable to prepare the guided scenario.'
}

export function useAttackScenario({
                                      applyAttackRequest,
                                  }: UseAttackScenarioOptions) {
    const [selectedScenarioId, setSelectedScenarioId] =
        useState<AttackScenarioId>(
            'ACCOUNT_LOCKOUT',
        )

    const [preparedScenarioId, setPreparedScenarioId] =
        useState<AttackScenarioId | null>(
            null,
        )

    const [preparing, setPreparing] =
        useState(false)

    const [error, setError] =
        useState<string | null>(null)

    const [message, setMessage] =
        useState<string | null>(null)

    const selectedScenario = useMemo(
        () =>
            findAttackScenario(
                selectedScenarioId,
            ),
        [selectedScenarioId],
    )

    const selectScenario = useCallback(
        (scenarioId: AttackScenarioId) => {
            setSelectedScenarioId(scenarioId)
            setPreparedScenarioId(null)
            setError(null)
            setMessage(null)
        },
        [],
    )

    const prepareScenario =
        useCallback(async () => {
            if (preparing) {
                return
            }

            const scenario =
                findAttackScenario(
                    selectedScenarioId,
                )

            setPreparing(true)
            setError(null)
            setMessage(null)

            try {
                await updateDefenseConfiguration(
                    scenario.defenseConfiguration,
                )

                applyAttackRequest({
                    ...scenario.attackRequest,
                })

                setPreparedScenarioId(
                    scenario.id,
                )

                setMessage(
                    `${scenario.shortName} is ready. Start the simulation when you are ready to observe it.`,
                )
            } catch (preparationError) {
                setPreparedScenarioId(null)
                setError(
                    getErrorMessage(
                        preparationError,
                    ),
                )
            } finally {
                setPreparing(false)
            }
        }, [
            applyAttackRequest,
            preparing,
            selectedScenarioId,
        ])

    return {
        scenarios: ATTACK_SCENARIOS,
        selectedScenario,
        selectedScenarioId,
        preparedScenarioId,
        preparing,
        error,
        message,
        isPrepared:
            preparedScenarioId ===
            selectedScenarioId,
        selectScenario,
        prepareScenario,
    }
}