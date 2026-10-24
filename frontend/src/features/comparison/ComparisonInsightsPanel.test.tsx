import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type {
    SecurityScore,
    SimulationComparison,
} from './comparison.types'
import { ComparisonInsightsPanel } from './ComparisonInsightsPanel'

const comparison: SimulationComparison = {
    baseline: {
        sessionId: 'baseline',
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
        sessionId: 'protected',
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
    baselineSessionId: 'baseline',
    protectedSessionId: 'protected',
    score: 83,
    riskLevel: 'LOW',
    breakdown: {
        attackPreventionPoints: 40,
        attemptReductionPoints: 28,
        blockingPoints: 5,
        defensiveOutcomePoints: 10,
    },
}

describe('ComparisonInsightsPanel', () => {
    it('presents the defensive result in plain language', () => {
        render(
            <ComparisonInsightsPanel
                comparison={comparison}
                securityScore={securityScore}
            />,
        )

        expect(
            screen.getByRole('heading', {
                name: 'Protection prevented account compromise',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByText('71 prevented'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('LOW RISK'),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: 'Download report',
            }),
        ).toBeInTheDocument()
    })

    it('warns when credentials still succeed', () => {
        render(
            <ComparisonInsightsPanel
                comparison={{
                    ...comparison,
                    protectedScenario: {
                        ...comparison.protectedScenario,
                        status: 'SUCCESS',
                        successfulAttempts: 1,
                        blockedAttempts: 0,
                    },
                }}
                securityScore={{
                    ...securityScore,
                    score: 35,
                    riskLevel: 'HIGH',
                }}
            />,
        )

        expect(
            screen.getByRole('heading', {
                name: 'The protected account was still compromised',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByText('HIGH RISK'),
        ).toBeInTheDocument()
    })
})
