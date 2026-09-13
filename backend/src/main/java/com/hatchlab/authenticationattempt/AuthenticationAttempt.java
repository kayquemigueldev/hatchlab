package com.hatchlab.authenticationattempt;

import com.hatchlab.authentication.domain.AuthenticationOutcome;
import com.hatchlab.authentication.domain.AuthenticationSource;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "authentication_attempts")
public class AuthenticationAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "attack_session_id")
    private UUID attackSessionId;

    @Column(name = "client_identifier", nullable = false, length = 100)
    private String clientIdentifier;

    @Column(nullable = false, length = 100)
    private String username;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private AuthenticationSource source;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AuthenticationOutcome outcome;

    @Column(name = "attempted_at", nullable = false)
    private Instant attemptedAt;

    @Column(name = "response_time_ms", nullable = false)
    private long responseTimeMs;

    protected AuthenticationAttempt() {
        // Required by JPA.
    }

    public AuthenticationAttempt(
            UUID attackSessionId,
            String clientIdentifier,
            String username,
            AuthenticationSource source,
            AuthenticationOutcome outcome,
            Instant attemptedAt,
            long responseTimeMs
    ) {
        this.attackSessionId = attackSessionId;
        this.clientIdentifier = Objects.requireNonNull(clientIdentifier);
        this.username = Objects.requireNonNull(username);
        this.source = Objects.requireNonNull(source);
        this.outcome = Objects.requireNonNull(outcome);
        this.attemptedAt = Objects.requireNonNull(attemptedAt);
        this.responseTimeMs = responseTimeMs;
    }

    public UUID getId() {
        return id;
    }

    public UUID getAttackSessionId() {
        return attackSessionId;
    }

    public String getClientIdentifier() {
        return clientIdentifier;
    }

    public String getUsername() {
        return username;
    }

    public AuthenticationSource getSource() {
        return source;
    }

    public AuthenticationOutcome getOutcome() {
        return outcome;
    }

    public Instant getAttemptedAt() {
        return attemptedAt;
    }

    public long getResponseTimeMs() {
        return responseTimeMs;
    }
}