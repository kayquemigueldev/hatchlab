package com.hatchlab.securityscore;

import com.hatchlab.attacksession.AttackSessionStatus;
import com.hatchlab.comparison.SimulationComparisonService;
import com.hatchlab.comparison.api.SimulationComparisonResponse;
import com.hatchlab.comparison.api.SimulationDefenseImpactResponse;
import com.hatchlab.comparison.api.SimulationMetricsResponse;
import com.hatchlab.securityscore.api.SecurityScoreResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.UUID;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SecurityScoreServiceTest {

    private SimulationComparisonService comparisonService;
    private SecurityScoreService service;

    @BeforeEach
    void setUp() {
        comparisonService =
                mock(SimulationComparisonService.class);

        service = new SecurityScoreService(
                comparisonService
        );
    }

    @Test
    void shouldCalculateSecurityScoreFromRealComparisonMetrics() {
        UUID baselineId = UUID.randomUUID();
        UUID protectedId = UUID.randomUUID();

        SimulationMetricsResponse baseline =
                new SimulationMetricsResponse(
                        baselineId,
                        AttackSessionStatus.SUCCESS,
                        false,
                        100,
                        75,
                        74,
                        1,
                        0,
                        21_262,
                        3.53,
                        98.67,
                        1.33,
                        0.0
                );

        SimulationMetricsResponse protectedScenario =
                new SimulationMetricsResponse(
                        protectedId,
                        AttackSessionStatus.BLOCKED,
                        true,
                        100,
                        4,
                        3,
                        0,
                        1,
                        1_062,
                        3.77,
                        75.0,
                        0.0,
                        25.0
                );

        SimulationDefenseImpactResponse defenseImpact =
                new SimulationDefenseImpactResponse(
                        71,
                        1,
                        25.0,
                        1,
                        1.33,
                        20_200
                );

        when(comparisonService.compare(
                baselineId,
                protectedId
        )).thenReturn(
                new SimulationComparisonResponse(
                        baseline,
                        protectedScenario,
                        defenseImpact
                )
        );

        SecurityScoreResponse result =
                service.calculate(
                        baselineId,
                        protectedId
                );

        assertThat(result.baselineSessionId())
                .isEqualTo(baselineId);

        assertThat(result.protectedSessionId())
                .isEqualTo(protectedId);

        assertThat(result.score()).isEqualTo(83);

        assertThat(result.riskLevel())
                .isEqualTo(SecurityRiskLevel.LOW);

        assertThat(
                result.breakdown()
                        .attackPreventionPoints()
        ).isEqualTo(40);

        assertThat(
                result.breakdown()
                        .attemptReductionPoints()
        ).isEqualTo(28);

        assertThat(
                result.breakdown()
                        .blockingPoints()
        ).isEqualTo(5);

        assertThat(
                result.breakdown()
                        .defensiveOutcomePoints()
        ).isEqualTo(10);

        verify(comparisonService).compare(
                baselineId,
                protectedId
        );
    }

    @ParameterizedTest
    @MethodSource("riskLevelScenarios")
    void shouldClassifySecurityRiskLevel(
            int baselineSuccessfulAttempts,
            int protectedSuccessfulAttempts,
            int attemptsPrevented,
            double blockedRatePercentage,
            AttackSessionStatus protectedStatus,
            int expectedScore,
            SecurityRiskLevel expectedRiskLevel
    ) {
        UUID baselineId = UUID.randomUUID();
        UUID protectedId = UUID.randomUUID();

        int baselineAttempts = 100;

        SimulationMetricsResponse baseline =
                createMetrics(
                        baselineId,
                        AttackSessionStatus.COMPLETED,
                        false,
                        baselineAttempts,
                        baselineSuccessfulAttempts,
                        0.0
                );

        SimulationMetricsResponse protectedScenario =
                createMetrics(
                        protectedId,
                        protectedStatus,
                        true,
                        baselineAttempts - attemptsPrevented,
                        protectedSuccessfulAttempts,
                        blockedRatePercentage
                );

        SimulationDefenseImpactResponse defenseImpact =
                new SimulationDefenseImpactResponse(
                        attemptsPrevented,
                        0,
                        blockedRatePercentage,
                        baselineSuccessfulAttempts
                                - protectedSuccessfulAttempts,
                        0.0,
                        0
                );

        when(comparisonService.compare(
                baselineId,
                protectedId
        )).thenReturn(
                new SimulationComparisonResponse(
                        baseline,
                        protectedScenario,
                        defenseImpact
                )
        );

        SecurityScoreResponse result =
                service.calculate(
                        baselineId,
                        protectedId
                );

        assertThat(result.score())
                .isEqualTo(expectedScore);

        assertThat(result.riskLevel())
                .isEqualTo(expectedRiskLevel);
    }

    private SimulationMetricsResponse createMetrics(
            UUID sessionId,
            AttackSessionStatus status,
            boolean defenseEnabled,
            int totalAttempts,
            int successfulAttempts,
            double blockedRatePercentage
    ) {
        return new SimulationMetricsResponse(
                sessionId,
                status,
                defenseEnabled,
                100,
                totalAttempts,
                Math.max(
                        0,
                        totalAttempts - successfulAttempts
                ),
                successfulAttempts,
                0,
                1_000,
                1.0,
                0.0,
                0.0,
                blockedRatePercentage
        );
    }

    private static Stream<Arguments> riskLevelScenarios() {
        return Stream.of(
                Arguments.of(
                        0,
                        0,
                        0,
                        0.0,
                        AttackSessionStatus.COMPLETED,
                        0,
                        SecurityRiskLevel.CRITICAL
                ),
                Arguments.of(
                        0,
                        0,
                        100,
                        0.0,
                        AttackSessionStatus.COMPLETED,
                        30,
                        SecurityRiskLevel.HIGH
                ),
                Arguments.of(
                        0,
                        0,
                        100,
                        100.0,
                        AttackSessionStatus.COMPLETED,
                        50,
                        SecurityRiskLevel.MEDIUM
                ),
                Arguments.of(
                        1,
                        0,
                        100,
                        0.0,
                        AttackSessionStatus.COMPLETED,
                        70,
                        SecurityRiskLevel.LOW
                ),
                Arguments.of(
                        1,
                        0,
                        100,
                        25.0,
                        AttackSessionStatus.BLOCKED,
                        85,
                        SecurityRiskLevel.MINIMAL
                )
        );
    }
}