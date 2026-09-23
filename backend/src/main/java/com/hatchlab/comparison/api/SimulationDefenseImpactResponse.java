package com.hatchlab.comparison.api;

public record SimulationDefenseImpactResponse(
        int attemptsPrevented,
        int blockedAttemptsIncrease,
        double blockedRateIncreasePercentagePoints,
        int successfulAttemptsReduction,
        double successRateReductionPercentagePoints,
        long durationReductionMs
) {
}