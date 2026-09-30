import type { AttackGuideEntry, AttackGuideStage } from './attackGuide.types'
import type { SimulationSession } from './attack.types'
import { useAttackGuide } from './useAttackGuide'

interface GuidedAttackPanelProps {
    session: SimulationSession | null
    progressPercentage: number
}

interface FlowStage {
    id: AttackGuideStage
    number: string
    label: string
    description: string
}

const FLOW_STAGES: FlowStage[] = [
    {
        id: 'ATTACKER',
        number: '01',
        label: 'Attacker',
        description: 'Sends controlled password guesses.',
    },
    {
        id: 'LOGIN',
        number: '02',
        label: 'Login',
        description: 'Checks whether the credentials are valid.',
    },
    {
        id: 'DEFENSE',
        number: '03',
        label: 'Defenses',
        description: 'Inspects the request for abusive behavior.',
    },
    {
        id: 'RESULT',
        number: '04',
        label: 'Outcome',
        description: 'Allows, rejects, or blocks the attempt.',
    },
]

function getResponsibleDefense(
    entries: AttackGuideEntry[],
): string | null {
    for (let index = entries.length - 1; index >= 0; index -= 1) {
        if (entries[index].defense) {
            return entries[index].defense
        }
    }

    return null
}

function getResultSummary(
    session: SimulationSession,
    responsibleDefense: string | null,
): {
    tone: string
    title: string
    explanation: string
} {
    if (session.status === 'BLOCKED') {
        return {
            tone: 'safe',
            title: 'The defenses stopped the attack',
            explanation: `${
                responsibleDefense ?? 'An enabled defense'
            } interrupted the simulation after ${
                session.totalAttempts
            } processed attempts. The attacker could not continue testing passwords.`,
        }
    }

    if (session.status === 'SUCCESS') {
        return {
            tone: 'danger',
            title: 'The simulated attack found valid credentials',
            explanation: `A password candidate succeeded after ${session.totalAttempts} processed attempts. This demonstrates the risk of allowing repeated guesses to continue.`,
        }
    }

    if (session.status === 'STOPPED') {
        return {
            tone: 'warning',
            title: 'The simulation was manually stopped',
            explanation: `Execution ended after ${session.totalAttempts} processed attempts. No additional password candidates were tested.`,
        }
    }

    if (session.status === 'FAILED') {
        return {
            tone: 'danger',
            title: 'The simulation could not finish',
            explanation:
                'An internal error interrupted execution. The recorded attempts remain available for inspection.',
        }
    }

    return {
        tone: 'neutral',
        title: 'The controlled simulation finished',
        explanation: `HATCHLAB processed ${session.totalAttempts} attempts and recorded the complete outcome for analysis.`,
    }
}

