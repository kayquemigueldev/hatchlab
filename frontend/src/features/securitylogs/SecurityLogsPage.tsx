import type { FormEvent } from 'react'
import type {
    SecurityEvent,
    SecurityEventSeverity,
    SecurityEventType,
} from './securityLog.types'
import { useSecurityEvents } from './useSecurityEvents'

const EVENT_TYPES: SecurityEventType[] = [
    'LOGIN_ATTEMPT',
    'LOGIN_FAILURE',
    'LOGIN_SUCCESS',
    'RATE_LIMIT_TRIGGERED',
    'CLIENT_THROTTLED',
    'ACCOUNT_LOCKED',
    'SUSPICIOUS_ACTIVITY',
    'AUTHENTICATION_BLOCKED',
    'SIMULATION_STARTED',
    'SIMULATION_STOPPED',
    'SIMULATION_COMPLETED',
]

const SEVERITIES: SecurityEventSeverity[] = [
    'INFO',
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL',
]

function formatEnumValue(value: string): string {
    return value
        .split('_')
        .map(
            (word) =>
                word.charAt(0) +
                word.slice(1).toLowerCase(),
        )
        .join(' ')
}

function formatTimestamp(timestamp: string): {
    date: string
    time: string
} {
    const date = new Date(timestamp)

    return {
        date: new Intl.DateTimeFormat('en-GB', {
            dateStyle: 'medium',
        }).format(date),

        time: new Intl.DateTimeFormat('en-GB', {
            timeStyle: 'medium',
        }).format(date),
    }
}

function shortenIdentifier(
    identifier: string,
): string {
    return `${identifier.slice(0, 8)}…${identifier.slice(-4)}`
}

interface EventRowProps {
    event: SecurityEvent
}

function EventRow({ event }: EventRowProps) {
    const timestamp = formatTimestamp(event.timestamp)

    return (
        <tr>
            <td className="security-event__timestamp">
                <strong>{timestamp.time}</strong>
                <span>{timestamp.date}</span>
            </td>

            <td>
                <span className="security-event__type">
                    {formatEnumValue(event.eventType)}
                </span>
            </td>

            <td>
                <span
                    className={[
                        'severity-badge',
                        `severity-badge--${event.severity.toLowerCase()}`,
                    ].join(' ')}
                >
                    {event.severity}
                </span>
            </td>

            <td>
                <span className="security-event__source">
                    {event.source === 'ATTACK_SIMULATION'
                        ? 'SIMULATION'
                        : 'LOCAL LAB'}
                </span>
            </td>

            <td>
                <span className="security-event__username">
                    {event.username ?? 'SYSTEM'}
                </span>
            </td>

            <td className="security-event__description">
                {event.description}
            </td>

            <td>
                {event.attackSessionId ? (
                    <code
                        className="security-event__session"
                        title={event.attackSessionId}
                    >
                        {shortenIdentifier(
                            event.attackSessionId,
                        )}
                    </code>
                ) : (
                    <span className="security-event__empty-value">
                        —
                    </span>
                )}
            </td>
        </tr>
    )
}

