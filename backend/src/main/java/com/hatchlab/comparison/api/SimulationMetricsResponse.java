package com.hatchlab.comparison.api;

import com.hatchlab.attacksession.AttackSessionStatus;

import java.util.UUID;

public record SimulationMetricsResponse(
        UUID sessionId,
        AttackSessionStatus status,
        boolean defenseEnabled,
        int requestedAttempts,
        int totalAttempts,
        int failedAttempts,
        int successfulAttempts,
        int blockedAttempts,
        long durationMs,
        double attemptsPerSecond,
        double failureRatePercentage,
        double successRatePercentage,
        double blockedRatePercentage
) {
}