package com.hatchlab.securityevent;

import com.hatchlab.authentication.domain.AuthenticationOutcome;
import com.hatchlab.authentication.domain.AuthenticationSource;
import com.hatchlab.defense.SecurityConfigurationService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class SecurityEventService {

    private final SecurityEventRepository securityEventRepository;
    private final SecurityConfigurationService configurationService;

    public SecurityEventService(
            SecurityEventRepository securityEventRepository,
            SecurityConfigurationService configurationService
    ) {
        this.securityEventRepository = securityEventRepository;
        this.configurationService = configurationService;
    }

    public void recordAuthentication(
            String username,
            AuthenticationSource source,
            AuthenticationOutcome outcome,
            UUID attackSessionId
    ) {
        if (!isLoggingEnabled()) {
            return;
        }

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

    public void recordRateLimitTriggered(
            String username,
            AuthenticationSource source,
            UUID attackSessionId
    ) {
        if (!isLoggingEnabled()) {
            return;
        }

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

    public void recordAccountLocked(
            String username,
            AuthenticationSource source,
            UUID attackSessionId
    ) {
        if (!isLoggingEnabled()) {
            return;
        }

        SecurityEvent event = new SecurityEvent(
                Instant.now(),
                SecurityEventType.ACCOUNT_LOCKED,
                SecurityEventSeverity.HIGH,
                source,
                username,
                "Account was temporarily locked after repeated failures.",
                attackSessionId
        );

        securityEventRepository.save(event);
    }

    public void recordSuspiciousActivity(
            String username,
            AuthenticationSource source,
            UUID attackSessionId
    ) {
        if (!isLoggingEnabled()) {
            return;
        }

        SecurityEvent event = new SecurityEvent(
                Instant.now(),
                SecurityEventType.SUSPICIOUS_ACTIVITY,
                SecurityEventSeverity.HIGH,
                source,
                username,
                "Repeated authentication failures were detected.",
                attackSessionId
        );

        securityEventRepository.save(event);
    }

    private boolean isLoggingEnabled() {
        return configurationService
                .getCurrentConfiguration()
                .isSecurityEventLoggingEnabled();
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

    public void recordClientThrottled(
            String username,
            AuthenticationSource source,
            UUID attackSessionId
    ) {
        if (!isLoggingEnabled()) {
            return;
        }

        SecurityEvent event = new SecurityEvent(
                Instant.now(),
                SecurityEventType.CLIENT_THROTTLED,
                SecurityEventSeverity.HIGH,
                source,
                username,
                "Authentication client was throttled after repeated failures.",
                attackSessionId
        );

        securityEventRepository.save(event);
    }

}