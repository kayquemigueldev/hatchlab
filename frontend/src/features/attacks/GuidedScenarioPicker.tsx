import type { StartSimulationRequest } from './attack.types'
import type {
    AttackScenario,
    AttackScenarioId,
} from './attackScenario.types'
import { useAttackScenario } from './useAttackScenario'

interface GuidedScenarioPickerProps {
    applyAttackRequest:
        (request: StartSimulationRequest) => void
    disabled?: boolean
}

interface ScenarioCardProps {
    scenario: AttackScenario
    selected: boolean
    disabled: boolean
    onSelect:
        (scenarioId: AttackScenarioId) => void
}

function ScenarioCard({
                          scenario,
                          selected,
                          disabled,
                          onSelect,
                      }: ScenarioCardProps) {
    return (
        <button
            className={[
                'guided-scenario-card',
                selected
                    ? 'guided-scenario-card--selected'
                    : '',
                `guided-scenario-card--${scenario.tone.toLowerCase()}`,
            ]
                .filter(Boolean)
                .join(' ')}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            onClick={() =>
                onSelect(scenario.id)
            }
        >
            <span className="guided-scenario-card__sequence">
                {scenario.sequence}
            </span>

            <strong>{scenario.name}</strong>

            <p>{scenario.summary}</p>

            <span className="guided-scenario-card__select">
                {selected
                    ? 'Selected scenario'
                    : 'Choose scenario'}
            </span>
        </button>
    )
}

export function GuidedScenarioPicker({
                                         applyAttackRequest,
                                         disabled = false,
                                     }: GuidedScenarioPickerProps) {
    const {
        scenarios,
        selectedScenario,
        selectedScenarioId,
        preparing,
        error,
        message,
        isPrepared,
        selectScenario,
        prepareScenario,
    } = useAttackScenario({
        applyAttackRequest,
    })

    return (
        <section className="guided-scenarios">
            <div className="guided-scenarios__header">
                <div>
                    <span className="section-eyebrow">
                        GUIDED DEMONSTRATIONS
                    </span>

                    <h2>
                        Choose what you want to understand
                    </h2>

                    <p>
                        HATCHLAB will configure the defenses and
                        attack parameters for you. No security
                        knowledge is required.
                    </p>
                </div>

                <span className="guided-scenarios__badge">
                    STEP-BY-STEP
                </span>
            </div>

            <div className="guided-scenarios__grid">
                {scenarios.map((scenario) => (
                    <ScenarioCard
                        key={scenario.id}
                        scenario={scenario}
                        selected={
                            scenario.id ===
                            selectedScenarioId
                        }
                        disabled={
                            disabled || preparing
                        }
                        onSelect={selectScenario}
                    />
                ))}
            </div>

            <div
                className={[
                    'guided-scenario-detail',
                    `guided-scenario-detail--${selectedScenario.tone.toLowerCase()}`,
                ].join(' ')}
            >
                <div className="guided-scenario-detail__content">
                    <div>
                        <span>WHAT YOU WILL SEE</span>

                        <strong>
                            {
                                selectedScenario.expectedOutcome
                            }
                        </strong>
                    </div>

                    <div>
                        <span>WHAT YOU WILL LEARN</span>

                        <p>
                            {
                                selectedScenario.learningGoal
                            }
                        </p>
                    </div>
                </div>

                <div className="guided-scenario-detail__defenses">
                    <span>
                        CONTROLS USED IN THIS SCENARIO
                    </span>

                    <div>
                        {selectedScenario.defenses.map(
                            (defense) => (
                                <small key={defense}>
                                    {defense}
                                </small>
                            ),
                        )}
                    </div>
                </div>

                <div className="guided-scenario-detail__action">
                    <button
                        className={
                            isPrepared
                                ? 'button button--secondary'
                                : 'button button--primary'
                        }
                        type="button"
                        disabled={
                            disabled ||
                            preparing ||
                            isPrepared
                        }
                        onClick={() =>
                            void prepareScenario()
                        }
                    >
                        {preparing
                            ? 'Preparing scenario...'
                            : isPrepared
                                ? 'Scenario ready'
                                : 'Prepare this scenario'}
                    </button>

                    <small>
                        {isPrepared
                            ? 'The defenses and attack parameters are ready. Use Start simulation below.'
                            : 'This updates only the local HATCHLAB laboratory.'}
                    </small>
                </div>
            </div>

            {message && (
                <div
                    className="guided-scenarios__message"
                    role="status"
                >
                    <strong>Scenario prepared</strong>
                    <span>{message}</span>
                </div>
            )}

            {error && (
                <div
                    className="attack-error"
                    role="alert"
                >
                    <strong>
                        Scenario preparation failed
                    </strong>
                    <span>{error}</span>
                </div>
            )}
        </section>
    )
}