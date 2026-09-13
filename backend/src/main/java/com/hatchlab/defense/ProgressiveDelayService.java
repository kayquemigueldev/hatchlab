package com.hatchlab.defense;

import com.hatchlab.authentication.domain.AuthenticationOutcome;
import com.hatchlab.authenticationattempt.AuthenticationAttemptRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class ProgressiveDelayService {

    private final SecurityConfigurationService configurationService;
    private final AuthenticationAttemptRepository attemptRepository;
    private final long baseDelayMs;
    private final long maxDelayMs;
    private final long windowSeconds;

    public ProgressiveDelayService(
            SecurityConfigurationService configurationService,
            AuthenticationAttemptRepository attemptRepository,
            @Value("${hatchlab.defense.progressive-delay.base-ms}")
            long baseDelayMs,
            @Value("${hatchlab.defense.progressive-delay.max-ms}")
            long maxDelayMs,
            @Value("${hatchlab.defense.progressive-delay.window-seconds}")
            long windowSeconds
    ) {
        this.configurationService = configurationService;
        this.attemptRepository = attemptRepository;
        this.baseDelayMs = baseDelayMs;
        this.maxDelayMs = maxDelayMs;
        this.windowSeconds = windowSeconds;
    }

    @Transactional(readOnly = true)
    public long applyDelay(String username) {
        SecurityConfiguration configuration =
                configurationService.getCurrentConfiguration();

        if (!configuration.isProgressiveDelayEnabled()) {
            return 0;
        }

        Instant windowStart =
                Instant.now().minusSeconds(windowSeconds);

        long recentFailures = attemptRepository
                .countByUsernameIgnoreCaseAndOutcomeAndAttemptedAtGreaterThanEqual(
                        username,
                        AuthenticationOutcome.FAILURE,
                        windowStart
                );

        long delayMs = Math.min(
                recentFailures * baseDelayMs,
                maxDelayMs
        );

        if (delayMs == 0) {
            return 0;
        }

        try {
            Thread.sleep(delayMs);
            return delayMs;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();

            throw new IllegalStateException(
                    "Progressive authentication delay was interrupted.",
                    exception
            );
        }
    }
}