export function SecurityLogsPage() {
    const {
        events,
        page,
        size,
        totalElements,
        totalPages,
        first,
        last,
        draftFilters,
        loading,
        error,
        isDirty,
        hasActiveFilters,
        updateDraftFilter,
        applyFilters,
        clearFilters,
        changePage,
        changePageSize,
        refresh,
    } = useSecurityEvents()

    function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()
        applyFilters()
    }

    const highSeverityEvents = events.filter(
        (event) =>
            event.severity === 'HIGH' ||
            event.severity === 'CRITICAL',
    ).length

    const simulationEvents = events.filter(
        (event) =>
            event.source === 'ATTACK_SIMULATION',
    ).length

    return (
        <main className="security-logs">
            <section className="security-logs__content">
                <div className="security-logs__heading">
                    <div>
                        <span className="section-eyebrow">
                            SECURITY TELEMETRY
                        </span>

                        <h1>Security Logs</h1>

                        <p>
                            Search and inspect authentication,
                            defense, and simulation events generated
                            by the local laboratory.
                        </p>
                    </div>

                    <div className="security-logs__summary">
                        <span>EVENTS FOUND</span>
                        <strong>{totalElements}</strong>
                        <small>
                            Newest events displayed first
                        </small>
                    </div>
                </div>

                <form
                    className="security-log-filters"
                    onSubmit={handleSubmit}
                >
                    <div className="security-log-filters__header">
                        <div>
                            <span className="panel-eyebrow">
                                EVENT QUERY
                            </span>

                            <h2>Filter telemetry</h2>
                        </div>

                        <button
                            className="button button--secondary"
                            type="button"
                            disabled={loading}
                            onClick={refresh}
                        >
                            {loading
                                ? 'Refreshing...'
                                : 'Refresh'}
                        </button>
                    </div>

                    <div className="security-log-filters__grid">
                        <label className="security-log-field security-log-field--search">
                            <span>Search</span>

                            <input
                                type="search"
                                value={draftFilters.search}
                                placeholder="Username or description"
                                disabled={loading}
                                onChange={(event) =>
                                    updateDraftFilter(
                                        'search',
                                        event.target.value,
                                    )
                                }
                            />
                        </label>

                        <label className="security-log-field">
                            <span>Event type</span>

                            <select
                                value={
                                    draftFilters.eventType
                                }
                                disabled={loading}
                                onChange={(event) =>
                                    updateDraftFilter(
                                        'eventType',
                                        event.target
                                            .value as
                                            | SecurityEventType
                                            | '',
                                    )
                                }
                            >
                                <option value="">
                                    All event types
                                </option>

                                {EVENT_TYPES.map(
                                    (eventType) => (
                                        <option
                                            key={eventType}
                                            value={eventType}
                                        >
                                            {formatEnumValue(
                                                eventType,
                                            )}
                                        </option>
                                    ),
                                )}
                            </select>
                        </label>

                        <label className="security-log-field">
                            <span>Severity</span>

                            <select
                                value={draftFilters.severity}
                                disabled={loading}
                                onChange={(event) =>
                                    updateDraftFilter(
                                        'severity',
                                        event.target
                                            .value as
                                            | SecurityEventSeverity
                                            | '',
                                    )
                                }
                            >
                                <option value="">
                                    All severities
                                </option>

                                {SEVERITIES.map(
                                    (severity) => (
                                        <option
                                            key={severity}
                                            value={severity}
                                        >
                                            {severity}
                                        </option>
                                    ),
                                )}
                            </select>
                        </label>

                        <div className="security-log-filters__actions">
                            <button
                                className="button button--secondary"
                                type="button"
                                disabled={
                                    loading ||
                                    (!hasActiveFilters &&
                                        !isDirty)
                                }
                                onClick={clearFilters}
                            >
                                Clear
                            </button>

                            <button
                                className="button button--primary"
                                type="submit"
                                disabled={loading || !isDirty}
                            >
                                Apply filters
                            </button>
                        </div>
                    </div>
                </form>

                <section
                    className={[
                        'security-log-panel',
                        loading
                            ? 'security-log-panel--loading'
                            : '',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    aria-busy={loading}
                >
                    <div className="security-log-panel__header">
                        <div>
                            <span className="panel-eyebrow">
                                EVENT STREAM
                            </span>

                            <h2>Recorded security events</h2>
                        </div>

                        <div className="security-log-panel__statistics">
                            <span>
                                <strong>
                                    {events.length}
                                </strong>
                                ON PAGE
                            </span>

                            <span>
                                <strong>
                                    {simulationEvents}
                                </strong>
                                SIMULATION
                            </span>

                            <span>
                                <strong>
                                    {highSeverityEvents}
                                </strong>
                                HIGH RISK
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div
                            className="security-log-error"
                            role="alert"
                        >
                            <div>
                                <strong>
                                    Unable to load telemetry
                                </strong>

                                <span>{error}</span>
                            </div>

                            <button
                                className="button button--secondary"
                                type="button"
                                onClick={refresh}
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {loading && events.length === 0 ? (
                        <div className="security-log-state">
                            <span />
                            <strong>
                                Loading security events
                            </strong>
                            <p>
                                Reading telemetry from the local
                                laboratory.
                            </p>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="security-log-state">
                            <strong>
                                No security events found
                            </strong>

                            <p>
                                Adjust the active filters or generate
                                new authentication activity.
                            </p>
                        </div>
                    ) : (
                        <div className="security-log-table-wrapper">
                            <table className="security-log-table">
                                <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Event</th>
                                    <th>Severity</th>
                                    <th>Source</th>
                                    <th>Username</th>
                                    <th>Description</th>
                                    <th>Session</th>
                                </tr>
                                </thead>

                                <tbody>
                                {events.map(
                                    (securityEvent) => (
                                        <EventRow
                                            key={
                                                securityEvent.id
                                            }
                                            event={
                                                securityEvent
                                            }
                                        />
                                    ),
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="security-log-pagination">
                        <div className="security-log-pagination__size">
                            <span>Rows per page</span>

                            <select
                                value={size}
                                disabled={loading}
                                onChange={(event) =>
                                    changePageSize(
                                        Number(
                                            event.target.value,
                                        ),
                                    )
                                }
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>
                                    100
                                </option>
                            </select>
                        </div>

                        <span className="security-log-pagination__position">
                            Page{' '}
                            <strong>
                                {totalPages === 0
                                    ? 0
                                    : page + 1}
                            </strong>{' '}
                            of{' '}
                            <strong>{totalPages}</strong>
                        </span>

                        <div className="security-log-pagination__buttons">
                            <button
                                className="button button--secondary"
                                type="button"
                                disabled={loading || first}
                                onClick={() =>
                                    changePage(page - 1)
                                }
                            >
                                Previous
                            </button>

                            <button
                                className="button button--secondary"
                                type="button"
                                disabled={loading || last}
                                onClick={() =>
                                    changePage(page + 1)
                                }
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </section>
            </section>
        </main>
    )
}