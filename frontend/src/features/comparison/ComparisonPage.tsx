import type { CSSProperties } from 'react'
import type { SimulationSession } from '../attacks/attack.types'
import type {
    SecurityScoreBreakdown,
    SimulationMetrics,
} from './comparison.types'
import { useSimulationComparison } from './useSimulationComparison'

const SCORE_CATEGORIES: Array<{
    key: keyof SecurityScoreBreakdown
    label: string
    maximum: number
}> = [
    {
        key: 'attackPreventionPoints',
        label: 'Attack prevention',
        maximum: 40,
    },
    {
        key: 'attemptReductionPoints',
        label: 'Attempt reduction',
        maximum: 30,
    },
    {
        key: 'blockingPoints',
        label: 'Blocking effectiveness',
        maximum: 20,
    },
    {
        key: 'defensiveOutcomePoints',
        label: 'Defensive outcome',
        maximum: 10,
    },
]

function formatSessionOption(
    session: SimulationSession,
): string {
    const timestamp = new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(session.startedAt))

    return [
        timestamp,
        session.status,
        `${session.requestedAttempts} attempts`,
        `${session.delayMs} ms`,
    ].join(' · ')
}

function formatSessionId(sessionId: string): string {
    return sessionId.toUpperCase()
}

function formatDuration(durationMs: number): string {
    if (durationMs < 1000) {
        return `${durationMs} ms`
    }

    return `${(durationMs / 1000).toFixed(2)} s`
}

function formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`
}

interface ScenarioCardProps {
    title: string
    label: string
    tone: 'baseline' | 'protected'
    metrics: SimulationMetrics
}

function ScenarioCard({
                          title,
                          label,
                          tone,
                          metrics,
                      }: ScenarioCardProps) {
    return (
        <article
            className={[
                'scenario-card',
                `scenario-card--${tone}`,
            ].join(' ')}
        >
            <div className="scenario-card__header">
                <div>
                    <span>{label}</span>
                    <h3>{title}</h3>
                </div>

                <strong>{metrics.status}</strong>
            </div>

            <code>{formatSessionId(metrics.sessionId)}</code>

            <div className="scenario-card__metrics">
                <div>
                    <span>Total attempts</span>
                    <strong>{metrics.totalAttempts}</strong>
                </div>

                <div>
                    <span>Failed</span>
                    <strong>{metrics.failedAttempts}</strong>
                </div>

                <div>
                    <span>Successful</span>
                    <strong>
                        {metrics.successfulAttempts}
                    </strong>
                </div>

                <div>
                    <span>Blocked</span>
                    <strong>{metrics.blockedAttempts}</strong>
                </div>
            </div>

            <dl className="scenario-card__details">
                <div>
                    <dt>Duration</dt>
                    <dd>
                        {formatDuration(metrics.durationMs)}
                    </dd>
                </div>

                <div>
                    <dt>Attempts / second</dt>
                    <dd>
                        {metrics.attemptsPerSecond.toFixed(2)}
                    </dd>
                </div>

                <div>
                    <dt>Success rate</dt>
                    <dd>
                        {formatPercentage(
                            metrics.successRatePercentage,
                        )}
                    </dd>
                </div>

                <div>
                    <dt>Blocked rate</dt>
                    <dd>
                        {formatPercentage(
                            metrics.blockedRatePercentage,
                        )}
                    </dd>
                </div>
            </dl>
        </article>
    )
}

export function ComparisonPage() {
    const {
        baselineSessions,
        protectedSessions,
        selectedBaseline,
        selectedProtected,
        baselineId,
        protectedId,
        comparison,
        securityScore,
        loadingHistory,
        comparing,
        error,
        canCompare,
        selectBaseline,
        selectProtected,
        compare,
        reloadHistory,
    } = useSimulationComparison()

    const noBaselineSessions =
        !loadingHistory &&
        baselineSessions.length === 0

    const noProtectedSessions =
        !loadingHistory &&
        Boolean(selectedBaseline) &&
        protectedSessions.length === 0

    return (
        <main className="comparison-page">
            <section className="comparison-page__content">
                <div className="comparison-page__heading">
                    <div>
                        <span className="section-eyebrow">
                            DEFENSE EFFECTIVENESS
                        </span>

                        <h1>Security Comparison</h1>

                        <p>
                            Compare a baseline attack with an
                            equivalent protected simulation and
                            measure the defensive impact.
                        </p>
                    </div>

                    <div className="comparison-page__model">
                        <span>COMPARISON MODEL</span>
                        <strong>BASELINE → PROTECTED</strong>
                        <small>Equivalent parameters required</small>
                    </div>
                </div>

                <section className="comparison-selector">
                    <div className="comparison-selector__header">
                        <div>
                            <span className="panel-eyebrow">
                                SIMULATION PAIR
                            </span>

                            <h2>Select comparable sessions</h2>
                        </div>

                        <button
                            className="button button--primary"
                            type="button"
                            disabled={!canCompare}
                            onClick={() => void compare()}
                        >
                            {comparing
                                ? 'Calculating...'
                                : 'Compare simulations'}
                        </button>
                    </div>

                    {loadingHistory ? (
                        <div className="comparison-loading">
                            <span />
                            Loading simulation history...
                        </div>
                    ) : (
                        <div className="comparison-selector__grid">
                            <label className="comparison-field">
                                <span>Baseline simulation</span>

                                <select
                                    value={baselineId}
                                    disabled={
                                        baselineSessions.length === 0 ||
                                        comparing
                                    }
                                    onChange={(event) =>
                                        selectBaseline(
                                            event.target.value,
                                        )
                                    }
                                >
                                    <option value="">
                                        Select a baseline
                                    </option>

                                    {baselineSessions.map(
                                        (session) => (
                                            <option
                                                key={session.id}
                                                value={session.id}
                                            >
                                                {formatSessionOption(
                                                    session,
                                                )}
                                            </option>
                                        ),
                                    )}
                                </select>

                                <small>
                                    Completed simulation with all
                                    defenses disabled.
                                </small>

                                {selectedBaseline && (
                                    <code>
                                        {formatSessionId(
                                            selectedBaseline.id,
                                        )}
                                    </code>
                                )}
                            </label>

                            <div
                                className="comparison-selector__arrow"
                                aria-hidden="true"
                            >
                                →
                            </div>

                            <label className="comparison-field">
                                <span>Protected simulation</span>

                                <select
                                    value={protectedId}
                                    disabled={
                                        protectedSessions.length === 0 ||
                                        comparing
                                    }
                                    onChange={(event) =>
                                        selectProtected(
                                            event.target.value,
                                        )
                                    }
                                >
                                    <option value="">
                                        Select a protected session
                                    </option>

                                    {protectedSessions.map(
                                        (session) => (
                                            <option
                                                key={session.id}
                                                value={session.id}
                                            >
                                                {formatSessionOption(
                                                    session,
                                                )}
                                            </option>
                                        ),
                                    )}
                                </select>

                                <small>
                                    Protected simulation with matching
                                    attempt count and delay.
                                </small>

                                {selectedProtected && (
                                    <code>
                                        {formatSessionId(
                                            selectedProtected.id,
                                        )}
                                    </code>
                                )}
                            </label>
                        </div>
                    )}

                    {noBaselineSessions && (
                        <div className="comparison-notice">
                            No completed baseline simulation is
                            available. Run an attack with defenses
                            disabled first.
                        </div>
                    )}

                    {noProtectedSessions && (
                        <div className="comparison-notice">
                            No compatible protected simulation was
                            found. Run another simulation with defenses
                            enabled using the same attempt count and
                            delay.
                        </div>
                    )}

                    {error && (
                        <div
                            className="comparison-error"
                            role="alert"
                        >
                            <div>
                                <strong>
                                    Comparison unavailable
                                </strong>
                                <span>{error}</span>
                            </div>

                            {baselineSessions.length === 0 && (
                                <button
                                    className="button button--secondary"
                                    type="button"
                                    onClick={() =>
                                        void reloadHistory()
                                    }
                                >
                                    Retry
                                </button>
                            )}
                        </div>
                    )}
                </section>

                {!comparison || !securityScore ? (
                    <section className="comparison-empty">
                        <div
                            className="comparison-empty__diagram"
                            aria-hidden="true"
                        >
                            <span>B</span>
                            <i />
                            <span>P</span>
                        </div>

                        <strong>
                            Select a simulation pair
                        </strong>

                        <p>
                            HATCHLAB will calculate security metrics,
                            defense impact, and an evidence-based
                            security score.
                        </p>
                    </section>
                ) : (
                    <div className="comparison-results">
                        <section className="security-score">
                            <div className="security-score__summary">
                                <div
                                    className={[
                                        'security-score__ring',
                                        `security-score__ring--${securityScore.riskLevel.toLowerCase()}`,
                                    ].join(' ')}
                                    style={
                                        {
                                            '--score-angle':
                                                `${securityScore.score * 3.6}deg`,
                                        } as CSSProperties
                                    }
                                >
                                    <div>
                                        <strong>
                                            {securityScore.score}
                                        </strong>
                                        <span>/ 100</span>
                                    </div>
                                </div>

                                <div>
                                    <span className="panel-eyebrow">
                                        HATCHLAB SECURITY SCORE
                                    </span>

                                    <h2>
                                        {securityScore.riskLevel} RISK
                                    </h2>

                                    <p>
                                        Score calculated from attack
                                        prevention, attempt reduction,
                                        blocking effectiveness, and the
                                        final defensive outcome.
                                    </p>
                                </div>
                            </div>

                            <div className="security-score__breakdown">
                                {SCORE_CATEGORIES.map(
                                    (category) => {
                                        const points =
                                            securityScore.breakdown[
                                                category.key
                                                ]

                                        const percentage =
                                            (points /
                                                category.maximum) *
                                            100

                                        return (
                                            <div
                                                key={category.key}
                                                className="score-category"
                                            >
                                                <div>
                                                    <span>
                                                        {category.label}
                                                    </span>

                                                    <strong>
                                                        {points} /{' '}
                                                        {
                                                            category.maximum
                                                        }
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span
                                                        style={{
                                                            width: `${percentage}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    },
                                )}
                            </div>
                        </section>

                        <section className="scenario-comparison">
                            <ScenarioCard
                                title="Without defenses"
                                label="BASELINE"
                                tone="baseline"
                                metrics={comparison.baseline}
                            />

                            <ScenarioCard
                                title="Defenses enabled"
                                label="PROTECTED"
                                tone="protected"
                                metrics={
                                    comparison.protectedScenario
                                }
                            />
                        </section>

                        <section className="defense-impact">
                            <div className="defense-impact__header">
                                <span className="panel-eyebrow">
                                    MEASURED DEFENSE IMPACT
                                </span>

                                <h2>
                                    What changed with protection
                                </h2>
                            </div>

                            <div className="defense-impact__grid">
                                <article>
                                    <span>Attempts prevented</span>
                                    <strong>
                                        {
                                            comparison.defenseImpact
                                                .attemptsPrevented
                                        }
                                    </strong>
                                </article>

                                <article>
                                    <span>
                                        Blocked attempts increase
                                    </span>
                                    <strong>
                                        +
                                        {
                                            comparison.defenseImpact
                                                .blockedAttemptsIncrease
                                        }
                                    </strong>
                                </article>

                                <article>
                                    <span>
                                        Blocked rate increase
                                    </span>
                                    <strong>
                                        +
                                        {formatPercentage(
                                            comparison.defenseImpact
                                                .blockedRateIncreasePercentagePoints,
                                        )}
                                    </strong>
                                </article>

                                <article>
                                    <span>
                                        Successful attempts reduced
                                    </span>
                                    <strong>
                                        {
                                            comparison.defenseImpact
                                                .successfulAttemptsReduction
                                        }
                                    </strong>
                                </article>

                                <article>
                                    <span>
                                        Success rate reduction
                                    </span>
                                    <strong>
                                        {formatPercentage(
                                            comparison.defenseImpact
                                                .successRateReductionPercentagePoints,
                                        )}
                                    </strong>
                                </article>

                                <article>
                                    <span>Duration reduction</span>
                                    <strong>
                                        {formatDuration(
                                            comparison.defenseImpact
                                                .durationReductionMs,
                                        )}
                                    </strong>
                                </article>
                            </div>
                        </section>
                    </div>
                )}
            </section>
        </main>
    )
}