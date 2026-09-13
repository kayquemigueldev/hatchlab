package com.hatchlab.defense.api;

import com.hatchlab.defense.SecurityConfiguration;

import java.time.Instant;
import java.util.UUID;

public record DefenseConfigurationResponse(
        UUID id,
        boolean rateLimitingEnabled,
        boolean progressiveDelayEnabled,
        boolean accountLockoutEnabled,
        boolean clientThrottlingEnabled,
        boolean suspiciousLoginDetectionEnabled,
        boolean securityEventLoggingEnabled,
        Instant updatedAt
) {

    public static DefenseConfigurationResponse from(
            SecurityConfiguration configuration
    ) {
        return new DefenseConfigurationResponse(
                configuration.getId(),
                configuration.isRateLimitingEnabled(),
                configuration.isProgressiveDelayEnabled(),
                configuration.isAccountLockoutEnabled(),
                configuration.isClientThrottlingEnabled(),
                configuration.isSuspiciousLoginDetectionEnabled(),
                configuration.isSecurityEventLoggingEnabled(),
                configuration.getUpdatedAt()
        );
    }
}