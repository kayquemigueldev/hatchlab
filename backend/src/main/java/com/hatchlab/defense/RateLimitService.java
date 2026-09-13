package com.hatchlab.defense;

import com.hatchlab.authentication.domain.AuthenticationOutcome;
import com.hatchlab.authenticationattempt.AuthenticationAttemptRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class RateLimitService {

    private final SecurityConfigurationService configurationService;
    private final AuthenticationAttemptRepository attemptRepository;
    private final int maxAttempts;
    private final long windowSeconds;

    public RateLimitService(
            SecurityConfigurationService configurationService,
            AuthenticationAttemptRepository attemptRepository,
            @Value("${hatchlab.defense.rate-limit.max-attempts}")
            int maxAttempts,
            @Value("${hatchlab.defense.rate-limit.window-seconds}")
            long windowSeconds
    ) {
        this.configurationService = configurationService;
        this.attemptRepository = attemptRepository;
        this.maxAttempts = maxAttempts;
        this.windowSeconds = windowSeconds;
    }

    @Transactional(readOnly = true)
    public boolean isBlocked(String username) {
        SecurityConfiguration configuration =
                configurationService.getCurrentConfiguration();

        if (!configuration.isRateLimitingEnabled()) {
            return false;
        }

        Instant windowStart =
                Instant.now().minusSeconds(windowSeconds);

        long recentFailures = attemptRepository
                .countByUsernameIgnoreCaseAndOutcomeAndAttemptedAtGreaterThanEqual(
                        username,
                        AuthenticationOutcome.FAILURE,
                        windowStart
                );

        return recentFailures >= maxAttempts;
    }
}