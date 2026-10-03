import type { SecurityEvent } from './securityLog.types'
import { buildSecurityStory } from './securityStory.mapper'

interface SecurityStoryPanelProps {
    events: SecurityEvent[]
}

function formatStoryTime(timestamp: string): string {
    const date = new Date(timestamp)

    if (Number.isNaN(date.getTime())) {
        return timestamp
    }

    return new Intl.DateTimeFormat('en-GB', {
        timeStyle: 'medium',
    }).format(date)
}

export function SecurityStoryPanel({
                                       events,
                                   }: SecurityStoryPanelProps) {
    const story = buildSecurityStory(events)

    return (
        <section
            className="security-story"
            aria-label="Plain-language security story"
        >
            <header className="security-story__summary">
                <div>
                    <span className="panel-eyebrow">
                        WHAT HAPPENED?
                    </span>

                    <h3>{story.headline}</h3>

                    <p>{story.explanation}</p>
                </div>

                <div className="security-story__severity">
                    <span>HIGHEST SEVERITY</span>
                    <strong>
                        {story.highestSeverity ?? 'NONE'}
                    </strong>
                </div>
            </header>

            <div className="security-story__metrics">
                <article>
                    <span>EVENTS</span>
                    <strong>{story.totalEvents}</strong>
                    <small>records on this page</small>
                </article>

                <article>
                    <span>REJECTED</span>
                    <strong>{story.failedAttempts}</strong>
                    <small>incorrect credentials</small>
                </article>

                <article>
                    <span>DEFENSE ACTIONS</span>
                    <strong>{story.defenseActions}</strong>
                    <small>detections or blocks</small>
                </article>

                <article>
                    <span>SUCCESSFUL</span>
                    <strong>{story.successfulAttempts}</strong>
                    <small>accepted credentials</small>
                </article>
            </div>

            <div className="security-story__timeline">
                <div className="security-story__timeline-heading">
                    <span className="panel-eyebrow">
                        EVENT TIMELINE
                    </span>

                    <p>
                        Read from the beginning of the activity to
                        its latest recorded outcome.
                    </p>
                </div>

                {story.timeline.length === 0 ? (
                    <div className="security-story__empty">
                        No explainable activity appears on this
                        page.
                    </div>
                ) : (
                    <ol>
                        {story.timeline.map((item, index) => (
                            <li
                                className={`security-story__event security-story__event--${item.tone}`}
                                key={item.id}
                            >
                                <div className="security-story__marker">
                                    <span>
                                        {String(index + 1).padStart(
                                            2,
                                            '0',
                                        )}
                                    </span>
                                </div>

                                <div className="security-story__event-content">
                                    <div>
                                        <strong>
                                            {item.title}
                                        </strong>

                                        <time
                                            dateTime={
                                                item.timestamp
                                            }
                                        >
                                            {formatStoryTime(
                                                item.timestamp,
                                            )}
                                        </time>
                                    </div>

                                    <p>{item.explanation}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                )}
            </div>

            <footer className="security-story__note">
                This explanation summarizes the events visible on
                the current page. Switch to Technical to inspect
                every original record.
            </footer>
        </section>
    )
}