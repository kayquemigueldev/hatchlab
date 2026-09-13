package com.hatchlab.defense.api;

public record DefenseConfigurationRequest(
        boolean rateLimitingEnabled,
        boolean progressiveDelayEnabled,
        boolean accountLockoutEnabled,
        boolean clientThrottlingEnabled,
        boolean suspiciousLoginDetectionEnabled,
        boolean securityEventLoggingEnabled
) {
}