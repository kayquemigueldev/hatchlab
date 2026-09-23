import type { FormEvent } from 'react'
import type {
    SimulationAttemptCount,
    SimulationSession,
    SimulationStatus,
} from './attack.types'
import { useAttackSimulation } from './useAttackSimulation'

const STATUS_LABELS: Record<SimulationStatus, string> = {
    RUNNING: 'Running',
    SUCCESS: 'Completed',
    BLOCKED: 'Blocked',
    STOPPED: 'Stopped',
    FAILED: 'Failed',
}

function formatTimestamp(timestamp: string | null): string {
    if (!timestamp) {
        return '—'
    }

    return new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'medium',
    }).format(new Date(timestamp))
}

function formatSessionId(session: SimulationSession): string {
    return session.id.toUpperCase()
}

export function AttackLabPage() {
    const {
        request,
        session,
        isStarting,
        isStopping,
        isRunning,
        canStart,
        progressPercentage,
        error,
        updateRequest,
        start,
        stop,
        clearSession,
    } = useAttackSimulation()

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        void start()
    }

    return (
        <main className="attack-lab">
            <section className="attack-lab__content">
                <div className="attack-lab__heading">
                    <div>
                        <span className="section-eyebrow">
                            CONTROLLED ATTACK SIMULATION
                        </span>

                        <h1>Attack Lab</h1>

                        <p>
                            Configure and observe a controlled credential
                            simulation against the local authentication
                            laboratory.
                        </p>
                    </div>

                    <div className="attack-lab__scope">
                        <span>AUTHORIZED TARGET</span>
                        <strong>LOCAL AUTH LAB</strong>
                        <small>localhost only</small>
                    </div>
                </div>

                <div className="attack-lab__workspace">
                    <form
                        className="attack-config"
                        onSubmit={handleSubmit}
                    >
                        <div className="attack-config__header">
                            <div>
                                <span className="panel-eyebrow">
                                    SIMULATION CONFIGURATION
                                </span>

                                <h2>Attack parameters</h2>
                            </div>

                            <span className="attack-config__local-badge">
                                LOCAL ONLY
                            </span>
                        </div>

                        <label className="attack-field">
                            <span className="attack-field__label">
                                Target username
                            </span>

                            <input
                                type="text"
                                value={request.username}
                                disabled={isRunning || isStarting}
                                autoComplete="off"
                                spellCheck={false}
                                onChange={(event) =>
                                    updateRequest(
                                        'username',
                                        event.target.value,
                                    )
                                }
                            />

                            <small>
                                Laboratory account used by the controlled
                                simulation.
                            </small>
                        </label>

                        <label className="attack-field">
                            <span className="attack-field__label">
                                Wordlist
                            </span>

                            <select
                                value={request.wordlist}
                                disabled={isRunning || isStarting}
                                onChange={() =>
                                    updateRequest(
                                        'wordlist',
                                        'LAB_DEFAULT',
                                    )
                                }
                            >
                                <option value="LAB_DEFAULT">
                                    LAB_DEFAULT
                                </option>
                            </select>

                            <small>
                                Internal test candidates bundled with
                                HATCHLAB.
                            </small>
                        </label>

                        <label className="attack-field">
                            <span className="attack-field__label">
                                Maximum attempts
                            </span>

                            <select
                                value={request.requestedAttempts}
                                disabled={isRunning || isStarting}
                                onChange={(event) =>
                                    updateRequest(
                                        'requestedAttempts',
                                        Number(
                                            event.target.value,
                                        ) as SimulationAttemptCount,
                                    )
                                }
                            >
                                <option value={100}>
                                    100 attempts
                                </option>

                                <option value={500}>
                                    500 attempts
                                </option>

                                <option value={1000}>
                                    1,000 attempts
                                </option>
                            </select>

                            <small>
                                The simulation may finish sooner when a
                                defense blocks it or credentials succeed.
                            </small>
                        </label>

                        <label className="attack-field">
                            <span className="attack-field__label-row">
                                <span>Delay between attempts</span>

                                <strong>
                                    {request.delayMs} ms
                                </strong>
                            </span>

                            <input
                                className="attack-field__range"
                                type="range"
                                min={50}
                                max={2000}
                                step={50}
                                value={request.delayMs}
                                disabled={isRunning || isStarting}
                                onChange={(event) =>
                                    updateRequest(
                                        'delayMs',
                                        Number(event.target.value),
                                    )
                                }
                            />

                            <div className="attack-field__range-labels">
                                <span>50 ms</span>
                                <span>2,000 ms</span>
                            </div>
                        </label>

                        <div className="attack-warning">
                            <span aria-hidden="true">!</span>

                            <p>
                                This simulator is restricted to the
                                HATCHLAB local environment. External
                                targets are not supported.
                            </p>
                        </div>

                        <div className="attack-config__actions">
                            {!session && (
                                <button
                                    className="button button--primary"
                                    type="submit"
                                    disabled={!canStart}
                                >
                                    {isStarting
                                        ? 'Starting simulation...'
                                        : 'Start simulation'}
                                </button>
                            )}

                            {isRunning && (
                                <button
                                    className="button button--danger"
                                    type="button"
                                    disabled={isStopping}
                                    onClick={() => void stop()}
                                >
                                    {isStopping
                                        ? 'Stopping...'
                                        : 'Stop simulation'}
                                </button>
                            )}

                            {session && !isRunning && (
                                <button
                                    className="button button--secondary"
                                    type="button"
                                    onClick={clearSession}
                                >
                                    New simulation
                                </button>
                            )}
                        </div>
                    </form>

                    <section
                        className="simulation-monitor"
                        aria-live="polite"
                    >
                        <div className="simulation-monitor__header">
                            <div>
                                <span className="panel-eyebrow">
                                    LIVE EXECUTION
                                </span>

                                <h2>Simulation monitor</h2>
                            </div>

                            {session ? (
                                <span
                                    className={[
                                        'simulation-status',
                                        `simulation-status--${session.status.toLowerCase()}`,
                                    ].join(' ')}
                                >
                                    {STATUS_LABELS[session.status]}
                                </span>
                            ) : (
                                <span className="simulation-status simulation-status--idle">
                                    Idle
                                </span>
                            )}
                        </div>

                        {!session ? (
                            <div className="simulation-monitor__empty">
                                <div
                                    className="simulation-monitor__radar"
                                    aria-hidden="true"
                                >
                                    <span />
                                </div>

                                <strong>
                                    Waiting for simulation
                                </strong>

                                <p>
                                    Configure the attack parameters and
                                    start a controlled simulation to view
                                    live progress.
                                </p>
                            </div>
                        ) : (
                            <div className="simulation-results">
                                <div className="simulation-results__identity">
                                    <span>SESSION ID</span>

                                    <code>
                                        {formatSessionId(session)}
                                    </code>
                                </div>

                                <div className="simulation-progress">
                                    <div className="simulation-progress__header">
                                        <span>Execution progress</span>

                                        <strong>
                                            {progressPercentage}%
                                        </strong>
                                    </div>

                                    <div
                                        className="simulation-progress__track"
                                        role="progressbar"
                                        aria-label="Simulation progress"
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
                                        {session.totalAttempts} of{' '}
                                        {session.requestedAttempts}{' '}
                                        requested attempts processed
                                    </small>
                                </div>

                                <div className="simulation-metrics">
                                    <article>
                                        <span>Total</span>
                                        <strong>
                                            {session.totalAttempts}
                                        </strong>
                                    </article>

                                    <article>
                                        <span>Failed</span>
                                        <strong>
                                            {session.failedAttempts}
                                        </strong>
                                    </article>

                                    <article>
                                        <span>Successful</span>
                                        <strong>
                                            {session.successfulAttempts}
                                        </strong>
                                    </article>

                                    <article>
                                        <span>Blocked</span>
                                        <strong>
                                            {session.blockedAttempts}
                                        </strong>
                                    </article>
                                </div>

                                <dl className="simulation-details">
                                    <div>
                                        <dt>Defense mode</dt>
                                        <dd>
                                            {session.defenseEnabled
                                                ? 'Enabled'
                                                : 'Disabled'}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>Started at</dt>
                                        <dd>
                                            {formatTimestamp(
                                                session.startedAt,
                                            )}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>Finished at</dt>
                                        <dd>
                                            {formatTimestamp(
                                                session.finishedAt,
                                            )}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>Attempt delay</dt>
                                        <dd>{session.delayMs} ms</dd>
                                    </div>
                                </dl>
                            </div>
                        )}

                        {error && (
                            <div
                                className="attack-error"
                                role="alert"
                            >
                                <strong>
                                    Simulation request failed
                                </strong>

                                <span>{error}</span>
                            </div>
                        )}
                    </section>
                </div>
            </section>
        </main>
    )
}