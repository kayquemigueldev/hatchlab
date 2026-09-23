package com.hatchlab.comparison.api;

public record SimulationComparisonResponse(
        SimulationMetricsResponse baseline,
        SimulationMetricsResponse protectedScenario,
        SimulationDefenseImpactResponse defenseImpact
) {
}