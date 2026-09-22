package com.hatchlab.defense;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "security_configurations")
public class SecurityConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "rate_limiting_enabled", nullable = false)
    private boolean rateLimitingEnabled;

    @Column(name = "progressive_delay_enabled", nullable = false)
    private boolean progressiveDelayEnabled;

    @Column(name = "account_lockout_enabled", nullable = false)
    private boolean accountLockoutEnabled;

    @Column(name = "client_throttling_enabled", nullable = false)
    private boolean clientThrottlingEnabled;

    @Column(
            name = "suspicious_login_detection_enabled",
            nullable = false
    )
    private boolean suspiciousLoginDetectionEnabled;

    @Column(name = "security_event_logging_enabled", nullable = false)
    private boolean securityEventLoggingEnabled;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected SecurityConfiguration() {
        // Required by JPA.
    }

    public SecurityConfiguration(
            boolean rateLimitingEnabled,
            boolean progressiveDelayEnabled,
            boolean accountLockoutEnabled,
            boolean clientThrottlingEnabled,
            boolean suspiciousLoginDetectionEnabled,
            boolean securityEventLoggingEnabled
    ) {
        this.rateLimitingEnabled = rateLimitingEnabled;
        this.progressiveDelayEnabled = progressiveDelayEnabled;
        this.accountLockoutEnabled = accountLockoutEnabled;
        this.clientThrottlingEnabled = clientThrottlingEnabled;
        this.suspiciousLoginDetectionEnabled =
                suspiciousLoginDetectionEnabled;
        this.securityEventLoggingEnabled =
                securityEventLoggingEnabled;
    }

    public void update(
            boolean rateLimitingEnabled,
            boolean progressiveDelayEnabled,
            boolean accountLockoutEnabled,
            boolean clientThrottlingEnabled,
            boolean suspiciousLoginDetectionEnabled,
            boolean securityEventLoggingEnabled
    ) {
        this.rateLimitingEnabled = rateLimitingEnabled;
        this.progressiveDelayEnabled = progressiveDelayEnabled;
        this.accountLockoutEnabled = accountLockoutEnabled;
        this.clientThrottlingEnabled = clientThrottlingEnabled;
        this.suspiciousLoginDetectionEnabled =
                suspiciousLoginDetectionEnabled;
        this.securityEventLoggingEnabled =
                securityEventLoggingEnabled;
        this.updatedAt = Instant.now();
    }

    @PrePersist
    @PreUpdate
    void updateTimestamp() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public boolean isRateLimitingEnabled() {
        return rateLimitingEnabled;
    }

    public boolean isProgressiveDelayEnabled() {
        return progressiveDelayEnabled;
    }

    public boolean isAccountLockoutEnabled() {
        return accountLockoutEnabled;
    }

    public boolean isClientThrottlingEnabled() {
        return clientThrottlingEnabled;
    }

    public boolean isSuspiciousLoginDetectionEnabled() {
        return suspiciousLoginDetectionEnabled;
    }

    public boolean isSecurityEventLoggingEnabled() {
        return securityEventLoggingEnabled;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}