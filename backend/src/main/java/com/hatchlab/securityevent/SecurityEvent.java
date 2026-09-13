package com.hatchlab.securityevent;

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
@Table(name = "security_events")
public class SecurityEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private Instant timestamp;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 50)
    private SecurityEventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SecurityEventSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private AuthenticationSource source;

    @Column(length = 100)
    private String username;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(name = "attack_session_id")
    private UUID attackSessionId;

    protected SecurityEvent() {
        // Required by JPA.
    }

    public SecurityEvent(
            Instant timestamp,
            SecurityEventType eventType,
            SecurityEventSeverity severity,
            AuthenticationSource source,
            String username,
            String description,
            UUID attackSessionId
    ) {
        this.timestamp = Objects.requireNonNull(timestamp);
        this.eventType = Objects.requireNonNull(eventType);
        this.severity = Objects.requireNonNull(severity);
        this.source = Objects.requireNonNull(source);
        this.username = username;
        this.description = Objects.requireNonNull(description);
        this.attackSessionId = attackSessionId;
    }

    public UUID getId() {
        return id;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public SecurityEventType getEventType() {
        return eventType;
    }

    public SecurityEventSeverity getSeverity() {
        return severity;
    }

    public AuthenticationSource getSource() {
        return source;
    }

    public String getUsername() {
        return username;
    }

    public String getDescription() {
        return description;
    }

    public UUID getAttackSessionId() {
        return attackSessionId;
    }
}