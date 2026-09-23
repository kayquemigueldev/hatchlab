import { useOutletContext } from 'react-router'
import type { AppOutletContext } from '../../app/layout/AppLayout'

export function DashboardPage() {
    const { labHealth } =
        useOutletContext<AppOutletContext>()

    const {
        status,
        health,
        error,
    } = labHealth

    return (
        <main className="dashboard">
            <section className="dashboard__intro">
        <span className="environment-label">
          AUTHORIZED LOCAL LAB ENVIRONMENT
        </span>

                <h1>
                    Observe attacks.
                    <br />
                    Measure defenses.
                </h1>

                <p>
                    A controlled authentication security
                    laboratory for testing attack behavior,
                    defensive controls, and security telemetry.
                </p>
            </section>

            <section
                className="overview-grid"
                aria-label="Laboratory overview"
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
                        {status === 'ONLINE'
                            ? 'CONNECTED'
                            : status}
                    </strong>

                    <small>
                        {error ??
                            `Spring Boot status: ${health?.status ?? 'pending'}`}
                    </small>
                </article>

                <article className="overview-card">
          <span className="overview-card__label">
            REALTIME
          </span>

                    <strong>STANDBY</strong>
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
        </main>
    )
}