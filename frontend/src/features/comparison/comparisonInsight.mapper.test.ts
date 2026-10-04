import { describe, expect, it } from 'vitest'
import type {
    SecurityScore,
    SimulationComparison,
} from './comparison.types'
import { buildComparisonNarrative } from './comparisonInsight.mapper'

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

describe('comparison insight mapper', () => {
    it('explains when protection prevents compromise', () => {
        const narrative = buildComparisonNarrative(
            comparison,
            securityScore,
        )

        expect(narrative).toMatchObject({
            verdict:
                'Protection prevented account compromise',
            tone: 'positive',
        })

        expect(narrative.summary).toContain(
            '83/100',
        )

        expect(narrative.insights).toHaveLength(4)
    })

    it('explains attempt reduction and blocking', () => {
        const narrative = buildComparisonNarrative(
            comparison,
            securityScore,
        )

        expect(narrative.insights).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: 'attempt-exposure',
                    value: '71 prevented',
                    tone: 'positive',
                }),
                expect.objectContaining({
                    id: 'active-blocking',
                    value: '1 blocked',
                    tone: 'positive',
                }),
            ]),
        )
    })

    it('warns when protected credentials still succeed', () => {
        const compromisedComparison = {
            ...comparison,
            protectedScenario: {
                ...comparison.protectedScenario,
                status: 'SUCCESS' as const,
                successfulAttempts: 1,
                blockedAttempts: 0,
            },
        }

        const narrative = buildComparisonNarrative(
            compromisedComparison,
            {
                ...securityScore,
                score: 35,
                riskLevel: 'HIGH',
            },
        )

        expect(narrative).toMatchObject({
            verdict:
                'The protected account was still compromised',
            tone: 'danger',
        })
    })

    it('recognizes delay-based protection', () => {
        const delayedComparison = {
            ...comparison,
            defenseImpact: {
                ...comparison.defenseImpact,
                durationReductionMs: -5400,
            },
        }

        const narrative = buildComparisonNarrative(
            delayedComparison,
            securityScore,
        )

        expect(narrative.insights).toContainEqual(
            expect.objectContaining({
                id: 'attack-duration',
                value: '5.40 s longer',
                title: 'Protection slowed the attack down',
            }),
        )
    })
})