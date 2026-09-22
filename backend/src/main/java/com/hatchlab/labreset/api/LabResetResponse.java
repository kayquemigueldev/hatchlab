package com.hatchlab.labreset.api;

import com.hatchlab.defense.api.DefenseConfigurationResponse;

import java.time.Instant;

public record LabResetResponse(
        Instant resetAt,
        long deletedAuthenticationAttempts,
        long deletedSecurityEvents,
        long deletedAttackSessions,
        int laboratoryUsersReset,
        DefenseConfigurationResponse defenseConfiguration
) {
}