package com.hatchlab.comparison;

import com.hatchlab.attacksession.AttackSession;
import com.hatchlab.attacksession.AttackSessionStatus;
import com.hatchlab.comparison.api.SimulationComparisonResponse;
import com.hatchlab.simulation.SimulationQueryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class SimulationComparisonServiceTest {

    private SimulationQueryService simulationQueryService;
    private SimulationComparisonService service;

    @BeforeEach
    void setUp() {
        simulationQueryService =
                mock(SimulationQueryService.class);

        service = new SimulationComparisonService(
                simulationQueryService
        );
    }

    @Test
    void shouldCompareBaselineAndProtectedSimulations() {
        UUID baselineId = UUID.randomUUID();
        UUID protectedId = UUID.randomUUID();

        AttackSession baseline = createSession(
                baselineId,
                AttackSessionStatus.COMPLETED,
                false,
                100,
                100,
                99,
                1,
                0,
                100,
                10
        );

        AttackSession protectedScenario = createSession(
                protectedId,
                AttackSessionStatus.BLOCKED,
                true,
                100,
                5,
                4,
                0,
                1,
                100,
                2
        );

        when(simulationQueryService.getById(baselineId))
                .thenReturn(baseline);

        when(simulationQueryService.getById(protectedId))
                .thenReturn(protectedScenario);

        SimulationComparisonResponse result =
                service.compare(baselineId, protectedId);

        assertThat(result.baseline().sessionId())
                .isEqualTo(baselineId);

        assertThat(result.baseline().attemptsPerSecond())
                .isEqualTo(10.0);

        assertThat(result.baseline().failureRatePercentage())
                .isEqualTo(99.0);

        assertThat(result.baseline().successRatePercentage())
                .isEqualTo(1.0);

        assertThat(result.baseline().blockedRatePercentage())
                .isZero();

        assertThat(result.protectedScenario().sessionId())
                .isEqualTo(protectedId);

        assertThat(result.protectedScenario().attemptsPerSecond())
                .isEqualTo(2.5);

        assertThat(
                result.protectedScenario()
                        .failureRatePercentage()
        ).isEqualTo(80.0);

        assertThat(
                result.protectedScenario()
                        .successRatePercentage()
        ).isZero();

        assertThat(
                result.protectedScenario()
                        .blockedRatePercentage()
        ).isEqualTo(20.0);

        assertThat(
                result.defenseImpact()
                        .blockedAttemptsIncrease()
        ).isEqualTo(1);

        assertThat(
                result.defenseImpact()
                        .blockedRateIncreasePercentagePoints()
        ).isEqualTo(20.0);

        assertThat(
                result.defenseImpact()
                        .successfulAttemptsReduction()
        ).isEqualTo(1);

        assertThat(
                result.defenseImpact()
                        .successRateReductionPercentagePoints()
        ).isEqualTo(1.0);

        assertThat(
                result.defenseImpact()
                        .durationReductionMs()
        ).isEqualTo(8_000);

        assertThat(
                result.defenseImpact()
                        .attemptsPrevented()
        ).isEqualTo(95);
    }

    @Test
    void shouldRejectComparisonWithSameSimulation() {
        UUID sessionId = UUID.randomUUID();

        assertThatThrownBy(() ->
                service.compare(sessionId, sessionId)
        )
                .isInstanceOf(
                        InvalidSimulationComparisonException.class
                )
                .hasMessage(
                        "Baseline and protected simulations must be different."
                );

        verifyNoInteractions(simulationQueryService);
    }

    @Test
    void shouldRejectRunningSimulation() {
        UUID baselineId = UUID.randomUUID();
        UUID protectedId = UUID.randomUUID();

        AttackSession baseline = createSession(
                baselineId,
                AttackSessionStatus.RUNNING,
                false,
                100,
                10,
                10,
                0,
                0,
                100,
                2
        );

        when(baseline.getFinishedAt()).thenReturn(null);

        AttackSession protectedScenario = createSession(
                protectedId,
                AttackSessionStatus.BLOCKED,
                true,
                100,
                5,
                4,
                0,
                1,
                100,
                2
        );

        when(simulationQueryService.getById(baselineId))
                .thenReturn(baseline);

        when(simulationQueryService.getById(protectedId))
                .thenReturn(protectedScenario);

        assertThatThrownBy(() ->
                service.compare(baselineId, protectedId)
        )
                .isInstanceOf(
                        InvalidSimulationComparisonException.class
                )
                .hasMessage(
                        "Baseline simulation must be completed before comparison."
                );
    }

    @Test
    void shouldRejectBaselineWithDefensesEnabled() {
        UUID baselineId = UUID.randomUUID();
        UUID protectedId = UUID.randomUUID();

        AttackSession baseline = createSession(
                baselineId,
                AttackSessionStatus.COMPLETED,
                true,
                100,
                100,
                99,
                1,
                0,
                100,
                10
        );

        AttackSession protectedScenario = createSession(
                protectedId,
                AttackSessionStatus.BLOCKED,
                true,
                100,
                5,
                4,
                0,
                1,
                100,
                2
        );

        prepareSessions(
                baselineId,
                baseline,
                protectedId,
                protectedScenario
        );

        assertThatThrownBy(() ->
                service.compare(baselineId, protectedId)
        )
                .isInstanceOf(
                        InvalidSimulationComparisonException.class
                )
                .hasMessage(
                        "Baseline simulation must have defenses disabled."
                );
    }

    @Test
    void shouldRejectProtectedSimulationWithoutDefenses() {
        UUID baselineId = UUID.randomUUID();
        UUID protectedId = UUID.randomUUID();

        AttackSession baseline = createSession(
                baselineId,
                AttackSessionStatus.COMPLETED,
                false,
                100,
                100,
                100,
                0,
                0,
                100,
                10
        );

        AttackSession protectedScenario = createSession(
                protectedId,
                AttackSessionStatus.COMPLETED,
                false,
                100,
                100,
                100,
                0,
                0,
                100,
                10
        );

        prepareSessions(
                baselineId,
                baseline,
                protectedId,
                protectedScenario
        );

        assertThatThrownBy(() ->
                service.compare(baselineId, protectedId)
        )
                .isInstanceOf(
                        InvalidSimulationComparisonException.class
                )
                .hasMessage(
                        "Protected simulation must have defenses enabled."
                );
    }

    @Test
    void shouldRejectDifferentAttemptCounts() {
        UUID baselineId = UUID.randomUUID();
        UUID protectedId = UUID.randomUUID();

        AttackSession baseline = createSession(
                baselineId,
                AttackSessionStatus.COMPLETED,
                false,
                100,
                100,
                100,
                0,
                0,
                100,
                10
        );

        AttackSession protectedScenario = createSession(
                protectedId,
                AttackSessionStatus.COMPLETED,
                true,
                500,
                500,
                500,
                0,
                0,
                100,
                20
        );

        prepareSessions(
                baselineId,
                baseline,
                protectedId,
                protectedScenario
        );

        assertThatThrownBy(() ->
                service.compare(baselineId, protectedId)
        )
                .isInstanceOf(
                        InvalidSimulationComparisonException.class
                )
                .hasMessage(
                        "Simulations must have the same requested attempt count."
                );
    }

    @Test
    void shouldRejectDifferentConfiguredDelays() {
        UUID baselineId = UUID.randomUUID();
        UUID protectedId = UUID.randomUUID();

        AttackSession baseline = createSession(
                baselineId,
                AttackSessionStatus.COMPLETED,
                false,
                100,
                100,
                100,
                0,
                0,
                50,
                10
        );

        AttackSession protectedScenario = createSession(
                protectedId,
                AttackSessionStatus.COMPLETED,
                true,
                100,
                100,
                100,
                0,
                0,
                500,
                20
        );

        prepareSessions(
                baselineId,
                baseline,
                protectedId,
                protectedScenario
        );

        assertThatThrownBy(() ->
                service.compare(baselineId, protectedId)
        )
                .isInstanceOf(
                        InvalidSimulationComparisonException.class
                )
                .hasMessage(
                        "Simulations must have the same configured delay."
                );

    }

    private void prepareSessions(
            UUID baselineId,
            AttackSession baseline,
            UUID protectedId,
            AttackSession protectedScenario
    ) {
        when(simulationQueryService.getById(baselineId))
                .thenReturn(baseline);

        when(simulationQueryService.getById(protectedId))
                .thenReturn(protectedScenario);
    }

    private AttackSession createSession(
            UUID id,
            AttackSessionStatus status,
            boolean defenseEnabled,
            int requestedAttempts,
            int totalAttempts,
            int failedAttempts,
            int successfulAttempts,
            int blockedAttempts,
            int delayMs,
            long durationSeconds
    ) {
        AttackSession session = mock(AttackSession.class);

        Instant startedAt =
                Instant.parse("2026-09-22T20:00:00Z");

        when(session.getId()).thenReturn(id);
        when(session.getStatus()).thenReturn(status);
        when(session.isDefenseEnabled())
                .thenReturn(defenseEnabled);

        when(session.getRequestedAttempts())
                .thenReturn(requestedAttempts);

        when(session.getTotalAttempts())
                .thenReturn(totalAttempts);

        when(session.getFailedAttempts())
                .thenReturn(failedAttempts);

        when(session.getSuccessfulAttempts())
                .thenReturn(successfulAttempts);

        when(session.getBlockedAttempts())
                .thenReturn(blockedAttempts);

        when(session.getDelayMs()).thenReturn(delayMs);
        when(session.getStartedAt()).thenReturn(startedAt);

        when(session.getFinishedAt())
                .thenReturn(
                        startedAt.plusSeconds(durationSeconds)
                );

        return session;
    }
}