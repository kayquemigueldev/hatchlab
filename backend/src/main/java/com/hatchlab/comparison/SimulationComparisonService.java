package com.hatchlab.comparison;

import com.hatchlab.attacksession.AttackSession;
import com.hatchlab.attacksession.AttackSessionStatus;
import com.hatchlab.comparison.api.SimulationComparisonResponse;
import com.hatchlab.comparison.api.SimulationDefenseImpactResponse;
import com.hatchlab.comparison.api.SimulationMetricsResponse;
import com.hatchlab.simulation.SimulationQueryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Set;
import java.util.UUID;

@Service
public class SimulationComparisonService {

    private static final Set<AttackSessionStatus> COMPARABLE_STATUSES =
            Set.of(
                    AttackSessionStatus.SUCCESS,
                    AttackSessionStatus.BLOCKED,
                    AttackSessionStatus.COMPLETED
            );

    private final SimulationQueryService simulationQueryService;

    public SimulationComparisonService(
            SimulationQueryService simulationQueryService
    ) {
        this.simulationQueryService = simulationQueryService;
    }

    @Transactional(readOnly = true)
    public SimulationComparisonResponse compare(
            UUID baselineId,
            UUID protectedId
    ) {
        if (baselineId.equals(protectedId)) {
            throw new InvalidSimulationComparisonException(
                    "Baseline and protected simulations must be different."
            );
        }

        AttackSession baseline =
                simulationQueryService.getById(baselineId);

        AttackSession protectedScenario =
                simulationQueryService.getById(protectedId);

        validateComparison(baseline, protectedScenario);

        SimulationMetricsResponse baselineMetrics =
                createMetrics(baseline);

        SimulationMetricsResponse protectedMetrics =
                createMetrics(protectedScenario);

        SimulationDefenseImpactResponse defenseImpact =
                createDefenseImpact(
                        baselineMetrics,
                        protectedMetrics
                );

        return new SimulationComparisonResponse(
                baselineMetrics,
                protectedMetrics,
                defenseImpact
        );
    }

    private void validateComparison(
            AttackSession baseline,
            AttackSession protectedScenario
    ) {
        validateCompletedSession(baseline, "Baseline");
        validateCompletedSession(
                protectedScenario,
                "Protected"
        );

        if (baseline.isDefenseEnabled()) {
            throw new InvalidSimulationComparisonException(
                    "Baseline simulation must have defenses disabled."
            );
        }

        if (!protectedScenario.isDefenseEnabled()) {
            throw new InvalidSimulationComparisonException(
                    "Protected simulation must have defenses enabled."
            );
        }

        if (baseline.getRequestedAttempts()
                != protectedScenario.getRequestedAttempts()) {
            throw new InvalidSimulationComparisonException(
                    "Simulations must have the same requested attempt count."
            );
        }

        if (baseline.getDelayMs()
                != protectedScenario.getDelayMs()) {
            throw new InvalidSimulationComparisonException(
                    "Simulations must have the same configured delay."
            );
        }
    }

    private void validateCompletedSession(
            AttackSession session,
            String scenarioName
    ) {
        if (!COMPARABLE_STATUSES.contains(session.getStatus())
                || session.getFinishedAt() == null) {
            throw new InvalidSimulationComparisonException(
                    "%s simulation must be completed before comparison."
                            .formatted(scenarioName)
            );
        }
    }

    private SimulationMetricsResponse createMetrics(
            AttackSession session
    ) {
        long durationMs = Math.max(
                0,
                Duration.between(
                        session.getStartedAt(),
                        session.getFinishedAt()
                ).toMillis()
        );

        int totalAttempts = session.getTotalAttempts();

        return new SimulationMetricsResponse(
                session.getId(),
                session.getStatus(),
                session.isDefenseEnabled(),
                session.getRequestedAttempts(),
                totalAttempts,
                session.getFailedAttempts(),
                session.getSuccessfulAttempts(),
                session.getBlockedAttempts(),
                durationMs,
                calculateAttemptsPerSecond(
                        totalAttempts,
                        durationMs
                ),
                calculatePercentage(
                        session.getFailedAttempts(),
                        totalAttempts
                ),
                calculatePercentage(
                        session.getSuccessfulAttempts(),
                        totalAttempts
                ),
                calculatePercentage(
                        session.getBlockedAttempts(),
                        totalAttempts
                )
        );
    }

    private SimulationDefenseImpactResponse createDefenseImpact(
            SimulationMetricsResponse baseline,
            SimulationMetricsResponse protectedScenario
    ) {
        return new SimulationDefenseImpactResponse(
                baseline.totalAttempts()
                        - protectedScenario.totalAttempts(),

                protectedScenario.blockedAttempts()
                        - baseline.blockedAttempts(),

                round(
                        protectedScenario.blockedRatePercentage()
                                - baseline.blockedRatePercentage()
                ),

                baseline.successfulAttempts()
                        - protectedScenario.successfulAttempts(),

                round(
                        baseline.successRatePercentage()
                                - protectedScenario.successRatePercentage()
                ),

                baseline.durationMs()
                        - protectedScenario.durationMs()
        );
    }

    private double calculateAttemptsPerSecond(
            int totalAttempts,
            long durationMs
    ) {
        if (durationMs <= 0) {
            return 0.0;
        }

        double durationSeconds = durationMs / 1_000.0;

        return round(totalAttempts / durationSeconds);
    }

    private double calculatePercentage(
            int value,
            int total
    ) {
        if (total <= 0) {
            return 0.0;
        }

        return round((value * 100.0) / total);
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}