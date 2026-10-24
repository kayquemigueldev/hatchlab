import type {
    SecurityScore,
    SimulationComparison,
} from './comparison.types'
import { buildComparisonNarrative } from './comparisonInsight.mapper'
import { downloadComparisonReport } from './comparisonReport'

interface ComparisonInsightsPanelProps {
    comparison: SimulationComparison
    securityScore: SecurityScore
}

export function ComparisonInsightsPanel({
                                            comparison,
                                            securityScore,
                                        }: ComparisonInsightsPanelProps) {
    const narrative = buildComparisonNarrative(
        comparison,
        securityScore,
    )

    return (
        <section
            className={[
                'comparison-insights',
                `comparison-insights--${narrative.tone}`,
            ].join(' ')}
            aria-label="Plain-language comparison insights"
        >
            <header className="comparison-insights__header">
                <div>
                    <span className="panel-eyebrow">
                        WHAT DID THE DEFENSES CHANGE?
                    </span>

                    <h2>{narrative.verdict}</h2>

                    <p>{narrative.summary}</p>
                </div>

                <div className="comparison-insights__risk">
                    <span>FINAL ASSESSMENT</span>
                    <strong>
                        {securityScore.riskLevel} RISK
                    </strong>
                    <small>
                        {securityScore.score} / 100
                    </small>
                </div>
            </header>

            <div className="comparison-insights__grid">
                {narrative.insights.map((insight) => (
                    <article
                        className={[
                            'comparison-insight',
                            `comparison-insight--${insight.tone}`,
                        ].join(' ')}
                        key={insight.id}
                    >
                        <span>{insight.label}</span>
                        <strong>{insight.value}</strong>
                        <h3>{insight.title}</h3>
                        <p>{insight.explanation}</p>
                    </article>
                ))}
            </div>

            <footer className="comparison-insights__next">
                <div>
                    <span>NEXT EXPERIMENT</span>
                    <p>{narrative.nextStep}</p>
                </div>

                <button
                    className="comparison-insights__download"
                    type="button"
                    onClick={() =>
                        downloadComparisonReport(
                            comparison,
                            securityScore,
                        )
                    }
                >
                    Download report
                </button>
            </footer>
        </section>
    )
}
