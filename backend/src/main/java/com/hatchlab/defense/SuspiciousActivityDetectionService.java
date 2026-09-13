package com.hatchlab.defense;

import com.hatchlab.authentication.domain.AuthenticationOutcome;
import com.hatchlab.authentication.domain.AuthenticationSource;
import com.hatchlab.authenticationattempt.AuthenticationAttemptRepository;
import com.hatchlab.securityevent.SecurityEventRepository;
import com.hatchlab.securityevent.SecurityEventService;
import com.hatchlab.securityevent.SecurityEventType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class SuspiciousActivityDetectionService {

    private final SecurityConfigurationService configurationService;
    private final AuthenticationAttemptRepository attemptRepository;
    private final SecurityEventRepository securityEventRepository;
    private final SecurityEventService securityEventService;
    private final int threshold;
    private final long windowSeconds;
    private final long cooldownSeconds;

    public SuspiciousActivityDetectionService(
            SecurityConfigurationService configurationService,
            AuthenticationAttemptRepository attemptRepository,
            SecurityEventRepository securityEventRepository,
            SecurityEventService securityEventService,
            @Value("${hatchlab.defense.suspicious-activity.threshold}")
            int threshold,
            @Value(
                    "${hatchlab.defense.suspicious-activity.window-seconds}"
            )
            long windowSeconds,
            @Value(
                    "${hatchlab.defense.suspicious-activity.cooldown-seconds}"
            )
            long cooldownSeconds
    ) {
        this.configurationService = configurationService;
        this.attemptRepository = attemptRepository;
        this.securityEventRepository = securityEventRepository;
        this.securityEventService = securityEventService;
        this.threshold = threshold;
        this.windowSeconds = windowSeconds;
        this.cooldownSeconds = cooldownSeconds;
    }

    @Transactional
    public void analyze(
            String username,
            AuthenticationSource source
    ) {
        SecurityConfiguration configuration =
                configurationService.getCurrentConfiguration();

        if (!configuration.isSuspiciousLoginDetectionEnabled()) {
            return;
        }

        Instant windowStart =
                Instant.now().minusSeconds(windowSeconds);

        long recentFailures = attemptRepository
                .countByUsernameIgnoreCaseAndOutcomeAndAttemptedAtGreaterThanEqual(
                        username,
                        AuthenticationOutcome.FAILURE,
                        windowStart
                );

        if (recentFailures < threshold) {
            return;
        }

        Instant cooldownStart =
                Instant.now().minusSeconds(cooldownSeconds);

        boolean recentlyDetected = securityEventRepository
                .existsByEventTypeAndUsernameIgnoreCaseAndTimestampGreaterThanEqual(
                        SecurityEventType.SUSPICIOUS_ACTIVITY,
                        username,
                        cooldownStart
                );

        if (recentlyDetected) {
            return;
        }

        securityEventService.recordSuspiciousActivity(
                username,
                source,
                null
        );
    }
}