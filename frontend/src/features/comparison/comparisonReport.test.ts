import { describe, expect, it } from 'vitest'
import type {
    SecurityScore,
    SimulationComparison,
} from './comparison.types'
import {
    buildComparisonReport,
    buildComparisonReportFilename,
} from './comparisonReport'

const comparison: SimulationComparison = {
    baseline: {
        sessionId: 'baseline-session',
        status: 'SUCCESS',
        defenseEnabled: false,
        requestedAttempts: 100,
        totalAttempts: 75,
        failedAttempts: 74,
        successfulAttempts: 1,
        blockedAttempts: 0,
        durationMs: 21260,
        attemptsPerSecond: 3.53,
        failureRatePercentage: 98.67,
        successRatePercentage: 1.33,
        blockedRatePercentage: 0,
    },
    protectedScenario: {
        sessionId: 'protected-session',
        status: 'BLOCKED',
        defenseEnabled: true,
        requestedAttempts: 100,
        totalAttempts: 4,
        failedAttempts: 3,
        successfulAttempts: 0,
        blockedAttempts: 1,
        durationMs: 1060,
        attemptsPerSecond: 3.77,
        failureRatePercentage: 75,
        successRatePercentage: 0,
        blockedRatePercentage: 25,
    },
    defenseImpact: {
        attemptsPrevented: 71,
        blockedAttemptsIncrease: 1,
        blockedRateIncreasePercentagePoints: 25,
        successfulAttemptsReduction: 1,
        successRateReductionPercentagePoints: 1.33,
        durationReductionMs: 20200,
    },
}

const securityScore: SecurityScore = {
    baselineSessionId: 'baseline-session',
    protectedSessionId: 'protected-session',
    score: 83,
    riskLevel: 'LOW',
    breakdown: {
        attackPreventionPoints: 40,
        attemptReductionPoints: 28,
        blockingPoints: 5,
        defensiveOutcomePoints: 10,
    },
}

describe('comparisonReport', () => {
    it('builds a readable report from the comparison evidence', () => {
        const report = buildComparisonReport(
            comparison,
            securityScore,
            new Date('2026-10-24T12:00:00.000Z'),
        )

        expect(report).toContain(
            '# HATCHLAB Experiment Report',
        )
        expect(report).toContain(
            'Protection prevented account compromise',
        )
        expect(report).toContain(
            '| Attempts processed | 75 | 4 |',
        )
        expect(report).toContain(
            '- Attack prevention: 40/40',
        )
        expect(report).toContain(
            'runs only against HATCHLAB on localhost',
        )
    })

    it('includes traceable session identifiers and timestamp', () => {
        const report = buildComparisonReport(
            comparison,
            securityScore,
            new Date('2026-10-24T12:00:00.000Z'),
        )

        expect(report).toContain(
            'Generated: 2026-10-24T12:00:00.000Z',
        )
        expect(report).toContain(
            '- Baseline session: `baseline-session`',
        )
        expect(report).toContain(
            '- Protected session: `protected-session`',
        )
    })

    it('creates a concise filename from the protected session', () => {
        expect(
            buildComparisonReportFilename(comparison),
        ).toBe('hatchlab-experiment-protecte.md')
    })
})
