import type {
    SecurityScore,
    SimulationComparison,
    SimulationMetrics,
} from './comparison.types'
import { buildComparisonNarrative } from './comparisonInsight.mapper'

function formatDuration(durationMs: number): string {
    if (durationMs < 1000) {
        return `${durationMs} ms`
    }

    return `${(durationMs / 1000).toFixed(2)} s`
}

function formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`
}

function buildMetricsTable(
    baseline: SimulationMetrics,
    protectedScenario: SimulationMetrics,
): string {
    return [
        '| Metric | Without defenses | Defenses enabled |',
        '| --- | ---: | ---: |',
        `| Final status | ${baseline.status} | ${protectedScenario.status} |`,
        `| Attempts processed | ${baseline.totalAttempts} | ${protectedScenario.totalAttempts} |`,
        `| Failed attempts | ${baseline.failedAttempts} | ${protectedScenario.failedAttempts} |`,
        `| Successful attempts | ${baseline.successfulAttempts} | ${protectedScenario.successfulAttempts} |`,
        `| Blocked attempts | ${baseline.blockedAttempts} | ${protectedScenario.blockedAttempts} |`,
        `| Success rate | ${formatPercentage(baseline.successRatePercentage)} | ${formatPercentage(protectedScenario.successRatePercentage)} |`,
        `| Blocked rate | ${formatPercentage(baseline.blockedRatePercentage)} | ${formatPercentage(protectedScenario.blockedRatePercentage)} |`,
        `| Duration | ${formatDuration(baseline.durationMs)} | ${formatDuration(protectedScenario.durationMs)} |`,
    ].join('\n')
}

export function buildComparisonReport(
    comparison: SimulationComparison,
    securityScore: SecurityScore,
    generatedAt: Date = new Date(),
): string {
    const narrative = buildComparisonNarrative(
        comparison,
        securityScore,
    )

    const insightSections = narrative.insights
        .map(
            (insight) => [
                `### ${insight.title}`,
                '',
                `**${insight.label}: ${insight.value}**`,
                '',
                insight.explanation,
            ].join('\n'),
        )
        .join('\n\n')

    return [
        '# HATCHLAB Experiment Report',
        '',
        `Generated: ${generatedAt.toISOString()}`,
        '',
        '> Educational evidence from the authorized HATCHLAB local authentication laboratory.',
        '',
        '## Final assessment',
        '',
        `**${narrative.verdict}**`,
        '',
        narrative.summary,
        '',
        `- Security score: **${securityScore.score}/100**`,
        `- Risk level: **${securityScore.riskLevel}**`,
        `- Baseline session: \`${comparison.baseline.sessionId}\``,
        `- Protected session: \`${comparison.protectedScenario.sessionId}\``,
        '',
        '## Before and after',
        '',
        buildMetricsTable(
            comparison.baseline,
            comparison.protectedScenario,
        ),
        '',
        '## What the defenses changed',
        '',
        insightSections,
        '',
        '## Score breakdown',
        '',
        `- Attack prevention: ${securityScore.breakdown.attackPreventionPoints}/40`,
        `- Attempt reduction: ${securityScore.breakdown.attemptReductionPoints}/30`,
        `- Blocking effectiveness: ${securityScore.breakdown.blockingPoints}/20`,
        `- Defensive outcome: ${securityScore.breakdown.defensiveOutcomePoints}/10`,
        '',
        '## Recommended next experiment',
        '',
        narrative.nextStep,
        '',
        '## Safety boundary',
        '',
        'This report describes a controlled simulation that runs only against HATCHLAB on localhost. It does not authorize or describe attacks against external systems.',
        '',
    ].join('\n')
}

export function buildComparisonReportFilename(
    comparison: SimulationComparison,
): string {
    const sessionReference = comparison.protectedScenario
        .sessionId
        .slice(0, 8)
        .toLowerCase()

    return `hatchlab-experiment-${sessionReference}.md`
}

export function downloadComparisonReport(
    comparison: SimulationComparison,
    securityScore: SecurityScore,
): void {
    const report = buildComparisonReport(
        comparison,
        securityScore,
    )

    const reportBlob = new Blob([report], {
        type: 'text/markdown;charset=utf-8',
    })

    const reportUrl = URL.createObjectURL(reportBlob)
    const downloadLink = document.createElement('a')

    downloadLink.href = reportUrl
    downloadLink.download =
        buildComparisonReportFilename(comparison)

    document.body.append(downloadLink)
    downloadLink.click()
    downloadLink.remove()
    URL.revokeObjectURL(reportUrl)
}
