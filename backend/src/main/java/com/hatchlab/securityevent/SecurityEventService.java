package com.hatchlab.securityevent;

import com.hatchlab.authentication.domain.AuthenticationOutcome;
import com.hatchlab.authentication.domain.AuthenticationSource;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class SecurityEventService {

    private final SecurityEventRepository securityEventRepository;

    public SecurityEventService(
            SecurityEventRepository securityEventRepository
    ) {
        this.securityEventRepository = securityEventRepository;
    }

    public void recordAuthentication(
            String username,
            AuthenticationSource source,
            AuthenticationOutcome outcome,
            UUID attackSessionId
    ) {
        SecurityEvent attemptEvent = new SecurityEvent(
                Instant.now(),
                SecurityEventType.LOGIN_ATTEMPT,
                SecurityEventSeverity.INFO,
                source,
                username,
                "Authentication attempt received.",
                attackSessionId
        );

        SecurityEvent resultEvent = createResultEvent(
                username,
                source,
                outcome,
                attackSessionId
        );

        securityEventRepository.saveAll(
                List.of(attemptEvent, resultEvent)
        );
    }

    private SecurityEvent createResultEvent(
            String username,
            AuthenticationSource source,
            AuthenticationOutcome outcome,
            UUID attackSessionId
    ) {
        return switch (outcome) {
            case SUCCESS -> new SecurityEvent(
                    Instant.now(),
                    SecurityEventType.LOGIN_SUCCESS,
                    SecurityEventSeverity.INFO,
                    source,
                    username,
                    "Authentication completed successfully.",
                    attackSessionId
            );

            case FAILURE -> new SecurityEvent(
                    Instant.now(),
                    SecurityEventType.LOGIN_FAILURE,
                    SecurityEventSeverity.LOW,
                    source,
                    username,
                    "Authentication failed due to invalid credentials.",
                    attackSessionId
            );

            case BLOCKED -> new SecurityEvent(
                    Instant.now(),
                    SecurityEventType.AUTHENTICATION_BLOCKED,
                    SecurityEventSeverity.MEDIUM,
                    source,
                    username,
                    "Authentication was blocked by a security control.",
                    attackSessionId
            );
        };
    }

    public void recordRateLimitTriggered(
            String username,
            AuthenticationSource source,
            UUID attackSessionId
    ) {
        SecurityEvent event = new SecurityEvent(
                Instant.now(),
                SecurityEventType.RATE_LIMIT_TRIGGERED,
                SecurityEventSeverity.HIGH,
                source,
                username,
                "Authentication rate limit was triggered.",
                attackSessionId
        );

        securityEventRepository.save(event);
    }

}