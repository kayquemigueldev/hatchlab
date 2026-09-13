package com.hatchlab.securityevent.api;

import com.hatchlab.authentication.domain.AuthenticationSource;
import com.hatchlab.securityevent.SecurityEvent;
import com.hatchlab.securityevent.SecurityEventSeverity;
import com.hatchlab.securityevent.SecurityEventType;

import java.time.Instant;
import java.util.UUID;

public record SecurityEventResponse(
        UUID id,
        Instant timestamp,
        SecurityEventType eventType,
        SecurityEventSeverity severity,
        AuthenticationSource source,
        String username,
        String description,
        UUID attackSessionId
) {

    public static SecurityEventResponse from(SecurityEvent event) {
        return new SecurityEventResponse(
                event.getId(),
                event.getTimestamp(),
                event.getEventType(),
                event.getSeverity(),
                event.getSource(),
                event.getUsername(),
                event.getDescription(),
                event.getAttackSessionId()
        );
    }
}