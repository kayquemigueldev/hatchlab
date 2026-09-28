import {
    Link,
    useOutletContext,
} from 'react-router'
import type { AppOutletContext } from '../../app/layout/AppLayout'
import { useRealtime } from '../../shared/realtime/useRealtime'
import type { SimulationSession } from '../attacks/attack.types'
import { LabResetPanel } from '../labreset/LabResetPanel'
import type { SecurityEvent } from '../securitylogs/securityLog.types'
import { useDashboardOverview } from './useDashboardOverview'

function formatLabel(value: string): string {
    return value
        .split('_')
        .map(
            (word) =>
                word.charAt(0) +
                word.slice(1).toLowerCase(),
        )
        .join(' ')
}

function formatTimestamp(timestamp: string): string {
    return new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(timestamp))
}

function shortenIdentifier(identifier: string): string {
    return `${identifier.slice(0, 8)}…${identifier.slice(-4)}`
}

interface RecentSimulationProps {
    session: SimulationSession
}

function RecentSimulation({
                              session,
                          }: RecentSimulationProps) {
    return (
        <li className="dashboard-activity">
            <div className="dashboard-activity__primary">
                <span
                    className={[
                        'simulation-status',
                        `simulation-status--${session.status.toLowerCase()}`,
                    ].join(' ')}
                >
                    {session.status}
                </span>

                <code title={session.id}>
                    {shortenIdentifier(session.id)}
                </code>
            </div>

            <div className="dashboard-activity__details">
                <span>
                    {session.totalAttempts}
                    {' '}attempts
                </span>

                <span>
                    {session.defenseEnabled
                        ? 'Protected'
                        : 'Baseline'}
                </span>

                <time dateTime={session.startedAt}>
                    {formatTimestamp(
                        session.startedAt,
                    )}
                </time>
            </div>
        </li>
    )
}

interface RecentSecurityEventProps {
    event: SecurityEvent
}

function RecentSecurityEvent({
                                 event,
                             }: RecentSecurityEventProps) {
    return (
        <li className="dashboard-activity">
            <div className="dashboard-activity__primary">
                <span
                    className={[
                        'severity-badge',
                        `severity-badge--${event.severity.toLowerCase()}`,
                    ].join(' ')}
                >
                    {event.severity}
                </span>

                <strong>
                    {formatLabel(event.eventType)}
                </strong>
            </div>

            <p>{event.description}</p>

            <div className="dashboard-activity__details">
                <span>
                    {event.username ?? 'SYSTEM'}
                </span>

                <time dateTime={event.timestamp}>
                    {formatTimestamp(
                        event.timestamp,
                    )}
                </time>
            </div>
        </li>
    )
}

