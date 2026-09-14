package com.hatchlab.simulation;

import com.hatchlab.defense.SecurityConfiguration;

public record DefenseConfigurationSnapshot(
        boolean rateLimitingEnabled,
        boolean progressiveDelayEnabled,
        boolean accountLockoutEnabled,
        boolean clientThrottlingEnabled,
        boolean suspiciousLoginDetectionEnabled,
        boolean securityEventLoggingEnabled
) {

    public static DefenseConfigurationSnapshot from(
            SecurityConfiguration configuration
    ) {
        return new DefenseConfigurationSnapshot(
                configuration.isRateLimitingEnabled(),
                configuration.isProgressiveDelayEnabled(),
                configuration.isAccountLockoutEnabled(),
                configuration.isClientThrottlingEnabled(),
                configuration.isSuspiciousLoginDetectionEnabled(),
                configuration.isSecurityEventLoggingEnabled()
        );
    }

    public boolean hasEnabledDefense() {
        return rateLimitingEnabled
                || progressiveDelayEnabled
                || accountLockoutEnabled
                || clientThrottlingEnabled
                || suspiciousLoginDetectionEnabled;
    }
}