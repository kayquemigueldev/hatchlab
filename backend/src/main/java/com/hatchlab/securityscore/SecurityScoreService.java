package com.hatchlab.securityscore;

import com.hatchlab.attacksession.AttackSessionStatus;
import com.hatchlab.comparison.SimulationComparisonService;
import com.hatchlab.comparison.api.SimulationComparisonResponse;
import com.hatchlab.comparison.api.SimulationMetricsResponse;
import com.hatchlab.securityscore.api.SecurityScoreBreakdownResponse;
import com.hatchlab.securityscore.api.SecurityScoreResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class SecurityScoreService {

    private static final int MAX_ATTACK_PREVENTION_POINTS = 40;
    private static final int MAX_ATTEMPT_REDUCTION_POINTS = 30;
    private static final int MAX_BLOCKING_POINTS = 20;
    private static final int MAX_DEFENSIVE_OUTCOME_POINTS = 10;

    private final SimulationComparisonService comparisonService;

    public SecurityScoreService(
            SimulationComparisonService comparisonService
    ) {
        this.comparisonService = comparisonService;
    }

    @Transactional(readOnly = true)
    public SecurityScoreResponse calculate(
            UUID baselineId,
            UUID protectedId
    ) {
        SimulationComparisonResponse comparison =
                comparisonService.compare(
                        baselineId,
                        protectedId
                );

        SimulationMetricsResponse baseline =
                comparison.baseline();

        SimulationMetricsResponse protectedScenario =
                comparison.protectedScenario();

        int attackPreventionPoints =
                calculateAttackPreventionPoints(
                        baseline,
                        protectedScenario
                );

        int attemptReductionPoints =
                calculateAttemptReductionPoints(
                        comparison.defenseImpact()
                                .attemptsPrevented(),
                        baseline.totalAttempts()
                );

        int blockingPoints =
                calculateBlockingPoints(
                        protectedScenario
                                .blockedRatePercentage()
                );

        int defensiveOutcomePoints =
                calculateDefensiveOutcomePoints(
                        protectedScenario
                );

        int score = clamp(
                attackPreventionPoints
                        + attemptReductionPoints
                        + blockingPoints
                        + defensiveOutcomePoints,
                0,
                100
        );

        SecurityScoreBreakdownResponse breakdown =
                new SecurityScoreBreakdownResponse(
                        attackPreventionPoints,
                        attemptReductionPoints,
                        blockingPoints,
                        defensiveOutcomePoints
                );

        return new SecurityScoreResponse(
                baseline.sessionId(),
                protectedScenario.sessionId(),
                score,
                determineRiskLevel(score),
                breakdown
        );
    }

    private int calculateAttackPreventionPoints(
            SimulationMetricsResponse baseline,
            SimulationMetricsResponse protectedScenario
    ) {
        boolean baselineWasSuccessful =
                baseline.successfulAttempts() > 0;

        boolean protectedAttackWasPrevented =
                protectedScenario.successfulAttempts() == 0;

        if (baselineWasSuccessful
                && protectedAttackWasPrevented) {
            return MAX_ATTACK_PREVENTION_POINTS;
        }

        return 0;
    }

    private int calculateAttemptReductionPoints(
            int attemptsPrevented,
            int baselineAttempts
    ) {
        if (attemptsPrevented <= 0 || baselineAttempts <= 0) {
            return 0;
        }

        double reductionRate =
                attemptsPrevented / (double) baselineAttempts;

        int points = (int) Math.round(
                reductionRate
                        * MAX_ATTEMPT_REDUCTION_POINTS
        );

        return clamp(
                points,
                0,
                MAX_ATTEMPT_REDUCTION_POINTS
        );
    }

    private int calculateBlockingPoints(
            double blockedRatePercentage
    ) {
        int points = (int) Math.round(
                (blockedRatePercentage / 100.0)
                        * MAX_BLOCKING_POINTS
        );

        return clamp(
                points,
                0,
                MAX_BLOCKING_POINTS
        );
    }

    private int calculateDefensiveOutcomePoints(
            SimulationMetricsResponse protectedScenario
    ) {
        if (protectedScenario.status()
                == AttackSessionStatus.BLOCKED) {
            return MAX_DEFENSIVE_OUTCOME_POINTS;
        }

        return 0;
    }

    private SecurityRiskLevel determineRiskLevel(int score) {
        if (score >= 85) {
            return SecurityRiskLevel.MINIMAL;
        }

        if (score >= 70) {
            return SecurityRiskLevel.LOW;
        }

        if (score >= 50) {
            return SecurityRiskLevel.MEDIUM;
        }

        if (score >= 25) {
            return SecurityRiskLevel.HIGH;
        }

        return SecurityRiskLevel.CRITICAL;
    }

    private int clamp(
            int value,
            int minimum,
            int maximum
    ) {
        return Math.max(
                minimum,
                Math.min(value, maximum)
        );
    }
}