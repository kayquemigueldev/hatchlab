package com.hatchlab.attacksession;

import com.hatchlab.authentication.domain.AuthenticationOutcome;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "attack_sessions")
public class AttackSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AttackSessionStatus status;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "finished_at")
    private Instant finishedAt;

    @Column(name = "requested_attempts", nullable = false)
    private int requestedAttempts;

    @Column(name = "total_attempts", nullable = false)
    private int totalAttempts;

    @Column(name = "failed_attempts", nullable = false)
    private int failedAttempts;

    @Column(name = "successful_attempts", nullable = false)
    private int successfulAttempts;

    @Column(name = "blocked_attempts", nullable = false)
    private int blockedAttempts;

    @Column(name = "delay_ms", nullable = false)
    private int delayMs;

    @Column(name = "defense_enabled", nullable = false)
    private boolean defenseEnabled;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(
            name = "configuration_snapshot",
            nullable = false,
            columnDefinition = "jsonb"
    )
    private String configurationSnapshot;

    protected AttackSession() {
        // Required by JPA.
    }

    public AttackSession(
            int requestedAttempts,
            int delayMs,
            boolean defenseEnabled,
            String configurationSnapshot
    ) {
        this.requestedAttempts = requestedAttempts;
        this.delayMs = delayMs;
        this.defenseEnabled = defenseEnabled;
        this.configurationSnapshot =
                Objects.requireNonNull(configurationSnapshot);
        this.status = AttackSessionStatus.RUNNING;
        this.startedAt = Instant.now();
    }

    public void recordAttempt(AuthenticationOutcome outcome) {
        ensureRunning();

        totalAttempts++;

        switch (outcome) {
            case SUCCESS -> successfulAttempts++;
            case FAILURE -> failedAttempts++;
            case BLOCKED -> blockedAttempts++;
        }
    }

    public void markSuccessful() {
        ensureRunning();
        status = AttackSessionStatus.SUCCESS;
        finishedAt = Instant.now();
    }

    public void markBlocked() {
        ensureRunning();
        status = AttackSessionStatus.BLOCKED;
        finishedAt = Instant.now();
    }

    public void markCompleted() {
        ensureRunning();
        status = AttackSessionStatus.COMPLETED;
        finishedAt = Instant.now();
    }

    public void stop() {
        ensureRunning();
        status = AttackSessionStatus.STOPPED;
        finishedAt = Instant.now();
    }

    public void markFailed() {
        if (!isRunning()) {
            return;
        }

        status = AttackSessionStatus.FAILED;
        finishedAt = Instant.now();
    }

    public boolean isRunning() {
        return status == AttackSessionStatus.RUNNING;
    }

    private void ensureRunning() {
        if (!isRunning()) {
            throw new IllegalStateException(
                    "Attack session is not running."
            );
        }
    }

    public UUID getId() {
        return id;
    }

    public AttackSessionStatus getStatus() {
        return status;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getFinishedAt() {
        return finishedAt;
    }

    public int getRequestedAttempts() {
        return requestedAttempts;
    }

    public int getTotalAttempts() {
        return totalAttempts;
    }

    public int getFailedAttempts() {
        return failedAttempts;
    }

    public int getSuccessfulAttempts() {
        return successfulAttempts;
    }

    public int getBlockedAttempts() {
        return blockedAttempts;
    }

    public int getDelayMs() {
        return delayMs;
    }

    public boolean isDefenseEnabled() {
        return defenseEnabled;
    }

    public String getConfigurationSnapshot() {
        return configurationSnapshot;
    }
}