export function DashboardPage() {
    const { labHealth } =
        useOutletContext<AppOutletContext>()

    const { status: realtimeStatus } =
        useRealtime()

    const {
        status,
        health,
        error: healthError,
    } = labHealth

    const laboratoryOnline = status === 'ONLINE'

    const {
        overview,
        loading,
        refreshing,
        error,
        refresh,
    } = useDashboardOverview(laboratoryOnline)

    const metrics = [
        {
            label: 'TOTAL SESSIONS',
            value: overview?.totalSimulations,
            detail: 'Recorded simulations',
        },
        {
            label: 'RUNNING',
            value: overview?.runningSimulations,
            detail: 'Active simulations',
        },
        {
            label: 'BLOCKED',
            value: overview?.blockedSimulations,
            detail: 'Defensive outcomes',
        },
        {
            label: 'SUCCESSFUL',
            value: overview?.successfulSimulations,
            detail: 'Credentials discovered',
        },
        {
            label: 'SECURITY EVENTS',
            value: overview?.totalSecurityEvents,
            detail: 'Telemetry records',
        },
        {
            label: 'ACTIVE DEFENSES',
            value: overview
                ? `${overview.activeDefenses}/6`
                : undefined,
            detail: 'Controls enabled',
        },
    ]

    return (
        <main className="dashboard dashboard--operational">
            <section className="dashboard__heading">
                <div className="dashboard__intro">
                    <span className="environment-label">
                        AUTHORIZED LOCAL LAB ENVIRONMENT
                    </span>

                    <h1>
                        Laboratory
                        <br />
                        operations.
                    </h1>

                    <p>
                        Monitor simulations, defensive
                        controls, and security telemetry
                        from one operational view.
                    </p>
                </div>

                <div className="dashboard__actions">
                    <button
                        className="button button--secondary"
                        type="button"
                        disabled={
                            !laboratoryOnline ||
                            refreshing
                        }
                        onClick={() => {
                            void refresh()
                        }}
                    >
                        {refreshing
                            ? 'Refreshing...'
                            : 'Refresh telemetry'}
                    </button>

                    <Link
                        className="button button--primary"
                        to="/attack"
                    >
                        Start simulation
                    </Link>
                </div>
            </section>

            <section
                className="overview-grid"
                aria-label="Laboratory connectivity"
            >
                <article className="overview-card">
                    <span className="overview-card__label">
                        TARGET
                    </span>

                    <strong>LOCAL AUTH LAB</strong>
                    <small>Restricted to localhost</small>
                </article>

                <article className="overview-card">
                    <span className="overview-card__label">
                        BACKEND
                    </span>

                    <strong>
                        {laboratoryOnline
                            ? 'CONNECTED'
                            : status}
                    </strong>

                    <small>
                        {healthError ??
                            `Spring Boot status: ${health?.status ?? 'pending'}`}
                    </small>
                </article>

                <article className="overview-card">
                    <span className="overview-card__label">
                        REALTIME
                    </span>

                    <strong>
                        {realtimeStatus === 'CONNECTED'
                            ? 'LIVE'
                            : realtimeStatus}
                    </strong>

                    <small>WebSocket event channel</small>
                </article>

                <article className="overview-card">
                    <span className="overview-card__label">
                        ENVIRONMENT
                    </span>

                    <strong>LOCALHOST</strong>
                    <small>No external targets allowed</small>
                </article>
            </section>

            {error && (
                <section
                    className="dashboard-error"
                    role="alert"
                >
                    <div>
                        <strong>
                            Telemetry unavailable
                        </strong>
                        <span>{error}</span>
                    </div>

                    <button
                        className="button button--secondary"
                        type="button"
                        onClick={() => {
                            void refresh()
                        }}
                    >
                        Retry
                    </button>
                </section>
            )}

            <section
                className="dashboard-metrics"
                aria-label="Laboratory metrics"
            >
                {metrics.map((metric) => (
                    <article
                        className="dashboard-metric"
                        key={metric.label}
                    >
                        <span>{metric.label}</span>

                        <strong>
                            {loading
                                ? '…'
                                : metric.value ?? 0}
                        </strong>

                        <small>{metric.detail}</small>
                    </article>
                ))}
            </section>

            <section className="dashboard-panels">
                <article className="dashboard-panel">
                    <header className="dashboard-panel__header">
                        <div>
                            <span className="panel-eyebrow">
                                SIMULATION HISTORY
                            </span>
                            <h2>Recent sessions</h2>
                        </div>

                        <Link to="/comparison">
                            View comparison
                        </Link>
                    </header>

                    {loading ? (
                        <p className="dashboard-panel__state">
                            Loading simulations...
                        </p>
                    ) : overview?.recentSimulations.length ? (
                        <ul className="dashboard-activity-list">
                            {overview.recentSimulations.map(
                                (session) => (
                                    <RecentSimulation
                                        key={session.id}
                                        session={session}
                                    />
                                ),
                            )}
                        </ul>
                    ) : (
                        <p className="dashboard-panel__state">
                            No simulations recorded yet.
                        </p>
                    )}
                </article>

                <article className="dashboard-panel">
                    <header className="dashboard-panel__header">
                        <div>
                            <span className="panel-eyebrow">
                                SECURITY TELEMETRY
                            </span>
                            <h2>Latest events</h2>
                        </div>

                        <Link to="/logs">
                            View all logs
                        </Link>
                    </header>

                    {loading ? (
                        <p className="dashboard-panel__state">
                            Loading security events...
                        </p>
                    ) : overview?.recentSecurityEvents.length ? (
                        <ul className="dashboard-activity-list">
                            {overview.recentSecurityEvents.map(
                                (event) => (
                                    <RecentSecurityEvent
                                        key={event.id}
                                        event={event}
                                    />
                                ),
                            )}
                        </ul>
                    ) : (
                        <p className="dashboard-panel__state">
                            No security events recorded yet.
                        </p>
                    )}
                </article>
            </section>

            <LabResetPanel
                disabled={!laboratoryOnline}
                onReset={() => {
                    void refresh()
                }}
            />
        </main>
    )
}