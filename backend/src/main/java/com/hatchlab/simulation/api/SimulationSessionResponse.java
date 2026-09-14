package com.hatchlab.simulation.api;

import com.hatchlab.attacksession.AttackSession;
import com.hatchlab.attacksession.AttackSessionStatus;

import java.time.Instant;
import java.util.UUID;

public record SimulationSessionResponse(
        UUID id,
        AttackSessionStatus status,
        Instant startedAt,
        Instant finishedAt,
        int requestedAttempts,
        int totalAttempts,
        int failedAttempts,
        int successfulAttempts,
        int blockedAttempts,
        int delayMs,
        boolean defenseEnabled
) {

    public static SimulationSessionResponse from(
            AttackSession session
    ) {
        return new SimulationSessionResponse(
                session.getId(),
                session.getStatus(),
                session.getStartedAt(),
                session.getFinishedAt(),
                session.getRequestedAttempts(),
                session.getTotalAttempts(),
                session.getFailedAttempts(),
                session.getSuccessfulAttempts(),
                session.getBlockedAttempts(),
                session.getDelayMs(),
                session.isDefenseEnabled()
        );
    }
}