export function GuidedAttackPanel({
                                      session,
                                      progressPercentage,
                                  }: GuidedAttackPanelProps) {
    const {
        entries,
        realtimeStatus,
        isLive,
    } = useAttackGuide(session)

    const latestEntry =
        entries.length > 0
            ? entries[entries.length - 1]
            : null

    const currentStage: AttackGuideStage =
        session && session.status !== 'RUNNING'
            ? 'RESULT'
            : latestEntry?.stage ?? 'ATTACKER'

    const observedStages = new Set(
        entries.map((entry) => entry.stage),
    )

    if (session && session.status !== 'RUNNING') {
        observedStages.add('RESULT')
    }

    const responsibleDefense =
        getResponsibleDefense(entries)

    const preventedAttempts = session
        ? Math.max(
            0,
            session.requestedAttempts -
            session.totalAttempts,
        )
        : 0

    const resultSummary =
        session && session.status !== 'RUNNING'
            ? getResultSummary(
                session,
                responsibleDefense,
            )
            : null


    const currentExplanation = resultSummary
        ? resultSummary
        : latestEntry
            ? {
                tone: latestEntry.tone.toLowerCase(),
                title: latestEntry.title,
                explanation: latestEntry.explanation,
            }
            : null

    return (
        <section
            className="guided-attack"
            aria-live="polite"
        >
            <div className="guided-attack__header">
                <div>
                    <span className="panel-eyebrow">
                        GUIDED EXPERIENCE
                    </span>

                    <h2>What is happening?</h2>

                    <p>
                        Follow the attack from the first password
                        guess to the final defensive outcome.
                    </p>
                </div>

                <span
                    className={[
                        'guided-attack__connection',
                        isLive
                            ? 'guided-attack__connection--live'
                            : '',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                >
                    {isLive
                        ? 'LIVE EXPLANATION'
                        : realtimeStatus}
                </span>
            </div>

            <div className="attack-flow">
                {FLOW_STAGES.map((stage, index) => {
                    const state =
                        stage.id === currentStage
                            ? 'active'
                            : observedStages.has(stage.id)
                                ? 'complete'
                                : 'waiting'

                    return (
                        <div
                            className="attack-flow__group"
                            key={stage.id}
                        >
                            <article
                                className={[
                                    'attack-flow__stage',
                                    `attack-flow__stage--${state}`,
                                ].join(' ')}
                            >
                                <span className="attack-flow__number">
                                    {stage.number}
                                </span>

                                <strong>{stage.label}</strong>

                                <small>
                                    {stage.description}
                                </small>
                            </article>

                            {index <
                                FLOW_STAGES.length - 1 && (
                                    <span
                                        className={[
                                            'attack-flow__connector',
                                            observedStages.has(
                                                FLOW_STAGES[
                                                index + 1
                                                    ].id,
                                            )
                                                ? 'attack-flow__connector--complete'
                                                : '',
                                        ]
                                            .filter(Boolean)
                                            .join(' ')}
                                        aria-hidden="true"
                                    >
                                    →
                                </span>
                                )}
                        </div>
                    )
                })}
            </div>

            {!session ? (
                <div className="guided-attack__empty">
                    <span aria-hidden="true">▶</span>

                    <div>
                        <strong>
                            Start a simulation to see the story
                        </strong>

                        <p>
                            HATCHLAB will explain each login
                            attempt, defensive reaction, and final
                            result in plain language.
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="guided-progress">
                        <div>
                            <span>
                        {session.status === 'RUNNING'
                            ? 'Attack progress'
                            : 'Attack progress before outcome'}
                            </span>

                            <strong>
                                {progressPercentage}%
                            </strong>
                        </div>

                        <div
                            className="guided-progress__track"
                            role="progressbar"
                            aria-label="Guided simulation progress"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={
                                progressPercentage
                            }
                        >
                            <span
                                style={{
                                    width: `${progressPercentage}%`,
                                }}
                            />
                        </div>

                        <small>
                            {session.status === 'BLOCKED'
                                ? `A defense stopped the attack after ${session.totalAttempts} attempts, preventing ${preventedAttempts} planned attempts.`
                                : `${session.totalAttempts} of ${session.requestedAttempts} possible attempts were processed.`}
                        </small>
                    </div>

                    {currentExplanation && (
                        <div
                            className={[
                                'guided-current',
                                `guided-current--${currentExplanation.tone}`,
                            ].join(' ')}
                        >
        <span>
            {resultSummary
                ? 'FINAL EXPLANATION'
                : 'CURRENT EXPLANATION'}
        </span>

                            <strong>
                                {currentExplanation.title}
                            </strong>

                            <p>
                                {currentExplanation.explanation}
                            </p>
                        </div>
                    )}

                    <div className="guided-timeline">
                        <div className="guided-timeline__header">
                            <div>
                                <span className="panel-eyebrow">
                                    LIVE STORY
                                </span>

                                <h3>
                                    Attack and defense timeline
                                </h3>
                            </div>

                            <small>
                                {entries.length}{' '}
                                explained steps
                            </small>
                        </div>

                        <ol>
                            {entries.map((entry) => (
                                <li
                                    className={[
                                        'guided-event',
                                        `guided-event--${entry.tone.toLowerCase()}`,
                                    ].join(' ')}
                                    key={entry.id}
                                >
                                    <span className="guided-event__marker" />

                                    <div className="guided-event__content">
                                        <div className="guided-event__heading">
                                            <strong>
                                                {entry.title}
                                            </strong>

                                            {entry.count > 1 && (
                                                <span>
                                                    ×
                                                    {
                                                        entry.count
                                                    }
                                                </span>
                                            )}
                                        </div>

                                        <p>
                                            {
                                                entry.explanation
                                            }
                                        </p>

                                        <div className="guided-event__meaning">
                                            <span>
                                                WHY IT MATTERS
                                            </span>

                                            <p>
                                                {
                                                    entry.whyItMatters
                                                }
                                            </p>
                                        </div>

                                        {entry.defense && (
                                            <small>
                                                Defense involved:{' '}
                                                <strong>
                                                    {
                                                        entry.defense
                                                    }
                                                </strong>
                                            </small>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {resultSummary && (
                        <section
                            className={[
                                'guided-summary',
                                `guided-summary--${resultSummary.tone}`,
                            ].join(' ')}
                        >
                            <div className="guided-summary__copy">
                                <span>
                                    PLAIN-LANGUAGE RESULT
                                </span>

                                <h3>
                                    {resultSummary.title}
                                </h3>

                                <p>
                                    {
                                        resultSummary.explanation
                                    }
                                </p>
                            </div>

                            <div className="guided-summary__metrics">
                                <article>
                                    <strong>
                                        {
                                            session.totalAttempts
                                        }
                                    </strong>
                                    <span>
                                        attempts processed
                                    </span>
                                </article>

                                <article>
                                    <strong>
                                        {
                                            session.failedAttempts
                                        }
                                    </strong>
                                    <span>
                                        passwords rejected
                                    </span>
                                </article>

                                <article>
                                    <strong>
                                        {preventedAttempts}
                                    </strong>
                                    <span>
                                        attempts prevented
                                    </span>
                                </article>

                                <article>
                                    <strong>
                                        {responsibleDefense ??
                                            'None'}
                                    </strong>
                                    <span>
                                        defense responsible
                                    </span>
                                </article>
                            </div>
                        </section>
                    )}

                </>
            )}
        </section>
    )
}