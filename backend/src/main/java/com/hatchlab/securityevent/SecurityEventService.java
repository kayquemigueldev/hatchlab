package com.hatchlab.securityevent;

import com.hatchlab.attacksession.AttackSessionStatus;
import com.hatchlab.authentication.domain.AuthenticationOutcome;
import com.hatchlab.authentication.domain.AuthenticationSource;
import com.hatchlab.defense.SecurityConfigurationService;
import com.hatchlab.realtime.RealtimeEventPublisher;
import com.hatchlab.securityevent.api.SecurityEventResponse;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class SecurityEventService {

    private final SecurityEventRepository securityEventRepository;
    private final SecurityConfigurationService configurationService;
    private final RealtimeEventPublisher realtimeEventPublisher;

    public SecurityEventService(
            SecurityEventRepository securityEventRepository,
            SecurityConfigurationService configurationService,
            RealtimeEventPublisher realtimeEventPublisher
    ) {
        this.securityEventRepository = securityEventRepository;
        this.configurationService = configurationService;
        this.realtimeEventPublisher = realtimeEventPublisher;
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

        saveAllAndPublish(
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

        saveAndPublish(event);
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

        saveAndPublish(event);
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

        saveAndPublish(event);
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

        saveAndPublish(event);
    }

    public void recordSimulationStarted(
            String username,
            UUID attackSessionId
    ) {
        recordSimulationEvent(
                SecurityEventType.SIMULATION_STARTED,
                SecurityEventSeverity.INFO,
                username,
                "Controlled attack simulation started.",
                attackSessionId
        );
    }

    public void recordSimulationStopped(
            String username,
            UUID attackSessionId
    ) {
        recordSimulationEvent(
                SecurityEventType.SIMULATION_STOPPED,
                SecurityEventSeverity.INFO,
                username,
                "Controlled attack simulation was stopped.",
                attackSessionId
        );
    }

    public void recordSimulationCompleted(
            String username,
            UUID attackSessionId,
            AttackSessionStatus status
    ) {
        SecurityEventSeverity severity = switch (status) {
            case BLOCKED, FAILED ->
                    SecurityEventSeverity.HIGH;

            default ->
                    SecurityEventSeverity.INFO;
        };

        String description = switch (status) {
            case SUCCESS ->
                    "Simulation completed after successful authentication.";

            case BLOCKED ->
                    "Simulation was blocked by an enabled security control.";

            case COMPLETED ->
                    "Simulation exhausted all requested authentication attempts.";

            case FAILED ->
                    "Simulation failed due to an internal execution error.";

            case STOPPED ->
                    "Simulation finished after a manual stop request.";

            case IDLE, RUNNING ->
                    "Simulation reported a non-terminal execution state.";
        };

        recordSimulationEvent(
                SecurityEventType.SIMULATION_COMPLETED,
                severity,
                username,
                description,
                attackSessionId
        );
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

    private void recordSimulationEvent(
            SecurityEventType eventType,
            SecurityEventSeverity severity,
            String username,
            String description,
            UUID attackSessionId
    ) {
        if (!isLoggingEnabled()) {
            return;
        }

        SecurityEvent event = new SecurityEvent(
                Instant.now(),
                eventType,
                severity,
                AuthenticationSource.ATTACK_SIMULATION,
                username,
                description,
                attackSessionId
        );

        saveAndPublish(event);
    }

    private void saveAndPublish(SecurityEvent event) {
        SecurityEvent savedEvent =
                securityEventRepository.save(event);

        realtimeEventPublisher.publishSecurityEvent(
                SecurityEventResponse.from(savedEvent)
        );
    }

    private void saveAllAndPublish(
            List<SecurityEvent> events
    ) {
        List<SecurityEvent> savedEvents =
                securityEventRepository.saveAll(events);

        savedEvents.stream()
                .map(SecurityEventResponse::from)
                .forEach(
                        realtimeEventPublisher::publishSecurityEvent
                );
    }
}